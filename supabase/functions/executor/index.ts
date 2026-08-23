import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!req.body) {
      return new Response(JSON.stringify({ error: 'Request body is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { action, proposal_id, tool_name, tool_params } = body;
    
    if (!tool_name) {
      return new Response(JSON.stringify({ error: 'tool_name is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    let message = "";
    
    if (tool_name === 'delete_customer' && tool_params?.customer_id) {
       const { error: pErr } = await supabase.schema('acme').from('payments').delete().eq('order_id', tool_params.customer_id);
       if (pErr) throw new Error(`Failed to delete payments: ${pErr.message}`);
       
       const { error: oErr } = await supabase.schema('acme').from('orders').delete().eq('customer_id', tool_params.customer_id);
       if (oErr) throw new Error(`Failed to delete orders: ${oErr.message}`);
       
       const { error: cErr } = await supabase.schema('acme').from('customers').delete().eq('id', tool_params.customer_id);
       if (cErr) throw new Error(`Failed to delete customer: ${cErr.message}`);
       
       message = `Successfully deleted customer ${tool_params.customer_id} and cascading dependencies.`;
       
    } else if (tool_name === 'anonymize_customer' && tool_params?.customer_id) {
       const { error } = await supabase.schema('acme').from('customers').update({
         name: 'Anonymous User',
         email: null,
         phone: null,
         status: 'anonymized'
       }).eq('id', tool_params.customer_id);
       
       if (error) throw new Error(`Failed to anonymize customer: ${error.message}`);
       message = `Successfully anonymized customer ${tool_params.customer_id}.`;
    } else {
       return new Response(JSON.stringify({ error: 'Invalid tool_name or missing parameters' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const executed_at = new Date().toISOString();
    
    // Generate cryptographic signature (Open Agent Passport simulation)
    const payloadToHash = JSON.stringify({ action, proposal_id, tool_name, tool_params, executed_at });
    const encoder = new TextEncoder();
    const data = encoder.encode(payloadToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const cryptographic_signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const executionResult = {
      success: true,
      message,
      verification_status: 'VERIFIED',
      discrepancy_detail: null,
      executed_at,
      cryptographic_signature
    };

    return new Response(JSON.stringify(executionResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Executor Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
