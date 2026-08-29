import { Database, MessageSquare, CreditCard, Cloud, Server, ShieldAlert, CheckCircle2, Zap } from "lucide-react";
import React, { useState } from "react";
import SchemaUploadModal from "../components/SchemaUploadModal";

export default function ToolCatalog() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const integrations = [
    {
      id: "stripe",
      name: "Stripe",
      icon: <CreditCard className="w-6 h-6 text-indigo-500" />,
      description: "Payment processing and subscription management tools.",
      status: "connected",
      category: "Billing",
      mcpEnabled: true,
      tools: ["charge_customer", "refund_transaction", "create_subscription"],
    },
    {
      id: "salesforce",
      name: "Salesforce",
      icon: <Cloud className="w-6 h-6 text-blue-500" />,
      description: "CRM data syncing and customer record management.",
      status: "connected",
      category: "CRM",
      mcpEnabled: true,
      tools: ["update_lead", "fetch_opportunities", "delete_contact"],
    },
    {
      id: "postgres",
      name: "PostgreSQL",
      icon: <Database className="w-6 h-6 text-sky-500" />,
      description: "Direct database access for complex queries and mutations.",
      status: "disconnected",
      category: "Database",
      mcpEnabled: false,
      tools: ["execute_query", "migrate_schema", "rollback_transaction"],
    },
    {
      id: "slack",
      name: "Slack",
      icon: <MessageSquare className="w-6 h-6 text-purple-500" />,
      description: "Team communication and incident alerting.",
      status: "connected",
      category: "Communication",
      mcpEnabled: true,
      tools: ["send_message", "create_channel", "archive_channel"],
    },
    {
      id: "aws",
      name: "AWS Infrastructure",
      icon: <Server className="w-6 h-6 text-orange-500" />,
      description: "Cloud resource provisioning and management.",
      status: "connected",
      category: "DevOps",
      mcpEnabled: true,
      tools: ["provision_ec2", "scale_dynamodb", "rotate_keys"],
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <SchemaUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-black text-foreground flex items-center gap-3 tracking-tight">
            <Zap className="w-10 h-10 text-primary animate-pulse" /> 
            Integration Marketplace
          </h1>
          <p className="text-foreground/60 mt-2 text-lg max-w-2xl">
            Discover and manage connected tools, MCP servers, and available AI agent actions across your infrastructure.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          + Connect Custom API / Schema
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="group relative bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 overflow-hidden"
          >
            {/* Background Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-muted rounded-xl shadow-inner border border-border/50 group-hover:scale-110 transition-transform duration-300">
                  {integration.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-foreground group-hover:text-primary transition-colors">
                    {integration.name}
                  </h3>
                  <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider mt-0.5">
                    {integration.category}
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              {integration.status === "connected" ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-foreground/50 text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
                  Disconnected
                </div>
              )}
            </div>

            <p className="text-foreground/70 mb-6 text-sm relative z-10 min-h-[40px]">
              {integration.description}
            </p>

            {integration.mcpEnabled && (
              <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-semibold relative z-10">
                <CheckCircle2 className="w-3.5 h-3.5" />
                MCP Server Active
              </div>
            )}

            <div className="space-y-3 relative z-10 border-t border-border/50 pt-4 mt-auto">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                Available Tools <span className="bg-muted px-1.5 py-0.5 rounded-md">{integration.tools.length}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {integration.tools.map((tool) => (
                  <span
                    key={tool}
                    className="bg-background/80 text-foreground/80 px-2.5 py-1 rounded-md text-xs font-mono border border-border/50 group-hover:border-primary/20 transition-colors"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
