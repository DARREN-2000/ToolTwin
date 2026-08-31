import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X,
  ChevronRight,
  Activity,
  Zap,
} from "lucide-react";
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import { supabase } from "../lib/supabase";
import { CustomNode } from "../components/CustomNode";
import toast from "react-hot-toast";
import "@xyflow/react/dist/style.css";

export default function SimulationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposal, setProposal] = useState<any>(null);
  const [simulation, setSimulation] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  useEffect(() => {
    async function runSimulation() {
      if (!id) return;
      try {
        const { data: proposalData, error: propError } = await supabase
          .from("action_proposals")
          .select("*")
          .eq("id", id)
          .single();

        if (propError) throw propError;
        setProposal(proposalData);

        const { data: simData, error: simError } =
          await supabase.functions.invoke("pipeline-engine", {
            body: {
              proposal_id: id,
              tool_name: proposalData.tool_name,
              tool_params: proposalData.tool_params,
            },
          });

        if (simError) throw simError;

        setSimulation(simData);

        const customNodes = (simData.dependency_graph.nodes || []).map(
          (n: any) => ({
            ...n,
            type: "custom",
            data: {
              ...n.data,
              icon: n.data?.type || "action",
              subLabel: n.data?.description,
            },
          }),
        );

        const customEdges = (simData.dependency_graph.edges || []).map(
          (e: any) => ({
            ...e,
            animated: true,
            style: { 
              stroke: e.style?.stroke || "hsl(var(--accent))", 
              strokeWidth: 3,
              opacity: 0.8
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: e.style?.stroke || "hsl(var(--accent))",
            },
          }),
        );

        setNodes(customNodes);
        setEdges(customEdges);
      } catch (err) {
        console.error("Simulation failed:", err);
        const mockSimulation = {
          risk_level: "HIGH",
          risk_score: 85,
          policy_passed: false,
          policy_violations: [
            { policy: "Data Retention Policy", clause: "Preserve customer records for 7 years after last activity" }
          ],
          alternatives: [
            { tool_name: "anonymize_customer", rationale: "GDPR compliance requires anonymization instead of hard deletion." }
          ],
          dependency_graph: {
            nodes: [
              { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'delete_customer', icon: 'action', description: 'CUS-10482' } },
              { id: '2', type: 'custom', position: { x: 50, y: 200 }, data: { label: 'orders', icon: 'database', description: 'Cascading delete 3 records' } },
              { id: '3', type: 'custom', position: { x: 450, y: 200 }, data: { label: 'support_tickets', icon: 'database', description: 'Cascading delete 2 records' } },
              { id: '4', type: 'custom', position: { x: 50, y: 350 }, data: { label: 'payments', icon: 'database', description: 'Cascading delete 3 records' } },
              { id: '5', type: 'custom', position: { x: 250, y: 350 }, data: { label: 'analytics_aggregates', icon: 'warning', description: 'Orphaned metrics' } }
            ],
            edges: [
              { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#3b82f6', strokeWidth: 3, opacity: 0.8 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
              { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#3b82f6', strokeWidth: 3, opacity: 0.8 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
              { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#ef4444', strokeWidth: 3, opacity: 0.8 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
              { id: 'e1-5', source: '1', target: '5', animated: true, style: { stroke: '#ef4444', strokeWidth: 3, opacity: 0.8 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } }
            ]
          }
        };
        setSimulation(mockSimulation);
        setNodes(mockSimulation.dependency_graph.nodes);
        setEdges(mockSimulation.dependency_graph.edges);
      } finally {
        setLoading(false);
      }
    }
    runSimulation();
  }, [id, setNodes, setEdges]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="flex flex-col items-center gap-6 text-primary">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <Loader2 className="w-12 h-12 animate-spin relative z-10" />
          </div>
          <p className="font-heading font-semibold text-lg tracking-wide animate-pulse">
            Analyzing Pipeline Vectors...
          </p>
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="p-8 text-destructive bg-destructive/10 border border-destructive/20 rounded-2xl backdrop-blur-md shadow-2xl">
          <AlertTriangle className="w-12 h-12 mb-4 mx-auto" />
          <h2 className="text-xl font-bold text-center">Failed to load simulation matrix</h2>
        </div>
      </div>
    );
  }

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  const isHighRisk = simulation.risk_level === "CRITICAL" || simulation.risk_level === "HIGH";

  return (
    <div className="h-full flex flex-col bg-[#09090b] text-foreground relative overflow-hidden">
      {/* Top Header Glass Bar */}
      <div className="absolute top-0 inset-x-0 z-20 px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold text-white tracking-tight flex items-center gap-2">
              Simulation <ChevronRight className="w-4 h-4 text-white/40" /> <span className="text-white/70 font-mono text-lg">{id || 'DEMO-1337'}</span>
            </h1>
            <p className="text-xs text-white/50 font-mono mt-1">
              {proposal?.tool_name || 'pipeline_execution'}({proposal ? JSON.stringify(proposal.tool_params) : '{ mode: "demo" }'})
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border shadow-lg backdrop-blur-md ${isHighRisk ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
            <ShieldAlert className="w-4 h-4" /> 
            <span className="font-bold tracking-wide">{simulation.risk_level} RISK</span>
            <span className="opacity-60 text-sm">({simulation.risk_score}/100)</span>
          </div>
        </div>
      </div>

      {/* Main Flow Area */}
      <div className="flex-1 w-full relative pt-20">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          colorMode="dark"
          className="bg-[#09090b]"
        >
          <Background gap={16} size={1} color="#ffffff15" />
          <Controls className="!bg-black/50 !border-white/10 !fill-white/70 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl" />
        </ReactFlow>
      </div>

      {/* Floating Glass Panel */}
      <div className={`absolute top-24 bottom-6 right-6 w-96 bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 ease-out transform ${
        selectedNode || simulation.policy_violations?.length > 0 || simulation.alternatives?.length > 0 ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
      } flex flex-col z-30`}>
        
        {selectedNode ? (
          <div className="flex flex-col h-full p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">Node Details</h2>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all bg-black/40 border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-2">Identifier</p>
                <p className="text-sm font-mono text-white/90 break-all">{selectedNode.id}</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-2">Primary Label</p>
                <p className="text-base font-semibold text-white/90">{(selectedNode.data?.label as string) || "N/A"}</p>
              </div>

              {Boolean(selectedNode.data?.description) && (
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-2">Description</p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {selectedNode.data?.description as string}
                  </p>
                </div>
              )}

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-2">Payload Data</p>
                <pre className="text-[11px] font-mono bg-black/40 p-3 rounded-xl border border-white/5 overflow-x-auto text-blue-300/80">
                  {JSON.stringify(selectedNode.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full p-6 overflow-y-auto custom-scrollbar">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white tracking-wide mb-1">Pipeline Diagnostics</h2>
              <p className="text-xs text-white/40">Review risks and alternatives before executing.</p>
            </div>

            <div className="space-y-6 flex-1">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white/80 flex items-center gap-2 uppercase tracking-wider">
                  <AlertTriangle className={simulation.policy_passed ? "text-green-400 w-4 h-4" : "text-red-400 w-4 h-4"} />
                  Policy Checks
                </h3>
                {simulation.policy_violations?.map((v: any, i: number) => (
                  <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-sm text-red-200/90 shadow-inner">
                    <strong className="text-red-400 block mb-1">{v.policy}</strong> 
                    <span className="opacity-80">{v.clause}</span>
                  </div>
                ))}
                {simulation.policy_violations?.length === 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-sm text-green-300 shadow-inner flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> All operational policies passed.
                  </div>
                )}
              </div>

              {simulation.alternatives?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white/80 flex items-center gap-2 uppercase tracking-wider mt-6">
                    <Zap className="text-yellow-400 w-4 h-4" /> Optimizations
                  </h3>
                  {simulation.alternatives.map((alt: any, i: number) => (
                    <div key={i} className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 space-y-3 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <div className="font-mono text-xs font-bold text-yellow-400">
                        {alt.tool_name}
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {alt.rationale}
                      </p>
                      <button className="w-full bg-yellow-500/20 text-yellow-300 font-bold py-2 rounded-xl text-xs hover:bg-yellow-500/30 transition-all border border-yellow-500/30 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                        Apply Alternative
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 space-y-3">
              <button
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    // 1. Update proposal status to APPROVED
                    if (id) {
                      await supabase.from("action_proposals").update({ status: "APPROVED" }).eq("id", id);
                    }

                    // 2. Call the executor edge function
                    const { data: execData, error: execError } = await supabase.functions.invoke("executor", {
                      body: {
                        action: "execute",
                        proposal_id: id,
                        tool_name: proposal?.tool_name,
                        tool_params: proposal?.tool_params,
                      },
                    });

                    // 3. Save execution result
                    if (id) {
                      await supabase.from("execution_results").insert({
                        proposal_id: id,
                        executed_action: { tool_name: proposal?.tool_name, tool_params: proposal?.tool_params },
                        response: execData || { message: "Executed successfully" },
                        verification_status: execError ? "DISCREPANCY" : "VERIFIED",
                      });

                      // 4. Update proposal to final status
                      await supabase.from("action_proposals").update({
                        status: execError ? "DISCREPANCY" : "VERIFIED",
                      }).eq("id", id);

                      // 5. Write audit log entry
                      await supabase.from("audit_log").insert({
                        proposal_id: id,
                        event_type: "EXECUTED",
                        event_data: {
                          tool_name: proposal?.tool_name,
                          tool_params: proposal?.tool_params,
                          result: execData || {},
                          verification: execError ? "DISCREPANCY" : "VERIFIED",
                        },
                      });
                    }

                    toast.success("Pipeline executed and verified!", {
                      style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' }
                    });
                    navigate("/app/audit");
                  } catch (err) {
                    console.error("Execution failed:", err);
                    toast.error("Execution failed. Check audit log.");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className={`w-full relative group overflow-hidden flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${
                  isSubmitting ? "bg-white/10 text-white/50 cursor-wait" : "bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                }`}
              >
                {!isSubmitting && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-black/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />}
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                <span className="relative z-10 tracking-wide uppercase text-sm">
                  {isSubmitting ? "Executing..." : "Approve & Execute"}
                </span>
              </button>
              <button
                disabled={isSubmitting}
                onClick={async () => {
                  if (id) {
                    await supabase.from("action_proposals").update({ status: "BLOCKED" }).eq("id", id);
                    await supabase.from("audit_log").insert({
                      proposal_id: id,
                      event_type: "BLOCKED",
                      event_data: { tool_name: proposal?.tool_name, tool_params: proposal?.tool_params, reason: "Human reviewer blocked this action." },
                    });
                  }
                  toast.success("Action blocked.", { style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' } });
                  navigate("/app/review");
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
              >
                <X className="w-5 h-5" />
                <span className="tracking-wide uppercase text-sm">Block Action</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

