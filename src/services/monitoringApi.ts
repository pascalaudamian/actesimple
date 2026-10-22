import type { Procedure } from '../types.ts';
import type { MonitoringChange } from '../server/monitoring.ts';

export const monitoringApi = {
  async getChanges(): Promise<MonitoringChange[]> {
    const response = await fetch('/api/admin/monitoring/changes');
    if (!response.ok) throw new Error('Nu s-au putut încărca alertele de monitorizare.');
    return response.json();
  },
  async runScan(procedures: Procedure[]): Promise<MonitoringChange[]> {
    const response = await fetch('/api/admin/monitoring/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ procedures }) });
    if (!response.ok) throw new Error('Scanarea surselor nu a putut fi pornită.');
    return response.json();
  },
  async review(id: string, decision: 'approve' | 'reject'): Promise<MonitoringChange> {
    const response = await fetch(`/api/admin/monitoring/changes/${id}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision }) });
    if (!response.ok) throw new Error('Revizuirea nu a putut fi înregistrată.');
    return response.json();
  },
};
