import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Procedure, DocumentItem, StepItem, SourceItem, CategoryId } from '../types.ts';
import { INITIAL_PROCEDURES } from '../data/seedProcedures.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'procedures.json');

export interface DatabaseSchema {
  procedures: Procedure[];
  version: number;
  lastUpdated: string;
}

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
    return JSON.parse(raw) as DatabaseSchema;
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
    popular?: boolean;
  }): Procedure[] {
    const db = readDb();
    let results = db.procedures;

    if (filter?.status && filter.status !== 'all') {
      results = results.filter((p) => p.status === filter.status);
    }

    if (filter?.category && filter.category !== 'toate') {
      results = results.filter((p) => p.category === filter.category);
    }

    if (filter?.popular) {
      results = results.filter((p) => p.is_popular);
    }

    if (filter?.search && filter.search.trim().length > 0) {
      const q = filter.search.toLowerCase().trim();
      results = results.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const descMatch = (p.short_description + ' ' + p.full_description).toLowerCase().includes(q);
        const authorityMatch = (p.competent_authority || '').toLowerCase().includes(q);
        const keywordMatch = (p.keywords || []).some((kw) => kw.toLowerCase().includes(q));
        const documentMatch = (p.documents || []).some((d) =>
          d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
        );
        return titleMatch || descMatch || authorityMatch || keywordMatch || documentMatch;
      });
    }

    return results;
  },

  getProcedureByIdOrSlug(idOrSlug: string): Procedure | null {
    const db = readDb();
    const proc = db.procedures.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    return proc || null;
  },

  createProcedure(input: Partial<Procedure>): Procedure {
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
      last_verified_at: input.last_verified_at || today,
      created_at: now,
      updated_at: now,
      is_popular: Boolean(input.is_popular),
      keywords: input.keywords || [],
      documents: (input.documents || []).map((doc, idx) => ({
        ...doc,
        id: doc.id || `doc-${Date.now()}-${idx}`,
        procedure_id: newId,
        order_index: idx + 1,
      })),
      steps: (input.steps || []).map((step, idx) => ({
        ...step,
        id: step.id || `step-${Date.now()}-${idx}`,
        procedure_id: newId,
        step_number: step.step_number || idx + 1,
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
    return newProcedure;
  },

  updateProcedure(id: string, updates: Partial<Procedure>): Procedure | null {
    const db = readDb();
    const index = db.procedures.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = db.procedures[index];
    const updated: Procedure = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      updated_at: new Date().toISOString(),
    };

    db.procedures[index] = updated;
    writeDb(db);
    return updated;
  },

  deleteProcedure(id: string): boolean {
    const db = readDb();
    const initialLength = db.procedures.length;
    db.procedures = db.procedures.filter((p) => p.id !== id);
    if (db.procedures.length !== initialLength) {
      writeDb(db);
      return true;
    }
    return false;
  },

  verifyProcedure(id: string): Procedure | null {
    const today = new Date().toISOString().slice(0, 10);
    return this.updateProcedure(id, {
      last_verified_at: today,
      status: 'published',
    });
  },

  addDocument(procedureId: string, doc: Omit<DocumentItem, 'id' | 'procedure_id'>): DocumentItem | null {
    const db = readDb();
    const proc = db.procedures.find((p) => p.id === procedureId);
    if (!proc) return null;

    const newDoc: DocumentItem = {
      ...doc,
      id: `doc-${Date.now()}`,
      procedure_id: procedureId,
      order_index: proc.documents.length + 1,
    };

    proc.documents.push(newDoc);
    proc.updated_at = new Date().toISOString();
    writeDb(db);
    return newDoc;
  },

  updateDocument(docId: string, updates: Partial<DocumentItem>): DocumentItem | null {
    const db = readDb();
    for (const proc of db.procedures) {
      const docIndex = proc.documents.findIndex((d) => d.id === docId);
      if (docIndex !== -1) {
        proc.documents[docIndex] = {
          ...proc.documents[docIndex],
          ...updates,
          id: docId,
        };
        proc.updated_at = new Date().toISOString();
        writeDb(db);
        return proc.documents[docIndex];
      }
    }
    return null;
  },

  deleteDocument(docId: string): boolean {
    const db = readDb();
    for (const proc of db.procedures) {
      const idx = proc.documents.findIndex((d) => d.id === docId);
      if (idx !== -1) {
        proc.documents.splice(idx, 1);
        proc.updated_at = new Date().toISOString();
        writeDb(db);
        return true;
      }
    }
    return false;
  },

  addStep(procedureId: string, step: Omit<StepItem, 'id' | 'procedure_id'>): StepItem | null {
    const db = readDb();
    const proc = db.procedures.find((p) => p.id === procedureId);
    if (!proc) return null;

    const newStep: StepItem = {
      ...step,
      id: `step-${Date.now()}`,
      procedure_id: procedureId,
      step_number: proc.steps.length + 1,
    };

    proc.steps.push(newStep);
    proc.updated_at = new Date().toISOString();
    writeDb(db);
    return newStep;
  },

  deleteStep(stepId: string): boolean {
    const db = readDb();
    for (const proc of db.procedures) {
      const idx = proc.steps.findIndex((s) => s.id === stepId);
      if (idx !== -1) {
        proc.steps.splice(idx, 1);
        // renumber remaining steps
        proc.steps.forEach((s, i) => {
          s.step_number = i + 1;
        });
        proc.updated_at = new Date().toISOString();
        writeDb(db);
        return true;
      }
    }
    return false;
  },

  resetSeed(): DatabaseSchema {
    ensureDataDir();
    const newDb: DatabaseSchema = {
      procedures: INITIAL_PROCEDURES,
      version: 1,
      lastUpdated: new Date().toISOString(),
    };
    writeDb(newDb);
    return newDb;
  },

  getStats() {
    const db = readDb();
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString().slice(0, 10);

    const total = db.procedures.length;
    const verifiedRecent = db.procedures.filter((p) => p.last_verified_at >= sixMonthsAgo).length;
    const needsReview = total - verifiedRecent;
    const totalDocuments = db.procedures.reduce((acc, p) => acc + (p.documents?.length || 0), 0);
    const totalSteps = db.procedures.reduce((acc, p) => acc + (p.steps?.length || 0), 0);

    return {
      total,
      verifiedRecent,
      needsReview,
      totalDocuments,
      totalSteps,
      lastUpdated: db.lastUpdated,
    };
  },
};
