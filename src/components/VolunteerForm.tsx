import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  DepartmentId,
  VolunteerApplication,
  VolunteerCertificate,
  VolunteerPastProject,
} from '../types';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Camera,
  RotateCcw,
  Plus,
  Trash2,
  Award,
  FolderGit2,
  FileCheck,
  MapPin,
  Sparkles,
  SwitchCamera,
  Building2,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';
import { api, ApiError, SubmitVolunteerPayload } from '../api';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

interface VolunteerFormProps {
  selectedDepartmentId: DepartmentId | null;
  onSelectDepartment: (id: DepartmentId) => void;
  onSubmitSuccess: (savedRecord: VolunteerApplication) => void | Promise<void>;
  lang: Language;
}

const COMMON_SKILLS_BY_LANG: Record<Language, string[]> = {
  ky: [
    'Мобилография & Тартуу',
    'CapCut / Premiere монтаж',
    'Photoshop / Графикалык дизайн',
    'Кыргыз тилинде текст жазуу / SMM',
    'Иш-чара уюштуруу',
    'Алып баруучулук / Сахна',
    'Көркөм сүрөт / Арт',
    'Грант жана долбоор жазуу',
    'Коомдук байланыш / PR',
    'Сүрөтчүлүк & Иллюстрация',
  ],
  ru: [
    'Мобилография & Съёмка',
    'CapCut / Premiere монтаж',
    'Photoshop / Графический дизайн',
    'Копирайтинг / SMM',
    'Организация мероприятий',
    'Ведущий / Сцена',
    'Изобразительное искусство',
    'Написание грантов',
    'Связи с общественностью / PR',
    'Иллюстрация',
  ],
  en: [
    'Mobile Video & Filmmaking',
    'CapCut / Premiere Editing',
    'Photoshop / Graphic Design',
    'Copywriting & SMM',
    'Event Production',
    'Stage Host / Public Speaking',
    'Fine Arts & Painting',
    'Grant Writing',
    'Public Relations',
    'Illustration',
  ],
};

const MAX_PHOTO_DIM = 720;
const MAX_PHOTO_UPLOAD_CHARS = 550_000;
const MAX_THUMB_DIM = 240;
const MAX_THUMB_CHARS = 45_000;

async function compressPhotoForUpload(sourceDataUrl: string): Promise<string> {
  if (!sourceDataUrl || !sourceDataUrl.startsWith('data:image/')) {
    return sourceDataUrl;
  }
  // Already compact JPEG within safe margin well below 12mb JSON limit and server 600k char limit
  if (sourceDataUrl.startsWith('data:image/jpeg') && sourceDataUrl.length <= MAX_PHOTO_UPLOAD_CHARS) {
    return sourceDataUrl;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width || MAX_PHOTO_DIM;
      let h = img.height || MAX_PHOTO_DIM;
      if (w > MAX_PHOTO_DIM || h > MAX_PHOTO_DIM) {
        if (w > h) {
          h = Math.max(1, Math.round((h * MAX_PHOTO_DIM) / w));
          w = MAX_PHOTO_DIM;
        } else {
          w = Math.max(1, Math.round((w * MAX_PHOTO_DIM) / h));
          h = MAX_PHOTO_DIM;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(sourceDataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);

      for (const quality of [0.72, 0.6, 0.48, 0.36]) {
        const candidate = canvas.toDataURL('image/jpeg', quality);
        if (candidate && candidate.length <= MAX_PHOTO_UPLOAD_CHARS) {
          resolve(candidate);
          return;
        }
      }
      resolve(canvas.toDataURL('image/jpeg', 0.32));
    };
    img.onerror = () => resolve(sourceDataUrl);
    img.src = sourceDataUrl;
  });
}

function getFormErrorMessage(lang: Language, code?: string, status?: number): string {
  const normalizedCode = code || (status === 413 ? 'payload_too_large' : status === 429 ? 'too_many_submissions' : undefined);

  if (normalizedCode === 'consent_required') {
    return lang === 'ky'
      ? 'Анкетаны жөнөтүү үчүн жеке маалыматтарды иштетүүгө макулдук белгисин коюңуз.'
      : lang === 'ru'
      ? 'Для отправки анкеты необходимо согласие на обработку персональных данных.'
      : 'Consent to personal data processing is required.';
  }

  if (normalizedCode === 'photo_required' || normalizedCode === 'invalid_photo') {
    return lang === 'ky'
      ? 'Анкетаны жөнөтүү үчүн камерадан сүрөткө тартыңыз же сүрөт жүктөңүз.'
      : lang === 'ru'
      ? 'Нужно сделать фото с камеры или загрузить фотографию.'
      : 'Please take a selfie photo or upload an image before submitting.';
  }

  if (normalizedCode === 'photo_too_large') {
    return lang === 'ky'
      ? 'Сүрөт өтө чоң. Сураныч, сүрөттү кайра тартыңыз же башка сүрөт тандаңыз.'
      : lang === 'ru'
      ? 'Фото слишком большое, сделайте фото снова или выберите другое.'
      : 'Photo is too large. Please take it again or choose a smaller image.';
  }

  if (normalizedCode === 'invalid_name' || normalizedCode === 'invalid_fullName') {
    return lang === 'ky'
      ? 'Аты-жөнүңүздү толук жазыңыз (кеминде 2 белги).'
      : lang === 'ru'
      ? 'Укажите ваше имя и фамилию (минимум 2 символа).'
      : 'Please enter a valid full name (at least 2 characters).';
  }

  if (normalizedCode === 'invalid_department') {
    return lang === 'ky'
      ? 'Туура эмес багыт тандалды. Бөлүмдү кайра тандаңыз.'
      : lang === 'ru'
      ? 'Выбрано некорректное направление. Выберите направление заново.'
      : 'Invalid department selected. Please choose a department again.';
  }

  if (normalizedCode === 'too_many_submissions' || normalizedCode === 'rate_limit_exceeded' || status === 429) {
    return lang === 'ky'
      ? 'Өтө көп өтүнмө жөнөтүлдү. Кийинчерээк кайра аракет кылыңыз.'
      : lang === 'ru'
      ? 'Слишком много заявок, попробуйте позже.'
      : 'Too many submissions, please try again later.';
  }

  if (normalizedCode === 'payload_too_large' || status === 413) {
    return lang === 'ky'
      ? 'Маалыматтар өтө чоң. Сүрөттү кайра тартып же текстти кыскартып көрүңүз.'
      : lang === 'ru'
      ? 'Данные слишком большие. Уменьшите фото или сократите текст и попробуйте снова.'
      : 'Submission data is too large. Please reduce photo size or text length.';
  }

  if (normalizedCode === 'network_error' || normalizedCode === 'timeout' || status === 0) {
    return lang === 'ky'
      ? 'Сервер менен байланыш жок. Интернетти текшерип, кайра аракет кылыңыз.'
      : lang === 'ru'
      ? 'Нет связи с сервером. Проверьте подключение и попробуйте снова.'
      : 'No connection to the server. Please check your network and try again.';
  }

  const displayCode = normalizedCode || (status ? `HTTP ${status}` : 'unknown');
  return lang === 'ky'
    ? `Анкета жөнөтүлгөн жок (${displayCode}). Маалыматтарды текшерип, кайра аракет кылыңыз.`
    : lang === 'ru'
    ? `Не удалось отправить анкету (${displayCode}). Проверьте данные и попробуйте снова.`
    : `Failed to submit application (${displayCode}). Please check your data and try again.`;
}

async function createSelfieThumb(sourceDataUrl: string): Promise<string> {
  if (!sourceDataUrl || !sourceDataUrl.startsWith('data:image/')) {
    return '';
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const renderAtDim = (maxDim: number, quality: number): string => {
        let w = img.width || maxDim;
        let h = img.height || maxDim;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.max(1, Math.round((h * maxDim) / w));
            w = maxDim;
          } else {
            w = Math.max(1, Math.round((w * maxDim) / h));
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';
        ctx.drawImage(img, 0, 0, w, h);
        return canvas.toDataURL('image/jpeg', quality);
      };

      const qualities = [0.6, 0.5, 0.4, 0.3, 0.2, 0.12];
      for (const q of qualities) {
        const candidate = renderAtDim(MAX_THUMB_DIM, q);
        if (candidate && candidate.length <= MAX_THUMB_CHARS) {
          resolve(candidate);
          return;
        }
      }
      // Fallback smaller dimensions if image is exceptionally noisy
      for (const dim of [180, 140, 100]) {
        for (const q of [0.5, 0.3, 0.15]) {
          const candidate = renderAtDim(dim, q);
          if (candidate && candidate.length <= MAX_THUMB_CHARS) {
            resolve(candidate);
            return;
          }
        }
      }
      resolve(sourceDataUrl.length <= MAX_THUMB_CHARS ? sourceDataUrl : '');
    };
    img.onerror = () => {
      resolve(sourceDataUrl.length <= MAX_THUMB_CHARS ? sourceDataUrl : '');
    };
    img.src = sourceDataUrl;
  });
}

export const VolunteerForm: React.FC<VolunteerFormProps> = ({
  selectedDepartmentId,
  onSelectDepartment,
  onSubmitSuccess,
  lang,
}) => {
  const t = TRANSLATIONS[lang].form;
  const deptList = TRANSLATIONS[lang].departments.items;

  // Basic info (no email, no phone, keep address!)
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [department, setDepartment] = useState<DepartmentId>(selectedDepartmentId || 'media_smm');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [motivation, setMotivation] = useState('');
  const [availability, setAvailability] = useState(t.availOptions[1] || '10–15 hours/week');
  const [portfolioOrSocial, setPortfolioOrSocial] = useState('');

  // Other organizations / projects participation question
  const [isOtherOrgMember, setIsOtherOrgMember] = useState<boolean>(false);
  const [otherOrgDetails, setOtherOrgDetails] = useState<string>('');

  // Live Camera Photo State
  const [selfiePhotoUrl, setSelfiePhotoUrl] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mandatory Certificates state
  const [certificates, setCertificates] = useState<VolunteerCertificate[]>([
    { id: '1', title: '', issuer: '', year: '2025' },
  ]);

  // Mandatory Past Projects state
  const [pastProjects, setPastProjects] = useState<VolunteerPastProject[]>([
    { id: '1', title: '', role: '', description: '', result: '', link: '' },
  ]);

  const [consent, setConsent] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDepartmentId) {
      setDepartment(selectedDepartmentId);
    }
  }, [selectedDepartmentId]);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (overrideFacing?: 'user' | 'environment') => {
    setCameraError(null);
    stopCamera();
    const facing = overrideFacing || cameraFacing;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        lang === 'ky'
          ? 'Бул браузерде түз камера колдоого алынбайт. Төмөнкү «Телефон камерасы» же «Файлдан жүктөө» баскычтарын колдонуңуз.'
          : lang === 'ru'
          ? 'Прямая камера не поддерживается в этом браузере. Используйте кнопки «Камера телефона» или «Загрузить из файла» ниже.'
          : 'Live browser camera is unavailable. Use "Phone Camera" or "Upload from File" below.'
      );
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 720 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }
      streamRef.current = stream;
      setIsCameraActive(true);
      // Wait next frame so video element is mounted
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('muted', 'true');
          videoRef.current.setAttribute('autoplay', 'true');
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setCameraError(
        lang === 'ky'
          ? 'Камерага түз уруксат берилген жок. Төмөнкү «Телефон камерасы» же «Файлдан жүктөө» баскычтары аркылуу сүрөт тартып же тандап жүктөсөңүз болот.'
          : lang === 'ru'
          ? 'Нет прямого доступа к камере. Вы можете сделать снимок через «Камера телефона» или выбрать фото через «Загрузить из файла».'
          : 'Camera permission unavailable. Use "Phone Camera" or "Upload from File" below to attach your photo.'
      );
      setIsCameraActive(false);
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) {
      setCameraError(
        lang === 'ky'
          ? 'Камера даярдалып жатат, 1-2 секунд күтүп кайра басыңыз же «Телефон камерасы» баскычын колдонуңуз.'
          : lang === 'ru'
          ? 'Камера ещё инициализируется, подождите 1–2 секунды и нажмите снова или используйте «Камера телефона».'
          : 'Camera is still initializing. Wait a second and try again or use "Phone Camera".'
      );
      return;
    }

    const canvas = document.createElement('canvas');
    const rawSize = Math.min(video.videoWidth, video.videoHeight);
    const targetSize = Math.min(rawSize, MAX_PHOTO_DIM);
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const startX = (video.videoWidth - rawSize) / 2;
      const startY = (video.videoHeight - rawSize) / 2;
      if (cameraFacing === 'user') {
        ctx.translate(targetSize, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, startX, startY, rawSize, rawSize, 0, 0, targetSize, targetSize);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
      setSelfiePhotoUrl(dataUrl);
      stopCamera();
      setCameraError(null);
      setErrorMsg(null);
    }
  };

  // Compress & resize uploaded/captured image cleanly for mobile & storage (max 720px, JPEG 0.72)
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const finishWithDataUrl = (dataUrl: string) => {
      setSelfiePhotoUrl(dataUrl);
      stopCamera();
      setCameraError(null);
      setErrorMsg(null);
    };

    const failPhotoFormat = () => {
      const msg =
        lang === 'ky'
          ? 'Бул сүрөт форматын (мисалы HEIC) браузер ача алган жок. «Камераны иштетүү» же JPG/PNG сүрөт колдонуңуз.'
          : lang === 'ru'
          ? 'Браузер не смог обработать этот формат фото (например HEIC). Используйте встроенную камеру или JPG/PNG фото.'
          : 'This photo format could not be processed. Please use the live camera or a JPG/PNG image.';
      setCameraError(msg);
      setErrorMsg(msg);
    };

    const drawSourceToJpeg = (
      source: HTMLImageElement | ImageBitmap,
      srcW: number,
      srcH: number
    ): string => {
      let targetW = srcW || MAX_PHOTO_DIM;
      let targetH = srcH || MAX_PHOTO_DIM;
      if (targetW > MAX_PHOTO_DIM || targetH > MAX_PHOTO_DIM) {
        if (targetW > targetH) {
          targetH = Math.max(1, Math.round((targetH * MAX_PHOTO_DIM) / targetW));
          targetW = MAX_PHOTO_DIM;
        } else {
          targetW = Math.max(1, Math.round((targetW * MAX_PHOTO_DIM) / targetH));
          targetH = MAX_PHOTO_DIM;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      ctx.drawImage(source, 0, 0, targetW, targetH);
      for (const quality of [0.72, 0.58, 0.45]) {
        const candidate = canvas.toDataURL('image/jpeg', quality);
        if (candidate && candidate.length <= MAX_PHOTO_UPLOAD_CHARS) {
          return candidate;
        }
      }
      return canvas.toDataURL('image/jpeg', 0.35);
    };

    const processViaDataUrlFallback = () => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const rawDataUrl = event.target?.result;
        if (typeof rawDataUrl !== 'string') {
          failPhotoFormat();
          return;
        }
        const img = new Image();
        img.onload = () => {
          const compressed = drawSourceToJpeg(img, img.width, img.height);
          if (compressed) {
            finishWithDataUrl(compressed);
          } else if (rawDataUrl.startsWith('data:image/') && rawDataUrl.length <= 600_000) {
            finishWithDataUrl(rawDataUrl);
          } else {
            failPhotoFormat();
          }
        };
        img.onerror = async () => {
          if (typeof createImageBitmap === 'function') {
            try {
              const bitmap = await createImageBitmap(file);
              const compressed = drawSourceToJpeg(bitmap, bitmap.width, bitmap.height);
              bitmap.close?.();
              if (compressed) {
                finishWithDataUrl(compressed);
                return;
              }
            } catch {
              // continue to fallback
            }
          }
          if (rawDataUrl.startsWith('data:image/') && rawDataUrl.length <= 600_000) {
            finishWithDataUrl(rawDataUrl);
          } else {
            failPhotoFormat();
          }
        };
        img.src = rawDataUrl;
      };
      reader.onerror = () => failPhotoFormat();
      reader.readAsDataURL(file);
    };

    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const compressed = drawSourceToJpeg(img, img.width, img.height);
        if (compressed) {
          finishWithDataUrl(compressed);
        } else {
          processViaDataUrlFallback();
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        processViaDataUrlFallback();
      };
      img.src = objectUrl;
    } else {
      processViaDataUrlFallback();
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customSkill.trim()) {
      e.preventDefault();
      if (!selectedSkills.includes(customSkill.trim())) {
        setSelectedSkills([...selectedSkills, customSkill.trim()]);
      }
      setCustomSkill('');
    }
  };

  // Certificate handlers
  const handleAddCertificate = () => {
    setCertificates([
      ...certificates,
      { id: Date.now().toString(), title: '', issuer: '', year: new Date().getFullYear().toString() },
    ]);
  };

  const handleRemoveCertificate = (id: string) => {
    if (certificates.length === 1) {
      setErrorMsg(
        lang === 'ky'
          ? 'Жок дегенде бир сертификат же жетишкендикти көрсөтүү милдеттүү.'
          : 'At least one certificate is required.'
      );
      return;
    }
    setCertificates(certificates.filter((c) => c.id !== id));
  };

  const handleUpdateCertificate = (id: string, field: keyof VolunteerCertificate, val: string) => {
    setCertificates(
      certificates.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  // Past project handlers
  const handleAddProject = () => {
    setPastProjects([
      ...pastProjects,
      { id: Date.now().toString(), title: '', role: '', description: '', result: '', link: '' },
    ]);
  };

  const handleRemoveProject = (id: string) => {
    if (pastProjects.length === 1) {
      setErrorMsg(
        lang === 'ky'
          ? 'Жок дегенде бир аткарган долбооруңузду көрсөтүү милдеттүү.'
          : 'At least one past project is required.'
      );
      return;
    }
    setPastProjects(pastProjects.filter((p) => p.id !== id));
  };

  const handleUpdateProject = (id: string, field: keyof VolunteerPastProject, val: string) => {
    setPastProjects(
      pastProjects.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);

    // 1. Mandatory camera photo validation
    if (!selfiePhotoUrl) {
      setErrorMsg(getFormErrorMessage(lang, 'photo_required'));
      return;
    }

    // 2. Mandatory full name & address validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg(getFormErrorMessage(lang, 'invalid_name'));
      return;
    }

    if (!address.trim()) {
      setErrorMsg(
        lang === 'ky'
          ? 'Дарегиңизди же жашаган шаарыңызды/аймагыңызды жазыңыз.'
          : lang === 'ru'
          ? 'Укажите ваш адрес или город проживания.'
          : 'Please enter your address or city.'
      );
      return;
    }

    // 3. Mandatory certificate validation
    const validCerts = certificates.filter((c) => c.title.trim().length > 0);
    if (validCerts.length === 0) {
      setErrorMsg(
        lang === 'ky'
          ? 'Жок дегенде бир сертификатыңызды же бүтүргөн курсуңузду жазыңыз.'
          : lang === 'ru'
          ? 'Укажите хотя бы один сертификат или пройденный курс.'
          : 'Please add at least one certificate or achievement.'
      );
      return;
    }

    // 4. Mandatory past projects validation
    const validProjects = pastProjects.filter((p) => p.title.trim().length > 0);
    if (validProjects.length === 0) {
      setErrorMsg(
        lang === 'ky'
          ? 'Жок дегенде бир аткарган долбооруңузду же катышкан иш-чараңызды жазыңыз.'
          : lang === 'ru'
          ? 'Опишите хотя бы один выполненный проект или участие в мероприятии.'
          : 'Please describe at least one past project or experience.'
      );
      return;
    }

    // 5. Mandatory motivation validation
    if (!motivation.trim() || motivation.trim().length < 10) {
      setErrorMsg(
        lang === 'ky'
          ? 'Мотивацияңызды кененирээк жазыңыз (кеминде 10 белги).'
          : lang === 'ru'
          ? 'Опишите вашу мотивацию подробнее (минимум 10 символов).'
          : 'Please describe your motivation in more detail (at least 10 characters).'
      );
      return;
    }

    // 6. Mandatory personal data processing consent
    if (!consent) {
      setErrorMsg(getFormErrorMessage(lang, 'consent_required'));
      return;
    }

    setIsSubmitting(true);

    try {
      const compressedPhoto = await compressPhotoForUpload(selfiePhotoUrl);
      if (!compressedPhoto || !compressedPhoto.startsWith('data:image/')) {
        throw new ApiError(400, 'photo_required', 'photo_required');
      }
      if (compressedPhoto.length > 600_000) {
        throw new ApiError(400, 'photo_too_large', 'photo_too_large');
      }
      if (compressedPhoto !== selfiePhotoUrl) {
        setSelfiePhotoUrl(compressedPhoto);
      }

      const selfieThumb = await createSelfieThumb(compressedPhoto);

      const payload: SubmitVolunteerPayload = {
        fullName: fullName.trim(),
        address: address.trim(),
        age: age.trim() || '18+',
        cityOrUniversity: address.trim(),
        department,
        selfiePhotoUrl: compressedPhoto,
        selfieThumb: selfieThumb || undefined,
        skills: selectedSkills.length > 0 ? selectedSkills : ['Чыгармачыл демилге'],
        motivation: motivation.trim(),
        availability,
        certificates: validCerts,
        pastProjects: validProjects,
        portfolioOrSocial: portfolioOrSocial.trim(),
        otherOrganizations: {
          isMember: isOtherOrgMember,
          details: isOtherOrgMember ? otherOrgDetails.trim() : undefined,
        },
        consent: true,
      };

      const savedRecord = await api.submitVolunteer(payload);

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#047857', '#34d399', '#f59e0b', '#3b82f6'],
        });
      } catch {
        // safe
      }

      await onSubmitSuccess(savedRecord);

      // Reset form ONLY after 201 server persistence
      setFullName('');
      setAddress('');
      setAge('');
      setSelectedSkills([]);
      setMotivation('');
      setPortfolioOrSocial('');
      setSelfiePhotoUrl('');
      setIsOtherOrgMember(false);
      setOtherOrgDetails('');
      setConsent(false);
      setCertificates([{ id: '1', title: '', issuer: '', year: '2025' }]);
      setPastProjects([{ id: '1', title: '', role: '', description: '', result: '', link: '' }]);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(getFormErrorMessage(lang, err.code, err.status));
      } else {
        setErrorMsg(getFormErrorMessage(lang, 'network_error', 0));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="application-form" className="py-16 sm:py-24 bg-gradient-to-b from-stone-50 via-emerald-50/40 to-teal-50/50 text-stone-900 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wider uppercase mb-3 border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.sectionNum}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 font-display tracking-tight text-balance">
            {t.heading}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
            {t.subheading}
          </p>
        </div>

        {/* Card Container: Bright, elegant, matching emblem */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200/90 shadow-xl shadow-emerald-950/5 backdrop-blur-sm">
          <form onSubmit={handleSubmit} noValidate className="space-y-10">
            {/* 1. БӨЛҮМ: ӨЗҮН КАМЕРАДАН ТАРТУУ (СӨЗСҮЗ) */}
            <div className="p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white border border-emerald-300/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-emerald-200/70">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-900">
                    {t.sec1}
                  </span>
                </div>
                <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                  {t.sec1Req}
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Camera Viewport or Captured Photo */}
                <div className="relative group shrink-0">
                  <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl border-2 border-emerald-500 bg-stone-900 overflow-hidden flex flex-col items-center justify-center relative shadow-md">
                    {/* Mode A: Live Video Stream */}
                    {isCameraActive && (
                      <div className="w-full h-full relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className={`w-full h-full object-cover ${cameraFacing === 'user' ? '-scale-x-100' : ''}`}
                        />
                        <div className="absolute inset-0 border-2 border-emerald-400 rounded-2xl pointer-events-none" />
                        <button
                          type="button"
                          onClick={toggleCameraFacing}
                          className="absolute top-2 right-2 bg-stone-900/80 hover:bg-stone-900 text-white p-2 rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer border border-emerald-500/50"
                          title="Камераны алмаштыруу (Алдыңкы/Арткы)"
                        >
                          <SwitchCamera className="w-4 h-4 text-emerald-400" />
                        </button>
                      </div>
                    )}

                    {/* Mode B: Captured Photo */}
                    {!isCameraActive && selfiePhotoUrl && (
                      <>
                        <img
                          src={selfiePhotoUrl}
                          alt="Өзүңүздүн сүрөтүңүз"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelfiePhotoUrl('');
                            startCamera();
                          }}
                          className="absolute bottom-2 right-2 bg-stone-900/90 hover:bg-stone-800 text-emerald-300 p-2 rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer border border-emerald-600"
                          title="Кайра тартуу"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t.retakeBtn}</span>
                        </button>
                      </>
                    )}

                    {/* Mode C: Idle Placeholder */}
                    {!isCameraActive && !selfiePhotoUrl && (
                      <div className="text-center p-4 text-stone-300">
                        <Camera className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-90 animate-bounce" />
                        <span className="text-xs font-semibold block text-white">
                          {t.cameraTitle}
                        </span>
                        <span className="text-[11px] text-stone-400 block mt-1">
                          Камераны күйгүзүп тартыңыз
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Camera Controls & Fallback */}
                <div className="space-y-4 flex-1 text-center md:text-left">
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                    {t.cameraDesc}
                  </p>

                  {cameraError && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium">
                      {cameraError}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    {/* Live Snapshot Trigger Button */}
                    {isCameraActive ? (
                      <>
                        <button
                          type="button"
                          onClick={captureSnapshot}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-white" />
                          <span>{t.snapBtn}</span>
                        </button>
                        <button
                          type="button"
                          onClick={toggleCameraFacing}
                          className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-emerald-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                          title="Камераны алмаштыруу"
                        >
                          <SwitchCamera className="w-4 h-4 text-emerald-700" />
                          <span>Алмаштыруу</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-3 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold text-xs cursor-pointer"
                        >
                          Жабуу
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startCamera()}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>{selfiePhotoUrl ? t.retakeBtn : t.openCameraBtn}</span>
                        </button>

                        {/* Device Native Camera Input (opens phone camera directly) */}
                        <input
                          type="file"
                          ref={cameraInputRef}
                          accept="image/*"
                          capture="user"
                          onChange={handlePhotoFileUpload}
                          className="hidden"
                          id="deviceCameraSnap"
                        />
                        <label
                          htmlFor="deviceCameraSnap"
                          className="cursor-pointer px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 text-xs sm:text-sm font-semibold border border-emerald-300 flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <Camera className="w-4 h-4 text-emerald-700" />
                          <span>
                            {lang === 'ky'
                              ? 'Телефон камерасы'
                              : lang === 'ru'
                              ? 'Камера телефона'
                              : 'Phone Camera'}
                          </span>
                        </label>

                        {/* Device File / Gallery Upload Input (no capture attribute so users can pick any saved photo) */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handlePhotoFileUpload}
                          className="hidden"
                          id="deviceFileUpload"
                        />
                        <label
                          htmlFor="deviceFileUpload"
                          className="cursor-pointer px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold border border-stone-300 flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <ImageIcon className="w-4 h-4 text-emerald-700" />
                          <span>
                            {lang === 'ky'
                              ? 'Файлдан жүктөө'
                              : lang === 'ru'
                              ? 'Загрузить из файла'
                              : 'Upload from File'}
                          </span>
                        </label>
                      </>
                    )}

                    {selfiePhotoUrl && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-100/90 px-3 py-1.5 rounded-xl border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {t.photoAccepted}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. БӨЛҮМ: АТЫ-ЖӨНҮ ЖАНА ДАРЕГИ */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-4 pb-2 border-b border-stone-200 flex items-center justify-between">
                <span>{lang === 'ky' ? '2. Жеке маалыматтар жана дарек' : lang === 'ru' ? '2. Личные данные и адрес' : '2. Personal Information & Address'}</span>
                <span className="text-[11px] text-stone-500 lowercase font-normal">* {lang === 'ky' ? 'сөзсүз толтурулат' : 'required'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1.5">
                    {t.fullName}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.fullNamePlaceholder}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white text-sm transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1.5">
                    {t.address}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder={t.addressPlaceholder}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white text-sm transition-all shadow-xs"
                    />
                    <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    {t.addressHint}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1.5">
                    {t.age}
                  </label>
                  <input
                    type="text"
                    placeholder={t.agePlaceholder}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white text-sm transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1.5">
                    {t.instagram}
                  </label>
                  <input
                    type="text"
                    placeholder="@username же шилтеме"
                    value={portfolioOrSocial}
                    onChange={(e) => setPortfolioOrSocial(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white text-sm transition-all shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* 3. БӨЛҮМ: ЧЫГАРМАЧЫЛ БАГЫТТЫ ТАНДОО */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 pb-2 border-b border-stone-200">
                {t.sec2}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {deptList.map((d) => {
                  const isSelected = department === d.id;
                  return (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => {
                        const deptId = d.id as DepartmentId;
                        setDepartment(deptId);
                        onSelectDepartment(deptId);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/30 shadow-sm'
                          : 'bg-stone-50 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-bold ${isSelected ? 'text-emerald-900' : 'text-stone-800'}`}>
                            {d.title}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                          {d.shortDesc}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-emerald-700 mt-2 block">
                        {d.quota}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. БӨЛҮМ: БАШКА ДОЛБООРЛОРДО / УЮМДАРДА МҮЧӨЛҮК (КОЛДОНУУЧУНУН ӨТҮНҮЧҮ) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/40 border border-emerald-200/90 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-900">
                  {t.otherOrgTitle}
                </span>
              </div>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                {t.otherOrgDesc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setIsOtherOrgMember(false)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    !isOtherOrgMember
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-300 hover:border-emerald-300'
                  }`}
                >
                  <span>{t.otherOrgNo}</span>
                  {!isOtherOrgMember && <Check className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOtherOrgMember(true)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isOtherOrgMember
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-300 hover:border-emerald-300'
                  }`}
                >
                  <span>{t.otherOrgYes}</span>
                  {isOtherOrgMember && <Check className="w-4 h-4" />}
                </button>
              </div>

              {isOtherOrgMember && (
                <div className="animate-in fade-in slide-in-from-top-1">
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Уюмдун/долбоордун аталышы жана ролуңуз *
                  </label>
                  <input
                    type="text"
                    required={isOtherOrgMember}
                    value={otherOrgDetails}
                    onChange={(e) => setOtherOrgDetails(e.target.value)}
                    placeholder={t.otherOrgPlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 text-xs sm:text-sm shadow-xs"
                  />
                </div>
              )}
            </div>

            {/* 5. БӨЛҮМ: СЕРТИФИКАТТАР (СӨЗСҮЗ) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    {t.sec3}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddCertificate}
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.certAddBtn}</span>
                </button>
              </div>

              <p className="text-xs text-stone-600">
                {t.certDesc}
              </p>

              <div className="space-y-3">
                {certificates.map((cert, idx) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 font-mono">
                        Сертификат #{idx + 1}
                      </span>
                      {certificates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCertificate(cert.id)}
                          className="text-stone-400 hover:text-red-500 text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Өчүрүү</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          {t.certName}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Мисалы: SMM Pro же IT Базалык курс"
                          value={cert.title}
                          onChange={(e) => handleUpdateCertificate(cert.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          {t.certIssuer}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Академия / Уюм"
                          value={cert.issuer}
                          onChange={(e) => handleUpdateCertificate(cert.id, 'issuer', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. БӨЛҮМ: АТКАРГАН ДОЛБООРЛОРУ (СӨЗСҮЗ) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    {t.sec4}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.projAddBtn}</span>
                </button>
              </div>

              <p className="text-xs text-stone-600">
                {t.projDesc}
              </p>

              <div className="space-y-4">
                {pastProjects.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 font-mono">
                        {t.projNum} #{idx + 1}
                      </span>
                      {pastProjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(proj.id)}
                          className="text-stone-400 hover:text-red-500 text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Өчүрүү</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          {t.projTitle}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="«Жаштар арт-көргөзмөсү 2025»"
                          value={proj.title}
                          onChange={(e) => handleUpdateProject(proj.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          {t.projRole}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Мобилограф / Координатор / Дизайнер"
                          value={proj.role}
                          onChange={(e) => handleUpdateProject(proj.id, 'role', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        {t.projDescLabel}
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Кандай иштерди аткардыңыз, эмнелерге жетиштиңиз?"
                        value={proj.description}
                        onChange={(e) => handleUpdateProject(proj.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. БӨЛҮМ: ШЫКТАР, МОТИВАЦИЯ ЖАНА УБАКЫТ */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 pb-2 border-b border-stone-200">
                {t.sec5}
              </div>

              {/* Skills buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {COMMON_SKILLS_BY_LANG[lang].map((skill) => {
                  const active = selectedSkills.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'bg-stone-50 text-stone-700 border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {skill}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1.5">
                    {t.motivationLabel}
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder={t.motivationPlaceholder}
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white text-sm transition-all shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1.5">
                      {t.availLabel}
                    </label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white text-sm cursor-pointer shadow-xs"
                    >
                      {t.availOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-stone-800 mb-1.5">
                      {t.portfolioLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={t.portfolioPlaceholder}
                      value={portfolioOrSocial}
                      onChange={(e) => setPortfolioOrSocial(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white text-sm shadow-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mandatory Personal Data Consent */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/90">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked) setErrorMsg(null);
                  }}
                  className="mt-1 w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                />
                <span className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {lang === 'ky' ? (
                    <>
                      Мен жеке маалыматтарымды (аты-жөнүм, дарегим, жашым, сүрөтүм, сертификаттарым жана долбоорлорум) иштетүүгө макулмун жана{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsPrivacyOpen(true);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-2 cursor-pointer"
                      >
                        Купуялуулук саясаты
                      </button>{' '}
                      менен тааныштым. *
                    </>
                  ) : lang === 'ru' ? (
                    <>
                      Я даю согласие на обработку моих персональных данных и ознакомился(ась) с{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsPrivacyOpen(true);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-2 cursor-pointer"
                      >
                        Политикой конфиденциальности
                      </button>
                      . *
                    </>
                  ) : (
                    <>
                      I agree to the processing of my personal data and have read the{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsPrivacyOpen(true);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-2 cursor-pointer"
                      >
                        Privacy Policy
                      </button>
                      . *
                    </>
                  )}
                </span>
              </label>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-stone-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl text-stone-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 font-extrabold text-base transition-all shadow-xl shadow-emerald-600/20 active:scale-98 flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    <span>{t.submittingBtn}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 text-stone-950" />
                    <span>{t.submitBtn}</span>
                  </>
                )}
              </button>

              {errorMsg && (
                <div
                  role="alert"
                  className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-300 text-red-700 text-xs sm:text-sm flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-stone-500 mt-3 text-center">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.safeNote}</span>
              </div>
            </div>
          </form>
        </div>
      </div>

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        lang={lang}
      />
    </section>
  );
};
