export type DepartmentId = 'media_smm' | 'event_mgmt' | 'art_culture' | 'projects_grants' | 'pr_outreach';

export type ApplicationStatus = 'new' | 'interview_scheduled' | 'accepted' | 'waitlist' | 'archived';

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

export interface VolunteerApplication {
  id: string; // e.g. JO-2026-1042
  fullName: string;
  address: string; // Дареги, шаары же жашаган жери
  age: number | string;
  cityOrUniversity?: string;
  occupation?: string;
  department: DepartmentId;
  selfiePhotoUrl: string; // Түз камерадан тартылган өзүнүн сүрөтү (селфи)
  selfieThumb?: string; // 240px миниатюра для резервной копии
  photo3x4Url?: string; // fallback / alias
  skills: string[];
  motivation: string;
  availability: string;
  certificates: VolunteerCertificate[];
  pastProjects: VolunteerPastProject[];
  portfolioOrSocial?: string;
  instagramHandle?: string;
  otherOrganizations?: {
    isMember: boolean;
    details?: string;
  };
  phone?: string; // removed from input
  email?: string; // removed from input
  status: ApplicationStatus;
  submittedAt: string;
  notes?: string;
  confirmationSentAt: string;
  consent?: boolean;
  consentAt?: string;
}

export interface DepartmentInfo {
  id: DepartmentId;
  title: string;
  shortDesc: string;
  fullDesc: string;
  roles: string[];
  requiredSkills: string[];
  quota: string;
  accent: string;
}

export type AnnouncementCategory = 'urgent' | 'event' | 'project' | 'news';

export interface AnnouncementItem {
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

