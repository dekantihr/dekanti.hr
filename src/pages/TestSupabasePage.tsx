import { useState } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function TestSupabasePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // ============================================================
  // TEST FUNCTIONS
  // ============================================================

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true);
    setResults(null);
    
    try {
      console.log(`🧪 Running test: ${testName}`);
      const result = await testFn();
      console.log(`✅ Test passed:`, result);
      
      setResults({
        success: true,
        testName,
        data: result
      });
      
      toast.success(`✅ ${testName} — Uspješno!`, {
        duration: 3000,
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.3)'
        }
      });
    } catch (error: any) {
      console.error(`❌ Test failed:`, error);
      
      setResults({
        success: false,
        testName,
        error: error.message || 'Unknown error'
      });
      
      toast.error(`❌ ${testName} — Greška: ${error.message}`, {
        duration: 5000,
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(239,68,68,0.3)'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PRODUCT TESTS
  // ============================================================

  const testGetAllProducts = () => runTest(
    'Get All Products',
    async () => {
      const products = await api.getProducts();
      console.log(`Found ${products.length} products`);
      return products;
    }
  );

  const testGetFeaturedProducts = () => runTest(
    'Get Featured Products',
    async () => {
      const products = await api.getFeaturedProducts(5);
      console.log(`Found ${products.length} featured products`);
      return products;
    }
  );

  const testGetProductBySlug = () => runTest(
    'Get Product by Slug',
    async () => {
      const product = await api.getProductBySlug('dior-sauvage-edp');
      console.log(`Found product: ${product.naziv}`);
      return product;
    }
  );

  const testFilterProducts = () => runTest(
    'Filter Products (Muški)',
    async () => {
      const products = await api.getProducts({ spol: 'muški' });
      console.log(`Found ${products.length} muški products`);
      return products;
    }
  );

  const testSearchProducts = () => runTest(
    'Search Products (Sauvage)',
    async () => {
      const products = await api.getProducts({ search: 'Sauvage' });
      console.log(`Found ${products.length} products matching "Sauvage"`);
      return products;
    }
  );

  // ============================================================
  // BRAND & CATEGORY TESTS
  // ============================================================

  const testGetBrands = () => runTest(
    'Get All Brands',
    async () => {
      const brands = await api.getBrands();
      console.log(`Found ${brands.length} brands`);
      return brands;
    }
  );

  const testGetCategories = () => runTest(
    'Get All Categories',
    async () => {
      const categories = await api.getCategories();
      console.log(`Found ${categories.length} categories`);
      return categories;
    }
  );

  // ============================================================
  // COUPON TESTS
  // ============================================================

  const testValidCoupon = () => runTest(
    'Validate Coupon (DOBRODOSLI10)',
    async () => {
      const result = await api.validateCoupon('DOBRODOSLI10', 50);
      console.log('Coupon validation result:', result);
      return result;
    }
  );

  const testInvalidCoupon = () => runTest(
    'Validate Invalid Coupon',
    async () => {
      const result = await api.validateCoupon('INVALID123', 50);
      console.log('Invalid coupon result:', result);
      return result;
    }
  );

  const testCouponMinAmount = () => runTest(
    'Validate Coupon (Below Min Amount)',
    async () => {
      const result = await api.validateCoupon('DOBRODOSLI10', 10); // Min is 15€
      console.log('Coupon below min amount:', result);
      return result;
    }
  );

  // ============================================================
  // ORDER TESTS
  // ============================================================

  const testCreateOrder = () => runTest(
    'Create Test Order',
    async () => {
      const order = await api.createOrder({
        user_id: null, // Guest order
        ime: 'Test',
        prezime: 'Korisnik',
        email: 'test@dekanti.hr',
        telefon: '+385911234567',
        adresa: 'Testna ulica 123',
        grad: 'Zagreb',
        postanski_broj: '10000',
        napomena: 'Ovo je testna narudžba',
        nacin_dostave: 'hp_posta24',
        nacin_placanja: 'pouzecem',
        cijena_dostave: 4.50,
        subtotal: 43.98,
        popust_iznos: 0,
        ukupno: 48.48,
        items: [
          {
            product_size_id: 2, // Dior Sauvage 10ml
            naziv_proizvoda: 'Dior Sauvage EDP',
            brand_naziv: 'Dior',
            ml: 10,
            cijena: 15.99,
            kolicina: 1
          },
          {
            product_size_id: 17, // Beach Walk 5ml
            naziv_proizvoda: 'Replica — Beach Walk',
            brand_naziv: 'Maison Margiela',
            ml: 5,
            cijena: 8.50,
            kolicina: 2
          }
        ]
      });
      
      console.log(`Order created: ${order.order_number}`);
      return order;
    }
  );

  const testGetOrderByNumber = () => runTest(
    'Get Order by Number',
    async () => {
      // First create an order
      const newOrder = await api.createOrder({
        user_id: null,
        ime: 'Test',
        prezime: 'Fetch',
        email: 'fetch@test.com',
        telefon: '+385911111111',
        adresa: 'Test 1',
        grad: 'Zagreb',
        postanski_broj: '10000',
        nacin_dostave: 'hp_posta24',
        nacin_placanja: 'pouzecem',
        cijena_dostave: 4.50,
        subtotal: 15.99,
        popust_iznos: 0,
        ukupno: 20.49,
        items: [
          {
            product_size_id: 1,
            naziv_proizvoda: 'Dior Sauvage EDP',
            brand_naziv: 'Dior',
            ml: 5,
            cijena: 8.99,
            kolicina: 1
          }
        ]
      });

      // Then fetch it
      const order = await api.getOrderByNumber(newOrder.order_number);
      console.log(`Fetched order: ${order.order_number}`);
      return order;
    }
  );

  // ============================================================
  // NEWSLETTER TEST
  // ============================================================

  const testSubscribeNewsletter = () => runTest(
    'Subscribe to Newsletter',
    async () => {
      const randomEmail = `test${Date.now()}@dekanti.hr`;
      const result = await api.subscribeNewsletter(randomEmail);
      console.log('Newsletter subscription:', result);
      return result;
    }
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8d5a3] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-['Cormorant_Garamond'] font-bold mb-4">
            🧪 Supabase API Testing
          </h1>
          <p className="text-[#e8d5a3]/70">
            Test all Supabase API endpoints and database operations
          </p>
        </div>

        {/* Test Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Products */}
          <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#c9a96e]">
              📦 Products
            </h2>
            <div className="space-y-2">
              <button
                onClick={testGetAllProducts}
                disabled={loading}
                className="w-full bg-[#c9a96e]/10 hover:bg-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Get All Products
              </button>
              <button
                onClick={testGetFeaturedProducts}
                disabled={loading}
                className="w-full bg-[#c9a96e]/10 hover:bg-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Get Featured
              </button>
              <button
                onClick={testGetProductBySlug}
                disabled={loading}
                className="w-full bg-[#c9a96e]/10 hover:bg-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Get by Slug
              </button>
              <button
                onClick={testFilterProducts}
                disabled={loading}
                className="w-full bg-[#c9a96e]/10 hover:bg-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Filter (Muški)
              </button>
              <button
                onClick={testSearchProducts}
                disabled={loading}
                className="w-full bg-[#c9a96e]/10 hover:bg-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </div>

          {/* Brands & Categories */}
          <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#c9a96e]">
              🏷️ Brands & Categories
            </h2>
            <div className="space-y-2">
              <button
                onClick={testGetBrands}
                disabled={loading}
                className="w-full bg-[#c9a96e]/10 hover:bg-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Get All Brands
              </button>
              <button
                onClick={testGetCategories}
                disabled={loading}
                className="w-full bg-[#c9a96e]/10 hover:bg-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Get All Categories
              </button>
            </div>
          </div>

          {/* Coupons */}
          <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#c9a96e]">
              🎟️ Coupons
            </h2>
            <div className="space-y-2">
              <button
                onClick={testValidCoupon}
                disabled={loading}
                className="w-full bg-[#c9a96e]/10 hover:bg-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Valid Coupon
              </button>
              <button
                onClick={testInvalidCoupon}
                disabled={loading}
                className="w-full bg-[#c9a96e]/10 hover:bg-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Invalid Coupon
              </button>
              <button
                onClick={testCouponMinAmount}
                disabled={loading}
                className="w-full bg-[#c9a96e]/10 hover:bg-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Below Min Amount
              </button>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#c9a96e]">
              🛒 Orders
            </h2>
            <div className="space-y-2">
              <button
                onClick={testCreateOrder}
                disabled={loading}
                className="w-full bg-[#c9a96e]/10 hover:bg-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Create Order
              </button>
              <button
                onClick={testGetOrderByNumber}
                disabled={loading}
                className="w-full bg-[#c9a96e]/10 hover:bg-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Get Order
              </button>
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#c9a96e]">
              📧 Newsletter
            </h2>
            <div className="space-y-2">
              <button
                onClick={testSubscribeNewsletter}
                disabled={loading}
                className="w-full bg-[#c9a96e]/10 hover:bg-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-[#111111] border border-[#c9a96e]/20 rounded-xl p-8 text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#c9a96e]/20 border-t-[#c9a96e] rounded-full animate-spin mb-4"></div>
            <p className="text-[#e8d5a3]/70">Running test...</p>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className={`bg-[#111111] border ${results.success ? 'border-green-500/30' : 'border-red-500/30'} rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                {results.success ? '✅' : '❌'} {results.testName}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${results.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {results.success ? 'SUCCESS' : 'FAILED'}
              </span>
            </div>

            {results.success ? (
              <div className="bg-[#0a0a0a] rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-xs text-[#e8d5a3]/80">
                  {JSON.stringify(results.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">{results.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-[#111111] border border-[#c9a96e]/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-[#c9a96e]">
            📖 Testing Instructions
          </h3>
          <div className="space-y-2 text-sm text-[#e8d5a3]/70">
            <p>1. Click any test button to run that specific test</p>
            <p>2. Check the browser console for detailed logs</p>
            <p>3. Results will appear below with full JSON data</p>
            <p>4. Green = Success, Red = Failed</p>
            <p>5. Toast notifications show quick status</p>
          </div>
        </div>
      </div>
    </div>
  );
}
