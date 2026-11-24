import React from 'react';
import { ArrowDownRight, Sparkles, CheckCircle2, Camera, Award, Shield, Quote } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface HeroSectionProps {
  onOpenForm: () => void;
  onExploreDepartments: () => void;
  lang: Language;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenForm,
  onExploreDepartments,
  lang,
}) => {
  const t = TRANSLATIONS[lang].hero;

  const motivationalQuotes = {
    ky: {
      seasonBadge: '2026–2027 Жаңы сезон · Жаратмандык чакырыгы',
      quote: '«Келечекти күтпөй, аны өз чыгармачылыгың жана аракетиң менен бүгүн жарат!»',
      sub: 'Чыныгы жаратмандык — жөн гана кыял эмес, коомго пайда алып келүү жана бирге өсүү.',
      source: '«Жаратман Ордо» демилгеси',
    },
    ru: {
      seasonBadge: 'Новый сезон 2026–2027 · Манифест созидателей',
      quote: '«Не жди будущего — создавай его сегодня своим творчеством и трудом!»',
      sub: 'Истинное созидание — это не просто мечта, а реальный вклад в общество и рост вместе с командой.',
      source: 'Инициатива «Жаратман Ордо»',
    },
    en: {
      seasonBadge: 'New Season 2026–2027 · Creator’s Call',
      quote: '«Don’t wait for the future — create it today through your creativity and action!»',
      sub: 'True creativity is not merely a dream; it is serving the community and thriving together.',
      source: '«Jaratman Ordo» Initiative',
    },
  }[lang];

  return (
    <div className="relative bg-gradient-to-b from-emerald-950 via-[#072d24] to-stone-950 text-white overflow-hidden">
      {/* Ambient Emerald & Teal Glows (Harmonized with the official emblem) */}
      <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-14 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Text & Value Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            {/* Unboxed Metadata Kicker (Zero-pill discipline) */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider text-emerald-300 uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t.kicker}</span>
            </div>

            {/* Headline with balanced wrap */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.12] text-balance">
              {t.headlinePart1}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
                {t.headlineHighlight}
              </span>{' '}
              {t.headlinePart2}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl leading-relaxed font-light">
              {t.subtitle}
            </p>

            {/* Mandatory Criteria Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-stone-100 font-medium pt-1">
              <span className="flex items-center gap-2 bg-emerald-950/70 p-2.5 rounded-xl border border-emerald-800/80 shadow-xs">
                <Camera className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{t.photoReq}</span>
              </span>
              <span className="flex items-center gap-2 bg-emerald-950/70 p-2.5 rounded-xl border border-emerald-800/80 shadow-xs">
                <Award className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{t.certReq}</span>
              </span>
              <span className="flex items-center gap-2 bg-emerald-950/70 p-2.5 rounded-xl border border-emerald-800/80 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{t.confReq}</span>
              </span>
              <span className="flex items-center gap-2 bg-emerald-950/70 p-2.5 rounded-xl border border-emerald-800/80 shadow-xs">
                <Shield className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{t.adminReq}</span>
              </span>
            </div>

            {/* Primary Action Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenForm}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl text-stone-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 font-bold text-sm sm:text-base transition-all shadow-lg shadow-emerald-500/25 active:scale-98 whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-emerald-950" />
                <span>{t.applyNow}</span>
              </button>

              <button
                onClick={onExploreDepartments}
                className="flex items-center justify-center gap-2 px-5 py-3.5 sm:py-4 rounded-xl text-stone-200 bg-stone-900 hover:bg-stone-800 border border-emerald-900/50 hover:border-emerald-600/50 text-sm sm:text-base font-semibold transition-all whitespace-nowrap cursor-pointer"
              >
                <span>{t.viewDepts}</span>
                <ArrowDownRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Right Column: Visual Showcase with Full-Face Visibility & Official Emblem */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-emerald-900/60 shadow-2xl shadow-emerald-950/60 bg-stone-900 group">
              {/* Background Real Team Photo - Focused on faces with full clarity */}
              <div className="relative h-[420px] sm:h-[460px] overflow-hidden bg-stone-950">
                <img
                  src="/assets/aistudio/image_76bf6b3a.png"
                  alt="«Жаратман Ордо» командасы"
                  className="w-full h-full object-cover object-[center_16%] group-hover:scale-102 transition-transform duration-700"
                />
                {/* Subtle gradient at the bottom only, keeping people's faces completely bright & clear */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/25 to-transparent pointer-events-none" />

                {/* Official Emblem Card Placed at Bottom (unobstructed view of all faces) */}
                <div className="absolute bottom-4 inset-x-4 sm:bottom-5 sm:inset-x-5">
                  <div className="bg-stone-950/90 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-emerald-700/60 shadow-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full p-0.5 bg-gradient-to-tr from-emerald-400 via-teal-300 to-emerald-500 shadow-md overflow-hidden bg-stone-950 shrink-0">
                        <img
                          src="/assets/aistudio/_________56eb9da0.jpeg"
                          alt="Жаратман Ордо расмий герби"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-400 block font-display">
                          «ЖАРАТМАН ОРДО»
                        </span>
                        <span className="text-[11px] text-stone-300 font-medium">
                          {t.officialEmblem}
                        </span>
                      </div>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 shrink-0 font-mono">
                      2026–2027
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Quote Banner for 2026–2027 Season (Mobile & Laptop Optimized) */}
        <div className="mt-10 sm:mt-12 relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-emerald-950/90 via-stone-900/95 to-teal-950/90 border border-emerald-800/60 shadow-xl overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-inner">
                <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{motivationalQuotes.seasonBadge}</span>
                </div>
                <blockquote className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight italic font-serif leading-snug">
                  {motivationalQuotes.quote}
                </blockquote>
                <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                  {motivationalQuotes.sub}
                </p>
              </div>
            </div>

            <div className="flex items-center md:flex-col md:items-end justify-between pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-stone-800 md:pl-5 shrink-0 gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-display">
                «ЖАРАТМАН ОРДО»
              </span>
              <span className="text-[11px] text-stone-400 font-medium">
                {motivationalQuotes.source}
              </span>
            </div>
          </div>
        </div>

        {/* 4-Column Proof & Statistics Strip */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-stone-300">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              150+
            </div>
            <div className="text-xs sm:text-sm text-stone-400 mt-1 font-medium">
              {t.graduates}
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums tracking-tight">
              5
            </div>
            <div className="text-xs sm:text-sm text-stone-400 mt-1 font-medium">
              {t.creativeDepts}
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              40+
            </div>
            <div className="text-xs sm:text-sm text-stone-400 mt-1 font-medium">
              {t.projectsHeld}
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-mono tabular-nums tracking-tight">
              100%
            </div>
            <div className="text-xs sm:text-sm text-stone-400 mt-1 font-medium">
              {t.autoSystem}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
