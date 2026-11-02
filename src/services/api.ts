import {
  Lead,
  ManagerApproval,
  WorkflowLog,
  DashboardStats,
  LeadEnquiryInput,
  TestSuiteResult,
  ComplianceAuditReport,
  EndToEndDemoResult,
  RegionConfig,
  CustomerNotification
} from '../types/index.ts';

const API_BASE = '/api';

export async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchLeads(params?: { search?: string; tier?: string; status?: string; regionStatus?: string }): Promise<Lead[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.tier && params.tier !== 'ALL') query.append('tier', params.tier);
  if (params?.status && params.status !== 'ALL') query.append('status', params.status);
  if (params?.regionStatus && params.regionStatus !== 'ALL') query.append('regionStatus', params.regionStatus);

  const res = await fetch(`${API_BASE}/leads?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
}

export async function fetchLeadById(id: string): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads/${id}`);
  if (!res.ok) throw new Error('Failed to fetch lead');
  return res.json();
}

export async function submitLeadEnquiry(data: LeadEnquiryInput): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit lead enquiry');
  }
  return res.json();
}

export async function updateLead(id: string, updates: { status?: string; assignedRep?: string; notes?: string; expectedDeliveryDate?: string; deliveryStatus?: string }): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update lead');
  return res.json();
}

export async function updateLeadDelivery(id: string, deliveryDate: string, deliveryStatus?: string): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads/${id}/delivery`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedDeliveryDate: deliveryDate, deliveryStatus }),
  });
  if (!res.ok) throw new Error('Failed to update project delivery specifications');
  return res.json();
}

export async function fetchApprovedProjects(): Promise<Lead[]> {
  const res = await fetch(`${API_BASE}/approved-projects`);
  if (!res.ok) throw new Error('Failed to fetch approved projects');
  return res.json();
}

export async function fetchApprovals(): Promise<ManagerApproval[]> {
  const res = await fetch(`${API_BASE}/approvals`);
  if (!res.ok) throw new Error('Failed to fetch approvals');
  return res.json();
}

export async function actOnApproval(
  id: string,
  action: 'approve' | 'reject' | 'escalate' | 'correction_requested',
  notes?: string,
  reviewerName?: string,
  correctionFeedback?: string
): Promise<{ approval: ManagerApproval; lead: Lead | null }> {
  const res = await fetch(`${API_BASE}/approvals/${id}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, notes, reviewerName, correctionFeedback }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to process approval action');
  }
  return res.json();
}

export async function submitApprovalCorrection(
  id: string,
  data: { correctedBudget?: number; correctedNotes?: string; correctedTimeline?: string }
): Promise<{ approval: ManagerApproval; lead: Lead | null }> {
  const res = await fetch(`${API_BASE}/approvals/${id}/correction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit correction');
  }
  return res.json();
}

export async function fetchRegions(): Promise<RegionConfig> {
  const res = await fetch(`${API_BASE}/regions`);
  if (!res.ok) throw new Error('Failed to fetch service regions');
  return res.json();
}

export async function addSupportedRegion(city: string): Promise<RegionConfig & { message?: string }> {
  const res = await fetch(`${API_BASE}/regions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to configure region');
  }
  return res.json();
}

export async function removeSupportedRegion(city: string): Promise<RegionConfig> {
  const res = await fetch(`${API_BASE}/regions/${encodeURIComponent(city)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove region');
  return res.json();
}

export async function fetchNotifications(leadId?: string): Promise<CustomerNotification[]> {
  const url = leadId ? `${API_BASE}/leads/${leadId}/notifications` : `${API_BASE}/notifications`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch customer notifications');
  return res.json();
}

export async function retryNotification(id: string): Promise<CustomerNotification> {
  const res = await fetch(`${API_BASE}/notifications/${id}/retry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to retry notification');
  }
  return res.json();
}

export async function fetchLogs(params?: { level?: string; leadId?: string }): Promise<WorkflowLog[]> {
  const query = new URLSearchParams();
  if (params?.level && params.level !== 'ALL') query.append('level', params.level);
  if (params?.leadId) query.append('leadId', params.leadId);

  const res = await fetch(`${API_BASE}/logs?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch workflow logs');
  return res.json();
}

export async function runAutomatedTests(): Promise<TestSuiteResult> {
  const res = await fetch(`${API_BASE}/tests/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to execute automated test suite');
  return res.json();
}

export async function fetchComplianceAudit(): Promise<ComplianceAuditReport> {
  const res = await fetch(`${API_BASE}/compliance/audit`);
  if (!res.ok) throw new Error('Failed to fetch compliance audit report');
  return res.json();
}

export async function runEndToEndDemo(): Promise<EndToEndDemoResult> {
  const res = await fetch(`${API_BASE}/demo/run-complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to execute end-to-end demo');
  return res.json();
}

export async function simulateCheckpoint(): Promise<{ message: string; leadId: string; checkpoint: any }> {
  const res = await fetch(`${API_BASE}/workflow/checkpoint-simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to simulate checkpoint');
  return res.json();
}

export async function recoverFromCheckpoint(leadId: string): Promise<{ message: string; checkpoint: any; finalLead: Lead }> {
  const res = await fetch(`${API_BASE}/workflow/recover/${leadId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to recover from checkpoint');
  return res.json();
}

export async function resetDatabase(): Promise<void> {
  const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset database');
}
