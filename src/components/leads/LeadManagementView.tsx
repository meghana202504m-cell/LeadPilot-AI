import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  ExternalLink,
  ChevronDown,
  Layers,
  Zap,
  Building2,
  DollarSign
} from 'lucide-react';
import { Lead, LeadTier, LeadStatus } from '../../types/index.ts';

interface LeadManagementViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onNewEnquiry: () => void;
}

export const LeadManagementView: React.FC<LeadManagementViewProps> = ({
  leads,
  onSelectLead,
  onNewEnquiry,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'budget'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !searchTerm ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.industry.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTier = tierFilter === 'ALL' || lead.tier === tierFilter;
      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;

      return matchesSearch && matchesTier && matchesStatus;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'score') {
        comparison = b.score - a.score;
      } else if (sortBy === 'budget') {
        comparison = b.annualBudget - a.annualBudget;
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });
  }, [leads, searchTerm, tierFilter, statusFilter, sortBy, sortOrder]);

  // CSV Export
  const exportToCSV = () => {
    const headers = ['Lead ID', 'Company', 'Contact', 'Email', 'Annual Budget', 'Score', 'Tier', 'Routing Team', 'Rep', 'Status', 'Date'];
    const rows = filteredLeads.map((l) => [
      l.id,
      `"${l.company.replace(/"/g, '""')}"`,
      `"${l.contactName.replace(/"/g, '""')}"`,
      l.email,
      l.annualBudget,
      l.score,
      l.tier,
      l.recommendedRouting,
      `"${l.assignedRep.replace(/"/g, '""')}"`,
      l.status,
      new Date(l.createdAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LeadPilot_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tierColors: Record<string, string> = {
    Platinum: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    Gold: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Silver: 'text-slate-300 bg-slate-500/10 border-slate-500/20',
    Disqualified: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, contact, email, ID..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Right: Segmented Tier Filter & Actions */}
        <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
          {/* Tier buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'Platinum', 'Gold', 'Silver', 'Disqualified'].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  tierFilter === t
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'ALL' ? 'All Tiers' : t}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="New">New</option>
            <option value="Qualified">Qualified</option>
            <option value="In Review">In Review</option>
            <option value="Assigned">Assigned</option>
            <option value="Contacted">Contacted</option>
            <option value="Won">Won</option>
            <option value="Disqualified">Disqualified</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={exportToCSV}
            title="Download CSV report"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="rounded-xl bg-[#0e1628] border border-slate-800 overflow-hidden">
        {/* Table summary bar */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white font-mono">{filteredLeads.length}</strong> of{' '}
            <span className="font-mono">{leads.length}</span> recorded enterprise leads
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px]">Sort by:</span>
            <button
              onClick={() => {
                if (sortBy === 'date') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                else { setSortBy('date'); setSortOrder('desc'); }
              }}
              className={`hover:text-white transition-colors ${sortBy === 'date' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <span>·</span>
            <button
              onClick={() => {
                if (sortBy === 'score') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                else { setSortBy('score'); setSortOrder('desc'); }
              }}
              className={`hover:text-white transition-colors ${sortBy === 'score' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Score {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <span>·</span>
            <button
              onClick={() => {
                if (sortBy === 'budget') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                else { setSortBy('budget'); setSortOrder('desc'); }
              }}
              className={`hover:text-white transition-colors ${sortBy === 'budget' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Budget {sortBy === 'budget' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">No matching leads found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria or clear active tier/status filters.
            </p>
            <button
              onClick={onNewEnquiry}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Lead</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                  <th className="py-3 px-4 font-semibold">Lead ID & Company</th>
                  <th className="py-3 px-4 font-semibold">Contact & Email</th>
                  <th className="py-3 px-4 font-semibold">Annual Spend</th>
                  <th className="py-3 px-4 font-semibold">AI Score & Tier</th>
                  <th className="py-3 px-4 font-semibold">Routing Team</th>
                  <th className="py-3 px-4 font-semibold">Assigned Rep</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-slate-400">{lead.id}</div>
                      <div className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <span>{lead.company}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-400">{lead.industry}</span>
                        {lead.city && (
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                            lead.regionStatus === 'Serviceable'
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                          }`}>
                            📍 {lead.city}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{lead.contactName}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-[170px]">{lead.email}</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-200 tabular-nums">
                      ${lead.annualBudget.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${tierColors[lead.tier] || ''}`}>
                          {lead.tier}
                        </span>
                        <span className="font-mono font-bold text-white tabular-nums">{lead.score}/100</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-medium truncate max-w-[150px]">{lead.recommendedRouting}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-300 truncate max-w-[140px]">{lead.assignedRep}</div>
                      {lead.requiresApproval && lead.approvalStatus === 'pending' && (
                        <div className="text-[10px] text-amber-400 font-medium">Pending Approval</div>
                      )}
                      {lead.approvalStatus === 'approved' && lead.expectedDeliveryDate && (
                        <div className="text-[10px] text-emerald-400 font-mono">Due: {lead.expectedDeliveryDate}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-300 font-medium text-xs">
                          {lead.status}
                        </span>
                        {lead.regionStatus === 'Outside Service Area' && (
                          <span className="text-[9px] text-rose-400 font-semibold">Outside Service Area</span>
                        )}
                        {lead.approvalStatus === 'approved' && (
                          <span className="text-[9px] text-emerald-400 font-semibold">Approved Project</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead(lead);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
