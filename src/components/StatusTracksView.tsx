import React, { useState } from 'react';
import { Procedure, ApplicantProfile } from '../types.ts';
import { Language, translations } from '../i18n/translations.ts';
import { ProcedureCard } from './ProcedureCard.tsx';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  FileText,
  Layers,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface StatusTracksViewProps {
  procedures: Procedure[];
  lang: Language;
  onSelectProcedure: (p: Procedure) => void;
  onOpenWizard: () => void;
  onBackToHome: () => void;
  getProcedureProgress: (id: string) => { checked: number; total: number; percentage: number } | undefined;
}

export type ScopePurpose = 'all' | 'work' | 'studies' | 'family' | 'residence' | 'identity' | 'other';

export const StatusTracksView: React.FC<StatusTracksViewProps> = ({
  procedures,
  lang,
  onSelectProcedure,
  onOpenWizard,
  onBackToHome,
  getProcedureProgress,
}) => {
  const t = translations[lang];

  const [activeProfile, setActiveProfile] = useState<ApplicantProfile>('all');
  const [activePurpose, setActivePurpose] = useState<ScopePurpose>('all');

  const TRACKS: Array<{
    id: ApplicantProfile;
    badge: string;
    title: string;
    titleEn: string;
    desc: string;
    descEn: string;
    authority: string;
    authorityEn: string;
    keyRights: string[];
    keyRightsEn: string[];
  }> = [
    {
      id: 'romanian',
      badge: 'RO',
      title: 'Cetățeni Români',
      titleEn: 'Romanian Citizens',
      desc: 'Proceduri pentru cetățenii români cu domiciliul în țară sau în străinătate.',
      descEn: 'Procedures for Romanian citizens residing locally or abroad.',
      authority: 'SPCLEP, Evidența Populației, DGP, DGPCI, Stare Civilă',
      authorityEn: 'DGEP Population Registry, Passports (DGP), Driving & Cars (DGPCI), Civil Status',
      keyRights: [
        'Eliberare carte de identitate, pașaport electronic simplu sau temporar',
        'Înmatriculări vehicule, preschimbare permis de conducere auto',
        'Transcriere acte de stare civilă (naștere, căsătorie) survenite în străinătate',
        'Înființare firme la ONRC, obținere cazier judiciar online pe HUB MAI',
      ],
      keyRightsEn: [
        'Issuance of National ID (Buletin), electronic or temporary biometric passport',
        'Vehicle registration, Romanian driver license exchange',
        'Transcription of foreign civil status records (birth, marriage abroad)',
        'Company registration at ONRC, online criminal record on HUB MAI',
      ],
    },
    {
      id: 'eu_eea_ch',
      badge: 'UE / SEE / CH',
      title: 'Cetățeni UE / SEE / Elveția',
      titleEn: 'EU / EEA / Swiss Citizens',
      desc: 'Regimul simplificat de liberă circulație conform OUG 102/2005 și Directivei 2004/38/CE.',
      descEn: 'Simplified freedom of movement under EU Directive 2004/38/EC and Romanian OUG 102/2005.',
      authority: 'Inspectoratul General pentru Imigrări (IGI), ANAF, CAS/CNAS',
      authorityEn: 'General Inspectorate for Immigration (IGI), ANAF Tax Agency, Public Health CAS',
      keyRights: [
        'Ședere liberă până la 90 de zile fără formalități de înregistrare',
        'Înregistrarea obligatorie a rezidenței (Certificat de Înregistrare IGI) peste 90 de zile',
        'Drept deplin de muncă fără aviz separat de angajare',
        'Obținere Număr de Identificare Fiscală (NIF) la ANAF și card european CEAM',
      ],
      keyRightsEn: [
        'Free stay up to 90 days with no mandatory registration',
        'Mandatory residence registration (IGI Registration Certificate) over 90 days',
        'Full right to local employment without separate work authorization',
        'Romanian Tax ID (NIF) at ANAF and public healthcare enrollment',
      ],
    },
    {
      id: 'non_eu',
      badge: 'Non-UE / State Terțe',
      title: 'Cetățeni din afara UE / SEE',
      titleEn: 'Non-EU / Third-Country Nationals',
      desc: 'Proceduri pentru cetățenii din state terțe care au nevoie de viză sau permis de ședere.',
      descEn: 'Procedures for third-country citizens requiring a Romanian visa or residence permit.',
      authority: 'Ministerul Afacerilor Externe (MAE/eViza), IGI, Ministerul Muncii',
      authorityEn: 'Ministry of Foreign Affairs (MAE/eViza), IGI Immigration, Ministry of Labor',
      keyRights: [
        'Vize de scurtă ședere (Tip C) și vize de lungă ședere (Tip D: muncă, studii, familie)',
        'Permis Unic de Ședere în scop de muncă eliberat de IGI teritorial',
        'Permis de ședere temporară pentru studenți universitari (cu drept de muncă 4h/zi)',
        'Prelungirea dreptului de ședere (termen imperativ: min. 30 zile înainte de expirare)',
      ],
      keyRightsEn: [
        'Short-stay Schengen (Type C) and Long-stay (Type D: work, study, family) visas',
        'Single Work & Residence Permit issued by territorial IGI branches',
        'Temporary student residence permit (with legal 4h/day part-time work right)',
        'Mandatory stay extension (filing at least 30 days before permit expiry)',
      ],
    },
    {
      id: 'family_member',
      badge: 'Membru Familie / Family',
      title: 'Membri de Familie (ai cetățenilor români sau UE)',
      titleEn: 'Family Members of Romanian or EU Citizens',
      desc: 'Drepturi derivate de rezidență pentru soți, copii sau rude dependente din afara UE.',
      descEn: 'Derived residence rights for non-EU spouses, children, or dependent relatives.',
      authority: 'Inspectoratul General pentru Imigrări (IGI), Stare Civilă Primării',
      authorityEn: 'General Inspectorate for Immigration (IGI), Local Town Hall Civil Status',
      keyRights: [
        'Carte de Rezidență pentru membru de familie eliberată gratuit de IGI',
        'Adeverință provizorie de drept de ședere acordată pe loc la depunerea dosarului',
        'Drept egal de acces la piața muncii din România fără aviz de angajare',
        'Transcriere certificat de căsătorie încheiat în străinătate',
      ],
      keyRightsEn: [
        'Residence Card for Family Member issued free of charge by IGI',
        'Provisional stay certificate issued immediately at counter submission',
        'Full unrestricted employment rights without work authorization',
        'Transcription of foreign marriage certificates into Romanian registry',
      ],
    },
    {
      id: 'unclear',
      badge: 'Clarificare / Clarify',
      title: 'Nu sunt sigur ce categorie mi se aplică',
      titleEn: 'Unsure which category applies',
      desc: 'Cazuri complexe: dublă cetățenie, căsătorie în derulare, refugiați, apatrizi sau nomazi digitali.',
      descEn: 'Complex cases: dual citizenship, pending marriage, protection status, digital nomads.',
      authority: 'Asistent Civic ActeSimple & Consultare Directă IGI/MAE',
      authorityEn: 'ActeSimple Civic Assistant & Direct Official IGI/MAE Consult',
      keyRights: [
        'Ghidare pas cu pas prin Asistentul de Orientare fără colectare de date personale',
        'Identificarea traseului optim în funcție de documentele deja deținute',
        'Surse oficiale verificate și contacte directe ale instituțiilor',
      ],
      keyRightsEn: [
        'Step-by-step guidance via Orientation Assistant with zero personal data collection',
        'Identify optimal procedure pathway based on your existing paperwork',
        'Direct links to verified primary government portals',
      ],
    },
  ];

  // Purpose options
  const PURPOSES: Array<{ id: ScopePurpose; labelRo: string; labelEn: string; icon: any }> = [
    { id: 'all', labelRo: 'Toate scopurile', labelEn: 'All purposes', icon: Layers },
    { id: 'work', labelRo: 'Muncă & Angajare', labelEn: 'Work & Employment', icon: Briefcase },
    { id: 'studies', labelRo: 'Studii & Universitate', labelEn: 'Studies & Academia', icon: GraduationCap },
    { id: 'family', labelRo: 'Reîntregirea familiei & Căsătorie', labelEn: 'Family & Marriage', icon: Heart },
    { id: 'residence', labelRo: 'Mutare & Rezidență', labelEn: 'Relocation & Residence', icon: Home },
    { id: 'identity', labelRo: 'Acte de identitate & Stare civilă', labelEn: 'Identity & Civil Status', icon: FileText },
    { id: 'other', labelRo: 'Alte formalități (NIF, CAS)', labelEn: 'Other Formalities (Tax, CAS)', icon: HelpCircle },
  ];

  // Filtered procedures based on track and purpose
  const filteredList = procedures.filter((p) => {
    // Profile filter
    if (activeProfile !== 'all') {
      if (activeProfile === 'romanian') {
        if (p.category === 'international' && !p.target_profiles?.includes('romanian')) {
          return false;
        }
      } else {
        if (!p.target_profiles?.includes(activeProfile)) {
          return false;
        }
      }
    }

    // Purpose filter
    if (activePurpose !== 'all') {
      if (activePurpose === 'work') {
        const matchesStay = p.stay_purposes?.includes('work');
        const matchesKw = (p.keywords || []).some((k) => k.includes('munca') || k.includes('angajare') || k.includes('srl') || k.includes('firma'));
        if (!matchesStay && !matchesKw && p.category !== 'afaceri') return false;
      } else if (activePurpose === 'studies') {
        const matchesStay = p.stay_purposes?.includes('studies');
        const matchesKw = (p.keywords || []).some((k) => k.includes('studii') || k.includes('student'));
        if (!matchesStay && !matchesKw) return false;
      } else if (activePurpose === 'family') {
        const matchesStay = p.stay_purposes?.includes('family');
        const matchesKw = (p.keywords || []).some((k) => k.includes('familie') || k.includes('casatorie') || k.includes('nastere') || k.includes('alocatie'));
        if (!matchesStay && !matchesKw && p.category !== 'familie') return false;
      } else if (activePurpose === 'residence') {
        const matchesStay = p.stay_purposes?.includes('permanent') || p.stay_purposes?.includes('other');
        const matchesKw = (p.keywords || []).some((k) => k.includes('rezidenta') || k.includes('sedere') || k.includes('flotant') || k.includes('domiciliu'));
        if (!matchesStay && !matchesKw && p.category !== 'locuinta' && p.category !== 'international') return false;
      } else if (activePurpose === 'identity') {
        const matchesKw = (p.keywords || []).some((k) => k.includes('buletin') || k.includes('identitate') || k.includes('pasaport') || k.includes('cazier') || k.includes('transcriere'));
        if (!matchesKw && p.category !== 'identitate' && p.category !== 'juridic') return false;
      } else if (activePurpose === 'other') {
        const matchesKw = (p.keywords || []).some((k) => k.includes('nif') || k.includes('anaf') || k.includes('sanatate') || k.includes('cnas') || k.includes('auto') || k.includes('permis'));
        if (!matchesKw && p.category !== 'auto' && p.category !== 'beneficii') return false;
      }
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Breadcrumb & Heading */}
      <div className="mb-8">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-900 mb-3 transition"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>{lang === 'ro' ? 'Înapoi la pagina principală' : 'Back to main catalog'}</span>
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold mb-2 border border-blue-200">
              <Compass className="w-3.5 h-3.5 text-blue-700" />
              <span>{lang === 'ro' ? 'Ghid Civic de Navigare Administrativă' : 'Civic Navigation Guide by Status'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {lang === 'ro' ? 'Pentru cine este acest ghid?' : 'Who is this guide for?'}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              {lang === 'ro'
                ? 'În România, drepturile și cerințele administrative depind atât de statutul de cetățenie, cât și de durata șederii, scopul activității și existența legăturilor de familie. Alege traseul care descrie situația ta:'
                : 'In Romania, administrative requirements depend on your citizenship status, intended stay duration, activity purpose, and family relationships. Choose the pathway matching your situation:'}
            </p>
          </div>

          <button
            onClick={onOpenWizard}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-sm shadow-md shadow-blue-700/20 transition shrink-0"
          >
            <Compass className="w-4 h-4 text-white" />
            <span>{t.startWizardCta}</span>
          </button>
        </div>
      </div>

      {/* 5 Distinct Track Pathway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {TRACKS.map((track) => {
          const isSelected = activeProfile === track.id;
          const trackTitle = lang === 'en' ? track.titleEn : track.title;
          const trackDesc = lang === 'en' ? track.descEn : track.desc;
          const trackAuth = lang === 'en' ? track.authorityEn : track.authority;
          const trackRights = lang === 'en' ? track.keyRightsEn : track.keyRights;

          return (
            <div
              key={track.id}
              onClick={() => setActiveProfile(isSelected ? 'all' : track.id)}
              className={`p-6 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/30 shadow-lg shadow-blue-900/5'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/80">
                    {track.badge}
                  </span>
                  <div
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full transition ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {isSelected ? (lang === 'ro' ? 'Traseu selectat' : 'Active track') : (lang === 'ro' ? 'Selectează' : 'Select')}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {trackTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {trackDesc}
                </p>

                {/* Key authority */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-start gap-1.5 text-xs text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">
                    <strong className="text-slate-700">{lang === 'ro' ? 'Instituții:' : 'Authorities:'}</strong> {trackAuth}
                  </span>
                </div>

                {/* Rights highlight */}
                <div className="mt-3.5 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {lang === 'ro' ? 'Ce poți rezolva:' : 'What you can accomplish:'}
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {trackRights.slice(0, 3).map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
                <span>{lang === 'ro' ? 'Filtrează procedurile acestui traseu' : 'Filter procedures in this track'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Purpose Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-700" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              {lang === 'ro' ? 'Filtrare după scopul procedurii' : 'Filter by purpose of procedure'}
            </h3>
          </div>
          {(activeProfile !== 'all' || activePurpose !== 'all') && (
            <button
              onClick={() => {
                setActiveProfile('all');
                setActivePurpose('all');
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              {t.resetAllFilters}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PURPOSES.map((purp) => {
            const isSelected = activePurpose === purp.id;
            const Icon = purp.icon;
            const label = lang === 'en' ? purp.labelEn : purp.labelRo;

            return (
              <button
                key={purp.id}
                onClick={() => setActivePurpose(purp.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 select-none ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-xs ring-2 ring-blue-700/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Procedures Catalog List for Selected Filter */}
      <div className="mb-12">
        <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {activeProfile === 'all'
                ? (lang === 'ro' ? 'Toate procedurile disponibile' : 'All available procedures')
                : (lang === 'ro'
                    ? `Proceduri pentru: ${TRACKS.find((t) => t.id === activeProfile)?.title}`
                    : `Procedures for: ${TRACKS.find((t) => t.id === activeProfile)?.titleEn}`)}
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {filteredList.length} {filteredList.length === 1 ? (lang === 'ro' ? 'ghid' : 'guide') : (lang === 'ro' ? 'ghiduri' : 'guides')}
          </span>
        </div>

        {filteredList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredList.map((proc) => (
              <ProcedureCard
                key={proc.id}
                procedure={proc}
                onSelect={onSelectProcedure}
                lang={lang}
                userProgress={getProcedureProgress(proc.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">
              {lang === 'ro' ? 'Nu există proceduri specifice pentru combinația selectată' : 'No specific procedures match this filter combination'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {lang === 'ro'
                ? 'Încearcă să resetezi filtrul de scop sau folosește Asistentul de Orientare pentru recomandări automate.'
                : 'Try resetting the purpose filter or use the Orientation Assistant for automated guidance.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setActiveProfile('all');
                  setActivePurpose('all');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                {t.resetAllFilters}
              </button>
              <button
                onClick={onOpenWizard}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-700 hover:bg-blue-800 text-white transition"
              >
                {t.startWizardCta}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legal & Civic Balance Notice */}
      <div className="p-6 rounded-3xl bg-slate-100 border border-slate-200/90 text-xs text-slate-600 leading-relaxed">
        <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>{lang === 'ro' ? 'Transparență & Notă de Orientare Juridică' : 'Transparency & Legal Notice'}</span>
        </h4>
        <p>
          {lang === 'ro'
            ? 'Regulile administrative și dreptul de ședere pot suferi variații în funcție de acordurile bilaterale încheiate de România, statutul familial sau modificările legislative emise de Inspectoratul General pentru Imigrări (IGI) și Ministerul Afacerilor Externe (MAE). Acest portal civic oferă orientare practică sintetizată direct de pe site-urile oficiale guvernamentale și nu înlocuiește decizia individuală a autorităților române competente.'
            : 'Administrative rules and residency rights vary according to bilateral treaties, family status, and legislative updates issued by the General Inspectorate for Immigration (IGI) and the Ministry of Foreign Affairs (MAE). This civic portal provides synthesized practical orientation directly from official government sources and does not substitute for the official decision of competent Romanian authorities.'}
        </p>
      </div>

    </div>
  );
};
