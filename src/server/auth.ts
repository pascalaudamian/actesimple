import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AuditLogEntry } from '../types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_logs.json');

// Session store in memory
interface AdminSession {
  token: string;
  user: string;
  expiresAt: number;
}

const activeSessions = new Map<string, AdminSession>();

// Failed login attempts tracker for brute-force protection
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getAdminPassword(): string {
  // Uses environment variable or safe local dev fallback
  return process.env.ADMIN_PASSWORD || 'actesimple2026admin';
}

export function getAdminApiKey(): string {
  return process.env.ADMIN_API_KEY || 'actesimple_secret_key_2026';
}

export function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const log: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  try {
    let logs: AuditLogEntry[] = [];
    if (fs.existsSync(AUDIT_FILE)) {
      const content = fs.readFileSync(AUDIT_FILE, 'utf-8');
      logs = JSON.parse(content);
    }
    logs.unshift(log);
    // Keep last 500 logs
    if (logs.length > 500) {
      logs = logs.slice(0, 500);
    }
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Eroare la scrierea jurnalului de audit:', err);
  }

  return log;
}

export function getAuditLogs(): AuditLogEntry[] {
  try {
    if (fs.existsSync(AUDIT_FILE)) {
      const content = fs.readFileSync(AUDIT_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Eroare la citirea jurnalului de audit:', err);
  }
  return [];
}

export function loginAdmin(password: string, ip: string = 'unknown'): { success: boolean; token?: string; error?: string } {
  const now = Date.now();
  const attempt = failedAttempts.get(ip);

  if (attempt && attempt.lockedUntil > now) {
    const minutesLeft = Math.ceil((attempt.lockedUntil - now) / 60000);
    return {
      success: false,
      error: `Prea multe încercări eșuate. Accesul este blocat temporar pentru încă ${minutesLeft} minute.`,
    };
  }

  const expectedPassword = getAdminPassword();
  if (password !== expectedPassword) {
    const currentCount = (attempt?.count || 0) + 1;
    let lockedUntil = 0;
    if (currentCount >= 5) {
      lockedUntil = now + 15 * 60 * 1000; // 15 minute lock
    }
    failedAttempts.set(ip, { count: currentCount, lockedUntil });
    return {
      success: false,
      error: 'Parolă incorectă. Încercarea a fost înregistrată.',
    };
  }

  // Reset failed attempts on success
  failedAttempts.delete(ip);

  // Generate secure session token (valid 8 hours)
  const token = `adm_${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = now + 8 * 60 * 60 * 1000;

  activeSessions.set(token, {
    token,
    user: 'Administrator ActeSimple',
    expiresAt,
  });

  logAuditEvent({
    action: 'login',
    entity_type: 'auth',
    user: 'Administrator ActeSimple',
    details: 'Autentificare reușită în panoul de administrare.',
  });

  return { success: true, token };
}

export function logoutAdmin(token: string): boolean {
  if (activeSessions.has(token)) {
    activeSessions.delete(token);
    return true;
  }
  return false;
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-admin-key'];

  // Check API Key first if supplied
  if (apiKeyHeader && apiKeyHeader === getAdminApiKey()) {
    (req as any).adminUser = 'System API Key';
    return next();
  }

  // Check Bearer Token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Neautorizat: Accesul la acest endpoint necesită autentificare de administrator.',
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1].trim();
  const session = activeSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      activeSessions.delete(token);
    }
    res.status(401).json({
      error: 'Sesiune expirată sau token invalid. Vă rugăm să vă reautentificați.',
    });
    return;
  }

  (req as any).adminUser = session.user;
  next();
}
