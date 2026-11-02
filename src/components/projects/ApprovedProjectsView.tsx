import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  Edit2,
  Building2,
  MapPin,
  User,
  ArrowUpDown,
  Sparkles,
  Layers,
  Save,
  X
} from 'lucide-react';
import { Lead, DeliveryPriority } from '../../types/index.ts';
import { updateLeadDelivery } from '../../services/api.ts';

interface ApprovedProjectsViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onRefresh: () => void;
}

// Dynamic calculate days remaining and priority based on current date
export function calculateDeliveryStatus(deadlineStr?: string): {
  daysRemaining: number | null;
  priority: DeliveryPriority;
  displayText: string;
  badgeClass: string;
} {
  if (!deadlineStr || deadlineStr.trim() === '') {
    return {
      daysRemaining: null,
      priority: 'Deadline Not Set',
      displayText: 'Deadline not set',
      badgeClass: 'bg-slate-800 text-slate-400 border border-slate-700',
    };
  }

  // Reference date: current timestamp
  const now = new Date().getTime();
  const deadline = new Date(deadlineStr).getTime();
  const diffMs = deadline - now;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return {
      daysRemaining: days,
      priority: 'Overdue',
      displayText: `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`,
      badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    };
  } else if (days <= 30) {
    return {
      daysRemaining: days,
      priority: 'Urgent',
      displayText: `Urgent · ${days} day${days === 1 ? '' : 's'} left`,
      badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold',
    };
  } else if (days <= 60) {
    return {
      daysRemaining: days,
      priority: 'High Priority',
      displayText: `High Priority · ${days} days`,
      badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    };
  } else {
    return {
      daysRemaining: days,
      priority: 'Normal',
      displayText: `Normal · ${days} days`,
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    };
  }
}

export const ApprovedProjectsView: React.FC<ApprovedProjectsViewProps> = ({
  leads,
  onSelectLead,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [newDeadline, setNewDeadline] = useState<string>('');
  const [newDeliveryStatus, setNewDeliveryStatus] = useState<string>('In Progress');
  const [isSaving, setIsSaving] = useState(false);

  // 1. Filter ONLY currently approved projects (Pending and rejected projects must not appear!)
  const approvedProjects = useMemo(() => {
    return leads.filter((l) => l.approvalStatus === 'approved');
  }, [leads]);

  // 2. Compute summaries
  const summaries = useMemo(() => {
    let overdue = 0;
    let urgent = 0;
    let highPriority = 0;
    let normal = 0;
    let notSet = 0;

    approvedProjects.forEach((p) => {
      const calc = calculateDeliveryStatus(p.expectedDeliveryDate);
      if (calc.priority === 'Overdue') overdue++;
      else if (calc.priority === 'Urgent') urgent++;
      else if (calc.priority === 'High Priority') highPriority++;
      else if (calc.priority === 'Normal') normal++;
      else notSet++;
    });

    return {
      total: approvedProjects.length,
      overdue,
      urgent,
      highPriority,
      normal,
      notSet,
    };
  }, [approvedProjects]);

  // 3. Filter and sort by earliest deadline first
  const filteredAndSortedProjects = useMemo(() => {
    return approvedProjects
      .filter((p) => {
        const matchesSearch =
          !searchTerm ||
          p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.city && p.city.toLowerCase().includes(searchTerm.toLowerCase()));

        const calc = calculateDeliveryStatus(p.expectedDeliveryDate);
        const matchesPriority = priorityFilter === 'ALL' || calc.priority === priorityFilter;

        return matchesSearch && matchesPriority;
      })
      .sort((a, b) => {
        // Earliest delivery deadline first. If no deadline, place at bottom.
        if (!a.expectedDeliveryDate && !b.expectedDeliveryDate) return 0;
        if (!a.expectedDeliveryDate) return 1;
        if (!b.expectedDeliveryDate) return -1;
        return new Date(a.expectedDeliveryDate).getTime() - new Date(b.expectedDeliveryDate).getTime();
      });
  }, [approvedProjects, searchTerm, priorityFilter]);

  const openDeadlineEditor = (project: Lead) => {
    setEditingLead(project);
    setNewDeadline(project.expectedDeliveryDate || '');
    setNewDeliveryStatus(project.deliveryStatus || 'In Progress');
  };

  const handleSaveDeadline = async () => {
    if (!editingLead) return;
    setIsSaving(true);
    try {
      await updateLeadDelivery(editingLead.id, newDeadline, newDeliveryStatus);
      onRefresh();
      setEditingLead(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update delivery deadline');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-xl bg-[#0e1628] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Approved Projects & Delivery Priority Dashboard
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Tracks execution schedules for all currently approved client engagements. Projects are dynamically ordered by earliest delivery deadline to prevent SLA breaches.
          </p>
        </div>
      </div>

      {/* KPI Cards: Deadlines & Priority */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Approved Projects</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {summaries.total}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Approved by executive sign-off</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1628] border border-rose-500/30 bg-rose-950/10">
          <div className="text-xs text-rose-300 font-medium flex items-center justify-between">
            <span>Overdue Projects</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
            {summaries.overdue}
          </div>
          <div className="text-[10px] text-rose-300/80 mt-0.5">Deadline date passed</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1628] border border-amber-500/30 bg-amber-950/10">
          <div className="text-xs text-amber-300 font-medium flex items-center justify-between">
            <span>Urgent Delivery (&le; 30d)</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {summaries.urgent}
          </div>
          <div className="text-[10px] text-amber-300/80 mt-0.5">Due within next 30 days</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1628] border border-blue-500/30">
          <div className="text-xs text-blue-300 font-medium">High Priority (31-60d)</div>
          <div className="text-2xl font-bold font-mono text-blue-300 mt-1 tabular-nums">
            {summaries.highPriority}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Scheduled for next cycle</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Normal (&gt; 60d) / No Date</div>
          <div className="text-2xl font-bold font-mono text-slate-200 mt-1 tabular-nums">
            {summaries.normal} <span className="text-xs text-slate-400 font-normal">/ {summaries.notSet} unset</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">On track or planning</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search approved project, client, ID, city..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Priority Segmented Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs flex-wrap">
          {['ALL', 'Overdue', 'Urgent', 'High Priority', 'Normal', 'Deadline Not Set'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                priorityFilter === p
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-xl bg-[#0e1628] border border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white font-mono">{filteredAndSortedProjects.length}</strong> of{' '}
            <span className="font-mono">{approvedProjects.length}</span> approved projects (Sorted by earliest delivery deadline)
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Earliest Deadline First (Strict FIFO &ne; Delivery Priority)</span>
          </div>
        </div>

        {filteredAndSortedProjects.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No approved projects match the selected priority filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                  <th className="py-3 px-4 font-semibold">Project & Client</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">Approval Date</th>
                  <th className="py-3 px-4 font-semibold">Expected Delivery Date</th>
                  <th className="py-3 px-4 font-semibold">Delivery Urgency</th>
                  <th className="py-3 px-4 font-semibold">Project Status</th>
                  <th className="py-3 px-4 font-semibold">Assigned Rep</th>
                  <th className="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAndSortedProjects.map((project) => {
                  const delivery = calculateDeliveryStatus(project.expectedDeliveryDate);
                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                      onClick={() => onSelectLead(project)}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-slate-400">{project.id}</div>
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {project.company}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{project.contactName}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-200">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{project.city || 'Mysuru'}</span>
                        </div>
                        <span className="text-[10px] font-medium text-emerald-400">Serviceable</span>
                      </td>

                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                        {project.approvedAt ? new Date(project.approvedAt).toLocaleDateString() : 'Approved'}
                      </td>

                      <td className="py-3 px-4">
                        {project.expectedDeliveryDate ? (
                          <div className="font-mono font-medium text-white flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            <span>{project.expectedDeliveryDate}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Deadline not set</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded text-[11px] font-medium ${delivery.badgeClass}`}>
                          {delivery.displayText}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                          {project.deliveryStatus || 'In Progress'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300 font-medium truncate max-w-[140px]">
                        {project.assignedRep}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeadlineEditor(project);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{project.expectedDeliveryDate ? 'Edit Date' : 'Set Date'}</span>
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

      {/* Delivery Deadline Editor Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0e1628] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-blue-400" />
                <span>Set Delivery Deadline: {editingLead.company}</span>
              </h3>
              <button onClick={() => setEditingLead(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Expected Delivery Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Days remaining will be calculated dynamically from the current date.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Project Execution Status
                </label>
                <select
                  value={newDeliveryStatus}
                  onChange={(e) => setNewDeliveryStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Pending Kickoff">Pending Kickoff</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Track">On Track</option>
                  <option value="Review">Review</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              {newDeadline && (
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Calculated Priority Preview:</div>
                  <div className="mt-1">
                    <span className={`px-2.5 py-1 rounded text-xs font-semibold ${calculateDeliveryStatus(newDeadline).badgeClass}`}>
                      {calculateDeliveryStatus(newDeadline).displayText}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingLead(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDeadline}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Deadline'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
