import React, { useState } from 'react';
import { Sparkles, Lock, Globe, Home, Share2, Check } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';
import { ShareModal, PUBLIC_SHARED_URL } from './ShareModal';

interface NavbarProps {
  activeView: 'landing' | 'admin';
  setActiveView: (view: 'landing' | 'admin') => void;
  volunteerCount: number;
  onOpenForm: () => void;
  lang: Language;
  onSelectLang: (l: Language) => void;
  onOpenAdminAuth: () => void;
  onOpenShare: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  volunteerCount,
  onOpenForm,
  lang,
  onSelectLang,
  onOpenAdminAuth,
  onOpenShare,
}) => {
  const t = TRANSLATIONS[lang].nav;
  const [copied, setCopied] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-emerald-950/70 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-20">
          {/* Zone 1: Brand Wordmark with Official Emblem */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('landing')}
              className="flex items-center gap-3 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg py-1"
            >
              {/* Official Uploaded Emblem */}
              <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-emerald-400 via-teal-500 to-emerald-300 shadow-md shadow-emerald-900/40 shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src="/assets/aistudio/_________56eb9da0.jpeg"
                  alt="Жаратман Ордо эмблемасы"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-display whitespace-nowrap">
                  {t.title}
                </span>
                <span className="text-[11px] text-emerald-400/90 font-medium tracking-wide">
                  {t.subtitle}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single-line, clean typography) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-300">
            {activeView === 'landing' ? (
              <>
                <a
                  href="#announcements"
                  className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t.announcements}</span>
                </a>
                <a
                  href="#departments"
                  className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
                >
                  {t.departments}
                </a>
                <a
                  href="#about"
                  className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
                >
                  {t.about}
                </a>
                <a
                  href="#faq"
                  className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
                >
                  {t.faq}
                </a>
              </>
            ) : (
              <button
                onClick={() => setActiveView('landing')}
                className="flex items-center gap-2 text-stone-300 hover:text-emerald-400 transition-colors text-sm font-medium"
              >
                <Home className="w-4 h-4" />
                <span>{t.backToSite}</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Language Switcher, Admin Lock & Apply CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-stone-950/80 rounded-xl p-1 border border-stone-800 text-xs">
              <button
                onClick={() => onSelectLang('ky')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  lang === 'ky'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="Кыргыз тили"
              >
                КЫР
              </button>
              <button
                onClick={() => onSelectLang('ru')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  lang === 'ru'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="Русский язык"
              >
                РУС
              </button>
              <button
                onClick={() => onSelectLang('en')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  lang === 'en'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="English"
              >
                ENG
              </button>
            </div>

            {/* Discrete Lock Icon for authorized coordinator (no Admin Panel text) */}
            <button
              onClick={onOpenAdminAuth}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 ring-1 ring-emerald-400'
                  : 'bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-emerald-300 border border-stone-750'
              }`}
              aria-label="Security Access"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Quick Share Link button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                onOpenShare();
                try {
                  const activeUrl =
                    typeof window !== 'undefined' &&
                    window.location.origin &&
                    !window.location.origin.includes('localhost') &&
                    !window.location.origin.includes('127.0.0.1')
                      ? window.location.origin
                      : PUBLIC_SHARED_URL;
                  if (navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText(activeUrl)
                      .then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2500);
                      })
                      .catch(() => {});
                  }
                } catch {
                  // ignore
                }
              }}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-200 hover:text-emerald-300 border border-stone-750 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
              title={lang === 'ky' ? 'Башкаларга жиберүү (Таза шилтеме)' : lang === 'ru' ? 'Поделиться (Чистая ссылка)' : 'Share Clean Link'}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">{lang === 'ky' ? 'Көчүрүлдү!' : lang === 'ru' ? 'Скопировано!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'ky' ? 'Шилтеме' : lang === 'ru' ? 'Ссылка' : 'Share'}</span>
                </>
              )}
            </button>

            {/* Apply CTA Button */}
            {activeView === 'landing' && (
              <button
                onClick={onOpenForm}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-stone-950 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl hover:from-emerald-300 hover:to-teal-300 transition-all shadow-md shadow-emerald-500/20 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-950" />
                <span className="hidden sm:inline">{t.applyBtn}</span>
                <span className="sm:hidden">Анкета</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
