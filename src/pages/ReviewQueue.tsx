import { useState, useEffect } from "react";
import { ShieldAlert, ArrowRight, Loader2, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { formatDistanceToNow } from "date-fns";

interface Proposal {
  id: string;
  tool_name: string;
  tool_params: Record<string, unknown>;
  status: string;
  llm_reasoning: string | null;
  created_at: string;
}

export default function ReviewQueue() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProposals() {
      const { data, error } = await supabase
        .from("action_proposals")
        .select("*")
        .in("status", ["PROPOSED", "SIMULATED", "PENDING_REVIEW", "APPROVED"])
        .order("created_at", { ascending: false });

      if (!error && data) setProposals(data as Proposal[]);
      setLoading(false);
    }
    fetchProposals();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("proposals-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "action_proposals" }, () => {
        fetchProposals();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Review Queue
        </h1>
        <p className="text-foreground/60 mt-1">
          Actions awaiting human approval. {proposals.length > 0 && <span className="text-primary font-bold">{proposals.length} pending</span>}
        </p>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-muted/30 border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Inbox className="w-12 h-12 text-foreground/30 mb-4" />
          <h3 className="text-lg font-bold text-foreground/70 mb-1">No pending actions</h3>
          <p className="text-sm text-foreground/50">When an AI agent proposes an action, it will appear here for your review.</p>
        </div>
      ) : (
        <div className="bg-muted/30 border border-border rounded-xl divide-y divide-border overflow-hidden">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-bold text-lg text-foreground font-mono break-all">
                    {proposal.tool_name}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shrink-0 ${
                    proposal.status === "PROPOSED" || proposal.status === "PENDING_REVIEW"
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      : proposal.status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}>
                    <ShieldAlert className="w-3 h-3" />
                    {proposal.status}
                  </span>
                </div>
                <p className="text-sm text-foreground/70 break-all font-mono">
                  Params: {JSON.stringify(proposal.tool_params)}
                </p>
                {proposal.llm_reasoning && (
                  <p className="text-xs text-foreground/50 mt-1 italic truncate max-w-lg">
                    {proposal.llm_reasoning}
                  </p>
                )}
                <p className="text-xs text-foreground/50 mt-2">
                  Proposed {formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}
                </p>
              </div>

              <button
                onClick={() => navigate(`/app/simulation/${proposal.id}`)}
                className="w-full md:w-auto whitespace-nowrap flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Review Simulation <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
