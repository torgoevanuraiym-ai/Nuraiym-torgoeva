import React, { useState, useEffect } from 'react';
import { KeyRound, AlertCircle, CheckCircle2, X, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Language } from '../data/translations';
import { ApiError } from '../api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  lang: Language;
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  lang,
  onSubmit,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setError(null);
      setSuccessMsg(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copy =
    lang === 'ky'
      ? {
          eyebrow: 'КООПСУЗДУК',
          title: 'Админ сырсөзүн өзгөртүү',
          desc: 'Админ панелдин сырсөзүн өзүңүз каалаган сырсөзгө жаңылаңыз. Кийинки кирүүлөр жаңы сырсөз менен аткарылат.',
          currentLabel: 'Учурдагы сырсөз',
          newLabel: 'Жаңы сырсөз (кеминде 6 белги)',
          confirmLabel: 'Жаңы сырсөздү кайталаңыз',
          emptyError: 'Бардык талааларды толтуруңуз.',
          shortError: 'Жаңы сырсөз кеминде 6 белгиден турушу керек.',
          longError: 'Жаңы сырсөз 128 белгиден ашпашы керек.',
          mismatchError: 'Жаңы сырсөздөр дал келбей жатат.',
          wrongCurrentError: 'Учурдагы сырсөз туура эмес.',
          connError: 'Сервер менен байланышууда ката кетти. Кайра аракет кылыңыз.',
          successText: '✓ Сырсөз ийгиликтүү жаңыланды!',
          cancelBtn: 'Жабуу',
          saveBtn: 'Сырсөздү сактоо',
          savingBtn: 'Сакталууда...',
          footerNote: 'Сакталган соң учурдагы сессияңыз үзүлбөйт',
        }
      : lang === 'ru'
      ? {
          eyebrow: 'БЕЗОПАСНОСТЬ',
          title: 'Сменить пароль администратора',
          desc: 'Установите удобный для вас пароль для входа в админ-панель.',
          currentLabel: 'Текущий пароль',
          newLabel: 'Новый пароль (минимум 6 символов)',
          confirmLabel: 'Повторите новый пароль',
          emptyError: 'Заполните все поля.',
          shortError: 'Новый пароль должен содержать минимум 6 символов.',
          longError: 'Новый пароль не должен превышать 128 символов.',
          mismatchError: 'Новые пароли не совпадают.',
          wrongCurrentError: 'Текущий пароль неверен.',
          connError: 'Ошибка соединения с сервером. Попробуйте ещё раз.',
          successText: '✓ Пароль успешно обновлён!',
          cancelBtn: 'Закрыть',
          saveBtn: 'Сохранить пароль',
          savingBtn: 'Сохранение...',
          footerNote: 'Ваша текущая сессия останется активной',
        }
      : {
          eyebrow: 'SECURITY',
          title: 'Change Admin Password',
          desc: 'Set a custom password for future admin panel logins.',
          currentLabel: 'Current password',
          newLabel: 'New password (min 6 characters)',
          confirmLabel: 'Confirm new password',
          emptyError: 'Please fill in all fields.',
          shortError: 'New password must be at least 6 characters.',
          longError: 'New password must be at most 128 characters.',
          mismatchError: 'New passwords do not match.',
          wrongCurrentError: 'Current password is incorrect.',
          connError: 'Connection error. Please try again.',
          successText: '✓ Password updated successfully!',
          cancelBtn: 'Close',
          saveBtn: 'Save Password',
          savingBtn: 'Saving...',
          footerNote: 'Your current session will remain active',
        };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(copy.emptyError);
      return;
    }

    if (newPassword.trim().length < 6) {
      setError(copy.shortError);
      return;
    }

    if (newPassword.length > 128) {
      setError(copy.longError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(copy.mismatchError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg(copy.successText);
      window.setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'invalid_current_password' || err.status === 401) {
          setError(copy.wrongCurrentError);
        } else if (err.code === 'password_too_short') {
          setError(copy.shortError);
        } else if (err.code === 'password_too_long') {
          setError(copy.longError);
        } else {
          setError(copy.connError);
        }
      } else {
        setError(copy.connError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-stone-900 text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-emerald-900/60 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          title={copy.cancelBtn}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-emerald-950 shrink-0">
            <KeyRound className="w-6 h-6 text-stone-950" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400">
              {copy.eyebrow}
            </span>
            <h3 className="text-xl font-bold font-display text-white">
              {copy.title}
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-5">
          {copy.desc}
        </p>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/90 border border-red-700 text-red-200 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              {copy.currentLabel}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                autoFocus
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              {copy.newLabel}
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              {copy.confirmLabel}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs mt-3 pt-2.5 border-t border-stone-800/80 text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{copy.footerNote}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              {copy.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-stone-950 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? copy.savingBtn : copy.saveBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
