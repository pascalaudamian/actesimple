export type Language = 'ro' | 'en';

export interface Translations {
  // Navigation & Branding
  brandSubtitle: string;
  myDossiers: string;
  adminPanel: string;
  internationalModule: string;
  searchPlaceholder: string;
  langRo: string;
  langEn: string;
  
  // Hero Section
  heroBadge: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtitle: string;
  heroSearchPlaceholder: string;
  popularProceduresLabel: string;
  badgeChecklist: string;
  badgeFees: string;
  badgeFree: string;
  startWizardCta: string;
  startWizardSub: string;

  // Categories & Filters
  categoriesTitle: string;
  resetAllFilters: string;
  filterLabel: string;
  filterOnlineOnly: string;
  filterDifficulty: string;
  filterAll: string;
  filterEasy: string;
  filterMedium: string;
  filterComplex: string;
  filterProfile: string;
  filterProfileAll: string;
  filterProfileRo: string;
  filterProfileEu: string;
  filterProfileNonEu: string;
  filterProfileFamily: string;
  proceduresFound: string;
  popularSectionTitle: string;
  popularSectionSub: string;
  recentlyVerifiedTitle: string;
  recentlyVerifiedSub: string;
  allProceduresTitle: string;
  noResultsTitle: string;
  noResultsDesc: string;
  resetFiltersBtn: string;

  // Procedure Detail & Checklist
  backToProcedures: string;
  copySummaryBtn: string;
  copiedToast: string;
  printDossierBtn: string;
  resetChecklistBtn: string;
  verifiedOfficial: string;
  needsReviewTag: string;
  onlineAvailableTag: string;
  civicDisclaimer: string;
  competentAuthority: string;
  totalFees: string;
  estimatedTime: string;
  documentsToPrepare: string;
  proTipTitle: string;
  personalChecklistTitle: string;
  checklistProgressText: string;
  checkAllDocsBtn: string;
  dossierCompleteNotice: string;
  tabDocs: string;
  tabSteps: string;
  tabFees: string;
  tabFaq: string;
  tabSources: string;
  docFilterLabel: string;
  docFilterAll: string;
  docFilterMandatory: string;
  docFilterPending: string;
  docTipCheck: string;
  mandatoryBadge: string;
  optionalBadge: string;
  whereToGetLabel: string;
  downloadFormBtn: string;
  addCustomDocTitle: string;
  addCustomDocSub: string;
  addCustomDocPlaceholder: string;
  addCustomDocBtn: string;
  personalNotesTitle: string;
  appointmentDateLabel: string;
  appointmentDatePlaceholder: string;
  appointmentLocationLabel: string;
  appointmentLocationPlaceholder: string;
  personalNotesLabel: string;
  personalNotesPlaceholder: string;
  stepProgressLabel: string;
  stepTipRecommendation: string;
  feesExplanationTitle: string;
  feesExplanationSub: string;
  totalEstimatedCost: string;
  feesOfficialNotice: string;
  sourcesTitle: string;
  sourcesSub: string;
  checkOfficialSiteBtn: string;
  legalDisclaimerBottom: string;

  // Orientation Wizard
  wizardTitle: string;
  wizardSubtitle: string;
  wizardLegalNotice: string;
  wizardStep1Title: string;
  wizardStep1Desc: string;
  wizardStep2Title: string;
  wizardStep2Desc: string;
  wizardStep3Title: string;
  wizardStep3Desc: string;
  wizardStep4Title: string;
  wizardStep4Desc: string;
  wizardNext: string;
  wizardBack: string;
  wizardRestart: string;
  wizardResultsTitle: string;
  wizardResultsSub: string;
  wizardWhyRecommended: string;
  wizardDisclaimer: string;
  wizardClose: string;
  wizardOpenGuide: string;

  // Status Profiles
  profileRomanian: string;
  profileRomanianDesc: string;
  profileEu: string;
  profileEuDesc: string;
  profileNonEu: string;
  profileNonEuDesc: string;
  profileFamily: string;
  profileFamilyDesc: string;

  // Stay Purposes
  purposeWork: string;
  purposeStudies: string;
  purposeFamily: string;
  purposeBusiness: string;
  purposePermanent: string;
  purposeOther: string;

  // Duration
  durationShort: string;
  durationShortDesc: string;
  durationLong: string;
  durationLongDesc: string;

  // Footer & Civic Info
  footerMission: string;
  footerPortalsTitle: string;
  footerTransparencyTitle: string;
  footerTransparencyDesc: string;
  footerNoTracking: string;
  footerCopyright: string;
  footerMadeWithCare: string;
}

export const translations: Record<Language, Translations> = {
  ro: {
    brandSubtitle: 'Ghidul tău prin birocrație',
    myDossiers: 'Dosarele Mele',
    adminPanel: 'Administrare',
    internationalModule: 'Cetățeni Internaționali & Vize',
    searchPlaceholder: 'Caută buletin, pașaport, permis de ședere, cazier...',
    langRo: 'Română',
    langEn: 'English',

    heroBadge: 'Informații verificate conform legislației din România 2026',
    heroTitleLine1: 'Toate actele și pașii necesari.',
    heroTitleLine2: 'Fără drumuri inutile la ghișeu.',
    heroSubtitle: 'Află exact ce documente îți trebuie, unde mergi, cât costă și bifează-le direct în checklistul tău personal, fără cont.',
    heroSearchPlaceholder: 'Caută o procedură sau un document (ex: buletin, rezidență UE, permis de ședere, talon, cazier)...',
    popularProceduresLabel: 'Proceduri populare:',
    badgeChecklist: 'Checklist interactiv salvat pe telefon',
    badgeFees: 'Actualizat cu tarifele oficiale 2026',
    badgeFree: '100% gratuit & fără înregistrare',
    startWizardCta: 'Asistent de Orientare (Cetățeni Străini & Rezidență)',
    startWizardSub: 'Află ce procedură ți se aplică în funcție de cetățenie și scopul șederii',

    categoriesTitle: 'Categorii de proceduri',
    resetAllFilters: 'Resetează toate filtrele',
    filterLabel: 'Filtrează:',
    filterOnlineOnly: 'Doar proceduri online',
    filterDifficulty: 'Dificultate:',
    filterAll: 'Toate',
    filterEasy: 'Ușor',
    filterMedium: 'Mediu',
    filterComplex: 'Complex',
    filterProfile: 'Profil aplicant:',
    filterProfileAll: 'Toți solicitanții',
    filterProfileRo: 'Cetățeni români',
    filterProfileEu: 'Cetățeni UE / SEE / CH',
    filterProfileNonEu: 'Cetățeni Non-UE',
    filterProfileFamily: 'Membri de familie',
    proceduresFound: 'proceduri găsite',
    popularSectionTitle: 'Proceduri Populare în România',
    popularSectionSub: '(Cele mai căutate proceduri de către cetățeni)',
    recentlyVerifiedTitle: 'Proceduri Recent Verificate cu Sursele Oficiale',
    recentlyVerifiedSub: 'Fiecare procedură afișează data la care au fost confirmate cerințele, formularele și taxele legale.',
    allProceduresTitle: 'Toate Procedurile Disponibile',
    noResultsTitle: 'Nu am găsit proceduri pentru termenii specificați',
    noResultsDesc: 'Încearcă alte cuvinte-cheie sau resetează filtrele aplicate.',
    resetFiltersBtn: 'Resetează filtrele',

    backToProcedures: 'Înapoi la proceduri',
    copySummaryBtn: 'Copiază rezumat',
    copiedToast: 'Copiat în clipboard!',
    printDossierBtn: 'Tipărește dosar',
    resetChecklistBtn: 'Resetează',
    verifiedOfficial: 'Verificat oficial',
    needsReviewTag: 'De verificat / În revizuire',
    onlineAvailableTag: 'Disponibil Online',
    civicDisclaimer: 'Notă civică: Cerințele specifice, programul de lucru și modalitatea de plată pot suferi variații în funcție de serviciul public local de la domiciliu.',
    competentAuthority: 'Instituție competentă',
    totalFees: 'Taxe totale',
    estimatedTime: 'Timp estimat',
    documentsToPrepare: 'Acte de pregătit',
    proTipTitle: 'Sfat important & capcană birocratică frecventă:',
    personalChecklistTitle: 'Checklist personal: Dosarul tău de acte',
    checklistProgressText: 'Ai pregătit {checked} din {total} documente necesare.',
    checkAllDocsBtn: 'Bifează toate actele',
    dossierCompleteNotice: 'Dosar complet! Ai toate actele bifate și gata de depunere.',
    tabDocs: 'Documente Necesare',
    tabSteps: 'Pașii de Umat',
    tabFees: 'Taxe & Plată',
    tabFaq: 'Întrebări & Sfaturi',
    tabSources: 'Surse Oficiale',
    docFilterLabel: 'Filtru acte:',
    docFilterAll: 'Toate',
    docFilterMandatory: 'Doar obligatorii',
    docFilterPending: 'De pregătit',
    docTipCheck: 'Bifează documentul când l-ai pus în dosar',
    mandatoryBadge: 'Obligatoriu',
    optionalBadge: 'Opțional / în funcție de caz',
    whereToGetLabel: 'De unde se obține:',
    downloadFormBtn: 'Descarcă formular tipizat',
    addCustomDocTitle: 'Adaugă un document personalizat la dosar',
    addCustomDocSub: 'Poți nota alte documente specifice situației tale (ex: procură notarială, adeverință suplimentară).',
    addCustomDocPlaceholder: 'Ex: Traducere autorizată a extrasului de naștere...',
    addCustomDocBtn: 'Adaugă',
    personalNotesTitle: 'Programarea & Notițele tale (salvate local pe acest dispozitiv)',
    appointmentDateLabel: 'Data și ora programării:',
    appointmentDatePlaceholder: 'Ex: Joi, 28 octombrie la ora 10:15',
    appointmentLocationLabel: 'Locație / Ghișeu / Serviciu Teritorial:',
    appointmentLocationPlaceholder: 'Ex: Serviciul Imigrări București (IGI), Ghișeul 3',
    personalNotesLabel: 'Notițe personale (chitanțe, cod programare, detalii):',
    personalNotesPlaceholder: 'Ex: Am achitat taxa de permis pe Ghiseul.ro. Trebuie să aduc timbrul fiscal...',
    stepProgressLabel: 'Progres pași:',
    stepTipRecommendation: 'Recomandare:',
    feesExplanationTitle: 'Cuantumul taxelor legale pentru această procedură',
    feesExplanationSub: 'Toate taxele specificate sunt verificate conform reglementărilor naționale în vigoare.',
    totalEstimatedCost: 'Cost Total Estimativ',
    feesOfficialNotice: 'Unde și cum poți achita:',
    sourcesTitle: 'Surse Oficiale Verificate',
    sourcesSub: 'ActeSimple sintetizează informațiile direct de pe portalurile oficiale ale ministerelor și instituțiilor competente.',
    checkOfficialSiteBtn: 'Verifică pe site-ul oficial',
    legalDisclaimerBottom: 'Notă de transparență civică: ActeSimple este un serviciu independent. Informațiile au caracter orientativ și nu substituie consultanța juridică sau decizia oficială a autorităților.',

    wizardTitle: 'Asistent de Orientare pentru Servicii Administrative în România',
    wizardSubtitle: 'Răspunde la câteva întrebări simple pentru a identifica ghidul de procedură adecvat situației tale.',
    wizardLegalNotice: 'Confidențialitate: Nu colectăm date personale, nume, CNP sau pașapoarte. Răspunsurile tale sunt procesate exclusiv în browser.',
    wizardStep1Title: 'Pasul 1: Care este statutul sau cetățenia ta?',
    wizardStep1Desc: 'Selectează categoria de cetățenie în care te încadrezi.',
    wizardStep2Title: 'Pasul 2: Care este scopul principal al șederii în România?',
    wizardStep2Desc: 'Alege motivul pentru care te afli sau dorești să vii în România.',
    wizardStep3Title: 'Pasul 3: Care este durata estimată a șederii?',
    wizardStep3Desc: 'Regulile diferă dacă este vorba despre o ședere scurtă sau o ședere pe termen mediu/lung.',
    wizardStep4Title: 'Pasul 4: Relații de familie relevante',
    wizardStep4Desc: 'Ești căsătorit(ă) sau în întreținerea unui cetățean român ori al unui cetățean al Uniunii Europene?',
    wizardNext: 'Continuă',
    wizardBack: 'Înapoi',
    wizardRestart: 'Reia asistentul',
    wizardResultsTitle: 'Proceduri Recomandate pentru Profilul Tău',
    wizardResultsSub: 'Pe baza răspunsurilor furnizate, iată ghidurile oficiale relevante:',
    wizardWhyRecommended: 'De ce este recomandat:',
    wizardDisclaimer: 'Atenție: Acest asistent oferă doar orientare informativă. Nicio recomandare nu constituie o decizie oficială privind dreptul de ședere. Competența exclusivă aparține Inspectoratului General pentru Imigrări (IGI) și Ministerului Afacerilor Externe (MAE).',
    wizardClose: 'Închide asistentul',
    wizardOpenGuide: 'Deschide Ghidul & Actele Necesare',

    profileRomanian: 'Cetățean român',
    profileRomanianDesc: 'Dețin cetățenia română (prin naștere sau dobândită).',
    profileEu: 'Cetățean UE / SEE / Elveția',
    profileEuDesc: 'Cetățean al unui stat membru al Uniunii Europene, Spațiului Economic European sau Confederației Elvețiene.',
    profileNonEu: 'Cetățean din afara UE / SEE (Stat Terț)',
    profileNonEuDesc: 'Cetățean al unei țări non-UE care are nevoie de viză sau permis de ședere.',
    profileFamily: 'Membru de familie al unui cetățean UE sau român',
    profileFamilyDesc: 'Sunt soț/soție, copil sau membru de familie aflat în întreținerea unui cetățean român sau UE (inclusiv dacă eu sunt cetățean non-UE).',

    purposeWork: 'Muncă / Angajare / Contract individual de muncă',
    purposeStudies: 'Studii / Universitate / Stagiu academic',
    purposeFamily: 'Reîntregirea familiei / Căsătorie / Conviviență',
    purposeBusiness: 'Afaceri / Înființare firmă / Investiții',
    purposePermanent: 'Rezidență permanentă / Drept de ședere pe termen lung',
    purposeOther: 'Alte formalități administrative / Fiscale / Stare civilă',

    durationShort: 'Ședere scurtă (sub 90 de zile)',
    durationShortDesc: 'Turism, vizită scurtă sau afaceri punctuale.',
    durationLong: 'Ședere de lungă durată (peste 90 de zile) sau permanentă',
    durationLongDesc: 'Muncă, studii de lungă durată, relocare sau stabilire definitivă în România.',

    footerMission: 'Ghidul tău practic prin labirintul administrativ din România. Liste complete de documente, pași ordonați cronologic, taxe oficiale și checklist-uri interactive salvate pe dispozitivul tău, fără cont.',
    footerPortalsTitle: 'Portaluri Oficiale România',
    footerTransparencyTitle: 'Transparență & Confidențialitate',
    footerTransparencyDesc: 'Nu colectăm date cu caracter personal, CNP-uri sau copii de acte. Toate bifările și notițele tale sunt păstrate exclusiv în memoria locală a browserului tău (localStorage).',
    footerNoTracking: 'Fără cookies de tracking comercial',
    footerCopyright: 'ActeSimple. Proiect civic independent de simplificare a birocrației.',
    footerMadeWithCare: 'Creat cu grijă pentru cetățenii și rezidenții din România',
  },
  en: {
    brandSubtitle: 'Your simple guide through Romanian bureaucracy',
    myDossiers: 'My Checklists',
    adminPanel: 'Admin Panel',
    internationalModule: 'International Citizens & Visas',
    searchPlaceholder: 'Search ID card, passport, residence permit, criminal record...',
    langRo: 'Română',
    langEn: 'English',

    heroBadge: 'Verified information according to Romanian legislation 2026',
    heroTitleLine1: 'All the required documents and steps.',
    heroTitleLine2: 'Without unnecessary trips to the counter.',
    heroSubtitle: 'Find out exactly what documents you need, where to go, how much it costs, and check them off in your personal checklist, with no account required.',
    heroSearchPlaceholder: 'Search a procedure or document (e.g., EU registration, residence permit, car registration, tax ID)...',
    popularProceduresLabel: 'Popular procedures:',
    badgeChecklist: 'Interactive checklist saved on your phone',
    badgeFees: 'Updated with official 2026 fees',
    badgeFree: '100% free & no registration needed',
    startWizardCta: 'Orientation Assistant (Foreign Citizens & Residence)',
    startWizardSub: 'Discover the applicable procedure based on your citizenship and purpose of stay',

    categoriesTitle: 'Procedure categories',
    resetAllFilters: 'Reset all filters',
    filterLabel: 'Filter by:',
    filterOnlineOnly: 'Online procedures only',
    filterDifficulty: 'Difficulty:',
    filterAll: 'All',
    filterEasy: 'Easy',
    filterMedium: 'Medium',
    filterComplex: 'Complex',
    filterProfile: 'Applicant profile:',
    filterProfileAll: 'All applicants',
    filterProfileRo: 'Romanian citizens',
    filterProfileEu: 'EU / EEA / Swiss citizens',
    filterProfileNonEu: 'Non-EU citizens',
    filterProfileFamily: 'Family members',
    proceduresFound: 'procedures found',
    popularSectionTitle: 'Popular Procedures in Romania',
    popularSectionSub: '(Most searched procedures by citizens and residents)',
    recentlyVerifiedTitle: 'Recently Verified Procedures with Official Sources',
    recentlyVerifiedSub: 'Every procedure displays the exact date when requirements, forms, and statutory fees were confirmed.',
    allProceduresTitle: 'All Available Procedures',
    noResultsTitle: 'No procedures found for the specified terms',
    noResultsDesc: 'Try searching different keywords or reset your active filters.',
    resetFiltersBtn: 'Reset filters',

    backToProcedures: 'Back to procedures',
    copySummaryBtn: 'Copy summary',
    copiedToast: 'Copied to clipboard!',
    printDossierBtn: 'Print dossier',
    resetChecklistBtn: 'Reset',
    verifiedOfficial: 'Officially verified',
    needsReviewTag: 'Needs review / Verification pending',
    onlineAvailableTag: 'Available Online',
    civicDisclaimer: 'Civic disclaimer: Specific requirements, opening hours, and payment methods may vary depending on your local public service office in Romania.',
    competentAuthority: 'Competent authority',
    totalFees: 'Total statutory fees',
    estimatedTime: 'Estimated processing time',
    documentsToPrepare: 'Documents to prepare',
    proTipTitle: 'Important tip & common bureaucratic pitfall:',
    personalChecklistTitle: 'Personal checklist: Your application dossier',
    checklistProgressText: 'You have prepared {checked} of {total} required documents.',
    checkAllDocsBtn: 'Check all documents',
    dossierCompleteNotice: 'Dossier complete! All documents checked and ready for submission.',
    tabDocs: 'Required Documents',
    tabSteps: 'Action Steps',
    tabFees: 'Fees & Payment',
    tabFaq: 'FAQ & Tips',
    tabSources: 'Official Sources',
    docFilterLabel: 'Filter documents:',
    docFilterAll: 'All',
    docFilterMandatory: 'Mandatory only',
    docFilterPending: 'Pending preparation',
    docTipCheck: 'Check the document when you have placed it in your folder',
    mandatoryBadge: 'Mandatory',
    optionalBadge: 'Conditional / depending on case',
    whereToGetLabel: 'Where to obtain:',
    downloadFormBtn: 'Download official application form',
    addCustomDocTitle: 'Add a custom document to your dossier',
    addCustomDocSub: 'You can note additional documents specific to your situation (e.g. certified translation, affidavit).',
    addCustomDocPlaceholder: 'E.g., Certified translation of birth certificate...',
    addCustomDocBtn: 'Add',
    personalNotesTitle: 'Your appointment & personal notes (saved locally on this device)',
    appointmentDateLabel: 'Appointment date and time:',
    appointmentDatePlaceholder: 'E.g., Thursday, 28 October at 10:15 AM',
    appointmentLocationLabel: 'Location / Counter / Territorial Office:',
    appointmentLocationPlaceholder: 'E.g., Immigration General Inspectorate (IGI) Bucharest, Counter 3',
    personalNotesLabel: 'Personal notes (receipts, booking code, details):',
    personalNotesPlaceholder: 'E.g., Paid statutory fee on Ghiseul.ro. Must bring certified translated copies...',
    stepProgressLabel: 'Steps progress:',
    stepTipRecommendation: 'Recommendation:',
    feesExplanationTitle: 'Statutory fees breakdown for this procedure',
    feesExplanationSub: 'All specified fees are verified against Romanian national legislation currently in force.',
    totalEstimatedCost: 'Total Estimated Cost',
    feesOfficialNotice: 'Where and how to pay:',
    sourcesTitle: 'Verified Official Sources',
    sourcesSub: 'ActeSimple compiles information directly from official portals of competent Romanian ministries and agencies.',
    checkOfficialSiteBtn: 'Check on official portal',
    legalDisclaimerBottom: 'Civic transparency note: ActeSimple is an independent civic information tool. All guides are indicative and do not replace legal advice or the official decision of the Romanian authorities.',

    wizardTitle: 'Orientation Assistant for Administrative Services in Romania',
    wizardSubtitle: 'Answer a few simple questions to identify the exact procedure and requirements applicable to your situation.',
    wizardLegalNotice: 'Privacy: We do not collect personal data, names, CNP, or passport numbers. Your answers are processed solely in your browser.',
    wizardStep1Title: 'Step 1: What is your citizenship or legal status?',
    wizardStep1Desc: 'Select the citizenship category that applies to you.',
    wizardStep2Title: 'Step 2: What is the main purpose of your stay in Romania?',
    wizardStep2Desc: 'Choose the primary reason for being or planning to reside in Romania.',
    wizardStep3Title: 'Step 3: What is your estimated duration of stay?',
    wizardStep3Desc: 'Different rules apply depending on whether your stay is short-term or medium/long-term.',
    wizardStep4Title: 'Step 4: Relevant family relationships',
    wizardStep4Desc: 'Are you married to, or dependent on, a Romanian or European Union citizen?',
    wizardNext: 'Continue',
    wizardBack: 'Back',
    wizardRestart: 'Restart assistant',
    wizardResultsTitle: 'Recommended Procedures for Your Profile',
    wizardResultsSub: 'Based on your answers, here are the relevant official procedures and guides:',
    wizardWhyRecommended: 'Why this is recommended for you:',
    wizardDisclaimer: 'Disclaimer: This assistant provides indicative orientation only. No recommendation constitutes an official legal ruling on immigration status. Exclusive jurisdiction rests with the General Inspectorate for Immigration (IGI) and the Ministry of Foreign Affairs (MAE).',
    wizardClose: 'Close assistant',
    wizardOpenGuide: 'Open Guide & Required Documents',

    profileRomanian: 'Romanian citizen',
    profileRomanianDesc: 'I hold Romanian citizenship (by birth or acquired).',
    profileEu: 'EU / EEA / Swiss citizen',
    profileEuDesc: 'Citizen of a member state of the European Union, European Economic Area, or the Swiss Confederation.',
    profileNonEu: 'Non-EU / EEA citizen (Third-country national)',
    profileNonEuDesc: 'Citizen of a non-EU country who requires a visa or residence permit in Romania.',
    profileFamily: 'Family member of an EU or Romanian citizen',
    profileFamilyDesc: 'I am a spouse, child, or dependent family member of an EU or Romanian citizen (including if I am a non-EU citizen).',

    purposeWork: 'Work / Employment / Individual employment contract',
    purposeStudies: 'Studies / University degree / Academic traineeship',
    purposeFamily: 'Family reunification / Marriage / Cohabitation',
    purposeBusiness: 'Business / Company registration / Investment',
    purposePermanent: 'Permanent residence / Long-term resident status',
    purposeOther: 'Other administrative / Tax / Civil status formalities',

    durationShort: 'Short stay (under 90 days)',
    durationShortDesc: 'Tourism, short business trip, or transit.',
    durationLong: 'Long stay (over 90 days) or permanent settlement',
    durationLongDesc: 'Work, full-time university studies, relocation, or permanent residence in Romania.',

    footerMission: 'Your practical guide through Romanian bureaucracy. Complete checklists of documents, chronological steps, official statutory fees, and interactive tools saved on your device, no account required.',
    footerPortalsTitle: 'Official Romanian Portals',
    footerTransparencyTitle: 'Transparency & Privacy',
    footerTransparencyDesc: 'We never collect personal data, national ID numbers (CNP), or document scans. All your checks and notes remain solely on your local browser storage.',
    footerNoTracking: 'Zero commercial tracking cookies',
    footerCopyright: 'ActeSimple. Independent civic initiative for simplifying bureaucracy.',
    footerMadeWithCare: 'Crafted with care for citizens and residents in Romania',
  },
};
