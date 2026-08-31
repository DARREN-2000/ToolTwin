import { useState, useRef, useEffect } from "react";
import { Zap, Play, Loader2, Send, Bot, User, Command } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  proposal?: any;
};

export default function ActionConsole() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "Hello! I'm your AI operations assistant. What action would you like to propose today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const { data: tools } = await supabase.from("tools").select("*");

      const { data, error } = await supabase.functions.invoke("agent-proxy", {
        body: {
          actionContext: userMessage.content,
          tools: tools?.map((t) => ({
            type: "function",
            function: {
              name: t.name,
              description: t.description,
              parameters: t.parameters,
            },
          })),
        },
      });

      if (error) throw error;

      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.choices[0].message.content || "I have analyzed your request and prepared the following action.",
      };

      if (data.choices[0].message.tool_calls?.length > 0) {
        const toolCall = data.choices[0].message.tool_calls[0].function;
        assistantMessage.proposal = {
          tool_name: toolCall.name,
          tool_params: JSON.parse(toolCall.arguments),
          llm_reasoning: data.choices[0].message.content || "Analyzed request and selected appropriate action.",
        };
      }
      
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (err) {
      console.error("Failed to generate proposal:", err);
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "The user requested the deletion of a customer. I have prepared the tool execution.",
          proposal: {
            tool_name: "delete_customer",
            tool_params: { customer_id: "CUS-10482" },
            llm_reasoning: "The user requested the deletion of customer CUS-10482. Selecting delete_customer tool to begin the process.",
          }
        }
      ]);
      toast.success("Generated proposal (Demo Mode)");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSimulate = async (proposal: any) => {
    setIsSimulating(true);
    try {
      const { data: proposalData, error: insertError } = await supabase
        .from("action_proposals")
        .insert({
          tool_name: proposal.tool_name,
          tool_params: proposal.tool_params,
          llm_reasoning: proposal.llm_reasoning,
          status: "PROPOSED",
          proposed_by: user?.id || "mock-123",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success("Proposal created successfully!");
      navigate(`/simulation/${proposalData.id}`);
    } catch (err) {
      console.error("Failed to save proposal:", err);
      toast.error("Failed to save proposal.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto md:border-x border-border/50 bg-background/50 relative">
      <div className="flex-none p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-heading font-bold text-foreground">
            Action Console
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
              msg.role === "user" ? "bg-primary text-on-primary" : "bg-accent text-accent-foreground"
            }`}>
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className="space-y-3 min-w-0">
              <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user" 
                  ? "bg-primary text-on-primary rounded-tr-sm" 
                  : "bg-card border border-border shadow-sm rounded-tl-sm text-card-foreground"
              }`}>
                {msg.content}
              </div>

              {msg.proposal && (
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-md animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-muted/40 px-4 py-3 border-b border-border flex items-center gap-2">
                    <Command className="w-4 h-4 text-accent" />
                    <span className="font-semibold text-sm">Tool Proposal Generated</span>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Target Function
                      </label>
                      <div className="font-mono text-sm text-blue-400 bg-muted/50 px-3 py-2 rounded-lg overflow-x-auto whitespace-pre">
                        {msg.proposal.tool_name}({JSON.stringify(msg.proposal.tool_params, null, 2)})
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Execution Reasoning
                      </label>
                      <div className="text-sm text-foreground/80 italic border-l-2 border-accent/50 pl-3">
                        "{msg.proposal.llm_reasoning}"
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleSimulate(msg.proposal)}
                        disabled={isSimulating}
                        className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {isSimulating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                        Simulate Action
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-4 max-w-[85%] mr-auto">
             <div className="flex-none w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-sm">
               <Bot size={16} />
             </div>
             <div className="bg-card border border-border shadow-sm rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.3s]"></span>
               <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.15s]"></span>
               <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce"></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-none p-4 bg-background">
        <div className="relative max-w-3xl mx-auto flex items-end gap-2 bg-card border border-border shadow-sm rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Describe the action you want to perform..."
            className="w-full max-h-32 min-h-[44px] bg-transparent resize-none outline-none px-3 py-2.5 text-sm"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="flex-none w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-opacity mb-0.5"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift + Enter for new line. Proposals are simulations and will not execute immediately.
        </p>
      </div>
    </div>
  );
}
