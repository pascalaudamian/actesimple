import { z } from 'zod';

export const documentTypeSchema = z.enum([
  'original',
  'copie',
  'legalizat',
  'formular',
  'dovada_plata',
]);

export const categoryIdSchema = z.enum([
  'toate',
  'identitate',
  'auto',
  'afaceri',
  'juridic',
  'familie',
  'locuinta',
  'beneficii',
  'international',
  'sanatate',
  'altele',
]);

export const applicantProfileSchema = z.enum([
  'all',
  'romanian',
  'eu_eea_ch',
  'non_eu',
  'family_member',
  'unclear',
]);

export const stayPurposeSchema = z.enum([
  'work',
  'studies',
  'family',
  'family_reunification',
  'relocation',
  'id_civil_status',
  'business',
  'business_investment',
  'permanent',
  'permanent_residence',
  'other',
]);

export const procedureDifficultySchema = z.enum(['usor', 'mediu', 'complex']);

export const procedureStatusSchema = z.enum(['published', 'draft', 'needs_review']);

export const documentItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Numele documentului trebuie să aibă cel puțin 2 caractere'),
  name_en: z.string().optional(),
  type: documentTypeSchema,
  is_mandatory: z.boolean().default(true),
  description: z.string().default(''),
  description_en: z.string().optional(),
  where_to_get: z.string().optional(),
  where_to_get_en: z.string().optional(),
  download_url: z.string().url('URL-ul de descărcare trebuie să fie valid').or(z.literal('')).optional(),
  download_label: z.string().optional(),
  order_index: z.number().int().nonnegative().optional(),
});

export const stepItemSchema = z.object({
  id: z.string().optional(),
  step_number: z.number().int().positive().optional(),
  title: z.string().min(2, 'Titlul pasului este obligatoriu'),
  title_en: z.string().optional(),
  description: z.string().min(5, 'Descrierea pasului trebuie să fie detaliată'),
  description_en: z.string().optional(),
  location_or_tool: z.string().optional(),
  tip: z.string().optional(),
  tip_en: z.string().optional(),
  external_link: z
    .object({
      url: z.string().url(),
      label: z.string(),
    })
    .optional(),
});

export const sourceItemSchema = z.object({
  id: z.string().optional(),
  institution_name: z.string().min(2, 'Numele instituției este obligatoriu'),
  issuing_institution: z.string().optional(),
  url: z.string().url('URL-ul sursei oficiale trebuie să fie valid'),
  source_language: z.enum(['ro', 'en', 'multilingual']).optional(),
  last_verified_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format dată invalid (YYYY-MM-DD)'),
  last_consulted_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  editorial_verified_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  verification_result: z.string().optional(),
  notes: z.string().optional(),
  verified_by: z.string().optional(),
});

export const procedureCreateSchema = z.object({
  title: z.string().min(3, 'Titlul procedurii este obligatoriu (minim 3 caractere)'),
  title_en: z.string().optional(),
  slug: z.string().optional(),
  short_description: z.string().min(10, 'Descrierea scurtă trebuie să aibă minim 10 caractere'),
  short_description_en: z.string().optional(),
  full_description: z.string().default(''),
  full_description_en: z.string().optional(),
  category: categoryIdSchema.default('identitate'),
  status: procedureStatusSchema.default('published'),
  estimated_time: z.string().default('3 - 7 zile lucrătoare'),
  estimated_time_en: z.string().optional(),
  difficulty: procedureDifficultySchema.default('usor'),
  total_fee: z.string().default('Gratuit'),
  total_fee_en: z.string().optional(),
  competent_authority: z.string().min(2, 'Autoritatea competentă este obligatorie'),
  competent_authority_en: z.string().optional(),
  authority_city_note: z.string().optional(),
  authority_city_note_en: z.string().optional(),
  is_online_available: z.boolean().default(false),
  last_verified_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  verification_status: z.enum(['verified', 'needs_review', 'unverified']).default('verified'),
  is_popular: z.boolean().default(false),
  target_profiles: z.array(applicantProfileSchema).optional(),
  stay_purposes: z.array(stayPurposeSchema).optional(),
  conditions: z.array(z.string()).optional(),
  conditions_en: z.array(z.string()).optional(),
  exceptions: z.array(z.string()).optional(),
  exceptions_en: z.array(z.string()).optional(),
  content_language: z.enum(['ro', 'en', 'bilingual']).optional(),
  translation_id: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  synonyms: z.array(z.string()).default([]),
  documents: z.array(documentItemSchema).default([]),
  steps: z.array(stepItemSchema).default([]),
  sources: z.array(sourceItemSchema).default([]),
  pro_tips: z.array(z.string()).default([]),
  pro_tips_en: z.array(z.string()).default([]),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
});

export const procedureUpdateSchema = procedureCreateSchema.partial();

export const verifyProcedureSchema = z.object({
  verifier_name: z.string().min(2, 'Numele verificatorului este obligatoriu'),
  verification_notes: z.string().min(5, 'Detaliile și notele de verificare sunt obligatorii'),
  verified_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  is_confirmed_correct: z.boolean().refine((val) => val === true, {
    message: 'Trebuie să confirmați responsabilitatea că informația este conformă cu sursele oficiale',
  }),
});

export const adminLoginSchema = z.object({
  password: z.string().min(4, 'Parola este obligatorie'),
});
