import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const handler = async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { tool_name, tool_params } = body;
    if (!tool_name || !tool_params) throw new Error("tool_name and tool_params are required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch generic tool definition
    const { data: tool } = await supabase.from("tools").select("*").eq("name", tool_name).single();
    
    // 2. Fetch generic dependency edges
    const { data: edges } = await supabase.from("dependency_edges").select("*");
    const { data: policies } = await supabase.from("policies").select("*").eq("is_active", true);

    let graphNodes = [];
    let graphEdges = [];
    let affectedEntities = [];
    let riskScore = 10;
    let policyViolations = [];
    let alternatives = [];

    const targetEntity = tool?.target_entity || "unknown";
    const initialId = tool_params.id || tool_params.customer_id || tool_params.record_id || "target-1";

    // Initialize root node
    graphNodes.push({
      id: initialId,
      position: { x: 250, y: 50 },
      data: { label: `${targetEntity}: ${initialId}` },
      style: { background: tool?.is_destructive ? "#EF4444" : "#3B82F6", color: "white", borderRadius: "8px" },
    });

    affectedEntities.push({
      type: targetEntity,
      id: initialId,
      impact: tool?.is_destructive ? "MODIFIED/DELETED" : "ACCESSED",
      severity: tool?.is_destructive ? "CRITICAL" : "LOW",
    });

    // Dynamic BFS based purely on dependency_edges table
    const visited = new Set([`${targetEntity}:${initialId}`]);
    const queue = [{ type: targetEntity, id: initialId, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || current.depth > 3) continue; // max depth

      // Find dependent entities defined in the DB edges
      const dependencies = (edges || []).filter(e => e.source_entity === current.type);

      dependencies.forEach((dep, idx) => {
        const dependentNodeId = `${dep.target_entity}_${current.id}_${idx}`;
        
        if (!visited.has(dependentNodeId)) {
          visited.add(dependentNodeId);
          
          graphNodes.push({
            id: dependentNodeId,
            position: { x: 100 + (idx * 150), y: 150 + current.depth * 100 },
            data: { label: `Dependent ${dep.target_entity}` },
            style: { background: "#F97316", color: "white", borderRadius: "8px" },
          });

          graphEdges.push({
            id: `e-${current.id}-${dependentNodeId}`,
            source: current.id,
            target: dependentNodeId,
            animated: true,
          });

          affectedEntities.push({
            type: dep.target_entity,
            impact: "CASCADING_IMPACT",
            severity: "HIGH",
          });

          riskScore += 15;
          queue.push({ type: dep.target_entity, id: dependentNodeId, depth: current.depth + 1 });
        }
      });
    }

    // Dynamic Policy Evaluation
    (policies || []).forEach(policy => {
      if (policy.rule_type === "block_destructive" && tool?.is_destructive) {
        policyViolations.push({
          policy: policy.name,
          clause: policy.description || "Destructive action blocked by policy.",
          severity: policy.severity,
        });
        riskScore += 50;
      }
    });

    if (tool?.is_destructive) {
       alternatives.push({
          tool_name: "soft_delete_" + targetEntity,
          rationale: "Use soft delete to preserve historical integrity.",
       });
    }

    return new Response(JSON.stringify({
      affected_entities: affectedEntities,
      dependency_graph: { nodes: graphNodes, edges: graphEdges },
      risk_score: Math.min(riskScore, 100),
      risk_level: riskScore >= 75 ? "CRITICAL" : riskScore >= 50 ? "HIGH" : riskScore >= 25 ? "MEDIUM" : "LOW",
      policy_violations: policyViolations,
      policy_passed: policyViolations.length === 0,
      alternatives: alternatives,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });

  } catch (error) {
    console.error("Generic Pipeline Engine Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Server Error" }), { headers: corsHeaders, status: 500 });
  }
};

if (Deno.env.get("DENO_ENV") !== "test") serve(handler);
