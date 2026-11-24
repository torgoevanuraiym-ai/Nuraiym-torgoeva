import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Eye,
  Megaphone,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Film,
  Video,
  X,
  CheckCircle2,
  Sparkles,
  Search,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { AnnouncementItem, AnnouncementCategory } from '../types';
import { Language } from '../data/translations';
import { getYouTubeEmbedUrl } from './AnnouncementsSection';

interface AdminAnnouncementsProps {
  announcements: AnnouncementItem[];
  onAddAnnouncement: (item: AnnouncementItem) => void;
  onUpdateAnnouncement: (id: string, updated: Partial<AnnouncementItem>) => void;
  onDeleteAnnouncement: (id: string) => void;
  onClearAllAnnouncements: () => void;
  lang: Language;
}

export const AdminAnnouncements: React.FC<AdminAnnouncementsProps> = ({
  announcements,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onClearAllAnnouncements,
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | AnnouncementCategory>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [previewItem, setPreviewItem] = useState<AnnouncementItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [badgeType, setBadgeType] = useState<AnnouncementCategory>('news');
  const [badge, setBadge] = useState('ЖАҢЫЛЫК');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [actionText, setActionText] = useState('Анкета толтуруу');

  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const getTodayFormattedDate = () => {
    const d = new Date();
    const monthsKy = [
      'январь',
      'февраль',
      'март',
      'апрель',
      'май',
      'июнь',
      'июль',
      'август',
      'сентябрь',
      'октябрь',
      'ноябрь',
      'декабрь',
    ];
    return `${d.getFullYear()}-жыл, ${d.getDate()}-${monthsKy[d.getMonth()]}`;
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setBadgeType('news');
    setBadge('ЖАҢЫЛЫК');
    setDate(getTodayFormattedDate());
    setLocation('Бишкек ш., «Жаратман Ордо»');
    setSummary('');
    setContent('');
    setImageUrl('');
    setVideoUrl('');
    setActionText('Анкета толтуруу');
    setShowModal(true);
  };

  const handleOpenEditModal = (item: AnnouncementItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setBadgeType(item.badgeType);
    setBadge(item.badge);
    setDate(item.date);
    setLocation(item.location || '');
    setSummary(item.summary);
    setContent(item.content);
    setImageUrl(item.imageUrl || '');
    setVideoUrl(item.videoUrl || '');
    setActionText(item.actionText || 'Анкета толтуруу');
    setShowModal(true);
  };

  const handleCategoryChange = (cat: AnnouncementCategory) => {
    setBadgeType(cat);
    switch (cat) {
      case 'urgent':
        setBadge('МААНИЛҮҮ');
        break;
      case 'event':
        setBadge('ИШ-ЧАРА');
        break;
      case 'project':
        setBadge('ДОЛБООР');
        break;
      case 'news':
      default:
        setBadge('ЖАҢЫЛЫК');
        break;
    }
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Video File Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setVideoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingItem) {
      onUpdateAnnouncement(editingItem.id, {
        title: title.trim(),
        badgeType,
        badge: badge.trim() || 'ЖАҢЫЛЫК',
        date: date.trim() || getTodayFormattedDate(),
        location: location.trim() || undefined,
        summary: summary.trim() || content.trim().slice(0, 150) + '...',
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        actionText: actionText.trim() || undefined,
      });

      setSuccessToast('✓ Жаңылык ийгиликтүү жаңыртылды!');
    } else {
      const newItem: AnnouncementItem = {
        id: `ann-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: title.trim(),
        badgeType,
        badge: badge.trim() || 'ЖАҢЫЛЫК',
        date: date.trim() || getTodayFormattedDate(),
        location: location.trim() || undefined,
        summary: summary.trim() || content.trim().slice(0, 150) + '...',
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        actionText: actionText.trim() || undefined,
      };

      onAddAnnouncement(newItem);
      setSuccessToast('✓ Жаңы кулактандыруу сайтка ийгиликтүү жарыяланды!');
    }

    setShowModal(false);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const handleDelete = (id: string, itemTitle: string) => {
    if (window.confirm(`«${itemTitle}» жаңылыгын өчүрүүнү каалайсызбы?`)) {
      onDeleteAnnouncement(id);
      setSuccessToast('✓ Жаңылык сайттан өчүрүлдү.');
      setTimeout(() => {
        setSuccessToast(null);
      }, 3500);
    }
  };

  const handleClearAllConfirm = () => {
    onClearAllAnnouncements();
    setShowClearConfirm(false);
    setSuccessToast('✓ Сайттагы бардык жарыялар тазаланды.');
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesCat = selectedCategory === 'all' || a.badgeType === selectedCategory;
    const s = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !s ||
      a.title.toLowerCase().includes(s) ||
      a.content.toLowerCase().includes(s) ||
      (a.location && a.location.toLowerCase().includes(s)) ||
      a.badge.toLowerCase().includes(s);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="p-1 hover:bg-emerald-700 rounded-lg">
            ✕
          </button>
        </div>
      )}

      {/* Announcements Dashboard Top Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-stone-900 font-display">
              Сайттын жаңылыктары жана жарыялары
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              {announcements.length}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Бул жерден сайтка сүрөт жана видеолору менен жаңылык кошуп, оңдоп же өчүрө аласыз.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Жаңылык / Жарыя кошуу</span>
          </button>

          {announcements.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Бардык жарыяларды өчүрүү"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Бардыгын өчүрүү</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Жаңылыктардан издөө..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {(['all', 'urgent', 'news', 'event', 'project'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat === 'all'
                ? 'Бардыгы'
                : cat === 'urgent'
                ? 'Маанилүү'
                : cat === 'news'
                ? 'Жаңылыктар'
                : cat === 'event'
                ? 'Иш-чаралар'
                : 'Долбоорлор'}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {announcements.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
            <Megaphone className="w-7 h-7" />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-stone-900 font-display">
            Сайтта азырынча кулактандыруу жок
          </h4>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-md mx-auto">
            Мурунку жарыялар өтүнүчүңүз боюнча толук өчүрүлдү. Жаңы жарыя же жаңылыкты сүрөт/видеосу менен жарыялоо үчүн төмөнкү баскычты басыңыз.
          </p>
          <div className="mt-5">
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Биринчи жаңылыкты кошуу</span>
            </button>
          </div>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-400 text-sm">
          Изделген суроо боюнча жаңылык табылган жок.
        </div>
      ) : (
        /* Announcements Grid in Admin */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-300 transition-all"
            >
              <div>
                {/* Media Preview Header */}
                {ann.imageUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                    <img
                      src={ann.imageUrl}
                      alt={ann.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-stone-900/80 text-white backdrop-blur-xs">
                        {ann.badge}
                      </span>
                    </div>
                    {ann.videoUrl && (
                      <div className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                        <Film className="w-3 h-3" />
                        <span>Видео</span>
                      </div>
                    )}
                  </div>
                ) : ann.videoUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-stone-900 flex items-center justify-center text-white">
                    <Film className="w-8 h-8 text-emerald-400" />
                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded">
                      Видео тиркелген
                    </span>
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-stone-900/80 text-white">
                        {ann.badge}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 pb-0 flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {ann.badge}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">{ann.date}</span>
                  </div>
                )}

                <div className="p-4">
                  {(ann.imageUrl || ann.videoUrl) && (
                    <div className="flex items-center justify-between text-xs text-stone-400 font-medium mb-1.5">
                      <span>{ann.date}</span>
                      {ann.location && <span className="text-emerald-700 truncate max-w-[150px]">{ann.location}</span>}
                    </div>
                  )}

                  <h4 className="font-bold text-stone-900 text-base font-display line-clamp-2">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1.5 line-clamp-3 leading-relaxed">
                    {ann.summary || ann.content}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewItem(ann)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200 flex items-center gap-1 cursor-pointer"
                  title="Көрүү"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Көрүү</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(ann)}
                    className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200 cursor-pointer"
                    title="Түзөтүү"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(ann.id, ann.title)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 cursor-pointer"
                    title="Өчүрүү"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT NEWS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3.5 border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 font-display">
                  {editingItem ? 'Кулактандырууну түзөтүү' : 'Жаңы жаңылык же кулактандыруу кошуу'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs sm:text-sm">
              {/* Title */}
              <div>
                <label className="block text-stone-800 font-bold mb-1">
                  Жаңылыктын темасы (Заголовок) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Мисалы: «Жаратман Ордо» жаңы сезонго ыктыярчыларды кабыл алууну ачты!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 bg-stone-50 focus:bg-white"
                />
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-800 font-bold mb-1">Категориясы (Түрү)</label>
                  <select
                    value={badgeType}
                    onChange={(e) => handleCategoryChange(e.target.value as AnnouncementCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 bg-white cursor-pointer"
                  >
                    <option value="news">Жаңылык (Официальная новость)</option>
                    <option value="urgent">Маанилүү кулактандыруу (Срочно)</option>
                    <option value="event">Иш-чара / Форум (Событие)</option>
                    <option value="project">Маданий долбоор (Проект)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-800 font-bold mb-1">Бейджик жазуусу</label>
                  <input
                    type="text"
                    placeholder="ЖАҢЫЛЫК же МААНИЛҮҮ"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 bg-stone-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-800 font-bold mb-1">Убактысы / Күнү</label>
                  <input
                    type="text"
                    placeholder="2026-2027 Жаңы Сезон"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 bg-stone-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-800 font-bold mb-1">Локациясы (милдеттүү эмес)</label>
                  <input
                    type="text"
                    placeholder="Бишкек ш., «Жаратман Ордо» борбордук залы"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 bg-stone-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-stone-800 font-bold mb-1">
                  Кыскача мазмуну (Анонс)
                </label>
                <textarea
                  rows={2}
                  placeholder="Сайттын башкы бетинде кыскача көрүнүүчү сүйлөм..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 bg-stone-50 focus:bg-white"
                />
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-stone-800 font-bold mb-1">
                  Толук тексти *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Жаңылыктын же кулактандыруунун толук жазылышы..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 bg-stone-50 focus:bg-white"
                />
              </div>

              {/* PHOTO UPLOAD & URL */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-stone-800">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Сүрөт кошуу (Фото)</span>
                  </div>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Сүрөттү өчүрүү ✕
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="file"
                    ref={photoFileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoFileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Телефондон же компьютерден сүрөт тандоо</span>
                  </button>

                  <span className="text-xs text-stone-400 text-center sm:text-left">же</span>

                  <input
                    type="text"
                    placeholder="Сүрөттүн URL шилтемесин коюу (https://...)"
                    value={imageUrl.startsWith('data:') ? 'Сүрөт файлдан жүктөлдү ✓' : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={imageUrl.startsWith('data:')}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:border-emerald-600 disabled:bg-emerald-50 disabled:text-emerald-800"
                  />
                </div>

                {/* Photo Preview */}
                {imageUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden border border-emerald-300 max-h-48 w-full bg-stone-100 flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-h-48 object-contain rounded-xl"
                    />
                  </div>
                )}
              </div>

              {/* VIDEO UPLOAD & URL */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-stone-800">
                    <Film className="w-4 h-4 text-emerald-600" />
                    <span>Видео кошуу (YouTube же видео жүктөө)</span>
                  </div>
                  {videoUrl && (
                    <button
                      type="button"
                      onClick={() => setVideoUrl('')}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Видеону өчүрүү ✕
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="YouTube шилтемеси (https://www.youtube.com/watch?v=... же https://youtu.be/...)"
                    value={videoUrl.startsWith('data:') ? 'Видео файлдан жүктөлдү ✓' : videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    disabled={videoUrl.startsWith('data:')}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:border-emerald-600 disabled:bg-emerald-50 disabled:text-emerald-800"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={videoFileInputRef}
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>же Телефондон/компьютерден видео файл жүктөө (.mp4)</span>
                    </button>
                  </div>
                </div>

                {/* Video Preview */}
                {videoUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-emerald-300 bg-black aspect-video w-full max-h-56">
                    {getYouTubeEmbedUrl(videoUrl) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(videoUrl)!}
                        title="Video Preview"
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={videoUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Action Text */}
              <div>
                <label className="block text-stone-800 font-bold mb-1">
                  Баскычтын тексти (Милдеттүү эмес)
                </label>
                <input
                  type="text"
                  placeholder="Анкета толтуруу"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 bg-stone-50 focus:bg-white"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold cursor-pointer"
                >
                  Жокко чыгаруу
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{editingItem ? 'Өзгөртүүлөрдү сактоо' : 'Сайтка жарыялоо'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800">
                {previewItem.badge}
              </span>
              <span className="text-xs text-stone-400 font-mono">{previewItem.date}</span>
            </div>

            <h3 className="text-xl font-bold font-display text-stone-900 mb-3">
              {previewItem.title}
            </h3>

            {previewItem.imageUrl && (
              <div className="rounded-2xl overflow-hidden mb-3 border border-stone-200 max-h-72 bg-stone-100">
                <img
                  src={previewItem.imageUrl}
                  alt={previewItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {previewItem.videoUrl && (
              <div className="rounded-2xl overflow-hidden mb-3 border border-stone-200 bg-black aspect-video w-full">
                {getYouTubeEmbedUrl(previewItem.videoUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(previewItem.videoUrl)!}
                    title="Video"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={previewItem.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}

            <div className="bg-stone-50 p-4 rounded-2xl text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line mb-4 border border-stone-200">
              {previewItem.content}
              {previewItem.location && (
                <div className="mt-2 pt-2 border-t border-stone-200 text-emerald-800 font-semibold flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{previewItem.location}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold cursor-pointer text-xs"
              >
                Жабуу
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL CONFIRMATION MODAL */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-900">
              Бардык жарыяларды өчүрүүнү каалайсызбы?
            </h4>
            <p className="text-xs text-stone-500 mt-1.5">
              Бул аракет сайттагы бардык {announcements.length} кулактандырууну толук өчүрөт.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Жокко чыгаруу
              </button>
              <button
                onClick={handleClearAllConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shadow"
              >
                Ооба, бардыгын өчүрүү
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
