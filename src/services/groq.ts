/**
 * Groq AI Service
 * 
 * Provides AI-powered content generation for:
 * - Product descriptions
 * - Scent notes (top, heart, base)
 * - Brand descriptions
 * - SKU code generation
 * 
 * Model: llama-3.1-8b-instant (fast, efficient)
 */

import { supabase } from '../utils/supabase';

const MODEL = 'llama-3.3-70b-versatile';
const USER_KEY = 'dekanti_user';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqRequest {
  model: string;
  messages: GroqMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

function getCurrentUserEmail(): string | null {
  try {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      return user?.email || null;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Call Groq API through the Supabase Edge Function
 */
async function callGroq(messages: GroqMessage[], temperature = 0.7, maxTokens = 500): Promise<string> {
  const request: GroqRequest = {
    model: MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  try {
    const userEmail = getCurrentUserEmail();
    const headers: Record<string, string> = {};
    if (userEmail) {
      headers['x-user-email'] = userEmail;
    }

    const { data, error } = await supabase.functions.invoke<GroqResponse>('admin-ai', {
      body: request,
      headers,
    });

    if (error) {
      throw error;
    }

    return data?.choices[0]?.message?.content?.trim() || '';
  } catch (error: any) {
    console.error('Groq API error:', error);
    throw new Error(error.message || 'Greška pri komunikaciji sa AI servisom');
  }
}

/**
 * Generate product description
 */
export async function generateProductDescription(
  naziv: string,
  brand: string,
  koncentracija: string,
  spol: string
): Promise<string> {
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: 'Ti si stručnjak za parfeme i pišeš profesionalne opise proizvoda za online trgovinu. Piši na hrvatskom jeziku, elegantno i privlačno, fokusirajući se na kvalitetu i luksuz.'
    },
    {
      role: 'user',
      content: `Napiši kratak opis (2-3 rečenice) za parfem:
Naziv: ${naziv}
Brand: ${brand}
Koncentracija: ${koncentracija}
Spol: ${spol}

Opis treba biti privlačan, profesionalan i fokusiran na kvalitetu proizvoda.`
    }
  ];

  return await callGroq(messages, 0.8, 300);
}

/**
 * Generate scent notes (top, heart, base) — fetches real data from Fragrantica
 */
export async function generateScentNotes(
  naziv: string,
  brand: string
): Promise<{ note_vrha: string; note_srca: string; note_baze: string }> {
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `You are a fragrance expert with encyclopedic knowledge of perfumes. Your task is to provide ACCURATE, REAL fragrance notes for specific perfumes — not invented ones.

CRITICAL RULES:
1. Use ONLY real, documented notes for this specific perfume from Fragrantica, Parfumo, or official brand sources
2. If real data is provided below, extract notes from it precisely
3. If you know this perfume well from your training data, use those exact notes
4. Do NOT invent or guess notes — accuracy is essential for a perfume shop
5. Respond ONLY in JSON format, no other text
6. Notes should be in Croatian language (e.g. "bergamot" stays "bergamot", "ruža" for rose, "sandalovina" for sandalwood, "mošus" for musk, "vanilija" for vanilla, "pačuli" for patchouli, "cedrovino" for cedarwood, "tamjan" for frankincense, "iris" stays "iris", "jasmin" stays "jasmin")`
    },
    {
      role: 'user',
      content: `Provide the REAL, ACCURATE fragrance notes for: "${naziv}" by ${brand}

This is a real perfume sold in our shop. Use your knowledge of this specific perfume.

Respond ONLY in this JSON format:
{
  "note_vrha": "bergamot, limun, naranča",
  "note_srca": "ruža, jasmin, iris",
  "note_baze": "mošus, sandalovina, vanilija"
}

Use the actual documented notes for this perfume. If you are not certain about specific notes, use the most commonly cited ones from fragrance databases.`
    }
  ];

  // Build the request with fetch_notes to trigger Fragrantica scraping
  const request = {
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.2, // Very low — we want factual, not creative
    max_tokens: 250,
    fetch_notes: { naziv, brand }, // Triggers server-side Fragrantica fetch
  };

  try {
    const userEmail = getCurrentUserEmail();
    const headers: Record<string, string> = {};
    if (userEmail) {
      headers['x-user-email'] = userEmail;
    }

    const { data, error } = await supabase.functions.invoke<GroqResponse>('admin-ai', {
      body: request,
      headers,
    });

    if (error) throw error;

    const response = data?.choices[0]?.message?.content?.trim() || '';
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response');
    
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      note_vrha: parsed.note_vrha || '',
      note_srca: parsed.note_srca || '',
      note_baze: parsed.note_baze || '',
    };
  } catch (error: any) {
    console.error('Failed to generate scent notes:', error);
    throw new Error(error.message || 'Greška pri generiranju nota parfema');
  }
}

/**
 * Generate brand description
 */
export async function generateBrandDescription(naziv: string): Promise<string> {
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: 'Ti si stručnjak za luksuzne brendove i pišeš profesionalne opise brendova parfema. Piši na hrvatskom jeziku, elegantno i informativno.'
    },
    {
      role: 'user',
      content: `Napiši kratak opis (2-3 rečenice) za parfemski brand "${naziv}".

Opis treba biti informativan, profesionalan i fokusiran na historiju i kvalitetu brenda.`
    }
  ];

  return await callGroq(messages, 0.8, 300);
}

/**
 * Generate SKU code
 */
export async function generateSKU(
  naziv: string,
  brand: string,
  ml: number
): Promise<string> {
  // Generate SKU format: BRAND-PRODUCT-ML
  // Example: TF-NOIR-50, CHANEL-NO5-100
  
  const brandCode = brand
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6);
  
  const productCode = naziv
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8);
  
  const sku = `${brandCode}-${productCode}-${ml}`;
  
  return sku;
}

/**
 * Generate long product description with detailed information
 */
export async function generateLongDescription(
  naziv: string,
  brand: string,
  koncentracija: string,
  spol: string,
  note_vrha?: string,
  note_srca?: string,
  note_baze?: string
): Promise<string> {
  const notesInfo = note_vrha && note_srca && note_baze
    ? `\nNote vrha: ${note_vrha}\nNote srca: ${note_srca}\nNote baze: ${note_baze}`
    : '';

  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: 'Ti si stručnjak za parfeme i pišeš detaljne opise proizvoda za online trgovinu. Piši na hrvatskom jeziku, elegantno i profesionalno, sa fokusom na senzorsko iskustvo i kvalitetu.'
    },
    {
      role: 'user',
      content: `Napiši detaljan opis (4-5 rečenica) za parfem:
Naziv: ${naziv}
Brand: ${brand}
Koncentracija: ${koncentracija}
Spol: ${spol}${notesInfo}

Opis treba biti bogat, senzoran i privlačan, opisujući miris, osjećaj i prilike za nošenje.`
    }
  ];

  return await callGroq(messages, 0.8, 500);
}

/**
 * Generate a complete product from just the name and brand.
 * Fetches real data from Fragrantica, then fills in ALL fields:
 * spol, sezona, koncentracija, slug, notes, descriptions, and sizes with prices.
 */
export async function generateFullProduct(
  naziv: string,
  brand: string
): Promise<{
  slug: string;
  koncentracija: string;
  spol: string;
  sezona: string;
  opis_kratki: string;
  opis_dugi: string;
  note_vrha: string;
  note_srca: string;
  note_baze: string;
  product_sizes: Array<{ velicina_ml: number; cijena: number; zaliha: number; sku: string }>;
}> {
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `You are a fragrance database expert. You have encyclopedic knowledge of perfumes and their exact documented properties.

CRITICAL RULES:
1. Use ONLY real, documented information for this specific perfume
2. If Fragrantica data is provided below, use it as the primary source
3. Do NOT invent or hallucinate any information
4. For notes: use the actual documented pyramid notes from Fragrantica/official sources
5. For spol: use the actual target gender (muški/ženski/unisex)
6. For sezona: use the most commonly recommended season
7. For koncentracija: use the actual concentration (EDP/EDT/Parfum/EDC)
8. For prices: use realistic Croatian market prices for decants (2ml, 5ml, 10ml)
   - 2ml: typically 4-12€ depending on brand prestige
   - 5ml: typically 10-25€
   - 10ml: typically 18-45€
   - Niche/luxury brands (Xerjoff, Creed, Amouage, etc.) are at the higher end
   - Designer brands (Chanel, Dior, YSL, etc.) are in the middle
9. Respond ONLY in valid JSON, no other text
10. slug: lowercase, hyphens only, no special chars (e.g. "black-orchid" for "Black Orchid")`
    },
    {
      role: 'user',
      content: `Generate complete product data for: "${naziv}" by ${brand}

Respond ONLY in this exact JSON format:
{
  "slug": "product-name-slug",
  "koncentracija": "EDP",
  "spol": "unisex",
  "sezona": "jesen",
  "opis_kratki": "Short 1-2 sentence description in Croatian",
  "opis_dugi": "Detailed 3-4 sentence description in Croatian describing the scent experience",
  "note_vrha": "bergamot, limun, naranča",
  "note_srca": "ruža, jasmin, iris",
  "note_baze": "mošus, sandalovina, vanilija",
  "product_sizes": [
    { "velicina_ml": 2, "cijena": 6.50, "zaliha": 10, "sku": "BRAND-PRODUCT-2" },
    { "velicina_ml": 5, "cijena": 14.00, "zaliha": 10, "sku": "BRAND-PRODUCT-5" },
    { "velicina_ml": 10, "cijena": 25.00, "zaliha": 10, "sku": "BRAND-PRODUCT-10" }
  ]
}

Valid values:
- koncentracija: "EDP" | "EDT" | "Parfum" | "EDC" | "EDP Extrait" | "EDP Intense"
- spol: "muški" | "ženski" | "unisex"
- sezona: "proljeće" | "ljeto" | "jesen" | "zima" | "sve"

Use the REAL documented notes and properties for this perfume.`
    }
  ];

  const request = {
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.15, // Very low for factual accuracy
    max_tokens: 800,
    full_product: { naziv, brand }, // Triggers Fragrantica scraping
  };

  try {
    const userEmail = getCurrentUserEmail();
    const headers: Record<string, string> = {};
    if (userEmail) {
      headers['x-user-email'] = userEmail;
    }

    const { data, error } = await supabase.functions.invoke<GroqResponse>('admin-ai', {
      body: request,
      headers,
    });

    if (error) throw error;

    const response = data?.choices[0]?.message?.content?.trim() || '';

    // Extract JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI nije vratio valjani JSON odgovor');

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and sanitize
    const validKoncentracija = ['EDP', 'EDT', 'Parfum', 'EDC', 'EDP Extrait', 'EDP Intense'];
    const validSpol = ['muški', 'ženski', 'unisex'];
    const validSezona = ['proljeće', 'ljeto', 'jesen', 'zima', 'sve'];

    // Generate slug from naziv if AI didn't provide a good one
    const generateSlug = (name: string) =>
      name.toLowerCase()
        .replace(/[čć]/g, 'c').replace(/[šđ]/g, 's').replace(/ž/g, 'z')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Generate SKU
    const brandCode = brand.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6);
    const productCode = naziv.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8);

    const sizes = Array.isArray(parsed.product_sizes) && parsed.product_sizes.length > 0
      ? parsed.product_sizes.map((s: any) => ({
          velicina_ml: Number(s.velicina_ml) || 10,
          cijena: Number(s.cijena) || 0,
          zaliha: Number(s.zaliha) || 10,
          sku: s.sku || `${brandCode}-${productCode}-${s.velicina_ml}`,
        }))
      : [
          { velicina_ml: 2, cijena: 0, zaliha: 10, sku: `${brandCode}-${productCode}-2` },
          { velicina_ml: 5, cijena: 0, zaliha: 10, sku: `${brandCode}-${productCode}-5` },
          { velicina_ml: 10, cijena: 0, zaliha: 10, sku: `${brandCode}-${productCode}-10` },
        ];

    return {
      slug: parsed.slug || generateSlug(naziv),
      koncentracija: validKoncentracija.includes(parsed.koncentracija) ? parsed.koncentracija : 'EDP',
      spol: validSpol.includes(parsed.spol) ? parsed.spol : 'unisex',
      sezona: validSezona.includes(parsed.sezona) ? parsed.sezona : 'sve',
      opis_kratki: parsed.opis_kratki || '',
      opis_dugi: parsed.opis_dugi || '',
      note_vrha: parsed.note_vrha || '',
      note_srca: parsed.note_srca || '',
      note_baze: parsed.note_baze || '',
      product_sizes: sizes,
    };
  } catch (error: any) {
    console.error('Failed to generate full product:', error);
    throw new Error(error.message || 'Greška pri generiranju proizvoda');
  }
}

export const groqService = {
  generateProductDescription,
  generateScentNotes,
  generateBrandDescription,
  generateSKU,
  generateLongDescription,
  generateFullProduct,
};
