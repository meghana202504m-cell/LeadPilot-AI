import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar.tsx';
import { TopHeader } from './components/layout/TopHeader.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { SubmitEnquiryView } from './components/enquiry/SubmitEnquiryView.tsx';
import { LeadManagementView } from './components/leads/LeadManagementView.tsx';
import { ManagerApprovalsView } from './components/approvals/ManagerApprovalsView.tsx';
import { WorkflowLogsView } from './components/logs/WorkflowLogsView.tsx';
import { TestReportsView } from './components/tests/TestReportsView.tsx';
import { ApprovedProjectsView } from './components/projects/ApprovedProjectsView.tsx';
import { LeadDetailModal } from './components/leads/LeadDetailModal.tsx';
import { Lead, ManagerApproval, WorkflowLog, DashboardStats } from './types/index.ts';
import { fetchStats, fetchLeads, fetchApprovals, fetchLogs, resetDatabase } from './services/api.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [approvals, setApprovals] = useState<ManagerApproval[]>([]);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [logFilterLeadId, setLogFilterLeadId] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load all data from persistent backend
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [statsData, leadsData, approvalsData, logsData] = await Promise.all([
        fetchStats(),
        fetchLeads(),
        fetchApprovals(),
        fetchLogs(),
      ]);
      setStats(statsData);
      setLeads(leadsData);
      setApprovals(approvalsData);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load LeadPilot data:', err);
    } finally {
      setIsRefreshing(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle database reset
  const handleResetSeed = async () => {
    if (window.confirm('Reset database to clean enterprise benchmark sample leads? Any newly created leads will be restored.')) {
      try {
        await resetDatabase();
        await loadData();
      } catch (err) {
        console.error('Failed to reset database:', err);
      }
    }
  };

  // Lead Enquiry Submission callback
  const handleEnquirySuccess = (newLead: Lead) => {
    loadData();
  };

  // Approval Processed callback
  const handleApprovalProcessed = (updatedApproval: ManagerApproval, updatedLead: Lead | null) => {
    setApprovals(prev => prev.map(a => a.id === updatedApproval.id ? updatedApproval : a));
    if (updatedLead) {
      setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    }
    loadData();
  };

  // View logs for specific lead
  const handleViewLogsForLead = (leadId: string) => {
    setLogFilterLeadId(leadId);
    setCurrentTab('logs');
  };

  const handleInspectLeadFromId = (leadId: string) => {
    const found = leads.find(l => l.id === leadId);
    if (found) {
      setSelectedLead(found);
    }
  };

  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;
  const approvedProjectsCount = leads.filter(l => l.approvalStatus === 'approved').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'logs') setLogFilterLeadId(undefined);
          setCurrentTab(tab);
        }}
        pendingApprovalsCount={pendingApprovalsCount}
        totalLeadsCount={leads.length}
        approvedProjectsCount={approvedProjectsCount}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <TopHeader
          currentTab={currentTab}
          onRefresh={loadData}
          onResetSeed={handleResetSeed}
          onNewEnquiry={() => setCurrentTab('enquiry')}
          isRefreshing={isRefreshing}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#070b14]">
          {initialLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Connecting to LeadPilot AI Backend...</p>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  recentLeads={leads}
                  pendingApprovals={approvals.filter(a => a.status === 'pending')}
                  onNavigate={setCurrentTab}
                  onSelectLead={setSelectedLead}
                />
              )}

              {currentTab === 'enquiry' && (
                <SubmitEnquiryView
                  onSuccess={handleEnquirySuccess}
                  onNavigateToLead={(lead) => {
                    setSelectedLead(lead);
                    setCurrentTab('leads');
                  }}
                />
              )}

              {currentTab === 'leads' && (
                <LeadManagementView
                  leads={leads}
                  onSelectLead={setSelectedLead}
                  onNewEnquiry={() => setCurrentTab('enquiry')}
                />
              )}

              {currentTab === 'approvals' && (
                <ManagerApprovalsView
                  approvals={approvals}
                  onApprovalProcessed={handleApprovalProcessed}
                  onInspectLead={handleInspectLeadFromId}
                />
              )}

              {currentTab === 'approved-projects' && (
                <ApprovedProjectsView
                  leads={leads}
                  onSelectLead={setSelectedLead}
                  onRefresh={loadData}
                />
              )}

              {currentTab === 'logs' && (
                <WorkflowLogsView
                  logs={logs}
                  filterLeadId={logFilterLeadId}
                  onClearLeadFilter={() => setLogFilterLeadId(undefined)}
                  onInspectLead={handleInspectLeadFromId}
                />
              )}

              {currentTab === 'tests' && (
                <TestReportsView
                  onTestComplete={loadData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Lead Detail & Inspection Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onLeadUpdated={(updated) => {
            setSelectedLead(updated);
            setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
            loadData();
          }}
          onViewLogsForLead={handleViewLogsForLead}
        />
      )}
    </div>
  );
}
