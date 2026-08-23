import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { ShieldAlert, CheckCircle, AlertTriangle, Loader2, X, Info } from "lucide-react";
import { ReactFlow, Background, Controls, MiniMap, Node, Edge, useNodesState, useEdgesState, MarkerType } from "@xyflow/react";
import { supabase } from "../lib/supabase";
import { CustomNode } from "../components/CustomNode";
import toast from "react-hot-toast";
import '@xyflow/react/dist/style.css';

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
        // 1. Fetch proposal
        const { data: proposalData, error: propError } = await supabase
          .from('action_proposals')
          .select('*')
          .eq('id', id)
          .single();
          
        if (propError) throw propError;
        setProposal(proposalData);

        // 2. Invoke pipeline engine
        const { data: simData, error: simError } = await supabase.functions.invoke('pipeline-engine', {
          body: { proposal_id: id, tool_name: proposalData.tool_name, tool_params: proposalData.tool_params }
        });

        if (simError) throw simError;
        
        setSimulation(simData);

        // Transform nodes to use custom type
        const customNodes = (simData.dependency_graph.nodes || []).map((n: any) => ({
          ...n,
          type: 'custom',
          data: {
             ...n.data,
             icon: n.data?.type || 'action',
             subLabel: n.data?.description
          }
        }));

        // Enhance edges
        const customEdges = (simData.dependency_graph.edges || []).map((e: any) => ({
          ...e,
          animated: true,
          style: { stroke: 'hsl(var(--accent))', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--accent))',
          },
        }));

        setNodes(customNodes);
        setEdges(customEdges);
        
      } catch (err) {
        console.error("Simulation failed:", err);
      } finally {
        setLoading(false);
      }
    }
    runSimulation();
  }, [id, setNodes, setEdges]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-primary">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="font-heading font-medium animate-pulse">Running Counterfactual Simulation...</p>
        </div>
      </div>
    );
  }

  if (!simulation || !proposal) {
    return <div className="p-8 text-destructive">Failed to load simulation data.</div>;
  }

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };
  
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/20">
        <div>
          <h1 className="text-xl font-heading font-bold text-foreground break-all">Simulation Result: {id}</h1>
          <p className="text-sm text-foreground/50">{proposal.tool_name}({JSON.stringify(proposal.tool_params)})</p>
        </div>
        <div className="flex gap-2">
           <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${simulation.risk_level === 'CRITICAL' ? 'badge-risk-critical' : simulation.risk_level === 'HIGH' ? 'badge-risk-high' : simulation.risk_level === 'MEDIUM' ? 'badge-risk-medium' : 'badge-risk-low'}`}>
             <ShieldAlert className="w-3 h-3" /> {simulation.risk_level} RISK ({simulation.risk_score}/100)
           </span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Graph Area */}
        <div className={`flex-1 relative transition-all duration-300 border-b lg:border-b-0 lg:border-r border-border ${selectedNode ? 'lg:mr-96' : ''}`}>
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
          >
            <Background gap={12} size={1} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Dynamic Split Panel */}
        <div 
          className={`absolute lg:static inset-y-0 right-0 w-full lg:w-96 bg-muted/20 border-l border-border transition-transform duration-300 transform ${
            selectedNode ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          } flex flex-col`}
        >
          {selectedNode ? (
            <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm z-10 p-4 md:p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" /> Node Metadata
                </h2>
                <button 
                  onClick={() => setSelectedNode(null)} 
                  className="p-1.5 rounded-md hover:bg-muted text-foreground/60 hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-xs text-foreground/50 uppercase font-semibold mb-1">Node ID</p>
                  <p className="text-sm font-mono text-foreground break-all">{selectedNode.id}</p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-xs text-foreground/50 uppercase font-semibold mb-1">Label</p>
                  <p className="text-sm font-medium text-foreground">{selectedNode.data?.label as string || 'N/A'}</p>
                </div>

                {selectedNode.data?.description && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-xs text-foreground/50 uppercase font-semibold mb-1">Description</p>
                    <p className="text-sm text-foreground/80">{selectedNode.data?.description as string}</p>
                  </div>
                )}
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-xs text-foreground/50 uppercase font-semibold mb-1">Raw Data</p>
                  <pre className="text-xs font-mono bg-background/50 p-3 rounded border border-border overflow-x-auto text-foreground/70">
                    {JSON.stringify(selectedNode.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full p-4 md:p-6 overflow-y-auto space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className={simulation.policy_passed ? "text-accent w-5 h-5" : "text-destructive w-5 h-5"} /> 
                  Policy Violations ({simulation.policy_violations?.length || 0})
                </h3>
                {simulation.policy_violations?.map((v: any, i: number) => (
                  <div key={i} className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                    <strong>{v.policy}:</strong> {v.clause}
                  </div>
                ))}
                {simulation.policy_violations?.length === 0 && (
                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-sm text-accent">
                    All policies passed.
                  </div>
                )}
              </div>

              {simulation.alternatives?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle className="text-accent w-5 h-5" /> Recommended Alternative
                  </h3>
                  {simulation.alternatives.map((alt: any, i: number) => (
                    <div key={i} className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-3">
                      <div className="font-mono text-xs text-accent">{alt.tool_name}</div>
                      <p className="text-xs text-foreground/70">{alt.rationale}</p>
                      <button className="w-full bg-accent/20 text-accent font-medium py-1.5 rounded-md text-sm hover:bg-accent/30 transition-colors">
                        Select Alternative
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-6 border-t border-border mt-auto">
                 <button 
                    disabled={isSubmitting}
                    onClick={async () => {
                      setIsSubmitting(true);
                      // Simulate an async submission
                      await new Promise(r => setTimeout(r, 1000));
                      toast.success("Submitted for review!");
                      setIsSubmitting(false);
                      navigate('/review');
                    }}
                    className="w-full bg-primary text-on-primary flex items-center justify-center gap-2 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                   {isSubmitting ? "SUBMITTING..." : "SUBMIT FOR REVIEW"}
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
