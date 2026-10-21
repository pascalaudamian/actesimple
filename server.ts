import express, { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { dbService } from './src/server/db.ts';
import { CATEGORIES } from './src/data/seedProcedures.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API Endpoints ---

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'ActeSimple API', timestamp: new Date().toISOString() });
  });

  // Get statistics
  app.get('/api/stats', (_req: Request, res: Response) => {
    try {
      const stats = dbService.getStats();
      res.json(stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      res.status(500).json({ error: 'Failed to retrieve stats' });
    }
  });

  // Get categories with counts
  app.get('/api/categories', (_req: Request, res: Response) => {
    try {
      const procedures = dbService.getAllProcedures();
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
      res.status(500).json({ error: 'Failed to retrieve categories' });
    }
  });

  // List procedures with search and filter
  app.get('/api/procedures', (req: Request, res: Response) => {
    try {
      const { category, search, status, popular } = req.query;
      const procedures = dbService.getAllProcedures({
        category: category as string,
        search: search as string,
        status: status as string,
        popular: popular === 'true',
      });
      res.json(procedures);
    } catch (err) {
      console.error('Error fetching procedures:', err);
      res.status(500).json({ error: 'Failed to fetch procedures' });
    }
  });

  // Get single procedure by ID or Slug
  app.get('/api/procedures/:idOrSlug', (req: Request, res: Response) => {
    try {
      const { idOrSlug } = req.params;
      const procedure = dbService.getProcedureByIdOrSlug(idOrSlug);
      if (!procedure) {
        return res.status(404).json({ error: 'Procedura nu a fost găsită' });
      }
      res.json(procedure);
    } catch (err) {
      console.error('Error fetching procedure:', err);
      res.status(500).json({ error: 'Failed to fetch procedure' });
    }
  });

  // Create new procedure
  app.post('/api/procedures', (req: Request, res: Response) => {
    try {
      const newProc = dbService.createProcedure(req.body);
      res.status(201).json(newProc);
    } catch (err) {
      console.error('Error creating procedure:', err);
      res.status(400).json({ error: 'Nu s-a putut salva procedura' });
    }
  });

  // Update procedure
  app.put('/api/procedures/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = dbService.updateProcedure(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Procedura nu a fost găsită' });
      }
      res.json(updated);
    } catch (err) {
      console.error('Error updating procedure:', err);
      res.status(400).json({ error: 'Nu s-a putut actualiza procedura' });
    }
  });

  // Delete procedure
  app.delete('/api/procedures/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const ok = dbService.deleteProcedure(id);
      if (!ok) {
        return res.status(404).json({ error: 'Procedura nu a fost găsită' });
      }
      res.json({ success: true, message: 'Procedură ștearsă cu succes' });
    } catch (err) {
      console.error('Error deleting procedure:', err);
      res.status(500).json({ error: 'Nu s-a putut șterge procedura' });
    }
  });

  // 1-Click Verification of Procedure (sets last_verified_at to today)
  app.post('/api/procedures/:id/verify', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = dbService.verifyProcedure(id);
      if (!updated) {
        return res.status(404).json({ error: 'Procedura nu a fost găsită' });
      }
      res.json({
        success: true,
        procedure: updated,
        message: 'Procedura a fost marcată ca verificată astăzi.',
      });
    } catch (err) {
      console.error('Error verifying procedure:', err);
      res.status(500).json({ error: 'Verificarea nu a putut fi înregistrată' });
    }
  });

  // Add document to procedure
  app.post('/api/procedures/:id/documents', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const doc = dbService.addDocument(id, req.body);
      if (!doc) {
        return res.status(404).json({ error: 'Procedura nu a fost găsită' });
      }
      res.status(201).json(doc);
    } catch (err) {
      console.error('Error adding document:', err);
      res.status(400).json({ error: 'Eroare la adăugarea documentului' });
    }
  });

  // Update document
  app.put('/api/documents/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const doc = dbService.updateDocument(id, req.body);
      if (!doc) {
        return res.status(404).json({ error: 'Documentul nu a fost găsit' });
      }
      res.json(doc);
    } catch (err) {
      console.error('Error updating document:', err);
      res.status(400).json({ error: 'Eroare la actualizarea documentului' });
    }
  });

  // Delete document
  app.delete('/api/documents/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const ok = dbService.deleteDocument(id);
      if (!ok) {
        return res.status(404).json({ error: 'Documentul nu a fost găsit' });
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Error deleting document:', err);
      res.status(500).json({ error: 'Eroare la ștergerea documentului' });
    }
  });

  // Add step to procedure
  app.post('/api/procedures/:id/steps', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const step = dbService.addStep(id, req.body);
      if (!step) {
        return res.status(404).json({ error: 'Procedura nu a fost găsită' });
      }
      res.status(201).json(step);
    } catch (err) {
      console.error('Error adding step:', err);
      res.status(400).json({ error: 'Eroare la adăugarea pasului' });
    }
  });

  // Delete step
  app.delete('/api/steps/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const ok = dbService.deleteStep(id);
      if (!ok) {
        return res.status(404).json({ error: 'Pasul nu a fost găsit' });
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Error deleting step:', err);
      res.status(500).json({ error: 'Eroare la ștergerea pasului' });
    }
  });

  // Reset database with clean seed
  app.post('/api/reset-seed', (_req: Request, res: Response) => {
    try {
      const result = dbService.resetSeed();
      res.json({ success: true, count: result.procedures.length, message: 'Baza de date a fost resetată la starea inițială.' });
    } catch (err) {
      console.error('Error resetting db:', err);
      res.status(500).json({ error: 'Nu s-a putut reseta baza de date' });
    }
  });

  // --- Frontend Integration ---
  if (!isProduction) {
    // In development mode, mount Vite as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production mode, serve built static assets from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ActeSimple server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ActeSimple server:', err);
  process.exit(1);
});
