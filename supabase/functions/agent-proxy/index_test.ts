import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { handler } from "./index.ts";

Deno.test("agent-proxy: OPTIONS request returns ok", async () => {
  const req = new Request("http://localhost/agent-proxy", { method: "OPTIONS" });
  const res = await handler(req);
  assertEquals(res.status, 200);
  assertEquals(await res.text(), "ok");
});

Deno.test("agent-proxy: missing body returns 400", async () => {
  const req = new Request("http://localhost/agent-proxy", { method: "POST" });
  const res = await handler(req);
  assertEquals(res.status, 400);
  const data = await res.json();
  assertEquals(data.error, "Request body is required");
});

Deno.test("agent-proxy: missing actionContext returns 400", async () => {
  const req = new Request("http://localhost/agent-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tools: [] }),
  });
  const res = await handler(req);
  assertEquals(res.status, 400);
});

Deno.test("agent-proxy: missing config returns 500", async () => {
  const originalEnv = Deno.env.get("OPENROUTER_API_KEY");
  Deno.env.delete("OPENROUTER_API_KEY");
  const req = new Request("http://localhost/agent-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actionContext: "test", tools: [] }),
  });
  const res = await handler(req);
  assertEquals(res.status, 500);
  if (originalEnv) Deno.env.set("OPENROUTER_API_KEY", originalEnv);
});

Deno.test("agent-proxy: successful proxy call", async () => {
  Deno.env.set("OPENROUTER_API_KEY", "dummy");
  const originalFetch = globalThis.fetch;
  
  globalThis.fetch = async (input, init) => {
    return new Response(JSON.stringify({ choices: [{ message: { content: "test tool call" } }] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };

  try {
    const req = new Request("http://localhost/agent-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionContext: "test", tools: [{ name: "my_tool", description: "test" }] }),
    });
    const res = await handler(req);
    assertEquals(res.status, 200);
    const data = await res.json();
    assertEquals(data.choices[0].message.content, "test tool call");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
