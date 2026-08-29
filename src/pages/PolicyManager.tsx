import { useState, useEffect } from "react";
import { ShieldCheck, Plus, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

interface Policy {
  id: string;
  name: string;
  description: string;
  rule_type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  is_active: boolean;
}

export default function PolicyManager() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  async function fetchPolicies() {
    setLoading(true);
    const { data, error } = await supabase.from("policies").select("*").order("name");
    if (error) {
      toast.error("Failed to load policies");
      console.error(error);
    } else {
      setPolicies((data as Policy[]) || []);
    }
    setLoading(false);
  }

  const togglePolicy = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("policies")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to update policy status");
    } else {
      toast.success(`Policy ${!currentStatus ? 'activated' : 'deactivated'}`);
      setPolicies(policies.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <button 
          onClick={() => toast("New Policy creation coming soon!", { icon: "🚧" })}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
        >
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
              {policies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-foreground/50 text-sm">
                    No policies defined.
                  </td>
                </tr>
              ) : policies.map((policy) => (
                <tr key={policy.id} className="group hover:bg-muted/40 transition-colors cursor-default">
                  <td className="px-4 py-2 text-[13px] font-mono text-foreground/60 group-hover:text-foreground/90 transition-colors">
                    {policy.id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-2 text-[13px] font-medium text-foreground/90">
                    {policy.name}
                  </td>
                  <td className="px-4 py-2 text-[13px] text-foreground/60 truncate max-w-[250px]" title={policy.description}>
                    {policy.description}
                  </td>
                  <td className="px-4 py-2 text-[13px] font-mono text-foreground/50">
                    {policy.rule_type}
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
                        {policy.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                      <button 
                        onClick={() => togglePolicy(policy.id, policy.is_active)}
                        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors cursor-pointer ${
                          policy.is_active ? "bg-accent" : "bg-muted border border-border"
                        }`}
                      >
                        <span 
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            policy.is_active ? "translate-x-3.5" : "translate-x-0.5"
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
