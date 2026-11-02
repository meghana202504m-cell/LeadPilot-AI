import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  DollarSign,
  Briefcase,
  Calendar,
  Layers,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Save,
  Activity,
  MapPin,
  CalendarClock,
  MessageSquare,
  AlertCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Lead, LeadStatus, CustomerNotification } from '../../types/index.ts';
import { updateLead, updateLeadDelivery, fetchNotifications, retryNotification } from '../../services/api.ts';
import { calculateDeliveryStatus } from '../projects/ApprovedProjectsView.tsx';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated: (updatedLead: Lead) => void;
  onViewLogsForLead: (leadId: string) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onLeadUpdated,
  onViewLogsForLead,
}) => {
  if (!lead) return null;

  const [currentStatus, setCurrentStatus] = useState<LeadStatus>(lead.status);
  const [currentRep, setCurrentRep] = useState<string>(lead.assignedRep);
  const [deliveryDate, setDeliveryDate] = useState<string>(lead.expectedDeliveryDate || '');
  const [deliveryStatus, setDeliveryStatus] = useState<string>(lead.deliveryStatus || 'In Progress');
  const [notes, setNotes] = useState<string>(lead.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Customer Notifications state
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    if (lead?.id) {
      setIsLoadingNotifications(true);
      fetchNotifications(lead.id)
        .then((items) => setNotifications(items))
        .catch((err) => console.error('Failed to load notifications:', err))
        .finally(() => setIsLoadingNotifications(false));
    }
  }, [lead?.id]);

  const handleRetryNotification = async (notifId: string) => {
    setRetryingId(notifId);
    try {
      const updated = await retryNotification(notifId);
      setNotifications((prev) => prev.map((n) => (n.id === notifId ? updated : n)));
    } catch (err: any) {
      alert(err.message || 'Retry failed');
    } finally {
      setRetryingId(null);
    }
  };

  const reps = [
    'Marcus Vance (Strategic Accounts)',
    'Elena Rostova (Healthcare Enterprise)',
    'David Chen (Mid-Market AE)',
    'Rachel Adams (Enterprise SDR)',
    'Alex Morgan (SMB Velocity)',
    'Automated System',
    'Pending Approval',
  ];

  const statuses: LeadStatus[] = [
    'New',
    'Qualified',
    'In Review',
    'Assigned',
    'Contacted',
    'Won',
    'Disqualified',
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const repClean = currentRep.split(' (')[0];
      let updated = await updateLead(lead.id, {
        status: currentStatus,
        assignedRep: repClean,
        notes,
      });

      if (lead.approvalStatus === 'approved' && deliveryDate !== (lead.expectedDeliveryDate || '')) {
        updated = await updateLeadDelivery(lead.id, deliveryDate, deliveryStatus);
      }

      onLeadUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to update lead:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const deliveryCalc = calculateDeliveryStatus(deliveryDate);

  const tierColors: Record<string, string> = {
    Platinum: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    Gold: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Silver: 'text-slate-300 bg-slate-500/10 border-slate-500/30',
    Disqualified: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-[#0e1628] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#0a0f1d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-mono font-bold text-xs">
              {lead.tier.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white tracking-tight">{lead.company}</h3>
                <span className="font-mono text-xs text-slate-400 font-semibold">{lead.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${tierColors[lead.tier]}`}>
                  {lead.tier}
                </span>
                {lead.city && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      lead.regionStatus === 'Serviceable'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    📍 {lead.city} ({lead.regionStatus || 'Serviceable'})
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{lead.industry}</span>
                <span>·</span>
                <span>{lead.companySize}</span>
                <span>·</span>
                <span>Created {new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onViewLogsForLead(lead.id);
              }}
              title="View workflow activity logs for this lead"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Audit Logs</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Region Status Notification if Outside Service Area */}
          {lead.regionStatus === 'Outside Service Area' && (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-3 text-xs">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-rose-300">Outside Service Area: </span>
                <span className="text-rose-200/90">
                  Sorry, our service is currently available only in Karnataka. Location <strong>{lead.city || 'outside Karnataka'}</strong> is excluded from manager approval and project delivery workflows.
                </span>
              </div>
            </div>
          )}

          {/* Executive ICP & Sales Briefing */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>AI Executive Qualification Summary</span>
              </span>
              <span className="font-mono text-white text-sm tabular-nums">
                Score: <strong>{lead.score}/100</strong>
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{lead.icpFitSummary}</p>
            {lead.salesBriefing && (
              <div className="pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold">AE Sales Briefing: </span>
                <span className="text-blue-200/90">{lead.salesBriefing}</span>
              </div>
            )}
          </div>

          {/* BANT Breakdown Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              BANT Evaluation Criteria Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Budget */}
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                    <span>Budget ($)</span>
                  </span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {lead.bantBreakdown.budget.score} / {lead.bantBreakdown.budget.max}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  {lead.bantBreakdown.budget.rationale}
                </div>
              </div>

              {/* Authority */}
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Authority</span>
                  </span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {lead.bantBreakdown.authority.score} / {lead.bantBreakdown.authority.max}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  {lead.bantBreakdown.authority.rationale}
                </div>
              </div>

              {/* Need */}
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Need</span>
                  </span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {lead.bantBreakdown.need.score} / {lead.bantBreakdown.need.max}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  {lead.bantBreakdown.need.rationale}
                </div>
              </div>

              {/* Timeline */}
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Timeline</span>
                  </span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {lead.bantBreakdown.timeline.score} / {lead.bantBreakdown.timeline.max}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  {lead.bantBreakdown.timeline.rationale}
                </div>
              </div>
            </div>
          </div>

          {/* Lead Contact & Company Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                Contact Information
              </h4>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-200">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.contactName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.email}</span>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-2 text-slate-200 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {lead.city || 'Karnataka'} ({lead.regionStatus || 'Serviceable'})
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                Deal &amp; Routing Specs
              </h4>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Annual Budget:</span>
                  <span className="font-mono font-semibold text-white tabular-nums">
                    ${lead.annualBudget.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recommended Team:</span>
                  <span className="font-semibold text-blue-400">{lead.recommendedRouting}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Approval Required:</span>
                  <span className={lead.requiresApproval ? 'text-amber-400 font-medium' : 'text-slate-400'}>
                    {lead.requiresApproval ? `Yes (${lead.approvalStatus})` : 'No (Auto-approved)'}
                  </span>
                </div>
                <div className="pt-1 border-t border-slate-800/80">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Approval Decision:</span>
                    <span
                      className={`font-semibold uppercase text-[11px] px-2 py-0.5 rounded ${
                        lead.approvalStatus === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : lead.approvalStatus === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {lead.approvalStatus || 'None'}
                    </span>
                  </div>

                  {/* REQUIREMENT: Display decision reason directly next to/underneath status */}
                  {lead.approvalNotes && (
                    <div className="mt-1.5 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                      <span className="font-semibold text-slate-400">Reason: </span>
                      <span className="text-slate-200">{lead.approvalNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Automated Notifications Section (Requirement 4) */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>Automated Customer Notifications (Email &amp; SMS)</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                {notifications.length} record{notifications.length !== 1 ? 's' : ''}
              </span>
            </div>

            {isLoadingNotifications ? (
              <div className="text-center py-4 text-xs text-slate-500 animate-pulse">
                Loading notification audit records...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-3 text-center rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400">
                No customer notifications have been dispatched for this lead yet. Notifications are triggered automatically upon manager approval or rejection.
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] text-slate-400 font-bold">{notif.id}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase flex items-center gap-1 ${
                            notif.notificationType === 'Email'
                              ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                              : 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/40'
                          }`}
                        >
                          {notif.notificationType === 'Email' ? <Mail className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                          <span>{notif.notificationType}</span>
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          To: {notif.notificationType === 'Email' ? notif.recipientEmail : (notif.recipientPhone || notif.recipientEmail)}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            notif.decisionStatus === 'Approved'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {notif.decisionStatus}
                        </span>
                      </div>

                      {notif.subject && (
                        <div className="font-medium text-slate-200 text-xs">{notif.subject}</div>
                      )}

                      <div className="text-slate-400 text-[11px] font-sans line-clamp-2">
                        {notif.message}
                      </div>

                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>Provider: {notif.notificationType === 'Email' ? 'SMTP Service' : 'Twilio SMS'}</span>
                        <span>·</span>
                        <span>{new Date(notif.timestamp).toLocaleString()}</span>
                        {notif.failureReason && (
                          <>
                            <span>·</span>
                            <span className="text-rose-400">Notice: {notif.failureReason}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                          notif.deliveryStatus === 'Sent'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : notif.deliveryStatus === 'Not Configured'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {notif.deliveryStatus === 'Sent' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span>{notif.deliveryStatus}</span>
                      </span>

                      {(notif.deliveryStatus === 'Failed' || notif.deliveryStatus === 'Not Configured') && (
                        <button
                          onClick={() => handleRetryNotification(notif.id)}
                          disabled={retryingId === notif.id}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-colors flex items-center gap-1 border border-slate-700 disabled:opacity-50"
                        >
                          <RotateCcw className={`w-3 h-3 ${retryingId === notif.id ? 'animate-spin' : ''}`} />
                          <span>{retryingId === notif.id ? 'Retrying...' : 'Retry'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Operational Editing Section: Status & Rep assignment */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h4 className="font-semibold text-slate-200 text-xs flex items-center justify-between">
              <span>Operational Management &amp; Rep Reassignment</span>
              {saveSuccess && (
                <span className="text-emerald-400 font-normal flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Changes saved to persistent storage
                </span>
              )}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Pipeline Status</label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Assigned Account Rep</label>
                <select
                  value={currentRep}
                  onChange={(e) => setCurrentRep(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {reps.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Approved Project Delivery Controls */}
            {lead.approvalStatus === 'approved' && (
              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                    <CalendarClock className="w-4 h-4 text-blue-400" />
                    <span>Approved Project Delivery Deadline &amp; Priority</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${deliveryCalc.badgeClass}`}>
                    {deliveryCalc.displayText}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Delivery Deadline Date</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Execution Status</label>
                    <select
                      value={deliveryStatus}
                      onChange={(e) => setDeliveryStatus(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Internal Operational Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add meeting notes, customer constraints, or next steps..."
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Updates'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
