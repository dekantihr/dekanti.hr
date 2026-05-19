import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqRequest = {
  messages?: GroqMessage[];
  temperature?: number;
  max_tokens?: number;
};

const MODEL = "llama-3.1-8b-instant";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-email",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function validateMessages(messages: unknown): GroqMessage[] {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 12) {
    throw new Error("Invalid messages payload");
  }

  return messages.map((message) => {
    if (!message || typeof message !== "object") {
      throw new Error("Invalid message payload");
    }

    const candidate = message as Partial<GroqMessage>;
    if (!candidate.role || !["system", "user", "assistant"].includes(candidate.role)) {
      throw new Error("Invalid message role");
    }

    if (typeof candidate.content !== "string" || candidate.content.trim().length === 0 || candidate.content.length > 4000) {
      throw new Error("Invalid message content");
    }

    return {
      role: candidate.role,
      content: candidate.content,
    };
  });
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(Math.max(value, min), max);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const groqApiKey = Deno.env.get("GROQ_API_KEY");

  if (!supabaseUrl || !serviceRoleKey || !groqApiKey) {
    return jsonResponse({ error: "Server configuration is incomplete" }, 500);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let adminEmail: string | null = null;

  // Try Supabase Auth JWT first (future-proof for auth migration)
  const authorization = req.headers.get("Authorization");
  const token = authorization?.replace("Bearer ", "");

  if (token) {
    try {
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (!userError && userData.user?.email) {
        adminEmail = userData.user.email;
      }
    } catch {
      // Fall through to custom auth
    }
  }

  // Fallback: custom localStorage auth via x-user-email header
  if (!adminEmail) {
    const customEmail = req.headers.get("x-user-email");
    if (customEmail) {
      adminEmail = customEmail;
    }
  }

  if (!adminEmail) {
    return jsonResponse({ error: "Authentication required" }, 401);
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("email", adminEmail)
    .maybeSingle();

  if (profileError) {
    return jsonResponse({ error: "Could not verify admin access" }, 500);
  }

  if (profile?.role !== "admin") {
    return jsonResponse({ error: "Admin access required" }, 403);
  }

  let payload: GroqRequest;

  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  let messages: GroqMessage[];

  try {
    messages = validateMessages(payload.messages);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Invalid request" }, 400);
  }

  const groqResponse = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: clampNumber(payload.temperature, 0.7, 0, 1),
      max_tokens: clampNumber(payload.max_tokens, 500, 50, 1000),
    }),
  });

  if (!groqResponse.ok) {
    return jsonResponse({ error: "AI provider request failed" }, 502);
  }

  const data = await groqResponse.json();
  return jsonResponse(data);
});
