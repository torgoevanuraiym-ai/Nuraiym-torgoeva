import React, { useState, useMemo } from 'react';
import {
  VolunteerApplication,
  ApplicationStatus,
  DepartmentId,
  AnnouncementItem,
} from '../types';
import {
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Share2,
  Check,
  Eye,
  Plus,
  X,
  Smartphone,
  Monitor,
  Award,
  FolderGit2,
  Lock,
  ExternalLink,
  ChevronRight,
  MapPin,
  Megaphone,
  Trash2,
  RefreshCw,
  AlertCircle,
  KeyRound,
  Phone,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';
import { PUBLIC_SHARED_URL } from './ShareModal';
import { AdminAnnouncements } from './AdminAnnouncements';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ApiError, SubmitVolunteerPayload } from '../api';

const DEFAULT_MANUAL_AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#065f46"/><circle cx="100" cy="76" r="34" fill="#a7f3d0"/><path d="M40 175c0-34 27-56 60-56s60 22 60 56" fill="#a7f3d0"/></svg>'
  );

interface AdminPanelProps {
  volunteers: VolunteerApplication[];
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onAddVolunteer: (payload: SubmitVolunteerPayload) => Promise<void> | void;
  onDeleteVolunteer?: (id: string) => void;
  onClearAllVolunteers?: () => void;
  announcements?: AnnouncementItem[];
  onAddAnnouncement?: (item: AnnouncementItem) => void;
  onUpdateAnnouncement?: (id: string, updated: Partial<AnnouncementItem>) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onClearAllAnnouncements?: () => void;
  onExitAdmin: () => void;
  onOpenApplyForm: () => void;
  lang: Language;
  onLockSession: () => void;
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
  onSyncSheets?: () => Promise<{ ok?: boolean; added: number; total?: number; enabled?: boolean }>;
  onRefreshVolunteers?: () => Promise<void> | void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  volunteers,
  onUpdateStatus,
  onAddVolunteer,
  onDeleteVolunteer,
  onClearAllVolunteers,
  announcements = [],
  onAddAnnouncement = () => {},
  onUpdateAnnouncement = () => {},
  onDeleteAnnouncement = () => {},
  onClearAllAnnouncements = () => {},
  onExitAdmin,
  onOpenApplyForm,
  lang,
  onLockSession,
  onChangePassword,
  onSyncSheets,
  onRefreshVolunteers,
}) => {
  const t = TRANSLATIONS[lang].admin;
  const deptList = TRANSLATIONS[lang].departments.items;

  const [activeAdminSection, setActiveAdminSection] = useState<'volunteers' | 'announcements'>('volunteers');
  const [showClearVolunteersModal, setShowClearVolunteersModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [volunteerActionToast, setVolunteerActionToast] = useState<string | null>(null);
  const [volunteerActionToastType, setVolunteerActionToastType] = useState<'success' | 'error'>('success');
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [isRefreshingVolunteers, setIsRefreshingVolunteers] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'interview' | 'accepted' | 'archive'>('all');
  const [activeVolunteerModal, setActiveVolunteerModal] = useState<VolunteerApplication | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'cards' : 'table'
  );
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copyFeedbackMsg, setCopyFeedbackMsg] = useState<string | null>(null);

  // Manual Add Form States
  const [mName, setMName] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mAddress, setMAddress] = useState('');
  const [mDept, setMDept] = useState<DepartmentId>('media_smm');
  const [mPhoto, setMPhoto] = useState('');
  const [mCertTitle, setMCertTitle] = useState('');
  const [mProjectTitle, setMProjectTitle] = useState('');
  const [mMotivation, setMMotivation] = useState('');

  const getDeptTitle = (id: DepartmentId) => {
    const d = deptList.find((item) => item.id === id);
    return d ? d.title : id;
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case 'new':
        return t.stNew;
      case 'interview_scheduled':
        return t.stInterview;
      case 'accepted':
        return t.stAccepted;
      case 'waitlist':
        return t.stWaitlist;
      case 'archived':
        return t.stArchived;
      default:
        return status;
    }
  };

  // Synchronize Tab and Status Dropdown
  const handleTabClick = (tab: 'all' | 'new' | 'interview' | 'accepted' | 'archive') => {
    setActiveTab(tab);
    if (tab === 'all') setSelectedStatus('all');
    else if (tab === 'new') setSelectedStatus('new');
    else if (tab === 'interview') setSelectedStatus('interview_scheduled');
    else if (tab === 'accepted') setSelectedStatus('accepted');
    else if (tab === 'archive') setSelectedStatus('waitlist_or_archive');
  };

  const handleStatusDropdownChange = (val: string) => {
    setSelectedStatus(val);
    if (val === 'all') setActiveTab('all');
    else if (val === 'new') setActiveTab('new');
    else if (val === 'interview_scheduled') setActiveTab('interview');
    else if (val === 'accepted') setActiveTab('accepted');
    else if (val === 'waitlist' || val === 'archived' || val === 'waitlist_or_archive') setActiveTab('archive');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDept('all');
    setSelectedStatus('all');
    setActiveTab('all');
  };

  // Counts
  const totalCount = volunteers.length;
  const newCount = volunteers.filter((v) => v.status === 'new').length;
  const interviewCount = volunteers.filter((v) => v.status === 'interview_scheduled').length;
  const acceptedCount = volunteers.filter((v) => v.status === 'accepted').length;
  const archiveCount = volunteers.filter((v) => v.status === 'waitlist' || v.status === 'archived').length;

  // Filtered Volunteers (Status dropdown + Department + Deep Search)
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((vol) => {
      let matchesStatus = true;
      if (selectedStatus === 'waitlist_or_archive') {
        matchesStatus = vol.status === 'waitlist' || vol.status === 'archived';
      } else if (selectedStatus !== 'all') {
        matchesStatus = vol.status === selectedStatus;
      } else if (activeTab !== 'all') {
        if (activeTab === 'new') matchesStatus = vol.status === 'new';
        else if (activeTab === 'interview') matchesStatus = vol.status === 'interview_scheduled';
        else if (activeTab === 'accepted') matchesStatus = vol.status === 'accepted';
        else if (activeTab === 'archive') matchesStatus = vol.status === 'waitlist' || vol.status === 'archived';
      }

      const matchesDept = selectedDept === 'all' || vol.department === selectedDept;

      const s = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !s ||
        vol.fullName.toLowerCase().includes(s) ||
        (vol.phone && vol.phone.toLowerCase().includes(s)) ||
        vol.address.toLowerCase().includes(s) ||
        vol.id.toLowerCase().includes(s) ||
        (vol.cityOrUniversity && vol.cityOrUniversity.toLowerCase().includes(s)) ||
        (vol.skills && vol.skills.some((sk) => sk.toLowerCase().includes(s))) ||
        vol.certificates.some((c) => c.title.toLowerCase().includes(s) || c.issuer.toLowerCase().includes(s)) ||
        vol.pastProjects.some(
          (p) =>
            p.title.toLowerCase().includes(s) ||
            p.description.toLowerCase().includes(s) ||
            p.role.toLowerCase().includes(s)
        );

      return matchesStatus && matchesDept && matchesSearch;
    });
  }, [volunteers, selectedStatus, activeTab, selectedDept, searchTerm]);

  // Export to CSV for Coordinators (Offline use)
  const handleExportCSV = (exportAll: boolean = false) => {
    const dataToExport = exportAll ? volunteers : filteredVolunteers;
    if (dataToExport.length === 0) return;

    const headers = [
      'ID',
      'Толук аты-жөнү / ФИО',
      'Телефон номери / Телефон',
      'Дареги / Локация',
      'Жашы / Возраст',
      'Чыгармачыл багыты / Направление',
      'Статусу / Статус',
      'Катталган убактысы / Дата подачи',
      'Шыктары / Навыки',
      'Сертификаттары / Сертификаты',
      'Аткарган долбоорлору / Проекты',
      'Башка уюмдарга мүчөлүк / Участие в других проектах',
      'Убакыт бөлүүсү / Доступность',
      'Мотивациясы / Мотивация',
      'Портфолио шилтемеси / Ссылка на портфолио',
    ];

    const rows = dataToExport.map((v) => [
      v.id,
      `"${v.fullName.replace(/"/g, '""')}"`,
      `"${(v.phone || '').replace(/"/g, '""')}"`,
      `"${v.address.replace(/"/g, '""')}"`,
      v.age || '',
      `"${getDeptTitle(v.department)}"`,
      `"${getStatusLabel(v.status)}"`,
      `"${v.submittedAt}"`,
      `"${(v.skills || []).join(', ').replace(/"/g, '""')}"`,
      `"${v.certificates.map((c) => `${c.title} (${c.issuer}, ${c.year})`).join('; ').replace(/"/g, '""')}"`,
      `"${v.pastProjects.map((p) => `${p.title} [Роль: ${p.role}] - ${p.description}`).join('; ').replace(/"/g, '""')}"`,
      `"${v.otherOrganizations ? (v.otherOrganizations.isMember ? `Ооба: ${v.otherOrganizations.details || ''}` : 'Жок') : 'Көрсөтүлгөн эмес'}"`,
      `"${(v.availability || '').replace(/"/g, '""')}"`,
      `"${(v.motivation || '').replace(/"/g, '""')}"`,
      `"${(v.portfolioOrSocial || '').replace(/"/g, '""')}"`,
    ]);

    // Use UTF-8 BOM (\uFEFF) so Excel, LibreOffice, and mobile viewers correctly decode Cyrillic characters
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `Jaratman_Ordo_Volunteers_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccessMsg(
      lang === 'ky'
        ? `✓ ${dataToExport.length} волонтердун маалыматы CSV форматында жүктөлдү! Оффлайн иштөөгө даяр.`
        : lang === 'ru'
        ? `✓ ${dataToExport.length} анкет успешно выгружены в CSV! Файл готов для оффлайн работы.`
        : `✓ ${dataToExport.length} volunteer applications exported to CSV successfully for offline use!`
    );

    setTimeout(() => {
      setExportSuccessMsg(null);
    }, 4500);
  };

  // Export as Native Excel Spreadsheet (.xls with formatted HTML table)
  const handleExportExcel = (exportAll: boolean = false) => {
    const dataToExport = exportAll ? volunteers : filteredVolunteers;
    if (dataToExport.length === 0) {
      setVolunteerActionToast(
        lang === 'ky'
          ? 'Азырынча базада жүктөй турган анкета жок.'
          : 'Пока нет анкет для экспорта.'
      );
      setTimeout(() => setVolunteerActionToast(null), 3500);
      return;
    }

    const esc = (val: unknown) =>
      String(val ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const headers = [
      'ID',
      'Толук аты-жөнү (ФИО)',
      'Телефон номери',
      'Дареги / Локация',
      'Жашы',
      'Чыгармачыл багыты',
      'Статусу',
      'Катталган убактысы',
      'Шыктары',
      'Сертификаттары',
      'Аткарган долбоорлору',
      'Башка уюмдарга мүчөлүк',
      'Убакыт бөлүүсү',
      'Мотивациясы',
      'Портфолио / Байланыш',
    ];

    const xml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Анкеталар</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          th { background-color: #065F46; color: #FFFFFF; font-weight: bold; border: 1px solid #047857; padding: 10px; font-family: Arial, sans-serif; font-size: 13px; }
          td { border: 1px solid #E5E7EB; padding: 8px; font-family: Arial, sans-serif; font-size: 12px; vertical-align: top; }
          .even { background-color: #F9FAFB; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${dataToExport
              .map(
                (v, idx) => `
              <tr class="${idx % 2 === 0 ? '' : 'even'}">
                <td>${esc(v.id)}</td>
                <td><b>${esc(v.fullName)}</b></td>
                <td>${esc(v.phone || '')}</td>
                <td>${esc(v.address)}</td>
                <td>${esc(v.age || '')}</td>
                <td>${esc(getDeptTitle(v.department))}</td>
                <td>${esc(getStatusLabel(v.status))}</td>
                <td>${esc(v.submittedAt)}</td>
                <td>${esc((v.skills || []).join(', '))}</td>
                <td>${esc(v.certificates.map((c) => `${c.title} (${c.issuer}, ${c.year || ''})`).join('; '))}</td>
                <td>${esc(v.pastProjects.map((p) => `${p.title} [${p.role}] - ${p.description}`).join('; '))}</td>
                <td>${esc(v.otherOrganizations ? (v.otherOrganizations.isMember ? `Ооба: ${v.otherOrganizations.details || ''}` : 'Жок') : '-')}</td>
                <td>${esc(v.availability || '')}</td>
                <td>${esc(v.motivation || '')}</td>
                <td>${esc(v.portfolioOrSocial || '')}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `Jaratman_Ordo_Volunteers_${dateStr}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccessMsg(
      lang === 'ky'
        ? `✓ ${dataToExport.length} волонтердун тизмеси Excel (.xls) форматында жүктөлдү!`
        : `✓ ${dataToExport.length} анкет выгружены в Excel (.xls)!`
    );
    setTimeout(() => setExportSuccessMsg(null), 4500);
  };

  // Shareable URL for Coordinators
  const shareableUrl =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.origin
      : PUBLIC_SHARED_URL;

  const handleCopyShareableLink = async () => {
    const urlToCopy = shareableUrl;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(urlToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = urlToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLink(true);
      setCopyFeedbackMsg(
        lang === 'ky'
          ? '✓ Сайттын шилтемеси алмашуу буферине көчүрүлдү!'
          : lang === 'ru'
          ? '✓ Ссылка на сайт скопирована в буфер обмена!'
          : '✓ Shareable application link copied to clipboard!'
      );
      setTimeout(() => {
        setCopiedLink(false);
      }, 2500);
      setTimeout(() => {
        setCopyFeedbackMsg(null);
      }, 4000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSyncSheetsClick = async () => {
    if (!onSyncSheets || isSyncingSheets) return;
    setIsSyncingSheets(true);
    setVolunteerActionToast(null);
    try {
      const res = await onSyncSheets();
      if (!res || typeof res.added !== 'number') {
        setVolunteerActionToastType('error');
        setVolunteerActionToast(
          lang === 'ky'
            ? 'Сервер бош жооп кайтарды, кайра аракет кылып көрүңүз.'
            : lang === 'ru'
            ? 'Сервер вернул пустой ответ, попробуйте ещё раз.'
            : 'The server returned an empty response, please try again.'
        );
        return;
      }

      setVolunteerActionToastType('success');
      if (res.added === 0) {
        setVolunteerActionToast(
          lang === 'ky'
            ? '✓ Жаңы анкеталар жок'
            : lang === 'ru'
            ? '✓ Новых анкет нет'
            : '✓ No new applications'
        );
      } else {
        setVolunteerActionToast(
          lang === 'ky'
            ? `✓ Кошулду: ${res.added} анкета (Google Таблица)`
            : lang === 'ru'
            ? `✓ Добавлено ${res.added} анкет`
            : `✓ Added ${res.added} applications`
        );
      }
      setTimeout(() => setVolunteerActionToast(null), 5000);
    } catch (err) {
      setVolunteerActionToastType('error');
      const code = err instanceof ApiError ? err.code : undefined;
      const data = err instanceof ApiError ? err.data : undefined;

      if (code === 'invalid_response') {
        setVolunteerActionToast(
          lang === 'ky'
            ? 'Сервер бош жооп кайтарды, кайра аракет кылып көрүңүз.'
            : lang === 'ru'
            ? 'Сервер вернул пустой ответ, попробуйте ещё раз.'
            : 'The server returned an empty response, please try again.'
        );
      } else if (code === 'sheets_not_configured') {
        const missingList =
          Array.isArray(data?.missingVars) && data.missingVars.length > 0
            ? data.missingVars.join(' / ')
            : 'GOOGLE_SERVICE_ACCOUNT_B64 / GOOGLE_SHEET_ID';
        setVolunteerActionToast(
          lang === 'ky'
            ? `Google Таблица туташтырылган эмес: секреттер берилген эмес (${missingList}).`
            : lang === 'ru'
            ? `Google Таблица не настроена: не заданы секреты (${missingList}).`
            : `Google Sheets is not configured: missing secrets (${missingList}).`
        );
      } else if (code === 'sheets_invalid_key') {
        setVolunteerActionToast(
          lang === 'ky'
            ? 'Ачкычты декоддоо катасы (GOOGLE_SERVICE_ACCOUNT_B64): туура эмес base64 же сервистик аккаунттун JSON файлы.'
            : lang === 'ru'
            ? 'Ошибка декодирования ключа (GOOGLE_SERVICE_ACCOUNT_B64): некорректный base64 или JSON сервисного аккаунта.'
            : 'Key decoding error (GOOGLE_SERVICE_ACCOUNT_B64): invalid base64 or service account JSON.'
        );
      } else if (code === 'sheets_forbidden') {
        const email =
          typeof data?.clientEmail === 'string' && data.clientEmail
            ? data.clientEmail
            : 'service-account';
        setVolunteerActionToast(
          lang === 'ky'
            ? `Google Таблицага кирүүгө уруксат жок (403). Таблицага Редактор укугун бул аккаунтка ачыңыз: ${email}`
            : lang === 'ru'
            ? `Нет доступа к Google Таблице (403). Откройте доступ к таблице (Редактор) для сервисного аккаунта: ${email}`
            : `Access denied to Google Sheet (403). Share the spreadsheet (Editor) with: ${email}`
        );
      } else if (code === 'sheets_not_found') {
        setVolunteerActionToast(
          lang === 'ky'
            ? 'Google Таблица табылган жок (404). GOOGLE_SHEET_ID маанисин текшериңиз.'
            : lang === 'ru'
            ? 'Таблица не найдена (404). Проверьте правильность GOOGLE_SHEET_ID.'
            : 'Google Sheet not found (404). Verify GOOGLE_SHEET_ID.'
        );
      } else {
        const gStatus = data?.googleStatus ?? (err instanceof ApiError ? err.status : '');
        const gMsg =
          typeof data?.googleMessage === 'string' && data.googleMessage
            ? data.googleMessage
            : err instanceof Error
            ? err.message
            : 'Unknown error';
        setVolunteerActionToast(
          lang === 'ky'
            ? `Google Таблица катасы (${gStatus || 'error'}): ${gMsg}`
            : lang === 'ru'
            ? `Ошибка синхронизации с Google Таблицей (${gStatus || 'error'}): ${gMsg}`
            : `Google Sheets sync error (${gStatus || 'error'}): ${gMsg}`
        );
      }
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName.trim() || !mAddress.trim()) return;

    const photoDataUrl =
      mPhoto.trim().startsWith('data:image/') ? mPhoto.trim() : DEFAULT_MANUAL_AVATAR;

    const payload: SubmitVolunteerPayload = {
      fullName: mName.trim(),
      phone: mPhone.trim() || undefined,
      address: mAddress.trim(),
      age: '20',
      cityOrUniversity: mAddress.trim(),
      department: mDept,
      selfiePhotoUrl: photoDataUrl,
      skills: ['Чыгармачыл демилге'],
      motivation: mMotivation.trim() || 'Координатор тарабынан түз киргизилди.',
      availability: 'Аптасына 10 саат',
      certificates: mCertTitle
        ? [{ id: '1', title: mCertTitle, issuer: 'Координатор тастыктаган', year: '2025' }]
        : [{ id: '1', title: 'Базалык чыгармачыл сертификат', issuer: 'Окуу жайы', year: '2025' }],
      pastProjects: mProjectTitle
        ? [{ id: '1', title: mProjectTitle, role: 'Катышуучу', description: 'Тажрыйбасы бар' }]
        : [{ id: '1', title: '«Жаштар чыгармачыл иш-чарасы»', role: 'Ыктыярчы', description: 'Уюштуруу тажрыйбасы' }],
      consent: true,
    };

    await onAddVolunteer(payload);
    setShowAddModal(false);
    setMName('');
    setMPhone('');
    setMAddress('');
    setMPhoto('');
    setMCertTitle('');
    setMProjectTitle('');
    setMMotivation('');
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'interview_scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'accepted':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      case 'waitlist':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'archived':
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case 'new':
        return t.stNew;
      case 'interview_scheduled':
        return t.stInterview;
      case 'accepted':
        return t.stAccepted;
      case 'waitlist':
        return t.stWaitlist;
      case 'archived':
        return t.stArchived;
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/90 text-stone-900 pb-16">
      {/* Top Admin Navigation Bar */}
      <div className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-emerald-400 to-teal-300 shadow overflow-hidden shrink-0">
              <img
                src="/assets/aistudio/_________56eb9da0.jpeg"
                alt="Жаратман Ордо"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base font-display">
                  {t.title}
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                  {t.badge}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* View layout toggle */}
            <div className="hidden sm:flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700 text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-stone-700 text-white font-medium' : 'text-stone-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>{t.viewTable}</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-stone-700 text-white font-medium' : 'text-stone-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t.viewCards}</span>
              </button>
            </div>

            {/* Copy Shareable Link button */}
            <button
              onClick={handleCopyShareableLink}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                copiedLink
                  ? 'bg-emerald-600 border-emerald-500 text-white ring-1 ring-emerald-400'
                  : 'bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white border-stone-700'
              }`}
              title={shareableUrl}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>{t.shareableLinkCopied}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.copyShareableLink}</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (volunteers.length === 0) {
                  setVolunteerActionToast(
                    lang === 'ky'
                      ? 'Азырынча базада жүктөй турган анкета жок. Жаңы анкеталар түшкөндө Excel / CSV форматында жүктөлүп берилет.'
                      : 'Пока нет анкет для экспорта в Excel.'
                  );
                  setTimeout(() => setVolunteerActionToast(null), 3500);
                  return;
                }
                setShowExportModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer ring-1 ring-emerald-400/40"
              title="Excel же CSV форматында жүктөө"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
              <span>Excel / CSV</span>
              <span className="bg-emerald-800 text-emerald-100 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                {volunteers.length}
              </span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.addBtn}</span>
            </button>

            {/* Change Password / Lock / Exit buttons */}
            {onChangePassword && (
              <button
                type="button"
                onClick={() => setShowChangePasswordModal(true)}
                className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-emerald-300 text-xs font-semibold border border-stone-700 flex items-center gap-1 cursor-pointer"
                title={
                  lang === 'ky'
                    ? 'Сырсөздү өзгөртүү'
                    : lang === 'ru'
                    ? 'Сменить пароль'
                    : 'Change password'
                }
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">
                  {lang === 'ky' ? 'Сырсөз' : lang === 'ru' ? 'Пароль' : 'Password'}
                </span>
              </button>
            )}

            <button
              onClick={onLockSession}
              className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-red-950/60 text-stone-300 hover:text-red-300 text-xs font-semibold border border-stone-700 flex items-center gap-1 cursor-pointer"
              title={t.lockBtn}
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.lockBtn}</span>
            </button>

            <button
              onClick={onExitAdmin}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold border border-stone-700 cursor-pointer"
            >
              {t.exitBtn} →
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Copy Link Feedback Banner */}
        {copyFeedbackMsg && (
          <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-800 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-semibold">{copyFeedbackMsg}</span>
                <span className="font-mono text-[11px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md break-all">
                  {shareableUrl}
                </span>
              </div>
            </div>
            <button
              onClick={() => setCopyFeedbackMsg(null)}
              className="p-1 rounded-lg hover:bg-emerald-200/50 text-emerald-800 cursor-pointer text-xs font-bold"
              title="Жабуу"
            >
              ✕
            </button>
          </div>
        )}

        {/* Export Success Notification Banner */}
        {exportSuccessMsg && (
          <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-800 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{exportSuccessMsg}</span>
            </div>
            <button
              onClick={() => setExportSuccessMsg(null)}
              className="p-1 rounded-lg hover:bg-emerald-200/50 text-emerald-800 cursor-pointer text-xs font-bold"
              title="Жабуу"
            >
              ✕
            </button>
          </div>
        )}

        {/* Volunteer Action Toast Banner */}
        {volunteerActionToast && (
          <div
            role="alert"
            className={`mb-4 p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-lg animate-in fade-in ${
              volunteerActionToastType === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {volunteerActionToastType === 'error' ? (
                <AlertCircle className="w-5 h-5 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              )}
              <span className="break-words select-all">{volunteerActionToast}</span>
            </div>
            <button
              onClick={() => setVolunteerActionToast(null)}
              className={`p-1 rounded-lg shrink-0 cursor-pointer ${
                volunteerActionToastType === 'error' ? 'hover:bg-red-700' : 'hover:bg-emerald-700'
              }`}
            >
              ✕
            </button>
          </div>
        )}

        {/* TOP LEVEL ADMIN SECTION SWITCHER */}
        <div className="flex items-center gap-2.5 mb-6 border-b border-stone-200 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveAdminSection('volunteers')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs ${
              activeAdminSection === 'volunteers'
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            <span>📋 Волонтерлордун анкеталары</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeAdminSection === 'volunteers'
                  ? 'bg-emerald-500 text-stone-950 font-black'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              {volunteers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminSection('announcements')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs ${
              activeAdminSection === 'announcements'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-stone-600 hover:text-emerald-700 border border-stone-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>📢 Жаңылыктар жана Жарыялар</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeAdminSection === 'announcements'
                  ? 'bg-emerald-900 text-emerald-100'
                  : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              {announcements.length}
            </span>
          </button>
        </div>

        {activeAdminSection === 'announcements' ? (
          <AdminAnnouncements
            announcements={announcements}
            onAddAnnouncement={onAddAnnouncement}
            onUpdateAnnouncement={onUpdateAnnouncement}
            onDeleteAnnouncement={onDeleteAnnouncement}
            onClearAllAnnouncements={onClearAllAnnouncements}
            lang={lang}
          />
        ) : (
          <>
            {/* KPI Counter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <button
            onClick={() => handleTabClick('all')}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-600'
                : 'bg-white border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="text-[11px] font-semibold text-stone-500 uppercase">{t.allTab}</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900 mt-0.5">
              {totalCount}
            </div>
          </button>

          <button
            onClick={() => handleTabClick('new')}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600'
                : 'bg-white border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="text-[11px] font-semibold text-blue-700 uppercase">{t.newTab}</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-blue-800 mt-0.5">
              {newCount}
            </div>
          </button>

          <button
            onClick={() => handleTabClick('interview')}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === 'interview'
                ? 'bg-white border-amber-600 shadow-sm ring-1 ring-amber-600'
                : 'bg-white border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="text-[11px] font-semibold text-amber-700 uppercase">{t.interviewTab}</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-800 mt-0.5">
              {interviewCount}
            </div>
          </button>

          <button
            onClick={() => handleTabClick('accepted')}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === 'accepted'
                ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-600'
                : 'bg-white border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="text-[11px] font-semibold text-emerald-700 uppercase">{t.acceptedTab}</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-800 mt-0.5">
              {acceptedCount}
            </div>
          </button>

          <button
            onClick={() => handleTabClick('archive')}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all col-span-2 sm:col-span-1 cursor-pointer ${
              activeTab === 'archive'
                ? 'bg-white border-purple-600 shadow-sm ring-1 ring-purple-600'
                : 'bg-white border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="text-[11px] font-semibold text-purple-700 uppercase">{t.archiveTab}</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-purple-800 mt-0.5">
              {archiveCount}
            </div>
          </button>
        </div>

        {/* Filter and Search Bar with Status Filter Dropdown */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-sm mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
                title="Тазалоо"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns & Export Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 1. Status Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 focus-within:border-emerald-600 focus-within:bg-white transition-all">
              <CheckCircle2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusDropdownChange(e.target.value)}
                className="bg-transparent text-xs font-medium text-stone-800 focus:outline-none cursor-pointer pr-1"
                aria-label={t.statusFilterLabel}
              >
                <option value="all">{t.allStatuses}</option>
                <option value="new">{t.stNew}</option>
                <option value="interview_scheduled">{t.stInterview}</option>
                <option value="accepted">{t.stAccepted}</option>
                <option value="waitlist">{t.stWaitlist}</option>
                <option value="archived">{t.stArchived}</option>
              </select>
            </div>

            {/* 2. Department Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 focus-within:border-emerald-600 focus-within:bg-white transition-all">
              <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-transparent text-xs font-medium text-stone-800 focus:outline-none cursor-pointer pr-1 max-w-[170px] truncate"
              >
                <option value="all">{t.allDepts}</option>
                {deptList.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters button if any filter is active */}
            {(searchTerm || selectedStatus !== 'all' || selectedDept !== 'all' || activeTab !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Фильтрлерди баштапкы абалга келтирүү"
              >
                <X className="w-3 h-3" />
                <span className="hidden sm:inline">
                  {lang === 'ky' ? 'Тазалоо' : lang === 'ru' ? 'Сброс' : 'Reset'}
                </span>
              </button>
            )}

            {/* Direct Export to Excel / CSV Button in Toolbar */}
            <button
              onClick={() => {
                if (volunteers.length === 0) {
                  setVolunteerActionToast(
                    lang === 'ky'
                      ? 'Азырынча базада жүктөй турган анкета жок. Жаңы анкеталар түшкөндө Excel / CSV форматында жүктөлүп берилет.'
                      : 'Пока нет анкет для экспорта в Excel.'
                  );
                  setTimeout(() => setVolunteerActionToast(null), 3500);
                  return;
                }
                setShowExportModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-xs"
              title="Excel же CSV форматында жүктөө"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Excel / CSV жүктөө</span>
              <span className="bg-emerald-800 text-emerald-100 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                {filteredVolunteers.length}
              </span>
            </button>

            {/* Copy Shareable Link Button in Toolbar */}
            <button
              onClick={handleCopyShareableLink}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                copiedLink
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title={shareableUrl}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span className="text-white font-bold">{t.shareableLinkCopied}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.copyShareableLink}</span>
                </>
              )}
            </button>

            {/* Clear All Applications Button in Toolbar */}
            {volunteers.length > 0 && onClearAllVolunteers && (
              <button
                type="button"
                onClick={() => setShowClearVolunteersModal(true)}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-xs"
                title="Бардык түшкөн анкеталарды өчүрүү / тазалоо"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'ky' ? 'Анкеталарды тазалоо' : lang === 'ru' ? 'Очистить анкеты' : 'Clear All'}</span>
              </button>
            )}

            {/* Manual Refresh Volunteers Button */}
            {onRefreshVolunteers && (
              <button
                type="button"
                disabled={isRefreshingVolunteers}
                onClick={async () => {
                  if (isRefreshingVolunteers) return;
                  setIsRefreshingVolunteers(true);
                  try {
                    await onRefreshVolunteers();
                  } finally {
                    setIsRefreshingVolunteers(false);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-xs disabled:opacity-60"
                title={lang === 'ky' ? 'Анкеталарды жаңыртуу' : lang === 'ru' ? 'Обновить список анкет' : 'Refresh applications'}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshingVolunteers ? 'animate-spin' : ''}`} />
                <span>{lang === 'ky' ? 'Жаңыртуу' : lang === 'ru' ? 'Обновить' : 'Refresh'}</span>
              </button>
            )}

            {/* Google Sheets Sync Button */}
            {onSyncSheets && (
              <button
                type="button"
                disabled={isSyncingSheets}
                onClick={handleSyncSheetsClick}
                className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-emerald-300 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-xs disabled:opacity-60"
                title="Синхронизировать с Google Таблицей"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                <span>Синхронизировать с Google Таблицей</span>
              </button>
            )}
          </div>

          {/* Mobile view switch buttons */}
          <div className="flex sm:hidden items-center justify-between pt-1 border-t border-stone-100">
            <span className="text-xs text-stone-500 font-medium">Көрүнүш:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  viewMode === 'cards' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                {t.viewCards}
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  viewMode === 'table' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                {t.viewTable}
              </button>
            </div>
          </div>
        </div>

        {/* 1. TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[11px] tracking-wider font-semibold">
                    <th className="py-3 px-3 text-center">{t.colPhoto}</th>
                    <th className="py-3 px-3">{t.colCandidate}</th>
                    <th className="py-3 px-3">{t.colDept}</th>
                    <th className="py-3 px-3">{t.colAddress}</th>
                    <th className="py-3 px-3">{t.colCerts}</th>
                    <th className="py-3 px-3">{t.colProjects}</th>
                    <th className="py-3 px-3">{t.colStatus}</th>
                    <th className="py-3 px-3 text-right">{t.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredVolunteers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-400">
                        {lang === 'ky' ? 'Талапкер табылган жок.' : 'No candidates found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredVolunteers.map((vol) => (
                      <tr key={vol.id} className="hover:bg-emerald-50/40 transition-colors">
                        {/* Live Photo Thumbnail */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="w-12 h-12 rounded-xl border border-stone-300 overflow-hidden mx-auto bg-stone-200 shadow-sm shrink-0">
                            {vol.selfiePhotoUrl || vol.photo3x4Url ? (
                              <img
                                src={vol.selfiePhotoUrl || vol.photo3x4Url}
                                alt={vol.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-stone-400">
                                Сүрөт
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Name, ID & Phone */}
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-stone-900">{vol.fullName}</div>
                          <div className="text-[11px] text-stone-400 font-mono">
                            {vol.id} · {vol.age} жашта
                          </div>
                          {vol.phone && (
                            <div className="text-[11px] text-emerald-800 font-mono font-semibold flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{vol.phone}</span>
                            </div>
                          )}
                        </td>

                        {/* Department */}
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-emerald-950">
                            {getDeptTitle(vol.department)}
                          </span>
                        </td>

                        {/* Address (kept and emphasized) */}
                        <td className="py-2.5 px-3 text-stone-700 text-xs max-w-xs truncate">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{vol.address}</span>
                          </span>
                        </td>

                        {/* Certificates */}
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 text-xs text-stone-700 bg-stone-100 px-2 py-0.5 rounded font-medium">
                            <Award className="w-3 h-3 text-emerald-700" />
                            <span>{vol.certificates.length}</span>
                          </span>
                        </td>

                        {/* Projects */}
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 text-xs text-stone-700 bg-stone-100 px-2 py-0.5 rounded font-medium">
                            <FolderGit2 className="w-3 h-3 text-emerald-700" />
                            <span>{vol.pastProjects.length}</span>
                          </span>
                        </td>

                        {/* Status Select */}
                        <td className="py-2.5 px-3">
                          <select
                            value={vol.status}
                            onChange={(e) =>
                              onUpdateStatus(vol.id, e.target.value as ApplicationStatus)
                            }
                            className={`text-xs rounded-lg px-2 py-1 font-semibold border focus:outline-none cursor-pointer ${getStatusColor(
                              vol.status
                            )}`}
                          >
                            <option value="new">{t.stNew}</option>
                            <option value="interview_scheduled">{t.stInterview}</option>
                            <option value="accepted">{t.stAccepted}</option>
                            <option value="waitlist">{t.stWaitlist}</option>
                            <option value="archived">{t.stArchived}</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActiveVolunteerModal(vol)}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 transition-colors cursor-pointer"
                              title="Толук анкетаны ачуу"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {onDeleteVolunteer && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`${vol.fullName} талапкеринин анкетасын өчүрүүнү каалайсызбы?`)) {
                                    onDeleteVolunteer(vol.id);
                                    setVolunteerActionToast(`✓ ${vol.fullName} талапкеринин анкетасы өчүрүлдү.`);
                                    setTimeout(() => setVolunteerActionToast(null), 3500);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-100 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Анкетаны өчүрүү"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <div>
                Табылган талапкерлер: <span className="font-bold text-stone-800">{filteredVolunteers.length}</span> / {volunteers.length}
              </div>
              <div className="font-mono text-[11px]">«Жаратман Ордо» маалымат базасы</div>
            </div>
          </div>
        )}

        {/* 2. CARDS VIEW (Optimized for Mobile Smartphones) */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredVolunteers.length === 0 ? (
              <div className="col-span-full py-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
                {lang === 'ky' ? 'Талапкер табылган жок.' : 'No candidates found.'}
              </div>
            ) : (
              filteredVolunteers.map((vol) => (
                <div
                  key={vol.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Live Photo */}
                      <div className="w-14 h-14 rounded-xl border border-stone-300 overflow-hidden bg-stone-200 shrink-0 shadow-sm">
                        {vol.selfiePhotoUrl || vol.photo3x4Url ? (
                          <img
                            src={vol.selfiePhotoUrl || vol.photo3x4Url}
                            alt={vol.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">
                            Сүрөт
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-semibold text-stone-400">
                            {vol.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(
                              vol.status
                            )}`}
                          >
                            {getStatusText(vol.status)}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-stone-900 font-display truncate mt-0.5">
                          {vol.fullName}
                        </h4>
                        <div className="text-xs font-semibold text-emerald-800 mt-0.5">
                          {getDeptTitle(vol.department)}
                        </div>
                        <div className="text-xs text-stone-600 truncate mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{vol.address}</span>
                        </div>
                        {vol.phone && (
                          <div className="text-xs text-emerald-800 font-mono font-semibold truncate mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{vol.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-stone-100 my-2">
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Award className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{vol.certificates.length} {lang === 'ky' ? 'сертификат' : 'certs'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <FolderGit2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{vol.pastProjects.length} {lang === 'ky' ? 'долбоор' : 'projects'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setActiveVolunteerModal(vol)}
                      className="flex-1 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>{t.colActions}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteVolunteer && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`${vol.fullName} талапкеринин анкетасын өчүрүүнү каалайсызбы?`)) {
                            onDeleteVolunteer(vol.id);
                            setVolunteerActionToast(`✓ ${vol.fullName} талапкеринин анкетасы өчүрүлдү.`);
                            setTimeout(() => setVolunteerActionToast(null), 3500);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Өчүрүү"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
          </>
        )}
      </div>

      {/* FULL CANDIDATE INSPECTION MODAL */}
      {activeVolunteerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 space-y-6 my-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4 border-stone-200">
              <div className="flex items-center gap-4">
                <div className="w-22 h-22 sm:w-28 sm:h-28 rounded-2xl border-2 border-emerald-600/70 overflow-hidden bg-stone-200 shrink-0 shadow-md">
                  {activeVolunteerModal.selfiePhotoUrl || activeVolunteerModal.photo3x4Url ? (
                    <img
                      src={activeVolunteerModal.selfiePhotoUrl || activeVolunteerModal.photo3x4Url}
                      alt={activeVolunteerModal.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                      Сүрөт
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-mono text-stone-400">
                    ID: {activeVolunteerModal.id}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-display">
                    {activeVolunteerModal.fullName}
                  </h3>
                  <div className="text-xs sm:text-sm font-semibold text-emerald-800 mt-1">
                    {getDeptTitle(activeVolunteerModal.department)}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {activeVolunteerModal.age} жашта
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveVolunteerModal(null)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Phone & Address Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
                <span className="text-stone-500 block font-medium flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Телефон номери (WhatsApp):</span>
                </span>
                {activeVolunteerModal.phone ? (
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <a
                      href={`tel:${activeVolunteerModal.phone.replace(/[^\d+]/g, '')}`}
                      className="text-stone-900 font-bold font-mono text-sm hover:text-emerald-700"
                    >
                      {activeVolunteerModal.phone}
                    </a>
                    {activeVolunteerModal.phone.replace(/\D/g, '').length >= 7 && (
                      <a
                        href={`https://wa.me/${activeVolunteerModal.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-stone-400">Көрсөтүлгөн эмес</span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                <span className="text-stone-400 block font-medium flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Дареги / Окуу жайы:</span>
                </span>
                <span className="text-stone-900 font-semibold text-sm">
                  {activeVolunteerModal.address}
                </span>
              </div>
            </div>

            {/* Section: Certificates (Mandatory) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Тиркелген сертификаттары ({activeVolunteerModal.certificates.length})</span>
              </div>
              <div className="space-y-2">
                {activeVolunteerModal.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900">{cert.title}</div>
                      <div className="text-stone-500 mt-0.5">
                        {cert.issuer} {cert.year && `· ${cert.year}-жыл`}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Текшерилди ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Past Projects (Mandatory) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <FolderGit2 className="w-4 h-4 text-emerald-700" />
                <span>Буга чейин аткарган долбоорлору ({activeVolunteerModal.pastProjects.length})</span>
              </div>
              <div className="space-y-2.5">
                {activeVolunteerModal.pastProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm">{p.title}</span>
                      <span className="text-[11px] font-semibold text-stone-600 bg-stone-200 px-2 py-0.5 rounded">
                        Ролу: {p.role}
                      </span>
                    </div>
                    <p className="text-stone-700 leading-relaxed">{p.description}</p>
                    {p.result && (
                      <div className="text-emerald-800 font-medium">
                        Натыйжасы: {p.result}
                      </div>
                    )}
                    {p.link && (
                      <a
                        href={p.link.startsWith('http') ? p.link : `https://${p.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:underline pt-1"
                      >
                        <span>Долбоордун далили / Шилтеме</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Motivation & Skills */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Мотивациясы жана максаты
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700 leading-relaxed">
                {activeVolunteerModal.motivation}
              </div>
            </div>

            {/* Section: Other Organizations Participation */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Башка долбоорлордо же жаштар уюмдарында мүчөлүк
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs sm:text-sm text-stone-800">
                {activeVolunteerModal.otherOrganizations ? (
                  activeVolunteerModal.otherOrganizations.isMember ? (
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs">
                        Ооба, башка долбоордо/уюмда катышат
                      </span>
                      <p className="text-stone-900 font-semibold mt-1">
                        {activeVolunteerModal.otherOrganizations.details || 'Катышуусу көрсөтүлгөн'}
                      </p>
                    </div>
                  ) : (
                    <span className="text-stone-700 font-medium">
                      Жок, башка уюмдарда же долбоорлордо мүчө эмес (гана «Жаратман Ордо»).
                    </span>
                  )
                ) : (
                  <span className="text-stone-500">Көрсөтүлгөн эмес</span>
                )}
              </div>
            </div>

            {/* Status Change in Modal */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-600">{t.statusLabel}</span>
                <select
                  value={activeVolunteerModal.status}
                  onChange={(e) => {
                    const st = e.target.value as ApplicationStatus;
                    onUpdateStatus(activeVolunteerModal.id, st);
                    setActiveVolunteerModal({
                      ...activeVolunteerModal,
                      status: st,
                    });
                  }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer ${getStatusColor(
                    activeVolunteerModal.status
                  )}`}
                >
                  <option value="new">{t.stNew}</option>
                  <option value="interview_scheduled">{t.stInterview}</option>
                  <option value="accepted">{t.stAccepted}</option>
                  <option value="waitlist">{t.stWaitlist}</option>
                  <option value="archived">{t.stArchived}</option>
                </select>
              </div>

              {onDeleteVolunteer && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`${activeVolunteerModal.fullName} талапкеринин анкетасын өчүрүүнү каалайсызбы?`)) {
                      onDeleteVolunteer(activeVolunteerModal.id);
                      setActiveVolunteerModal(null);
                      setVolunteerActionToast(`✓ ${activeVolunteerModal.fullName} талапкеринин анкетасы өчүрүлдү.`);
                      setTimeout(() => setVolunteerActionToast(null), 3500);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Анкетаны өчүрүү</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ADD VOLUNTEER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-6">
            <div className="flex items-center justify-between border-b pb-3 border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 font-display">
                {t.addBtn}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-stone-400 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Аты-жөнү *</label>
                <input
                  type="text"
                  required
                  placeholder="Элдар Азизов"
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Телефон номери (WhatsApp)</label>
                <input
                  type="tel"
                  placeholder="+996 700 123 456"
                  value={mPhone}
                  onChange={(e) => setMPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Дареги (Шаары, көчөсү же окуу жайы) *</label>
                <input
                  type="text"
                  required
                  placeholder="Бишкек ш., 7-кичи район же КУУ"
                  value={mAddress}
                  onChange={(e) => setMAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Багыты</label>
                <select
                  value={mDept}
                  onChange={(e) => setMDept(e.target.value as DepartmentId)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 bg-white cursor-pointer"
                >
                  {deptList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Сертификаты</label>
                <input
                  type="text"
                  placeholder="Мобилография Pro сертификаты"
                  value={mCertTitle}
                  onChange={(e) => setMCertTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Аткарган долбоору</label>
                <input
                  type="text"
                  placeholder="Студенттик арт-көргөзмө"
                  value={mProjectTitle}
                  onChange={(e) => setMProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Кыскача маалымат</label>
                <textarea
                  rows={2}
                  placeholder="Талапкер жөнүндө маалымат..."
                  value={mMotivation}
                  onChange={(e) => setMMotivation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold cursor-pointer"
                >
                  Жокко чыгаруу
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  Сактоо
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLEAR ALL VOLUNTEERS CONFIRMATION MODAL */}
      {showClearVolunteersModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-900 font-display">
              Бардык анкеталарды өчүрүүнү каалайсызбы?
            </h4>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              Бул аракет базадагы бардык {volunteers.length} волонтердун анкетасын толук өчүрөт.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowClearVolunteersModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Жокко чыгаруу
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllVolunteers?.();
                  setShowClearVolunteersModal(false);
                  setVolunteerActionToast('✓ Бардык анкеталар ийгиликтүү тазаланды.');
                  setTimeout(() => setVolunteerActionToast(null), 3500);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shadow"
              >
                Ооба, бардыгын өчүрүү
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT TO EXCEL / CSV MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-200">
            <div className="flex items-center justify-between border-b pb-3.5 border-stone-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 font-display">
                    {lang === 'ky' ? 'Анкеталарды Excel же CSVге жүктөө' : 'Экспорт анкет в Excel / CSV'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {lang === 'ky' ? 'Оффлайн колдонуу же архив үчүн файл түрүндө сактоо' : 'Для оффлайн работы и отчётов'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scope Selection */}
            <div className="mb-5 bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <span className="block text-xs font-bold text-stone-700 mb-2">
                {lang === 'ky' ? 'Жүктөлүүчү анкеталардын көлөмү:' : 'Объём выгрузки:'}
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  exportScope === 'all'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500'
                    : 'bg-white border-stone-200 text-stone-700'
                }`}>
                  <input
                    type="radio"
                    name="exportScope"
                    checked={exportScope === 'all'}
                    onChange={() => setExportScope('all')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Бардык анкеталар ({volunteers.length})</span>
                </label>

                <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  exportScope === 'filtered'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500'
                    : 'bg-white border-stone-200 text-stone-700'
                }`}>
                  <input
                    type="radio"
                    name="exportScope"
                    checked={exportScope === 'filtered'}
                    onChange={() => setExportScope('filtered')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Фильтрленген гана ({filteredVolunteers.length})</span>
                </label>
              </div>
            </div>

            {/* Export Format Options */}
            <div className="space-y-3 mb-5">
              {/* Option 1: Microsoft Excel */}
              <button
                type="button"
                onClick={() => {
                  handleExportExcel(exportScope === 'all');
                  setShowExportModal(false);
                }}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white text-left flex items-start gap-3.5 shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Microsoft Excel (.xls)</span>
                    <span className="text-[10px] bg-emerald-900/80 text-emerald-200 font-mono px-2 py-0.5 rounded-md">
                      Сунушталат ★
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                    Түстүү баш саптары, өзүнчө колонкалар жана кыргыз ариптери менен дароо Excelде ачылат.
                  </p>
                </div>
              </button>

              {/* Option 2: CSV */}
              <button
                type="button"
                onClick={() => {
                  handleExportCSV(exportScope === 'all');
                  setShowExportModal(false);
                }}
                className="w-full p-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-left flex items-start gap-3.5 shadow-xs transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Download className="w-5 h-5 text-stone-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">CSV файлы (.csv)</span>
                    <span className="text-[10px] bg-stone-100 text-stone-600 font-mono px-2 py-0.5 rounded-md">
                      Универсалдуу
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    Google Sheets, мобилдик телефондор жана бардык таблица программалары үчүн.
                  </p>
                </div>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                {lang === 'ky' ? 'Жабуу' : 'Закрыть'}
              </button>
            </div>
          </div>
        </div>
      )}

      {onChangePassword && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          lang={lang}
          onSubmit={onChangePassword}
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}
    </div>
  );
};
