import express, { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { dbService } from './src/server/db.ts';
import { CATEGORIES } from './src/data/seedProcedures.ts';
import {
  requireAdminAuth,
  loginAdmin,
  logoutAdmin,
  getAuditLogs,
} from './src/server/auth.ts';
import {
  procedureCreateSchema,
  procedureUpdateSchema,
  verifyProcedureSchema,
  documentItemSchema,
  stepItemSchema,
  adminLoginSchema,
} from './src/server/validation.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();

  // Limit body size for security
  app.use(express.json({ limit: '1mb' }));

  // Security Headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // --- PUBLIC REST API ENDPOINTS ---

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'ActeSimple API', timestamp: new Date().toISOString() });
  });

  // Aggregated Public Statistics
  app.get('/api/stats', (_req: Request, res: Response) => {
    try {
      const stats = dbService.getStats();
      res.json(stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      res.status(500).json({ error: 'Eroare la obținerea statisticilor.' });
    }
  });

  // Categories list with procedure count
  app.get('/api/categories', (_req: Request, res: Response) => {
    try {
      const { procedures } = dbService.getAllProcedures();
      const categoriesWithCount = CATEGORIES.map((cat) => {
        const count =
          cat.id === 'toate'
            ? procedures.length
            : procedures.filter((p) => p.category === cat.id).length;
        return {
          ...cat,
          count,
        };
      });
      res.json(categoriesWithCount);
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ error: 'Eroare la obținerea categoriilor.' });
    }
  });

  // List procedures with search, synonyms, filters and pagination
  app.get('/api/procedures', (req: Request, res: Response) => {
    try {
      const {
        category,
        search,
        status,
        difficulty,
        onlineOnly,
        popular,
        profile,
        page,
        limit,
      } = req.query;

      const result = dbService.getAllProcedures({
        category: category as string,
        search: search as string,
        status: status as string,
        difficulty: difficulty as string,
        onlineOnly: onlineOnly === 'true',
        popular: popular === 'true',
        profile: profile as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      // Include pagination headers & return list
      res.setHeader('X-Total-Count', result.total.toString());
      res.setHeader('X-Total-Pages', result.totalPages.toString());
      res.json(result.procedures);
    } catch (err) {
      console.error('Error fetching procedures:', err);
      res.status(500).json({ error: 'Eroare la obținerea procedurilor.' });
    }
  });

  // Get single procedure by ID or Slug
  app.get('/api/procedures/:idOrSlug', (req: Request, res: Response) => {
    try {
      const { idOrSlug } = req.params;
      const procedure = dbService.getProcedureByIdOrSlug(idOrSlug);
      if (!procedure) {
        return res.status(404).json({ error: 'Procedura solicitată nu a fost găsită.' });
      }
      res.json(procedure);
    } catch (err) {
      console.error('Error fetching procedure:', err);
      res.status(500).json({ error: 'Eroare la obținerea detaliilor procedurii.' });
    }
  });

  // --- ADMIN AUTHENTICATION ENDPOINTS ---

  // Admin login
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const parse = adminLoginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Parola este obligatorie.' });
    }

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const result = loginAdmin(parse.data.password, clientIp);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    res.json({ success: true, token: result.token, message: 'Autentificare reușită.' });
  });

  // Admin logout
  app.post('/api/admin/logout', requireAdminAuth, (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1].trim();
      logoutAdmin(token);
    }
    res.json({ success: true, message: 'Sesiune încheiată.' });
  });

  // Verify active admin session
  app.get('/api/admin/me', requireAdminAuth, (req: Request, res: Response) => {
    res.json({
      authenticated: true,
      user: (req as any).adminUser || 'Administrator',
    });
  });

  // View audit logs
  app.get('/api/admin/audit-logs', requireAdminAuth, (_req: Request, res: Response) => {
    try {
      const logs = getAuditLogs();
      res.json(logs);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      res.status(500).json({ error: 'Eroare la citirea jurnalului de audit.' });
    }
  });

  // --- PROTECTED ADMIN CRUD & VERIFICATION ENDPOINTS ---

  // Create new procedure (Protected with Zod validation)
  app.post('/api/admin/procedures', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const parse = procedureCreateSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          error: 'Date invalide pentru procedură',
          details: parse.error.format(),
        });
      }

      const adminUser = (req as any).adminUser || 'Admin';
      const newProc = dbService.createProcedure(parse.data, adminUser);
      res.status(201).json(newProc);
    } catch (err) {
      console.error('Error creating procedure:', err);
      res.status(500).json({ error: 'Nu s-a putut salva procedura în baza de date.' });
    }
  });

  // Update procedure (Protected with Zod validation)
  const handleUpdateProcedure = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parse = procedureUpdateSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          error: 'Date invalide pentru actualizare',
          details: parse.error.format(),
        });
      }

      const adminUser = (req as any).adminUser || 'Admin';
      const updated = dbService.updateProcedure(id, parse.data, adminUser);
      if (!updated) {
        return res.status(404).json({ error: 'Procedura nu a fost găsită.' });
      }
      res.json(updated);
    } catch (err) {
      console.error('Error updating procedure:', err);
      res.status(500).json({ error: 'Nu s-a putut actualiza procedura.' });
    }
  };

  app.put('/api/admin/procedures/:id', requireAdminAuth, handleUpdateProcedure);
  app.patch('/api/admin/procedures/:id', requireAdminAuth, handleUpdateProcedure);

  // Delete procedure (Protected)
  app.delete('/api/admin/procedures/:id', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const adminUser = (req as any).adminUser || 'Admin';
      const ok = dbService.deleteProcedure(id, adminUser);
      if (!ok) {
        return res.status(404).json({ error: 'Procedura nu a fost găsită.' });
      }
      res.json({ success: true, message: 'Procedura a fost ștearsă din baza de date.' });
    } catch (err) {
      console.error('Error deleting procedure:', err);
      res.status(500).json({ error: 'Nu s-a putut șterge procedura.' });
    }
  });

  // Register real legal verification of Procedure with verifier identity and notes
  app.post('/api/admin/procedures/:id/verify', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parse = verifyProcedureSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          error: 'Date de verificare incomplete sau invalide',
          details: parse.error.format(),
        });
      }

      const adminUser = (req as any).adminUser || parse.data.verifier_name;
      const updated = dbService.verifyProcedureWithDetails(id, parse.data, adminUser);
      if (!updated) {
        return res.status(404).json({ error: 'Procedura nu a fost găsită.' });
      }

      res.json({
        success: true,
        procedure: updated,
        message: `Verificarea oficială a fost atestată de ${parse.data.verifier_name} la data ${updated.last_verified_at}.`,
      });
    } catch (err) {
      console.error('Error verifying procedure:', err);
      res.status(500).json({ error: 'Verificarea nu a putut fi înregistrată.' });
    }
  });

  // Add document to procedure (Protected with Zod)
  app.post('/api/admin/procedures/:id/documents', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parse = documentItemSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          error: 'Date invalide pentru document',
          details: parse.error.format(),
        });
      }

      const adminUser = (req as any).adminUser || 'Admin';
      const doc = dbService.addDocument(id, parse.data, adminUser);
      if (!doc) {
        return res.status(404).json({ error: 'Procedura nu a fost găsită.' });
      }
      res.status(201).json(doc);
    } catch (err) {
      console.error('Error adding document:', err);
      res.status(500).json({ error: 'Eroare la adăugarea documentului.' });
    }
  });

  // Delete document (Protected)
  app.delete('/api/admin/documents/:id', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const adminUser = (req as any).adminUser || 'Admin';
      const ok = dbService.deleteDocument(id, adminUser);
      if (!ok) {
        return res.status(404).json({ error: 'Documentul nu a fost găsit.' });
      }
      res.json({ success: true, message: 'Document șters.' });
    } catch (err) {
      console.error('Error deleting document:', err);
      res.status(500).json({ error: 'Eroare la ștergerea documentului.' });
    }
  });

  // Add step to procedure (Protected with Zod)
  app.post('/api/admin/procedures/:id/steps', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parse = stepItemSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          error: 'Date invalide pentru pas',
          details: parse.error.format(),
        });
      }

      const adminUser = (req as any).adminUser || 'Admin';
      const step = dbService.addStep(id, parse.data, adminUser);
      if (!step) {
        return res.status(404).json({ error: 'Procedura nu a fost găsită.' });
      }
      res.status(201).json(step);
    } catch (err) {
      console.error('Error adding step:', err);
      res.status(500).json({ error: 'Eroare la adăugarea pasului.' });
    }
  });

  // Delete step (Protected)
  app.delete('/api/admin/steps/:id', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const adminUser = (req as any).adminUser || 'Admin';
      const ok = dbService.deleteStep(id, adminUser);
      if (!ok) {
        return res.status(404).json({ error: 'Pasul nu a fost găsit.' });
      }
      res.json({ success: true, message: 'Pas șters.' });
    } catch (err) {
      console.error('Error deleting step:', err);
      res.status(500).json({ error: 'Eroare la ștergerea pasului.' });
    }
  });

  // Seed reset (Protected)
  app.post('/api/admin/seed-reset', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const adminUser = (req as any).adminUser || 'Admin';
      const result = dbService.resetSeed(adminUser);
      res.json({
        success: true,
        count: result.procedures.length,
        message: 'Baza de date a fost resetată la procedurile demonstrative oficiale.',
      });
    } catch (err) {
      console.error('Error resetting db:', err);
      res.status(500).json({ error: 'Nu s-a putut reseta baza de date.' });
    }
  });

  // Legacy route redirection / protection for backwards compatibility
  app.post('/api/procedures', requireAdminAuth, (req, res) => res.redirect(307, '/api/admin/procedures'));
  app.put('/api/procedures/:id', requireAdminAuth, (req, res) => res.redirect(307, `/api/admin/procedures/${req.params.id}`));
  app.delete('/api/procedures/:id', requireAdminAuth, (req, res) => res.redirect(307, `/api/admin/procedures/${req.params.id}`));
  app.post('/api/procedures/:id/verify', requireAdminAuth, (req, res) => res.redirect(307, `/api/admin/procedures/${req.params.id}/verify`));
  app.post('/api/reset-seed', requireAdminAuth, (req, res) => res.redirect(307, '/api/admin/seed-reset'));

  // --- FRONTEND INTEGRATION (SPA on Vite / Dist) ---
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ActeSimple server running securely at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ActeSimple server:', err);
  process.exit(1);
});
