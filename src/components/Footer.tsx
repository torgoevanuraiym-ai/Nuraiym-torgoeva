import React, { useState } from 'react';
import { Heart, MapPin, Phone, Shield, FileCheck } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

interface FooterProps {
  onOpenForm: () => void;
  onOpenAdmin: () => void;
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ onOpenForm, onOpenAdmin, lang }) => {
  const t = TRANSLATIONS[lang].footer;
  const navT = TRANSLATIONS[lang].nav;
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const privacyLabel =
    lang === 'ky'
      ? 'Купуялуулук саясаты'
      : lang === 'ru'
      ? 'Политика конфиденциальности'
      : 'Privacy Policy';

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-emerald-950/60 pt-16 pb-24 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-stone-800">
          {/* Col 1: Brand Wordmark with Official Emblem */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-emerald-400 to-teal-300 overflow-hidden shrink-0 shadow-md">
                <img
                  src="/assets/aistudio/_________56eb9da0.jpeg"
                  alt="Жаратман Ордо"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white font-display">
                  {navT.title}
                </span>
                <span className="block text-xs text-emerald-400">
                  {navT.subtitle}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
              {t.desc}
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              {t.sectionsTitle}
            </div>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#departments" className="hover:text-emerald-400 transition-colors">
                  {navT.departments}
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-emerald-400 transition-colors">
                  {navT.about}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-400 transition-colors">
                  {navT.faq}
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenForm}
                  className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  {navT.applyBtn}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(true)}
                  className="hover:text-emerald-400 transition-colors text-left cursor-pointer inline-flex items-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{privacyLabel}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contacts */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              {t.contactsTitle}
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t.city}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/996709040598?text=${encodeURIComponent('Саламатсызбы! «Жаратман Ордо» чыгармачыл жаштар уюмунун ишмердүүлүгү тууралуу кененирээк маалымат алгым келет.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-300 hover:text-emerald-300 font-medium transition-colors flex items-center gap-1.5"
                >
                  <span>WhatsApp: +996 709 040 598</span>
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/80 font-semibold">
                    Жазуу
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            <span>© {new Date().getFullYear()} {t.rights}</span>
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="text-stone-400 hover:text-emerald-400 underline underline-offset-2 transition-colors cursor-pointer"
            >
              {privacyLabel}
            </button>
            <button
              onClick={onOpenAdmin}
              className="text-stone-600 hover:text-stone-400 transition-colors cursor-pointer p-1"
              aria-label="Security Access"
            >
              <Shield className="w-3.5 h-3.5 inline opacity-30 hover:opacity-80" />
            </button>
          </div>
          <div className="flex items-center gap-1 text-stone-400">
            <span>{t.madeWithLove}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </div>
        </div>
      </div>

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        lang={lang}
      />
    </footer>
  );
};
