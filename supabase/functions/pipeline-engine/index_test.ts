import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { handler } from "./index.ts";

Deno.test("pipeline-engine: OPTIONS request returns ok", async () => {
  const req = new Request("http://localhost/pipeline-engine", { method: "OPTIONS" });
  const res = await handler(req);
  assertEquals(res.status, 200);
});

Deno.test("pipeline-engine: missing body returns 400", async () => {
  const req = new Request("http://localhost/pipeline-engine", { method: "POST" });
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("pipeline-engine: missing tool_name returns 400", async () => {
  const req = new Request("http://localhost/pipeline-engine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool_params: {} }),
  });
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("pipeline-engine: successful simulation (anonymize_customer)", async () => {
  Deno.env.set("SUPABASE_URL", "https://dummy.supabase.co");
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "dummy");
  const originalFetch = globalThis.fetch;
  
  globalThis.fetch = async (input, init) => {
    const url = input.toString();
    if (url.includes("dependency_edges") || url.includes("policies")) {
      return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  try {
    const req = new Request("http://localhost/pipeline-engine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposal_id: "1", tool_name: "anonymize_customer", tool_params: { customer_id: "123" } }),
    });
    const res = await handler(req);
    assertEquals(res.status, 200);
    const data = await res.json();
    assertEquals(data.risk_score, 15);
    assertEquals(data.policy_passed, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("pipeline-engine: delete_customer simulation with mock customer", async () => {
  Deno.env.set("SUPABASE_URL", "https://dummy.supabase.co");
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "dummy");
  const originalFetch = globalThis.fetch;
  
  globalThis.fetch = async (input, init) => {
    const url = input.toString();
    if (url.includes("dependency_edges") || url.includes("policies")) {
      return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    
    // Check if it's querying customers
    if (url.includes("customers")) {
      // Mocking supabase single() returns the object directly, not an array
      // Wait, supabase-js single() expects array of 1 from fetch and then unwraps it, or returns JSON directly depending on headers.
      // Usually supabase-js appends `Accept: application/vnd.pgrst.object+json` for single().
      // Let's just return an array with one element.
      return new Response(JSON.stringify([{ id: "123", name: "Acme Corp", last_active: new Date().toISOString() }]), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    }
    
    if (url.includes("orders")) {
      return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  try {
    const req = new Request("http://localhost/pipeline-engine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposal_id: "1", tool_name: "delete_customer", tool_params: { customer_id: "123" } }),
    });
    const res = await handler(req);
    assertEquals(res.status, 200);
    const data = await res.json();
    // delete_customer starts with 10 score, plus policy violations if any
    // last_active is now, so < 7 years triggers violation, adding 40 -> 50 risk_score
    assertEquals(data.risk_score, 50);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
