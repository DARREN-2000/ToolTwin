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

    // Default to NVIDIA NIM (Llama 3.1 70B)
    const provider = "nvidia";
    let apiUrl = "";
    let apiKey = "";
    let model = "";

    if (provider === "nvidia") {
      apiUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
      apiKey = Deno.env.get("NVIDIA_API_KEY") || "";
      model = "meta/llama-3.1-70b-instruct";
    } else {
      apiUrl = "https://openrouter.ai/api/v1/chat/completions";
      apiKey = Deno.env.get("OPENROUTER_API_KEY") || "";
      model = "google/gemini-2.5-flash:free";
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server configuration error: API Key missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are an AI agent operations assistant. The user will ask you to perform an action. You must select the appropriate tool to perform the action and extract the required parameters. Do not execute the tool yourself; just return the tool call.",
          },
          { role: "user", content: actionContext },
        ],
        ...(tools && tools.length > 0 ? {
          tools: tools.map((t: any) =>
            t.function ? t : {
              type: "function",
              function: {
                name: t.name,
                description: t.description,
                parameters: t.parameters,
              },
            }
          ),
          tool_choice: "auto",
        } : {})
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
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
