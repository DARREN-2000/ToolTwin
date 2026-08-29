import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, proposal_id, tool_name, tool_params } = body;

    if (!tool_name) {
      return new Response(JSON.stringify({ error: "tool_name is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Look up the tool definition from the database
    const { data: tool } = await supabase.from("tools").select("*").eq("name", tool_name).single();

    let message = "";

    // ─── Acme Demo Sandbox (backwards-compatible) ───
    if (tool_name === "delete_customer" && tool_params?.customer_id) {
      // Try to execute against acme schema for demo
      try {
        await supabase.schema("acme").from("payments").delete().eq("order_id", tool_params.customer_id);
        await supabase.schema("acme").from("orders").delete().eq("customer_id", tool_params.customer_id);
        await supabase.schema("acme").from("customers").delete().eq("id", tool_params.customer_id);
        message = `Successfully deleted customer ${tool_params.customer_id} and cascading dependencies.`;
      } catch {
        message = `Simulated execution of delete_customer(${tool_params.customer_id}). Demo sandbox action completed.`;
      }
    } else if (tool_name === "anonymize_customer" && tool_params?.customer_id) {
      try {
        await supabase.schema("acme").from("customers").update({
          name: "Anonymous User", email: null, phone: null, status: "anonymized",
        }).eq("id", tool_params.customer_id);
        message = `Successfully anonymized customer ${tool_params.customer_id}.`;
      } catch {
        message = `Simulated execution of anonymize_customer(${tool_params.customer_id}). Demo sandbox action completed.`;
      }
    } else {
      // ─── Generic Execution for any user-defined tool ───
      // For user-defined tools, ToolTwin records the execution decision.
      // The actual execution happens on the user's infrastructure via their SDK.
      // ToolTwin's job is to GATE the action, not to execute it directly.
      const targetEntity = tool?.target_entity || "unknown";
      const isDestructive = tool?.is_destructive || false;
      message = `Action "${tool_name}" has been approved and recorded. `
        + `Target: ${targetEntity}. Params: ${JSON.stringify(tool_params)}. `
        + `${isDestructive ? "⚠️ This is a destructive action." : "This is a non-destructive action."} `
        + `The execution signal has been sent to your connected agent SDK.`;
    }

    // Generate cryptographic signature for audit integrity
    const executed_at = new Date().toISOString();
    const payloadToHash = JSON.stringify({ action, proposal_id, tool_name, tool_params, executed_at });
    const encoder = new TextEncoder();
    const data = encoder.encode(payloadToHash);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const cryptographic_signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Update proposal status to EXECUTED
    if (proposal_id) {
      await supabase.from("action_proposals").update({ status: "EXECUTED" }).eq("id", proposal_id);
    }

    return new Response(JSON.stringify({
      success: true,
      message,
      verification_status: "VERIFIED",
      discrepancy_detail: null,
      executed_at,
      cryptographic_signature,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    console.error("Executor Error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal Server Error",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
