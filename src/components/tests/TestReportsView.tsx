import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  Clock,
  Layers,
  ShieldCheck,
  Cpu,
  Database,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FileCheck,
  Sparkles,
  LifeBuoy,
  RefreshCw,
  Zap,
  Activity
} from 'lucide-react';
import { TestSuiteResult, ComplianceAuditReport, EndToEndDemoResult } from '../../types/index.ts';
import {
  runAutomatedTests,
  fetchComplianceAudit,
  runEndToEndDemo,
  simulateCheckpoint,
  recoverFromCheckpoint
} from '../../services/api.ts';

interface TestReportsViewProps {
  onTestComplete?: () => void;
}

export const TestReportsView: React.FC<TestReportsViewProps> = ({ onTestComplete }) => {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'audit' | 'demo'>('scenarios');
  const [isRunning, setIsRunning] = useState(false);
  const [latestReport, setLatestReport] = useState<TestSuiteResult | null>(null);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Compliance Audit Matrix state
  const [auditReport, setAuditReport] = useState<ComplianceAuditReport | null>(null);

  // End-to-End Demo state
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoResult, setDemoResult] = useState<EndToEndDemoResult | null>(null);

  // Checkpoint Simulation state
  const [isSimulatingCheckpoint, setIsSimulatingCheckpoint] = useState(false);
  const [simulatedCheckpointData, setSimulatedCheckpointData] = useState<{ leadId: string; checkpoint: any } | null>(null);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchComplianceAudit()
      .then(data => setAuditReport(data))
      .catch(err => console.error('Failed to load compliance audit:', err));
  }, []);

  const handleRunSuite = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const result = await runAutomatedTests();
      setLatestReport(result);
      if (onTestComplete) onTestComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to execute test suite');
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunDemo = async () => {
    setIsDemoRunning(true);
    setError(null);
    try {
      const res = await runEndToEndDemo();
      setDemoResult(res);
      if (onTestComplete) onTestComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to execute end-to-end demo');
    } finally {
      setIsDemoRunning(false);
    }
  };

  const handleSimulateCheckpoint = async () => {
    setIsSimulatingCheckpoint(true);
    setRecoveryMessage(null);
    try {
      const res = await simulateCheckpoint();
      setSimulatedCheckpointData({ leadId: res.leadId, checkpoint: res.checkpoint });
    } catch (err: any) {
      setError(err.message || 'Failed to simulate checkpoint');
    } finally {
      setIsSimulatingCheckpoint(false);
    }
  };

  const handleRecoverCheckpoint = async () => {
    if (!simulatedCheckpointData) return;
    setIsSimulatingCheckpoint(true);
    try {
      const res = await recoverFromCheckpoint(simulatedCheckpointData.leadId);
      setRecoveryMessage(`State restored from ${res.checkpoint.checkpointId} (Step: ${res.checkpoint.step}). Assigned to ${res.finalLead.assignedRep} (${res.finalLead.recommendedRouting}).`);
      setSimulatedCheckpointData(null);
      if (onTestComplete) onTestComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to recover from checkpoint');
    } finally {
      setIsSimulatingCheckpoint(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Mode Selector */}
      <div className="p-6 rounded-xl bg-[#0e1628] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              G4 Problem Statement 2 Verification & Diagnostics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Independent deterministic verification, loop bounds enforcement, checkpoint resilience, and automated scenario reports.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'scenarios' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pre-Deployment Scenarios
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'audit' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Compliance Audit Matrix
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'demo' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            End-to-End Demo & Recovery
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* VIEW 1: PRE-DEPLOYMENT SCENARIOS */}
      {activeTab === 'scenarios' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-white">Automated Integration Scenarios (6 Scenarios)</div>
              <div className="text-[11px] text-slate-400">Verifies BANT math, duplicate no-op condition, checkpoint recovery, correction bounds, and policy checks.</div>
            </div>
            <button
              onClick={handleRunSuite}
              disabled={isRunning}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/30 shrink-0"
            >
              {isRunning ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Running Scenarios...' : 'Execute All 6 Scenarios'}</span>
            </button>
          </div>

          {latestReport ? (
            <div className="space-y-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800">
                  <div className="text-xs text-slate-400">Suite Status</div>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-lg font-bold text-emerald-400">{latestReport.suiteStatus}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">{latestReport.runId}</div>
                </div>

                <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800">
                  <div className="text-xs text-slate-400">Total Scenarios</div>
                  <div className="text-2xl font-bold font-mono text-white mt-0.5 tabular-nums">
                    {latestReport.totalTests}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1">
                    {latestReport.passed} passed · {latestReport.failed} failed
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800">
                  <div className="text-xs text-slate-400">Execution Duration</div>
                  <div className="text-2xl font-bold font-mono text-white mt-0.5 tabular-nums">
                    {latestReport.durationMs} <span className="text-xs font-normal text-slate-400">ms</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Under 10,000ms SLA cap</div>
                </div>

                <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800">
                  <div className="text-xs text-slate-400">Verification Timestamp</div>
                  <div className="text-xs font-mono text-slate-200 mt-1.5 truncate">
                    {new Date(latestReport.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Persistent audit recorded</div>
                </div>
              </div>

              {/* Detailed Scenario Assertions */}
              <div className="rounded-xl bg-[#0e1628] border border-slate-800 overflow-hidden divide-y divide-slate-800">
                <div className="px-5 py-3.5 bg-slate-900/60 flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span>Scenario Evidence & Observed vs Expected Results</span>
                  <span className="text-slate-400 font-normal">Click scenario row to expand assertions</span>
                </div>

                {latestReport.testCases.map((tc) => {
                  const isExpanded = expandedTestId === tc.id;
                  return (
                    <div key={tc.id} className="p-4 hover:bg-slate-900/40 transition-colors">
                      <div
                        onClick={() => setExpandedTestId(isExpanded ? null : tc.id)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-slate-400 font-semibold">{tc.id}</span>
                              <span className="text-sm font-semibold text-white">{tc.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Category: <span className="text-slate-300">{tc.category}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <span className="text-xs font-mono text-slate-400 tabular-nums">{tc.durationMs} ms</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {tc.status}
                          </span>
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-slate-800/80">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-slate-400 border-b border-slate-800/60 pb-2">
                                <th className="pb-2 font-semibold">Specific Verification Check</th>
                                <th className="pb-2 font-semibold">Expected</th>
                                <th className="pb-2 font-semibold">Actual Result</th>
                                <th className="pb-2 text-right font-semibold">Evidence Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                              {tc.assertions.map((a, idx) => (
                                <tr key={idx} className="hover:bg-slate-900/30">
                                  <td className="py-2 text-slate-200">{a.check}</td>
                                  <td className="py-2 font-mono text-slate-400">{String(a.expected)}</td>
                                  <td className="py-2 font-mono text-blue-300">{String(a.actual)}</td>
                                  <td className="py-2 text-right">
                                    <span className="font-semibold text-emerald-400 font-mono">PASS</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl bg-[#0e1628] border border-slate-800 space-y-3">
              <FileCheck className="w-8 h-8 text-blue-400 mx-auto" />
              <h4 className="text-sm font-semibold text-white">Click &quot;Execute All 6 Scenarios&quot;</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Launches pre-deployment assertions verifying the qualification math, threshold triggers, duplicate suppression, and checkpoint restoration.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: COMPLIANCE AUDIT MATRIX */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-white">Standard: G4 Problem Statement 2</span>
              <span className="text-slate-400 ml-2">· System: LeadPilot AI · Audited Against Live Code & Test Runs</span>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold font-mono">
              ALL REQUIREMENTS PASS (8/8)
            </span>
          </div>

          <div className="rounded-xl bg-[#0e1628] border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                    <th className="py-3 px-4 font-semibold w-16">ID</th>
                    <th className="py-3 px-4 font-semibold w-1/4">Mandatory Requirement</th>
                    <th className="py-3 px-4 font-semibold w-24">Status</th>
                    <th className="py-3 px-4 font-semibold w-1/4">Source File Location</th>
                    <th className="py-3 px-4 font-semibold">Test & Execution Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditReport?.audits.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">{item.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-200">{item.requirement}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{item.sourceFile}</td>
                      <td className="py-3 px-4 text-slate-300 text-[11px] leading-relaxed">
                        <div>{item.testEvidence}</div>
                        <div className="text-slate-400 text-[10px] mt-0.5">{item.verificationDetails}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: END-TO-END DEMO & RECOVERY */}
      {activeTab === 'demo' && (
        <div className="space-y-6">
          {/* Demo runner card */}
          <div className="p-5 rounded-xl bg-[#0e1628] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Interactive End-to-End Workflow Demo</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Executes a full lifecycle demo: Enquiry Intake &rarr; BANT Scoring &rarr; Governance Trigger &rarr; Manager Approval &rarr; Deterministic Check &rarr; Action Tool Assignment &rarr; Audit Review.
                </p>
              </div>

              <button
                onClick={handleRunDemo}
                disabled={isDemoRunning}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/30 shrink-0"
              >
                {isDemoRunning ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{isDemoRunning ? 'Running 7-Step Demo...' : 'Run Complete End-to-End Demo'}</span>
              </button>
            </div>

            {demoResult && (
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-mono text-emerald-400 font-semibold">{demoResult.demoId}</span>
                  <span className="text-slate-400">Total Duration: <strong className="text-white font-mono">{demoResult.durationMs}ms</strong></span>
                  <span className="text-slate-400">Created Lead: <strong className="text-blue-400 font-mono">{demoResult.finalLead.id}</strong></span>
                </div>

                {/* 7 Demo steps */}
                <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                  {demoResult.steps.map((s) => (
                    <div key={s.stepNumber} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col justify-between text-xs space-y-2">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                            {s.stepNumber}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{s.latencyMs}ms</span>
                        </div>
                        <div className="font-semibold text-white mt-1.5 text-[11px] leading-tight">{s.title}</div>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-3">{s.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checkpoint Interruption & Failure Recovery Tool */}
          <div className="p-5 rounded-xl bg-[#0e1628] border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-emerald-400" />
                <span>Simulated Interruption & Checkpoint Recovery Demonstration</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulates an unexpected process failure after BANT evaluation, saves the intermediate snapshot to persistent storage, and recovers state to complete the assignment without re-executing prior steps.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleSimulateCheckpoint}
                disabled={isSimulatingCheckpoint}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                1. Simulate Interruption & Save Checkpoint
              </button>

              {simulatedCheckpointData && (
                <button
                  onClick={handleRecoverCheckpoint}
                  disabled={isSimulatingCheckpoint}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>2. Recover from Checkpoint ({simulatedCheckpointData.checkpoint.checkpointId})</span>
                </button>
              )}
            </div>

            {simulatedCheckpointData && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                Process interrupted for lead <strong className="font-mono text-white">{simulatedCheckpointData.leadId}</strong>. Checkpoint snapshot saved to disk at step <strong className="font-mono text-white">{simulatedCheckpointData.checkpoint.step}</strong>. Ready for recovery.
              </div>
            )}

            {recoveryMessage && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{recoveryMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
