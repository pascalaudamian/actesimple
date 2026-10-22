import crypto from 'node:crypto';
import type { Procedure, SourceType } from '../types.ts';

export type ChangeKind = 'link' | 'text' | 'tax' | 'term' | 'legal_norm';
export type ChangeRisk = 'low' | 'high';
export type MonitorStatus = 'detected' | 'in_review' | 'approved' | 'rejected';

export interface OfficialSourceTarget {
  id: string;
  institution: 'IGI' | 'MAE' | 'ANAF' | 'ROePAS';
  url: string;
  sourceType: SourceType;
  priority: number;
  cadenceHours: number;
  permittedCheck: boolean;
}

export interface MonitoringChange {
  id: string;
  procedureId: string;
  procedureTitle: string;
  sourceId: string;
  sourceUrl: string;
  institution: string;
  detectedAt: string;
  kind: ChangeKind;
  risk: ChangeRisk;
  status: MonitorStatus;
  summary: string;
  previousValue: string;
  proposedValue: string;
  requiresEditorialApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export const OFFICIAL_MONITOR_TARGETS: OfficialSourceTarget[] = [
  { id: 'igi', institution: 'IGI', url: 'https://igi.mai.gov.ro', sourceType: 'official_page', priority: 1, cadenceHours: 24, permittedCheck: true },
  { id: 'mae', institution: 'MAE', url: 'https://evisa.mae.ro', sourceType: 'official_page', priority: 2, cadenceHours: 24, permittedCheck: true },
  { id: 'anaf', institution: 'ANAF', url: 'https://www.anaf.ro', sourceType: 'official_page', priority: 3, cadenceHours: 24, permittedCheck: true },
  { id: 'roepas', institution: 'ROePAS', url: 'https://www.roe-pas.ro', sourceType: 'official_page', priority: 4, cadenceHours: 24, permittedCheck: true },
];

const changes = new Map<string, MonitoringChange>();

function classifyChange(procedure: Procedure, sourceUrl: string, sourceId: string): MonitoringChange {
  const fingerprint = crypto.createHash('sha256').update(`${procedure.id}:${sourceUrl}`).digest('hex').slice(0, 12);
  const isFinancial = /tax|fee|cost|tarif|plata|pret/i.test(`${procedure.title} ${procedure.total_fee}`);
  const kind: ChangeKind = isFinancial ? 'tax' : procedure.steps.length > 2 ? 'term' : 'text';
  const risk: ChangeRisk = kind === 'text' ? 'low' : 'high';
  return {
    id: `change-${fingerprint}`,
    procedureId: procedure.id,
    procedureTitle: procedure.title,
    sourceId,
    sourceUrl,
    institution: OFFICIAL_MONITOR_TARGETS.find((target) => target.id === sourceId)?.institution ?? 'Sursă oficială',
    detectedAt: new Date().toISOString(),
    kind,
    risk,
    status: 'detected',
    summary: kind === 'tax' ? 'Posibilă modificare a taxei sau a costurilor.' : kind === 'term' ? 'Posibilă modificare a termenului ori a pașilor procedurii.' : 'Conținutul sursei oficiale diferă față de ultima versiune.',
    previousValue: procedure.total_fee,
    proposedValue: 'Necesită extragere și confirmare editorială',
    requiresEditorialApproval: risk === 'high',
  };
}

export function monitorProcedures(procedures: Procedure[]): MonitoringChange[] {
  const detected = procedures.slice(0, Math.min(4, procedures.length)).map((procedure, index) => {
    const target = OFFICIAL_MONITOR_TARGETS[index % OFFICIAL_MONITOR_TARGETS.length];
    const change = classifyChange(procedure, target.url, target.id);
    changes.set(change.id, change);
    return change;
  });
  return detected;
}

export function listMonitoringChanges(): MonitoringChange[] {
  return [...changes.values()].sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
}

export function reviewMonitoringChange(id: string, decision: 'approve' | 'reject', reviewer: string): MonitoringChange | null {
  const change = changes.get(id);
  if (!change) return null;
  change.status = decision === 'approve' ? 'approved' : 'rejected';
  change.approvedBy = reviewer;
  change.approvedAt = new Date().toISOString();
  changes.set(id, change);
  return change;
}
