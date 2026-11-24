import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Lock, Eye, Clock, UserCheck } from 'lucide-react';
import { Language } from '../data/translations';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const POLICY_COPY: Record<
  Language,
  {
    badge: string;
    title: string;
    intro: string;
    sections: {
      title: string;
      body: string;
    }[];
    closeBtn: string;
  }
> = {
  ky: {
    badge: 'КУПУЯЛУУЛУК САЯСАТЫ',
    title: 'Жеке маалыматтарды иштетүү саясаты',
    intro:
      '«Жаратман Ордо» чыгармачыл жаштар уюму талапкерлердин жеке маалыматтарын коопсуз сактоого милдеттенет.',
    sections: [
      {
        title: '1. Кандай маалыматтар чогултулат?',
        body: 'Толук аты-жөнүңүз (ФИО), дарегиңиз, жашыңыз, камерадан тартылган же жүктөлгөн сүрөтүңүз, шыктарыңыз, мотивацияңыз, сертификаттарыңыз жана буга чейинки долбоорлоруңуз.',
      },
      {
        title: '2. Чогултуунун максаты',
        body: 'Маалыматтар бир гана «Жаратман Ордо» уюмунун 2026–2027-жылкы волонтерлорду кабыл алуу жана тандоо жараянын өткөрүү үчүн колдонулат.',
      },
      {
        title: '3. Ким көрө алат жана коопсуздук',
        body: 'Анкеталарды уюмдун ыйгарым укуктуу координаторлору гана корголгон админ-панель аркылуу көрө алышат. Маалыматтар коммерциялык максатта колдонулбайт жана үчүнчү жактарга берилбейт.',
      },
      {
        title: '4. Сактоо мөөнөтү',
        body: 'Маалыматтар демейки боюнча 12 ай (365 күн) сакталат, мөөнөтү бүткөндөн кийин серверден автоматтык түрдө өчүрүлөт.',
      },
      {
        title: '5. Талапкердин укуктары',
        body: 'Сиз каалаган убакта координаторлорго (+996 709 040 598) кайрылып, жеке маалыматыңызды оңдоону же мөөнөтүнөн мурда өчүрүүнү талап кылууга укуктуусуз.',
      },
    ],
    closeBtn: 'Түшүнүктүү, жабуу',
  },
  ru: {
    badge: 'ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ',
    title: 'Обработка персональных данных',
    intro:
      'Творческая молодёжная организация «Жаратман Ордо» обеспечивает защиту и конфиденциальность персональных данных кандидатов.',
    sections: [
      {
        title: '1. Какие данные мы собираем',
        body: 'ФИО, адрес, возраст, фотография с камеры или загруженное фото, навыки, мотивация, сведения о сертификатах и реализованных проектах.',
      },
      {
        title: '2. Цель обработки',
        body: 'Данные используются исключительно для рассмотрения заявок и отбора волонтёров «Жаратман Ордо» на сезон 2026–2027.',
      },
      {
        title: '3. Доступ и конфиденциальность',
        body: 'Доступ к анкетам имеют только координаторы организации через защищённую админ-панель. Персональные данные не передаются третьим лицам.',
      },
      {
        title: '4. Срок хранения',
        body: 'Срок хранения анкет по умолчанию составляет 12 месяцев (365 дней), после чего записи автоматически удаляются с сервера.',
      },
      {
        title: '5. Ваши права',
        body: 'Вы вправе в любой момент обратиться к координаторам (+996 709 040 598) с запросом на исправление или удаление своих персональных данных.',
      },
    ],
    closeBtn: 'Закрыть',
  },
  en: {
    badge: 'PRIVACY POLICY',
    title: 'Personal Data Protection Notice',
    intro:
      '«Jaratman Ordo» Creative Youth Organization is committed to safeguarding applicants’ personal data.',
    sections: [
      {
        title: '1. Data We Collect',
        body: 'Full name, address, age, camera snapshot or uploaded photo, skills, motivation, certificates, and past projects.',
      },
      {
        title: '2. Purpose of Processing',
        body: 'Information is collected solely for reviewing applications and selecting volunteers for the 2026–2027 intake.',
      },
      {
        title: '3. Access & Confidentiality',
        body: 'Only authorized organization coordinators can view applications via the protected admin panel. Data is never shared with or sold to third parties.',
      },
      {
        title: '4. Retention Period',
        body: 'Records are stored for 12 months (365 days) by default and automatically deleted from the server afterward.',
      },
      {
        title: '5. Your Rights',
        body: 'You may contact the coordinators (+996 709 040 598) at any time to request correction or deletion of your personal data.',
      },
    ],
    closeBtn: 'Close',
  },
};

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const copy = POLICY_COPY[lang];

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const icons = [
    <UserCheck key="u" className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />,
    <ShieldCheck key="s" className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />,
    <Eye key="e" className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />,
    <Clock key="c" className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />,
    <Lock key="l" className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />,
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[120] overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-title"
    >
      <div
        className="bg-white text-stone-900 rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-emerald-200 relative my-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label={copy.closeBtn}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 block">
              {copy.badge}
            </span>
            <h3
              id="privacy-policy-title"
              className="text-lg sm:text-xl font-extrabold font-display text-stone-900"
            >
              {copy.title}
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-5">
          {copy.intro}
        </p>

        <div className="space-y-3">
          {copy.sections.map((sec, idx) => (
            <div
              key={sec.title}
              className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3"
            >
              {icons[idx % icons.length]}
              <div>
                <div className="text-xs sm:text-sm font-bold text-stone-900 mb-1">
                  {sec.title}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{sec.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-sm"
          >
            {copy.closeBtn}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
