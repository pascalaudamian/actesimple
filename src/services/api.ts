import { Procedure, CategoryMeta, DocumentItem, StepItem, AuditLogEntry } from '../types.ts';
import { INITIAL_PROCEDURES, CATEGORIES } from '../data/seedProcedures.ts';

const CLIENT_STORAGE_KEY = 'actesimple_local_db';
const ADMIN_TOKEN_KEY = 'actesimple_adm_tok';

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

export function getStoredAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch (e) {
    console.warn('Session storage warning:', e);
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Public procedures fetch with search, synonyms, and filters
  async getProcedures(params?: {
    category?: string;
    search?: string;
    status?: string;
    difficulty?: string;
    onlineOnly?: boolean;
    popular?: boolean;
    profile?: string;
    page?: number;
    limit?: number;
  }): Promise<Procedure[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.difficulty) searchParams.set('difficulty', params.difficulty);
      if (params?.onlineOnly) searchParams.set('onlineOnly', 'true');
      if (params?.popular) searchParams.set('popular', 'true');
      if (params?.profile) searchParams.set('profile', params.profile);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());

      const url = `/api/procedures?${searchParams.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend API fallback triggered:', err);
      let list = getFallbackProcedures();
      if (params?.category && params.category !== 'toate') {
        list = list.filter((p) => p.category === params.category);
      }
      if (params?.difficulty && params.difficulty !== 'all') {
        list = list.filter((p) => p.difficulty === params.difficulty);
      }
      if (params?.profile && params.profile !== 'all') {
        list = list.filter((p) => p.target_profiles?.includes(params.profile as any));
      }
      if (params?.onlineOnly) {
        list = list.filter((p) => p.is_online_available === true);
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
          const matchSyn = (p.synonyms || []).some((s) => s.toLowerCase().includes(q));
          return matchTitle || matchDesc || matchDocs || matchKw || matchSyn;
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
    onlineProcedures?: number;
    lastUpdated: string;
  }> {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      const procs = getFallbackProcedures();
      return {
        total: procs.length,
        verifiedRecent: procs.length,
        needsReview: 0,
        totalDocuments: procs.reduce((acc, p) => acc + (p.documents?.length || 0), 0),
        totalSteps: procs.reduce((acc, p) => acc + (p.steps?.length || 0), 0),
        onlineProcedures: procs.filter((p) => p.is_online_available).length,
        lastUpdated: new Date().toISOString(),
      };
    }
  },

  // Admin Authentication
  async adminLogin(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Autentificare eșuată' };
      }
      setStoredAdminToken(data.token);
      return { success: true };
    } catch {
      // Local fallback for dev/preview
      if (password === 'actesimple2026admin') {
        setStoredAdminToken('dev_local_token');
        return { success: true };
      }
      return { success: false, error: 'Eroare de rețea sau server indisponibil' };
    }
  },

  async checkAdminAuth(): Promise<boolean> {
    const token = getStoredAdminToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/admin/me', {
        headers: getAuthHeaders(),
      });
      return res.ok;
    } catch {
      return token === 'dev_local_token';
    }
  },

  async adminLogout(): Promise<void> {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {
      // Ignore
    } finally {
      setStoredAdminToken(null);
    }
  },

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  // Admin CRUD operations (Protected)
  async createProcedure(procedure: Partial<Procedure>): Promise<Procedure> {
    const res = await fetch('/api/admin/procedures', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(procedure),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  async updateProcedure(id: string, updates: Partial<Procedure>): Promise<Procedure> {
    const res = await fetch(`/api/admin/procedures/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  async deleteProcedure(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/procedures/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  },

  // Real Legal Verification with confirmation notes and verifier signature
  async verifyProcedure(
    id: string,
    details: {
      verifier_name: string;
      verification_notes: string;
      verified_at?: string;
      is_confirmed_correct: boolean;
    }
  ): Promise<Procedure> {
    const res = await fetch(`/api/admin/procedures/${id}/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(details),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.procedure;
  },

  async resetSeedData(): Promise<boolean> {
    const res = await fetch('/api/admin/seed-reset', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    localStorage.removeItem(CLIENT_STORAGE_KEY);
    return res.ok;
  },
};
