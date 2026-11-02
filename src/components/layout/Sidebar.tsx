import React from 'react';
import {
  LayoutDashboard,
  Send,
  Users,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  Database,
  CalendarClock
} from 'lucide-react';

export type NavTab = 'dashboard' | 'enquiry' | 'leads' | 'approvals' | 'approved-projects' | 'logs' | 'tests';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingApprovalsCount: number;
  totalLeadsCount: number;
  approvedProjectsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingApprovalsCount,
  totalLeadsCount,
  approvedProjectsCount = 0,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'enquiry' as NavTab,
      label: 'Submit Enquiry',
      icon: Send,
      badge: 'Live AI',
    },
    {
      id: 'leads' as NavTab,
      label: 'Lead Management',
      icon: Users,
      badge: totalLeadsCount > 0 ? String(totalLeadsCount) : null,
    },
    {
      id: 'approvals' as NavTab,
      label: 'Manager Approvals',
      icon: ShieldCheck,
      badge: pendingApprovalsCount > 0 ? String(pendingApprovalsCount) : null,
      badgeColor: pendingApprovalsCount > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : undefined,
    },
    {
      id: 'approved-projects' as NavTab,
      label: 'Approved Projects',
      icon: CalendarClock,
      badge: approvedProjectsCount > 0 ? String(approvedProjectsCount) : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'logs' as NavTab,
      label: 'Workflow Logs',
      icon: Activity,
      badge: null,
    },
    {
      id: 'tests' as NavTab,
      label: 'Test Reports',
      icon: CheckCircle2,
      badge: 'Suite',
    },
  ];

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col shrink-0 min-h-screen text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>LeadPilot AI</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Enterprise Orchestration</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="px-3 py-4 flex-1 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
          Routing & Intelligence
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full tabular-nums ${
                    item.badgeColor || (isActive ? 'bg-blue-700/80 text-white' : 'bg-slate-800 text-slate-300')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Routing Engine Specs Box */}
      <div className="p-4 m-3 rounded-lg bg-[#0e1628] border border-slate-800/80 text-xs space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-medium text-[11px]">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>FIFO Queue & Delivery</span>
        </div>
        <div className="text-[11px] text-slate-400 leading-relaxed">
          Pending: <strong className="text-slate-200">Oldest First</strong>. Service Area: <strong className="text-emerald-400">Karnataka</strong> active.
        </div>
        <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Database className="w-3 h-3 text-emerald-400" />
            <span>Persistent Disk Storage</span>
          </span>
          <span className="text-emerald-400 font-mono">v2.5</span>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-blue-400">
            SC
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">Sarah Connor</div>
            <div className="text-[10px] text-slate-400 truncate">VP Sales & Revenue</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
