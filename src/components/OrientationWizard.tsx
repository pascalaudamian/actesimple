import React, { useState, useMemo } from 'react';
import { Procedure, ApplicantProfile, StayPurpose } from '../types.ts';
import { Language, translations } from '../i18n/translations.ts';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building2,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Compass,
  X,
  MapPin,
  HelpCircle,
} from 'lucide-react';

interface OrientationWizardProps {
  procedures: Procedure[];
  lang: Language;
  onSelectProcedure: (procedure: Procedure) => void;
  onClose: () => void;
  onApplyProfileFilter?: (profile: ApplicantProfile) => void;
}

const ROMANIAN_COUNTIES = [
  'București',
  'Alba',
  'Arad',
  'Argeș',
  'Bacău',
  'Bihor',
  'Bistrița-Năsăud',
  'Botoșani',
  'Brașov',
  'Brăila',
  'Buzău',
  'Caraș-Severin',
  'Călărași',
  'Cluj',
  'Constanța',
  'Covasna',
  'Dâmbovița',
  'Dolj',
  'Galați',
  'Giurgiu',
  'Gorj',
  'Harghita',
  'Hunedoara',
  'Ialomița',
  'Iași',
  'Ilfov',
  'Maramureș',
  'Mehedinți',
  'Mureș',
  'Neamț',
  'Olt',
  'Prahova',
  'Satu Mare',
  'Sălaj',
  'Sibiu',
  'Suceava',
  'Teleorman',
  'Timiș',
  'Tulcea',
  'Vaslui',
  'Vâlcea',
  'Vrancea',
];

export const OrientationWizard: React.FC<OrientationWizardProps> = ({
  procedures,
  lang,
  onSelectProcedure,
  onClose,
  onApplyProfileFilter,
}) => {
  const t = translations[lang];

  // Wizard state
  const [step, setStep] = useState<number>(1);
  const [profile, setProfile] = useState<ApplicantProfile>('all');
  const [purpose, setPurpose] = useState<StayPurpose>('work');
  const [duration, setDuration] = useState<'short' | 'long' | 'permanent'>('long');
  const [familyRelation, setFamilyRelation] = useState<string>('none');
  const [hasWorkAuthorization, setHasWorkAuthorization] = useState<string>('not_applicable');
  const [selectedCounty, setSelectedCounty] = useState<string>('București');
  const [unclearDetails, setUnclearDetails] = useState<string>('');

  // Total steps in the standard flow is 4 or 5
  const totalSteps = profile === 'unclear' ? 3 : 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setStep(99); // Results step
    }
  };

  const handleBack = () => {
    if (step === 99) {
      setStep(totalSteps);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleRestart = () => {
    setStep(1);
    setProfile('all');
    setPurpose('work');
    setDuration('long');
    setFamilyRelation('none');
    setHasWorkAuthorization('not_applicable');
    setUnclearDetails('');
  };

  // Logic to determine matching procedures and explanations
  const recommendations = useMemo(() => {
    const list: Array<{ procedure: Procedure; reason: string; priority: number; criticalNotice?: string }> = [];

    // Helper finder
    const findProc = (idOrSlug: string) =>
      procedures.find((p) => p.id === idOrSlug || p.slug === idOrSlug || p.id.includes(idOrSlug));

    // Profile: Romanian citizen
    if (profile === 'romanian') {
      if (purpose === 'family' || purpose === 'other') {
        const trans = findProc('transcriere');
        if (trans) {
          list.push({
            procedure: trans,
            reason:
              lang === 'ro'
                ? 'Pentru recunoașterea căsătoriei sau a nașterii copilului survenite în străinătate.'
                : 'For official Romanian registration of marriage or child birth occurred abroad.',
            priority: 1,
          });
        }
      }
      const ci = findProc('buletin');
      if (ci) {
        list.push({
          procedure: ci,
          reason:
            lang === 'ro'
              ? 'Actul principal de identitate și stabilire a domiciliului pe teritoriul României.'
              : 'Primary identity document and official residence establishment in Romania.',
          priority: 2,
        });
      }
      const pas = findProc('pasaport');
      if (pas) {
        list.push({
          procedure: pas,
          reason:
            lang === 'ro'
              ? 'Document de călătorie internațională pentru cetățenii români.'
              : 'Official international travel document for Romanian citizens.',
          priority: 3,
        });
      }
      return list;
    }

    // Profile: EU / EEA / Swiss citizen
    if (profile === 'eu_eea_ch') {
      if (duration === 'short') {
        const nif = findProc('nif');
        if (nif) {
          list.push({
            procedure: nif,
            reason:
              lang === 'ro'
                ? 'Cetățenii UE au drept de ședere liberă până la 90 de zile fără înregistrare. Dacă ai activități economice, ai nevoie de NIF la ANAF.'
                : 'EU citizens can freely stay up to 90 days without registration. If conducting financial/business matters, you need a Tax ID (NIF).',
            priority: 1,
          });
        }
      } else if (duration === 'permanent' || purpose === 'permanent') {
        const perm = findProc('rezidenta-permanenta');
        if (perm) {
          list.push({
            procedure: perm,
            reason:
              lang === 'ro'
                ? 'După o ședere legală continuă de 5 ani în România, cetățenii UE pot solicita Cartea de Rezidență Permanentă.'
                : 'After 5 years of uninterrupted legal residence in Romania, EU citizens can apply for Permanent Residence.',
            priority: 1,
          });
        }
      } else {
        // Long stay EU
        const reg = findProc('ue-inregistrare');
        if (reg) {
          list.push({
            procedure: reg,
            reason:
              lang === 'ro'
                ? 'Obligatoriu pentru cetățenii UE/SEE/CH care rămân în România mai mult de 90 de zile (Certificat de Înregistrare la IGI).'
                : 'Mandatory for EU/EEA/Swiss citizens residing in Romania for more than 90 days (Registration Certificate at IGI).',
            priority: 1,
            criticalNotice:
              lang === 'ro'
                ? 'Cererea se depune la Biroul pentru Imigrări din județul ' + selectedCounty + '.'
                : 'Application must be submitted at the Immigration Office in county ' + selectedCounty + '.',
          });
        }
        const nif = findProc('nif');
        if (nif && (purpose === 'work' || purpose === 'business')) {
          list.push({
            procedure: nif,
            reason:
              lang === 'ro'
                ? 'Necesar pentru contracte comerciale, cont bancar sau plata impozitelor la ANAF.'
                : 'Required for commercial contracts, banking, or tax compliance with Romanian ANAF.',
            priority: 2,
          });
        }
        const cnas = findProc('asigurare-sanatate');
        if (cnas) {
          list.push({
            procedure: cnas,
            reason:
              lang === 'ro'
                ? 'Pentru acces la pachetul de servicii medicale de bază în România prin CAS.'
                : 'For full access to public healthcare coverage in Romania via CAS/CNAS.',
            priority: 3,
          });
        }
      }
      return list;
    }

    // Profile: Family Member of EU or Romanian citizen
    if (profile === 'family_member') {
      const carteFam = findProc('carte-rezidenta-membru-familie') || findProc('membru-familie');
      if (carteFam) {
        list.push({
          procedure: carteFam,
          reason:
            lang === 'ro'
              ? 'Ghid dedicat membrilor de familie (soț/soție, copii) care însoțesc sau se alătură unui cetățean român ori UE.'
              : 'Dedicated guide for eligible family members (spouse, children) joining a Romanian or EU citizen.',
          priority: 1,
          criticalNotice:
            lang === 'ro'
              ? 'Dacă certificatul de căsătorie a fost emis în străinătate, trebuie transcris sau apostilat/supralegalizat anterior.'
              : 'If your marriage certificate was issued abroad, it must be officially transcribed or apostilled/legalized first.',
        });
      }
      const trans = findProc('transcriere');
      if (trans) {
        list.push({
          procedure: trans,
          reason:
            lang === 'ro'
              ? 'Transcriere certificate de căsătorie sau naștere străine în registrele de stare civilă din România.'
              : 'Transcription of foreign civil status certificates into official Romanian civil registers.',
          priority: 2,
        });
      }
      const cnas = findProc('asigurare-sanatate');
      if (cnas) {
        list.push({
          procedure: cnas,
          reason:
            lang === 'ro'
              ? 'Înscriere ca asigurat sau coasigurat în sistemul public de sănătate.'
              : 'Enrollment as insured or dependent co-insured in the public healthcare system.',
          priority: 3,
        });
      }
      return list;
    }

    // Profile: Non-EU Citizen
    if (profile === 'non_eu') {
      if (duration === 'short') {
        const vizaD = findProc('viza-lunga-sedere');
        if (vizaD) {
          list.push({
            procedure: vizaD,
            reason:
              lang === 'ro'
                ? 'Pentru șederi scurte este necesară viza uniformă Schengen tip C (turism/afaceri) depusă pe eviza.mae.ro.'
                : 'For short stays under 90 days, a Schengen Type C visa is required via eviza.mae.ro.',
            priority: 1,
          });
        }
      } else if (purpose === 'work') {
        const vizaD = findProc('viza-lunga-sedere');
        if (vizaD) {
          list.push({
            procedure: vizaD,
            reason:
              lang === 'ro'
                ? 'Pasul 1 obligatoriu din țara de origine: Viza de lungă ședere pentru angajare în muncă (simbol D/AM).'
                : 'Mandatory Step 1 from abroad: Long-stay visa for employment (symbol D/AM).',
            priority: 1,
          });
        }
        const permisMunca = findProc('permis-sedere-munca') || findProc('permis-unic');
        if (permisMunca) {
          list.push({
            procedure: permisMunca,
            reason:
              lang === 'ro'
                ? 'Pasul 2 în România: Eliberarea Permisului Unic de Ședere în scop de muncă la IGI județean.'
                : 'Step 2 inside Romania: Issuance of the Single Residence Permit for work at territorial IGI.',
            priority: 2,
            criticalNotice:
              lang === 'ro'
                ? 'Dosarul trebuie depus la Serviciul Imigrări ' + selectedCounty + ' cu cel puțin 30 de zile înainte de expirarea vizei D.'
                : 'Application must be filed at the ' + selectedCounty + ' Immigration Office at least 30 days before visa D expires.',
          });
        }
      } else if (purpose === 'studies') {
        const vizaD = findProc('viza-lunga-sedere');
        if (vizaD) {
          list.push({
            procedure: vizaD,
            reason:
              lang === 'ro'
                ? 'Viza de lungă ședere pentru studii (simbol D/SD), solicitată la consulatul României după primirea acceptului de studii.'
                : 'Long-stay visa for study purposes (symbol D/SD), requested at the Romanian consulate upon university acceptance.',
            priority: 1,
          });
        }
        const permisStudii = findProc('studii');
        if (permisStudii) {
          list.push({
            procedure: permisStudii,
            reason:
              lang === 'ro'
                ? 'Eliberarea permisului de ședere temporară pentru studii la IGI România.'
                : 'Issuance of the temporary residence permit for students at IGI Romania.',
            priority: 2,
          });
        }
      } else if (purpose === 'permanent' || duration === 'permanent') {
        const perm = findProc('rezidenta-permanenta');
        if (perm) {
          list.push({
            procedure: perm,
            reason:
              lang === 'ro'
                ? 'Permis de ședere pe termen lung UE în România (după 5 ani de ședere legală continuă).'
                : 'EU Long-Term Residence Permit in Romania (available after 5 continuous legal years).',
            priority: 1,
          });
        }
      } else {
        // Generic Non-EU
        const vizaD = findProc('viza-lunga-sedere');
        if (vizaD) {
          list.push({
            procedure: vizaD,
            reason:
              lang === 'ro'
                ? 'Viza de lungă ședere (Tip D) prin portalul oficial eviza.mae.ro.'
                : 'Long-stay visa (Type D) via the official eviza.mae.ro portal.',
            priority: 1,
          });
        }
        const prelungire = findProc('prelungire-drept-sedere');
        if (prelungire) {
          list.push({
            procedure: prelungire,
            reason:
              lang === 'ro'
                ? 'Prelungirea dreptului de ședere temporară și reînnoirea permisului la IGI.'
                : 'Extension of temporary stay and permit renewal at IGI.',
            priority: 2,
          });
        }
      }
      return list;
    }

    // Profile: Status unclear
    if (profile === 'unclear') {
      const reg = findProc('ue-inregistrare');
      const vizaD = findProc('viza-lunga-sedere');
      const trans = findProc('transcriere');
      if (reg) {
        list.push({
          procedure: reg,
          reason:
            lang === 'ro'
              ? 'Dacă deții sau poți proba cetățenia unui stat membru UE/SEE/Elveția, beneficiezi de regimul simplificat de înregistrare a rezidenței.'
              : 'If you hold or can prove citizenship of an EU/EEA/Swiss state, you benefit from simplified registration.',
          priority: 1,
        });
      }
      if (vizaD) {
        list.push({
          procedure: vizaD,
          reason:
            lang === 'ro'
              ? 'Dacă nu deții cetățenie UE sau relație de familie directă, se aplică regimul general pentru cetățeni din state terțe.'
              : 'If you do not hold EU citizenship or a direct family tie, third-country national visa rules apply.',
          priority: 2,
        });
      }
      if (trans) {
        list.push({
          procedure: trans,
          reason:
            lang === 'ro'
              ? 'Recunoașterea și transcrierea actelor de stare civilă (naștere, căsătorie) doveditoare.'
              : 'Official recognition and transcription of foreign civil status records.',
          priority: 3,
        });
      }
      return list;
    }

    // Default fallback
    return list;
  }, [profile, purpose, duration, selectedCounty, lang, procedures]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"
            title="Închide asistentul"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Compass className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              {lang === 'ro' ? 'Asistent de Orientare Civic' : 'Civic Orientation Assistant'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {t.wizardTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {t.wizardSubtitle}
          </p>

          {/* Privacy badge */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-white text-[11px] backdrop-blur-xs border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.wizardLegalNotice}</span>
          </div>
        </div>

        {/* Wizard Steps Content */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1">
          {step !== 99 && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                <span>
                  {lang === 'ro' ? `Pasul ${step} din ${totalSteps}` : `Step ${step} of ${totalSteps}`}
                </span>
                <span>
                  {Math.round((step / totalSteps) * 100)}% {lang === 'ro' ? 'completat' : 'completed'}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP 1: Citizenship Status */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t.wizardStep1Title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.wizardStep1Desc}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                {[
                  {
                    id: 'romanian' as ApplicantProfile,
                    title: t.profileRomanian,
                    desc: t.profileRomanianDesc,
                    badge: 'RO',
                  },
                  {
                    id: 'eu_eea_ch' as ApplicantProfile,
                    title: t.profileEu,
                    desc: t.profileEuDesc,
                    badge: 'EU / SEE / CH',
                  },
                  {
                    id: 'non_eu' as ApplicantProfile,
                    title: t.profileNonEu,
                    desc: t.profileNonEuDesc,
                    badge: 'Non-UE / Third-Country',
                  },
                  {
                    id: 'family_member' as ApplicantProfile,
                    title: t.profileFamily,
                    desc: t.profileFamilyDesc,
                    badge: 'Membru Familie / Family',
                  },
                  {
                    id: 'unclear' as ApplicantProfile,
                    title: lang === 'ro' ? 'Statut neclar / Caz special' : 'Status unclear / Special case',
                    desc:
                      lang === 'ro'
                        ? 'Dublă cetățenie, apatrid, solicitant de azil sau nu știu sigur ce categorie mi se aplică.'
                        : 'Dual citizenship, stateless, asylum applicant, or unsure which category applies.',
                    badge: 'Clarificare / Clarify',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setProfile(item.id)}
                    className={`text-left p-4 rounded-2xl border transition flex flex-col justify-between ${
                      profile === item.id
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {item.badge}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            profile === item.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {profile === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Purpose of Stay */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t.wizardStep2Title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.wizardStep2Desc}</p>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2 pt-2">
                {[
                  {
                    id: 'work' as StayPurpose,
                    title: t.purposeWork,
                    desc: lang === 'ro' ? 'Angajare locală, detașare sau telemuncă (digital nomad)' : 'Local employment, posted worker, or remote nomad',
                  },
                  {
                    id: 'studies' as StayPurpose,
                    title: t.purposeStudies,
                    desc: lang === 'ro' ? 'Licență, masterat, doctorat, Erasmus sau schimb de elevi' : 'Bachelor, Master, PhD, Erasmus or student exchange',
                  },
                  {
                    id: 'family' as StayPurpose,
                    title: t.purposeFamily,
                    desc: lang === 'ro' ? 'Alăturare la soț/soție, părinți sau copii aflați în România' : 'Joining spouse, parents, or children in Romania',
                  },
                  {
                    id: 'business' as StayPurpose,
                    title: t.purposeBusiness,
                    desc: lang === 'ro' ? 'Înființare SRL, asociat, administrator sau investiție comercială' : 'Founding a company, shareholder, or direct investment',
                  },
                  {
                    id: 'permanent' as StayPurpose,
                    title: t.purposePermanent,
                    desc: lang === 'ro' ? 'Locuire de peste 5 ani sau stabilire permanentă în România' : 'Residing over 5 continuous years or permanent settlement',
                  },
                  {
                    id: 'other' as StayPurpose,
                    title: t.purposeOther,
                    desc: lang === 'ro' ? 'NIF fiscal, asigurare medicală CAS, acte de stare civilă' : 'Tax ID (NIF), public healthcare (CAS), civil records',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPurpose(item.id)}
                    className={`text-left p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                      purpose === item.id
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            purpose === item.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {purpose === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Duration & Location */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t.wizardStep3Title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.wizardStep3Desc}</p>
              </div>

              {/* Duration choice */}
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    id: 'short' as const,
                    title: t.durationShort,
                    desc: t.durationShortDesc,
                  },
                  {
                    id: 'long' as const,
                    title: t.durationLong,
                    desc: t.durationLongDesc,
                  },
                  {
                    id: 'permanent' as const,
                    title: lang === 'ro' ? 'Peste 5 ani continuu' : 'Over 5 continuous years',
                    desc: lang === 'ro' ? 'Rezidență pe termen lung sau cetățenie' : 'Long-term resident status or citizenship',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDuration(item.id)}
                    className={`text-left p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                      duration === item.id
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900 text-sm">{item.title}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            duration === item.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {duration === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* County of residence in Romania */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {lang === 'ro'
                        ? 'Județul de reședință / cazare în România (pentru identificarea biroului IGI):'
                        : 'County of residence in Romania (to identify competent IGI office):'}
                    </span>
                  </span>
                </label>
                <select
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                  className="w-full sm:w-72 px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {ROMANIAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  {lang === 'ro'
                    ? 'Competența teritorială aparține Inspectoratului Județean pentru Imigrări din județul unde declari adresa.'
                    : 'Territorial competence rests with the County Immigration Inspectorate where your address is declared.'}
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Specific Situation Check */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t.wizardStep4Title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.wizardStep4Desc}</p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  {
                    id: 'spouse_ro',
                    label:
                      lang === 'ro'
                        ? 'Sunt soț/soție al unui cetățean român'
                        : 'I am married to a Romanian citizen',
                  },
                  {
                    id: 'spouse_eu',
                    label:
                      lang === 'ro'
                        ? 'Sunt soț/soție sau membru de familie al unui cetățean UE rezident în România'
                        : 'I am a family member of an EU citizen residing in Romania',
                  },
                  {
                    id: 'child_dependent',
                    label:
                      lang === 'ro'
                        ? 'Sunt copil sau părinte aflat în întreținerea unui cetățean român sau UE'
                        : 'I am a dependent child or parent of a Romanian or EU citizen',
                  },
                  {
                    id: 'none',
                    label:
                      lang === 'ro'
                        ? 'Nu am relații de familie directe cu un cetățean român sau UE'
                        : 'I do not have direct family ties to a Romanian or EU citizen',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFamilyRelation(item.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                      familyRelation === item.id
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-800">{item.label}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                        familyRelation === item.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {familyRelation === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 99: RESULTS SCREEN */}
          {step === 99 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {lang === 'ro' ? 'Profil sintetizat cu succes' : 'Profile successfully synthesized'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{t.wizardResultsTitle}</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.wizardResultsSub}</p>
              </div>

              {/* Recommendations list */}
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map(({ procedure, reason, criticalNotice }, idx) => (
                    <div
                      key={procedure.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                              #{idx + 1} {lang === 'ro' ? 'Ghid Recomandat' : 'Recommended Guide'}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500">
                              {procedure.estimated_time}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900">
                            {lang === 'en' && procedure.title_en ? procedure.title_en : procedure.title}
                          </h4>

                          {/* Bilingual note if in English */}
                          {lang === 'en' && procedure.title_en && (
                            <p className="text-xs font-medium text-slate-500 italic mt-0.5">
                              Romanian official legal title: {procedure.title}
                            </p>
                          )}

                          {/* Why recommended */}
                          <div className="mt-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-100 text-xs text-blue-900 leading-relaxed">
                            <strong className="font-semibold block mb-0.5">
                              {t.wizardWhyRecommended}
                            </strong>
                            <span>{reason}</span>
                          </div>

                          {/* Critical Notice if any */}
                          {criticalNotice && (
                            <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <span>{criticalNotice}</span>
                            </div>
                          )}

                          {/* Quick specs */}
                          <div className="mt-3 flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>{procedure.competent_authority}</span>
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-slate-800">
                              <span>Taxe: {procedure.total_fee}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                              <span>{procedure.documents?.length || 0} {lang === 'ro' ? 'acte cerute' : 'documents'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Open procedure button */}
                        <button
                          onClick={() => {
                            onSelectProcedure(procedure);
                            onClose();
                          }}
                          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition"
                        >
                          <span>{t.wizardOpenGuide}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">
                    {lang === 'ro'
                      ? 'Informațiile sunt parțiale sau cazul necesită asistență consulară directă.'
                      : 'Information is partial or this case requires direct consular assistance.'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    {lang === 'ro'
                      ? 'Recomandăm consultarea directă a portalului oficial al Inspectoratului General pentru Imigrări (igi.mai.gov.ro) sau MAE (eviza.mae.ro).'
                      : 'We recommend consulting the official portal of the Romanian Immigration Inspectorate (igi.mai.gov.ro) or MFA (eviza.mae.ro).'}
                  </p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-4 rounded-2xl bg-slate-100 text-slate-600 text-xs border border-slate-200/80 leading-relaxed">
                <span className="font-semibold text-slate-800 block mb-1">
                  {lang === 'ro' ? 'Notă privind validitatea legală:' : 'Legal Validity Disclaimer:'}
                </span>
                {t.wizardDisclaimer}
              </div>

              {/* Apply profile filter button */}
              {onApplyProfileFilter && profile !== 'all' && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      onApplyProfileFilter(profile);
                      onClose();
                    }}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
                  >
                    {lang === 'ro'
                      ? `Filtrează tot catalogul pentru profilul: ${profile}`
                      : `Filter the whole catalog for profile: ${profile}`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {step > 1 && step !== 99 && (
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-200/70 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.wizardBack}</span>
              </button>
            )}
            {step === 99 && (
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-200/70 rounded-xl transition"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>{t.wizardRestart}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
            >
              {t.wizardClose}
            </button>

            {step !== 99 && (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition"
              >
                <span>{step === totalSteps ? (lang === 'ro' ? 'Vezi Ghidurile Recomandate' : 'View Recommended Guides') : t.wizardNext}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
