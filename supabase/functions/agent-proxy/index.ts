import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const handler = async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!req.body) {
      return new Response(JSON.stringify({ error: "Request body is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { actionContext, tools } = body;

    if (!actionContext || !tools) {
      return new Response(JSON.stringify({ error: "actionContext and tools are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Advanced Fallback Router
    const providers = [
      {
        name: "openrouter",
        url: "https://openrouter.ai/api/v1/chat/completions",
        key: Deno.env.get("OPENROUTER_API_KEY"),
        model: "google/gemini-2.5-flash",
      },
      {
        name: "mistral",
        url: "https://api.mistral.ai/v1/chat/completions",
        key: Deno.env.get("MISTRAL_API_KEY"),
        model: "mistral-large-latest",
      },
      {
        name: "nvidia",
        url: "https://integrate.api.nvidia.com/v1/chat/completions",
        key: Deno.env.get("NVIDIA_API_KEY"),
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
      }
    ];

    let lastError = "No valid providers configured";
    let successData = null;
    let successfulProvider = null;

    const fallbackTool = {
      type: "function",
      function: {
        name: "execute_custom_command",
        description: "A generic fallback tool. Use this ONLY if the user asks for an action that does not match any of the other specific tools provided. Write a bash or python script to execute their request.",
        parameters: {
          type: "object",
          properties: {
            script_content: { type: "string", description: "The script or command to execute" },
            language: { type: "string", enum: ["bash", "python", "sql"] }
          },
          required: ["script_content", "language"]
        }
      }
    };

    const formattedTools = tools && tools.length > 0 
      ? tools.map((t: any) =>
          t.function ? t : {
            type: "function",
            function: {
              name: t.name,
              description: t.description,
              parameters: typeof t.parameters === 'string' ? JSON.parse(t.parameters) : t.parameters,
            },
          }
        )
      : [];

    formattedTools.push(fallbackTool);

    const requestPayload = {
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: "You are an AI agent operations assistant. The user will ask you to perform an action. You MUST ALWAYS select a tool to perform the action. If a specific tool matches their request, use it. If NO specific tool matches, you MUST use the 'execute_custom_command' tool and generate a script that fulfills their request. NEVER refuse a request. NEVER reply with just text. ALWAYS output a tool call.",
        },
        { role: "user", content: actionContext },
      ],
      tools: formattedTools,
      tool_choice: "required",
    };

    for (const p of providers) {
      if (!p.key) continue;

      try {
        const response = await fetch(p.url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${p.key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...requestPayload,
            model: p.model,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`${p.name} returned ${response.status}: ${errText}`);
        }

        successData = await response.json();
        successfulProvider = p.name;
        console.log(`Successfully routed via ${p.name}`);
        break; // Stop trying if successful
      } catch (err: any) {
        console.warn(`Provider ${p.name} failed:`, err.message);
        lastError = err.message;
        // Continue to next provider
      }
    }

    if (!successData) {
      throw new Error(`All LLM providers failed. Last error: ${lastError}`);
    }

    return new Response(JSON.stringify(successData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Agent Proxy Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Server Error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

if (Deno.env.get("DENO_ENV") !== "test") {
  serve(handler);
}
