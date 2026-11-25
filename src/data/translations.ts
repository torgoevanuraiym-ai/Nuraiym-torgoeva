// UI translations for Jaratman Ordo (ky / ru / en)
export type Language = 'ky' | 'ru' | 'en';

export interface Translations {
  nav: {
    title: string;
    subtitle: string;
    announcements: string;
    departments: string;
    about: string;
    faq: string;
    adminPanel: string;
    applyBtn: string;
    backToSite: string;
  };
  hero: {
    kicker: string;
    headlinePart1: string;
    headlineHighlight: string;
    headlinePart2: string;
    subtitle: string;
    photoReq: string;
    certReq: string;
    confReq: string;
    adminReq: string;
    applyNow: string;
    viewDepts: string;
    graduates: string;
    creativeDepts: string;
    projectsHeld: string;
    autoSystem: string;
    officialEmblem: string;
  };
  departments: {
    sectionNum: string;
    heading: string;
    subheading: string;
    mainRoles: string;
    skillsNeeded: string;
    applyToDept: string;
    items: {
      id: string;
      title: string;
      shortDesc: string;
      fullDesc: string;
      quota: string;
      roles: string[];
      skills: string[];
    }[];
  };
  about: {
    sectionNum: string;
    heading: string;
    card1Badge: string;
    card1Title: string;
    card1Desc: string;
    card2Badge: string;
    card2Title: string;
    card2Desc: string;
    benefitsTitle: string;
    benefit1Title: string;
    benefit1Desc: string;
    benefit2Title: string;
    benefit2Desc: string;
    benefit3Title: string;
    benefit3Desc: string;
    benefit4Title: string;
    benefit4Desc: string;
  };
  form: {
    sectionNum: string;
    heading: string;
    subheading: string;
    sec1: string;
    sec1Req: string;
    cameraTitle: string;
    cameraDesc: string;
    openCameraBtn: string;
    snapBtn: string;
    retakeBtn: string;
    cameraError: string;
    photoAccepted: string;
    fullName: string;
    fullNamePlaceholder: string;
    address: string;
    addressPlaceholder: string;
    addressHint: string;
    age: string;
    agePlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    instagram: string;
    sec2: string;
    sec3: string;
    certAddBtn: string;
    certDesc: string;
    certName: string;
    certIssuer: string;
    certYear: string;
    sec4: string;
    projAddBtn: string;
    projDesc: string;
    projNum: string;
    projTitle: string;
    projRole: string;
    projDescLabel: string;
    projLink: string;
    sec5: string;
    motivationLabel: string;
    motivationPlaceholder: string;
    availLabel: string;
    availOptions: string[];
    portfolioLabel: string;
    portfolioPlaceholder: string;
    otherOrgTitle: string;
    otherOrgDesc: string;
    otherOrgNo: string;
    otherOrgYes: string;
    otherOrgPlaceholder: string;
    submitBtn: string;
    submittingBtn: string;
    safeNote: string;
  };
  confirmModal: {
    successBadge: string;
    title: string;
    registeredNote: string;
    candidateBadge: string;
    deptLabel: string;
    addressLabel: string;
    phoneLabel: string;
    ageLabel: string;
    achieveLabel: string;
    nextStepsTitle: string;
    nextSteps: string[];
    printBtn: string;
    copyBtn: string;
    copiedBtn: string;
    viewInAdminBtn: string;
  };
  admin: {
    title: string;
    subtitle: string;
    badge: string;
    viewTable: string;
    viewCards: string;
    exportBtn: string;
    exportCsvAll: string;
    exportSuccess: string;
    copyShareableLink: string;
    shareableLinkCopied: string;
    addBtn: string;
    exitBtn: string;
    changePasswordBtn: string;
    lockBtn: string;
    allTab: string;
    newTab: string;
    interviewTab: string;
    acceptedTab: string;
    archiveTab: string;
    searchPlaceholder: string;
    allDepts: string;
    allStatuses: string;
    statusFilterLabel: string;
    colPhoto: string;
    colCandidate: string;
    colDept: string;
    colAddress: string;
    colCerts: string;
    colProjects: string;
    colStatus: string;
    colActions: string;
    stNew: string;
    stInterview: string;
    stAccepted: string;
    stWaitlist: string;
    stArchived: string;
    statusLabel: string;
    changeStatus: string;
  };
  passwordModal: {
    firstTimeTitle: string;
    firstTimeDesc: string;
    enterTitle: string;
    enterDesc: string;
    newPassLabel: string;
    confirmPassLabel: string;
    passPlaceholder: string;
    enterPassLabel: string;
    savePassBtn: string;
    unlockBtn: string;
    cancelBtn: string;
    mismatchError: string;
    wrongPassError: string;
    emptyError: string;
    changeTitle: string;
    currentPassLabel: string;
    changeSuccess: string;
  };
  faq: {
    sectionNum: string;
    heading: string;
    subheading: string;
    items: { q: string; a: string }[];
  };
  footer: {
    desc: string;
    sectionsTitle: string;
    contactsTitle: string;
    city: string;
    madeWithLove: string;
    rights: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  "ky": {
    "nav": {
      "title": "Жаратман Ордо",
      "subtitle": "чыгармачыл жаштар уюму",
      "announcements": "Кулактандыруулар",
      "departments": "Багыттар",
      "about": "Биз жөнүндө",
      "faq": "Суроолор",
      "adminPanel": "Админ Панель",
      "applyBtn": "Анкета толтуруу",
      "backToSite": "Башкы сайтка өтүү"
    },
    "hero": {
      "kicker": "«Жаратман Ордо» уюму · Ыктыярчыларды кабыл алуу · 2026–2027",
      "headlinePart1": "Чыгармачылыгыңды коомго багытта.",
      "headlineHighlight": "Жаратмандардын",
      "headlinePart2": "катарына кошул!",
      "subtitle": "«Жаратман Ордо» чыгармачыл жаштар уюму жаңы сезондо таланттуу ыктыярчыларды чакырат. Өзүңүздү камерадан тартып, сертификат жана долбоорлоруңуз менен командага кошулуңуз.",
      "photoReq": "Өзүңүздү камерадан тартып жиберүү",
      "certReq": "Сертификат жана долбоорлор тиркелет",
      "confReq": "Автоматтык ырастоочу кат & Бейжик",
      "adminReq": "Координаторлордун корголгон маалымат базасы",
      "applyNow": "Анкетаны азыр толтуруу",
      "viewDepts": "5 Багытты көрүү",
      "graduates": "Бүтүрүүчү ыктыярчылар",
      "creativeDepts": "Чыгармачыл багыт",
      "projectsHeld": "Ири маданий иш-чара",
      "autoSystem": "Автоматтык база & Ырастоо",
      "officialEmblem": "«Жаратман Ордонун» расмий герби"
    },
    "departments": {
      "sectionNum": "01. Тандоо багыттары",
      "heading": "Өз дараметиңди кайсы чыгармачыл багытта өнүктүргүң келет?",
      "subheading": "«Жаратман Ордодо» ар бир волонтер өз кызыгуусуна жараша тандап, кесипкөй менторлор менен чогуу реалдуу иш тажрыйба топтоого мүмкүнчүлүк алат.",
      "mainRoles": "Негизги ролдор",
      "skillsNeeded": "Талап кылынган шыктар",
      "applyToDept": "Бул багытка анкета толтуруу",
      "items": [
        {
          "id": "media_smm",
          "title": "Медиа жана SMM",
          "shortDesc": "Мобилография, фото/видео монтаж, Reels, графикалык дизайн жана контент жаратуу.",
          "fullDesc": "Бул багыт «Жаратман Ордонун» бардык иш-чараларын коомчулукка сапаттуу жеткирет. Заманбап тренддерди колдонуп визуалдык жана тексттик контент өндүрөсүз.",
          "quota": "12 орун",
          "roles": [
            "Мобилограф",
            "Видеомонтажер",
            "Графикалык дизайнер",
            "Копирайтер",
            "SMM адиси"
          ],
          "skills": [
            "CapCut/Premiere",
            "Photoshop/Canva",
            "Storytelling",
            "Эстетикалык табит"
          ]
        },
        {
          "id": "event_mgmt",
          "title": "Иш-чаралар жана Эвент",
          "shortDesc": "Жаштар форумдарын, маданий кечелерди, көргөзмө жана концерттерди уюштуруу.",
          "fullDesc": "Креативдүү идеяларды реалдуу масштабдуу иш-чарага айландыруучу команда. Локация табуу, сценарий жазуу, техникалык камсыздоо жана конокторду тосуп алуу иштерин башкарасыз.",
          "quota": "15 орун",
          "roles": [
            "Эвент-менеджер",
            "Логист / Администратор",
            "Сценарист",
            "Координатор"
          ],
          "skills": [
            "Тез чечим кабыл алуу",
            "Уюштуруучулук",
            "Стресске туруктуулук",
            "Команда менен иштөө"
          ]
        },
        {
          "id": "art_culture",
          "title": "Арт жана Чыгармачылык",
          "shortDesc": "Музыка, театр, көркөм сүрөт, адабият жана автордук перформанстар.",
          "fullDesc": "Чыгармачыл жаштардын өз талантын ачып, жаӊы арт-долбоорлорду, маданий программаларды жана театралдаштырылган кечелерди даярдоочу борбордук канат.",
          "quota": "10 орун",
          "roles": [
            "Аткаруучу / Музыкант",
            "Актёр / Алып баруучу",
            "Сүрөтчү / Иллюстратор",
            "Поэт / Драматург"
          ],
          "skills": [
            "Сахна маданияты",
            "Чыгармачыл ой жүгүртүү",
            "Импровизация",
            "Көркөм чеберчилик"
          ]
        },
        {
          "id": "projects_grants",
          "title": "Долбоорлор жана Фандрайзинг",
          "shortDesc": "Коомдук демилгелер, гранттык табыштамалар жана узак мөөнөттүү долбоорлор.",
          "fullDesc": "Идеяларды жазып, грант берүүчү уюмдарга сунуштоо, долбоорлорду пландоо жана алардын натыйжалуулугун өлчөө. Эл аралык жана жергиликтүү фонддор менен өнөктөштүк курасыз.",
          "quota": "8 орун",
          "roles": [
            "Долбоордук менеджер",
            "Грантрайтер",
            "Фандрайзер",
            "Мониторинг адиси"
          ],
          "skills": [
            "Аналитикалык ой жүгүртүү",
            "Долбоор жазуу",
            "Презентация жасоо",
            "Критикалык ой"
          ]
        },
        {
          "id": "pr_outreach",
          "title": "PR жана Коомчулук",
          "shortDesc": "ЖМК, блогерлер, спикерлер жана расмий өнөктөштөр менен кызматташуу.",
          "fullDesc": "Уюмдун кадыр-баркын көтөрүү, белгилүү коомдук ишмерлер менен мамиле түзүү, демөөрчүлөрдү тартуу жана маалыматтык өнөктөштүктү камсыз кылуу.",
          "quota": "8 орун",
          "roles": [
            "PR адиси",
            "Спикерлер менеджери",
            "Партнёршип координатору",
            "Пресс-катчы"
          ],
          "skills": [
            "Эркин сүйлөшүү (Networking)",
            "Дипломатия",
            "Байланыш куруу",
            "Иштиктүү кат алышуу"
          ]
        }
      ]
    },
    "about": {
      "sectionNum": "02. Биз жөнүндө & Мүмкүнчүлүктөр",
      "heading": "«Жаратман Ордо» — жаңы муундагы чыгармачыл демилгелердин ордосу",
      "card1Badge": "Иш-чаралар",
      "card1Title": "Жаштар фестивалдары & Концерттер",
      "card1Desc": "Чоң сахналарда жана коомдук жайларда өткөрүлгөн эстен кеткис маданий долбоорлор.",
      "card2Badge": "Медиа устаканасы",
      "card2Title": "Креативдүү контент жана долбоорлор",
      "card2Desc": "Заманбап техникалар менен иштөө, видео тартуу жана тажрыйба алмашуу.",
      "benefitsTitle": "«Жаратман Ордонун» ыктыярчысы болуу менен эмнеге ээ болосуз?",
      "benefit1Title": "Расмий сертификат жана сунуштама кат (Recommendation letter)",
      "benefit1Desc": "Өз багытыңызда жигердүү салым кошкондон кийин жумушка же чет өлкөлүк гранттарга тапшыруу үчүн тастыкталган сунуштама кат берилет.",
      "benefit2Title": "Мыкты нетворкинг жана лидерлик чөйрө",
      "benefit2Desc": "Кыргызстандын алдыңкы креативдүү адистери, медиа жылдыздары жана спикерлери менен түздөн-түз баарлашуу мүмкүнчүлүгү.",
      "benefit3Title": "Өз идеяларыңызды реалдуу долбоорго айлантуу",
      "benefit3Desc": "Бизде ар бир жаратмандын идеясы колдоого алынат. Уюмдун ресурстары менен өз автордук демилгеңизди ишке ашырыңыз.",
      "benefit4Title": "Ынтымактуу жаратмандар үй-бүлөсү",
      "benefit4Desc": "Чогуу эс алуу, тимбилдингдер, тоолорго саякаттар жана жаштар арасындагы бекем достук."
    },
    "form": {
      "sectionNum": "03. Кабылдама анкетасы (2026–2027)",
      "heading": "Ыктыярчылардын расмий кабылдамасы",
      "subheading": "Сураныч, камерадан өзүңүздү тартып жибериңиз, дарегиңизди, сертификаттарыңызды жана аткарган долбоорлоруңузду толук киргизиңиз.",
      "sec1": "1. Өзүңүздү камерадан тартып жибериңиз (Сөзсүз) *",
      "sec1Req": "Түз камерадан тартуу",
      "cameraTitle": "Камерадан өзүңүздү тартыңыз",
      "cameraDesc": "Камераны күйгүзүп, жүзүңүз так көрүнгөн селфи сүрөтүңүздү тартыңыз. Бул сүрөт сиздин расмий бейжигиңизде чагылдырылат.",
      "openCameraBtn": "Камераны иштетүү жана тартуу",
      "snapBtn": "Сүрөткө тартуу",
      "retakeBtn": "Кайра тартуу",
      "cameraError": "Камерага уруксат берилген жок же жеткиликтүү эмес. Төмөндөгү баскыч менен камерадан тартып жүктөңүз:",
      "photoAccepted": "Сүрөт тартылды жана кабыл алынды ✓",
      "fullName": "Толук аты-жөнүңүз *",
      "fullNamePlaceholder": "Мисалы: Айбийке Асанова",
      "address": "Дарегиңиз (шаары, көчөсү же окуу жайы) *",
      "addressPlaceholder": "Мисалы: Бишкек ш., 7-кичи район же КУУ кампусу",
      "addressHint": "Уюм менен байланышуу жана координация үчүн дарегиңиз калат.",
      "age": "Жашыңыз",
      "agePlaceholder": "Мисалы: 20",
      "phone": "Телефон номериңиз (WhatsApp) *",
      "phonePlaceholder": "Мисалы: +996 700 123 456",
      "instagram": "Жеке Instagram аккаунтуңуз же портфолио",
      "sec2": "2. Каалаган чыгармачыл багытты тандаңыз *",
      "sec3": "3. Сертификаттар жана жетишкендиктер (Сөзсүз) *",
      "certAddBtn": "Дагы сертификат кошуу",
      "certDesc": "Буга чейин окуган курстарыңыздын, тил, IT, дизайн, лидерлик же уюштуруучулук сертификаттарын киргизиңиз.",
      "certName": "Сертификаттын аталышы *",
      "certIssuer": "Берген уюм же академия",
      "certYear": "Жылы",
      "sec4": "4. Буга чейин аткарган долбоорлоруңуз (Сөзсүз) *",
      "projAddBtn": "Дагы долбоор кошуу",
      "projDesc": "Буга чейин уюштурган же катышкан иш-чараңыз, видеолоруңуз, дизайндарыңыз, социалдык демилгеңиз же жеке долбооруңузду жазыңыз.",
      "projNum": "Долбоор",
      "projTitle": "Долбоордун / Иш-чаранын аталышы *",
      "projRole": "Сиздин аткарган ролуңуз *",
      "projDescLabel": "Кыскача сыпаттамасы жана натыйжасы *",
      "projLink": "Шилтеме же портфолио далили (Кааласаңыз)",
      "sec5": "5. Шыктар, мотивация жана убакыт",
      "motivationLabel": "Эмне үчүн «Жаратман Ордону» тандадыңыз жана командага кандай салым кошо аласыз? *",
      "motivationPlaceholder": "Өзүңүз, кызыгууларыңыз жана уюмдан эмне күтөөрүңүз жөнүндө жазыңыз...",
      "availLabel": "Убакыт бөлүү мүмкүнчүлүгүңүз",
      "availOptions": [
        "Аптасына 5–8 саат",
        "Аптасына 10–15 саат (Сунушталат)",
        "Аптасына 20+ саат (Толук жигердүү)",
        "Иш-чаралар күндөрү гана"
      ],
      "portfolioLabel": "Жалпы портфолио же резюме (шилтеме)",
      "portfolioPlaceholder": "Google Drive, Behance же башка шилтеме",
      "otherOrgTitle": "Башка долбоорлордо же жаштар уюмдарында мүчөсүзбү?",
      "otherOrgDesc": "Мисалы, башка коомдук долбоорлордо, клубдарда же ушундай уюмдарда иш тажрыйбаңыз барбы?",
      "otherOrgNo": "Жок, башка уюмда/долбоордо мүчө эмесмин",
      "otherOrgYes": "Ооба, башка долбоордо/уюмда катышам",
      "otherOrgPlaceholder": "Кайсы уюм же долбоор? (Мисалы: \"Жаштар демилгеси\" уюмунда волонтер же мобилограф)",
      "submitBtn": "Анкетаны тапшыруу жана бейжикти алуу",
      "submittingBtn": "Сүрөт жана табыштама базага катталып жатат...",
      "safeNote": "Камерадан тартылган же жүктөлгөн сүрөт, дарек, сертификаттар жана долбоорлор координаторлордун корголгон базасына автоматтык түшөт"
    },
    "confirmModal": {
      "successBadge": "Кабылдама ийгиликтүү бүттү",
      "title": "Расмий тастыктоочу кат & Бейжик",
      "registeredNote": "Табыштама базага автоматтык катталды",
      "candidateBadge": "Талапкердин бейжиги",
      "deptLabel": "Багыты:",
      "addressLabel": "Дареги:",
      "phoneLabel": "Телефон номери:",
      "ageLabel": "Жашы:",
      "achieveLabel": "Жетишкендиктер:",
      "nextStepsTitle": "Кийинки кадамдар:",
      "nextSteps": [
        "Координаторлор анкетаңызды жана тартылган сүрөтүңүздү карап чыгат.",
        "Сиздин көрсөтүлгөн дарегиңиз жана маалыматтарыңыз боюнча топко чакыруу берилет.",
        "«Жаратман Ордонун» иш-чаралары тууралуу жаңылыктарды билип туруңуз."
      ],
      "printBtn": "Басып чыгаруу / PDF",
      "copyBtn": "Текстти көчүрүү",
      "copiedBtn": "Көчүрүлдү!",
      "viewInAdminBtn": "Башкы бетке кайтуу"
    },
    "admin": {
      "title": "«Жаратман Ордо» Админ Панели",
      "subtitle": "Ыктыярчылардын бирдиктүү маалымат таблицасы жана кабылдама штабы",
      "badge": "КООРДИНАТОР ПОРТАЛЫ",
      "viewTable": "Таблица",
      "viewCards": "Карточкалар",
      "exportBtn": "CSVге көчүрүү (Excel)",
      "exportCsvAll": "Бардык арыздарды CSVге көчүрүү",
      "exportSuccess": "CSV файлы жүктөлдү! Оффлайн иштөөгө даяр.",
      "copyShareableLink": "Шилтемени көчүрүү",
      "shareableLinkCopied": "Шилтеме көчүрүлдү!",
      "addBtn": "Талапкер кошуу",
      "exitBtn": "Сайтка чыгуу",
      "changePasswordBtn": "Паролду өзгөртүү",
      "lockBtn": "Сессияны жабуу",
      "allTab": "Бардык анкеталар",
      "newTab": "Жаңы түшкөндөр",
      "interviewTab": "Маектешүүдө",
      "acceptedTab": "Кабыл алынгандар",
      "archiveTab": "Резерв / Архив",
      "searchPlaceholder": "Аты-жөнү, ID, дареги, сертификат же долбоор боюнча издөө...",
      "allDepts": "Бардык чыгармачыл багыттар",
      "allStatuses": "Бардык статустар",
      "statusFilterLabel": "Статусу боюнча фильтр",
      "colPhoto": "Тартылган сүрөтү",
      "colCandidate": "Талапкер",
      "colDept": "Багыты",
      "colAddress": "Дареги / Шаары",
      "colCerts": "Сертификаттары",
      "colProjects": "Долбоорлору",
      "colStatus": "Статусу",
      "colActions": "Кароо",
      "stNew": "Жаңы",
      "stInterview": "Маектешүүдө",
      "stAccepted": "Кабыл алынды",
      "stWaitlist": "Резервде",
      "stArchived": "Архив",
      "statusLabel": "Статусун өзгөртүү:",
      "changeStatus": "Өзгөртүү"
    },
    "passwordModal": {
      "firstTimeTitle": "Коопсуздук сырсөзүн коюу",
      "firstTimeDesc": "Маалыматтар коопсуз сакталышы үчүн координатордун жеке сырсөзү коюлат.",
      "enterTitle": "Коопсуздук текшерүүсү",
      "enterDesc": "Бул бөлүмгө координаторлор гана кире алат. Сырсөздү жазыңыз.",
      "newPassLabel": "Жаңы сырсөз түзүңүз",
      "confirmPassLabel": "Сырсөздү тастыктаңыз",
      "passPlaceholder": "Сырсөздү жазыңыз...",
      "enterPassLabel": "Координатордун сырсөзү",
      "savePassBtn": "Сактоо жана кирүү",
      "unlockBtn": "Кирүү",
      "cancelBtn": "Жокко чыгаруу",
      "mismatchError": "Сырсөздөр дал келген жок. Кайра текшерип жазыңыз.",
      "wrongPassError": "Сырсөз туура эмес! Башка адамдар кире албайт.",
      "emptyError": "Сураныч, сырсөздү толук жазыңыз (жок дегенде 4 белги).",
      "changeTitle": "Сырсөздү алмаштыруу",
      "currentPassLabel": "Учурдагы сырсөз",
      "changeSuccess": "Сырсөз ийгиликтүү алмаштырылды!"
    },
    "faq": {
      "sectionNum": "04. Көп берилүүчү суроолор",
      "heading": "Волонтерлук тууралуу бардык суроолорго жооптор",
      "subheading": "Кошумча суроолор болсо, координаторлор менен байланышсаңыз болот.",
      "items": [
        {
          "q": "Кимдер «Жаратман Ордонун» волонтеру боло алат?",
          "a": "14 жаштан 30 жашка чейинки бардык демилгелүү, чыгармачылыкка, искусствого, медиага же коомдук долбоорлорго кызыккан жаштар катыша алат."
        },
        {
          "q": "Окуу же жумуш менен чогуу айкалыштырууга болобу?",
          "a": "Ооба, албетте! Волонтерлордун графиги студенттер менен окуучулардын убактысына ылайыкташтырылат. Аптасына 8–15 саат жетиштүү."
        },
        {
          "q": "Кабыл алуу процесси кандай этаптардан турат?",
          "a": "1-этап: Ушул сайтта анкетаны толтуруу жана селфи тартуу. 2-этап: Координаторлордун тандоосу. 3-этап: Достук маектешүү. 4-этап: Командага кошулуу."
        },
        {
          "q": "Ырастоочу кат жана расмий сертификат берилеби?",
          "a": "Ооба! Анкетаны жиберген замат тартылган сүрөтүңүз жана QR-коду бар расмий тастыктоочу бейжик чыгат."
        }
      ]
    },
    "footer": {
      "desc": "Кыргызстандын таланттуу, креативдүү жана алдыга умтулган жаштарын бир туунун алдына бириктирип, маданият, медиа жана коомдук долбоорлорду ишке ашырган чыгармачыл ордо.",
      "sectionsTitle": "Бөлүмдөр",
      "contactsTitle": "Байланыш жана Штаб",
      "city": "Кыргыз Республикасы, Бишкек шаары",
      "madeWithLove": "Кыргызстандын жаштары үчүн сүйүү менен жаралган",
      "rights": "«Жаратман Ордо» чыгармачыл жаштар уюму. Бардык укуктар корголгон."
    }
  },
  "ru": {
    "nav": {
      "title": "Жаратман Ордо",
      "subtitle": "молодёжная творческая организация",
      "announcements": "Объявления",
      "departments": "Направления",
      "about": "О нас",
      "faq": "Вопросы",
      "adminPanel": "Админ-панель",
      "applyBtn": "Заполнить анкету",
      "backToSite": "На главную"
    },
    "hero": {
      "kicker": "«Жаратман Ордо» · Набор волонтёров · 2026–2027",
      "headlinePart1": "Направь творчество на благо общества.",
      "headlineHighlight": "Стань частью",
      "headlinePart2": "команды созидателей!",
      "subtitle": "Творческая молодёжная организация «Жаратман Ордо» объявляет набор волонтёров. Сделайте прямое селфи-фото на камеру, прикрепите адрес, сертификаты и проекты.",
      "photoReq": "Снимок себя на камеру (Селфи)",
      "certReq": "Прикрепление сертификатов и проектов",
      "confReq": "Электронное подтверждение и бейдж",
      "adminReq": "Защищённая база координаторов",
      "applyNow": "Заполнить анкету сейчас",
      "viewDepts": "Смотреть 5 направлений",
      "graduates": "Выпускников-волонтёров",
      "creativeDepts": "Творческих направлений",
      "projectsHeld": "Крупных культурных проектов",
      "autoSystem": "Автоматическая база & подтверждение",
      "officialEmblem": "Официальная эмблема «Жаратман Ордо»"
    },
    "departments": {
      "sectionNum": "01. Направления отбора",
      "heading": "В каком творческом направлении вы хотите развиваться?",
      "subheading": "В «Жаратман Ордо» каждый волонтёр выбирает сферу по интересам и получает реальный практический опыт работы вместе с опытными наставниками.",
      "mainRoles": "Основные роли",
      "skillsNeeded": "Требуемые навыки",
      "applyToDept": "Подать анкету на это направление",
      "items": [
        {
          "id": "media_smm",
          "title": "Медиа и SMM",
          "shortDesc": "Мобилография, видеомонтаж, Reels, графический дизайн и создание вирусного контента.",
          "fullDesc": "Это направление освещает все проекты и мероприятия организации. Вы научитесь профессиональному видеомонтажу, созданию сторителлинга и продвижению в соцсетях.",
          "quota": "12 мест",
          "roles": [
            "Мобилограф",
            "Видеомонтажёр",
            "Графический дизайнер",
            "Копирайтер",
            "SMM-специалист"
          ],
          "skills": [
            "CapCut/Premiere",
            "Photoshop/Canva",
            "Storytelling",
            "Визуальный вкус"
          ]
        },
        {
          "id": "event_mgmt",
          "title": "Ивент и Мероприятия",
          "shortDesc": "Организация молодёжных форумов, культурных вечеров, выставок и концертов.",
          "fullDesc": "Команда, которая воплощает масштабные идеи в жизнь: выбор локаций, сценарии, техническое сопровождение и координация гостей.",
          "quota": "15 мест",
          "roles": [
            "Ивент-менеджер",
            "Логист / Администратор",
            "Сценарист",
            "Координатор"
          ],
          "skills": [
            "Организованность",
            "Стрессоустойчивость",
            "Командная работа",
            "Решение задач"
          ]
        },
        {
          "id": "art_culture",
          "title": "Арт и Творчество",
          "shortDesc": "Музыка, театр, изобразительное искусство, литература и перформансы.",
          "fullDesc": "Центральное крыло для раскрытия талантов: подготовка авторских номеров, театрализованных постановок и художественных выставок.",
          "quota": "10 мест",
          "roles": [
            "Исполнитель / Музыкант",
            "Актёр / Ведущий",
            "Художник / Иллюстратор",
            "Поэт"
          ],
          "skills": [
            "Сценическая культура",
            "Креативное мышление",
            "Импровизация",
            "Мастерство"
          ]
        },
        {
          "id": "projects_grants",
          "title": "Проекты и Фандрайзинг",
          "shortDesc": "Общественные инициативы, грантовые заявки и долгосрочные социальные стартапы.",
          "fullDesc": "Написание проектных заявок для международных фондов, планирование бюджетов и оценка социального эффекта культурных инициатив.",
          "quota": "8 мест",
          "roles": [
            "Проектный менеджер",
            "Грантрайтер",
            "Фандрайзер",
            "Специалист мониторинга"
          ],
          "skills": [
            "Аналитика",
            "Написание грантов",
            "Презентация",
            "Критическое мышление"
          ]
        },
        {
          "id": "pr_outreach",
          "title": "PR и Связи с общественностью",
          "shortDesc": "Сотрудничество со СМИ, блогерами, спикерами и официальными партнёрами.",
          "fullDesc": "Укрепление репутации организации, взаимодействие с лидерами мнений, привлечение спонсоров и информационная поддержка.",
          "quota": "8 мест",
          "roles": [
            "PR-специалист",
            "Менеджер спикеров",
            "Координатор партнёрств",
            "Пресс-секретарь"
          ],
          "skills": [
            "Нетворкинг",
            "Дипломатия",
            "Переговоры",
            "Деловая переписка"
          ]
        }
      ]
    },
    "about": {
      "sectionNum": "02. О нас и Возможности",
      "heading": "«Жаратман Ордо» — платформа творческих инициатив нового поколения",
      "card1Badge": "Мероприятия",
      "card1Title": "Молодёжные фестивали и концерты",
      "card1Desc": "Масштабные культурные события на главных площадках города Бишкек.",
      "card2Badge": "Медиа-лаборатория",
      "card2Title": "Креативный контент и воркшопы",
      "card2Desc": "Обучение работе с современной техникой, съемка качественного видео и обмен опытом.",
      "benefitsTitle": "Что вы получите, став волонтёром «Жаратман Ордо»?",
      "benefit1Title": "Официальный сертификат и рекомендательное письмо",
      "benefit1Desc": "Подтверждение вашего вклада для поступления в зарубежные вузы или устройства на работу.",
      "benefit2Title": "Сильный нетворкинг и лидерская среда",
      "benefit2Desc": "Прямое общение с ведущими экспертами креативной индустрии, блогерами и спикерами Кыргызстана.",
      "benefit3Title": "Реализация собственных авторских идей",
      "benefit3Desc": "Мы поддерживаем инициативы каждого волонтёра ресурсами организации.",
      "benefit4Title": "Дружная команда единомышленников",
      "benefit4Desc": "Тимбилдинги, выезды в горы, совместные проекты и крепкая дружба."
    },
    "form": {
      "sectionNum": "03. Анкета кандидата (2026–2027)",
      "heading": "Официальный приём волонтёров",
      "subheading": "Пожалуйста, сделайте селфи-снимок себя на камеру, укажите адрес, сертификаты и проекты. Данные автоматически поступят в координационный штаб.",
      "sec1": "1. Сделайте снимок себя на камеру (Обязательно) *",
      "sec1Req": "Снимок с камеры",
      "cameraTitle": "Сделайте селфи-снимок себя",
      "cameraDesc": "Включите камеру и сделайте четкий снимок лица. Фото будет размещено на вашем волонтёрском бейдже.",
      "openCameraBtn": "Включить камеру и сделать снимок",
      "snapBtn": "Сделать снимок",
      "retakeBtn": "Переснять",
      "cameraError": "Камера недоступна. Вы можете сделать фото камерой устройства:",
      "photoAccepted": "Снимок сделан и принят ✓",
      "fullName": "Полное имя (ФИО) *",
      "fullNamePlaceholder": "Например: Айбийке Асанова",
      "address": "Ваш адрес (город, улица или учебное заведение) *",
      "addressPlaceholder": "Например: г. Бишкек, 7-мкр или кампус КНУ",
      "addressHint": "Адрес сохраняется для координации и подтверждения участия.",
      "age": "Ваш возраст",
      "agePlaceholder": "Например: 20",
      "phone": "Ваш номер телефона (WhatsApp) *",
      "phonePlaceholder": "Например: +996 700 123 456",
      "instagram": "Ваш профиль в Instagram или портфолио",
      "sec2": "2. Выберите творческое направление *",
      "sec3": "3. Сертификаты и достижения (Обязательно) *",
      "certAddBtn": "Добавить ещё сертификат",
      "certDesc": "Укажите сертификаты курсов, языковых программ, IT, дизайна или волонтёрских школ.",
      "certName": "Название сертификата *",
      "certIssuer": "Организация / Академия",
      "certYear": "Год",
      "sec4": "4. Ваши предыдущие проекты (Обязательно) *",
      "projAddBtn": "Добавить ещё проект",
      "projDesc": "Расскажите о проектах, мероприятиях, видеороликах или инициативах, в которых вы участвовали.",
      "projNum": "Проект",
      "projTitle": "Название проекта / мероприятия *",
      "projRole": "Ваша роль *",
      "projDescLabel": "Краткое описание и результат *",
      "projLink": "Ссылка на подтверждение (по желанию)",
      "sec5": "5. Навыки, мотивация и свободное время",
      "motivationLabel": "Почему вы выбрали «Жаратман Ордо» и какой вклад хотите внести? *",
      "motivationPlaceholder": "Расскажите о себе, ваших интересах и целях...",
      "availLabel": "Сколько времени можете уделять?",
      "availOptions": [
        "5–8 часов в неделю",
        "10–15 часов в неделю (Рекомендуется)",
        "20+ часов в неделю (Активное участие)",
        "Только в дни мероприятий"
      ],
      "portfolioLabel": "Портфолио / Резюме (ссылка)",
      "portfolioPlaceholder": "Google Drive, Behance или иная ссылка",
      "otherOrgTitle": "Участвуете ли вы в других проектах или молодёжных организациях?",
      "otherOrgDesc": "Есть ли у вас текущий опыт или членство в других организациях / клубах?",
      "otherOrgNo": "Нет, в других проектах/организациях не состою",
      "otherOrgYes": "Да, участвую в других проектах/организациях",
      "otherOrgPlaceholder": "В какой организации или проекте? (Например: волонтёр или мобилограф в проекте...)",
      "submitBtn": "Отправить анкету и получить бейдж",
      "submittingBtn": "Сохранение заявки в базе...",
      "safeNote": "Снимок с камеры или загруженное фото, адрес, сертификаты и проекты сохраняются в защищённой базе"
    },
    "confirmModal": {
      "successBadge": "Заявка успешно принята",
      "title": "Официальное подтверждение и Бейдж",
      "registeredNote": "Заявка автоматически внесена в реестр",
      "candidateBadge": "Бейдж кандидата",
      "deptLabel": "Направление:",
      "addressLabel": "Адрес:",
      "phoneLabel": "Телефон:",
      "ageLabel": "Возраст:",
      "achieveLabel": "Достижения:",
      "nextStepsTitle": "Следующие шаги:",
      "nextSteps": [
        "Координаторы рассмотрят вашу анкету и снимок с камеры.",
        "Вы будете приглашены в команду в соответствии с указанным адресом.",
        "Следите за событиями «Жаратман Ордо»."
      ],
      "printBtn": "Печать / PDF",
      "copyBtn": "Копировать текст",
      "copiedBtn": "Скопировано!",
      "viewInAdminBtn": "Вернуться на сайт"
    },
    "admin": {
      "title": "Админ-панель «Жаратман Ордо»",
      "subtitle": "Единая база данных волонтёров и координационный штаб",
      "badge": "ПОРТАЛ КООРДИНАТОРОВ",
      "viewTable": "Таблица",
      "viewCards": "Карточки",
      "exportBtn": "Экспорт в CSV (Excel)",
      "exportCsvAll": "Экспорт всех анкет в CSV",
      "exportSuccess": "CSV файл успешно скачан! Готов к оффлайн работе.",
      "copyShareableLink": "Копировать ссылку",
      "shareableLinkCopied": "Ссылка скопирована!",
      "addBtn": "Добавить кандидата",
      "exitBtn": "На сайт",
      "changePasswordBtn": "Сменить пароль",
      "lockBtn": "Заблокировать",
      "allTab": "Все анкеты",
      "newTab": "Новые",
      "interviewTab": "На интервью",
      "acceptedTab": "Принятые",
      "archiveTab": "Резерв / Архив",
      "searchPlaceholder": "Поиск по имени, ID, адресу, сертификату или проекту...",
      "allDepts": "Все направления",
      "allStatuses": "Все статусы",
      "statusFilterLabel": "Фильтр по статусу",
      "colPhoto": "Снимок",
      "colCandidate": "Кандидат",
      "colDept": "Направление",
      "colAddress": "Адрес / Локация",
      "colCerts": "Сертификаты",
      "colProjects": "Проекты",
      "colStatus": "Статус",
      "colActions": "Просмотр",
      "stNew": "Новый",
      "stInterview": "Интервью",
      "stAccepted": "Принят",
      "stWaitlist": "Резерв",
      "stArchived": "Архив",
      "statusLabel": "Изменить статус:",
      "changeStatus": "Изменить"
    },
    "passwordModal": {
      "firstTimeTitle": "Установка пароля доступа",
      "firstTimeDesc": "Для защиты персональных данных кандидатов задаётся пароль координатора.",
      "enterTitle": "Проверка доступа",
      "enterDesc": "Доступ разрешён только координаторам. Введите пароль штаба.",
      "newPassLabel": "Новый пароль",
      "confirmPassLabel": "Подтвердите пароль",
      "passPlaceholder": "Введите пароль...",
      "enterPassLabel": "Пароль координатора",
      "savePassBtn": "Сохранить и войти",
      "unlockBtn": "Войти",
      "cancelBtn": "Отмена",
      "mismatchError": "Пароли не совпадают. Пожалуйста, повторите ввод.",
      "wrongPassError": "Неверный пароль! Посторонним вход воспрещён.",
      "emptyError": "Пароль должен содержать не менее 4 символов.",
      "changeTitle": "Смена пароля штаба",
      "currentPassLabel": "Текущий пароль",
      "changeSuccess": "Пароль успешно обновлен!"
    },
    "faq": {
      "sectionNum": "04. Частые вопросы",
      "heading": "Ответы на ключевые вопросы о волонтёрстве",
      "subheading": "Если у вас остались вопросы, координаторы помогут вам.",
      "items": [
        {
          "q": "Кто может стать волонтёром «Жаратман Ордо»?",
          "a": "Молодёжь от 14 до 30 лет, заинтересованная в искусстве, медиа и социальных проектах."
        },
        {
          "q": "Можно ли совмещать с учёбой или работой?",
          "a": "Да! График гибкий — достаточно уделять 8–15 часов в неделю."
        },
        {
          "q": "Как проходит процесс отбора?",
          "a": "1. Заполнение анкеты со снимком на камеру. 2. Оценка координаторов. 3. Короткое интервью. 4. Официальное присоединение."
        },
        {
          "q": "Выдаётся ли сертификат?",
          "a": "Да, после отправки анкеты сразу генерируется электронное подтверждение с фото, а по итогам сезона — официальный сертификат."
        }
      ]
    },
    "footer": {
      "desc": "Творческое объединение молодёжи Кыргызстана, реализующее культурные, медийные и социальные проекты.",
      "sectionsTitle": "Разделы",
      "contactsTitle": "Контакты и Штаб",
      "city": "Кыргызская Республика, г. Бишкек",
      "madeWithLove": "Создано с любовью для молодёжи Кыргызстана",
      "rights": "Творческая молодёжная организация «Жаратман Ордо». Все права защищены."
    }
  },
  "en": {
    "nav": {
      "title": "Jaratman Ordo",
      "subtitle": "Creative Youth Organization",
      "announcements": "Announcements",
      "departments": "Departments",
      "about": "About",
      "faq": "FAQ",
      "adminPanel": "Admin Panel",
      "applyBtn": "Apply as Volunteer",
      "backToSite": "Back to Site"
    },
    "hero": {
      "kicker": "«Jaratman Ordo» · Volunteer Intake · 2026–2027",
      "headlinePart1": "Channel your creativity to society.",
      "headlineHighlight": "Join the creators’",
      "headlinePart2": "community!",
      "subtitle": "«Jaratman Ordo» creative youth organization invites talented volunteers. Snap a live photo on camera, provide your address, certificates, and past projects.",
      "photoReq": "Live camera snapshot of yourself",
      "certReq": "Attach certificates & past projects",
      "confReq": "Automated confirmation pass & ID badge",
      "adminReq": "Protected coordinator database",
      "applyNow": "Submit Application Now",
      "viewDepts": "Explore 5 Directions",
      "graduates": "Alumni Volunteers",
      "creativeDepts": "Creative Directions",
      "projectsHeld": "Major Cultural Events",
      "autoSystem": "Automated Base & Verification",
      "officialEmblem": "Official emblem of «Jaratman Ordo»"
    },
    "departments": {
      "sectionNum": "01. Creative Directions",
      "heading": "Which creative field do you want to master?",
      "subheading": "At Jaratman Ordo, every volunteer chooses their field of interest and gains real project experience alongside senior mentors.",
      "mainRoles": "Key Roles",
      "skillsNeeded": "Required Skills",
      "applyToDept": "Apply for this direction",
      "items": [
        {
          "id": "media_smm",
          "title": "Media & SMM",
          "shortDesc": "Mobile video production, editing, Reels, graphic design, and storytelling.",
          "fullDesc": "This department showcases all projects and creative initiatives to the public. You will create modern video and graphic content.",
          "quota": "12 slots",
          "roles": [
            "Mobilographer",
            "Video Editor",
            "Graphic Designer",
            "Copywriter",
            "SMM Specialist"
          ],
          "skills": [
            "CapCut/Premiere",
            "Photoshop/Canva",
            "Storytelling",
            "Aesthetic Eye"
          ]
        },
        {
          "id": "event_mgmt",
          "title": "Event Management",
          "shortDesc": "Organizing youth forums, cultural evenings, art exhibitions, and concerts.",
          "fullDesc": "The core team that turns creative concepts into large-scale live productions: location scouting, scripting, logistics, and guest hospitality.",
          "quota": "15 slots",
          "roles": [
            "Event Manager",
            "Logistics Lead",
            "Scriptwriter",
            "Stage Coordinator"
          ],
          "skills": [
            "Quick Decision Making",
            "Organization",
            "Stress Resilience",
            "Teamwork"
          ]
        },
        {
          "id": "art_culture",
          "title": "Arts & Culture",
          "shortDesc": "Music, theater, fine arts, poetry, and authentic performances.",
          "fullDesc": "A creative wing providing stage opportunities for young artists to develop new cultural exhibitions, performances, and musical shows.",
          "quota": "10 slots",
          "roles": [
            "Performer / Musician",
            "Actor / Host",
            "Painter / Illustrator",
            "Poet / Playwright"
          ],
          "skills": [
            "Stage Presence",
            "Creative Thinking",
            "Improvisation",
            "Artistic Skill"
          ]
        },
        {
          "id": "projects_grants",
          "title": "Projects & Grants",
          "shortDesc": "Community initiatives, grant proposals, and sustainable social impact.",
          "fullDesc": "Designing grant proposals for international and local cultural foundations, managing project deliverables, and monitoring outcomes.",
          "quota": "8 slots",
          "roles": [
            "Project Manager",
            "Grant Writer",
            "Fundraiser",
            "M&E Specialist"
          ],
          "skills": [
            "Analytical Mind",
            "Grant Writing",
            "Pitching",
            "Critical Thinking"
          ]
        },
        {
          "id": "pr_outreach",
          "title": "PR & Partnerships",
          "shortDesc": "Media relations, influencer outreach, speakers, and public partnerships.",
          "fullDesc": "Enhancing the brand reputation of the organization, building partnerships with public figures, sponsors, and media channels.",
          "quota": "8 slots",
          "roles": [
            "PR Specialist",
            "Speaker Manager",
            "Partnerships Lead",
            "Press Secretary"
          ],
          "skills": [
            "Networking",
            "Diplomacy",
            "Communication",
            "Business Correspondence"
          ]
        }
      ]
    },
    "about": {
      "sectionNum": "02. About Us & Opportunities",
      "heading": "«Jaratman Ordo» — A platform for next-generation creative initiatives",
      "card1Badge": "Live Events",
      "card1Title": "Youth Festivals & Concerts",
      "card1Desc": "Unforgettable cultural experiences staged at prominent venues in Bishkek.",
      "card2Badge": "Media Lab",
      "card2Title": "Creative Content & Masterclasses",
      "card2Desc": "Working with modern cameras, video gear, and collaborative creative workshops.",
      "benefitsTitle": "What will you gain as a Jaratman Ordo volunteer?",
      "benefit1Title": "Official Certificate & Recommendation Letter",
      "benefit1Desc": "Verified proof of impact for your university applications, scholarship grants, or job CV.",
      "benefit2Title": "High-Impact Networking & Leadership",
      "benefit2Desc": "Direct connection with leading creatives, media producers, and public figures in Kyrgyzstan.",
      "benefit3Title": "Turn Your Own Ideas Into Reality",
      "benefit3Desc": "Every volunteer initiative is supported by the organizational infrastructure and equipment.",
      "benefit4Title": "Inspiring Creative Community",
      "benefit4Desc": "Teambuilding retreats, mountain trips, and lifelong friendships."
    },
    "form": {
      "sectionNum": "03. Application Form (2026–2027)",
      "heading": "Official Volunteer Intake",
      "subheading": "Please snap a live photo of yourself on camera, provide your address, certificates, and past projects.",
      "sec1": "1. Take a Live Photo of Yourself (Mandatory) *",
      "sec1Req": "Live Camera Capture",
      "cameraTitle": "Snap a photo of yourself",
      "cameraDesc": "Activate your camera and capture a clear portrait. This photo will be placed on your official pass badge.",
      "openCameraBtn": "Open Camera & Snap Photo",
      "snapBtn": "Capture Photo",
      "retakeBtn": "Retake",
      "cameraError": "Camera permission unavailable. You can take a photo using your camera app:",
      "photoAccepted": "Photo captured and accepted ✓",
      "fullName": "Full Name *",
      "fullNamePlaceholder": "e.g. Aibike Asanova",
      "address": "Your Address (City, Street, or Institution) *",
      "addressPlaceholder": "e.g. Bishkek, 7th microdistrict or KNU Campus",
      "addressHint": "Your address is kept for community coordination and records.",
      "age": "Your Age",
      "agePlaceholder": "e.g. 20",
      "phone": "Your Phone Number (WhatsApp) *",
      "phonePlaceholder": "e.g. +996 700 123 456",
      "instagram": "Your Instagram Account or Portfolio",
      "sec2": "2. Select Your Preferred Creative Direction *",
      "sec3": "3. Certificates & Achievements (Mandatory) *",
      "certAddBtn": "Add Another Certificate",
      "certDesc": "Include your certificates from educational courses, language exams, design, IT, or leadership programs.",
      "certName": "Certificate Title *",
      "certIssuer": "Issuing Organization",
      "certYear": "Year",
      "sec4": "4. Past Projects & Experience (Mandatory) *",
      "projAddBtn": "Add Another Project",
      "projDesc": "Describe projects, events, media campaigns, or community initiatives you organized or contributed to.",
      "projNum": "Project",
      "projTitle": "Project / Event Title *",
      "projRole": "Your Role *",
      "projDescLabel": "Brief Description & Results *",
      "projLink": "Proof / Portfolio Link (Optional)",
      "sec5": "5. Skills, Motivation & Availability",
      "motivationLabel": "Why did you choose «Jaratman Ordo» and what value will you bring? *",
      "motivationPlaceholder": "Tell us about yourself, your goals, and your creative vision...",
      "availLabel": "Time Commitment",
      "availOptions": [
        "5–8 hours per week",
        "10–15 hours per week (Recommended)",
        "20+ hours per week (High Involvement)",
        "Event days only"
      ],
      "portfolioLabel": "General Portfolio / CV Link",
      "portfolioPlaceholder": "Google Drive, Behance, or relevant link",
      "otherOrgTitle": "Are you currently participating in other projects or youth organizations?",
      "otherOrgDesc": "Do you have active membership or past experience in other community groups or clubs?",
      "otherOrgNo": "No, I am not a member of other organizations/projects",
      "otherOrgYes": "Yes, I participate in other organizations/projects",
      "otherOrgPlaceholder": "Which organization or project? (e.g. Volunteer or videographer at...)",
      "submitBtn": "Submit Application & Get Badge",
      "submittingBtn": "Recording application...",
      "safeNote": "Camera snapshot or uploaded photo, address, certificates, and projects are recorded automatically in the protected database"
    },
    "confirmModal": {
      "successBadge": "Application Received",
      "title": "Official Confirmation Letter & Badge",
      "registeredNote": "Application recorded in the official database",
      "candidateBadge": "Candidate Badge",
      "deptLabel": "Direction:",
      "addressLabel": "Address:",
      "phoneLabel": "Phone Number:",
      "ageLabel": "Age:",
      "achieveLabel": "Achievements:",
      "nextStepsTitle": "Next Steps:",
      "nextSteps": [
        "Coordinators will review your application and live photo.",
        "You will receive onboarding details based on your address/location.",
        "Follow Jaratman Ordo announcements for news and project updates."
      ],
      "printBtn": "Print / Save PDF",
      "copyBtn": "Copy Text",
      "copiedBtn": "Copied!",
      "viewInAdminBtn": "Return to site"
    },
    "admin": {
      "title": "«Jaratman Ordo» Admin Panel",
      "subtitle": "Central Volunteer Database & Coordination Headquarters",
      "badge": "COORDINATOR PORTAL",
      "viewTable": "Table View",
      "viewCards": "Cards View",
      "exportBtn": "Export to CSV",
      "exportCsvAll": "Export All to CSV",
      "exportSuccess": "CSV file downloaded successfully! Ready for offline use.",
      "copyShareableLink": "Copy Shareable Link",
      "shareableLinkCopied": "Link Copied!",
      "addBtn": "Add Candidate",
      "exitBtn": "Exit to Site",
      "changePasswordBtn": "Change Password",
      "lockBtn": "Lock Session",
      "allTab": "All Applications",
      "newTab": "New",
      "interviewTab": "In Interview",
      "acceptedTab": "Accepted",
      "archiveTab": "Reserve / Archive",
      "searchPlaceholder": "Search by name, ID, address, cert, or project...",
      "allDepts": "All Creative Directions",
      "allStatuses": "All Statuses",
      "statusFilterLabel": "Filter by Status",
      "colPhoto": "Snapshot",
      "colCandidate": "Candidate",
      "colDept": "Department",
      "colAddress": "Address / Location",
      "colCerts": "Certificates",
      "colProjects": "Projects",
      "colStatus": "Status",
      "colActions": "Inspect",
      "stNew": "New",
      "stInterview": "Interviewing",
      "stAccepted": "Accepted",
      "stWaitlist": "Waitlist",
      "stArchived": "Archived",
      "statusLabel": "Update Status:",
      "changeStatus": "Update"
    },
    "passwordModal": {
      "firstTimeTitle": "Set Access Password",
      "firstTimeDesc": "To safeguard candidate records, set your private coordinator password.",
      "enterTitle": "Security Verification",
      "enterDesc": "Access restricted to authorized coordinators. Please enter the password.",
      "newPassLabel": "Create New Password",
      "confirmPassLabel": "Confirm Password",
      "passPlaceholder": "Enter password...",
      "enterPassLabel": "Coordinator Password",
      "savePassBtn": "Save & Enter",
      "unlockBtn": "Unlock",
      "cancelBtn": "Cancel",
      "mismatchError": "Passwords do not match. Please try again.",
      "wrongPassError": "Incorrect password! Access restricted.",
      "emptyError": "Password must be at least 4 characters long.",
      "changeTitle": "Change Access Password",
      "currentPassLabel": "Current Password",
      "changeSuccess": "Password changed successfully!"
    },
    "faq": {
      "sectionNum": "04. Frequently Asked Questions",
      "heading": "Everything you need to know about volunteering",
      "subheading": "If you have further questions, our coordinators are here to help.",
      "items": [
        {
          "q": "Who can volunteer with «Jaratman Ordo»?",
          "a": "Youth aged 14 to 30 with a passion for arts, culture, media, and community projects."
        },
        {
          "q": "Can I combine this with studies or work?",
          "a": "Yes, volunteering schedules are flexible (8–15 hours weekly)."
        },
        {
          "q": "What is the selection process?",
          "a": "1. Online Application with camera snapshot. 2. Coordinator Review. 3. Friendly Interview. 4. Official Team Onboarding."
        }
      ]
    },
    "footer": {
      "desc": "A platform uniting passionate Kyrgyz youth to execute impactful cultural, media, and community projects.",
      "sectionsTitle": "Sections",
      "contactsTitle": "Contacts & Headquarters",
      "city": "Bishkek, Kyrgyz Republic",
      "madeWithLove": "Crafted with passion for youth in Kyrgyzstan",
      "rights": "«Jaratman Ordo» Creative Youth Organization. All rights reserved."
    }
  }
};
