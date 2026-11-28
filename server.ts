import 'dotenv/config';
import express, { Request, Response, NextFunction, RequestHandler, CookieOptions } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  store,
  DepartmentId,
  ApplicationStatus,
  AnnouncementCategory,
  VolunteerCertificate,
  VolunteerPastProject,
  VolunteerRecord,
  AnnouncementRecord,
} from './store';
import { sheetsMirror } from './sheetsMirror';

// --- Configuration ---
const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), 'data');

function resolveSessionSecret(): string {
  const fromEnv = process.env.SESSION_SECRET?.trim();
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }

  console.warn(
    '[auth] SESSION_SECRET is not set — persisting a generated secret in data/session_secret so sessions survive restarts.'
  );

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const secretFile = path.join(DATA_DIR, 'session_secret');
    if (fs.existsSync(secretFile)) {
      const existing = fs.readFileSync(secretFile, 'utf8').trim();
      if (existing.length >= 32) {
        try {
          fs.chmodSync(secretFile, 0o600);
        } catch {
          // ignore chmod error on unsupported FS
        }
        return existing;
      }
    }
    const generated = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(secretFile, generated, { encoding: 'utf8', mode: 0o600 });
    try {
      fs.chmodSync(secretFile, 0o600);
    } catch {
      // ignore chmod error on unsupported FS
    }
    return generated;
  } catch (err) {
    console.warn('[auth] Could not persist data/session_secret; using in-memory secret.');
    return crypto.randomBytes(32).toString('hex');
  }
}

const SESSION_SECRET = resolveSessionSecret();

const SESSION_COOKIE = 'jo_admin';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days persistent login
const ADMIN_AUTH_FILE = path.join(DATA_DIR, 'admin_auth.json');

const MAX_VOLUNTEER_RECORD_BYTES = 3 * 1024 * 1024; // 3 MB
const MAX_PHOTO_CHARS = 600_000; // ~400 KB base64 image limit
const MAX_SELFIE_THUMB_CHARS = 48_000;

const parsedRetention = Number(process.env.RETENTION_DAYS);
const RETENTION_DAYS =
  process.env.RETENTION_DAYS !== undefined &&
  process.env.RETENTION_DAYS.trim() !== '' &&
  Number.isFinite(parsedRetention) &&
  parsedRetention >= 0
    ? Math.floor(parsedRetention)
    : 365;

const ALLOWED_DEPARTMENTS = new Set<DepartmentId>([
  'media_smm',
  'event_mgmt',
  'art_culture',
  'projects_grants',
  'pr_outreach',
]);

const ALLOWED_STATUSES = new Set<ApplicationStatus>([
  'new',
  'interview_scheduled',
  'accepted',
  'waitlist',
  'archived',
]);

const ALLOWED_ANNOUNCEMENT_TYPES = new Set<AnnouncementCategory>([
  'urgent',
  'event',
  'project',
  'news',
]);

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// --- Security & Auth Helpers ---
interface StoredAdminAuth {
  salt: string;
  hash: string;
  version: number;
  envDigest?: string;
  updatedAt: string;
}

function getConfiguredAdminPassword(): string | null {
  const raw = process.env.ADMIN_PASSWORD;
  if (!raw) return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function readRawStoredAdminAuth(): StoredAdminAuth | null {
  try {
    if (!fs.existsSync(ADMIN_AUTH_FILE)) return null;
    const raw = fs.readFileSync(ADMIN_AUTH_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.salt !== 'string' ||
      !/^[a-f0-9]{16,}$/i.test(parsed.salt) ||
      typeof parsed?.hash !== 'string' ||
      !/^[a-f0-9]{128}$/i.test(parsed.hash) ||
      typeof parsed?.version !== 'number' ||
      !Number.isInteger(parsed.version) ||
      parsed.version < 2
    ) {
      return null;
    }
    return {
      salt: parsed.salt,
      hash: parsed.hash,
      version: parsed.version,
      envDigest: typeof parsed.envDigest === 'string' ? parsed.envDigest : undefined,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return null;
  }
}

function getActiveStoredAdminAuth(): StoredAdminAuth | null {
  const stored = readRawStoredAdminAuth();
  if (!stored) return null;

  const envPass = getConfiguredAdminPassword();
  // If ADMIN_PASSWORD in environment was rotated/changed since custom password was set,
  // allow env password to take precedence as recovery mechanism.
  if (envPass && stored.envDigest !== sha256Hex(envPass)) {
    return null;
  }
  return stored;
}

function writeStoredAdminAuth(newPassword: string): StoredAdminAuth {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const prev = readRawStoredAdminAuth();
  const nextVersion = (prev?.version ?? 1) + 1;
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(newPassword, salt, 64).toString('hex');
  const envPass = getConfiguredAdminPassword();

  const record: StoredAdminAuth = {
    salt,
    hash,
    version: nextVersion,
    envDigest: envPass ? sha256Hex(envPass) : undefined,
    updatedAt: new Date().toISOString(),
  };

  const tmpPath = `${ADMIN_AUTH_FILE}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(record, null, 2), { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(tmpPath, ADMIN_AUTH_FILE);
  try {
    fs.chmodSync(ADMIN_AUTH_FILE, 0o600);
  } catch {
    // ignore chmod error on unsupported FS
  }
  return record;
}

function isAdminAuthConfigured(): boolean {
  return Boolean(getActiveStoredAdminAuth() || getConfiguredAdminPassword());
}

function getAuthEpoch(): string {
  const active = getActiveStoredAdminAuth();
  if (active) {
    return `v${active.version}`;
  }
  const envPass = getConfiguredAdminPassword();
  if (envPass) {
    return `e_${sha256Hex(envPass).slice(0, 12)}`;
  }
  return 'none';
}

function safeCompareStrings(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a, 'utf8').digest();
  const hashB = crypto.createHash('sha256').update(b, 'utf8').digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function verifyAdminPassword(candidate: string): boolean {
  const normalized = candidate.trim();
  if (!normalized) return false;
  const active = getActiveStoredAdminAuth();
  if (active) {
    try {
      const derived = crypto.scryptSync(normalized, active.salt, 64);
      const expected = Buffer.from(active.hash, 'hex');
      if (derived.length !== expected.length) return false;
      return crypto.timingSafeEqual(derived, expected);
    } catch {
      return false;
    }
  }
  const envPass = getConfiguredAdminPassword();
  if (!envPass) return false;
  return safeCompareStrings(normalized, envPass);
}

function signSession(exp: number): string {
  const epoch = getAuthEpoch();
  const payload = `${exp}.${epoch}`;
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) {
      try {
        cookies[key] = decodeURIComponent(val);
      } catch {
        cookies[key] = val;
      }
    }
  }
  return cookies;
}

function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [expStr, epoch, sigHex] = parts;
  if (!/^\d+$/.test(expStr) || !epoch || !/^[a-f0-9]{64}$/i.test(sigHex)) {
    return false;
  }

  if (epoch !== getAuthEpoch()) {
    return false;
  }

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Date.now()) {
    return false;
  }

  const payload = `${expStr}.${epoch}`;
  const expectedHex = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const sigBuf = Buffer.from(sigHex, 'hex');
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (sigBuf.length !== expectedBuf.length) return false;

  return crypto.timingSafeEqual(sigBuf, expectedBuf);
}

function getBearerToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== 'string') return undefined;
  if (!authHeader.toLowerCase().startsWith('bearer ')) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

function verifySession(req: Request): boolean {
  if (!isAdminAuthConfigured()) return false;
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies[SESSION_COOKIE];
  if (isValidSessionToken(cookieToken)) {
    return true;
  }
  const bearerToken = getBearerToken(req);
  if (isValidSessionToken(bearerToken)) {
    return true;
  }
  return false;
}

function getAdminCookieOptions(req: Request, maxAge?: number): CookieOptions & { partitioned?: boolean } {
  const isHttps = Boolean(req.secure);
  const opts: CookieOptions & { partitioned?: boolean } = {
    httpOnly: true,
    path: '/',
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
  };
  if (isHttps) {
    opts.partitioned = true;
  }
  if (maxAge !== undefined) {
    opts.maxAge = maxAge;
  }
  return opts;
}

function normalizeHostHeader(val: string): string {
  return val
    .trim()
    .toLowerCase()
    .replace(/:(80|443)$/, '');
}

function verifySameOriginIfPresent(req: Request): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;

  const candidates = new Set<string>();
  const forwardedHost = req.headers['x-forwarded-host'];
  const rawForwarded = Array.isArray(forwardedHost) ? forwardedHost.join(',') : forwardedHost;
  if (rawForwarded) {
    for (const part of rawForwarded.split(',')) {
      const normalized = normalizeHostHeader(part);
      if (normalized) candidates.add(normalized);
    }
  }
  if (typeof req.headers.host === 'string' && req.headers.host.trim()) {
    candidates.add(normalizeHostHeader(req.headers.host));
  }

  if (candidates.size === 0) return false;
  try {
    const originHost = normalizeHostHeader(new URL(origin).host);
    return candidates.has(originHost);
  } catch {
    return false;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!verifySession(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !verifySameOriginIfPresent(req)) {
    res.status(403).json({ error: 'forbidden_origin' });
    return;
  }
  next();
}

// --- Rate Limiting ---
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILS = 5;
const SUBMIT_WINDOW_MS = 60 * 60 * 1000;
const SUBMIT_MAX_COUNT = 10;

const loginFailStore = new Map<string, number[]>();
const submitStore = new Map<string, number[]>();

function getClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function pruneTimestamps(
  storeMap: Map<string, number[]>,
  key: string,
  windowMs: number,
  now: number
): number[] {
  const list = storeMap.get(key) || [];
  const valid = list.filter((ts) => now - ts < windowMs);
  if (valid.length === 0) {
    storeMap.delete(key);
  } else {
    storeMap.set(key, valid);
  }
  return valid;
}

// --- Retention Cleanup ---
async function runRetentionPurge(): Promise<void> {
  if (RETENTION_DAYS <= 0) return;
  try {
    const cutoffIso = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const removedIds = await store.purgeOldVolunteers(cutoffIso);
    if (removedIds.length > 0) {
      sheetsMirror.enqueueDeleteVolunteers(removedIds);
    }
  } catch (err) {
    console.error('[retention] Failed to purge expired volunteers:', err);
  }
}

// --- Sanitization Helpers ---
function cleanString(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function cleanOptionalUrl(val: unknown, maxLen = 4_000_000): string | undefined {
  if (typeof val !== 'string') return undefined;
  const trimmed = val.trim();
  if (!trimmed || trimmed.length > maxLen) return undefined;
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('data:video/')
  ) {
    return trimmed;
  }
  return undefined;
}

function generateVolunteerId(): string {
  const num = crypto.randomInt(1000, 10000);
  return `JO-2026-${num}`;
}

// --- App Setup ---
async function startServer() {
  await store.init();
  await sheetsMirror.init();

  let explicitlyClearedVolunteers = false;
  let explicitlyClearedAnnouncements = false;

  // Restore from Google Sheets backup on startup if primary db.json is empty
  if (sheetsMirror.isEnabled()) {
    const existingVolunteers = await store.listVolunteers();
    if (existingVolunteers.length === 0) {
      const restored = await sheetsMirror.restoreFromSheet(true);
      if (restored.length > 0) {
        await store.setVolunteers(restored);
        console.log(
          `[server] Restored ${restored.length} volunteer applications from Google Sheets backup.`
        );
      } else {
        console.log('[server] Restored 0 volunteer applications from Google Sheets backup.');
      }
    }

    const existingAnnouncements = await store.listAnnouncements();
    if (existingAnnouncements.length === 0) {
      const restoredAnn = await sheetsMirror.restoreAnnouncementsFromSheet();
      if (restoredAnn.length > 0) {
        await store.setAnnouncements(restoredAnn);
        console.log(
          `[server] Restored ${restoredAnn.length} announcements from Google Sheets backup.`
        );
      }
    }

    const restoredSettings = await sheetsMirror.restoreSettingsFromSheet();
    if (restoredSettings) {
      await store.updateSettings(restoredSettings);
    }
  }

  await runRetentionPurge();
  setInterval(() => {
    void runRetentionPurge();
  }, 24 * 60 * 60 * 1000).unref();

  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(express.json({ limit: '12mb' }));

  // Global Security Headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(self)');
    if (IS_PROD) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; connect-src 'self'; object-src 'none'; frame-src https://www.youtube-nocookie.com;"
      );
    }
    next();
  });

  // Liveness / ping endpoint for free hosting (no DB touch)
  app.get('/healthz', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: true });
  });

  // API No-Cache & No-Index Headers
  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    next();
  });

  // --- Admin Auth Endpoints ---
  app.get('/api/admin/session', (req, res) => {
    const configured = isAdminAuthConfigured();
    const authenticated = configured && verifySession(req);
    res.json({ authenticated, configured });
  });

  app.post('/api/admin/setup', (req, res) => {
    if (!verifySameOriginIfPresent(req)) {
      res.status(403).json({ error: 'forbidden_origin' });
      return;
    }

    if (isAdminAuthConfigured()) {
      res.status(403).json({ error: 'already_configured' });
      return;
    }

    const newPassword =
      typeof req.body?.password === 'string' ? req.body.password.trim() : '';

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'password_too_short' });
      return;
    }

    if (newPassword.length > 128) {
      res.status(400).json({ error: 'password_too_long' });
      return;
    }

    writeStoredAdminAuth(newPassword);

    const exp = Date.now() + SESSION_TTL_MS;
    const token = signSession(exp);
    res.cookie(SESSION_COOKIE, token, getAdminCookieOptions(req, SESSION_TTL_MS));

    res.status(201).json({ authenticated: true, token });
  });

  app.post('/api/admin/login', (req, res) => {
    if (!verifySameOriginIfPresent(req)) {
      res.status(403).json({ error: 'forbidden_origin' });
      return;
    }

    if (!isAdminAuthConfigured()) {
      res.status(503).json({ error: 'admin_not_configured' });
      return;
    }

    const ip = getClientIp(req);
    const now = Date.now();
    const recentFails = pruneTimestamps(loginFailStore, ip, LOGIN_WINDOW_MS, now);

    if (recentFails.length >= LOGIN_MAX_FAILS) {
      res.setHeader('Retry-After', String(Math.ceil(LOGIN_WINDOW_MS / 1000)));
      res.status(429).json({ error: 'too_many_attempts' });
      return;
    }

    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!password || !verifyAdminPassword(password)) {
      recentFails.push(now);
      loginFailStore.set(ip, recentFails);
      res.status(401).json({ error: 'invalid_password' });
      return;
    }

    loginFailStore.delete(ip);
    const exp = now + SESSION_TTL_MS;
    const token = signSession(exp);
    res.cookie(SESSION_COOKIE, token, getAdminCookieOptions(req, SESSION_TTL_MS));

    res.json({ authenticated: true, token });
  });

  app.post('/api/admin/password', requireAdmin, (req, res) => {
    const currentPassword =
      typeof req.body?.currentPassword === 'string' ? req.body.currentPassword.trim() : '';
    const newPassword =
      typeof req.body?.newPassword === 'string' ? req.body.newPassword.trim() : '';

    if (!currentPassword || !verifyAdminPassword(currentPassword)) {
      res.status(401).json({ error: 'invalid_current_password' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'password_too_short' });
      return;
    }

    if (newPassword.length > 128) {
      res.status(400).json({ error: 'password_too_long' });
      return;
    }

    writeStoredAdminAuth(newPassword);

    const exp = Date.now() + SESSION_TTL_MS;
    const token = signSession(exp);
    res.cookie(SESSION_COOKIE, token, getAdminCookieOptions(req, SESSION_TTL_MS));

    res.json({ ok: true, token });
  });

  app.post('/api/admin/logout', (req, res) => {
    if (!verifySameOriginIfPresent(req)) {
      res.status(403).json({ error: 'forbidden_origin' });
      return;
    }
    res.clearCookie(SESSION_COOKIE, getAdminCookieOptions(req));
    res.json({ authenticated: false });
  });

  app.post(
    '/api/admin/sync',
    requireAdmin,
    asyncHandler(async (_req, res) => {
      try {
        const status = sheetsMirror.getStatus();
        if (!status.enabled) {
          if (
            status.reason === 'invalid_base64' ||
            status.reason === 'invalid_json' ||
            status.reason === 'missing_fields'
          ) {
            console.warn(`[sheetsMirror] Sync result: error=sheets_invalid_key (${status.reason})`);
            res.status(503).json({
              error: 'sheets_invalid_key',
              reason: status.reason,
              added: 0,
              enabled: false,
            });
            return;
          }
          console.warn(
            `[sheetsMirror] Sync result: error=sheets_not_configured (${status.reason || 'missing_env'})`
          );
          res.status(503).json({
            error: 'sheets_not_configured',
            reason: status.reason,
            missingVars: status.missingVars,
            added: 0,
            enabled: false,
          });
          return;
        }

        let volunteers = await store.listVolunteers();
        if (sheetsMirror.isEnabled() && !explicitlyClearedVolunteers) {
          const fromSheet = await sheetsMirror.restoreFromSheet(true);
          if (fromSheet.length > 0) {
            const localIds = new Set(volunteers.map((v) => v.id));
            const missingLocally = fromSheet.filter((v) => !localIds.has(v.id));
            if (missingLocally.length > 0) {
              volunteers = [...volunteers, ...missingLocally];
              await store.setVolunteers(volunteers);
            }
          }
        }
        const result = await sheetsMirror.syncMissingVolunteers(volunteers);
        sheetsMirror.enqueueSaveAnnouncements(await store.listAnnouncements());
        sheetsMirror.enqueueSaveSettings(await store.getSettings());
        const added = typeof result?.added === 'number' ? result.added : 0;
        const total = volunteers.length;
        console.log(`[sheetsMirror] Sync result: added=${added}, total=${total}`);
        res.status(200).json({ ok: true, added, total });
      } catch (err) {
        const diag = sheetsMirror.diagnoseError(err);
        const httpStatus =
          diag.code === 'sheets_forbidden'
            ? 403
            : diag.code === 'sheets_not_found'
            ? 404
            : 502;
        console.warn(
          `[sheetsMirror] Sync result: error=${diag.code} (status=${diag.googleStatus})`
        );
        if (!res.headersSent) {
          res.status(httpStatus).json({
            error: diag.code,
            googleStatus: diag.googleStatus,
            clientEmail: diag.code === 'sheets_forbidden' ? diag.clientEmail : undefined,
            googleMessage: diag.googleMessage,
          });
        }
      }
    })
  );

  // --- Site Settings Endpoints ---
  app.get(
    '/api/settings',
    asyncHandler(async (_req, res) => {
      const settings = await store.getSettings();
      res.json(settings);
    })
  );

  app.patch(
    '/api/admin/settings',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const body = req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.intakeOpen !== 'boolean') {
        res.status(400).json({ error: 'invalid_payload' });
        return;
      }
      const updated = await store.updateSettings({ intakeOpen: body.intakeOpen });
      sheetsMirror.enqueueSaveSettings(updated);
      res.json(updated);
    })
  );

  // --- Volunteer Endpoints ---
  app.post(
    '/api/volunteers',
    asyncHandler(async (req, res) => {
      const logReject = (status: number, code: string) => {
        const rawBody = req.body && typeof req.body === 'object' ? req.body : {};
        const photoLen =
          typeof rawBody.selfiePhotoUrl === 'string' ? rawBody.selfiePhotoUrl.length : 0;
        const thumbLen = typeof rawBody.selfieThumb === 'string' ? rawBody.selfieThumb.length : 0;
        console.warn(
          `[volunteers] Rejected POST /api/volunteers (${status} ${code}): selfiePhotoUrl.length=${photoLen}, selfieThumb.length=${thumbLen}`
        );
      };

      const isAdmin = verifySession(req) && verifySameOriginIfPresent(req);
      if (!isAdmin) {
        const settings = await store.getSettings();
        if (!settings.intakeOpen) {
          logReject(403, 'intake_closed');
          res.status(403).json({ error: 'intake_closed' });
          return;
        }
        const ip = getClientIp(req);
        const now = Date.now();
        const recentSubmits = pruneTimestamps(submitStore, ip, SUBMIT_WINDOW_MS, now);
        if (recentSubmits.length >= SUBMIT_MAX_COUNT) {
          logReject(429, 'too_many_submissions');
          res.setHeader('Retry-After', String(Math.ceil(SUBMIT_WINDOW_MS / 1000)));
          res.status(429).json({ error: 'too_many_submissions' });
          return;
        }
        recentSubmits.push(now);
        submitStore.set(ip, recentSubmits);
      }

      const body = req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        logReject(400, 'invalid_payload');
        res.status(400).json({ error: 'invalid_payload' });
        return;
      }

      if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_VOLUNTEER_RECORD_BYTES) {
        logReject(413, 'payload_too_large');
        res.status(413).json({ error: 'payload_too_large' });
        return;
      }

      // Strict consent check
      if (body.consent !== true) {
        logReject(400, 'consent_required');
        res.status(400).json({ error: 'consent_required' });
        return;
      }

      const fullName = cleanString(body.fullName, 200);
      if (fullName.length < 2) {
        logReject(400, 'invalid_name');
        res.status(400).json({ error: 'invalid_name' });
        return;
      }

      const department = body.department as DepartmentId;
      if (typeof body.department !== 'string' || !ALLOWED_DEPARTMENTS.has(department)) {
        logReject(400, 'invalid_department');
        res.status(400).json({ error: 'invalid_department' });
        return;
      }

      const selfiePhotoUrl =
        typeof body.selfiePhotoUrl === 'string' ? body.selfiePhotoUrl.trim() : '';
      if (!selfiePhotoUrl) {
        logReject(400, 'photo_required');
        res.status(400).json({ error: 'photo_required' });
        return;
      }
      if (!selfiePhotoUrl.startsWith('data:image/')) {
        logReject(400, 'photo_required');
        res.status(400).json({ error: 'photo_required' });
        return;
      }
      if (selfiePhotoUrl.length > MAX_PHOTO_CHARS) {
        logReject(400, 'photo_too_large');
        res.status(400).json({ error: 'photo_too_large' });
        return;
      }

      let selfieThumb: string | undefined;
      if (body.selfieThumb !== undefined && body.selfieThumb !== null && body.selfieThumb !== '') {
        if (typeof body.selfieThumb !== 'string') {
          logReject(400, 'invalid_selfie_thumb');
          res.status(400).json({ error: 'invalid_selfie_thumb' });
          return;
        }
        const trimmedThumb = body.selfieThumb.trim();
        if (!trimmedThumb.startsWith('data:image/') || trimmedThumb.length > MAX_SELFIE_THUMB_CHARS) {
          logReject(400, 'invalid_selfie_thumb');
          res.status(400).json({ error: 'invalid_selfie_thumb' });
          return;
        }
        selfieThumb = trimmedThumb;
      }

      // Sanitize remaining whitelisted fields
      const phone = cleanString(body.phone, 40);
      const phoneDigits = phone.replace(/\D/g, '');
      if ((!isAdmin && phoneDigits.length < 7) || (phone && phoneDigits.length < 7)) {
        logReject(400, 'invalid_phone');
        res.status(400).json({ error: 'invalid_phone' });
        return;
      }

      const address = cleanString(body.address, 300);
      const rawAge = cleanString(typeof body.age === 'number' ? String(body.age) : body.age, 20);
      const ageNumMatch = rawAge.match(/^(\d{1,3})\b/);
      if (ageNumMatch && Number(ageNumMatch[1]) < 17) {
        logReject(400, 'age_under_17');
        res.status(400).json({ error: 'age_under_17' });
        return;
      }
      const age = rawAge || '17+';
      const cityOrUniversity = cleanString(body.cityOrUniversity, 300) || address;
      const occupation = cleanString(body.occupation, 200) || undefined;
      const motivation = cleanString(body.motivation, 3000);
      const availability = cleanString(body.availability, 200);
      const portfolioOrSocial = cleanString(body.portfolioOrSocial, 500) || undefined;
      const instagramHandle = cleanString(body.instagramHandle, 200) || undefined;

      const skills: string[] = Array.isArray(body.skills)
        ? body.skills
            .filter((s: unknown): s is string => typeof s === 'string')
            .map((s: string) => s.trim().slice(0, 100))
            .filter(Boolean)
            .slice(0, 30)
        : [];

      const certificates: VolunteerCertificate[] = Array.isArray(body.certificates)
        ? body.certificates
            .filter((c: unknown): c is Record<string, unknown> => Boolean(c && typeof c === 'object'))
            .slice(0, 20)
            .map((c: Record<string, unknown>, idx: number) => ({
              id: cleanString(c.id, 50) || String(idx + 1),
              title: cleanString(c.title, 200),
              issuer: cleanString(c.issuer, 200),
              year: cleanString(c.year, 20) || undefined,
            }))
            .filter((c: VolunteerCertificate) => c.title.length > 0)
        : [];

      const pastProjects: VolunteerPastProject[] = Array.isArray(body.pastProjects)
        ? body.pastProjects
            .filter((p: unknown): p is Record<string, unknown> => Boolean(p && typeof p === 'object'))
            .slice(0, 20)
            .map((p: Record<string, unknown>, idx: number) => ({
              id: cleanString(p.id, 50) || String(idx + 1),
              title: cleanString(p.title, 200),
              role: cleanString(p.role, 150),
              description: cleanString(p.description, 1500),
              result: cleanString(p.result, 500) || undefined,
              link: cleanString(p.link, 500) || undefined,
            }))
            .filter((p: VolunteerPastProject) => p.title.length > 0)
        : [];

      let otherOrganizations: { isMember: boolean; details?: string } | undefined;
      if (body.otherOrganizations && typeof body.otherOrganizations === 'object') {
        const isMember = Boolean(body.otherOrganizations.isMember);
        const details = cleanString(body.otherOrganizations.details, 400);
        otherOrganizations = {
          isMember,
          details: isMember && details ? details : undefined,
        };
      }

      const nowIso = new Date().toISOString();
      const record: VolunteerRecord = {
        id: generateVolunteerId(),
        fullName,
        address,
        age,
        cityOrUniversity,
        occupation,
        department,
        selfiePhotoUrl,
        selfieThumb,
        photo3x4Url: selfiePhotoUrl,
        skills: skills.length > 0 ? skills : ['Чыгармачыл демилге'],
        motivation,
        availability,
        certificates,
        pastProjects,
        portfolioOrSocial,
        instagramHandle,
        phone: phone || undefined,
        otherOrganizations,
        status: 'new',
        submittedAt: nowIso,
        confirmationSentAt: nowIso,
        consent: true,
        consentAt: nowIso,
        notes:
          otherOrganizations?.isMember && otherOrganizations.details
            ? `Башка уюмдарда тажрыйбасы бар: ${otherOrganizations.details}`
            : 'Түз камерадан тартылган сүрөтү жана дареги менен жаңы катталган анкета.',
      };

      if (Buffer.byteLength(JSON.stringify(record), 'utf8') > MAX_VOLUNTEER_RECORD_BYTES) {
        logReject(413, 'payload_too_large');
        res.status(413).json({ error: 'payload_too_large' });
        return;
      }

      // Primary write to data/db.json FIRST, then mirror to Google Sheets
      explicitlyClearedVolunteers = false;
      const saved = await store.addVolunteer(record);
      console.log(
        `[volunteers] Saved POST /api/volunteers id=${saved.id}, selfiePhotoUrl.length=${saved.selfiePhotoUrl.length}`
      );
      sheetsMirror.enqueueAppendVolunteer(saved);
      await sheetsMirror.flush(3000);
      res.status(201).json(saved);
    })
  );

  app.get(
    '/api/volunteers',
    requireAdmin,
    asyncHandler(async (_req, res) => {
      let volunteers = await store.listVolunteers();
      if (volunteers.length === 0 && sheetsMirror.isEnabled() && !explicitlyClearedVolunteers) {
        const restored = await sheetsMirror.restoreFromSheet(true);
        if (restored.length > 0) {
          await store.setVolunteers(restored);
          volunteers = await store.listVolunteers();
          console.log(
            `[server] Auto-restored ${volunteers.length} volunteers from Google Sheets on GET.`
          );
        }
      }
      res.json({ volunteers });
    })
  );

  app.patch(
    '/api/volunteers/:id',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const id = cleanString(req.params.id, 100);
      const body = req.body;
      if (!id || !body || typeof body !== 'object' || Array.isArray(body)) {
        res.status(400).json({ error: 'invalid_payload' });
        return;
      }

      const patch: { status?: ApplicationStatus; notes?: string } = {};
      if (body.status !== undefined) {
        if (typeof body.status !== 'string' || !ALLOWED_STATUSES.has(body.status as ApplicationStatus)) {
          res.status(400).json({ error: 'invalid_status' });
          return;
        }
        patch.status = body.status as ApplicationStatus;
      }

      if (body.notes !== undefined) {
        patch.notes = cleanString(body.notes, 2000);
      }

      const updated = await store.updateVolunteer(id, patch);
      if (!updated) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      if (patch.status !== undefined) {
        sheetsMirror.enqueueUpdateStatus(id, updated.status);
      }
      if (patch.notes !== undefined) {
        sheetsMirror.enqueueUpdateNotes(id, updated.notes || '');
      }
      res.json(updated);
    })
  );

  app.delete(
    '/api/volunteers/:id',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const id = cleanString(req.params.id, 100);
      if (!id) {
        res.status(400).json({ error: 'invalid_id' });
        return;
      }
      const deleted = await store.deleteVolunteer(id);
      if (!deleted) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      sheetsMirror.enqueueDeleteVolunteers([id]);
      res.json({ ok: true });
    })
  );

  app.delete(
    '/api/volunteers',
    requireAdmin,
    asyncHandler(async (_req, res) => {
      explicitlyClearedVolunteers = true;
      await store.clearVolunteers();
      sheetsMirror.enqueueClearVolunteers();
      res.json({ ok: true });
    })
  );

  // --- Announcements Endpoints ---
  app.get(
    '/api/announcements',
    asyncHandler(async (_req, res) => {
      let announcements = await store.listAnnouncements();
      if (announcements.length === 0 && sheetsMirror.isEnabled() && !explicitlyClearedAnnouncements) {
        const restoredAnn = await sheetsMirror.restoreAnnouncementsFromSheet();
        if (restoredAnn.length > 0) {
          await store.setAnnouncements(restoredAnn);
          announcements = restoredAnn;
        }
      }
      res.json({ announcements });
    })
  );

  app.post(
    '/api/announcements',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const body = req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        res.status(400).json({ error: 'invalid_payload' });
        return;
      }

      const title = cleanString(body.title, 300);
      const content = cleanString(body.content, 8000);
      if (!title || !content) {
        res.status(400).json({ error: 'title_and_content_required' });
        return;
      }

      const badgeType =
        typeof body.badgeType === 'string' &&
        ALLOWED_ANNOUNCEMENT_TYPES.has(body.badgeType as AnnouncementCategory)
          ? (body.badgeType as AnnouncementCategory)
          : 'news';

      const record: AnnouncementRecord = {
        id: `ann-${Date.now()}-${crypto.randomInt(1000, 10000)}`,
        title,
        content,
        badgeType,
        badge: cleanString(body.badge, 50) || 'ЖАҢЫЛЫК',
        date: cleanString(body.date, 100) || new Date().toISOString().slice(0, 10),
        summary: cleanString(body.summary, 500) || content.slice(0, 150),
        location: cleanString(body.location, 200) || undefined,
        imageUrl: cleanOptionalUrl(body.imageUrl),
        videoUrl: cleanOptionalUrl(body.videoUrl, 10_000_000),
        actionText: cleanString(body.actionText, 100) || undefined,
      };

      explicitlyClearedAnnouncements = false;
      const saved = await store.upsertAnnouncement(record);
      sheetsMirror.enqueueSaveAnnouncements(await store.listAnnouncements());
      res.status(201).json(saved);
    })
  );

  app.patch(
    '/api/announcements/:id',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const id = cleanString(req.params.id, 100);
      const body = req.body;
      if (!id || !body || typeof body !== 'object' || Array.isArray(body)) {
        res.status(400).json({ error: 'invalid_payload' });
        return;
      }

      const patch: Partial<Omit<AnnouncementRecord, 'id'>> = {};
      if (body.title !== undefined) {
        const t = cleanString(body.title, 300);
        if (t) patch.title = t;
      }
      if (body.content !== undefined) {
        const c = cleanString(body.content, 8000);
        if (c) patch.content = c;
      }
      if (
        typeof body.badgeType === 'string' &&
        ALLOWED_ANNOUNCEMENT_TYPES.has(body.badgeType as AnnouncementCategory)
      ) {
        patch.badgeType = body.badgeType as AnnouncementCategory;
      }
      if (body.badge !== undefined) {
        const b = cleanString(body.badge, 50);
        if (b) patch.badge = b;
      }
      if (body.date !== undefined) {
        const d = cleanString(body.date, 100);
        if (d) patch.date = d;
      }
      if (body.summary !== undefined) {
        patch.summary = cleanString(body.summary, 500);
      }
      if (body.location !== undefined) {
        patch.location = cleanString(body.location, 200) || undefined;
      }
      if (body.imageUrl !== undefined) {
        patch.imageUrl = cleanOptionalUrl(body.imageUrl);
      }
      if (body.videoUrl !== undefined) {
        patch.videoUrl = cleanOptionalUrl(body.videoUrl, 10_000_000);
      }
      if (body.actionText !== undefined) {
        patch.actionText = cleanString(body.actionText, 100) || undefined;
      }

      const updated = await store.updateAnnouncement(id, patch);
      if (!updated) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      sheetsMirror.enqueueSaveAnnouncements(await store.listAnnouncements());
      res.json(updated);
    })
  );

  app.delete(
    '/api/announcements/:id',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const id = cleanString(req.params.id, 100);
      if (!id) {
        res.status(400).json({ error: 'invalid_id' });
        return;
      }
      const deleted = await store.deleteAnnouncement(id);
      if (!deleted) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      sheetsMirror.enqueueSaveAnnouncements(await store.listAnnouncements());
      res.json({ ok: true });
    })
  );

  app.delete(
    '/api/announcements',
    requireAdmin,
    asyncHandler(async (_req, res) => {
      explicitlyClearedAnnouncements = true;
      await store.clearAnnouncements();
      sheetsMirror.enqueueSaveAnnouncements([]);
      res.json({ ok: true });
    })
  );

  // Unknown API routes return JSON 404
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'not_found' });
  });

  // --- Frontend Serving (Dev Vite Middleware or Production Static Dist) ---
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir, { index: false }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  // Error Handler
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const rawBody = req.body && typeof req.body === 'object' ? req.body : {};
    const photoLen = typeof rawBody.selfiePhotoUrl === 'string' ? rawBody.selfiePhotoUrl.length : 0;
    const thumbLen = typeof rawBody.selfieThumb === 'string' ? rawBody.selfieThumb.length : 0;

    if (err?.type === 'entity.too.large') {
      if (req.method === 'POST' && req.path === '/api/volunteers') {
        console.warn(
          `[volunteers] Rejected POST /api/volunteers (413 payload_too_large): body exceeded 12mb limit, selfiePhotoUrl.length=${photoLen}, selfieThumb.length=${thumbLen}`
        );
      }
      res.status(413).json({ error: 'payload_too_large' });
      return;
    }
    if (err instanceof SyntaxError && 'body' in err) {
      if (req.method === 'POST' && req.path === '/api/volunteers') {
        console.warn(
          `[volunteers] Rejected POST /api/volunteers (400 invalid_json): selfiePhotoUrl.length=${photoLen}, selfieThumb.length=${thumbLen}`
        );
      }
      res.status(400).json({ error: 'invalid_json' });
      return;
    }
    if (req.method === 'POST' && req.path === '/api/volunteers') {
      console.error(
        `[volunteers] Rejected POST /api/volunteers (500 internal_error): selfiePhotoUrl.length=${photoLen}, selfieThumb.length=${thumbLen}`,
        err?.message || err
      );
    } else {
      console.error('[server] Unhandled error:', err);
    }
    res.status(500).json({ error: 'internal_error' });
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (${IS_PROD ? 'production' : 'development'})`);
  });

  let shuttingDown = false;
  const gracefulShutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    try {
      await sheetsMirror.flush(4500);
    } catch {
      // ignore flush error during shutdown
    }
    server.close(() => {
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 5000).unref();
  };

  process.on('SIGTERM', () => {
    void gracefulShutdown();
  });
  process.on('SIGINT', () => {
    void gracefulShutdown();
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
