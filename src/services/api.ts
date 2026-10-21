import { Procedure, CategoryMeta, DocumentItem, StepItem } from '../types.ts';
import { INITIAL_PROCEDURES, CATEGORIES } from '../data/seedProcedures.ts';

// Local storage key for offline client fallback
const CLIENT_STORAGE_KEY = 'actesimple_local_db';

function getFallbackProcedures(): Procedure[] {
  try {
    const stored = localStorage.getItem(CLIENT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('LocalStorage access warning:', e);
  }
  return INITIAL_PROCEDURES;
}

function saveFallbackProcedures(procs: Procedure[]): void {
  try {
    localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(procs));
  } catch (e) {
    console.warn('LocalStorage save warning:', e);
  }
}

export const api = {
  async getProcedures(params?: {
    category?: string;
    search?: string;
    status?: string;
    popular?: boolean;
  }): Promise<Procedure[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.popular) searchParams.set('popular', 'true');

      const url = `/api/procedures?${searchParams.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Backend API unavailable, using in-browser store fallback:', err);
      let list = getFallbackProcedures();
      if (params?.category && params.category !== 'toate') {
        list = list.filter((p) => p.category === params.category);
      }
      if (params?.popular) {
        list = list.filter((p) => p.is_popular);
      }
      if (params?.search && params.search.trim().length > 0) {
        const q = params.search.toLowerCase().trim();
        list = list.filter((p) => {
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = (p.short_description + ' ' + p.full_description).toLowerCase().includes(q);
          const matchDocs = (p.documents || []).some(
            (d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
          );
          const matchKw = (p.keywords || []).some((kw) => kw.toLowerCase().includes(q));
          return matchTitle || matchDesc || matchDocs || matchKw;
        });
      }
      return list;
    }
  },

  async getProcedure(idOrSlug: string): Promise<Procedure | null> {
    try {
      const res = await fetch(`/api/procedures/${idOrSlug}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn('Fallback getProcedure:', err);
      const list = getFallbackProcedures();
      return list.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
    }
  },

  async getCategories(): Promise<CategoryMeta[]> {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return CATEGORIES;
    }
  },

  async getStats(): Promise<{
    total: number;
    verifiedRecent: number;
    needsReview: number;
    totalDocuments: number;
    totalSteps: number;
    lastUpdated: string;
  }> {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      const procs = getFallbackProcedures();
      const totalDocs = procs.reduce((acc, p) => acc + (p.documents?.length || 0), 0);
      return {
        total: procs.length,
        verifiedRecent: procs.length,
        needsReview: 0,
        totalDocuments: totalDocs,
        totalSteps: procs.reduce((acc, p) => acc + (p.steps?.length || 0), 0),
        lastUpdated: new Date().toISOString(),
      };
    }
  },

  async createProcedure(procedure: Partial<Procedure>): Promise<Procedure> {
    try {
      const res = await fetch('/api/procedures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(procedure),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      const procs = getFallbackProcedures();
      const newProc: Procedure = {
        ...procedure,
        id: `proc-${Date.now()}`,
        slug: (procedure.slug || procedure.title || 'procedura')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-'),
        title: procedure.title || 'Procedură nouă',
        short_description: procedure.short_description || '',
        full_description: procedure.full_description || '',
        category: procedure.category || 'identitate',
        status: procedure.status || 'published',
        estimated_time: procedure.estimated_time || '3 - 7 zile',
        difficulty: procedure.difficulty || 'usor',
        total_fee: procedure.total_fee || 'Gratuit',
        competent_authority: procedure.competent_authority || 'Instituție',
        last_verified_at: new Date().toISOString().slice(0, 10),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_popular: Boolean(procedure.is_popular),
        keywords: procedure.keywords || [],
        documents: procedure.documents || [],
        steps: procedure.steps || [],
        sources: procedure.sources || [],
      };
      procs.unshift(newProc);
      saveFallbackProcedures(procs);
      return newProc;
    }
  },

  async updateProcedure(id: string, updates: Partial<Procedure>): Promise<Procedure | null> {
    try {
      const res = await fetch(`/api/procedures/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      const procs = getFallbackProcedures();
      const idx = procs.findIndex((p) => p.id === id);
      if (idx !== -1) {
        procs[idx] = { ...procs[idx], ...updates, updated_at: new Date().toISOString() };
        saveFallbackProcedures(procs);
        return procs[idx];
      }
      return null;
    }
  },

  async deleteProcedure(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/procedures/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      const procs = getFallbackProcedures().filter((p) => p.id !== id);
      saveFallbackProcedures(procs);
      return true;
    }
  },

  async verifyProcedure(id: string): Promise<Procedure | null> {
    try {
      const res = await fetch(`/api/procedures/${id}/verify`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.procedure;
    } catch {
      return this.updateProcedure(id, {
        last_verified_at: new Date().toISOString().slice(0, 10),
      });
    }
  },

  async addDocument(procedureId: string, doc: Partial<DocumentItem>): Promise<DocumentItem | null> {
    try {
      const res = await fetch(`/api/procedures/${procedureId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      const procs = getFallbackProcedures();
      const proc = procs.find((p) => p.id === procedureId);
      if (proc) {
        const newDoc: DocumentItem = {
          id: `doc-${Date.now()}`,
          procedure_id: procedureId,
          name: doc.name || 'Document nou',
          type: doc.type || 'original',
          is_mandatory: doc.is_mandatory ?? true,
          description: doc.description || '',
          order_index: proc.documents.length + 1,
        };
        proc.documents.push(newDoc);
        saveFallbackProcedures(procs);
        return newDoc;
      }
      return null;
    }
  },

  async deleteDocument(docId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      const procs = getFallbackProcedures();
      procs.forEach((p) => {
        p.documents = p.documents.filter((d) => d.id !== docId);
      });
      saveFallbackProcedures(procs);
      return true;
    }
  },

  async addStep(procedureId: string, step: Partial<StepItem>): Promise<StepItem | null> {
    try {
      const res = await fetch(`/api/procedures/${procedureId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(step),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      const procs = getFallbackProcedures();
      const proc = procs.find((p) => p.id === procedureId);
      if (proc) {
        const newStep: StepItem = {
          id: `step-${Date.now()}`,
          procedure_id: procedureId,
          step_number: proc.steps.length + 1,
          title: step.title || 'Pas nou',
          description: step.description || '',
        };
        proc.steps.push(newStep);
        saveFallbackProcedures(procs);
        return newStep;
      }
      return null;
    }
  },

  async deleteStep(stepId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/steps/${stepId}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      const procs = getFallbackProcedures();
      procs.forEach((p) => {
        p.steps = p.steps.filter((s) => s.id !== stepId);
      });
      saveFallbackProcedures(procs);
      return true;
    }
  },

  async resetSeedData(): Promise<boolean> {
    try {
      const res = await fetch('/api/reset-seed', { method: 'POST' });
      localStorage.removeItem(CLIENT_STORAGE_KEY);
      return res.ok;
    } catch {
      saveFallbackProcedures(INITIAL_PROCEDURES);
      return true;
    }
  },
};
