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

const MODEL = 'llama-3.1-8b-instant';
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
 * Generate scent notes (top, heart, base)
 */
export async function generateScentNotes(
  naziv: string,
  brand: string
): Promise<{ note_vrha: string; note_srca: string; note_baze: string }> {
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: 'Ti si parfemski stručnjak koji poznaje note parfema. Generiraj realistične note parfema na hrvatskom jeziku. Odgovori SAMO u JSON formatu bez dodatnog teksta.'
    },
    {
      role: 'user',
      content: `Za parfem "${naziv}" od branda "${brand}", generiraj note parfema.

Odgovori u JSON formatu:
{
  "note_vrha": "bergamot, limun, naranča",
  "note_srca": "ruža, jasmin, lavanda",
  "note_baze": "mošus, sandalovina, vanilija"
}

Koristi realne sastojke koji se koriste u parfemima. Odgovori SAMO JSON bez dodatnog teksta.`
    }
  ];

  const response = await callGroq(messages, 0.7, 200);
  
  try {
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      note_vrha: parsed.note_vrha || '',
      note_srca: parsed.note_srca || '',
      note_baze: parsed.note_baze || '',
    };
  } catch (error) {
    console.error('Failed to parse scent notes:', error);
    // Fallback to generic notes
    return {
      note_vrha: 'citrus, bergamot',
      note_srca: 'ruža, jasmin',
      note_baze: 'mošus, sandalovina',
    };
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
