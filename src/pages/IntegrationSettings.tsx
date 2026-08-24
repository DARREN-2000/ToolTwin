import React, { useState } from 'react';
import { Key, Copy, Check, Terminal, ExternalLink, Puzzle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IntegrationSettings() {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPy, setCopiedPy] = useState(false);
  const [copiedTs, setCopiedTs] = useState(false);
  
  const toolTwinKey = "tt_live_d84j29c84nf03n1k40f8xn120";

  const handleCopy = (text: string, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setter(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setter(false), 2000);
  };

  const pythonCode = `import openai
from tooltwin import ToolTwinProxy

# 1. Wrap your client with ToolTwin
client = ToolTwinProxy(
    openai.Client(api_key="YOUR_OPENAI_KEY"),
    tooltwin_api_key="${toolTwinKey}"
)

# 2. Call your agent as normal. Tool calls will automatically be intercepted!
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Delete all inactive customers"}],
    tools=my_database_tools
)`;

  const tsCode = `import { OpenAI } from "openai";
import { withToolTwin } from "@tooltwin/sdk";

// 1. Wrap your client with ToolTwin
const client = withToolTwin(
  new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
  { apiKey: "${toolTwinKey}" }
);

// 2. Call your agent as normal.
const response = await client.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Delete all inactive customers" }],
  tools: myDatabaseTools
});`;

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Integration & Settings</h1>
        <p className="text-foreground/60">Connect your existing AI agents (Langchain, CrewAI, AutoGen) to ToolTwin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: API Keys */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-muted/30 border border-border/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-bold font-heading">ToolTwin API Key</h2>
            </div>
            <p className="text-sm text-foreground/60 mb-4">Use this key to authenticate your agent SDK with the ToolTwin gateway.</p>
            
            <div className="relative">
              <input 
                type="text" 
                readOnly 
                value={toolTwinKey}
                className="w-full bg-background border border-border rounded-lg py-3 pl-4 pr-12 text-sm font-mono text-foreground focus:outline-none focus:border-accent/50"
              />
              <button 
                onClick={() => handleCopy(toolTwinKey, setCopiedKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-md text-foreground/50 hover:text-foreground transition-colors"
              >
                {copiedKey ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-muted/30 border border-border/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Puzzle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold font-heading">LLM Provider Keys</h2>
            </div>
            <p className="text-sm text-foreground/60 mb-4">If using the built-in Action Console, provide your LLM API keys here.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-1 uppercase tracking-wider">OpenRouter API Key</label>
                <input 
                  type="password" 
                  placeholder="sk-or-v1-..."
                  className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm font-mono focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-1 uppercase tracking-wider">OpenAI API Key</label>
                <input 
                  type="password" 
                  placeholder="sk-proj-..."
                  className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm font-mono focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>
              <button onClick={() => toast.success("API Keys saved securely!")} className="w-full bg-foreground text-background font-medium py-2 rounded-lg hover:opacity-90 transition-opacity">
                Save Provider Keys
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Code Integration */}
        <div className="lg:col-span-2">
          <div className="bg-[#0A0A0A] border border-border/50 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-accent via-blue-600 to-purple-600 rounded-[24px] blur opacity-10 group-hover:opacity-20 transition duration-1000" />
            <div className="relative z-10 flex flex-col h-full bg-[#0A0A0A]">
              <div className="h-14 border-b border-white/[0.08] flex items-center px-4 justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-white/90">Quickstart Integration</span>
                </div>
              </div>
              
              <div className="flex-1 p-6 space-y-8 overflow-y-auto">
                {/* Python */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">Py</div>
                      <h3 className="font-medium text-white/80">Python (LangChain, AutoGen, CrewAI)</h3>
                    </div>
                    <button 
                      onClick={() => handleCopy(pythonCode, setCopiedPy)}
                      className="text-xs text-white/40 hover:text-white flex items-center gap-1"
                    >
                      {copiedPy ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />} Copy
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-black border border-white/10 text-sm font-mono overflow-x-auto text-white/70 leading-relaxed">
                    <code>
                      <span className="text-purple-400">import</span> openai{'\n'}
                      <span className="text-purple-400">from</span> tooltwin <span className="text-purple-400">import</span> ToolTwinProxy{'\n\n'}
                      <span className="text-white/30"># 1. Wrap your client with ToolTwin</span>{'\n'}
                      client = ToolTwinProxy({'\n'}
                      {'    '}openai.Client(api_key=<span className="text-green-300">"YOUR_OPENAI_KEY"</span>),{'\n'}
                      {'    '}tooltwin_api_key=<span className="text-green-300">"tt_live_d84j29c84nf03n1k40f8xn120"</span>{'\n'}
                      ){'\n\n'}
                      <span className="text-white/30"># 2. Call your agent as normal. Tool calls will automatically be intercepted!</span>{'\n'}
                      response = client.chat.completions.create({'\n'}
                      {'    '}model=<span className="text-green-300">"gpt-4"</span>,{'\n'}
                      {'    '}messages=[{'{'}<span className="text-green-300">"role"</span>: <span className="text-green-300">"user"</span>, <span className="text-green-300">"content"</span>: <span className="text-green-300">"Delete all inactive customers"</span>{'}'}],{'\n'}
                      {'    '}tools=my_database_tools{'\n'}
                      )
                    </code>
                  </pre>
                </div>

                {/* TypeScript */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">TS</div>
                      <h3 className="font-medium text-white/80">Node.js / TypeScript</h3>
                    </div>
                    <button 
                      onClick={() => handleCopy(tsCode, setCopiedTs)}
                      className="text-xs text-white/40 hover:text-white flex items-center gap-1"
                    >
                      {copiedTs ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />} Copy
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-black border border-white/10 text-sm font-mono overflow-x-auto text-white/70 leading-relaxed">
                    <code>
                      <span className="text-purple-400">import</span> {'{ OpenAI }'} <span className="text-purple-400">from</span> <span className="text-green-300">"openai"</span>;{'\n'}
                      <span className="text-purple-400">import</span> {'{ withToolTwin }'} <span className="text-purple-400">from</span> <span className="text-green-300">"@tooltwin/sdk"</span>;{'\n\n'}
                      <span className="text-white/30">// 1. Wrap your client with ToolTwin</span>{'\n'}
                      <span className="text-purple-400">const</span> client = <span className="text-blue-400">withToolTwin</span>({'\n'}
                      {'  '}<span className="text-purple-400">new</span> <span className="text-blue-300">OpenAI</span>({'{'} apiKey: process.env.OPENAI_API_KEY {'}'}),{'\n'}
                      {'  '}{'{'} apiKey: <span className="text-green-300">"tt_live_d84j29c84nf03n1k40f8xn120"</span> {'}'}{'\n'}
                      );{'\n\n'}
                      <span className="text-white/30">// 2. Call your agent as normal.</span>{'\n'}
                      <span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> client.chat.completions.create({'{\n'}
                      {'  '}model: <span className="text-green-300">"gpt-4"</span>,{'\n'}
                      {'  '}messages: [{'{'} role: <span className="text-green-300">"user"</span>, content: <span className="text-green-300">"Delete all inactive customers"</span> {'}'}],{'\n'}
                      {'  '}tools: myDatabaseTools{'\n'}
                      });
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
