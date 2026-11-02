import React from 'react';
import { NavTab } from './Sidebar.tsx';
import { RefreshCw, RotateCcw, Plus, Sparkles } from 'lucide-react';

interface TopHeaderProps {
  currentTab: NavTab;
  onRefresh: () => void;
  onResetSeed: () => void;
  onNewEnquiry: () => void;
  isRefreshing: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onRefresh,
  onResetSeed,
  onNewEnquiry,
  isRefreshing,
}) => {
  const tabTitles: Record<NavTab, { title: string; category: string }> = {
    dashboard: { title: 'Executive Overview', category: 'Analytics & Pipeline' },
    enquiry: { title: 'Submit Lead Enquiry', category: 'Inbound Intake' },
    leads: { title: 'Lead Management & Routing', category: 'Pipeline Records' },
    approvals: { title: 'Manager Approvals (FIFO)', category: 'Governance & Escalations' },
    'approved-projects': { title: 'Approved Projects & Delivery Priority', category: 'Operations & Execution' },
    logs: { title: 'Workflow Audit Trail', category: 'Execution Logs' },
    tests: { title: 'Automated Test Suite', category: 'System Diagnostics' },
  };

  const currentInfo = tabTitles[currentTab];

  return (
    <header className="h-16 px-6 bg-[#0a0f1d] border-b border-slate-800/80 flex items-center justify-between gap-8 shrink-0">
      {/* Zone 1: Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
        <span className="text-slate-300 font-medium">LeadPilot AI</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-400">{currentInfo.category}</span>
        <span className="text-slate-600">/</span>
        <span className="text-white font-semibold truncate">{currentInfo.title}</span>
      </div>

      {/* Zone 2: Fast Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onResetSeed}
          title="Reset database to sample benchmark records"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors border border-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Sample Data</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors border border-slate-800"
          title="Refresh live data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
        </button>

        {currentTab !== 'enquiry' && (
          <button
            onClick={onNewEnquiry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm shadow-blue-600/30 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Enquiry</span>
          </button>
        )}
      </div>
    </header>
  );
};
