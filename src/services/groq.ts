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

export const groqService = {
  generateProductDescription,
  generateScentNotes,
  generateBrandDescription,
  generateSKU,
  generateLongDescription,
};
