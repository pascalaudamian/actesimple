export type CategoryId =
  | 'toate'
  | 'identitate'
  | 'auto'
  | 'afaceri'
  | 'juridic'
  | 'familie'
  | 'locuinta'
  | 'sanatate';

export type DocumentType = 'original' | 'copie' | 'legalizat' | 'formular' | 'dovada_plata';

export type ProcedureDifficulty = 'usor' | 'mediu' | 'complex';

export type ProcedureStatus = 'published' | 'draft' | 'needs_review';

export interface DocumentItem {
  id: string;
  procedure_id: string;
  name: string;
  type: DocumentType;
  is_mandatory: boolean;
  description: string;
  where_to_get?: string;
  download_url?: string;
  download_label?: string;
  order_index: number;
}

export interface StepItem {
  id: string;
  procedure_id: string;
  step_number: number;
  title: string;
  description: string;
  location_or_tool?: string;
  tip?: string;
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
  last_verified_at: string; // YYYY-MM-DD
  notes?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Procedure {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  full_description: string;
  category: CategoryId;
  status: ProcedureStatus;
  estimated_time: string;
  difficulty: ProcedureDifficulty;
  total_fee: string;
  competent_authority: string;
  authority_city_note?: string;
  last_verified_at: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
  is_popular: boolean;
  keywords: string[];
  documents: DocumentItem[];
  steps: StepItem[];
  sources: SourceItem[];
  pro_tips?: string[];
  faq?: FaqItem[];
}

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
}

export interface UserChecklistState {
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
