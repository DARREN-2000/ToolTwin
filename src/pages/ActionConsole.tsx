import { useState } from "react";
import { Zap, Play, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ActionConsole() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposal, setProposal] = useState<any>(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Fetch the available tools to send to the LLM
      const { data: tools } = await supabase.from('tools').select('*');
      
      const { data, error } = await supabase.functions.invoke('agent-proxy', {
        body: { 
          actionContext: prompt,
          tools: tools?.map(t => ({
            type: "function",
            function: {
              name: t.name,
              description: t.description,
              parameters: t.parameters
            }
          }))
        }
      });

      if (error) throw error;
      
      // Parse the OpenRouter tool call response
      const toolCall = data.choices[0].message.tool_calls[0].function;
      setProposal({
        tool_name: toolCall.name,
        tool_params: JSON.parse(toolCall.arguments),
        llm_reasoning: data.choices[0].message.content || "Analyzed request and selected appropriate action."
      });
    } catch (err) {
      console.error("Failed to generate proposal:", err);
      toast.error("Failed to generate proposal.");
    } finally {
      setIsGenerating(false);
    }
  };

  const [isSimulating, setIsSimulating] = useState(false);
  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      // 1. Create a proposal record in the database
      const { data: proposalData, error: insertError } = await supabase
        .from('action_proposals')
        .insert({
          tool_name: proposal.tool_name,
          tool_params: proposal.tool_params,
          llm_reasoning: proposal.llm_reasoning,
          status: 'PROPOSED'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success("Proposal created successfully!");
      // 2. Navigate to simulation detail page which will trigger the pipeline-engine
      navigate(`/simulation/${proposalData.id}`);
    } catch (err) {
      console.error("Failed to save proposal:", err);
      toast.error("Failed to save proposal.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Zap className="w-6 h-6 text-accent" />
        <h1 className="text-2xl font-heading font-bold text-foreground">Action Console</h1>
      </div>

      <div className="bg-muted/30 border border-border rounded-xl p-6 space-y-4">
        <label className="text-sm font-medium text-foreground/70">What action should the AI propose?</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Delete customer Jane Morrison (CUS-10482)"
          className="w-full h-32 bg-background border border-border rounded-lg p-4 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
        />
        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Generate Proposal
          </button>
        </div>
      </div>

      {proposal && (
        <div className="bg-background border border-border rounded-xl p-6 space-y-4 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-lg font-bold text-foreground">Proposed Action</h2>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm text-blue-400">
            {proposal.tool_name}({JSON.stringify(proposal.tool_params)})
          </div>
          <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
            <p className="text-sm font-medium text-foreground/70 mb-1">AI Reasoning:</p>
            <p className="text-foreground text-sm italic">"{proposal.llm_reasoning}"</p>
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="flex items-center gap-2 bg-accent text-on-primary px-6 py-2.5 rounded-lg font-bold hover:opacity-90 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isSimulating ? "SIMULATING..." : "SIMULATE"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
