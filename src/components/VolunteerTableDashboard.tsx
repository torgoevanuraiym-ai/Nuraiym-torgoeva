import React from 'react';
import { AdminPanel } from './AdminPanel';
import { VolunteerApplication, ApplicationStatus } from '../types';
import { Language } from '../data/translations';
import { SubmitVolunteerPayload } from '../api';

interface VolunteerTableDashboardProps {
  volunteers: VolunteerApplication[];
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onAddVolunteer: (payload: SubmitVolunteerPayload) => Promise<void> | void;
  onBackToLanding: () => void;
  onOpenApplyForm: () => void;
  lang?: Language;
  onLockSession?: () => void;
}

export const VolunteerTableDashboard: React.FC<VolunteerTableDashboardProps> = ({
  volunteers,
  onUpdateStatus,
  onAddVolunteer,
  onBackToLanding,
  onOpenApplyForm,
  lang = 'ky',
  onLockSession = () => {},
}) => {
  return (
    <AdminPanel
      volunteers={volunteers}
      onUpdateStatus={onUpdateStatus}
      onAddVolunteer={onAddVolunteer}
      onExitAdmin={onBackToLanding}
      onOpenApplyForm={onOpenApplyForm}
      lang={lang}
      onLockSession={onLockSession}
    />
  );
};
