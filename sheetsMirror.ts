import { google, sheets_v4 } from 'googleapis';
import {
  AnnouncementCategory,
  AnnouncementRecord,
  ApplicationStatus,
  DepartmentId,
  SiteSettings,
  VolunteerCertificate,
  VolunteerPastProject,
  VolunteerRecord,
} from './store';

const SHEET_NAME = 'volunteers';
const ANNOUNCEMENTS_SHEET_NAME = 'announcements';
const SETTINGS_SHEET_NAME = 'settings';
const CACHE_TTL_MS = 7_000; // 7 seconds read cache
const MAX_THUMB_SHEET_CHARS = 45_000;
const MAX_CELL_CHARS = 45_000;

const ANNOUNCEMENT_HEADERS = [
  'id',
  'badge',
  'badgeType',
  'date',
  'title',
  'summary',
  'content',
  'location',
  'imageUrl',
  'videoUrl',
  'actionText',
] as const;

const ALLOWED_ANN_TYPES = new Set<AnnouncementCategory>(['urgent', 'event', 'project', 'news']);

export const VOLUNTEER_SHEET_HEADERS = [
  'id',
  'status',
  'submittedAt',
  'consentAt',
  'fullName',
  'address',
  'age',
  'department',
  'skills',
  'motivation',
  'availability',
  'portfolioOrSocial',
  'otherOrganizations',
  'notes',
  'certificates',
  'pastProjects',
  'selfieThumb',
  'phone',
] as const;

const VALID_STATUSES = new Set<ApplicationStatus>([
  'new',
  'interview_scheduled',
  'accepted',
  'waitlist',
  'archived',
]);

const VALID_DEPARTMENTS = new Set<DepartmentId>([
  'media_smm',
  'event_mgmt',
  'art_culture',
  'projects_grants',
  'pr_outreach',
]);

export type SheetsDisabledReason =
  | 'missing_env'
  | 'invalid_base64'
  | 'invalid_json'
  | 'missing_fields'
  | 'auth_init_failed'
  | null;

export interface SheetsStatusInfo {
  enabled: boolean;
  reason: SheetsDisabledReason;
  missingVars: string[];
  clientEmail: string | null;
  detail: string | null;
}

export interface SheetsErrorDiagnosis {
  code: 'sheets_forbidden' | 'sheets_not_found' | 'sheets_api_error';
  googleStatus: number | string;
  clientEmail: string | null;
  googleMessage: string;
}

interface CachedRows {
  rows: string[][];
  expiresAt: number;
}

let sheetsClient: sheets_v4.Sheets | null = null;
let targetSheetId: string | null = null;
let serviceAccountEmail: string | null = null;
let privateKeyValue: string | null = null;
let volunteersTabId: number | null = null;
let enabled = false;
let disabledReason: SheetsDisabledReason = 'missing_env';
let disabledDetail: string | null = null;
let missingEnvVars: string[] = [];
let rowCache: CachedRows | null = null;
let opQueue: Promise<void> = Promise.resolve();

function redactSensitive(text: string): string {
  let result = text;
  if (targetSheetId) {
    result = result.split(targetSheetId).join('[sheet-id]');
  }
  if (privateKeyValue) {
    result = result.split(privateKeyValue).join('[private-key]');
  }
  const envB64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64?.trim();
  if (envB64 && envB64.length > 8) {
    result = result.split(envB64).join('[service-account-b64]');
  }
  const envSheetId = process.env.GOOGLE_SHEET_ID?.trim();
  if (envSheetId && envSheetId.length > 4) {
    result = result.split(envSheetId).join('[sheet-id]');
  }
  return result;
}

function extractRawGoogleError(err: unknown): { status?: number | string; message: string } {
  const anyErr = err as {
    status?: number;
    code?: number | string;
    message?: string;
    response?: {
      status?: number;
      data?: {
        error?:
          | string
          | {
              code?: number;
              message?: string;
              status?: string;
            };
        error_description?: string;
      };
    };
  };

  const respErr = anyErr?.response?.data?.error;
  const status =
    anyErr?.response?.status ??
    anyErr?.status ??
    (typeof respErr === 'object' ? respErr?.code : undefined) ??
    anyErr?.code;

  const rawMsg =
    (typeof respErr === 'object' && respErr?.message) ||
    anyErr?.response?.data?.error_description ||
    (typeof respErr === 'string' ? respErr : '') ||
    (typeof anyErr?.message === 'string' ? anyErr.message : '') ||
    'Unknown Google Sheets error';

  const sanitized = redactSensitive(String(rawMsg)).replace(/\s+/g, ' ').trim().slice(0, 240);
  return { status, message: sanitized };
}

function sanitizeErrorMessage(err: unknown): string {
  const { status, message } = extractRawGoogleError(err);
  return `${status ? `[${status}] ` : ''}${message}`;
}

function isMissingSheetTabError(err: unknown): boolean {
  const { status, message } = extractRawGoogleError(err);
  const lower = message.toLowerCase();
  if (
    lower.includes('unable to parse range') ||
    lower.includes(`sheet '${SHEET_NAME}'`) ||
    lower.includes(`sheet "${SHEET_NAME}"`) ||
    lower.includes('no sheet with id') ||
    lower.includes('invalid grid')
  ) {
    return true;
  }
  return Number(status) === 400 && lower.includes(SHEET_NAME.toLowerCase());
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(label: string, fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  const delays = [800, 2000, 4500];
  let lastErr: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const { status } = extractRawGoogleError(err);
      // Do not waste retries on deterministic permission/not-found errors
      if (Number(status) === 403 || Number(status) === 404 || attempt === maxRetries) {
        break;
      }
      const delay = delays[Math.min(attempt, delays.length - 1)];
      console.warn(
        `[sheetsMirror] ${label} attempt ${attempt + 1} failed (${sanitizeErrorMessage(
          err
        )}), retrying in ${delay}ms...`
      );
      await sleep(delay);
    }
  }
  throw lastErr;
}

function invalidateCache(): void {
  rowCache = null;
}

function serializeVolunteerRow(v: VolunteerRecord): string[] {
  const thumb =
    typeof v.selfieThumb === 'string' &&
    v.selfieThumb.startsWith('data:image/') &&
    v.selfieThumb.length <= MAX_THUMB_SHEET_CHARS
      ? v.selfieThumb
      : typeof v.selfiePhotoUrl === 'string' &&
        v.selfiePhotoUrl.startsWith('data:image/') &&
        v.selfiePhotoUrl.length <= MAX_THUMB_SHEET_CHARS
      ? v.selfiePhotoUrl
      : '';

  return [
    v.id,
    v.status,
    v.submittedAt,
    v.consentAt || v.submittedAt,
    v.fullName,
    v.address,
    String(v.age || ''),
    v.department,
    JSON.stringify(v.skills || []),
    v.motivation || '',
    v.availability || '',
    v.portfolioOrSocial || '',
    v.otherOrganizations ? JSON.stringify(v.otherOrganizations) : '',
    v.notes || '',
    JSON.stringify(v.certificates || []),
    JSON.stringify(v.pastProjects || []),
    thumb,
    v.phone || '',
  ];
}

function safeJsonParse<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string' || !raw.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function deserializeVolunteerRow(row: unknown[]): VolunteerRecord | null {
  const id = String(row[0] ?? '').trim();
  if (!id || id === 'id') return null;

  const rawStatus = String(row[1] ?? 'new').trim() as ApplicationStatus;
  const status: ApplicationStatus = VALID_STATUSES.has(rawStatus) ? rawStatus : 'new';

  const submittedAt = String(row[2] ?? '').trim() || new Date().toISOString();
  const consentAt = String(row[3] ?? '').trim() || submittedAt;
  const fullName = String(row[4] ?? '').trim();
  if (!fullName) return null;

  const address = String(row[5] ?? '').trim();
  const age = String(row[6] ?? '17+').trim() || '17+';

  const rawDept = String(row[7] ?? 'media_smm').trim() as DepartmentId;
  const department: DepartmentId = VALID_DEPARTMENTS.has(rawDept) ? rawDept : 'media_smm';

  const parsedSkills = safeJsonParse<unknown>(row[8], []);
  const skills = Array.isArray(parsedSkills)
    ? parsedSkills.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    : ['Чыгармачыл демилге'];

  const motivation = String(row[9] ?? '');
  const availability = String(row[10] ?? '');
  const portfolioOrSocial = String(row[11] ?? '').trim() || undefined;

  const parsedOtherOrg = safeJsonParse<{ isMember?: boolean; details?: string } | null>(
    row[12],
    null
  );
  const otherOrganizations =
    parsedOtherOrg && typeof parsedOtherOrg === 'object'
      ? {
          isMember: Boolean(parsedOtherOrg.isMember),
          details:
            typeof parsedOtherOrg.details === 'string' ? parsedOtherOrg.details : undefined,
        }
      : undefined;

  const notes = String(row[13] ?? '').trim() || undefined;

  const parsedCerts = safeJsonParse<unknown>(row[14], []);
  const certificates: VolunteerCertificate[] = Array.isArray(parsedCerts)
    ? (parsedCerts as VolunteerCertificate[])
    : [];

  const parsedProjects = safeJsonParse<unknown>(row[15], []);
  const pastProjects: VolunteerPastProject[] = Array.isArray(parsedProjects)
    ? (parsedProjects as VolunteerPastProject[])
    : [];

  const rawThumb = String(row[16] ?? '').trim();
  const selfieThumb = rawThumb.startsWith('data:image/') ? rawThumb : '';
  const phone = String(row[17] ?? '').trim() || undefined;

  return {
    id,
    status,
    submittedAt,
    consentAt,
    confirmationSentAt: submittedAt,
    consent: true,
    fullName,
    address,
    cityOrUniversity: address,
    age,
    department,
    skills: skills.length > 0 ? skills : ['Чыгармачыл демилге'],
    motivation,
    availability,
    portfolioOrSocial,
    phone,
    otherOrganizations,
    notes,
    certificates,
    pastProjects,
    selfieThumb: selfieThumb || undefined,
    selfiePhotoUrl: selfieThumb,
    photo3x4Url: selfieThumb || undefined,
  };
}

async function getVolunteersTabId(forceRefresh = false): Promise<number | null> {
  if (!forceRefresh && volunteersTabId !== null) return volunteersTabId;
  if (!sheetsClient || !targetSheetId) return null;

  const meta = await sheetsClient.spreadsheets.get({
    spreadsheetId: targetSheetId,
    fields: 'sheets(properties(sheetId,title))',
  });
  const found = meta.data.sheets?.find((s) => s.properties?.title === SHEET_NAME);
  if (found?.properties?.sheetId !== undefined && found.properties.sheetId !== null) {
    volunteersTabId = found.properties.sheetId;
    return volunteersTabId;
  }
  volunteersTabId = null;
  return null;
}

async function ensureSheetStructure(forceTabCheck = false): Promise<void> {
  if (!sheetsClient || !targetSheetId) return;

  let tabId = await getVolunteersTabId(forceTabCheck);
  let justCreated = false;
  if (tabId === null) {
    const addRes = await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId: targetSheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
      },
    });
    const createdId = addRes.data.replies?.[0]?.addSheet?.properties?.sheetId;
    if (createdId !== undefined && createdId !== null) {
      volunteersTabId = createdId;
      tabId = createdId;
    }
    justCreated = true;
  }

  if (justCreated) {
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId: targetSheetId,
      range: `${SHEET_NAME}!A1:R1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[...VOLUNTEER_SHEET_HEADERS]],
      },
    });
    invalidateCache();
    return;
  }

  const headerRes = await sheetsClient.spreadsheets.values.get({
    spreadsheetId: targetSheetId,
    range: `${SHEET_NAME}!A1:Z1`,
  });
  const existingHeaders = headerRes.data.values?.[0] || [];
  const headersMatch =
    existingHeaders.length === VOLUNTEER_SHEET_HEADERS.length &&
    VOLUNTEER_SHEET_HEADERS.every((h, idx) => existingHeaders[idx] === h);
  if (!headersMatch) {
    await sheetsClient.spreadsheets.values.clear({
      spreadsheetId: targetSheetId,
      range: `${SHEET_NAME}!A1:Z1`,
    });
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId: targetSheetId,
      range: `${SHEET_NAME}!A1:R1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[...VOLUNTEER_SHEET_HEADERS]],
      },
    });
    invalidateCache();
  }
}

async function withMissingTabRecovery<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (!isMissingSheetTabError(err)) {
      throw err;
    }
    volunteersTabId = null;
    await ensureSheetStructure(true);
    return await fn();
  }
}

async function readSheetDataRows(forceRefresh = false): Promise<string[][]> {
  if (!sheetsClient || !targetSheetId) return [];

  const now = Date.now();
  if (!forceRefresh && rowCache && now < rowCache.expiresAt) {
    return rowCache.rows;
  }

  const res = await withMissingTabRecovery(() =>
    sheetsClient!.spreadsheets.values.get({
      spreadsheetId: targetSheetId!,
      range: `${SHEET_NAME}!A2:R`,
    })
  );
  const rows = (res.data.values || []).map((r) => r.map((cell) => String(cell ?? '')));
  rowCache = {
    rows,
    expiresAt: now + CACHE_TTL_MS,
  };
  return rows;
}

function enqueue(label: string, fn: () => Promise<void>): void {
  if (!enabled || !sheetsClient || !targetSheetId) return;

  opQueue = opQueue
    .then(() => withRetry(label, fn))
    .catch((err) => {
      console.error(`[sheetsMirror] ${label} failed permanently: ${sanitizeErrorMessage(err)}`);
    });
}

export const sheetsMirror = {
  isEnabled(): boolean {
    return enabled;
  },

  getStatus(): SheetsStatusInfo {
    return {
      enabled,
      reason: disabledReason,
      missingVars: [...missingEnvVars],
      clientEmail: serviceAccountEmail,
      detail: disabledDetail,
    };
  },

  diagnoseError(err: unknown): SheetsErrorDiagnosis {
    const { status, message } = extractRawGoogleError(err);
    const numStatus = Number(status);
    if (numStatus === 403 || message.toLowerCase().includes('permission')) {
      return {
        code: 'sheets_forbidden',
        googleStatus: 403,
        clientEmail: serviceAccountEmail,
        googleMessage: message,
      };
    }
    if (numStatus === 404 || message.toLowerCase().includes('requested entity was not found')) {
      return {
        code: 'sheets_not_found',
        googleStatus: 404,
        clientEmail: serviceAccountEmail,
        googleMessage: message,
      };
    }
    return {
      code: 'sheets_api_error',
      googleStatus: status ?? 502,
      clientEmail: serviceAccountEmail,
      googleMessage: message,
    };
  },

  async init(): Promise<void> {
    const rawCredInput = process.env.GOOGLE_SERVICE_ACCOUNT_B64?.trim() || '';
    const rawSheetInput = process.env.GOOGLE_SHEET_ID?.trim() || '';
    const urlMatch = rawSheetInput.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const sheetId = urlMatch ? urlMatch[1] : rawSheetInput;

    sheetsClient = null;
    targetSheetId = null;
    serviceAccountEmail = null;
    privateKeyValue = null;
    volunteersTabId = null;
    enabled = false;
    disabledReason = null;
    disabledDetail = null;
    missingEnvVars = [];

    if (!rawCredInput || !sheetId) {
      if (!rawCredInput) missingEnvVars.push('GOOGLE_SERVICE_ACCOUNT_B64');
      if (!sheetId) missingEnvVars.push('GOOGLE_SHEET_ID');
      disabledReason = 'missing_env';
      disabledDetail = `не заданы переменные: ${missingEnvVars.join(', ')}`;
      console.log(`Sheets mirror: OFF: ${disabledDetail}`);
      return;
    }

    let decoded = '';
    if (rawCredInput.startsWith('{')) {
      decoded = rawCredInput;
    } else {
      const compactB64 = rawCredInput.replace(/\s+/g, '');
      if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(compactB64)) {
        disabledReason = 'invalid_base64';
        disabledDetail = 'ошибка декодирования GOOGLE_SERVICE_ACCOUNT_B64 (некорректный base64)';
        console.log(`Sheets mirror: OFF: ${disabledDetail}`);
        return;
      }

      try {
        const standardB64 = compactB64.replace(/-/g, '+').replace(/_/g, '/');
        decoded = Buffer.from(standardB64, 'base64').toString('utf8').trim();
        if (!decoded.startsWith('{')) {
          throw new Error('Decoded base64 does not contain JSON object');
        }
      } catch {
        disabledReason = 'invalid_base64';
        disabledDetail = 'ошибка декодирования GOOGLE_SERVICE_ACCOUNT_B64 (не удалось прочитать JSON из base64)';
        console.log(`Sheets mirror: OFF: ${disabledDetail}`);
        return;
      }
    }

    let parsedCreds: { client_email?: string; private_key?: string };
    try {
      parsedCreds = JSON.parse(decoded);
    } catch {
      disabledReason = 'invalid_json';
      disabledDetail = 'некорректный JSON внутри GOOGLE_SERVICE_ACCOUNT_B64';
      console.log(`Sheets mirror: OFF: ${disabledDetail}`);
      return;
    }

    if (
      typeof parsedCreds?.client_email !== 'string' ||
      !parsedCreds.client_email.trim() ||
      typeof parsedCreds?.private_key !== 'string' ||
      !parsedCreds.private_key.trim()
    ) {
      disabledReason = 'missing_fields';
      disabledDetail = 'в JSON сервисного аккаунта отсутствуют client_email или private_key';
      console.log(`Sheets mirror: OFF: ${disabledDetail}`);
      return;
    }

    serviceAccountEmail = parsedCreds.client_email.trim();
    privateKeyValue = parsedCreds.private_key;

    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: serviceAccountEmail,
          private_key: parsedCreds.private_key,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      sheetsClient = google.sheets({ version: 'v4', auth });
      targetSheetId = sheetId;
      enabled = true;
      disabledReason = null;
      disabledDetail = null;

      console.log(`Sheets mirror: ON (${serviceAccountEmail})`);

      try {
        await withRetry('ensureSheetStructure', () => ensureSheetStructure(true), 1);
      } catch (err) {
        console.warn(
          `[sheetsMirror] Initial sheet check failed (${sanitizeErrorMessage(
            err
          )}); primary JSON storage remains active.`
        );
      }
    } catch (err) {
      enabled = false;
      disabledReason = 'auth_init_failed';
      disabledDetail = sanitizeErrorMessage(err);
      console.log(`Sheets mirror: OFF: ошибка инициализации клиента (${disabledDetail})`);
    }
  },

  enqueueAppendVolunteer(record: VolunteerRecord): void {
    enqueue(`append(${record.id})`, async () => {
      if (!sheetsClient || !targetSheetId) return;
      await ensureSheetStructure();
      await withMissingTabRecovery(() =>
        sheetsClient!.spreadsheets.values.append({
          spreadsheetId: targetSheetId!,
          range: `${SHEET_NAME}!A:R`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: [serializeVolunteerRow(record)],
          },
        })
      );
      invalidateCache();
    });
  },

  enqueueUpdateStatus(id: string, status: ApplicationStatus): void {
    enqueue(`updateStatus(${id})`, async () => {
      if (!sheetsClient || !targetSheetId) return;
      const rows = await readSheetDataRows(true);
      const dataIdx = rows.findIndex((r) => (r[0] || '').trim() === id);
      if (dataIdx === -1) return;

      const sheetRowNumber = dataIdx + 2; // Row 1 is header
      await withMissingTabRecovery(() =>
        sheetsClient!.spreadsheets.values.update({
          spreadsheetId: targetSheetId!,
          range: `${SHEET_NAME}!B${sheetRowNumber}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[status]],
          },
        })
      );
      invalidateCache();
    });
  },

  enqueueUpdateNotes(id: string, notes: string): void {
    enqueue(`updateNotes(${id})`, async () => {
      if (!sheetsClient || !targetSheetId) return;
      const rows = await readSheetDataRows(true);
      const dataIdx = rows.findIndex((r) => (r[0] || '').trim() === id);
      if (dataIdx === -1) return;

      const sheetRowNumber = dataIdx + 2; // Row 1 is header
      await withMissingTabRecovery(() =>
        sheetsClient!.spreadsheets.values.update({
          spreadsheetId: targetSheetId!,
          range: `${SHEET_NAME}!N${sheetRowNumber}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[notes.slice(0, MAX_CELL_CHARS)]],
          },
        })
      );
      invalidateCache();
    });
  },

  enqueueDeleteVolunteers(ids: string[]): void {
    if (!ids.length) return;
    const idSet = new Set(ids);

    enqueue(`delete(${ids.length})`, async () => {
      if (!sheetsClient || !targetSheetId) return;
      const tabId = await getVolunteersTabId(true);
      if (tabId === null) return;

      const rows = await readSheetDataRows(true);
      const rowIndicesToDelete: number[] = [];
      rows.forEach((r, idx) => {
        if (idSet.has((r[0] || '').trim())) {
          rowIndicesToDelete.push(idx + 1); // 0-based index in sheet (row 0 is header)
        }
      });

      if (rowIndicesToDelete.length === 0) return;

      // Sort descending so row deletions never shift subsequent indices
      rowIndicesToDelete.sort((a, b) => b - a);
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: targetSheetId,
        requestBody: {
          requests: rowIndicesToDelete.map((rowIndex) => ({
            deleteDimension: {
              range: {
                sheetId: tabId,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          })),
        },
      });
      invalidateCache();
    });
  },

  enqueueClearVolunteers(): void {
    enqueue('clearAll', async () => {
      if (!sheetsClient || !targetSheetId) return;
      const tabId = await getVolunteersTabId(true);
      if (tabId === null) return;
      await sheetsClient.spreadsheets.values.clear({
        spreadsheetId: targetSheetId,
        range: `${SHEET_NAME}!A2:R`,
      });
      invalidateCache();
    });
  },

  async restoreFromSheet(): Promise<VolunteerRecord[]> {
    if (!enabled || !sheetsClient || !targetSheetId) return [];
    try {
      const rows = await withRetry('restoreFromSheet', () => readSheetDataRows(false), 2);
      const records = rows
        .map((row) => deserializeVolunteerRow(row))
        .filter((item): item is VolunteerRecord => item !== null);
      return records;
    } catch (err) {
      console.error(`[sheetsMirror] restoreFromSheet failed: ${sanitizeErrorMessage(err)}`);
      return [];
    }
  },

  async syncMissingVolunteers(
    localVolunteers: VolunteerRecord[]
  ): Promise<{ added: number; enabled: boolean }> {
    if (!enabled || !sheetsClient || !targetSheetId) {
      return { added: 0, enabled: false };
    }

    let added = 0;
    const job = opQueue.then(async () => {
      await withRetry(
        'syncMissingVolunteers',
        async () => {
          if (!sheetsClient || !targetSheetId) return;
          await ensureSheetStructure(true);
          const rows = await readSheetDataRows(true);
          const existingIds = new Set(rows.map((r) => (r[0] || '').trim()).filter(Boolean));
          const missing = localVolunteers.filter((v) => !existingIds.has(v.id));

          if (missing.length === 0) {
            added = 0;
            return;
          }

          await withMissingTabRecovery(() =>
            sheetsClient!.spreadsheets.values.append({
              spreadsheetId: targetSheetId!,
              range: `${SHEET_NAME}!A:R`,
              valueInputOption: 'RAW',
              insertDataOption: 'INSERT_ROWS',
              requestBody: {
                values: missing.map(serializeVolunteerRow),
              },
            })
          );
          invalidateCache();
          added = missing.length;
        },
        1
      );
    });

    // Keep opQueue chain healthy even if sync fails
    opQueue = job.catch(() => {});
    await job;
    return { added, enabled: true };
  },

  enqueueSaveAnnouncements(announcements: AnnouncementRecord[]): void {
    enqueue(`saveAnnouncements(${announcements.length})`, async () => {
      if (!sheetsClient || !targetSheetId) return;
      const meta = await sheetsClient.spreadsheets.get({
        spreadsheetId: targetSheetId,
        fields: 'sheets(properties(sheetId,title))',
      });
      const exists = meta.data.sheets?.some((s) => s.properties?.title === ANNOUNCEMENTS_SHEET_NAME);
      if (!exists) {
        await sheetsClient.spreadsheets.batchUpdate({
          spreadsheetId: targetSheetId,
          requestBody: {
            requests: [{ addSheet: { properties: { title: ANNOUNCEMENTS_SHEET_NAME } } }],
          },
        });
      }
      await sheetsClient.spreadsheets.values.clear({
        spreadsheetId: targetSheetId,
        range: `${ANNOUNCEMENTS_SHEET_NAME}!A:K`,
      });
      const safeCell = (val: string | undefined) => {
        if (!val) return '';
        return val.length <= MAX_CELL_CHARS ? val : '';
      };
      const rows = [
        [...ANNOUNCEMENT_HEADERS],
        ...announcements.map((a) => [
          a.id,
          a.badge || '',
          a.badgeType || 'news',
          a.date || '',
          a.title || '',
          a.summary || '',
          safeCell(a.content),
          a.location || '',
          safeCell(a.imageUrl),
          safeCell(a.videoUrl),
          a.actionText || '',
        ]),
      ];
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: targetSheetId,
        range: `${ANNOUNCEMENTS_SHEET_NAME}!A1:K${rows.length}`,
        valueInputOption: 'RAW',
        requestBody: { values: rows },
      });
    });
  },

  async restoreAnnouncementsFromSheet(): Promise<AnnouncementRecord[]> {
    if (!enabled || !sheetsClient || !targetSheetId) return [];
    try {
      const meta = await sheetsClient.spreadsheets.get({
        spreadsheetId: targetSheetId,
        fields: 'sheets(properties(title))',
      });
      const exists = meta.data.sheets?.some((s) => s.properties?.title === ANNOUNCEMENTS_SHEET_NAME);
      if (!exists) return [];
      const res = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: targetSheetId,
        range: `${ANNOUNCEMENTS_SHEET_NAME}!A2:K`,
      });
      const rows = res.data.values || [];
      return rows
        .map((r): AnnouncementRecord | null => {
          const id = String(r[0] ?? '').trim();
          const title = String(r[4] ?? '').trim();
          const content = String(r[6] ?? '').trim();
          if (!id || !title || !content) return null;
          const rawType = String(r[2] ?? 'news').trim() as AnnouncementCategory;
          return {
            id,
            badge: String(r[1] ?? '').trim() || 'ЖАҢЫЛЫК',
            badgeType: ALLOWED_ANN_TYPES.has(rawType) ? rawType : 'news',
            date: String(r[3] ?? '').trim(),
            title,
            summary: String(r[5] ?? '').trim(),
            content,
            location: String(r[7] ?? '').trim() || undefined,
            imageUrl: String(r[8] ?? '').trim() || undefined,
            videoUrl: String(r[9] ?? '').trim() || undefined,
            actionText: String(r[10] ?? '').trim() || undefined,
          };
        })
        .filter((x): x is AnnouncementRecord => x !== null);
    } catch (err) {
      console.warn(`[sheetsMirror] restoreAnnouncementsFromSheet skipped: ${sanitizeErrorMessage(err)}`);
      return [];
    }
  },

  enqueueSaveSettings(settings: SiteSettings): void {
    enqueue(`saveSettings`, async () => {
      if (!sheetsClient || !targetSheetId) return;
      const meta = await sheetsClient.spreadsheets.get({
        spreadsheetId: targetSheetId,
        fields: 'sheets(properties(sheetId,title))',
      });
      const exists = meta.data.sheets?.some((s) => s.properties?.title === SETTINGS_SHEET_NAME);
      if (!exists) {
        await sheetsClient.spreadsheets.batchUpdate({
          spreadsheetId: targetSheetId,
          requestBody: {
            requests: [{ addSheet: { properties: { title: SETTINGS_SHEET_NAME } } }],
          },
        });
      }
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: targetSheetId,
        range: `${SETTINGS_SHEET_NAME}!A1:B2`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [
            ['key', 'value'],
            ['intakeOpen', settings.intakeOpen ? 'true' : 'false'],
          ],
        },
      });
    });
  },

  async restoreSettingsFromSheet(): Promise<SiteSettings | null> {
    if (!enabled || !sheetsClient || !targetSheetId) return null;
    try {
      const meta = await sheetsClient.spreadsheets.get({
        spreadsheetId: targetSheetId,
        fields: 'sheets(properties(title))',
      });
      const exists = meta.data.sheets?.some((s) => s.properties?.title === SETTINGS_SHEET_NAME);
      if (!exists) return null;
      const res = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: targetSheetId,
        range: `${SETTINGS_SHEET_NAME}!A2:B`,
      });
      const rows = res.data.values || [];
      const row = rows.find((r) => String(r[0] ?? '').trim() === 'intakeOpen');
      if (!row) return null;
      return {
        intakeOpen: String(row[1] ?? '').trim().toLowerCase() !== 'false',
      };
    } catch (err) {
      console.warn(`[sheetsMirror] restoreSettingsFromSheet skipped: ${sanitizeErrorMessage(err)}`);
      return null;
    }
  },

  async flush(timeoutMs = 4500): Promise<void> {
    if (!enabled) return;
    await Promise.race([
      opQueue,
      new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  },
};
