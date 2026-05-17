# 🎯 Complete Database Integration - Implementation Guide

## Overview
This document outlines the complete removal of placeholder data and full database integration for AromaHR.

## ✅ Changes Completed

### 1. HomePage.tsx - PARTIALLY UPDATED
- ✅ Added database fetching for featured products, bestsellers, and brands
- ✅ Added loading states
- ✅ Updated newsletter subscription to use API
- ⚠️ Bestsellers carousel section still needs update (similar to featured section)

### 2. Files That Need Complete Rewrite

#### A. `src/pages/CatalogPage.tsx`
**Current Issue**: Uses `PRODUCTS` and `BRANDS` from `src/data/products.ts`

**Required Changes**:
```typescript
// Add state for database data
const [products, setProducts] = useState<any[]>([]);
const [brands, setBrands] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

// Fetch on mount
useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      const [productsData, brandsData] = await Promise.all([
        api.getProducts(),
        api.getBrands()
      ]);
      setProducts(productsData || []);
      setBrands(brandsData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);

// Update filtering to use `products` instead of `PRODUCTS`
const filtered = useMemo(() => {
  let result = products.filter(p => p.active);
  // ... rest of filtering logic
}, [products, search, selectedBrands, ...]);
```

#### B. `src/pages/ProductPage.tsx`
**Current Issue**: Uses `PRODUCTS` and `REVIEWS` from placeholder file

**Required Changes**:
```typescript
const [product, setProduct] = useState<any | null>(null);
const [reviews, setReviews] = useState<any[]>([]);
const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchProduct() {
    if (!slug) return;
    
    try {
      setLoading(true);
      const productData = await api.getProductBySlug(slug);
      setProduct(productData);
      
      // Fetch reviews
      const reviewsData = await api.getProductReviews(productData.id);
      setReviews(reviewsData || []);
      
      // Fetch related products (same brand)
      const allProducts = await api.getProducts({ brand: productData.brands.naziv });
      setRelatedProducts((allProducts || []).filter(p => p.id !== productData.id).slice(0, 3));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }
  
  fetchProduct();
}, [slug]);
```

#### C. `src/pages/AdminPanel.tsx`
**Current Issue**: Has fallback to mock data, needs full product CRUD

**Required Changes**:
1. Remove all references to `PRODUCTS`, `BRANDS`, `COUPONS` from `src/data/products.ts`
2. Add product creation modal
3. Add product editing with image upload
4. Add product size management
5. Add bestseller_rank field management

### 3. Delete Placeholder File
```bash
rm src/data/products.ts
```

## 🔧 Missing API Endpoints

### Add to `src/services/api.ts`:

```typescript
/**
 * Create new product (admin only)
 */
async createProduct(productData: {
  naziv: string;
  slug: string;
  brand_id: number;
  opis_kratki: string;
  opis_dugi: string;
  koncentracija: string;
  spol: 'muški' | 'ženski' | 'unisex';
  sezona: string;
  featured: boolean;
  bestseller_rank?: number | null;
  sizes: Array<{
    velicina_ml: number;
    cijena: number;
    zaliha: number;
    sku: string;
  }>;
  images?: string[];
}) {
  try {
    // Insert product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        naziv: productData.naziv,
        slug: productData.slug,
        brand_id: productData.brand_id,
        opis_kratki: productData.opis_kratki,
        opis_dugi: productData.opis_dugi,
        koncentracija: productData.koncentracija,
        spol: productData.spol,
        sezona: productData.sezona,
        featured: productData.featured,
        bestseller_rank: productData.bestseller_rank,
        active: true
      })
      .select()
      .single();

    if (productError) throw productError;

    // Insert sizes
    if (productData.sizes && productData.sizes.length > 0) {
      const sizesData = productData.sizes.map(size => ({
        product_id: product.id,
        velicina_ml: size.velicina_ml,
        cijena: size.cijena,
        zaliha: size.zaliha,
        sku: size.sku
      }));

      const { error: sizesError } = await supabase
        .from('product_sizes')
        .insert(sizesData);

      if (sizesError) throw sizesError;
    }

    // Insert images
    if (productData.images && productData.images.length > 0) {
      const imagesData = productData.images.map((url, index) => ({
        product_id: product.id,
        url,
        is_primary: index === 0,
        sort_order: index
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imagesData);

      if (imagesError) throw imagesError;
    }

    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
},

/**
 * Update product (admin only)
 */
async updateProduct(productId: number, productData: any) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        naziv: productData.naziv,
        slug: productData.slug,
        brand_id: productData.brand_id,
        opis_kratki: productData.opis_kratki,
        opis_dugi: productData.opis_dugi,
        koncentracija: productData.koncentracija,
        spol: productData.spol,
        sezona: productData.sezona,
        featured: productData.featured,
        bestseller_rank: productData.bestseller_rank,
        active: productData.active,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
},

/**
 * Delete product (admin only)
 */
async deleteProduct(productId: number) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      if (error.code === '23503') {
        throw new Error('Proizvod je korišten u narudžbama i ne može biti obrisan');
      }
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
},

/**
 * Update product size (admin only)
 */
async updateProductSize(sizeId: number, sizeData: {
  velicina_ml?: number;
  cijena?: number;
  zaliha?: number;
  sku?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('product_sizes')
      .update(sizeData)
      .eq('id', sizeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating product size:', error);
    throw error;
  }
},

/**
 * Add product size (admin only)
 */
async addProductSize(productId: number, sizeData: {
  velicina_ml: number;
  cijena: number;
  zaliha: number;
  sku: string;
}) {
  try {
    const { data, error } = await supabase
      .from('product_sizes')
      .insert({
        product_id: productId,
        ...sizeData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding product size:', error);
    throw error;
  }
},

/**
 * Delete product size (admin only)
 */
async deleteProductSize(sizeId: number) {
  try {
    const { error } = await supabase
      .from('product_sizes')
      .delete()
      .eq('id', sizeId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting product size:', error);
    throw error;
  }
}
```

## 📝 Admin Panel Product Management UI

### Add Product Modal Component

Create `src/components/ProductModal.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductModalProps {
  product?: any;
  brands: any[];
  onSave: (productData: any) => Promise<void>;
  onClose: () => void;
}

export default function ProductModal({ product, brands, onSave, onClose }: ProductModalProps) {
  const [formData, setFormData] = useState({
    naziv: product?.naziv || '',
    slug: product?.slug || '',
    brand_id: product?.brand_id || brands[0]?.id || 0,
    opis_kratki: product?.opis_kratki || '',
    opis_dugi: product?.opis_dugi || '',
    koncentracija: product?.koncentracija || 'EDP',
    spol: product?.spol || 'unisex',
    sezona: product?.sezona || 'sve',
    featured: product?.featured || false,
    bestseller_rank: product?.bestseller_rank || null,
    active: product?.active ?? true,
  });

  const [sizes, setSizes] = useState(product?.product_sizes || [
    { velicina_ml: 5, cijena: 0, zaliha: 0, sku: '' }
  ]);

  const [images, setImages] = useState<string[]>(
    product?.product_images?.map((img: any) => img.url) || []
  );

  const [saving, setSaving] = useState(false);

  // Auto-generate slug from naziv
  useEffect(() => {
    if (!product && formData.naziv) {
      const slug = formData.naziv
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(f => ({ ...f, slug }));
    }
  }, [formData.naziv, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.naziv || !formData.slug || !formData.brand_id) {
      toast.error('Naziv, slug i brand su obavezni');
      return;
    }

    if (sizes.length === 0) {
      toast.error('Dodajte barem jednu veličinu');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...formData,
        sizes,
        images
      });
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setSaving(false);
    }
  };

  const addSize = () => {
    setSizes([...sizes, { velicina_ml: 10, cijena: 0, zaliha: 0, sku: '' }]);
  };

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: string, value: any) => {
    const updated = [...sizes];
    updated[index] = { ...updated[index], [field]: value };
    setSizes(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-[#111111] border border-[#c9a96e]/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#111111] border-b border-[#c9a96e]/10 p-6 flex items-center justify-between">
          <h2 className="text-[#e8d5a3] font-['Playfair_Display'] text-2xl font-bold">
            {product ? 'Uredi proizvod' : 'Novi proizvod'}
          </h2>
          <button onClick={onClose} className="text-[#e8d5a3]/50 hover:text-[#c9a96e]">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#e8d5a3]/70 text-xs font-['Inter'] uppercase tracking-wider mb-2 block">
                Naziv *
              </label>
              <input
                type="text"
                value={formData.naziv}
                onChange={e => setFormData(f => ({ ...f, naziv: e.target.value }))}
                required
                className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50"
              />
            </div>

            <div>
              <label className="text-[#e8d5a3]/70 text-xs font-['Inter'] uppercase tracking-wider mb-2 block">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={e => setFormData(f => ({ ...f, slug: e.target.value }))}
                required
                className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50"
              />
            </div>
          </div>

          {/* Brand, Koncentracija, Spol, Sezona */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-[#e8d5a3]/70 text-xs font-['Inter'] uppercase tracking-wider mb-2 block">
                Brand *
              </label>
              <select
                value={formData.brand_id}
                onChange={e => setFormData(f => ({ ...f, brand_id: parseInt(e.target.value) }))}
                required
                className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50"
              >
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.naziv}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#e8d5a3]/70 text-xs font-['Inter'] uppercase tracking-wider mb-2 block">
                Koncentracija
              </label>
              <select
                value={formData.koncentracija}
                onChange={e => setFormData(f => ({ ...f, koncentracija: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50"
              >
                <option value="EDP">EDP</option>
                <option value="EDT">EDT</option>
                <option value="Parfum">Parfum</option>
                <option value="EDP Extrait">EDP Extrait</option>
                <option value="EDC">EDC</option>
                <option value="EDP Intense">EDP Intense</option>
              </select>
            </div>

            <div>
              <label className="text-[#e8d5a3]/70 text-xs font-['Inter'] uppercase tracking-wider mb-2 block">
                Spol
              </label>
              <select
                value={formData.spol}
                onChange={e => setFormData(f => ({ ...f, spol: e.target.value as any }))}
                className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50"
              >
                <option value="muški">Muški</option>
                <option value="ženski">Ženski</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            <div>
              <label className="text-[#e8d5a3]/70 text-xs font-['Inter'] uppercase tracking-wider mb-2 block">
                Sezona
              </label>
              <select
                value={formData.sezona}
                onChange={e => setFormData(f => ({ ...f, sezona: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50"
              >
                <option value="sve">Sve</option>
                <option value="proljeće">Proljeće</option>
                <option value="ljeto">Ljeto</option>
                <option value="jesen">Jesen</option>
                <option value="zima">Zima</option>
              </select>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="text-[#e8d5a3]/70 text-xs font-['Inter'] uppercase tracking-wider mb-2 block">
              Kratki opis
            </label>
            <textarea
              value={formData.opis_kratki}
              onChange={e => setFormData(f => ({ ...f, opis_kratki: e.target.value }))}
              rows={2}
              className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50 resize-none"
            />
          </div>

          <div>
            <label className="text-[#e8d5a3]/70 text-xs font-['Inter'] uppercase tracking-wider mb-2 block">
              Dugi opis
            </label>
            <textarea
              value={formData.opis_dugi}
              onChange={e => setFormData(f => ({ ...f, opis_dugi: e.target.value }))}
              rows={4}
              className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50 resize-none"
            />
          </div>

          {/* Sizes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[#e8d5a3]/70 text-xs font-['Inter'] uppercase tracking-wider">
                Veličine i cijene *
              </label>
              <button
                type="button"
                onClick={addSize}
                className="flex items-center gap-1 text-[#c9a96e] text-xs hover:text-[#e8d5a3]"
              >
                <Plus size={14} />
                Dodaj veličinu
              </button>
            </div>

            <div className="space-y-2">
              {sizes.map((size, index) => (
                <div key={index} className="grid grid-cols-5 gap-2">
                  <input
                    type="number"
                    value={size.velicina_ml}
                    onChange={e => updateSize(index, 'velicina_ml', parseInt(e.target.value))}
                    placeholder="ML"
                    className="bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-3 py-2 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={size.cijena}
                    onChange={e => updateSize(index, 'cijena', parseFloat(e.target.value))}
                    placeholder="Cijena"
                    className="bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-3 py-2 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={size.zaliha}
                    onChange={e => updateSize(index, 'zaliha', parseInt(e.target.value))}
                    placeholder="Zaliha"
                    className="bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-3 py-2 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={size.sku}
                    onChange={e => updateSize(index, 'sku', e.target.value)}
                    placeholder="SKU"
                    className="bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-3 py-2 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeSize(index)}
                    className="text-red-400/60 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={e => setFormData(f => ({ ...f, featured: e.target.checked }))}
                className="w-4 h-4 rounded border-[#c9a96e]/30 bg-[#0a0a0a] text-[#c9a96e] focus:ring-[#c9a96e]"
              />
              <span className="text-[#e8d5a3]/70 text-sm font-['Inter']">Featured</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={e => setFormData(f => ({ ...f, active: e.target.checked }))}
                className="w-4 h-4 rounded border-[#c9a96e]/30 bg-[#0a0a0a] text-[#c9a96e] focus:ring-[#c9a96e]"
              />
              <span className="text-[#e8d5a3]/70 text-sm font-['Inter']">Aktivan</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="text-[#e8d5a3]/70 text-sm font-['Inter']">Bestseller rank:</label>
              <input
                type="number"
                value={formData.bestseller_rank || ''}
                onChange={e => setFormData(f => ({ ...f, bestseller_rank: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="1-10"
                className="w-20 bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-3 py-1 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#c9a96e]/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#c9a96e]/30 text-[#c9a96e] px-6 py-3 rounded-xl font-semibold hover:bg-[#c9a96e]/5"
            >
              Odustani
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#c9a96e] text-[#0a0a0a] px-6 py-3 rounded-xl font-semibold hover:bg-[#e8d5a3] disabled:opacity-50"
            >
              {saving ? 'Spremanje...' : product ? 'Spremi promjene' : 'Kreiraj proizvod'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

## 🚀 Implementation Steps

1. **Complete HomePage.tsx updates** (bestsellers section)
2. **Rewrite CatalogPage.tsx** to fetch from database
3. **Rewrite ProductPage.tsx** to fetch from database
4. **Add missing API endpoints** to `src/services/api.ts`
5. **Create ProductModal component**
6. **Update AdminPanel.tsx** to use ProductModal
7. **Delete** `src/data/products.ts`
8. **Test all pages** to ensure data loads correctly

## 📸 Image Upload Strategy

For now, use direct URLs (Unsplash, Imgur, etc.). Later, implement Supabase Storage:

```typescript
// Future implementation
async uploadProductImage(file: File, productId: number) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}-${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrl;
}
```

## ✅ Testing Checklist

- [ ] HomePage loads featured products from database
- [ ] HomePage loads bestsellers from database
- [ ] HomePage loads brands from database
- [ ] Newsletter subscription works
- [ ] CatalogPage loads and filters products from database
- [ ] ProductPage loads single product from database
- [ ] ProductPage loads reviews from database
- [ ] AdminPanel can create new products
- [ ] AdminPanel can edit existing products
- [ ] AdminPanel can delete products
- [ ] AdminPanel can manage product sizes
- [ ] AdminPanel can manage brands
- [ ] AdminPanel can manage coupons
- [ ] All placeholder data removed
- [ ] No references to `src/data/products.ts`

## 🎯 Priority Order

1. **HIGH**: Complete HomePage, CatalogPage, ProductPage database integration
2. **HIGH**: Add product CRUD to AdminPanel
3. **MEDIUM**: Add image upload functionality
4. **LOW**: Add product notes management
5. **LOW**: Add product categories management

---

**Status**: 🟡 In Progress
**Next Step**: Complete the remaining file updates listed above
