import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Edit3,
  Mail,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { ManagerApproval, Lead } from '../../types/index.ts';
import { actOnApproval, submitApprovalCorrection } from '../../services/api.ts';

interface ManagerApprovalsViewProps {
  approvals: ManagerApproval[];
  onApprovalProcessed: (updatedApproval: ManagerApproval, updatedLead: Lead | null) => void;
  onInspectLead: (leadId: string) => void;
}

export const ManagerApprovalsView: React.FC<ManagerApprovalsViewProps> = ({
  approvals,
  onApprovalProcessed,
  onInspectLead,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'corrections' | 'history'>('pending');
  const [selectedApproval, setSelectedApproval] = useState<ManagerApproval | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'escalate' | 'correction_requested'>('approve');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [correctionFeedback, setCorrectionFeedback] = useState('');
  const [reviewerName, setReviewerName] = useState('Sarah Connor (VP Sales)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Correction submission state
  const [correctionModalItem, setCorrectionModalItem] = useState<ManagerApproval | null>(null);
  const [correctedBudget, setCorrectedBudget] = useState<number>(0);
  const [correctedNotes, setCorrectedNotes] = useState('');

  const pendingList = approvals.filter((a) => a.status === 'pending');
  const correctionList = approvals.filter((a) => a.status === 'correction_requested');
  const historyList = approvals.filter(
    (a) => a.status === 'approved' || a.status === 'rejected' || a.status === 'escalated'
  );

  const openActionModal = (
    approval: ManagerApproval,
    action: 'approve' | 'reject' | 'escalate' | 'correction_requested'
  ) => {
    setSelectedApproval(approval);
    setActionType(action);
    setRejectionError(null);

    if (action === 'approve') {
      setDecisionNotes('Requirements verified and the project meets all eligibility criteria.');
    } else if (action === 'reject') {
      setDecisionNotes(''); // Leave empty so manager is required to enter specific reason
    } else if (action === 'escalate') {
      setDecisionNotes('Escalated to Chief Revenue Officer for custom pricing review.');
    } else {
      setDecisionNotes('Requesting enquiry details revision prior to account executive pairing.');
      setCorrectionFeedback('Please verify corporate budget allocation and technical requirements with the economic buyer.');
    }
  };

  const handleQuickRejectionReason = (reason: string) => {
    setDecisionNotes(reason);
    setRejectionError(null);
  };

  const submitAction = async () => {
    if (!selectedApproval) return;

    // Requirement: Rejection requires a mandatory non-empty reason
    if (actionType === 'reject') {
      if (!decisionNotes || !decisionNotes.trim()) {
        setRejectionError('Rejection reason is mandatory. Please provide a clear explanation for the customer notification.');
        return;
      }
    }

    setIsProcessing(true);
    setRejectionError(null);

    try {
      const res = await actOnApproval(
        selectedApproval.id,
        actionType,
        decisionNotes.trim(),
        reviewerName,
        correctionFeedback.trim()
      );
      onApprovalProcessed(res.approval, res.lead);
      setSelectedApproval(null);

      const actionLabel = actionType === 'approve' ? 'Approved' : actionType === 'reject' ? 'Rejected' : actionType;
      setFeedbackToast({
        message: `Decision successfully recorded: ${actionLabel}. Automated customer notification (Email & SMS) dispatched.`,
        type: 'success',
      });
      setTimeout(() => setFeedbackToast(null), 5000);
    } catch (err: any) {
      setRejectionError(err.message || 'Failed to submit approval action');
    } finally {
      setIsProcessing(false);
    }
  };

  const openCorrectionModal = (item: ManagerApproval) => {
    setCorrectionModalItem(item);
    setCorrectedBudget(item.budget);
    setCorrectedNotes(`Corrected following feedback: ${item.correctionFeedback || ''}`);
  };

  const handleApplyCorrection = async () => {
    if (!correctionModalItem) return;
    setIsProcessing(true);
    try {
      const res = await submitApprovalCorrection(correctionModalItem.id, {
        correctedBudget,
        correctedNotes,
      });
      onApprovalProcessed(res.approval, res.lead);
      setCorrectionModalItem(null);
      setFeedbackToast({
        message: 'Correction applied and lead resubmitted to workflow.',
        type: 'success',
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to apply correction');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackToast.message}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Policy Rules Explainer Card */}
      <div className="p-5 rounded-xl bg-[#0e1628] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Manager Approvals & Customer Notifications</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Inbound leads with deal sizes &ge; $50,000 require manager approval. Approving or rejecting automatically dispatches verified customer notifications (Email &amp; SMS) with explicit decision reasons.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Pending Approvals</span>
            {pendingList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                {pendingList.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('corrections')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'corrections'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Correction Loops</span>
            {correctionList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                {correctionList.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Review History ({historyList.length})</span>
          </button>
        </div>
      </div>

      {/* FIFO Queue Policy Banner */}
      <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-start gap-3 text-xs">
        <Clock className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <div className="font-semibold text-blue-200">
            Strict FIFO Queue Processing Enforced
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            All pending enterprise approvals are processed strictly in chronological order of original submission (<span className="text-blue-300 font-mono">submissionTimestamp</span> ascending). Decisions immediately trigger customer email and SMS notifications.
          </p>
        </div>
      </div>

      {/* Main Content: Pending, Corrections, or History List */}
      {activeTab === 'pending' &&
        (pendingList.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#0e1628] border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">All Approval Queues Clear</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are currently no high-budget or flagged leads awaiting review. Inbound leads meeting enterprise threshold rules will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingList.map((approval, idx) => (
              <div
                key={approval.id}
                className="p-5 rounded-xl bg-[#0e1628] border border-amber-500/30 shadow-lg shadow-amber-950/10 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold">
                      Queue Position #{approval.queuePosition ?? idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">{approval.id}</span>
                    <span className="text-slate-600">·</span>
                    <button
                      onClick={() => onInspectLead(approval.leadId)}
                      className="text-sm font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-1.5"
                    >
                      <span>{approval.leadCompany}</span>
                      <span className="font-mono text-xs text-slate-400">({approval.leadId})</span>
                    </button>
                    {approval.city && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-blue-300 border border-slate-700">
                        📍 {approval.city}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>
                        Submitted:{' '}
                        <strong className="text-slate-200">
                          {new Date(approval.submissionTimestamp || approval.requestedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                  <div>
                    <div className="text-slate-400 text-[11px]">Primary Contact</div>
                    <div className="font-semibold text-white mt-0.5">{approval.leadContact}</div>
                    <div className="text-slate-400 text-[10px] truncate">{approval.leadEmail}</div>
                  </div>

                  <div>
                    <div className="text-slate-400 text-[11px]">Annual Spend Value</div>
                    <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5 tabular-nums">
                      ${approval.budget.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 text-[11px]">AI BANT Rating</div>
                    <div className="font-semibold text-blue-400 text-sm mt-0.5 tabular-nums">
                      {approval.aiScore}/100 <span className="text-xs text-slate-400">({approval.tier})</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 text-[11px]">Target AE Assignment</div>
                    <div className="font-semibold text-slate-200 text-xs mt-0.5 truncate">
                      {approval.suggestedRep}
                    </div>
                  </div>
                </div>

                {/* Trigger Reason Box */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                  <div className="font-semibold text-amber-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Governance Trigger: {approval.ruleMatched}</span>
                  </div>
                  <p className="text-amber-300/80 leading-relaxed pl-5.5">{approval.triggerReason}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <button
                    onClick={() => onInspectLead(approval.leadId)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Inspect Full Lead Record &rarr;
                  </button>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => openActionModal(approval, 'correction_requested')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 text-xs font-medium transition-colors border border-indigo-800/60 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Request Correction</span>
                    </button>
                    <button
                      onClick={() => openActionModal(approval, 'escalate')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
                    >
                      Escalate
                    </button>
                    <button
                      onClick={() => openActionModal(approval, 'reject')}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-medium transition-colors border border-rose-800/60"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => openActionModal(approval, 'approve')}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-emerald-600/30 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Lead</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* Corrections Queue Tab */}
      {activeTab === 'corrections' &&
        (correctionList.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#0e1628] border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">No Active Correction Loops</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Leads returned by managers for clarification will appear here. The system enforces a loop bound of at most 3 correction cycles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {correctionList.map((item) => (
              <div key={item.id} className="p-5 rounded-xl bg-[#0e1628] border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">{item.id}</span>
                    <span className="text-white font-semibold">{item.leadCompany}</span>
                    <span className="text-xs text-slate-400">({item.leadId})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950/50 text-indigo-300 border border-indigo-800/40">
                    Cycle {item.correctionCount || 1} / 3 (Loop Bound)
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-800/30 text-xs space-y-1">
                  <div className="text-indigo-300 font-medium">Manager Feedback:</div>
                  <p className="text-slate-300">{item.correctionFeedback || 'Needs revision'}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-slate-400">Current Budget: ${item.budget.toLocaleString()}</div>
                  <button
                    onClick={() => openCorrectionModal(item)}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Apply Correction & Resubmit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* History Table - REQUIREMENT: Display decision reason directly next to Approved/Rejected status */}
      {activeTab === 'history' && (
        <div className="rounded-xl bg-[#0e1628] border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                  <th className="py-3 px-4 font-semibold">Approval ID</th>
                  <th className="py-3 px-4 font-semibold">Lead & Company</th>
                  <th className="py-3 px-4 font-semibold">Budget</th>
                  <th className="py-3 px-4 font-semibold">Status & Decision Reason</th>
                  <th className="py-3 px-4 font-semibold">Reviewed By</th>
                  <th className="py-3 px-4 font-semibold">Notifications</th>
                  <th className="py-3 px-4 text-right font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {historyList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-400">{item.id}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onInspectLead(item.leadId)}
                        className="font-semibold text-white hover:text-blue-400 text-left transition-colors"
                      >
                        {item.leadCompany}
                      </button>
                      <div className="text-[10px] text-slate-400 font-mono">{item.leadId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-200">
                      ${item.budget.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 min-w-[260px]">
                      {/* Status badge with Reason displayed directly next to/underneath it */}
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            item.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.decisionNotes && (
                          <div className="text-[11px] text-slate-300 leading-snug">
                            <span className="font-semibold text-slate-400">Reason: </span>
                            <span className="text-slate-200">{item.decisionNotes}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{item.reviewedBy || 'Sarah Connor'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40 flex items-center gap-1 font-mono text-[10px]">
                          <Mail className="w-3 h-3" />
                          <span>Email</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 flex items-center gap-1 font-mono text-[10px]">
                          <MessageSquare className="w-3 h-3" />
                          <span>SMS</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                      {item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Decision Action Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0e1628] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Confirm Decision: {actionType.replace('_', ' ').toUpperCase()}</span>
              </h3>
              <span className="font-mono text-xs text-slate-400">{selectedApproval.id}</span>
            </div>

            <div className="text-xs text-slate-300 space-y-2">
              <p>
                Decision on lead for <strong className="text-white">{selectedApproval.leadCompany}</strong> ($
                {selectedApproval.budget.toLocaleString()}).
              </p>
              {actionType === 'approve' && (
                <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-xs">
                  Upon approval, this lead will be transitioned to <strong>Assigned</strong> and routed to{' '}
                  <strong>{selectedApproval.suggestedRep}</strong>. An automated approval confirmation email &amp; SMS
                  will be sent to the customer.
                </div>
              )}
              {actionType === 'reject' && (
                <div className="p-2.5 rounded bg-rose-950/20 border border-rose-800/40 text-rose-300 text-xs">
                  <strong>Mandatory Requirement:</strong> You must enter a clear rejection reason. This reason will be
                  included directly in the rejection record and sent to the customer via Email &amp; SMS.
                </div>
              )}
              {actionType === 'correction_requested' && (
                <div className="p-2.5 rounded bg-indigo-950/20 border border-indigo-800/40 text-indigo-300 text-xs">
                  This initiates the <strong>Correction Path</strong>. The enquiry will be placed in review loop with
                  your specific instructions (bounded by max 3 iterations).
                </div>
              )}
            </div>

            {/* Error banner if validation fails */}
            {rejectionError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{rejectionError}</span>
              </div>
            )}

            {actionType === 'correction_requested' ? (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Required Corrections / Feedback <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={correctionFeedback}
                  onChange={(e) => setCorrectionFeedback(e.target.value)}
                  placeholder="Specify what details require revision..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            ) : actionType === 'reject' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-rose-300">
                    Rejection Reason <span className="text-rose-400">* (Mandatory)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Sent to customer via Email & SMS</span>
                </div>

                {/* Quick suggestion chips */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickRejectionReason('The requested service location is outside the supported service area.')
                    }
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                  >
                    Outside Service Area
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickRejectionReason('Deal budget does not meet our minimum annual commitment threshold.')
                    }
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                  >
                    Budget Under Minimum
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickRejectionReason(
                        'Unable to support requested custom compliance or infrastructure architecture requirements at this time.'
                      )
                    }
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                  >
                    Compliance Mismatch
                  </button>
                </div>

                <textarea
                  rows={3}
                  required
                  value={decisionNotes}
                  onChange={(e) => {
                    setDecisionNotes(e.target.value);
                    if (rejectionError) setRejectionError(null);
                  }}
                  placeholder="Enter the specific reason for rejecting this project/order..."
                  className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-xs text-white focus:outline-none ${
                    rejectionError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-blue-500'
                  }`}
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Approval Notes / Next Steps <span className="text-slate-500">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="e.g. Requirements verified and the project meets all eligibility criteria."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedApproval(null);
                  setRejectionError(null);
                }}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={isProcessing || (actionType === 'reject' && !decisionNotes.trim())}
                className={`px-4 py-2 rounded-lg text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : actionType === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : actionType === 'correction_requested'
                    ? 'bg-indigo-600 hover:bg-indigo-500'
                    : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                {isProcessing
                  ? 'Recording & Notifying Customer...'
                  : `Confirm ${actionType.replace('_', ' ').toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Correction Modal */}
      {correctionModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0e1628] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Apply Correction &amp; Resubmit</h3>
              <span className="font-mono text-xs text-slate-400">{correctionModalItem.id}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Updated Annual Budget ($)</label>
                <input
                  type="number"
                  value={correctedBudget}
                  onChange={(e) => setCorrectedBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Amendment Notes</label>
                <textarea
                  rows={3}
                  value={correctedNotes}
                  onChange={(e) => setCorrectedNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCorrectionModalItem(null)}
                className="px-3.5 py-1.5 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCorrection}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded bg-blue-600 text-white text-xs font-semibold"
              >
                {isProcessing ? 'Resubmitting...' : 'Resubmit for Qualification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
