import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, MessageCircle, ExternalLink, ShieldCheck, Phone } from 'lucide-react';
import { Language } from '../data/translations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const PUBLIC_SHARED_URL =
  'https://ais-pre-4zafuikyn537aw3a2bs272-478519136023.asia-east1.run.app';

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, lang }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl =
    typeof window !== 'undefined' &&
    window.location.origin &&
    !window.location.origin.includes('localhost') &&
    !window.location.origin.includes('127.0.0.1')
      ? window.location.origin
      : PUBLIC_SHARED_URL;

  const handleCopy = () => {
    // Primary: Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        })
        .catch(() => {
          fallbackCopy();
        });
      return;
    }
    fallbackCopy();
  };

  const fallbackCopy = () => {
    try {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // fallback
    }
  };

  const shareText =
    lang === 'ky'
      ? '«Жаратман Ордо» чыгармачыл жаштар уюмунун волонтерлорду кабыл алуу расмий сайты:'
      : lang === 'ru'
      ? 'Официальный сайт приёма волонтёров молодёжной творческой организации «Жаратман Ордо»:'
      : 'Official volunteer intake portal of "Jaratman Ordo" Creative Youth Organization:';

  // Specific Coordinator WhatsApp link with exact prefilled greeting
  const coordinatorPrefilledMsg =
    'Саламатсызбы! «Жаратман Ордо» чыгармачыл жаштар уюмунун ишмердүүлүгү тууралуу кененирээк маалымат алгым келет.';

  const coordinatorWhatsAppUrl = `https://wa.me/996709040598?text=${encodeURIComponent(
    coordinatorPrefilledMsg
  )}`;

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText}\n${shareUrl}`
  )}`;

  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(shareText)}`;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 text-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl border border-emerald-900/60 relative my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          title="Жабуу"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-emerald-950 shrink-0">
            <Share2 className="w-6 h-6 text-stone-950" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400">
              {lang === 'ky' ? 'ТАЗА РАСМИЙ ШИЛТЕМЕ' : lang === 'ru' ? 'ЧИСТАЯ ССЫЛКА ДЛЯ КЛИЕНТА' : 'CLEAN PUBLIC LINK'}
            </span>
            <h3 className="text-xl font-bold font-display text-white">
              {lang === 'ky'
                ? 'Сайттын шилтемесин бөлүшүү'
                : lang === 'ru'
                ? 'Поделиться сайтом'
                : 'Share Website Link'}
            </h3>
          </div>
        </div>

        {/* Clean Link Guarantee Badge */}
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-600/40 text-emerald-200 text-xs sm:text-sm flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-emerald-300">
              {lang === 'ky'
                ? 'Бул шилтемеде эч кандай промпт же чаттар көрүнбөйт!'
                : lang === 'ru'
                ? 'По этой ссылке нет никаких промптов или панели разработки!'
                : 'This link contains NO prompts or developer panels!'}
            </p>
            <p className="text-emerald-400/90 text-[11px] leading-relaxed">
              {lang === 'ky'
                ? 'Шилтемени ачкан кардарлар жана волонтерлор таза, кооз жана расмий сайтты гана көрүшөт.'
                : lang === 'ru'
                ? 'Любой человек открывает чистый официальный сайт.'
                : 'Anyone who opens this link sees only the clean, complete production website.'}
            </p>
          </div>
        </div>

        {/* Link Box */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
            {lang === 'ky' ? 'Сайттын дареги (Көчүрүп жөнөтүңүз):' : lang === 'ru' ? 'Адрес сайта (Скопируйте):' : 'Website URL:'}
          </label>
          <div className="flex items-center gap-2 p-2 bg-stone-950 border border-stone-800 rounded-xl">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-emerald-300 text-xs font-mono w-full px-2 py-1 outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/50'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{lang === 'ky' ? 'Көчүрүлдү!' : lang === 'ru' ? 'Скопировано!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{lang === 'ky' ? 'Көчүрүү' : lang === 'ru' ? 'Копировать' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Share Buttons */}
        <div className="space-y-2.5 mb-5">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            {lang === 'ky' ? 'Түз мессенджерден жөнөтүү:' : lang === 'ru' ? 'Отправить через мессенджер:' : 'Share via:'}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsAppка жиберүү</span>
            </a>
            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-700/50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4 text-sky-400" />
              <span>Telegram</span>
            </a>
          </div>

          {/* Direct WhatsApp Coordinator Chat with exact prefilled question */}
          <a
            href={coordinatorWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
          >
            <Phone className="w-4 h-4 text-stone-950" />
            <span>Координаторго WhatsAppтан түз жазуу (+996 709 040 598)</span>
          </a>
        </div>

        <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-stone-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <span>{lang === 'ky' ? 'Текшерип ачып көрүү' : lang === 'ru' ? 'Открыть и проверить' : 'Open in new tab'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            {lang === 'ky' ? 'Жабуу' : lang === 'ru' ? 'Закрыть' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
