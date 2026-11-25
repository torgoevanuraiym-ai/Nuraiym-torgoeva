import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// --- Shared Domain Types ---
export type DepartmentId =
  | 'media_smm'
  | 'event_mgmt'
  | 'art_culture'
  | 'projects_grants'
  | 'pr_outreach';

export type ApplicationStatus =
  | 'new'
  | 'interview_scheduled'
  | 'accepted'
  | 'waitlist'
  | 'archived';

export type AnnouncementCategory = 'urgent' | 'event' | 'project' | 'news';

export interface VolunteerCertificate {
  id: string;
  title: string;
  issuer: string;
  year?: string;
  fileUrl?: string;
}

export interface VolunteerPastProject {
  id: string;
  title: string;
  role: string;
  description: string;
  result?: string;
  link?: string;
}

export interface VolunteerRecord {
  id: string;
  fullName: string;
  address: string;
  age: string;
  cityOrUniversity?: string;
  occupation?: string;
  department: DepartmentId;
  selfiePhotoUrl: string;
  selfieThumb?: string;
  photo3x4Url?: string;
  skills: string[];
  motivation: string;
  availability: string;
  certificates: VolunteerCertificate[];
  pastProjects: VolunteerPastProject[];
  portfolioOrSocial?: string;
  instagramHandle?: string;
  phone?: string;
  otherOrganizations?: {
    isMember: boolean;
    details?: string;
  };
  status: ApplicationStatus;
  submittedAt: string;
  notes?: string;
  confirmationSentAt: string;
  consent: boolean;
  consentAt: string;
}

export interface AnnouncementRecord {
  id: string;
  badge: string;
  badgeType: AnnouncementCategory;
  date: string;
  title: string;
  summary: string;
  content: string;
  location?: string;
  imageUrl?: string;
  videoUrl?: string;
  actionText?: string;
}

interface JsonDbSchema {
  volunteers: VolunteerRecord[];
  announcements: AnnouncementRecord[];
}

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function writeJsonDb(data: JsonDbSchema): void {
  ensureDataDir();
  const tmpPath = `${DB_PATH}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, DB_PATH);
}

function readJsonDb(): JsonDbSchema {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    const empty: JsonDbSchema = { volunteers: [], announcements: [] };
    writeJsonDb(empty);
    return empty;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      volunteers: Array.isArray(parsed?.volunteers) ? parsed.volunteers : [],
      announcements: Array.isArray(parsed?.announcements) ? parsed.announcements : [],
    };
  } catch {
    return { volunteers: [], announcements: [] };
  }
}

function generateVolunteerId(attempt = 0): string {
  if (attempt < 10) {
    return `JO-2026-${crypto.randomInt(1000, 10000)}`;
  }
  return `JO-2026-${crypto.randomInt(10000, 100000)}`;
}

export const store = {
  async init(): Promise<void> {
    ensureDataDir();
    if (!fs.existsSync(DB_PATH)) {
      writeJsonDb({ volunteers: [], announcements: [] });
    }
  },

  async listVolunteers(): Promise<VolunteerRecord[]> {
    const db = readJsonDb();
    return [...db.volunteers].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  },

  async setVolunteers(volunteers: VolunteerRecord[]): Promise<void> {
    const db = readJsonDb();
    writeJsonDb({ ...db, volunteers });
  },

  async addVolunteer(record: VolunteerRecord): Promise<VolunteerRecord> {
    const db = readJsonDb();
    const existingIds = new Set(db.volunteers.map((v) => v.id));
    let id = record.id;
    let attempt = 0;
    while (existingIds.has(id) && attempt < 25) {
      attempt++;
      id = generateVolunteerId(attempt);
    }
    const saved: VolunteerRecord = { ...record, id };
    db.volunteers.unshift(saved);
    writeJsonDb(db);
    return saved;
  },

  async updateVolunteer(
    id: string,
    patch: { status?: ApplicationStatus; notes?: string }
  ): Promise<VolunteerRecord | null> {
    const db = readJsonDb();
    const idx = db.volunteers.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    const updates: Partial<Pick<VolunteerRecord, 'status' | 'notes'>> = {};
    if (patch.status !== undefined) updates.status = patch.status;
    if (patch.notes !== undefined) updates.notes = patch.notes;
    const current = { ...db.volunteers[idx], ...updates };
    db.volunteers[idx] = current;
    writeJsonDb(db);
    return current;
  },

  async deleteVolunteer(id: string): Promise<boolean> {
    const db = readJsonDb();
    const nextList = db.volunteers.filter((v) => v.id !== id);
    if (nextList.length === db.volunteers.length) return false;
    writeJsonDb({ ...db, volunteers: nextList });
    return true;
  },

  async clearVolunteers(): Promise<void> {
    const db = readJsonDb();
    writeJsonDb({ ...db, volunteers: [] });
  },

  async listAnnouncements(): Promise<AnnouncementRecord[]> {
    const db = readJsonDb();
    return db.announcements;
  },

  async upsertAnnouncement(item: AnnouncementRecord): Promise<AnnouncementRecord> {
    const db = readJsonDb();
    const idx = db.announcements.findIndex((a) => a.id === item.id);
    if (idx >= 0) {
      db.announcements[idx] = item;
    } else {
      db.announcements.unshift(item);
    }
    writeJsonDb(db);
    return item;
  },

  async updateAnnouncement(
    id: string,
    patch: Partial<Omit<AnnouncementRecord, 'id'>>
  ): Promise<AnnouncementRecord | null> {
    const db = readJsonDb();
    const idx = db.announcements.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    const current: AnnouncementRecord = { ...db.announcements[idx], ...patch, id };
    db.announcements[idx] = current;
    writeJsonDb(db);
    return current;
  },

  async deleteAnnouncement(id: string): Promise<boolean> {
    const db = readJsonDb();
    const nextList = db.announcements.filter((a) => a.id !== id);
    if (nextList.length === db.announcements.length) return false;
    writeJsonDb({ ...db, announcements: nextList });
    return true;
  },

  async clearAnnouncements(): Promise<void> {
    const db = readJsonDb();
    writeJsonDb({ ...db, announcements: [] });
  },

  async purgeOldVolunteers(cutoffIso: string): Promise<string[]> {
    const db = readJsonDb();
    const cutoffMs = Date.parse(cutoffIso);
    const removedIds: string[] = [];
    const kept = db.volunteers.filter((v) => {
      if (!v.submittedAt) return true;
      let shouldKeep = true;
      if (/^\d{4}-\d{2}-\d{2}T/.test(v.submittedAt)) {
        shouldKeep = v.submittedAt >= cutoffIso;
      } else {
        const parsed = Date.parse(v.submittedAt.replace(' ', 'T'));
        if (Number.isFinite(parsed) && Number.isFinite(cutoffMs)) {
          shouldKeep = parsed >= cutoffMs;
        }
      }
      if (!shouldKeep) {
        removedIds.push(v.id);
      }
      return shouldKeep;
    });
    if (removedIds.length > 0) {
      writeJsonDb({ ...db, volunteers: kept });
    }
    return removedIds;
  },
};
