import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Search,
  Filter,
  Code2,
  ArrowRight,
  Database,
  Send,
  UserCheck,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { WorkflowLog } from '../../types/index.ts';

interface WorkflowLogsViewProps {
  logs: WorkflowLog[];
  filterLeadId?: string;
  onClearLeadFilter: () => void;
  onInspectLead: (leadId: string) => void;
}

export const WorkflowLogsView: React.FC<WorkflowLogsViewProps> = ({
  logs,
  filterLeadId,
  onClearLeadFilter,
  onInspectLead,
}) => {
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    const matchesLead = !filterLeadId || log.leadId === filterLeadId;
    const matchesSearch =
      !searchTerm ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.leadId && log.leadId.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesLevel && matchesLead && matchesSearch;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'ENQUIRY_RECEIVED':
        return { label: 'Inbound Intake', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      case 'BANT_SCORING':
        return { label: 'BANT Scored', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
      case 'APPROVAL_TRIGGERED':
        return { label: 'Policy Threshold', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'MANAGER_APPROVED':
        return { label: 'Manager Sign-Off', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'MANAGER_REJECTED':
        return { label: 'Manager Rejected', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'REP_ASSIGNED':
        return { label: 'Routing Dispatched', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
      case 'CRM_SYNCED':
        return { label: 'CRM Webhook', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
      case 'TEST_SUITE_RUN':
        return { label: 'Test Execution', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      default:
        return { label: action, color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'CRITICAL':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Active lead filter notification pill */}
      {filterLeadId && (
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>
              Filtering audit trail for Lead: <strong className="font-mono text-white">{filterLeadId}</strong>
            </span>
          </div>
          <button
            onClick={onClearLeadFilter}
            className="text-xs text-blue-400 hover:text-white underline font-medium"
          >
            Clear Filter (Show All Logs)
          </button>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by keyword, lead ID, action..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          {['ALL', 'INFO', 'SUCCESS', 'WARNING'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                levelFilter === lvl
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lvl === 'ALL' ? 'All Events' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Workflow Timeline List */}
      <div className="p-5 rounded-xl bg-[#0e1628] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
          <div>
            Total Timeline Records: <span className="text-white font-mono font-semibold">{filteredLogs.length}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Immutable Audit Trail · Sub-second dispatch timestamps
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No logs matched the selected filters.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              const isExpanded = expandedLogId === log.id;

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline icon node */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#0a0f1d] border border-slate-700 flex items-center justify-center">
                    {getLevelIcon(log.level)}
                  </div>

                  {/* Log Card */}
                  <div className="p-4 rounded-lg bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.color}`}>
                          {badge.label}
                        </span>

                        {log.leadId && (
                          <button
                            onClick={() => onInspectLead(log.leadId!)}
                            className="font-mono text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-1"
                          >
                            <span>{log.leadId}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        <span className="font-mono text-slate-400 text-[11px]">{log.id}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-normal">
                      {log.message}
                    </p>

                    {/* Expandable JSON Metadata */}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="pt-1.5">
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-300 font-medium transition-colors"
                        >
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          <Code2 className="w-3 h-3 text-blue-400" />
                          <span>{isExpanded ? 'Hide Payload' : 'Inspect Event Metadata'}</span>
                        </button>

                        {isExpanded && (
                          <pre className="mt-2 p-3 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
