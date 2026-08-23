import { Wrench, ShieldAlert } from "lucide-react";

export default function ToolCatalog() {
  const tools = [
    {
      name: "delete_customer",
      description: "Deletes a customer and all their associated data.",
      destructive: true,
      params: '{"customer_id": "string"}',
      dependencies: ["orders", "support_tickets", "analytics_aggregates"]
    },
    {
      name: "anonymize_customer",
      description: "Anonymizes customer PII but preserves transactional history.",
      destructive: false,
      params: '{"customer_id": "string"}',
      dependencies: []
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
          <Wrench className="w-8 h-8 text-primary" /> Tool Catalog
        </h1>
        <p className="text-foreground/60 mt-1">Available actions the AI agent can propose.</p>
      </div>

      <div className="grid gap-6">
        {tools.map((tool) => (
          <div key={tool.name} className="bg-muted/30 border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold font-mono text-foreground">{tool.name}</h3>
              {tool.destructive && (
                <span className="badge-risk-critical px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> DESTRUCTIVE
                </span>
              )}
            </div>
            <p className="text-foreground/70 mb-4">{tool.description}</p>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Parameters</span>
                <div className="bg-background border border-border/50 rounded-lg p-3 font-mono text-sm text-blue-400 mt-1">
                  {tool.params}
                </div>
              </div>
              
              {tool.dependencies.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Affected Entities</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {tool.dependencies.map(dep => (
                      <span key={dep} className="bg-secondary/50 text-foreground px-2 py-1 rounded text-xs border border-border/50">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
