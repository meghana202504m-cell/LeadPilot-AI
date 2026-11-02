import React from 'react';
import {
  Users,
  CheckCircle,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Send,
  Zap,
  Building2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { DashboardStats, Lead, ManagerApproval } from '../../types/index.ts';
import { NavTab } from '../layout/Sidebar.tsx';

interface DashboardViewProps {
  stats: DashboardStats | null;
  recentLeads: Lead[];
  pendingApprovals: ManagerApproval[];
  onNavigate: (tab: NavTab) => void;
  onSelectLead: (lead: Lead) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentLeads,
  pendingApprovals,
  onNavigate,
  onSelectLead,
}) => {
  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading enterprise analytics...</p>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Inbound Leads',
      value: stats.totalLeads.toLocaleString(),
      change: '+24% this week',
      icon: Users,
      color: 'text-blue-400',
    },
    {
      label: 'Qualification Rate',
      value: `${stats.qualificationRate}%`,
      change: 'BANT benchmark > 70%',
      icon: CheckCircle,
      color: 'text-emerald-400',
    },
    {
      label: 'Avg AI BANT Score',
      value: `${stats.avgAiScore}/100`,
      change: 'Dynamic ICP model',
      icon: Zap,
      color: 'text-indigo-400',
    },
    {
      label: 'Qualified Pipeline',
      value: `$${(stats.pipelineValue / 1000).toFixed(0)}k`,
      change: 'Active ARR potential',
      icon: TrendingUp,
      color: 'text-emerald-400',
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingApprovals.toString(),
      change: stats.pendingApprovals > 0 ? 'Requires manager review' : 'All clear',
      icon: ShieldAlert,
      color: stats.pendingApprovals > 0 ? 'text-amber-400' : 'text-slate-400',
      highlight: stats.pendingApprovals > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Pending Approvals Callout Banner if needed */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-amber-200">
                {pendingApprovals.length} High-Value Lead{pendingApprovals.length > 1 ? 's' : ''} Awaiting Manager Approval
              </div>
              <div className="text-xs text-amber-300/80">
                Threshold triggers: budget &ge; $50,000 or custom healthcare / financial vertical compliance.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('approvals')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shrink-0 shadow-sm flex items-center gap-1.5"
          >
            <span>Review Queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl bg-[#0e1628] border transition-all ${
                kpi.highlight ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium truncate">{kpi.label}</span>
                <Icon className={`w-4 h-4 shrink-0 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight tabular-nums mb-1 font-mono">
                {kpi.value}
              </div>
              <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                <span>{kpi.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Tier Distribution & Routing Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Distribution Card */}
        <div className="p-5 rounded-xl bg-[#0e1628] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Lead Tier Distribution</h3>
            <span className="text-xs text-slate-400">AI Scoring Logic</span>
          </div>

          <div className="space-y-3">
            {[
              {
                tier: 'Platinum',
                range: 'Score 85-100',
                count: stats.tierCounts.Platinum,
                bg: 'bg-blue-500',
                text: 'text-blue-400',
                desc: 'Strategic Accounts & Executive AE',
              },
              {
                tier: 'Gold',
                range: 'Score 70-84',
                count: stats.tierCounts.Gold,
                bg: 'bg-emerald-500',
                text: 'text-emerald-400',
                desc: 'Mid-Market Dedicated AE',
              },
              {
                tier: 'Silver',
                range: 'Score 50-69',
                count: stats.tierCounts.Silver,
                bg: 'bg-slate-400',
                text: 'text-slate-300',
                desc: 'SMB Velocity Inside Sales',
              },
              {
                tier: 'Disqualified',
                range: 'Score < 50',
                count: stats.tierCounts.Disqualified,
                bg: 'bg-rose-500',
                text: 'text-rose-400',
                desc: 'Automated Drip / Self-Serve Nurture',
              },
            ].map((item) => {
              const pct = stats.totalLeads > 0 ? Math.round((item.count / stats.totalLeads) * 100) : 0;
              return (
                <div key={item.tier} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.bg}`} />
                      <span className="font-semibold text-slate-200">{item.tier}</span>
                      <span className="text-slate-400 text-[11px]">({item.range})</span>
                    </div>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="font-mono font-medium text-white">{item.count}</span>
                      <span className="text-slate-400 text-[11px]">{pct}%</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.bg} transition-all duration-500 rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            AI evaluates four vectors: Budget weight (25%), Decision Authority (25%), Mission Need (25%), and Purchase Timeline (25%).
          </div>
        </div>

        {/* Routing Distribution */}
        <div className="p-5 rounded-xl bg-[#0e1628] border border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Automated Sales Routing Matrix</h3>
              <p className="text-xs text-slate-400">Current active leads assigned across enterprise channels</p>
            </div>
            <button
              onClick={() => onNavigate('enquiry')}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              <span>Test Intake</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              {
                team: 'Strategic Accounts',
                leads: stats.routingDistribution['Strategic Accounts'],
                leadRep: 'Marcus Vance / Elena Rostova',
                criteria: 'ARR > $50k or Platinum Tier',
                accent: 'border-blue-500/30 bg-blue-950/20 text-blue-300',
              },
              {
                team: 'Mid-Market AE',
                leads: stats.routingDistribution['Mid-Market AE'],
                leadRep: 'David Chen',
                criteria: 'ARR $25k-$50k, Gold Tier',
                accent: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
              },
              {
                team: 'SMB Growth Team',
                leads: stats.routingDistribution['SMB Growth Team'],
                leadRep: 'Alex Morgan',
                criteria: 'ARR $10k-$25k, Silver Tier',
                accent: 'border-slate-700 bg-slate-900/40 text-slate-300',
              },
              {
                team: 'Enterprise SDR',
                leads: stats.routingDistribution['Enterprise SDR'],
                leadRep: 'Rachel Adams',
                criteria: 'Exploratory Enterprise Accounts',
                accent: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300',
              },
              {
                team: 'Self-Serve Nurture',
                leads: stats.routingDistribution['Self-Serve Nurture'],
                leadRep: 'Automated Bot Sequence',
                criteria: 'Personal email or Sub-threshold',
                accent: 'border-rose-500/30 bg-rose-950/20 text-rose-300',
              },
            ].map((route) => (
              <div
                key={route.team}
                className={`p-3.5 rounded-lg border flex flex-col justify-between ${route.accent}`}
              >
                <div>
                  <div className="text-xs font-semibold mb-1 truncate">{route.team}</div>
                  <div className="text-[11px] text-slate-400 leading-snug line-clamp-2">{route.criteria}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 truncate">{route.leadRep}</span>
                  <span className="text-sm font-mono font-bold text-white tabular-nums">
                    {route.leads} <span className="text-[10px] font-normal text-slate-400">leads</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Routing SLA: Real-time webhook dispatch under 250ms</span>
            </span>
            <button
              onClick={() => onNavigate('logs')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              View Audit Logs &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Recent Qualified Inbound Leads */}
      <div className="p-5 rounded-xl bg-[#0e1628] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Inbound Leads</h3>
            <p className="text-xs text-slate-400">Real-time qualified records stored in persistent database</p>
          </div>
          <button
            onClick={() => onNavigate('leads')}
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            <span>View All Leads</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentLeads.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No leads recorded yet. Submit an enquiry to initiate qualification.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 font-semibold">Lead ID & Company</th>
                  <th className="pb-3 font-semibold">Contact & Email</th>
                  <th className="pb-3 font-semibold">Budget</th>
                  <th className="pb-3 font-semibold">AI Score & Tier</th>
                  <th className="pb-3 font-semibold">Routing & Rep</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentLeads.slice(0, 5).map((lead) => {
                  const tierColors: Record<string, string> = {
                    Platinum: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                    Gold: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                    Silver: 'text-slate-300 bg-slate-500/10 border-slate-500/20',
                    Disqualified: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                  };
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                      onClick={() => onSelectLead(lead)}
                    >
                      <td className="py-3">
                        <div className="font-mono text-[11px] text-slate-400">{lead.id}</div>
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {lead.company}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="text-slate-200 font-medium">{lead.contactName}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-[160px]">{lead.email}</div>
                      </td>
                      <td className="py-3 font-mono font-medium text-slate-200 tabular-nums">
                        ${lead.annualBudget.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${tierColors[lead.tier] || ''}`}>
                            {lead.tier}
                          </span>
                          <span className="font-mono font-bold text-white tabular-nums">{lead.score}/100</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="text-slate-200 font-medium truncate max-w-[140px]">{lead.recommendedRouting}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{lead.assignedRep}</div>
                      </td>
                      <td className="py-3">
                        <span className="text-slate-300 text-[11px] font-medium">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLead(lead);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
