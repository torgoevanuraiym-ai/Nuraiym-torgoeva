import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AnnouncementsSection } from './components/AnnouncementsSection';
import { DepartmentsSection } from './components/DepartmentsSection';
import { AboutSection } from './components/AboutSection';
import { VolunteerForm } from './components/VolunteerForm';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { ConfirmationLetterModal } from './components/ConfirmationLetterModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { ShareModal } from './components/ShareModal';
import { VolunteerApplication, ApplicationStatus, DepartmentId, AnnouncementItem } from './types';
import { Language, TRANSLATIONS } from './data/translations';
import { api, ApiError, SubmitVolunteerPayload, setAdminToken } from './api';
import { Sparkles, Lock, Share2 } from 'lucide-react';

const LANG_KEY = 'jaratman_ordo_lang';
const VIEW_KEY = 'jaratman_active_view';

export default function App() {
  const [isAdminConfigured, setIsAdminConfigured] = useState<boolean>(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'landing' | 'admin'>('landing');

  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentId | null>(null);
  const [confirmationModalApp, setConfirmationModalApp] = useState<VolunteerApplication | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState<boolean>(false);

  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  // Language State (KY default, RU, EN)
  const [lang, setLang] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem(LANG_KEY);
      if (savedLang === 'ru' || savedLang === 'en' || savedLang === 'ky') {
        return savedLang;
      }
    } catch {
      // ignore
    }
    return 'ky';
  });

  const handleSelectLang = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem(LANG_KEY, newLang);
    } catch {
      // ignore
    }
  };

  // Helper to switch view and persist preference
  const handleSwitchView = useCallback((view: 'landing' | 'admin') => {
    setActiveView(view);
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      // ignore
    }
  }, []);

  const reloadAnnouncements = useCallback(async () => {
    try {
      const list = await api.getAnnouncements();
      setAnnouncements(list);
    } catch {
      // ignore transient network errors
    }
  }, []);

  const verifySessionOrLogout = useCallback(async (): Promise<boolean> => {
    try {
      const session = await api.getAdminSession();
      setIsAdminConfigured(session.configured);
      if (session.authenticated) {
        return true;
      }
    } catch {
      // Transient network failure while re-checking session: keep current state
      return false;
    }

    setAdminToken(null);
    setIsAdminAuthenticated(false);
    setVolunteers([]);
    handleSwitchView('landing');
    setIsPassModalOpen(true);
    return false;
  }, [handleSwitchView]);

  const reloadVolunteers = useCallback(async () => {
    try {
      const list = await api.getVolunteers();
      setVolunteers(list);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const stillAuthenticated = await verifySessionOrLogout();
        if (stillAuthenticated) {
          try {
            const retryList = await api.getVolunteers();
            setVolunteers(retryList);
          } catch {
            // keep admin open without kicking out
          }
        }
      }
    }
  }, [verifySessionOrLogout]);

  const handleAdminApiError = useCallback(
    async (err: unknown, reloadFn?: () => Promise<void>) => {
      if (err instanceof ApiError && err.status === 401) {
        const stillAuthenticated = await verifySessionOrLogout();
        if (stillAuthenticated && reloadFn) {
          await reloadFn();
        }
        return;
      }
      if (reloadFn) {
        await reloadFn();
      }
    },
    [verifySessionOrLogout]
  );

  // Initial load: announcements (public) + admin session check
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const annList = await api.getAnnouncements();
        if (!cancelled) {
          setAnnouncements(annList);
        }
      } catch {
        // ignore
      }

      try {
        const session = await api.getAdminSession();
        if (cancelled) return;
        setIsAdminConfigured(session.configured);

        if (session.authenticated) {
          setIsAdminAuthenticated(true);
          try {
            const volList = await api.getVolunteers();
            if (!cancelled) {
              setVolunteers(volList);
            }
          } catch (err) {
            if (!cancelled && err instanceof ApiError && err.status === 401) {
              const recheck = await api.getAdminSession().catch(() => null);
              if (!cancelled && recheck && !recheck.authenticated) {
                setAdminToken(null);
                setIsAdminAuthenticated(false);
                setVolunteers([]);
                setActiveView('landing');
              }
            }
          }

          try {
            if (localStorage.getItem(VIEW_KEY) === 'admin' && !cancelled) {
              setActiveView('admin');
            }
          } catch {
            // ignore
          }
        } else {
          setAdminToken(null);
          setIsAdminAuthenticated(false);
          setActiveView('landing');
        }
      } catch {
        if (!cancelled) {
          setIsAdminAuthenticated(false);
          setActiveView('landing');
        }
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveView: 'landing' | 'admin' =
    activeView === 'admin' && isAdminAuthenticated ? 'admin' : 'landing';

  // Auto-refresh volunteers list while Admin Panel is open (picks up phone submissions automatically)
  useEffect(() => {
    if (effectiveView !== 'admin' || !isAdminAuthenticated) return;

    const refreshIfVisible = () => {
      if (typeof document === 'undefined' || !document.hidden) {
        void reloadVolunteers();
      }
    };

    const intervalId = window.setInterval(refreshIfVisible, 10_000);
    window.addEventListener('focus', refreshIfVisible);
    document.addEventListener('visibilitychange', refreshIfVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshIfVisible);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [effectiveView, isAdminAuthenticated, reloadVolunteers]);

  // Volunteers actions
  const handleClearAllVolunteers = async () => {
    setVolunteers([]);
    try {
      await api.clearVolunteers();
    } catch (err) {
      await handleAdminApiError(err, reloadVolunteers);
    }
  };

  const handleDeleteVolunteer = async (id: string) => {
    setVolunteers((prev) => prev.filter((v) => v.id !== id));
    try {
      await api.deleteVolunteer(id);
    } catch (err) {
      await handleAdminApiError(err, reloadVolunteers);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ApplicationStatus) => {
    setVolunteers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    try {
      const updated = await api.updateVolunteer(id, { status: newStatus });
      setVolunteers((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      await handleAdminApiError(err, reloadVolunteers);
    }
  };

  const handleAdminAddVolunteer = async (payload: SubmitVolunteerPayload) => {
    try {
      const created = await api.submitVolunteer(payload);
      setVolunteers((prev) => [created, ...prev]);
    } catch (err) {
      await handleAdminApiError(err, reloadVolunteers);
    }
  };

  // Announcements actions
  const handleAddAnnouncement = async (item: AnnouncementItem) => {
    const tempId = item.id;
    setAnnouncements((prev) => [item, ...prev]);
    try {
      const created = await api.createAnnouncement({
        badge: item.badge,
        badgeType: item.badgeType,
        date: item.date,
        title: item.title,
        summary: item.summary,
        content: item.content,
        location: item.location,
        imageUrl: item.imageUrl,
        videoUrl: item.videoUrl,
        actionText: item.actionText,
      });
      setAnnouncements((prev) => prev.map((a) => (a.id === tempId ? created : a)));
    } catch (err) {
      await handleAdminApiError(err, reloadAnnouncements);
    }
  };

  const handleUpdateAnnouncement = async (id: string, updated: Partial<AnnouncementItem>) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    try {
      const saved = await api.updateAnnouncement(id, updated);
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? saved : a)));
    } catch (err) {
      await handleAdminApiError(err, reloadAnnouncements);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    try {
      await api.deleteAnnouncement(id);
    } catch (err) {
      await handleAdminApiError(err, reloadAnnouncements);
    }
  };

  const handleClearAllAnnouncements = async () => {
    setAnnouncements([]);
    try {
      await api.clearAnnouncements();
    } catch (err) {
      await handleAdminApiError(err, reloadAnnouncements);
    }
  };

  // Scroll to form smoothly
  const scrollToForm = () => {
    handleSwitchView('landing');
    setTimeout(() => {
      const el = document.getElementById('application-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleSelectDepartment = (deptId: DepartmentId) => {
    setSelectedDeptId(deptId);
    scrollToForm();
  };

  // Public application submission callback: receives server-saved record (201) from VolunteerForm
  const handleAddApplication = (created: VolunteerApplication) => {
    if (isAdminAuthenticated) {
      setVolunteers((prev) => [created, ...prev]);
    }
    setConfirmationModalApp(created);
  };

  // Admin Access Flow
  const handleOpenAdminAuth = () => {
    if (effectiveView === 'admin') {
      handleSwitchView('landing');
      return;
    }

    if (isAdminAuthenticated) {
      handleSwitchView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      reloadVolunteers();
      return;
    }

    api
      .getAdminSession()
      .then((s) => setIsAdminConfigured(s.configured))
      .catch(() => {});
    setIsPassModalOpen(true);
  };

  const handleLogin = async (password: string) => {
    await api.loginAdmin(password);
    setIsAdminConfigured(true);
    setIsAdminAuthenticated(true);
    setIsPassModalOpen(false);
    handleSwitchView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await reloadVolunteers();
  };

  const handleSetupAdminPassword = async (password: string) => {
    await api.setupAdminPassword(password);
    setIsAdminConfigured(true);
    setIsAdminAuthenticated(true);
    setIsPassModalOpen(false);
    handleSwitchView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await reloadVolunteers();
  };

  const handleLockSession = async () => {
    try {
      await api.logoutAdmin();
    } catch {
      // ignore logout network errors
    } finally {
      setAdminToken(null);
      setIsAdminAuthenticated(false);
      setVolunteers([]);
      handleSwitchView('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavSetView = (view: 'landing' | 'admin') => {
    if (view === 'admin' && !isAdminAuthenticated) {
      handleOpenAdminAuth();
      return;
    }
    handleSwitchView(view);
    if (view === 'admin') {
      void reloadVolunteers();
    }
  };

  const handleSyncSheets = async () => {
    try {
      return await api.syncSheets();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await handleAdminApiError(err);
      }
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeView={effectiveView}
        setActiveView={handleNavSetView}
        volunteerCount={volunteers.length}
        onOpenForm={scrollToForm}
        lang={lang}
        onSelectLang={handleSelectLang}
        onOpenAdminAuth={handleOpenAdminAuth}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      {/* Main View: Landing Page or Admin Panel */}
      {effectiveView === 'landing' ? (
        <main className="flex-grow">
          {/* Hero Section */}
          <HeroSection
            onOpenForm={scrollToForm}
            onExploreDepartments={() => {
              const el = document.getElementById('departments');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            lang={lang}
          />

          {/* News & Announcements Panel */}
          <AnnouncementsSection
            announcements={announcements}
            onOpenForm={scrollToForm}
            lang={lang}
          />

          {/* 5 Creative Departments */}
          <DepartmentsSection
            onSelectDepartment={handleSelectDepartment}
            lang={lang}
          />

          {/* About & Values Showcase */}
          <AboutSection lang={lang} />

          {/* Volunteer Intake Form */}
          <VolunteerForm
            selectedDepartmentId={selectedDeptId}
            onSelectDepartment={(id) => setSelectedDeptId(id)}
            onSubmitSuccess={handleAddApplication}
            lang={lang}
          />

          {/* FAQ */}
          <FaqSection lang={lang} />
        </main>
      ) : (
        <main className="flex-grow">
          <AdminPanel
            volunteers={volunteers}
            onUpdateStatus={handleUpdateStatus}
            onAddVolunteer={handleAdminAddVolunteer}
            onDeleteVolunteer={handleDeleteVolunteer}
            onClearAllVolunteers={handleClearAllVolunteers}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onUpdateAnnouncement={handleUpdateAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onClearAllAnnouncements={handleClearAllAnnouncements}
            onExitAdmin={() => handleSwitchView('landing')}
            onOpenApplyForm={scrollToForm}
            lang={lang}
            onLockSession={handleLockSession}
            onChangePassword={async (currentPassword, newPassword) => {
              await api.changeAdminPassword(currentPassword, newPassword);
            }}
            onSyncSheets={handleSyncSheets}
            onRefreshVolunteers={reloadVolunteers}
          />
        </main>
      )}

      {/* Footer */}
      <Footer
        onOpenForm={scrollToForm}
        onOpenAdmin={handleOpenAdminAuth}
        lang={lang}
      />

      {/* Confirmation Letter & Ticket Modal */}
      <ConfirmationLetterModal
        application={confirmationModalApp}
        onClose={() => setConfirmationModalApp(null)}
        onViewInTable={() => {
          setConfirmationModalApp(null);
        }}
        lang={lang}
      />

      {/* Admin Login Modal */}
      <AdminPasswordModal
        isOpen={isPassModalOpen}
        isConfigured={isAdminConfigured}
        lang={lang}
        onLogin={handleLogin}
        onSetup={handleSetupAdminPassword}
        onClose={() => {
          setIsPassModalOpen(false);
        }}
      />

      {/* Share Modal Mounted at Root Level */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        lang={lang}
      />

      {/* Mobile Sticky Quick-Action Bar */}
      {effectiveView === 'landing' && (
        <div className="sm:hidden fixed bottom-3 inset-x-3 z-30">
          <div className="bg-stone-950/95 backdrop-blur-md border border-emerald-800/70 p-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 pl-1.5">
              <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                <img
                  src="/assets/aistudio/_________56eb9da0.jpeg"
                  alt="Жаратман Ордо"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">2026–2027</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Quick Share on Mobile */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-stone-900 text-stone-200 hover:text-emerald-300 border border-stone-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Шилтеме"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px]">{lang === 'ky' ? 'Шилтеме' : lang === 'ru' ? 'Ссылка' : 'Share'}</span>
              </button>

              {/* Discrete Lock Icon Button */}
              <button
                onClick={handleOpenAdminAuth}
                className="p-2 rounded-xl bg-stone-900 text-stone-400 hover:text-emerald-300 border border-stone-800 text-xs font-semibold flex items-center justify-center cursor-pointer"
                aria-label="Security Access"
              >
                <Lock className="w-4 h-4 text-stone-400" />
              </button>

              <button
                onClick={scrollToForm}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-stone-950 font-bold text-xs shadow-md shadow-emerald-500/25 active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{TRANSLATIONS[lang].nav.applyBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
