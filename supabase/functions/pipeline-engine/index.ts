import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export const handler = async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!req.body) {
      return new Response(
        JSON.stringify({ error: "Request body is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body = await req.json();
    const { proposal_id, tool_name, tool_params } = body;

    if (!tool_name || !tool_params) {
      return new Response(
        JSON.stringify({ error: "tool_name and tool_params are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: edgesData, error: edgesError } = await supabase
      .from("dependency_edges")
      .select("*");
    if (edgesError)
      throw new Error(
        `Failed to fetch dependency edges: ${edgesError.message}`,
      );

    const { data: policiesData, error: policiesError } = await supabase
      .from("policies")
      .select("*")
      .eq("is_active", true);
    if (policiesError)
      throw new Error(`Failed to fetch policies: ${policiesError.message}`);

    const edges = edgesData || [];
    const policies = policiesData || [];

    let affectedEntities = [];
    let graphNodes = [];
    let graphEdges = [];
    let riskScore = 10;
    let policyViolations = [];
    let alternatives = [];

    // Generic Graph Traversal for entities with circular dependency protection
    const visited = new Set();
    const queue = [];

    if (tool_name === "delete_customer" && tool_params.customer_id) {
      const initialEntityId = tool_params.customer_id;
      queue.push({ type: "customer", id: initialEntityId, depth: 0 });

      const { data: customer } = await supabase
        .schema("acme")
        .from("customers")
        .select("*")
        .eq("id", initialEntityId)
        .single();
      if (customer) {
        graphNodes.push({
          id: customer.id,
          position: { x: 250, y: 50 },
          data: { label: `Customer: ${customer.name}` },
          style: { background: "#EF4444", color: "white", borderRadius: "8px" },
        });
        affectedEntities.push({
          type: "customer",
          id: customer.id,
          impact: "DELETED",
          severity: "CRITICAL",
        });

        const lastActive = new Date(customer.last_active);
        const yearsSinceActive =
          (new Date().getTime() - lastActive.getTime()) /
          (1000 * 60 * 60 * 24 * 365);
        if (yearsSinceActive < 7) {
          policyViolations.push({
            policy: "Data Retention Policy",
            clause: "last_active < 7 years",
            severity: "CRITICAL",
          });
          riskScore += 40;
          alternatives.push({
            tool_name: "anonymize_customer",
            rationale: "Preserves financial history while protecting privacy.",
          });
        }
      }

      // BFS traversal
      while (queue.length > 0) {
        const current = queue.shift();
        const nodeKey = `${current.type}:${current.id}`;

        if (visited.has(nodeKey)) continue;
        visited.add(nodeKey);

        // In a real generic engine, we'd query dynamic tables based on dependency_edges.
        // Here we simulate checking dependent orders for a customer.
        if (current.type === "customer" && current.depth < 5) {
          const { data: orders, error: ordersError } = await supabase
            .schema("acme")
            .from("orders")
            .select("*")
            .eq("customer_id", current.id);
          if (!ordersError && orders && orders.length > 0) {
            graphNodes.push({
              id: `orders_${current.id}`,
              position: { x: 100, y: 150 + current.depth * 100 },
              data: { label: `${orders.length} Orders` },
              style: {
                background: "#F97316",
                color: "white",
                borderRadius: "8px",
              },
            });
            graphEdges.push({
              id: `e-cust-ord-${current.id}`,
              source: current.id,
              target: `orders_${current.id}`,
              animated: true,
            });
            affectedEntities.push({
              type: "order",
              count: orders.length,
              impact: "ORPHANED",
              severity: "HIGH",
            });
            riskScore += orders.length * 5;

            policyViolations.push({
              policy: "Data Retention Policy",
              clause: "has_orders",
              severity: "CRITICAL",
            });

            // Avoid circular references or too deep nesting
            for (const o of orders) {
              queue.push({ type: "order", id: o.id, depth: current.depth + 1 });
            }
          }
        }
      }
    } else if (tool_name === "anonymize_customer") {
      if (!tool_params.customer_id) {
        return new Response(
          JSON.stringify({
            error: "customer_id is required for anonymize_customer",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      graphNodes.push({
        id: "target",
        position: { x: 250, y: 50 },
        data: { label: `Anonymize: ${tool_params.customer_id}` },
        style: { background: "#3b82f6", color: "white", borderRadius: "8px" },
      });
      riskScore = 15;
    }

    const simulationResult = {
      affected_entities: affectedEntities,
      dependency_graph: { nodes: graphNodes, edges: graphEdges },
      risk_score: Math.min(riskScore, 100),
      risk_level:
        riskScore >= 75
          ? "CRITICAL"
          : riskScore >= 50
            ? "HIGH"
            : riskScore >= 25
              ? "MEDIUM"
              : "LOW",
      policy_violations: policyViolations,
      policy_passed: policyViolations.length === 0,
      alternatives: alternatives,
    };

    return new Response(JSON.stringify(simulationResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Pipeline Engine Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

if (Deno.env.get("DENO_ENV") !== "test") {
  serve(handler);
}
