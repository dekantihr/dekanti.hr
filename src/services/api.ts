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
    nacin_placanja: 'pouzecem' | 'bankovna' | 'kartica';
    cijena_dostave: number;
    subtotal: number;
    popust_iznos: number;
    kupon_id?: number | null;
    ukupno: number;
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
      // Generate order number
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const order_number = `HR-${year}-${random}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.user_id,
          order_number,
          status: 'nova',
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
          ukupno: orderData.ukupno
        })
        .select()
        .single();

      if (orderError) throw orderError;

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

      // Update coupon usage if applicable
      if (orderData.kupon_id) {
        const { error: couponError } = await supabase.rpc(
          'increment_coupon_usage',
          { coupon_id: orderData.kupon_id }
        );
        // Ignore error if function doesn't exist (we'll handle manually)
        if (couponError) {
          console.warn('Coupon usage not updated:', couponError);
        }
      }

      return order;
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
   * Validate coupon code
   */
  async validateCoupon(kod: string, subtotal: number) {
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

      // Check usage limit
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

      // Calculate discount
      let popust_iznos = 0;
      if (coupon.tip === 'postotak') {
        popust_iznos = subtotal * (coupon.vrijednost / 100);
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
          popust_iznos
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
  }
};
