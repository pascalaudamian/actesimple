export type CategoryId =
  | 'toate'
  | 'identitate'
  | 'auto'
  | 'afaceri'
  | 'juridic'
  | 'familie'
  | 'locuinta'
  | 'beneficii'
  | 'international'
  | 'sanatate'
  | 'altele';

export type ApplicantProfile = 'all' | 'romanian' | 'eu_eea_ch' | 'non_eu' | 'family_member' | 'unclear';

export type StayPurpose = 'work' | 'studies' | 'family' | 'business' | 'permanent' | 'other';

export type DocumentType = 'original' | 'copie' | 'legalizat' | 'formular' | 'dovada_plata';

export type ProcedureDifficulty = 'usor' | 'mediu' | 'complex';

export type ProcedureStatus = 'published' | 'draft' | 'needs_review';

export type VerificationStatus = 'verified' | 'needs_review' | 'unverified';

export interface DocumentItem {
  id: string;
  procedure_id: string;
  name: string;
  name_en?: string;
  type: DocumentType;
  is_mandatory: boolean;
  description: string;
  description_en?: string;
  where_to_get?: string;
  where_to_get_en?: string;
  download_url?: string;
  download_label?: string;
  order_index: number;
}

export interface StepItem {
  id: string;
  procedure_id: string;
  step_number: number;
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  location_or_tool?: string;
  tip?: string;
  tip_en?: string;
  external_link?: {
    url: string;
    label: string;
  };
}

export interface SourceItem {
  id: string;
  procedure_id: string;
  institution_name: string;
  url: string;
  source_language?: 'ro' | 'en' | 'multilingual';
  last_verified_at: string; // YYYY-MM-DD
  last_consulted_at?: string; // YYYY-MM-DD
  editorial_verified_at?: string; // YYYY-MM-DD
  issuing_institution?: string;
  notes?: string;
  verified_by?: string;
}

export interface FaqItem {
  question: string;
  question_en?: string;
  answer: string;
  answer_en?: string;
}

export interface Procedure {
  id: string;
  slug: string;
  title: string;
  title_en?: string;
  short_description: string;
  short_description_en?: string;
  full_description: string;
  full_description_en?: string;
  category: CategoryId;
  status: ProcedureStatus;
  estimated_time: string;
  estimated_time_en?: string;
  difficulty: ProcedureDifficulty;
  total_fee: string;
  total_fee_en?: string;
  competent_authority: string;
  competent_authority_en?: string;
  authority_city_note?: string;
  authority_city_note_en?: string;
  is_online_available?: boolean;
  last_verified_at: string; // YYYY-MM-DD
  verification_status?: VerificationStatus;
  verified_by?: string;
  verification_notes?: string;
  created_at: string;
  updated_at: string;
  is_popular: boolean;
  target_profiles?: ApplicantProfile[];
  stay_purposes?: StayPurpose[];
  recommendation_rationale_ro?: string;
  recommendation_rationale_en?: string;
  keywords: string[];
  synonyms?: string[];
  documents: DocumentItem[];
  steps: StepItem[];
  sources: SourceItem[];
  pro_tips?: string[];
  pro_tips_en?: string[];
  faq?: FaqItem[];
}

export type DocumentInput = Omit<DocumentItem, 'id' | 'procedure_id' | 'order_index'> & {
  id?: string;
  procedure_id?: string;
  order_index?: number;
};

export type StepInput = Omit<StepItem, 'id' | 'procedure_id' | 'step_number'> & {
  id?: string;
  procedure_id?: string;
  step_number?: number;
};

export type SourceInput = Omit<SourceItem, 'id' | 'procedure_id'> & {
  id?: string;
  procedure_id?: string;
};

export type ProcedureInput = Omit<Partial<Procedure>, 'documents' | 'steps' | 'sources'> & {
  documents?: DocumentInput[];
  steps?: StepInput[];
  sources?: SourceInput[];
};

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
  count?: number;
}

export interface UserChecklistState {
  version: number;
  checkedDocumentIds: string[];
  checkedStepNumbers: number[];
  customDocuments: Array<{
    id: string;
    name: string;
    is_checked: boolean;
  }>;
  personalNotes: string;
  appointmentDate: string;
  appointmentLocation: string;
  lastUpdated: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'verify' | 'reset_seed' | 'login';
  entity_type: 'procedure' | 'document' | 'step' | 'source' | 'system' | 'auth';
  entity_id?: string;
  user: string;
  details: string;
}
