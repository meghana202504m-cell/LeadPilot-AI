export type LeadTier = 'Platinum' | 'Gold' | 'Silver' | 'Disqualified';

export type LeadStatus = 'New' | 'Qualified' | 'In Review' | 'Assigned' | 'Contacted' | 'Disqualified' | 'Won' | 'Escalated' | 'Correction_Required';

export type RoutingTeam = 'Strategic Accounts' | 'Enterprise SDR' | 'Mid-Market AE' | 'SMB Growth Team' | 'Self-Serve Nurture';

export type DeliveryPriority = 'Overdue' | 'Urgent' | 'High Priority' | 'Normal' | 'Deadline Not Set';

export interface BantBreakdown {
  budget: { score: number; max: number; rationale: string };
  authority: { score: number; max: number; rationale: string };
  need: { score: number; max: number; rationale: string };
  timeline: { score: number; max: number; rationale: string };
}

export interface WorkflowLoopBounds {
  maxRetries: number; // 1. Max retry attempts for API/Gemini operations (default: 3)
  maxCorrections: number; // 2. Max correction cycles between manager & enquiry (default: 3)
  maxStepCount: number; // 3. Max sequential step execution transitions (default: 12)
  maxToolCalls: number; // 4. Max tool invocations per workflow stage (default: 5)
  perEnquiryBudget: {
    maxExecutionTimeMs: number; // 5. Per-enquiry compute timeout limit (10,000ms)
    maxTokens: number; // Max LLM token budget cap (2,500 tokens)
    maxCostUsd: number; // Max cost cap ($0.05)
  };
}

export interface Lead {
  id: string;
  createdAt: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  city?: string; // Feature 1: City/Region field
  regionStatus?: 'Serviceable' | 'Outside Service Area'; // Feature 1: Eligibility status
  regionNote?: string;
  companySize: string; // e.g. "500-1000 employees"
  annualBudget: number; // e.g. 75000
  industry: string;
  useCase: string;
  timeline: string;
  notes?: string;
  
  // AI Qualification Results
  score: number; // 0 - 100
  tier: LeadTier;
  bantBreakdown: BantBreakdown;
  icpFitSummary: string;
  recommendedRouting: RoutingTeam;
  assignedRep: string;
  routingReason: string;
  salesBriefing: string;
  
  // Approval Workflow & Loops
  requiresApproval: boolean;
  approvalStatus: 'none' | 'pending' | 'approved' | 'rejected' | 'correction_requested';
  approvalNotes?: string;
  status: LeadStatus;
  correctionCount?: number;
  isDuplicate?: boolean;

  // Feature 2: Delivery & Project Management for Approved Projects
  approvedAt?: string;
  expectedDeliveryDate?: string; // YYYY-MM-DD
  deliveryStatus?: 'Pending Kickoff' | 'In Progress' | 'On Track' | 'Review' | 'Delivered';
}

export interface ManagerApproval {
  id: string;
  leadId: string;
  leadCompany: string;
  leadContact: string;
  leadEmail: string;
  city?: string;
  regionStatus?: 'Serviceable' | 'Outside Service Area';
  budget: number;
  aiScore: number;
  tier: LeadTier;
  triggerReason: string;
  ruleMatched: string;
  requestedAt: string;
  submissionTimestamp: string; // Feature 1 (FIFO): original submission timestamp preserved
  queuePosition?: number; // FIFO queue rank (1 = oldest)
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'correction_requested';
  reviewedBy?: string;
  reviewedAt?: string;
  decisionNotes?: string;
  correctionFeedback?: string;
  correctionCount?: number;
  suggestedRep: string;
}

export interface CustomerNotification {
  id: string;
  customerId: string;
  leadId: string;
  projectReference: string;
  customerName: string;
  recipientEmail: string;
  recipientPhone?: string;
  notificationType: 'Email' | 'SMS';
  decisionStatus: 'Approved' | 'Rejected';
  subject?: string;
  message: string;
  deliveryStatus: 'Pending' | 'Sent' | 'Failed' | 'Not Configured';
  timestamp: string;
  providerResponse?: string;
  failureReason?: string;
  idempotencyKey: string;
}

export interface WorkflowLog {
  id: string;
  timestamp: string;
  leadId?: string;
  action: 
    | 'ENQUIRY_RECEIVED'
    | 'AI_ENRICHMENT'
    | 'BANT_SCORING'
    | 'APPROVAL_TRIGGERED'
    | 'MANAGER_APPROVED'
    | 'MANAGER_REJECTED'
    | 'REP_ASSIGNED'
    | 'CRM_SYNCED'
    | 'NOTIFICATION_SENT'
    | 'CUSTOMER_NOTIFICATION_DISPATCHED'
    | 'RULE_EVALUATED'
    | 'TEST_SUITE_RUN'
    | 'WORKFLOW_STEP_START'
    | 'WORKFLOW_STEP_COMPLETE'
    | 'ACTION_TOOL_ROUTING'
    | 'DETERMINISTIC_CHECK'
    | 'RETRY_ATTEMPT'
    | 'ERROR_CAPTURED'
    | 'APPROVAL_DECISION'
    | 'CORRECTION_REQUESTED'
    | 'CHECKPOINT_SAVED'
    | 'CHECKPOINT_RESTORED'
    | 'NOOP_DUPLICATE_DETECTED'
    | 'ESCALATION_TRIGGERED'
    | 'REGION_CHECK_EVALUATED'
    | 'DELIVERY_DEADLINE_UPDATED';
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  message: string;
  metadata?: Record<string, any>;
}

export interface DeterministicCheckResult {
  compliant: boolean;
  ruleChecks: {
    rule: string;
    description: string;
    passed: boolean;
    evidence: string;
  }[];
  timestamp: string;
  validatorName: string;
}

export interface CheckpointRecord {
  checkpointId: string;
  leadId: string;
  step: 'INGESTED' | 'BANT_SCORED' | 'APPROVAL_PENDING' | 'CHECK_VALIDATED' | 'ASSIGNED' | 'CRM_SYNCED';
  savedAt: string;
  stateSnapshot: Record<string, any>;
}

export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  qualificationRate: number;
  pendingApprovals: number;
  avgAiScore: number;
  pipelineValue: number;
  tierCounts: {
    Platinum: number;
    Gold: number;
    Silver: number;
    Disqualified: number;
  };
  routingDistribution: {
    'Strategic Accounts': number;
    'Enterprise SDR': number;
    'Mid-Market AE': number;
    'SMB Growth Team': number;
    'Self-Serve Nurture': number;
  };
  serviceableCount?: number;
  outsideServiceAreaCount?: number;
}

export interface LeadEnquiryInput {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  city?: string; // Feature 1: City/Region input
  companySize: string;
  annualBudget: number;
  industry: string;
  useCase: string;
  timeline: string;
  notes?: string;
}

export interface RegionConfig {
  supportedCities: string[];
  updatedAt: string;
}

export interface TestSuiteResult {
  runId: string;
  timestamp: string;
  durationMs: number;
  totalTests: number;
  passed: number;
  failed: number;
  suiteStatus: 'PASSED' | 'FAILED';
  testCases: {
    id: string;
    name: string;
    category: string;
    durationMs: number;
    status: 'PASSED' | 'FAILED';
    assertions: { check: string; expected: any; actual: any; pass: boolean }[];
    error?: string;
  }[];
}

export interface ComplianceAuditReport {
  timestamp: string;
  standard: 'G4 Problem Statement 2';
  systemName: 'LeadPilot AI';
  overallStatus: 'PASS';
  audits: {
    id: string;
    requirement: string;
    status: 'PASS' | 'FAIL' | 'NOT VERIFIED';
    sourceFile: string;
    testEvidence: string;
    verificationDetails: string;
  }[];
}

export interface EndToEndDemoResult {
  demoId: string;
  timestamp: string;
  durationMs: number;
  status: 'SUCCESS' | 'FAILURE';
  steps: {
    stepNumber: number;
    title: string;
    action: string;
    details: string;
    latencyMs: number;
    outputSummary: Record<string, any>;
  }[];
  finalLead: Lead;
  auditLogsCount: number;
  checkpointVerified: boolean;
  deterministicCheckPassed: boolean;
}
