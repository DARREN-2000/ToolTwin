import { ShieldCheck, Plus, AlertTriangle, AlertCircle } from "lucide-react";

export default function PolicyManager() {
  const policies = [
    {
      id: "POL-101",
      name: "Data Retention Policy",
      description: "Preserve customer records for 7 years after last activity",
      type: "retention",
      severity: "CRITICAL",
      active: true,
    },
    {
      id: "POL-102",
      name: "Financial Integrity Policy",
      description: "Block actions that corrupt payment records",
      type: "integrity",
      severity: "CRITICAL",
      active: true,
    },
    {
      id: "POL-103",
      name: "GDPR Compliance Policy",
      description: "Recommend anonymization when blocking deletion",
      type: "compliance",
      severity: "MEDIUM",
      active: true,
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" /> Policy Manager
          </h1>
          <p className="text-sm text-foreground/50 mt-1">
            Business rules applied during simulation.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm">
          <Plus className="w-4 h-4" /> New Policy
        </button>
      </div>

      <div className="relative border border-border rounded-lg overflow-hidden bg-background shadow-sm">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
              <tr>
                <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider">
                  Policy Name
                </th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-foreground/50 uppercase tracking-wider text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {policies.map((policy) => (
                <tr key={policy.id} className="group hover:bg-muted/40 transition-colors cursor-default">
                  <td className="px-4 py-2 text-[13px] font-mono text-foreground/60 group-hover:text-foreground/90 transition-colors">
                    {policy.id}
                  </td>
                  <td className="px-4 py-2 text-[13px] font-medium text-foreground/90">
                    {policy.name}
                  </td>
                  <td className="px-4 py-2 text-[13px] text-foreground/60 truncate max-w-[250px]" title={policy.description}>
                    {policy.description}
                  </td>
                  <td className="px-4 py-2 text-[13px] font-mono text-foreground/50">
                    {policy.type}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                        policy.severity === "CRITICAL"
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          : policy.severity === "HIGH"
                          ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                          : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      }`}
                    >
                      {policy.severity === "CRITICAL" ? (
                        <AlertCircle className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {policy.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[11px] font-medium text-foreground/50">
                        {policy.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                      <button 
                        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                          policy.active ? "bg-accent" : "bg-muted"
                        }`}
                      >
                        <span 
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            policy.active ? "translate-x-3.5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
