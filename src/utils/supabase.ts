import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (will be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      brands: {
        Row: {
          id: number;
          naziv: string;
          opis: string | null;
          logo_url: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      products: {
        Row: {
          id: number;
          naziv: string;
          slug: string;
          brand_id: number;
          opis_kratki: string | null;
          opis_dugi: string | null;
          koncentracija: 'EDP' | 'EDT' | 'Parfum' | 'EDP Extrait' | 'EDC' | 'EDP Intense';
          spol: 'muški' | 'ženski' | 'unisex';
          sezona: 'proljeće' | 'ljeto' | 'jesen' | 'zima' | 'sve';
          featured: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      product_sizes: {
        Row: {
          id: number;
          product_id: number;
          velicina_ml: number;
          cijena: number;
          zaliha: number;
          sku: string | null;
          created_at: string;
        };
      };
      users: {
        Row: {
          id: number;
          email: string;
          password_hash: string;
          ime: string;
          prezime: string;
          adresa: string | null;
          grad: string | null;
          postanski_broj: string | null;
          telefon: string | null;
          role: 'admin' | 'kupac';
          newsletter_subscribed: boolean;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      orders: {
        Row: {
          id: number;
          user_id: number | null;
          order_number: string;
          status: 'nova' | 'u_obradi' | 'poslano' | 'isporuceno' | 'otkazano' | 'povrat';
          ime: string;
          prezime: string;
          email: string;
          telefon: string;
          adresa: string;
          grad: string;
          postanski_broj: string;
          napomena: string | null;
          nacin_dostave: 'boxnow' | 'osobno_preuzimanje';
          nacin_placanja: 'pouzecem' | 'bankovna' | 'kartica';
          cijena_dostave: number;
          subtotal: number;
          popust_iznos: number;
          kupon_id: number | null;
          ukupno: number;
          tracking_broj: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      coupons: {
        Row: {
          id: number;
          kod: string;
          tip: 'postotak' | 'fiksni';
          vrijednost: number;
          min_iznos_narudzbe: number;
          max_popust: number | null;
          broj_koristenja: number;
          max_koristenja: number | null;
          aktivan: boolean;
          vrijedi_do: string | null;
          created_at: string;
        };
      };
    };
  };
}
