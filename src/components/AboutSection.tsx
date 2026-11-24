import React from 'react';
import { Award, Users2, Sparkles, HeartHandshake, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface AboutSectionProps {
  lang: Language;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang].about;

  // Localized gallery labels
  const galleryLabels = {
    ky: {
      initiativesBadge: 'Демилгелердин ордосу · Форум',
      initiativesTitle: 'Чыгармачыл жаштардын форуму',
      initiativesDesc:
        '«Жаратман Ордо» уюмунун ыктыярчылары жана чыгармачыл жаштары чоң залда өткөн форумда.',
      photo1Badge: 'Иш-чарага даярдык',
      photo1Title: 'Иш-чаранын сценарийи түзүлүп жаткан учур',
      photo1Desc: '«Жаратман Ордонун» координаторлору иш-чаранын сценарийин жана программасын иштеп чыгууда.',
      photo2Badge: 'Команда жана Ынтымак',
      photo2Title: '«Жаратман Ордо» ыктыярчылар жамааты',
      photo2Desc: 'Бир максатка бириккен демилгелүү чыгармачыл жаштардын жана лидерлердин ынтымактуу командасы.',
      photo4Badge: 'Сессиялар жана Талкуулар',
      photo4Title: 'Чыгармачыл устаканалар & Идеялар',
      photo4Desc: 'Жаңы муундун демилгелерин талкуулоо, долбоорлорду жазуу жана тажрыйба алмашуу.',
    },
    ru: {
      initiativesBadge: 'Ордо инициатив · Форум',
      initiativesTitle: 'Форум творческой молодёжи',
      initiativesDesc:
        'Волонтёры и молодёжь «Жаратман Ордо» на творческом форуме в главном зале.',
      photo1Badge: 'Подготовка',
      photo1Title: 'Момент составления сценария мероприятия',
      photo1Desc: 'Координаторы «Жаратман Ордо» разрабатывают сценарий и программу предстоящего мероприятия.',
      photo2Badge: 'Команда и Единство',
      photo2Title: 'Команда волонтёров «Жаратман Ордо»',
      photo2Desc: 'Сплочённая команда инициативной творческой молодёжи и лидеров организации.',
      photo4Badge: 'Сессии и Обсуждения',
      photo4Title: 'Творческие встречи и идеи',
      photo4Desc: 'Обсуждение инициатив, разработка социальных проектов и обмен опытом.',
    },
    en: {
      initiativesBadge: 'Hub of Initiatives · Forum',
      initiativesTitle: 'Creative Youth Forum',
      initiativesDesc:
        'Volunteers and creative youth of «Jaratman Ordo» gathered for the forum in the main hall.',
      photo1Badge: 'Planning & Prep',
      photo1Title: 'Drafting the event scenario',
      photo1Desc: 'Coordinators of «Jaratman Ordo» drafting the script and program for the upcoming event.',
      photo2Badge: 'Team & Unity',
      photo2Title: '«Jaratman Ordo» Volunteer Team',
      photo2Desc: 'United community of creative youth and leaders dedicated to impactful cultural initiatives.',
      photo4Badge: 'Workshops & Growth',
      photo4Title: 'Creative masterclasses & sessions',
      photo4Desc: 'Brainstorming new initiatives, learning production skills, and leadership growth.',
    },
  }[lang];

  return (
    <section id="about" className="py-16 sm:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="text-xs sm:text-sm font-semibold tracking-wider text-emerald-700 uppercase mb-2">
            {t.sectionNum}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 font-display tracking-tight text-balance">
            {t.heading}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
            {lang === 'ky'
              ? '«Жаратман Ордо» — маданиятты, искусствону жана жаштардын коомдук демилгелерин бириктирген борбор. Төмөндө биздин чоң форумдар жана жаратмандар жамааты:'
              : lang === 'ru'
              ? '«Жаратман Ордо» — платформа, объединяющая культуру, медиа и молодёжные инициативы Кыргызстана. Наш главный форум и команда:'
              : '«Jaratman Ordo» is a creative powerhouse connecting culture, arts, media, and youth initiatives in Kyrgyzstan. Explore our forums and community:'}
          </p>
        </div>

        {/* 3-СҮРӨТ: "Демилгелердин ордосу" - Чоң борбордук баннер (Ашыкча жерлери туураланып кесилген) */}
        <div className="mb-12">
          <div className="relative rounded-3xl overflow-hidden border border-emerald-950/20 shadow-2xl bg-stone-950 group">
            <div className="relative w-full h-72 sm:h-96 lg:h-[440px] overflow-hidden">
              <img
                src="/assets/aistudio/image_ca60f11f.png"
                alt="«Жаратман Ордо» демилгелердин ордосу башкы форуму"
                className="w-full h-full object-cover object-[center_42%] group-hover:scale-[1.01] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent pointer-events-none" />

              {/* Bottom Information Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-stone-950 text-xs font-bold tracking-wide uppercase shadow-md mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                    <span>{galleryLabels.initiativesBadge}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white font-display tracking-tight leading-tight">
                    {galleryLabels.initiativesTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-200 mt-1.5 leading-relaxed font-light">
                    {galleryLabels.initiativesDesc}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-3.5 py-2 rounded-xl bg-stone-900/80 backdrop-blur-md border border-emerald-700/50 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                    <Users2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'ky' ? '300+ катышуучу · Форум' : lang === 'ru' ? '300+ участников · Форум' : '300+ attendees · Forum'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Чогуу түшкөн сүрөттөрдүн галереясы: 2-сүрөт, 1-сүрөт, 4-сүрөт (Ашыкча жерлери алынып, так кадрга салынган) */}
        <div className="mb-16 sm:mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: 2-сүрөт (Ачык асман алдындагы чогуу түшкөн сүрөт) */}
            <div className="bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="relative h-60 w-full overflow-hidden bg-stone-900">
                <img
                  src="/assets/aistudio/image_76bf6b3a.png"
                  alt="«Жаратман Ордо» ыктыярчылар жамааты"
                  className="w-full h-full object-cover object-[center_30%] group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-md text-[11px] font-bold text-emerald-400 border border-emerald-800/50 uppercase tracking-wider">
                  {galleryLabels.photo2Badge}
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-stone-900 font-display">
                    {galleryLabels.photo2Title}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
                    {galleryLabels.photo2Desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: 1-сүрөт (Иш-чаранын сценарийи түзүлүп жаткан учур) */}
            <div className="bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="relative h-60 w-full overflow-hidden bg-stone-900">
                <img
                  src="/assets/aistudio/image_b6215714.png"
                  alt="«Жаратман Ордо» иш-чаранын сценарийи түзүлүп жаткан учур"
                  className="w-full h-full object-cover object-[center_28%] group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-md text-[11px] font-bold text-emerald-400 border border-emerald-800/50 uppercase tracking-wider">
                  {galleryLabels.photo1Badge}
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-stone-900 font-display">
                    {galleryLabels.photo1Title}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
                    {galleryLabels.photo1Desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: 4-сүрөт (Залдагы жаш жаратмандар: талкуулар жана тренинг) */}
            <div className="bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="relative h-60 w-full overflow-hidden bg-stone-900">
                <img
                  src="/assets/aistudio/image_528a7f68.png"
                  alt="«Жаратман Ордо» чыгармачыл сессиялары жана катышуучулары"
                  className="w-full h-full object-cover object-[center_35%] group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-md text-[11px] font-bold text-emerald-400 border border-emerald-800/50 uppercase tracking-wider">
                  {galleryLabels.photo4Badge}
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-stone-900 font-display">
                    {galleryLabels.photo4Title}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
                    {galleryLabels.photo4Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Негизги артыкчылык (Benefits & Values) */}
        <div className="bg-gradient-to-br from-emerald-950 via-stone-950 to-stone-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-emerald-900/60">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
              {lang === 'ky' ? 'ЫКТЫЯРЧЫЛАРГА МҮМКҮНЧҮЛҮКТӨР' : lang === 'ru' ? 'ВОЗМОЖНОСТИ ДЛЯ ВОЛОНТЁРОВ' : 'VOLUNTEER ADVANTAGES'}
            </span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white font-display mt-2">
              {t.benefitsTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-stone-900/80 rounded-2xl p-5 border border-stone-800 hover:border-emerald-600/60 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3.5">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white leading-snug">
                {t.benefit1Title}
              </h4>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                {t.benefit1Desc}
              </p>
            </div>

            <div className="bg-stone-900/80 rounded-2xl p-5 border border-stone-800 hover:border-emerald-600/60 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3.5">
                <Users2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white leading-snug">
                {t.benefit2Title}
              </h4>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                {t.benefit2Desc}
              </p>
            </div>

            <div className="bg-stone-900/80 rounded-2xl p-5 border border-stone-800 hover:border-emerald-600/60 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white leading-snug">
                {t.benefit3Title}
              </h4>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                {t.benefit3Desc}
              </p>
            </div>

            <div className="bg-stone-900/80 rounded-2xl p-5 border border-stone-800 hover:border-emerald-600/60 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3.5">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white leading-snug">
                {t.benefit4Title}
              </h4>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                {t.benefit4Desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
