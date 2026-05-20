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
 * Parse Fragrantica page text directly — no LLM needed for notes.
 * The format is consistent: "Top notes are X, Y; middle notes are A, B; base notes are C, D"
 * and the pyramid section "Top Notes\nNote1\nNote2\n..."
 */
function parseFragranticaText(text: string): {
  note_vrha: string;
  note_srca: string;
  note_baze: string;
  spol: string;
  sezona: string;
  koncentracija: string;
  opis_kratki: string;
} {
  const result = {
    note_vrha: '',
    note_srca: '',
    note_baze: '',
    spol: 'unisex',
    sezona: 'sve',
    koncentracija: 'EDP',
    opis_kratki: '',
  };

  // ── Notes from the sentence pattern ──────────────────────────────────────
  // "Top notes are Sea Notes, Aldehydes, Coriander and Red Pepper; middle notes are..."
  const sentenceMatch = text.match(
    /Top notes? (?:are|is) ([^;]+?);\s*middle notes? (?:are|is) ([^;]+?);\s*base notes? (?:are|is) ([^."]+)/i
  );
  if (sentenceMatch) {
    const clean = (s: string) =>
      s.replace(/ and /gi, ', ').replace(/\s+/g, ' ').trim();
    result.note_vrha = clean(sentenceMatch[1]);
    result.note_srca = clean(sentenceMatch[2]);
    result.note_baze = clean(sentenceMatch[3]);
  }

  // ── Notes from the pyramid section (visual layout) ────────────────────────
  // "Top Notes\nSea Notes\nAldehydes\n...\nMiddle Notes\n..."
  if (!result.note_vrha) {
    const pyramidMatch = text.match(
      /Top Notes?\s+([\s\S]+?)\s+Middle Notes?\s+([\s\S]+?)\s+Base Notes?\s+([\s\S]+?)(?:\n\n|Vote for|$)/i
    );
    if (pyramidMatch) {
      const parseSection = (s: string) =>
        s.split('\n')
          .map(l => l.trim())
          .filter(l => l.length > 1 && l.length < 60 && !/^\d/.test(l) && !/^(show|hide|vote)/i.test(l))
          .join(', ');
      result.note_vrha = parseSection(pyramidMatch[1]);
      result.note_srca = parseSection(pyramidMatch[2]);
      result.note_baze = parseSection(pyramidMatch[3]);
    }
  }

  // ── Gender ────────────────────────────────────────────────────────────────
  if (/for women and men|unisex/i.test(text)) result.spol = 'unisex';
  else if (/for women\b/i.test(text)) result.spol = 'ženski';
  else if (/for men\b/i.test(text)) result.spol = 'muški';

  // ── Season from "When To Wear" votes ─────────────────────────────────────
  const summerMatch = text.match(/summer(\d+)/i);
  const winterMatch = text.match(/winter(\d+)/i);
  const springMatch = text.match(/spring(\d+)/i);
  const fallMatch   = text.match(/fall(\d+)/i);
  const seasons: [string, number][] = [
    ['ljeto',    summerMatch ? parseInt(summerMatch[1]) : 0],
    ['zima',     winterMatch ? parseInt(winterMatch[1]) : 0],
    ['proljeće', springMatch ? parseInt(springMatch[1]) : 0],
    ['jesen',    fallMatch   ? parseInt(fallMatch[1])   : 0],
  ];
  const topSeason = seasons.sort((a, b) => b[1] - a[1])[0];
  if (topSeason[1] > 0) result.sezona = topSeason[0];

  // ── Concentration ─────────────────────────────────────────────────────────
  if (/\bparfum\b/i.test(text) && !/eau de parfum/i.test(text)) result.koncentracija = 'Parfum';
  else if (/eau de toilette|EDT/i.test(text)) result.koncentracija = 'EDT';
  else if (/eau de cologne|EDC/i.test(text)) result.koncentracija = 'EDC';
  else result.koncentracija = 'EDP';

  // ── Short description from brand note ─────────────────────────────────────
  const brandNoteMatch = text.match(/"([^"]{40,300})"\s*-\s*a note from the brand/i);
  if (brandNoteMatch) result.opis_kratki = brandNoteMatch[1].trim();

  return result;
}

/**
 * Translate English note names to Croatian.
 */
function translateNotes(notes: string): string {
  const map: Record<string, string> = {
    'sea notes': 'morski akord',
    'sea note': 'morski akord',
    'aldehydes': 'aldehidi',
    'aldehyde': 'aldehid',
    'coriander': 'korijander',
    'red pepper': 'crvena paprika',
    'pimento': 'pimento',
    'juniper': 'smreka',
    'iris': 'iris',
    'amyl salicylate': 'amil salicilat',
    'rose': 'ruža',
    'seaweed': 'morske alge',
    'ambergris': 'sivi jantar',
    'cedar': 'cedar',
    'amberwood': 'amberwood',
    'bergamot': 'bergamot',
    'lemon': 'limun',
    'orange': 'naranča',
    'jasmine': 'jasmin',
    'musk': 'mošus',
    'sandalwood': 'sandalovina',
    'vanilla': 'vanilija',
    'patchouli': 'pačuli',
    'vetiver': 'vetiver',
    'amber': 'jantar',
    'oud': 'oud',
    'neroli': 'neroli',
    'lavender': 'lavanda',
    'ylang-ylang': 'ylang-ylang',
    'tonka bean': 'tonka',
    'benzoin': 'benzoin',
    'frankincense': 'tamjan',
    'incense': 'tamjan',
    'oakmoss': 'hrastova mahovina',
    'grapefruit': 'grejp',
    'peach': 'breskva',
    'apple': 'jabuka',
    'pear': 'kruška',
    'violet': 'ljubičica',
    'lily': 'ljiljan',
    'tuberose': 'tuberoza',
    'cardamom': 'kardamom',
    'black pepper': 'crni papar',
    'pink pepper': 'ružičasti papar',
    'ginger': 'đumbir',
    'cinnamon': 'cimet',
    'clove': 'klinčić',
    'nutmeg': 'muškatni oraščić',
    'tobacco': 'duhan',
    'leather': 'koža',
    'woody notes': 'drvene note',
    'white musk': 'bijeli mošus',
    'clean musk': 'čisti mošus',
    'aquatic notes': 'akvatične note',
    'marine': 'morski akord',
    'salt': 'sol',
    'salty': 'slano',
  };

  return notes
    .split(',')
    .map(n => {
      const trimmed = n.trim();
      const lower = trimmed.toLowerCase();
      return map[lower] || trimmed; // keep original if no translation
    })
    .join(', ');
}

export async function generateFullProduct(
  naziv: string,
  brand: string,
  fragranticaText?: string
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
  const hasRealData = fragranticaText && fragranticaText.trim().length > 50;

  // ── STEP 1: Parse Fragrantica text deterministically (no LLM for notes) ──
  let parsedNotes = { note_vrha: '', note_srca: '', note_baze: '', spol: 'unisex', sezona: 'sve', koncentracija: 'EDP', opis_kratki: '' };
  if (hasRealData) {
    parsedNotes = parseFragranticaText(fragranticaText!);
    // Translate English note names to Croatian
    parsedNotes.note_vrha = translateNotes(parsedNotes.note_vrha);
    parsedNotes.note_srca = translateNotes(parsedNotes.note_srca);
    parsedNotes.note_baze = translateNotes(parsedNotes.note_baze);
  }

  // ── STEP 2: Use LLM only for slug, descriptions, and prices ──────────────
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `You are a fragrance copywriter. Generate product metadata for a perfume shop.
Write descriptions in Croatian. Respond ONLY in valid JSON.`,
    },
    {
      role: 'user',
      content: hasRealData
        ? `Generate metadata for "${naziv}" by ${brand}.

Known facts from Fragrantica:
- Gender: ${parsedNotes.spol}
- Season: ${parsedNotes.sezona}
- Concentration: ${parsedNotes.koncentracija}
- Top notes: ${parsedNotes.note_vrha}
- Heart notes: ${parsedNotes.note_srca}
- Base notes: ${parsedNotes.note_baze}
${parsedNotes.opis_kratki ? `- Brand description: "${parsedNotes.opis_kratki}"` : ''}

Respond ONLY in this JSON format (do NOT change the notes — they are already correct):
{
  "slug": "product-name-slug",
  "opis_kratki": "1-2 sentence Croatian description based on the notes above",
  "opis_dugi": "3-4 sentence Croatian description of the scent experience",
  "product_sizes": [
    { "velicina_ml": 2, "cijena": 6.50, "zaliha": 10, "sku": "BRAND-PRODUCT-2" },
    { "velicina_ml": 5, "cijena": 14.00, "zaliha": 10, "sku": "BRAND-PRODUCT-5" },
    { "velicina_ml": 10, "cijena": 25.00, "zaliha": 10, "sku": "BRAND-PRODUCT-10" }
  ]
}

slug: lowercase, hyphens, no special chars. Prices: realistic Croatian decant market prices.`
        : `Generate metadata for "${naziv}" by ${brand}.

Respond ONLY in this JSON format:
{
  "slug": "product-name-slug",
  "koncentracija": "EDP",
  "spol": "unisex",
  "sezona": "sve",
  "opis_kratki": "1-2 sentence Croatian description",
  "opis_dugi": "3-4 sentence Croatian description",
  "product_sizes": [
    { "velicina_ml": 2, "cijena": 6.50, "zaliha": 10, "sku": "BRAND-PRODUCT-2" },
    { "velicina_ml": 5, "cijena": 14.00, "zaliha": 10, "sku": "BRAND-PRODUCT-5" },
    { "velicina_ml": 10, "cijena": 25.00, "zaliha": 10, "sku": "BRAND-PRODUCT-10" }
  ]
}

Valid: koncentracija: EDP/EDT/Parfum/EDC | spol: muški/ženski/unisex | sezona: proljeće/ljeto/jesen/zima/sve`,
    }
  ];

  const request = {
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: hasRealData ? 0.1 : 0.2,
    max_tokens: 800,
    // Only trigger server-side Fragrantica scraping if user didn't paste data
    ...(hasRealData ? {} : { full_product: { naziv, brand } }),
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
      koncentracija: hasRealData
        ? parsedNotes.koncentracija
        : (validKoncentracija.includes(parsed.koncentracija) ? parsed.koncentracija : 'EDP'),
      spol: hasRealData
        ? parsedNotes.spol
        : (validSpol.includes(parsed.spol) ? parsed.spol : 'unisex'),
      sezona: hasRealData
        ? parsedNotes.sezona
        : (validSezona.includes(parsed.sezona) ? parsed.sezona : 'sve'),
      // Notes come from deterministic parser when real data is available
      note_vrha: hasRealData ? parsedNotes.note_vrha : (parsed.note_vrha || ''),
      note_srca: hasRealData ? parsedNotes.note_srca : (parsed.note_srca || ''),
      note_baze: hasRealData ? parsedNotes.note_baze : (parsed.note_baze || ''),
      // Descriptions from LLM (it's good at writing, just not at knowing facts)
      opis_kratki: parsed.opis_kratki || parsedNotes.opis_kratki || '',
      opis_dugi: parsed.opis_dugi || '',
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
