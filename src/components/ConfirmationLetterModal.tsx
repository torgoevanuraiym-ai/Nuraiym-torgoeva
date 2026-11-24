import React, { useState } from 'react';
import { VolunteerApplication } from '../types';
import {
  CheckCircle,
  Copy,
  Printer,
  X,
  QrCode,
  ArrowRight,
  Award,
  FolderGit2,
  MapPin,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface ConfirmationLetterModalProps {
  application: VolunteerApplication | null;
  onClose: () => void;
  onViewInTable: () => void;
  lang: Language;
}

export const ConfirmationLetterModal: React.FC<ConfirmationLetterModalProps> = ({
  application,
  onClose,
  onViewInTable,
  lang,
}) => {
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[lang].confirmModal;

  if (!application) return null;

  const deptList = TRANSLATIONS[lang].departments.items;
  const deptObj = deptList.find((d) => d.id === application.department);
  const deptTitle = deptObj ? deptObj.title : application.department;

  const letterText = `
«ЖАРАТМАН ОРДО» ЧЫГАРМАЧЫЛ ЖАШТАР УЮМУ
РАСМИЙ ТАСТЫКТООЧУ КАТ (ЫРАСТОО)

Катталуу номери: ${application.id}
Талапкер: ${application.fullName}
Дареги: ${application.address}
Тандалган багыт: ${deptTitle}
Катталган убактысы: ${application.submittedAt}
Тастыкталган сертификаттары: ${application.certificates.length} даана
Аткарган долбоорлору: ${application.pastProjects.length} долбоор

Урматтуу ${application.fullName}!
Сиздин «Жаратман Ордо» чыгармачыл жаштар уюмунун 2026–2027-жылкы волонтерлук кабылдамасына жиберген анкетаңыз, камерадан тартылган сүрөтүңүз жана тиркелген долбоорлоруңуз ийгиликтүү кабыл алынды жана бирдиктүү маалымат базасына катталды.

«Жаратман Ордо» Башкармалыгы жана Координаторлор штабы
Бишкек ш., Кыргызстан
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-emerald-900/20 overflow-hidden my-6">
        {/* Top Emerald Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Жабуу"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-emerald-400 to-teal-200 shrink-0 overflow-hidden">
              <img
                src="/assets/aistudio/_________56eb9da0.jpeg"
                alt="Жаратман Ордо герби"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-300">
                {t.successBadge}
              </span>
              <h3 className="text-lg sm:text-2xl font-bold font-display text-white">
                {t.title}
              </h3>
            </div>
          </div>

          <div className="mt-2 text-xs text-emerald-200">
            {t.registeredNote}
          </div>
        </div>

        {/* Printable Letter & Badge Content */}
        <div id="printable-confirmation-letter" className="p-5 sm:p-8 space-y-6 text-stone-800">
          {/* Header of Letter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-800/40 shrink-0">
                <img
                  src="/assets/aistudio/_________56eb9da0.jpeg"
                  alt="Жаратман Ордо"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  «Жаратман Ордо» чыгармачыл жаштар уюму
                </div>
                <div className="text-sm text-stone-500 font-mono mt-0.5">
                  ID: <span className="font-bold text-stone-900">{application.id}</span>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs text-stone-500">Убакыт</div>
              <div className="text-sm font-semibold text-stone-900 font-mono">
                {application.submittedAt}
              </div>
            </div>
          </div>

          {/* Official Candidate Badge with Camera-captured Photo */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-50 to-emerald-50/40 border border-emerald-200/80 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Live Camera Photo Frame */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-emerald-600/70 overflow-hidden bg-stone-200 shrink-0 shadow-md">
              {application.selfiePhotoUrl || application.photo3x4Url ? (
                <img
                  src={application.selfiePhotoUrl || application.photo3x4Url}
                  alt={application.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-stone-500 text-center p-2">
                  Сүрөт
                </div>
              )}
            </div>

            {/* Candidate Credentials */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  {t.candidateBadge}
                </span>
                <h4 className="text-lg sm:text-xl font-extrabold text-stone-900 font-display">
                  {application.fullName}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-400 block">{t.deptLabel}</span>
                  <span className="text-stone-900 font-bold">{deptTitle}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">{t.ageLabel}</span>
                  <span className="text-stone-900 font-mono font-bold">{application.age} жашта</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-stone-400 block flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 inline" />
                    <span>{t.addressLabel}</span>
                  </span>
                  <span className="text-stone-900 font-medium">{application.address}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-stone-400 block">{t.achieveLabel}</span>
                  <span className="text-emerald-800 font-bold">
                    {application.certificates.length} серт. · {application.pastProjects.length} долб.
                  </span>
                </div>
                {application.otherOrganizations && (
                  <div className="sm:col-span-2 pt-1 border-t border-emerald-200/60 text-xs">
                    <span className="text-stone-500 block font-medium">Башка долбоорлордо/уюмдарда:</span>
                    <span className="text-stone-900 font-semibold">
                      {application.otherOrganizations.isMember
                        ? `Ооба (${application.otherOrganizations.details || 'Мүчө'})`
                        : 'Жок (башка уюмда жок)'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attached Credentials Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 mb-1">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Сертификаттары ({application.certificates.length}):</span>
              </div>
              <ul className="text-stone-600 space-y-1 list-disc list-inside">
                {application.certificates.map((c, i) => (
                  <li key={i} className="truncate">
                    {c.title} {c.issuer && `(${c.issuer})`}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 mb-1">
                <FolderGit2 className="w-4 h-4 text-emerald-700" />
                <span>Аткарган долбоорлору ({application.pastProjects.length}):</span>
              </div>
              <ul className="text-stone-600 space-y-1 list-disc list-inside">
                {application.pastProjects.map((p, i) => (
                  <li key={i} className="truncate">
                    {p.title} — <span className="text-stone-500">{p.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-emerald-50/60 rounded-2xl p-4 sm:p-5 border border-emerald-100 space-y-2 text-xs sm:text-sm text-emerald-950">
            <div className="font-bold text-emerald-900 uppercase tracking-wide text-xs">
              {t.nextStepsTitle}
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-stone-700 text-xs">
              {t.nextSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>

          {/* Stamp & Verification */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <div>
              <div className="font-bold text-stone-800">«Жаратман ордо» Координациялык штабы</div>
              <div>Бишкек шаары, Кыргызстан</div>
            </div>
            <div className="flex items-center gap-2 text-emerald-800 font-mono text-[11px]">
              <QrCode className="w-8 h-8 text-emerald-800" />
              <div className="text-right">
                <span className="block font-bold">VERIFIED</span>
                <span className="text-stone-400">{application.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="bg-stone-50 p-4 sm:p-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>{t.printBtn}</span>
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4 text-stone-600" />
              <span>{copied ? t.copiedBtn : t.copyBtn}</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onViewInTable();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <span>{t.viewInAdminBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
