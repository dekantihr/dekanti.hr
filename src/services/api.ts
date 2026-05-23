import { supabase } from '../utils/supabase';

import type { User } from '../store/cartStore';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Helper: transform product_images objects into a flat images[] string array
function mapProductImages(product: any) {
  if (!product) return product;
  if (product.product_images && product.product_images.length > 0) {
    product.images = product.product_images
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((img: any) => img.url);
  } else {
    product.images = [];
  }
  return product;
}

// ============================================================
// API SERVICE LAYER
// ============================================================

export const api = {
  // ============================================================
  // AUTHENTICATION
  // ============================================================

  /**
   * Login user using custom RPC function
   */
  async login(email: string, lozinka: string) {
    try {
      const { data, error } = await supabase.rpc('verify_login', {
        p_email: email,
        p_password: lozinka
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data.user as User;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  /**
   * Register new user using custom RPC function
   */
  async register(email: string, lozinka: string, ime: string, prezime: string) {
    try {
      const { data, error } = await supabase.rpc('register_user', {
        p_email: email,
        p_password: lozinka,
        p_ime: ime,
        p_prezime: prezime
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data.user as User;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  // ============================================================
  // PRODUCTS
  // ============================================================

  /**
   * Get all active products with brands and sizes
   */
  async getProducts(filters?: {
    brand?: string;
    spol?: 'muški' | 'ženski' | 'unisex';
    sezona?: string;
    featured?: boolean;
    search?: string;
  }) {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          brands (
            id,
            naziv,
            logo_url
          ),
          product_sizes (
            id,
            velicina_ml,
            cijena,
            zaliha,
            sku
          ),
          product_images (
            url,
            alt_text,
            sort_order
          )
        `)
        .eq('active', true);

      // Apply filters
      if (filters?.brand) {
        const { data: brand } = await supabase
          .from('brands')
          .select('id')
          .eq('naziv', filters.brand)
          .single();
        
        if (brand) {
          query = query.eq('brand_id', brand.id);
        }
      }

      if (filters?.spol) {
        query = query.eq('spol', filters.spol);
      }

      if (filters?.sezona) {
        query = query.eq('sezona', filters.sezona);
      }

      if (filters?.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      if (filters?.search) {
        query = query.ilike('naziv', `%${filters.search}%`);
      }

      // Order by featured first, then by created date
      query = query.order('featured', { ascending: false });
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(mapProductImages);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get single product by slug
   */
  async getProductBySlug(slug: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brands (
            id,
            naziv,
            logo_url,
            opis
          ),
          product_sizes (
            id,
            velicina_ml,
            cijena,
            zaliha,
            sku
          ),
          product_images (
            url,
            alt_text,
            sort_order
          )
        `)
        .eq('slug', slug)
        .eq('active', true)
        .single();

      if (error) throw error;
      
      // Map product_images to flat images array
      mapProductImages(data);

      // Parse string notes into the array format expected by ProductPage
      if (data) {
        const notes: any[] = [];
        if (data.note_vrha) {
          notes.push(...data.note_vrha.split(',').map((n: string) => ({ tip: 'top', naziv: n.trim() })));
        }
        if (data.note_srca) {
          notes.push(...data.note_srca.split(',').map((n: string) => ({ tip: 'heart', naziv: n.trim() })));
        }
        if (data.note_baze) {
          notes.push(...data.note_baze.split(',').map((n: string) => ({ tip: 'base', naziv: n.trim() })));
        }
        data.notes = notes;
      }

      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brands (naziv, logo_url),
          product_sizes (id, velicina_ml, cijena, zaliha),
          product_images (url, alt_text, sort_order)
        `)
        .eq('active', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(mapProductImages);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // ============================================================
  // BRANDS
  // ============================================================

  /**
   * Get all active brands
   */
  async getBrands() {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('active', true)
        .order('naziv');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  },

  // ============================================================
  // CATEGORIES
  // ============================================================

  /**
   * Get all active categories
   */
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // ============================================================
  // ORDERS
  // ============================================================

  /**
   * Create new order
   */
  async createOrder(orderData: {
    user_id?: number | null;
    ime: string;
    prezime: string;
    email: string;
    telefon: string;
    adresa: string;
    grad: string;
    postanski_broj: string;
    napomena?: string;
    nacin_dostave: 'hp_posta24' | 'osobno_preuzimanje';
    nacin_placanja: 'pouzecem' | 'bankovna' | 'kartica' | 'revolut';
    cijena_dostave: number;
    subtotal: number;
    popust_iznos: number;
    kupon_id?: number | null;
    ukupno: number;
    placeno?: boolean;
    payment_reference?: string;
    status?: 'cekanje_uplate' | 'nova';
    items: Array<{
      product_size_id: number;
      naziv_proizvoda: string;
      brand_naziv: string;
      ml: number;
      cijena: number;
      kolicina: number;
    }>;
  }) {
    try {
      // Generate order number server-side to avoid collisions
      let order_number: string;
      try {
        const { data: generatedNumber, error: genError } = await supabase
          .rpc('generate_order_number');
        if (genError || !generatedNumber) throw genError;
        order_number = generatedNumber as string;
      } catch {
        // Fallback: client-side generation (still has collision risk but rare)
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        order_number = `HR-${year}-${random}`;
      }

      // Use the supplied payment reference as the order number if given
      // (so the Revolut payment description matches the order_number)
      if (orderData.payment_reference) {
        order_number = orderData.payment_reference;
      }

      // Create order
      const insertPayload: Record<string, unknown> = {
        user_id: orderData.user_id,
        order_number,
        status: orderData.status ?? 'nova',
        ime: orderData.ime,
        prezime: orderData.prezime,
        email: orderData.email,
        telefon: orderData.telefon,
        adresa: orderData.adresa,
        grad: orderData.grad,
        postanski_broj: orderData.postanski_broj,
        napomena: orderData.napomena,
        nacin_dostave: orderData.nacin_dostave,
        nacin_placanja: orderData.nacin_placanja,
        cijena_dostave: orderData.cijena_dostave,
        subtotal: orderData.subtotal,
        popust_iznos: orderData.popust_iznos,
        kupon_id: orderData.kupon_id,
        ukupno: orderData.ukupno,
        payment_reference: orderData.payment_reference ?? order_number,
      };

      if (orderData.placeno) {
        insertPayload.placeno = true;
        insertPayload.datum_placanja = new Date().toISOString();
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(insertPayload)
        .select()
        .single();

      if (orderError) {
        console.error('Supabase order error:', orderError);
        console.error('Order data:', orderData);
        throw orderError;
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_size_id: item.product_size_id,
        naziv_proizvoda: item.naziv_proizvoda,
        brand_naziv: item.brand_naziv,
        ml: item.ml,
        cijena: item.cijena,
        kolicina: item.kolicina
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Reduce stock for each ordered item
      for (const item of orderData.items) {
        const { error: stockError } = await supabase.rpc('decrement_stock', {
          p_product_size_id: item.product_size_id,
          p_quantity: item.kolicina
        });
        if (stockError) {
          console.warn('Stock not reduced for item:', item.product_size_id, stockError);
        }
      }

      // Update coupon usage if applicable
      // For count_on_paid coupons (like PRVIH10), usage is counted when payment is confirmed,
      // not when the order is created — so skip increment here for those.
      if (orderData.kupon_id) {
        const { data: couponCheck } = await supabase
          .from('coupons')
          .select('count_on_paid')
          .eq('id', orderData.kupon_id)
          .single();

        if (!couponCheck?.count_on_paid) {
          // Regular coupon — increment on order creation
          const { error: couponError } = await supabase.rpc(
            'increment_coupon_usage',
            { coupon_id: orderData.kupon_id }
          );
          if (couponError) {
            console.warn('Coupon usage not updated:', couponError);
          }
        }
        // count_on_paid coupons are incremented in markOrderPaid()
      }

      return { ...order, order_items: orderItems };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product_sizes (
              velicina_ml,
              products (
                naziv,
                slug,
                brands (naziv)
              )
            )
          )
        `)
        .eq('order_number', orderNumber)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  /**
   * Get user orders
   */
  async getUserOrders(userId: number) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product_sizes (
              velicina_ml,
              products (naziv, slug)
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // ============================================================
  // COUPONS
  // ============================================================

  /**
   * Validate coupon code.
   * Pass cartItems to enable size-restricted coupon validation.
   */
  async validateCoupon(kod: string, subtotal: number, cartItems?: Array<{ ml: number }>) {
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('kod', kod.toUpperCase())
        .eq('aktivan', true)
        .single();

      if (error) {
        return {
          valid: false,
          error: 'Kupon nije pronađen'
        };
      }

      // Check if expired
      if (coupon.vrijedi_do && new Date(coupon.vrijedi_do) < new Date()) {
        return {
          valid: false,
          error: 'Kupon je istekao'
        };
      }

      // Check usage limit (for count_on_paid coupons, this is paid-order count)
      if (coupon.max_koristenja && coupon.broj_koristenja >= coupon.max_koristenja) {
        return {
          valid: false,
          error: 'Kupon je iskorišten maksimalan broj puta'
        };
      }

      // Check minimum order amount
      if (subtotal < coupon.min_iznos_narudzbe) {
        return {
          valid: false,
          error: `Minimalni iznos narudžbe za ovaj kupon je ${coupon.min_iznos_narudzbe.toFixed(2)}€`
        };
      }

      // Check size restriction — coupon only valid if cart has item of required size
      if (coupon.min_velicina_ml && cartItems && cartItems.length > 0) {
        const hasRequiredSize = cartItems.some(item => item.ml >= coupon.min_velicina_ml);
        if (!hasRequiredSize) {
          return {
            valid: false,
            error: `Kupon "${coupon.kod}" vrijedi samo za ${coupon.min_velicina_ml}ml veličinu`
          };
        }
      }

      // Calculate discount — only on eligible items if size-restricted
      let discountBase = subtotal;
      if (coupon.min_velicina_ml && cartItems && cartItems.length > 0) {
        // Apply discount only to items of the required size
        // (we don't have prices here, so apply to full subtotal but note the restriction)
        // The cart page passes subtotal already filtered — this is fine for display
      }

      let popust_iznos = 0;
      if (coupon.tip === 'postotak') {
        popust_iznos = discountBase * (coupon.vrijednost / 100);
        if (coupon.max_popust && popust_iznos > coupon.max_popust) {
          popust_iznos = coupon.max_popust;
        }
      } else {
        popust_iznos = coupon.vrijednost;
      }

      return {
        valid: true,
        coupon: {
          id: coupon.id,
          kod: coupon.kod,
          tip: coupon.tip,
          vrijednost: coupon.vrijednost,
          popust_iznos,
          count_on_paid: coupon.count_on_paid ?? false,
          min_velicina_ml: coupon.min_velicina_ml ?? null,
        }
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        valid: false,
        error: 'Greška pri validaciji kupona'
      };
    }
  },

  // ============================================================
  // WISHLIST
  // ============================================================

  /**
   * Get user wishlist
   */
  async getWishlist(userId: number) {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          products (
            *,
            brands (naziv, logo_url),
            product_sizes (id, velicina_ml, cijena, zaliha)
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  /**
   * Add product to wishlist
   */
  async addToWishlist(userId: number, productId: number) {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .insert({
          user_id: userId,
          product_id: productId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(userId: number, productId: number) {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  // ============================================================
  // REVIEWS
  // ============================================================

  /**
   * Get product reviews
   */
  async getProductReviews(productId: number) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users (ime, prezime)
        `)
        .eq('product_id', productId)
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  /**
   * Create review
   */
  async createReview(reviewData: {
    product_id: number;
    user_id: number;
    ocjena: number;
    naslov: string;
    tekst: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: reviewData.product_id,
          user_id: reviewData.user_id,
          ocjena: reviewData.ocjena,
          naslov: reviewData.naslov,
          tekst: reviewData.tekst,
          approved: false // Requires admin approval
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // ============================================================
  // NEWSLETTER
  // ============================================================

  /**
   * Subscribe to newsletter
   */
  async subscribeNewsletter(email: string) {
    try {
      const { data, error } = await supabase
        .from('newsletter')
        .insert({
          email: email.toLowerCase(),
          subscribed: true
        })
        .select()
        .single();

      if (error) {
        // Check if already subscribed
        if (error.code === '23505') {
          return {
            success: false,
            error: 'Email je već prijavljen na newsletter'
          };
        }
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return {
        success: false,
        error: 'Greška pri prijavi na newsletter'
      };
    }
  },

  /**
   * Get all newsletter subscribers (admin only)
   */
  async getNewsletterSubscribers() {
    try {
      const { data, error } = await supabase
        .from('newsletter')
        .select('*')
        .eq('subscribed', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching newsletter subscribers:', error);
      throw error;
    }
  },

  // ============================================================
  // ADMIN - ORDERS
  // ============================================================

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(orderNumber: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('order_number', orderNumber)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  /**
   * Update tracking number (admin only)
   */
  async updateTrackingNumber(orderNumber: string, trackingNumber: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          tracking_broj: trackingNumber,
          updated_at: new Date().toISOString()
        })
        .eq('order_number', orderNumber)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating tracking number:', error);
      throw error;
    }
  },

  /**
   * Mark order as paid (admin only).
   * If the order is in `cekanje_uplate` it also moves status to `nova`.
   * If the order used a count_on_paid coupon, increments its usage here.
   */
  async markOrderPaid(orderNumber: string) {
    try {
      const { data: existing, error: readError } = await supabase
        .from('orders')
        .select('status, placeno, kupon_id')
        .eq('order_number', orderNumber)
        .single();
      if (readError) throw readError;

      const updates: Record<string, unknown> = {
        placeno: true,
        datum_placanja: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (existing?.status === 'cekanje_uplate') {
        updates.status = 'nova';
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('order_number', orderNumber)
        .select()
        .single();

      if (error) throw error;

      // Increment coupon usage for count_on_paid coupons
      if (existing?.kupon_id) {
        const { data: coupon } = await supabase
          .from('coupons')
          .select('id, broj_koristenja, max_koristenja, count_on_paid')
          .eq('id', existing.kupon_id)
          .single();

        if (coupon?.count_on_paid) {
          const newCount = (coupon.broj_koristenja || 0) + 1;
          const reachedLimit = coupon.max_koristenja && newCount >= coupon.max_koristenja;

          await supabase
            .from('coupons')
            .update({
              broj_koristenja: newCount,
              // Auto-deactivate when limit is reached
              ...(reachedLimit ? { aktivan: false } : {}),
            })
            .eq('id', coupon.id);
        }
      }

      return data;
    } catch (error) {
      console.error('Error marking order as paid:', error);
      throw error;
    }
  },

  /**
   * Build a Revolut.me link for the merchant's personal handle.
   *
   * Personal `revolut.me/{handle}` links don't pre-fill amount —
   * Revolut Business / Merchant API would be required for that, and that
   * needs a registered business which we don't have. So we keep the link
   * simple and rely on the customer typing the amount + reference manually.
   * The order is created in `cekanje_uplate` status, then the merchant
   * confirms the incoming payment from their Revolut app and clicks
   * "Mark paid" in the admin panel.
   */
  buildRevolutLink(amountEur?: number): string {
    const username = (import.meta.env.VITE_REVOLUT_USERNAME as string) || 'dekantihr';
    const base = `https://revolut.me/${username}`;
    if (!amountEur || amountEur <= 0) return base;
    const cents = Math.round(amountEur * 100);
    return `${base}?amount=${cents}`;
  },

  getRevolutHandle(): string {
    return (import.meta.env.VITE_REVOLUT_USERNAME as string) || 'dekantihr';
  },

  /**
   * Check current payment status of an order.
   */
  async checkPaymentStatus(orderNumber: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('placeno, datum_placanja, status')
        .eq('order_number', orderNumber)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  },

  // ============================================================
  // EMAIL
  // ============================================================

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ to, subject, html }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('sendEmail failed:', data);
        throw new Error(data?.error || 'Email nije poslan');
      }
      return data;
    } catch (err) {
      console.error('sendEmail error:', err);
      throw err;
    }
  },

  // ============================================================
  // ADMIN - REVIEWS
  // ============================================================

  /**
   * Get pending reviews (admin only)
   */
  async getPendingReviews() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users (ime, prezime),
          products (naziv)
        `)
        .eq('approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      throw error;
    }
  },

  /**
   * Approve review (admin only)
   */
  async approveReview(reviewId: number) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ approved: true })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error approving review:', error);
      throw error;
    }
  },

  /**
   * Reject/delete review (admin only)
   */
  async rejectReview(reviewId: number) {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error rejecting review:', error);
      throw error;
    }
  },

  // ============================================================
  // STORAGE / IMAGE UPLOAD
  // ============================================================

  /**
   * Upload a product image to Supabase Storage
   * Returns the public URL of the uploaded image
   */
  async uploadProductImage(file: File, productSlug: string): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${productSlug}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  /**
   * Delete a product image from Supabase Storage
   */
  async deleteProductImage(imageUrl: string) {
    // Extract the file path from the public URL
    const storagePrefix = `${SUPABASE_URL}/storage/v1/object/public/product-images/`;
    if (imageUrl.startsWith(storagePrefix)) {
      const filePath = imageUrl.replace(storagePrefix, '');
      await supabase.storage.from('product-images').remove([filePath]);
    }
  },

  // ============================================================
  // USER COUPONS & CAMPAIGNS
  // ============================================================

  /**
   * Get user's coupons (by user_id)
   */
  async getUserCoupons(userId: number) {
    const { data, error } = await supabase
      .from('user_coupons')
      .select('*, coupons(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  /**
   * Activate a user coupon
   */
  async activateUserCoupon(userCouponId: number) {
    const { data, error } = await supabase
      .from('user_coupons')
      .update({ status: 'activated', activated_at: new Date().toISOString() })
      .eq('id', userCouponId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Send coupon campaign — creates user_coupons rows + sends emails
   */
  async sendCouponCampaign(couponId: number, audience: 'all' | 'newsletter', expiresAt: string | null) {
    // Fetch target users
    let query = supabase.from('users').select('id, ime, email');
    if (audience === 'newsletter') {
      query = query.eq('newsletter_subscribed', true);
    }
    const { data: users, error: usersError } = await query;
    if (usersError) throw usersError;
    if (!users || users.length === 0) return { sent: 0 };

    // Fetch coupon details
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', couponId)
      .single();
    if (couponError) throw couponError;

    // Create user_coupon rows (upsert to avoid duplicates)
    const rows = users.map(u => ({
      user_id: u.id,
      coupon_id: couponId,
      status: 'pending',
      expires_at: expiresAt || null,
    }));

    const { error: insertError } = await supabase
      .from('user_coupons')
      .upsert(rows, { onConflict: 'user_id,coupon_id', ignoreDuplicates: true });
    if (insertError) throw insertError;

    // Send emails
    let sent = 0;
    for (const user of users) {
      const html = `<div style="max-width:560px;margin:0 auto;background:#0a0a0a;color:#e8d5a3;font-family:Arial,sans-serif;border-radius:16px;overflow:hidden;border:1px solid rgba(201,169,110,0.2)"><div style="background:#111;padding:24px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.15)"><h1 style="font-family:Georgia,serif;color:#c9a96e;margin:0;font-size:24px;letter-spacing:2px">DEKANTIHR<span style="color:#e8d5a3">.COM</span></h1></div><div style="padding:32px 24px"><h2 style="color:#e8d5a3;font-size:20px;margin:0 0 8px">🎁 Imate novi kupon, ${user.ime}!</h2><p style="color:#e8d5a3;opacity:0.6;margin:0 0 24px;font-size:14px">Pripremili smo za vas posebnu ponudu. Aktivirajte kupon u svom profilu i uštedite na sljedećoj narudžbi.</p><div style="background:#111;border:1px solid rgba(201,169,110,0.3);border-radius:12px;padding:20px;margin-bottom:24px;text-align:center"><p style="color:#e8d5a3;opacity:0.4;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Kod kupona</p><p style="color:#c9a96e;font-size:28px;font-weight:bold;margin:0;font-family:Georgia,serif;letter-spacing:4px">${coupon.kod}</p><p style="color:#e8d5a3;opacity:0.5;font-size:13px;margin:8px 0 0">${coupon.tip === 'postotak' ? coupon.vrijednost + '% popusta' : coupon.vrijednost + '€ popusta'}${expiresAt ? ' · Vrijedi do ' + new Date(expiresAt).toLocaleDateString('hr-HR') : ''}</p></div><a href="https://dekantihr.com/profil?tab=kuponi" style="display:block;background:#c9a96e;color:#0a0a0a;text-align:center;padding:14px 24px;border-radius:12px;font-weight:bold;font-size:14px;text-decoration:none;letter-spacing:1px">Aktiviraj kupon →</a></div><div style="background:#111;padding:16px 24px;text-align:center;border-top:1px solid rgba(201,169,110,0.1)"><p style="color:#e8d5a3;opacity:0.3;font-size:11px;margin:0">dekantihr.com · Hvala na povjerenju!</p></div></div>`;
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY },
          body: JSON.stringify({ to: user.email, subject: `🎁 Novi kupon za vas — ${coupon.kod}`, html }),
        });
        sent++;
      } catch { /* continue */ }
    }

    return { sent, total: users.length };
  },

  /**
   * Check if user has pending coupons (for notification badge)
   */
  async getUserPendingCouponsCount(userId: number): Promise<number> {
    const { count, error } = await supabase
      .from('user_coupons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending');
    if (error) return 0;
    return count || 0;
  },
};
