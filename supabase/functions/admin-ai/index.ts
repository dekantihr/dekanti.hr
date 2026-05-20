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
  // Fetch real notes from Fragrantica before calling LLM
  fetch_notes?: {
    naziv: string;
    brand: string;
  };
  // Full product generation — fetches Fragrantica + generates everything
  full_product?: {
    naziv: string;
    brand: string;
  };
};

const MODEL = "llama-3.3-70b-versatile"; // Upgraded model for better accuracy
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

/**
 * Fetch fragrance notes from Fragrantica by scraping their search results.
 * Returns raw HTML text that the LLM can parse.
 */
async function fetchFragranticaNotes(naziv: string, brand: string): Promise<string> {
  // Build a search query for Fragrantica
  const query = encodeURIComponent(`${brand} ${naziv} fragrantica notes`);
  
  try {
    // Use DuckDuckGo HTML search (no API key needed, returns HTML we can parse)
    const searchUrl = `https://html.duckduckgo.com/html/?q=${query}+site:fragrantica.com`;
    
    const searchRes = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; dekantihr-bot/1.0)",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!searchRes.ok) return "";

    const searchHtml = await searchRes.text();
    
    // Extract the first Fragrantica URL from search results
    const fragranticaUrlMatch = searchHtml.match(/https?:\/\/www\.fragrantica\.com\/perfume\/[^"&\s]+/);
    if (!fragranticaUrlMatch) return "";

    const fragranticaUrl = fragranticaUrlMatch[0];
    
    // Fetch the Fragrantica page
    const pageRes = await fetch(fragranticaUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!pageRes.ok) return "";

    const pageHtml = await pageRes.text();
    
    // Extract relevant sections — Fragrantica uses specific patterns for notes
    // Look for the notes section in the HTML
    const notesSection = extractNotesFromHtml(pageHtml);
    
    console.log(`[admin-ai] Fetched Fragrantica data for "${brand} ${naziv}": ${notesSection.substring(0, 200)}`);
    
    return notesSection;
  } catch (error) {
    console.warn(`[admin-ai] Failed to fetch Fragrantica data: ${error}`);
    return "";
  }
}

/**
 * Extract notes text from Fragrantica HTML.
 * Fragrantica lists notes in pyramid sections.
 */
function extractNotesFromHtml(html: string): string {
  const extracted: string[] = [];

  // Fragrantica note patterns — they use various class names and structures
  // Try to find the notes pyramid section
  const pyramidPatterns = [
    // Look for "Top notes", "Heart notes", "Base notes" sections
    /top\s+notes?[^<]*<[^>]+>([^<]+)/gi,
    /heart\s+notes?[^<]*<[^>]+>([^<]+)/gi,
    /base\s+notes?[^<]*<[^>]+>([^<]+)/gi,
    // Fragrantica specific: notes listed in spans/divs
    /class="[^"]*note[^"]*"[^>]*>([^<]+)/gi,
    // Generic ingredient/note patterns
    /ingredient[^>]*>([^<]{3,50})</gi,
  ];

  for (const pattern of pyramidPatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      const text = match[1]?.trim();
      if (text && text.length > 2 && text.length < 100 && !text.includes('{') && !text.includes('function')) {
        extracted.push(text);
      }
    }
  }

  // Also try to find the structured notes data in JSON-LD or meta tags
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (jsonLdMatch) {
    extracted.push(`JSON-LD: ${jsonLdMatch[1].substring(0, 500)}`);
  }

  // Extract title to confirm we got the right perfume
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (titleMatch) {
    extracted.unshift(`Page title: ${titleMatch[1]}`);
  }

  // Extract any text that looks like note names (common fragrance ingredients)
  const noteKeywords = ['bergamot', 'rose', 'jasmine', 'musk', 'sandalwood', 'vanilla', 'cedar', 'amber',
    'lemon', 'orange', 'lavender', 'iris', 'patchouli', 'vetiver', 'oud', 'neroli', 'ylang',
    'peach', 'apple', 'pear', 'violet', 'lily', 'tuberose', 'oakmoss', 'tonka', 'benzoin'];
  
  const foundNotes: string[] = [];
  for (const note of noteKeywords) {
    const regex = new RegExp(`\\b${note}\\b`, 'gi');
    if (regex.test(html)) {
      foundNotes.push(note);
    }
  }
  
  if (foundNotes.length > 0) {
    extracted.push(`Detected ingredients: ${foundNotes.join(', ')}`);
  }

  return extracted.slice(0, 20).join('\n');
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

  // If fetch_notes is requested, scrape Fragrantica first and inject the data
  if (payload.fetch_notes || payload.full_product) {
    const target = payload.fetch_notes || payload.full_product!;
    const { naziv, brand } = target;
    console.log(`[admin-ai] Fetching real notes for: ${brand} - ${naziv}`);
    
    const realNotesData = await fetchFragranticaNotes(naziv, brand);
    
    if (realNotesData) {
      // Inject the real data into the last user message
      const lastUserMsgIdx = messages.map(m => m.role).lastIndexOf('user');
      if (lastUserMsgIdx >= 0) {
        messages[lastUserMsgIdx] = {
          ...messages[lastUserMsgIdx],
          content: messages[lastUserMsgIdx].content + 
            `\n\n--- REAL DATA FROM FRAGRANTICA ---\n${realNotesData}\n--- END REAL DATA ---\n\nUse the real data above to extract accurate notes. If the data clearly matches this perfume, use those exact notes. If the data is unclear or doesn't match, use your knowledge of this specific perfume.`,
        };
      }
    }
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
      temperature: clampNumber(payload.temperature, 0.3, 0, 1), // Lower temp for factual notes
      max_tokens: clampNumber(payload.max_tokens, 500, 50, 1000),
    }),
  });

  if (!groqResponse.ok) {
    const errText = await groqResponse.text();
    console.error(`[admin-ai] Groq error: ${errText}`);
    return jsonResponse({ error: "AI provider request failed" }, 502);
  }

  const data = await groqResponse.json();
  return jsonResponse(data);
});
