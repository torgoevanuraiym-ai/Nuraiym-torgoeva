import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Megaphone,
  X,
  Play,
  Film,
  Image as ImageIcon,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { AnnouncementItem, AnnouncementCategory } from '../types';
import { Language } from '../data/translations';

interface AnnouncementsSectionProps {
  announcements: AnnouncementItem[];
  onOpenForm: () => void;
  lang: Language;
}

export function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube-nocookie.com/embed/${match[2]}`
    : null;
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  announcements,
  onOpenForm,
  lang,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | AnnouncementCategory>('all');
  const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementItem | null>(null);

  const filteredList = announcements.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.badgeType === selectedCategory;
  });

  const getBadgeStyle = (type: AnnouncementCategory) => {
    switch (type) {
      case 'urgent':
        return 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs';
      case 'event':
        return 'bg-teal-100 text-teal-800 border border-teal-300';
      case 'project':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-300';
      case 'news':
      default:
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    }
  };

  const getCategoryLabel = (type: 'all' | AnnouncementCategory) => {
    if (lang === 'ky') {
      switch (type) {
        case 'all':
          return 'Бардыгы';
        case 'urgent':
          return 'Маанилүү';
        case 'news':
          return 'Жаңылыктар';
        case 'event':
          return 'Иш-чаралар';
        case 'project':
          return 'Долбоорлор';
      }
    } else if (lang === 'ru') {
      switch (type) {
        case 'all':
          return 'Все';
        case 'urgent':
          return 'Важные';
        case 'news':
          return 'Новости';
        case 'event':
          return 'События';
        case 'project':
          return 'Проекты';
      }
    } else {
      switch (type) {
        case 'all':
          return 'All';
        case 'urgent':
          return 'Urgent';
        case 'news':
          return 'News';
        case 'event':
          return 'Events';
        case 'project':
          return 'Projects';
      }
    }
  };

  return (
    <section id="announcements" className="py-12 sm:py-18 bg-gradient-to-b from-white via-emerald-50/25 to-teal-50/20 border-b border-emerald-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with vibrant emblem identity */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-300/80 text-emerald-800 text-xs font-bold tracking-wider uppercase mb-2.5">
              <Megaphone className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
              <span>
                {lang === 'ky' ? 'МААЛЫМАТ ТАКТАСЫ · 2026–2027' : lang === 'ru' ? 'ИНФОРМАЦИОННОЕ ТАБЛО · 2026–2027' : 'NEWS & ANNOUNCEMENTS'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 font-display tracking-tight">
              {lang === 'ky'
                ? 'Жаңылыктар жана Кулактандыруулар'
                : lang === 'ru'
                ? 'Новости и Объявления штаба'
                : 'News & Latest Announcements'}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              {lang === 'ky'
                ? '«Жаратман Ордонун» расмий жаңылыктары, сүрөт-видео баяндары жана алдыдагы маданий иш-чаралардын графиги.'
                : lang === 'ru'
                ? 'Официальные новости «Жаратман Ордо», фото и видео отчёты, график культурных проектов.'
                : 'Official news of «Jaratman Ordo», photo and video reports, and cultural event schedules.'}
            </p>
          </div>

          {/* Category Filter Buttons - only visible when there are announcements */}
          {announcements.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-emerald-200 shadow-xs text-xs font-semibold overflow-x-auto">
              {(['all', 'urgent', 'news', 'event', 'project'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-stone-600 hover:text-emerald-700'
                  }`}
                >
                  {getCategoryLabel(cat)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Empty State when no announcements are published yet */}
        {announcements.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-200/90 shadow-sm text-center max-w-3xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 border border-emerald-200 flex items-center justify-center mb-4 text-emerald-600 shadow-xs">
              <Megaphone className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-display">
              {lang === 'ky'
                ? 'Азырынча расмий кулактандыруулар даярдалууда'
                : lang === 'ru'
                ? 'Официальные объявления готовятся к публикации'
                : 'Official announcements are being prepared'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-lg mt-2 leading-relaxed">
              {lang === 'ky'
                ? '«Жаратман Ордонун» жаңылыктары, сүрөт жана видео материалдары координаторлор тарабынан жакынкы убакта ушул жерге жарыяланат.'
                : lang === 'ru'
                ? 'Новости, фото и видео «Жаратман Ордо» будут опубликованы координаторами в ближайшее время.'
                : 'News, photos and videos of «Jaratman Ordo» will be published here by coordinators shortly.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenForm}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{lang === 'ky' ? 'Анкета толтуруу' : lang === 'ru' ? 'Заполнить анкету' : 'Apply for Intake'}</span>
              </button>
            </div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
            {lang === 'ky' ? 'Бул категория боюнча жаңылык табылган жок.' : 'Новости по этой категории не найдены.'}
          </div>
        ) : (
          /* Announcements Grid with Photos and Videos */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((ann) => {
              const ytEmbed = getYouTubeEmbedUrl(ann.videoUrl);

              return (
                <div
                  key={ann.id}
                  className="bg-white rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Media Header (Photo or Video preview) */}
                    {ann.imageUrl ? (
                      <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                        <img
                          src={ann.imageUrl}
                          alt={ann.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getBadgeStyle(ann.badgeType)}`}>
                            {ann.badge}
                          </span>
                        </div>
                        {ann.videoUrl && (
                          <div className="absolute bottom-3 right-3 bg-stone-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow">
                            <Film className="w-3 h-3 text-emerald-400" />
                            <span>Видео</span>
                          </div>
                        )}
                      </div>
                    ) : ann.videoUrl ? (
                      <div className="relative aspect-video w-full overflow-hidden bg-stone-900">
                        {ytEmbed ? (
                          <iframe
                            src={ytEmbed}
                            title={ann.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={ann.videoUrl}
                            controls
                            preload="metadata"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getBadgeStyle(ann.badgeType)}`}>
                            {ann.badge}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 pb-0 flex items-center justify-between gap-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getBadgeStyle(ann.badgeType)}`}>
                          {ann.badge}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{ann.date}</span>
                        </div>
                      </div>
                    )}

                    <div className="p-5">
                      {(ann.imageUrl || ann.videoUrl) && (
                        <div className="flex items-center justify-between gap-3 mb-2 text-xs text-stone-500 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{ann.date}</span>
                          </div>
                          {ann.location && (
                            <div className="flex items-center gap-1 text-emerald-700 font-medium truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{ann.location}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors font-display leading-snug line-clamp-2">
                        {ann.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed line-clamp-3">
                        {ann.summary || ann.content}
                      </p>

                      {/* Video Player in body if both photo and direct video are attached */}
                      {ann.imageUrl && ann.videoUrl && !ytEmbed && (
                        <div className="mt-3">
                          <video
                            src={ann.videoUrl}
                            controls
                            preload="metadata"
                            className="w-full rounded-xl max-h-48 object-cover bg-black"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 mt-2 flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setActiveAnnouncement(ann)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer py-1"
                    >
                      <span>{lang === 'ky' ? 'Толук окуу' : lang === 'ru' ? 'Подробнее' : 'Read more'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>

                    {ann.actionText ? (
                      <button
                        type="button"
                        onClick={onOpenForm}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{ann.actionText}</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal with Photo and Video Support */}
      {activeAnnouncement && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white text-stone-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveAnnouncement(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getBadgeStyle(activeAnnouncement.badgeType)}`}>
                {activeAnnouncement.badge}
              </span>
              <span className="text-xs text-stone-500">{activeAnnouncement.date}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-display text-stone-900 leading-snug mb-4 pr-6">
              {activeAnnouncement.title}
            </h3>

            {/* Modal Image display */}
            {activeAnnouncement.imageUrl && (
              <div className="rounded-2xl overflow-hidden mb-4 border border-stone-200 max-h-80 bg-stone-100">
                <img
                  src={activeAnnouncement.imageUrl}
                  alt={activeAnnouncement.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Modal Video Player */}
            {activeAnnouncement.videoUrl && (
              <div className="rounded-2xl overflow-hidden mb-4 border border-stone-200 bg-black aspect-video w-full">
                {getYouTubeEmbedUrl(activeAnnouncement.videoUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(activeAnnouncement.videoUrl)!}
                    title={activeAnnouncement.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={activeAnnouncement.videoUrl}
                    controls
                    autoPlay={false}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}

            <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3 mb-6 bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200">
              <p className="whitespace-pre-line">{activeAnnouncement.content}</p>
              {activeAnnouncement.location && (
                <div className="text-emerald-800 font-semibold pt-2 border-t border-stone-200 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{activeAnnouncement.location}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveAnnouncement(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                {lang === 'ky' ? 'Жабуу' : lang === 'ru' ? 'Закрыть' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveAnnouncement(null);
                  onOpenForm();
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'ky' ? 'Анкета толтуруу' : lang === 'ru' ? 'Заполнить анкету' : 'Apply Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
