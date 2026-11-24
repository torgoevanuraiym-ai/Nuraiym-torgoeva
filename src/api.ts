import {
  AnnouncementItem,
  ApplicationStatus,
  DepartmentId,
  VolunteerApplication,
  VolunteerCertificate,
  VolunteerPastProject,
} from './types';

export class ApiError extends Error {
  status: number;
  code?: string;
  data?: Record<string, any>;

  constructor(status: number, message: string, code?: string, data?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

const ADMIN_TOKEN_KEY = 'jaratman_admin_token';

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {
    // ignore storage restriction
  }
}

const DEFAULT_TIMEOUT_MS = 30_000;

interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
  expectedStatus?: number;
}

async function request<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, expectedStatus, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);
  if (fetchOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getAdminToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timerId = window.setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'same-origin',
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new ApiError(0, 'timeout', 'timeout');
    }
    throw new ApiError(0, 'network_error', 'network_error');
  } finally {
    window.clearTimeout(timerId);
  }

  const rawText = await res.text();
  let data: any = null;
  if (rawText.trim().length > 0) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const code = typeof data?.error === 'string' ? data.error : undefined;
    throw new ApiError(
      res.status,
      code || res.statusText || 'Request failed',
      code,
      data && typeof data === 'object' ? data : undefined
    );
  }

  if (expectedStatus !== undefined && res.status !== expectedStatus) {
    throw new ApiError(res.status, 'unexpected_status', 'unexpected_status');
  }

  if (data === null || typeof data !== 'object') {
    throw new ApiError(res.status, 'invalid_response', 'invalid_response');
  }

  return data as T;
}

export interface SubmitVolunteerPayload {
  fullName: string;
  address: string;
  age: string | number;
  cityOrUniversity?: string;
  occupation?: string;
  department: DepartmentId;
  selfiePhotoUrl: string;
  selfieThumb?: string;
  skills: string[];
  motivation: string;
  availability: string;
  certificates: VolunteerCertificate[];
  pastProjects: VolunteerPastProject[];
  portfolioOrSocial?: string;
  otherOrganizations?: {
    isMember: boolean;
    details?: string;
  };
  consent: boolean;
}

export const api = {
  // Admin Auth
  getAdminSession: () =>
    request<{ authenticated: boolean; configured: boolean }>('/api/admin/session'),

  setupAdminPassword: async (password: string): Promise<{ authenticated: boolean; token?: string }> => {
    const res = await request<{ authenticated: boolean; token?: string }>('/api/admin/setup', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    if (res?.token) {
      setAdminToken(res.token);
    }
    return res;
  },

  loginAdmin: async (password: string): Promise<{ authenticated: boolean; token?: string }> => {
    const res = await request<{ authenticated: boolean; token?: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    if (res?.token) {
      setAdminToken(res.token);
    }
    return res;
  },

  logoutAdmin: async (): Promise<{ authenticated: boolean }> => {
    try {
      return await request<{ authenticated: boolean }>('/api/admin/logout', {
        method: 'POST',
      });
    } finally {
      setAdminToken(null);
    }
  },

  changeAdminPassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ ok: boolean; token?: string }> => {
    const res = await request<{ ok: boolean; token?: string }>('/api/admin/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (res?.token) {
      setAdminToken(res.token);
    }
    return res;
  },

  syncSheets: () =>
    request<{ ok?: boolean; added: number; total?: number; enabled?: boolean }>('/api/admin/sync', {
      method: 'POST',
    }),

  // Volunteers
  submitVolunteer: (payload: SubmitVolunteerPayload) =>
    request<VolunteerApplication>('/api/volunteers', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: 30_000,
      expectedStatus: 201,
    }),

  getVolunteers: async (): Promise<VolunteerApplication[]> => {
    const data = await request<{ volunteers: VolunteerApplication[] }>('/api/volunteers');
    return Array.isArray(data?.volunteers) ? data.volunteers : [];
  },

  updateVolunteer: (id: string, patch: { status?: ApplicationStatus; notes?: string }) =>
    request<VolunteerApplication>(`/api/volunteers/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  deleteVolunteer: (id: string) =>
    request<{ ok: boolean }>(`/api/volunteers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  clearVolunteers: () =>
    request<{ ok: boolean }>('/api/volunteers', {
      method: 'DELETE',
    }),

  // Announcements
  getAnnouncements: async (): Promise<AnnouncementItem[]> => {
    const data = await request<{ announcements: AnnouncementItem[] }>('/api/announcements');
    return Array.isArray(data?.announcements) ? data.announcements : [];
  },

  createAnnouncement: (payload: Omit<AnnouncementItem, 'id'>) =>
    request<AnnouncementItem>('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateAnnouncement: (id: string, patch: Partial<AnnouncementItem>) =>
    request<AnnouncementItem>(`/api/announcements/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  deleteAnnouncement: (id: string) =>
    request<{ ok: boolean }>(`/api/announcements/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  clearAnnouncements: () =>
    request<{ ok: boolean }>('/api/announcements', {
      method: 'DELETE',
    }),
};
