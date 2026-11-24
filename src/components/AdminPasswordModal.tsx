import React, { useState, useEffect } from 'react';
import { Lock, AlertCircle, X, ShieldCheck, Eye, EyeOff, KeyRound } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';
import { ApiError } from '../api';

interface AdminPasswordModalProps {
  isOpen: boolean;
  isConfigured: boolean;
  lang: Language;
  onLogin: (password: string) => Promise<void>;
  onSetup?: (password: string) => Promise<void>;
  onClose: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  isConfigured,
  lang,
  onLogin,
  onSetup,
  onClose,
}) => {
  const t = TRANSLATIONS[lang].passwordModal;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showResetHelp, setShowResetHelp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSetupMode = !isConfigured && Boolean(onSetup);

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setConfirmPassword('');
      setError(null);
      setShowPass(false);
      setShowConfirmPass(false);
      setShowResetHelp(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getLocalizedError = (err: unknown): string => {
    if (err instanceof ApiError) {
      if (err.status === 429 || err.code === 'too_many_attempts') {
        return lang === 'ky'
          ? 'Кирүү аракети өтө көп болду. Коопсуздук үчүн 15 мүнөттөн кийин кайра аракет кылыңыз.'
          : lang === 'ru'
          ? 'Слишком много попыток входа. Попробуйте снова через 15 минут.'
          : 'Too many login attempts. Please try again in 15 minutes.';
      }
      if (err.code === 'password_too_short') {
        return lang === 'ky'
          ? 'Жаңы сырсөз кеминде 6 белгиден турушу керек.'
          : lang === 'ru'
          ? 'Новый пароль должен содержать минимум 6 символов.'
          : 'New password must be at least 6 characters.';
      }
      if (err.code === 'password_too_long') {
        return lang === 'ky'
          ? 'Сырсөз 128 белгиден ашпашы керек.'
          : lang === 'ru'
          ? 'Пароль не должен превышать 128 символов.'
          : 'Password must be at most 128 characters.';
      }
      if (err.code === 'already_configured') {
        return lang === 'ky'
          ? 'Сырсөз мурунтан эле орнотулган. Баракчаны жаңыртып, учурдагы сырсөз менен кириңиз.'
          : lang === 'ru'
          ? 'Пароль уже настроен. Обновите страницу и войдите с текущим паролем.'
          : 'Password is already configured. Refresh and sign in with your password.';
      }
      if (err.status === 503 || err.code === 'admin_not_configured') {
        return lang === 'ky'
          ? 'Серверде админ сырсөзү (ADMIN_PASSWORD) коюлган эмес.'
          : lang === 'ru'
          ? 'Вход недоступен: переменная окружения ADMIN_PASSWORD не задана на сервере.'
          : 'Admin login is unavailable: ADMIN_PASSWORD is not configured on the server.';
      }
      if (err.status === 401 || err.code === 'invalid_password') {
        return t.wrongPassError;
      }
    }
    return lang === 'ky'
      ? 'Сервер менен байланышууда ката кетти. Кайра аракет кылыңыз.'
      : lang === 'ru'
      ? 'Ошибка соединения с сервером. Попробуйте ещё раз.'
      : 'Connection error. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = password.trim();
    if (!trimmed) {
      setError(t.emptyError);
      return;
    }

    if (isSetupMode && onSetup) {
      if (trimmed.length < 6) {
        setError(
          lang === 'ky'
            ? 'Жаңы сырсөз кеминде 6 белгиден турушу керек.'
            : lang === 'ru'
            ? 'Новый пароль должен содержать минимум 6 символов.'
            : 'New password must be at least 6 characters.'
        );
        return;
      }
      if (trimmed !== confirmPassword.trim()) {
        setError(t.mismatchError);
        return;
      }

      setIsSubmitting(true);
      try {
        await onSetup(trimmed);
        setPassword('');
        setConfirmPassword('');
      } catch (err) {
        setError(getLocalizedError(err));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onLogin(password);
      setPassword('');
    } catch (err) {
      setError(getLocalizedError(err));
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
          title={t.cancelBtn}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-emerald-950 shrink-0">
            {isSetupMode ? (
              <KeyRound className="w-6 h-6 text-stone-950" />
            ) : (
              <Lock className="w-6 h-6 text-stone-950" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400">
              {isSetupMode
                ? lang === 'ky'
                  ? 'БИРИНЧИ ЖОЛУ ОРНОТУУ'
                  : lang === 'ru'
                  ? 'ПЕРВИЧНАЯ НАСТРОЙКА'
                  : 'FIRST-TIME SETUP'
                : lang === 'ky'
                ? 'КИРҮҮ ТЕКШЕРҮҮСҮ'
                : lang === 'ru'
                ? 'ПРОВЕРКА ДОСТУПА'
                : 'SECURITY ACCESS'}
            </span>
            <h3 className="text-xl font-bold font-display text-white">
              {isSetupMode ? t.firstTimeTitle : t.enterTitle}
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-5">
          {isSetupMode ? t.firstTimeDesc : t.enterDesc}
        </p>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/90 border border-red-700 text-red-200 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              {isSetupMode ? t.newPassLabel : t.enterPassLabel}
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                autoFocus
                autoComplete={isSetupMode ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passPlaceholder}
                className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                title={showPass ? 'Жашыруу' : 'Көрсөтүү'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSetupMode && (
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                {t.confirmPassLabel}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.passPlaceholder}
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                  title={showConfirmPass ? 'Жашыруу' : 'Көрсөтүү'}
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 text-xs pt-2.5 border-t border-stone-800/80 text-stone-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                {lang === 'ky'
                  ? 'Корголгон кирүү'
                  : lang === 'ru'
                  ? 'Защищённый вход'
                  : 'Protected access'}
              </span>
            </div>
            {!isSetupMode && (
              <button
                type="button"
                onClick={() => setShowResetHelp((prev) => !prev)}
                className="text-[11px] text-emerald-400/90 hover:text-emerald-300 underline underline-offset-2 cursor-pointer"
              >
                {lang === 'ky'
                  ? 'Сырсөздү унуттуңузбу?'
                  : lang === 'ru'
                  ? 'Забыли пароль?'
                  : 'Forgot password?'}
              </button>
            )}
          </div>

          {showResetHelp && !isSetupMode && (
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-300 leading-relaxed">
              {lang === 'ky'
                ? 'Коопсуздук үчүн сырсөздү башка адамдар өзгөртө албайт. Эгер мурунку сырсөздү унутсаңыз, хостинг же AI Studio чөйрөсүндөгү ADMIN_PASSWORD секретин жаңылаңыз (же бошотуп койсоңуз, ушул терезеден жаңы сырсөз түзүү формасы ачылат).'
                : lang === 'ru'
                ? 'В целях безопасности сбросить пароль с публичной ссылки нельзя. Обновите переменную окружения ADMIN_PASSWORD на хостинге / в Secrets (или очистите её, чтобы задать новый пароль здесь).'
                : 'For security, passwords cannot be reset publicly. Update ADMIN_PASSWORD in your hosting or Secrets environment (or clear it to set a new password here).'}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-stone-950 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? lang === 'ky'
                  ? 'Текшерилүүдө...'
                  : lang === 'ru'
                  ? 'Проверка...'
                  : 'Signing in...'
                : isSetupMode
                ? t.savePassBtn
                : t.unlockBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
