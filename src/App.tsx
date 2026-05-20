import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useCart, useWishlist, useAuth, useOrders } from './store/cartStore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackingPage from './pages/TrackingPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanel from './pages/AdminPanel';
import { AboutPage, NotFoundPage } from './pages/SimplePages';
import { FAQPage, PrivacyPage, RefundPage, TermsPage, ShippingPage, CookiePage, ContactPage } from './pages/PolicyPages';
import toast from 'react-hot-toast';

function AppContent() {
  const location = useLocation();
  const { items, coupon, setCoupon, addItem, removeItem, updateQuantity, clearCart, subtotal, dostava, popust, ukupno, itemCount } = useCart();
  const { wishlist, toggle: toggleWishlist } = useWishlist();
  const { user, login, logout } = useAuth();
  const { orders, addOrder } = useOrders();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleAddToCart = (product: any, sizeId: number) => {
    const sizes = product.product_sizes || product.sizes || [];
    const size = sizes.find((s: any) => s.id === sizeId);
    if (!size) return;
    addItem({
      product_id: product.id,
      product_size_id: size.id,
      naziv: product.naziv,
      brand: product.brand?.naziv || product.brand,
      ml: size.velicina_ml,
      cijena: size.cijena,
      kolicina: 1,
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      slug: product.slug,
      max_zaliha: size.zaliha,
    });
    if (!isAdminRoute) {
      toast.success(`${product.naziv} ${size.velicina_ml}ml dodano u košaricu!`, {
        style: { background: '#111111', color: '#e8d5a3', border: '1px solid rgba(201,169,110,0.3)' },
        iconTheme: { primary: '#c9a96e', secondary: '#0a0a0a' },
      });
    }
  };

  const handleOrderComplete = (order: any) => {
    addOrder(order);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ScrollToTop />
      {!isAdminRoute && (
        <Navbar
          itemCount={itemCount}
          wishlistCount={wishlist.length}
          user={user}
          onLogout={() => { logout(); toast.success('Uspješno ste se odjavili.'); }}
        />
      )}

      <Routes>
        <Route path="/" element={
          <HomePage
            wishlist={wishlist}
            onWishlistToggle={toggleWishlist}
            onAddToCart={handleAddToCart}
          />
        } />
        <Route path="/parfemi" element={
          <CatalogPage
            wishlist={wishlist}
            onWishlistToggle={toggleWishlist}
            onAddToCart={handleAddToCart}
          />
        } />
        <Route path="/parfemi/:slug" element={
          <ProductPage
            wishlist={wishlist}
            onWishlistToggle={toggleWishlist}
            onAddToCart={handleAddToCart}
            user={user}
          />
        } />
        <Route path="/kosarica" element={
          <CartPage
            items={items}
            coupon={coupon}
            onCouponSet={setCoupon}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            subtotal={subtotal}
            dostava={dostava}
            popust={popust}
            ukupno={ukupno}
          />
        } />
        <Route path="/naruci" element={
          <CheckoutPage
            items={items}
            coupon={coupon}
            subtotal={subtotal}
            dostava={dostava}
            popust={popust}
            ukupno={ukupno}
            user={user}
            onOrderComplete={handleOrderComplete}
            onClearCart={clearCart}
          />
        } />
        <Route path="/pracenje" element={<TrackingPage orders={orders} />} />
        <Route path="/prijava" element={<AuthPage mode="login" onLogin={login} />} />
        <Route path="/registracija" element={<AuthPage mode="register" onLogin={login} />} />
        <Route path="/zaboravljena-lozinka" element={<AuthPage mode="forgot" onLogin={login} />} />
        <Route path="/profil" element={
          <ProtectedRoute>
            <ProfilePage
              user={user}
              orders={orders}
              wishlist={wishlist}
              onWishlistToggle={toggleWishlist}
            />
          </ProtectedRoute>
        } />
        <Route path="/o-nama" element={<AboutPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privatnost" element={<PrivacyPage />} />
        <Route path="/povrat" element={<RefundPage />} />
        <Route path="/uvjeti" element={<TermsPage />} />
        <Route path="/dostava" element={<ShippingPage />} />
        <Route path="/kolacici" element={<CookiePage />} />
        <Route path="/kontakt" element={<ContactPage />} />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminPanel
              user={user}
              orders={orders}
              onLogout={() => { logout(); }}
            />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {!isAdminRoute && <Footer />}

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111111',
            color: '#e8d5a3',
            border: '1px solid rgba(201,169,110,0.25)',
            borderRadius: '12px',
            fontFamily: "'DM Sans', 'Inter', sans-serif",
            fontSize: '13px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: { primary: '#c9a96e', secondary: '#0a0a0a' },
            duration: 3000,
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0a0a0a' },
            duration: 4000,
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
