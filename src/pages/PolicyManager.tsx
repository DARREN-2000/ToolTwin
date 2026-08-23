import { ShieldCheck, Activity } from "lucide-react";

export default function PolicyManager() {
  const policies = [
    {
      name: "Data Retention Policy",
      description: "Preserve customer records for 7 years after last activity or if historical orders exist",
      type: "retention",
      severity: "CRITICAL",
      active: true
    },
    {
      name: "Financial Integrity Policy",
      description: "Block actions that corrupt payment records",
      type: "integrity",
      severity: "CRITICAL",
      active: true
    },
    {
      name: "GDPR Compliance Policy",
      description: "Recommend anonymization when blocking deletion",
      type: "compliance",
      severity: "MEDIUM",
      active: true
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-accent" /> Policy Manager
          </h1>
          <p className="text-foreground/60 mt-1">Business rules applied during simulation.</p>
        </div>
        <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity cursor-pointer">
          + New Policy
        </button>
      </div>

      <div className="bg-muted/30 border border-border rounded-xl divide-y divide-border overflow-hidden">
        {policies.map(policy => (
          <div key={policy.name} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-foreground">{policy.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${policy.severity === 'CRITICAL' ? 'bg-destructive/15 text-destructive border-destructive/30' : 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30'}`}>
                  {policy.severity}
                </span>
              </div>
              <p className="text-sm text-foreground/70">{policy.description}</p>
              <p className="text-xs text-foreground/50 mt-2 font-mono">Type: {policy.type}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-accent">ACTIVE</span>
              <div className="w-10 h-6 bg-accent rounded-full flex items-center p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
