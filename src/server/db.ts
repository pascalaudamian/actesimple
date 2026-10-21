import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Procedure, DocumentItem, StepItem, SourceItem, CategoryId, ProcedureInput } from '../types.ts';
import { INITIAL_PROCEDURES } from '../data/seedProcedures.ts';
import { logAuditEvent } from './auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'procedures.json');

export interface DatabaseSchema {
  procedures: Procedure[];
  version: number;
  lastUpdated: string;
}

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ş/g, 's')
    .replace(/ţ/g, 't')
    .trim();
}

// Synonyms dictionary for Romanian public administrative procedures
const SYNONYM_MAP: Record<string, string[]> = {
  buletin: ['carte de identitate', 'buletin expirat', 'spclep', 'ci', 'schimbare domiciliu'],
  talon: ['certificat de inmatriculare', 'inmatriculare auto', 'numere auto', 'civ', 'dgpci', 'drpciv'],
  cazier: ['certificat de cazier judiciar', 'cazier online', 'hub mai', 'politia romana'],
  firma: ['infiintare firma', 'srl', 'onrc', 'registrul comertului', 'societate'],
  flotant: ['viza de flotant', 'stabilire resedinta', 'chirie', 'luare in spatiu'],
  'act constitutiv': ['infiintare firma', 'srl', 'onrc'],
  permis: ['permis de conducere', 'preschimbare permis', 'fisa auto', 'carnet'],
  carnet: ['permis de conducere'],
  alocatie: ['alocatia de stat', 'copii', 'nou nascut', 'ajpis', 'dgaspc'],
  masina: ['inmatriculare auto', 'talon', 'civ', 'dgpci'],
  auto: ['inmatriculare auto', 'permis de conducere', 'talon'],
  pasaport: ['pasaport simplu electronic', 'epasapoarte', 'dgp'],
  rezidenta: ['certificat de inregistrare', 'permis de sedere', 'igi', 'drept de sedere', 'residence permit', 'sedere permanenta'],
  sedere: ['permis de sedere', 'viza', 'drept de sedere', 'igi', 'prelungire sedere'],
  viza: ['viza tip d', 'eviza mae', 'viza de munca', 'consulat', 'lunga sedere', 'schengen'],
  straini: ['cetateni ue', 'non-ue', 'igi', 'permis de sedere', 'nif', 'imigrari', 'rezidenta'],
  nif: ['numar de identificare fiscala', 'anaf', 'cod fiscal nerezidenti', 'tax id', 'nerezident'],
  imigrari: ['igi', 'inspectoratul general pentru imigrari', 'permis de sedere', 'viza'],
  apostila: ['transcriere certificate', 'apostila de la haga', 'legalizare', 'stare civila'],
  transcriere: ['certificat de nastere strainatate', 'casatorie strainatate', 'stare civila', 'spclep', 'dgep'],
  asigurare: ['cas', 'cnas', 'asigurare de sanatate', 'cass', 'medic de familie', 'card sanatate'],
};

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readDb(): DatabaseSchema {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      procedures: INITIAL_PROCEDURES,
      version: 1,
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    
    // Auto-merge new seed procedures
    const existingIds = new Set(parsed.procedures.map((p) => p.id));
    let hasNew = false;
    for (const initP of INITIAL_PROCEDURES) {
      if (!existingIds.has(initP.id)) {
        parsed.procedures.push(initP);
        hasNew = true;
      }
    }
    if (hasNew) {
      parsed.lastUpdated = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (err) {
    console.error('Error reading procedures database, fallback to initial seed:', err);
    return {
      procedures: INITIAL_PROCEDURES,
      version: 1,
      lastUpdated: new Date().toISOString(),
    };
  }
}

function writeDb(data: DatabaseSchema): void {
  ensureDataDir();
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const dbService = {
  getAllProcedures(filter?: {
    category?: string;
    search?: string;
    status?: string;
    difficulty?: string;
    onlineOnly?: boolean;
    popular?: boolean;
    profile?: string;
    page?: number;
    limit?: number;
  }): { procedures: Procedure[]; total: number; page: number; totalPages: number } {
    const db = readDb();
    let results = db.procedures;

    if (filter?.status && filter.status !== 'all') {
      results = results.filter((p) => p.status === filter.status);
    }

    if (filter?.category && filter.category !== 'toate') {
      results = results.filter((p) => p.category === filter.category);
    }

    if (filter?.difficulty && filter.difficulty !== 'all') {
      results = results.filter((p) => p.difficulty === filter.difficulty);
    }

    if (filter?.profile && filter.profile !== 'all') {
      results = results.filter((p) => p.target_profiles?.includes(filter.profile as any));
    }

    if (filter?.onlineOnly) {
      results = results.filter((p) => p.is_online_available === true);
    }

    if (filter?.popular) {
      results = results.filter((p) => p.is_popular);
    }

    if (filter?.search && filter.search.trim().length > 0) {
      const rawSearch = filter.search.trim().toLowerCase();
      const normQ = normalizeText(rawSearch);

      // Expand query using synonyms dictionary
      const expandedTerms = new Set<string>([normQ]);
      for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
        const normKey = normalizeText(key);
        if (normQ.includes(normKey) || normKey.includes(normQ)) {
          synonyms.forEach((s) => expandedTerms.add(normalizeText(s)));
        }
      }

      results = results.filter((p) => {
        const normTitle = normalizeText(p.title);
        const normDesc = normalizeText(p.short_description + ' ' + p.full_description);
        const normAuth = normalizeText(p.competent_authority || '');
        const normKeywords = (p.keywords || []).map((k) => normalizeText(k));
        const normSynonyms = (p.synonyms || []).map((s) => normalizeText(s));
        const normDocs = (p.documents || []).map((d) => normalizeText(d.name + ' ' + d.description));

        for (const term of expandedTerms) {
          if (
            normTitle.includes(term) ||
            normDesc.includes(term) ||
            normAuth.includes(term) ||
            normKeywords.some((k) => k.includes(term)) ||
            normSynonyms.some((s) => s.includes(term)) ||
            normDocs.some((d) => d.includes(term))
          ) {
            return true;
          }
        }
        return false;
      });
    }

    const total = results.length;
    const page = Math.max(1, filter?.page || 1);
    const limit = filter?.limit && filter.limit > 0 ? filter.limit : total;
    const totalPages = Math.ceil(total / limit) || 1;

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginated = results.slice(startIndex, startIndex + limit);

    return {
      procedures: paginated,
      total,
      page,
      totalPages,
    };
  },

  getProcedureByIdOrSlug(idOrSlug: string): Procedure | null {
    const db = readDb();
    const proc = db.procedures.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    return proc || null;
  },

  createProcedure(input: ProcedureInput, user: string = 'Admin'): Procedure {
    const db = readDb();
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const newId = `proc-${Date.now()}`;
    const slug = (input.slug || input.title || 'procedura-noua')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newProcedure: Procedure = {
      id: newId,
      slug: slug || newId,
      title: input.title || 'Procedură fără titlu',
      short_description: input.short_description || '',
      full_description: input.full_description || '',
      category: (input.category as CategoryId) || 'identitate',
      status: input.status || 'published',
      estimated_time: input.estimated_time || '3 - 7 zile lucrătoare',
      difficulty: input.difficulty || 'usor',
      total_fee: input.total_fee || 'Gratuit',
      competent_authority: input.competent_authority || 'Instituție publică',
      authority_city_note: input.authority_city_note || '',
      is_online_available: Boolean(input.is_online_available),
      last_verified_at: input.last_verified_at || today,
      verification_status: input.verification_status || 'verified',
      verified_by: input.verified_by || user,
      verification_notes: input.verification_notes || '',
      created_at: now,
      updated_at: now,
      is_popular: Boolean(input.is_popular),
      keywords: input.keywords || [],
      synonyms: input.synonyms || [],
      documents: (input.documents || []).map((doc, idx) => ({
        ...doc,
        id: doc.id || `doc-${Date.now()}-${idx}`,
        procedure_id: newId,
        order_index: doc.order_index ?? idx + 1,
      })),
      steps: (input.steps || []).map((step, idx) => ({
        ...step,
        id: step.id || `step-${Date.now()}-${idx}`,
        procedure_id: newId,
        step_number: step.step_number ?? idx + 1,
      })),
      sources: (input.sources || []).map((src, idx) => ({
        ...src,
        id: src.id || `src-${Date.now()}-${idx}`,
        procedure_id: newId,
        last_verified_at: src.last_verified_at || today,
      })),
      pro_tips: input.pro_tips || [],
      faq: input.faq || [],
    };

    db.procedures.unshift(newProcedure);
    writeDb(db);

    logAuditEvent({
      action: 'create',
      entity_type: 'procedure',
      entity_id: newId,
      user,
      details: `Procedura "${newProcedure.title}" a fost creată.`,
    });

    return newProcedure;
  },

  updateProcedure(id: string, updates: ProcedureInput, user: string = 'Admin'): Procedure | null {
    const db = readDb();
    const index = db.procedures.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = db.procedures[index];
    const updatedDocuments = updates.documents !== undefined
      ? updates.documents.map((doc, idx) => ({
          ...doc,
          id: doc.id || `doc-${Date.now()}-${idx}`,
          procedure_id: id,
          order_index: doc.order_index ?? idx + 1,
        }))
      : existing.documents;

    const updatedSteps = updates.steps !== undefined
      ? updates.steps.map((step, idx) => ({
          ...step,
          id: step.id || `step-${Date.now()}-${idx}`,
          procedure_id: id,
          step_number: step.step_number ?? idx + 1,
        }))
      : existing.steps;

    const updatedSources = updates.sources !== undefined
      ? updates.sources.map((src, idx) => ({
          ...src,
          id: src.id || `src-${Date.now()}-${idx}`,
          procedure_id: id,
          last_verified_at: src.last_verified_at || new Date().toISOString().slice(0, 10),
        }))
      : existing.sources;

    const updated: Procedure = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      documents: updatedDocuments,
      steps: updatedSteps,
      sources: updatedSources,
      updated_at: new Date().toISOString(),
    };

    db.procedures[index] = updated;
    writeDb(db);

    logAuditEvent({
      action: 'update',
      entity_type: 'procedure',
      entity_id: id,
      user,
      details: `Procedura "${updated.title}" a fost actualizată.`,
    });

    return updated;
  },

  deleteProcedure(id: string, user: string = 'Admin'): boolean {
    const db = readDb();
    const proc = db.procedures.find((p) => p.id === id);
    if (!proc) return false;

    db.procedures = db.procedures.filter((p) => p.id !== id);
    writeDb(db);

    logAuditEvent({
      action: 'delete',
      entity_type: 'procedure',
      entity_id: id,
      user,
      details: `Procedura "${proc.title}" a fost ștearsă.`,
    });

    return true;
  },

  verifyProcedureWithDetails(
    id: string,
    details: {
      verifier_name: string;
      verification_notes: string;
      verified_at?: string;
    },
    user: string = 'Admin'
  ): Procedure | null {
    const today = details.verified_at || new Date().toISOString().slice(0, 10);
    const updated = this.updateProcedure(
      id,
      {
        last_verified_at: today,
        verification_status: 'verified',
        verified_by: details.verifier_name,
        verification_notes: details.verification_notes,
      },
      user
    );

    if (updated) {
      logAuditEvent({
        action: 'verify',
        entity_type: 'procedure',
        entity_id: id,
        user: details.verifier_name,
        details: `Verificare oficială atestată: ${details.verification_notes}`,
      });
    }

    return updated;
  },

  addDocument(
    procedureId: string,
    doc: Omit<DocumentItem, 'id' | 'procedure_id' | 'order_index'> & { order_index?: number },
    user: string = 'Admin'
  ): DocumentItem | null {
    const db = readDb();
    const proc = db.procedures.find((p) => p.id === procedureId);
    if (!proc) return null;

    const newDoc: DocumentItem = {
      ...doc,
      id: `doc-${Date.now()}`,
      procedure_id: procedureId,
      order_index: doc.order_index ?? proc.documents.length + 1,
    };

    proc.documents.push(newDoc);
    proc.updated_at = new Date().toISOString();
    writeDb(db);

    logAuditEvent({
      action: 'create',
      entity_type: 'document',
      entity_id: newDoc.id,
      user,
      details: `Documentul "${newDoc.name}" a fost adăugat la procedura ${proc.title}.`,
    });

    return newDoc;
  },

  deleteDocument(docId: string, user: string = 'Admin'): boolean {
    const db = readDb();
    for (const proc of db.procedures) {
      const idx = proc.documents.findIndex((d) => d.id === docId);
      if (idx !== -1) {
        const docName = proc.documents[idx].name;
        proc.documents.splice(idx, 1);
        proc.updated_at = new Date().toISOString();
        writeDb(db);

        logAuditEvent({
          action: 'delete',
          entity_type: 'document',
          entity_id: docId,
          user,
          details: `Documentul "${docName}" a fost șters din procedura ${proc.title}.`,
        });

        return true;
      }
    }
    return false;
  },

  addStep(
    procedureId: string,
    step: Omit<StepItem, 'id' | 'procedure_id' | 'step_number'> & { step_number?: number },
    user: string = 'Admin'
  ): StepItem | null {
    const db = readDb();
    const proc = db.procedures.find((p) => p.id === procedureId);
    if (!proc) return null;

    const newStep: StepItem = {
      ...step,
      id: `step-${Date.now()}`,
      procedure_id: procedureId,
      step_number: step.step_number ?? proc.steps.length + 1,
    };

    proc.steps.push(newStep);
    proc.updated_at = new Date().toISOString();
    writeDb(db);

    logAuditEvent({
      action: 'create',
      entity_type: 'step',
      entity_id: newStep.id,
      user,
      details: `Pasul "${newStep.title}" a fost adăugat la procedura ${proc.title}.`,
    });

    return newStep;
  },

  deleteStep(stepId: string, user: string = 'Admin'): boolean {
    const db = readDb();
    for (const proc of db.procedures) {
      const idx = proc.steps.findIndex((s) => s.id === stepId);
      if (idx !== -1) {
        const stepTitle = proc.steps[idx].title;
        proc.steps.splice(idx, 1);
        // renumber remaining steps
        proc.steps.forEach((s, i) => {
          s.step_number = i + 1;
        });
        proc.updated_at = new Date().toISOString();
        writeDb(db);

        logAuditEvent({
          action: 'delete',
          entity_type: 'step',
          entity_id: stepId,
          user,
          details: `Pasul "${stepTitle}" a fost șters din procedura ${proc.title}.`,
        });

        return true;
      }
    }
    return false;
  },

  resetSeed(user: string = 'Admin'): DatabaseSchema {
    ensureDataDir();
    const newDb: DatabaseSchema = {
      procedures: INITIAL_PROCEDURES,
      version: 1,
      lastUpdated: new Date().toISOString(),
    };
    writeDb(newDb);

    logAuditEvent({
      action: 'reset_seed',
      entity_type: 'system',
      user,
      details: 'Baza de date a fost resetată la procedurile demonstrative oficiale.',
    });

    return newDb;
  },

  getStats() {
    const db = readDb();
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString().slice(0, 10);

    const total = db.procedures.length;
    const verifiedRecent = db.procedures.filter(
      (p) => p.last_verified_at >= sixMonthsAgo && p.verification_status !== 'needs_review'
    ).length;
    const needsReview = total - verifiedRecent;
    const totalDocuments = db.procedures.reduce((acc, p) => acc + (p.documents?.length || 0), 0);
    const totalSteps = db.procedures.reduce((acc, p) => acc + (p.steps?.length || 0), 0);
    const onlineProcedures = db.procedures.filter((p) => p.is_online_available).length;

    return {
      total,
      verifiedRecent,
      needsReview,
      totalDocuments,
      totalSteps,
      onlineProcedures,
      lastUpdated: db.lastUpdated,
    };
  },
};
