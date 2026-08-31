import React, { useState, useEffect } from 'react';
import { Activity, Zap, ShieldAlert, CheckCircle2, XCircle, ScrollText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OnboardingModal from '../components/OnboardingModal';
import TerminalSimulator from '../components/TerminalSimulator';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [showTour, setShowTour] = useState(false);
  const [stats, setStats] = useState({
    totalProposals: 0,
    pending: 0,
    approved: 0,
    blocked: 0,
    toolCount: 0,
  });
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('tour_completed')) {
      setShowTour(true);
    }

    async function fetchStats() {
      const [proposalsRes, toolsRes, auditRes] = await Promise.all([
        supabase.from("action_proposals").select("status"),
        supabase.from("tools").select("id"),
        supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(5),
      ]);

      const proposals = proposalsRes.data || [];
      const pending = proposals.filter(p => ["PROPOSED", "SIMULATED", "PENDING_REVIEW"].includes(p.status)).length;
      const approved = proposals.filter(p => ["APPROVED", "EXECUTED", "VERIFIED"].includes(p.status)).length;
      const blocked = proposals.filter(p => p.status === "BLOCKED").length;

      setStats({
        totalProposals: proposals.length,
        pending,
        approved,
        blocked,
        toolCount: toolsRes.data?.length || 0,
      });

      setRecentActions(auditRes.data || []);
    }
    fetchStats();
  }, []);

  const handleCloseTour = () => {
    localStorage.setItem('tour_completed', 'true');
    setShowTour(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      {showTour && <OnboardingModal onClose={handleCloseTour} />}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end pb-6 border-b border-white/10 gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">ToolTwin Overview</h1>
            <p className="text-gray-400 mt-1">Your AI safety dashboard. Here's what's happening.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate("/app/audit")} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-md transition-all text-sm font-medium shadow-sm">
              View Audit Log
            </button>
            <button onClick={() => navigate("/app/console")} className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-md transition-all text-sm font-medium shadow-sm">
              New Proposal
            </button>
          </div>
        </header>

        {/* INTERACTIVE DEMO SPLIT SCREEN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="h-[400px]">
            <TerminalSimulator />
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-xl p-8 flex flex-col justify-center items-start shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-12 -translate-y-12 pointer-events-none" />
             <h2 className="text-2xl font-bold text-white mb-4">How it works behind the scenes</h2>
             <p className="text-gray-400 leading-relaxed mb-6">
               When you click <strong>Start Python Agent</strong> on the left, you simulate a real-world developer's environment where an AI attempts to execute a dangerous AWS command.
               <br/><br/>
               Notice how the AI agent is <strong>physically paused</strong> by the SDK. It cannot continue until you—the human operator—navigate to the <button onClick={() => navigate("/app/console")} className="text-primary hover:underline font-semibold">Action Console</button> or Review Queue to approve the request.
             </p>
             <button onClick={() => navigate("/app/console")} className="bg-white text-black px-5 py-2.5 rounded-md font-medium hover:bg-gray-200 transition-colors">
               Try the Action Console →
             </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Total Proposals" 
            value={stats.totalProposals.toString()} 
            subtitle="All time"
            icon={<Activity className="w-5 h-5 text-blue-400" />} 
            color="blue"
          />
          <MetricCard 
            title="Pending Review" 
            value={stats.pending.toString()} 
            subtitle="Awaiting human decision"
            icon={<ShieldAlert className="w-5 h-5 text-yellow-400" />} 
            color="yellow"
          />
          <MetricCard 
            title="Approved & Executed" 
            value={stats.approved.toString()} 
            subtitle="Successfully completed"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} 
            color="emerald"
          />
          <MetricCard 
            title="Blocked" 
            value={stats.blocked.toString()} 
            subtitle="Prevented by human review"
            icon={<XCircle className="w-5 h-5 text-red-400" />} 
            color="red"
          />
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-medium text-white">Connected Tools</h2>
            </div>
            <div className="text-4xl font-bold text-white mb-2">{stats.toolCount}</div>
            <p className="text-sm text-gray-400">Tools registered in your catalog. Go to the <button onClick={() => navigate("/app/tools")} className="text-primary hover:underline">Integration Marketplace</button> to add more.</p>
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <ScrollText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-medium text-white">Recent Activity</h2>
            </div>
            {recentActions.length === 0 ? (
              <p className="text-sm text-gray-500">No activity yet. Propose an action from the <button onClick={() => navigate("/app/console")} className="text-primary hover:underline">Action Console</button>.</p>
            ) : (
              <div className="space-y-3">
                {recentActions.slice(0, 4).map((action) => (
                  <div key={action.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-blue-400">{(action.event_data as any)?.tool_name || "action"}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      action.event_type === "EXECUTED" ? "bg-emerald-500/10 text-emerald-400" :
                      action.event_type === "BLOCKED" ? "bg-red-500/10 text-red-400" :
                      "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {action.event_type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500/10",
    yellow: "from-yellow-500/10",
    emerald: "from-emerald-500/10",
    red: "from-red-500/10",
  };

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-6 flex flex-col justify-between hover:bg-[#161616] transition-colors shadow-sm relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorMap[color] || "from-white/5"} to-transparent blur-3xl rounded-full translate-x-12 -translate-y-12 pointer-events-none`} />
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <div className="p-2 bg-white/[0.03] rounded-lg border border-white/5">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-semibold tracking-tight text-white mb-1">{value}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}
