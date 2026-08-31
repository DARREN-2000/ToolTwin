import { useState, useEffect } from 'react';
import { Terminal, Lock, Play, RefreshCw, Server } from 'lucide-react';

export default function TerminalSimulator() {
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);

  const script = [
    { text: "Initializing AI Agent Agent-Alpha...", delay: 500, type: "info" },
    { text: "Connecting to production database...", delay: 800, type: "info" },
    { text: "Goal received: 'Terminate EC2 instance i-123456789'", delay: 1000, type: "command" },
    { text: "Locating tool: terminate_ec2_instance", delay: 600, type: "info" },
    { text: "Attempting to execute tool...", delay: 1000, type: "command" },
    { text: "[BLOCKED] ToolTwin intercepted request.", delay: 400, type: "error" },
    { text: "Evaluating blast radius... Cascading damage detected.", delay: 800, type: "warning" },
    { text: "PAUSED: Waiting for human approval via ToolTwin Dashboard...", delay: 2000, type: "warning" }
  ];

  const [lines, setLines] = useState<any[]>([]);

  useEffect(() => {
    if (step === 0) return;
    
    let isCancelled = false;
    let currentStep = 0;
    
    const runScript = async () => {
      setTyping(true);
      setLines([]);
      
      for (const line of script) {
        if (isCancelled) return;
        await new Promise(resolve => setTimeout(resolve, line.delay));
        if (isCancelled) return;
        setLines(prev => [...prev, line]);
        currentStep++;
      }
      setTyping(false);
    };

    runScript();

    return () => { isCancelled = true; };
  }, [step]);

  return (
    <div className="bg-[#0a0a0a] border border-[#222] rounded-xl overflow-hidden shadow-2xl flex flex-col h-full font-mono text-[13px]">
      <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#333] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 font-medium text-xs">Customer's Python Environment</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-2 relative min-h-[300px]">
        {step === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/40">
            <Server className="w-12 h-12 text-primary/40 mb-4" />
            <h3 className="text-white text-base font-semibold mb-2 font-sans">Simulate Customer Environment</h3>
            <p className="text-gray-400 font-sans text-sm mb-6 max-w-sm">
              Watch how an AI agent behaves when it tries to execute a dangerous tool without ToolTwin.
            </p>
            <button 
              onClick={() => setStep(1)}
              className="bg-primary text-black font-sans font-medium px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" /> Start Python Agent
            </button>
          </div>
        ) : (
          <>
            {lines.map((line, idx) => (
              <div key={idx} className={`
                ${line.type === 'info' ? 'text-gray-400' : ''}
                ${line.type === 'command' ? 'text-blue-400' : ''}
                ${line.type === 'warning' ? 'text-yellow-400' : ''}
                ${line.type === 'error' ? 'text-red-400 font-bold bg-red-500/10 px-2 py-1 rounded border border-red-500/20 inline-block' : ''}
              `}>
                <span className="text-gray-600 mr-2">{'>'}</span> 
                {line.text}
              </div>
            ))}
            
            {typing && (
              <div className="flex items-center gap-2 text-gray-500 mt-4">
                <RefreshCw className="w-3 h-3 animate-spin" /> executing...
              </div>
            )}
            
            {!typing && lines.length > 0 && (
              <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md flex items-start gap-3">
                <Lock className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-500 font-medium font-sans text-sm mb-1">Agent Paused</p>
                  <p className="text-yellow-500/70 font-sans text-xs">
                    The agent is physically blocked from communicating with AWS. It cannot proceed until a human clicks "Approve & Execute" in the ToolTwin Dashboard.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
