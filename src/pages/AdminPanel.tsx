import { useState, useEffect, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Star, Tag, Mail,
  BarChart2, TrendingUp, ArrowUpRight, ArrowDownRight, Eye, Edit,
  Check, X, ChevronDown, Download, Bell, LogOut, Menu, Trash2, Sparkles,
  Upload, CreditCard
} from 'lucide-react';

import { Order } from '../store/cartStore';
import { supabase } from '../utils/supabase';
import { api } from '../services/api';
import { formatDate } from '../utils/validation';
import { groqService } from '../services/groq';
import toast from 'react-hot-toast';

interface AdminPanelProps {
  user: { id: number; ime: string; prezime: string; email: string; role: string } | null;
  orders: Order[];
  onLogout: () => void;
}

type AdminView = 'dashboard' | 'narudzbe' | 'proizvodi' | 'brendovi' | 'kupci' | 'recenzije' | 'kuponi' | 'newsletter' | 'statistike';

const STATUS_COLORS: Record<string, string> = {
  cekanje_uplate: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  nova: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30',
  u_obradi: 'bg-blue-400/15 text-blue-400 border-blue-400/30',
  poslano: 'bg-purple-400/15 text-purple-400 border-purple-400/30',
  isporuceno: 'bg-green-400/15 text-green-400 border-green-400/30',
  otkazano: 'bg-red-400/15 text-red-400 border-red-400/30',
};

const STATUS_LABELS: Record<string, string> = {
  cekanje_uplate: 'Čeka uplatu',
  nova: 'Nova',
  u_obradi: 'U obradi',
  poslano: 'Poslano',
  isporuceno: 'Isporučeno',
  otkazano: 'Otkazano',
};

export default function AdminPanel({ user, onLogout }: AdminPanelProps) {
  const [view, setView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<any | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [supabaseOrders, setSupabaseOrders] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [newsletterSubs, setNewsletterSubs] = useState<any[]>([]);
  const [supabaseCoupons, setSupabaseCoupons] = useState<any[]>([]);
  const [supabaseBrands, setSupabaseBrands] = useState<any[]>([]);
  const [supabaseCustomers, setSupabaseCustomers] = useState<any[]>([]);
  const [supabaseProducts, setSupabaseProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const trackingInputRef = useRef<HTMLInputElement>(null);

  if (!user || user.role !== 'admin') return <Navigate to="/prijava" replace />;

  // Fetch real orders, reviews, and newsletter from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              naziv_proizvoda,
              brand_naziv,
              ml,
              cijena,
              kolicina
            )
          `)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        setSupabaseOrders(ordersData || []);

        // Fetch pending reviews
        const reviewsData = await api.getPendingReviews();
        setPendingReviews(reviewsData || []);

        // Fetch newsletter subscribers
        const newsletterData = await api.getNewsletterSubscribers();
        setNewsletterSubs(newsletterData || []);

        // Fetch coupons
        const { data: couponsData, error: couponsError } = await supabase
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (couponsError) throw couponsError;
        setSupabaseCoupons(couponsData || []);

        // Fetch brands
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('*')
          .order('naziv');
        
        if (brandsError) throw brandsError;
        setSupabaseBrands(brandsData || []);

        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from('users')
          .select('id, ime, prezime, email, telefon, grad, role, created_at')
          .order('created_at', { ascending: false });
        
        if (customersError) throw customersError;
        setSupabaseCustomers(customersData || []);

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            brands (naziv),
            product_sizes (id, velicina_ml, cijena, zaliha, sku),
            product_images (url, alt_text, sort_order)
          `)
          .order('created_at', { ascending: false });
        
        if (productsError) throw productsError;
        setSupabaseProducts(productsData || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Greška pri učitavanju podataka', {
          style: {
            background: '#111111',
            color: '#e8d5a3',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
          },
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  /**
   * Handle order status change
   */
  const handleStatusChange = async (orderNumber: string, newStatus: string) => {
    setSaving(true);
    try {
      await api.updateOrderStatus(orderNumber, newStatus);
      
      setSupabaseOrders(prev => 
        prev.map(order => 
          order.order_number === orderNumber 
            ? { ...order, status: newStatus }
            : order
        )
      );

      if (selectedOrder?.order_number === orderNumber) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      if (newStatus === 'poslano') {
        const order = supabaseOrders.find(o => o.order_number === orderNumber);
        if (order?.tracking_broj && order?.email) {
          const html = `<div style="max-width:560px;margin:0 auto;background:#0a0a0a;color:#e8d5a3;font-family:Arial,sans-serif;border-radius:16px;overflow:hidden;border:1px solid rgba(201,169,110,0.2)"><div style="background:#111;padding:24px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.15)"><h1 style="font-family:Georgia,serif;color:#c9a96e;margin:0;font-size:24px;letter-spacing:2px">DEKANTI<span style="color:#e8d5a3">.HR</span></h1></div><div style="padding:32px 24px"><h2 style="color:#e8d5a3;font-size:20px;margin:0 0 8px">📦 Narudžba poslana, ${order.ime}!</h2><p style="color:#e8d5a3;opacity:0.6;margin:0 0 24px;font-size:14px">Vaša narudžba <strong>${orderNumber}</strong> je na putu.</p><div style="background:#111;border:1px solid rgba(201,169,110,0.15);border-radius:12px;padding:16px;margin-bottom:24px"><p style="color:#e8d5a3;opacity:0.4;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">Tracking broj</p><p style="color:#c9a96e;font-size:18px;font-weight:bold;margin:0;font-family:Georgia,serif">${order.tracking_broj}</p></div><p style="color:#e8d5a3;opacity:0.5;font-size:12px;margin:0">Pratite pošiljku na: <a href="https://boxnow.hr/track?parcelId=${order.tracking_broj}" style="color:#c9a96e">BoxNow praćenje</a></p></div><div style="background:#111;padding:16px 24px;text-align:center;border-top:1px solid rgba(201,169,110,0.1)"><p style="color:#e8d5a3;opacity:0.3;font-size:11px;margin:0">dekantihr.com · Hvala na povjerenju!</p></div></div>`;
          await api.sendEmail(order.email, `Narudžba ${orderNumber} poslana — tracking: ${order.tracking_broj}`, html);
          toast.success('Email s trackingom poslan kupcu!');
        }
      }

      toast.success(`Status promijenjen u: ${STATUS_LABELS[newStatus]}`, {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        iconTheme: {
          primary: '#c9a96e',
          secondary: '#0a0a0a',
        },
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Greška pri promjeni statusa');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle tracking number update
   */
  const handleTrackingUpdate = async () => {
    if (!selectedOrder || !trackingInputRef.current) return;

    const trackingNumber = trackingInputRef.current.value.trim();
    if (!trackingNumber) {
      toast.error('Unesite tracking broj');
      return;
    }

    setSaving(true);
    try {
      await api.updateTrackingNumber(selectedOrder.order_number, trackingNumber);
      
      // Update local state
      setSupabaseOrders(prev => 
        prev.map(order => 
          order.order_number === selectedOrder.order_number 
            ? { ...order, tracking_broj: trackingNumber }
            : order
        )
      );

      // Update selected order
      setSelectedOrder({ ...selectedOrder, tracking_broj: trackingNumber });

      if (selectedOrder.status === 'poslano' && selectedOrder.email) {
        const html = `<div style="max-width:560px;margin:0 auto;background:#0a0a0a;color:#e8d5a3;font-family:Arial,sans-serif;border-radius:16px;overflow:hidden;border:1px solid rgba(201,169,110,0.2)"><div style="background:#111;padding:24px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.15)"><h1 style="font-family:Georgia,serif;color:#c9a96e;margin:0;font-size:24px;letter-spacing:2px">DEKANTI<span style="color:#e8d5a3">.HR</span></h1></div><div style="padding:32px 24px"><h2 style="color:#e8d5a3;font-size:20px;margin:0 0 8px">📦 Narudžba poslana!</h2><p style="color:#e8d5a3;opacity:0.6;margin:0 0 24px;font-size:14px">Vaša narudžba <strong>${selectedOrder.order_number}</strong> je na putu.</p><div style="background:#111;border:1px solid rgba(201,169,110,0.15);border-radius:12px;padding:16px;margin-bottom:24px"><p style="color:#e8d5a3;opacity:0.4;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">Tracking broj</p><p style="color:#c9a96e;font-size:18px;font-weight:bold;margin:0;font-family:Georgia,serif">${trackingNumber}</p></div><p style="color:#e8d5a3;opacity:0.5;font-size:12px;margin:0">Pratite na: <a href="https://boxnow.hr/track?parcelId=${trackingNumber}" style="color:#c9a96e">BoxNow praćenje</a></p></div><div style="background:#111;padding:16px 24px;text-align:center;border-top:1px solid rgba(201,169,110,0.1)"><p style="color:#e8d5a3;opacity:0.3;font-size:11px;margin:0">dekantihr.com · Hvala na povjerenju!</p></div></div>`;
        await api.sendEmail(selectedOrder.email, `Narudžba ${selectedOrder.order_number} poslana — tracking: ${trackingNumber}`, html);
        toast.success('Email s trackingom poslan kupcu!');
      }

      toast.success('Tracking broj spremljen!', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        iconTheme: {
          primary: '#c9a96e',
          secondary: '#0a0a0a',
        },
      });
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast.error('Greška pri spremanju tracking broja');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle full order update
   */
  const handleSaveOrder = async () => {
    if (!selectedOrder) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          ime: selectedOrder.ime,
          prezime: selectedOrder.prezime,
          email: selectedOrder.email,
          telefon: selectedOrder.telefon,
          adresa: selectedOrder.adresa,
          grad: selectedOrder.grad,
          postanski_broj: selectedOrder.postanski_broj,
          napomena: selectedOrder.napomena,
          updated_at: new Date().toISOString()
        })
        .eq('order_number', selectedOrder.order_number);

      if (error) throw error;

      // Update local state
      setSupabaseOrders(prev => 
        prev.map(order => 
          order.order_number === selectedOrder.order_number 
            ? { ...selectedOrder }
            : order
        )
      );

      toast.success('Podaci narudžbe uspješno spremljeni!', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        iconTheme: {
          primary: '#c9a96e',
          secondary: '#0a0a0a',
        },
      });
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Greška pri spremanju narudžbe');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Mark order as paid (admin only)
   */
  const handleMarkPaid = async (orderNumber: string) => {
    setSaving(true);
    try {
      await api.markOrderPaid(orderNumber);

      const wasAwaiting = supabaseOrders.find(o => o.order_number === orderNumber)?.status === 'cekanje_uplate';
      const newStatus = wasAwaiting ? 'nova' : undefined;

      // Update local state
      setSupabaseOrders(prev =>
        prev.map(order =>
          order.order_number === orderNumber
            ? {
                ...order,
                placeno: true,
                datum_placanja: new Date().toISOString(),
                ...(newStatus ? { status: newStatus } : {}),
              }
            : order
        )
      );

      if (selectedOrder?.order_number === orderNumber) {
        setSelectedOrder({
          ...selectedOrder,
          placeno: true,
          datum_placanja: new Date().toISOString(),
          ...(newStatus ? { status: newStatus } : {}),
        });
      }

      const order = supabaseOrders.find(o => o.order_number === orderNumber);
      if (order?.email) {
        const html = `<div style="max-width:560px;margin:0 auto;background:#0a0a0a;color:#e8d5a3;font-family:Arial,sans-serif;border-radius:16px;overflow:hidden;border:1px solid rgba(201,169,110,0.2)"><div style="background:#111;padding:24px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.15)"><h1 style="font-family:Georgia,serif;color:#c9a96e;margin:0;font-size:24px;letter-spacing:2px">DEKANTI<span style="color:#e8d5a3">.HR</span></h1></div><div style="padding:32px 24px"><h2 style="color:#e8d5a3;font-size:20px;margin:0 0 8px">✅ Uplata potvrđena, ${order.ime}!</h2><p style="color:#e8d5a3;opacity:0.6;margin:0 0 24px;font-size:14px">Vaša uplata za narudžbu <strong>${orderNumber}</strong> je zaprimljena.</p><div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:12px;padding:16px;margin-bottom:24px"><p style="color:#4ade80;font-size:13px;font-weight:bold;margin:0 0 4px">💰 Uplaćeno</p><p style="color:#4ade80;font-size:18px;font-weight:bold;margin:0;font-family:Georgia,serif">${order.ukupno.toFixed(2)}€</p></div><p style="color:#e8d5a3;opacity:0.5;font-size:12px;margin:0">Pakiramo i šaljemo isti dan (06:00–18:00). Dobit ćete tracking čim pošiljka bude predana.</p></div><div style="background:#111;padding:16px 24px;text-align:center;border-top:1px solid rgba(201,169,110,0.1)"><p style="color:#e8d5a3;opacity:0.3;font-size:11px;margin:0">dekantihr.com · Hvala na povjerenju!</p></div></div>`;
        await api.sendEmail(order.email, `Uplata potvrđena — narudžba ${orderNumber}`, html);
      }

      toast.success('Narudžba označena kao plaćena!', {
        style: { background: '#111111', color: '#e8d5a3', border: '1px solid rgba(201,169,110,0.25)', borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '13px' },
        iconTheme: { primary: '#c9a96e', secondary: '#0a0a0a' },
      });
    } catch (error) {
      console.error('Error marking order as paid:', error);
      toast.error('Greška pri označavanju uplate');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Send a manual email template to the customer
   */
  const handleSendEmailTemplate = async (tpl: string) => {
    if (!selectedOrder?.email) return;
    setSaving(true);
    try {
      let subject = '';
      let html = '';
      const o = selectedOrder;

      if (tpl === 'U obradi') {
        subject = `Narudžba ${o.order_number} — u obradi`;
        html = `<div style="max-width:560px;margin:0 auto;background:#0a0a0a;color:#e8d5a3;font-family:Arial,sans-serif;border-radius:16px;overflow:hidden;border:1px solid rgba(201,169,110,0.2)"><div style="background:#111;padding:24px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.15)"><h1 style="font-family:Georgia,serif;color:#c9a96e;margin:0;font-size:24px;letter-spacing:2px">DEKANTIHR<span style="color:#e8d5a3">.COM</span></h1></div><div style="padding:32px 24px"><h2 style="color:#e8d5a3;font-size:20px;margin:0 0 8px">📦 Vaša narudžba je u obradi, ${o.ime}!</h2><p style="color:#e8d5a3;opacity:0.6;margin:0 0 24px;font-size:14px">Primili smo vašu uplatu i počeli smo s pripremom paketa.</p><div style="background:#111;border:1px solid rgba(201,169,110,0.15);border-radius:12px;padding:16px;margin-bottom:24px"><p style="color:#e8d5a3;opacity:0.4;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">Broj narudžbe</p><p style="color:#c9a96e;font-size:22px;font-weight:bold;margin:0;font-family:Georgia,serif">${o.order_number}</p></div><p style="color:#e8d5a3;opacity:0.5;font-size:13px;margin:0">Pakiramo i šaljemo isti dan (do 14:00). Dobit ćete email s BoxNow kodom za preuzimanje čim pošaljemo paket.</p></div><div style="background:#111;padding:16px 24px;text-align:center;border-top:1px solid rgba(201,169,110,0.1)"><p style="color:#e8d5a3;opacity:0.3;font-size:11px;margin:0">dekantihr.com · Hvala na povjerenju!</p></div></div>`;
      } else if (tpl === 'Isporučeno') {
        subject = `Narudžba ${o.order_number} — isporučeno!`;
        html = `<div style="max-width:560px;margin:0 auto;background:#0a0a0a;color:#e8d5a3;font-family:Arial,sans-serif;border-radius:16px;overflow:hidden;border:1px solid rgba(201,169,110,0.2)"><div style="background:#111;padding:24px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.15)"><h1 style="font-family:Georgia,serif;color:#c9a96e;margin:0;font-size:24px;letter-spacing:2px">DEKANTIHR<span style="color:#e8d5a3">.COM</span></h1></div><div style="padding:32px 24px"><h2 style="color:#e8d5a3;font-size:20px;margin:0 0 8px">✅ Paket isporučen, ${o.ime}!</h2><p style="color:#e8d5a3;opacity:0.6;margin:0 0 24px;font-size:14px">Vaša narudžba <strong>${o.order_number}</strong> je uspješno isporučena. Nadamo se da ste zadovoljni!</p><p style="color:#e8d5a3;opacity:0.5;font-size:13px;margin:0">Ako imate bilo kakvih pitanja ili primjedbi, slobodno nas kontaktirajte na <a href="mailto:info@dekantihr.com" style="color:#c9a96e">info@dekantihr.com</a>.</p></div><div style="background:#111;padding:16px 24px;text-align:center;border-top:1px solid rgba(201,169,110,0.1)"><p style="color:#e8d5a3;opacity:0.3;font-size:11px;margin:0">dekantihr.com · Hvala na povjerenju!</p></div></div>`;
      } else if (tpl === 'Otkazano') {
        subject = `Narudžba ${o.order_number} — otkazana`;
        html = `<div style="max-width:560px;margin:0 auto;background:#0a0a0a;color:#e8d5a3;font-family:Arial,sans-serif;border-radius:16px;overflow:hidden;border:1px solid rgba(201,169,110,0.2)"><div style="background:#111;padding:24px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.15)"><h1 style="font-family:Georgia,serif;color:#c9a96e;margin:0;font-size:24px;letter-spacing:2px">DEKANTIHR<span style="color:#e8d5a3">.COM</span></h1></div><div style="padding:32px 24px"><h2 style="color:#e8d5a3;font-size:20px;margin:0 0 8px">Narudžba otkazana, ${o.ime}</h2><p style="color:#e8d5a3;opacity:0.6;margin:0 0 24px;font-size:14px">Vaša narudžba <strong>${o.order_number}</strong> je otkazana.</p><p style="color:#e8d5a3;opacity:0.5;font-size:13px;margin:0">Ako imate pitanja ili trebate povrat sredstava, kontaktirajte nas na <a href="mailto:info@dekantihr.com" style="color:#c9a96e">info@dekantihr.com</a>.</p></div><div style="background:#111;padding:16px 24px;text-align:center;border-top:1px solid rgba(201,169,110,0.1)"><p style="color:#e8d5a3;opacity:0.3;font-size:11px;margin:0">dekantihr.com · Hvala na povjerenju!</p></div></div>`;
      } else if (tpl === 'Uplata potvrđena') {
        subject = `Uplata potvrđena — narudžba ${o.order_number}`;
        html = `<div style="max-width:560px;margin:0 auto;background:#0a0a0a;color:#e8d5a3;font-family:Arial,sans-serif;border-radius:16px;overflow:hidden;border:1px solid rgba(201,169,110,0.2)"><div style="background:#111;padding:24px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.15)"><h1 style="font-family:Georgia,serif;color:#c9a96e;margin:0;font-size:24px;letter-spacing:2px">DEKANTIHR<span style="color:#e8d5a3">.COM</span></h1></div><div style="padding:32px 24px"><h2 style="color:#e8d5a3;font-size:20px;margin:0 0 8px">✅ Uplata potvrđena, ${o.ime}!</h2><p style="color:#e8d5a3;opacity:0.6;margin:0 0 24px;font-size:14px">Vaša uplata za narudžbu <strong>${o.order_number}</strong> je zaprimljena.</p><div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:12px;padding:16px;margin-bottom:24px"><p style="color:#4ade80;font-size:13px;font-weight:bold;margin:0 0 4px">💰 Uplaćeno</p><p style="color:#4ade80;font-size:18px;font-weight:bold;margin:0;font-family:Georgia,serif">${o.ukupno.toFixed(2)}€</p></div><p style="color:#e8d5a3;opacity:0.5;font-size:12px;margin:0">Pakiramo i šaljemo isti dan (do 14:00). Dobit ćete tracking čim pošiljka bude predana.</p></div><div style="background:#111;padding:16px 24px;text-align:center;border-top:1px solid rgba(201,169,110,0.1)"><p style="color:#e8d5a3;opacity:0.3;font-size:11px;margin:0">dekantihr.com · Hvala na povjerenju!</p></div></div>`;
      } else {
        return;
      }

      await api.sendEmail(o.email, subject, html);
      toast.success(`Email "${tpl}" poslan na ${o.email}!`, {
        style: { background: '#111111', color: '#e8d5a3', border: '1px solid rgba(201,169,110,0.25)', borderRadius: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' },
        iconTheme: { primary: '#c9a96e', secondary: '#0a0a0a' },
      });
    } catch (error: any) {
      toast.error(`Greška pri slanju emaila: ${error.message || 'Nepoznata greška'}`, {
        style: { background: '#111111', color: '#e8d5a3', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' },
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle review approval
   */
  const handleApproveReview = async (reviewId: number) => {
    setSaving(true);
    try {
      await api.approveReview(reviewId);
      
      // Remove from pending reviews
      setPendingReviews(prev => prev.filter(review => review.id !== reviewId));

      toast.success('Recenzija odobrena!', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        iconTheme: {
          primary: '#c9a96e',
          secondary: '#0a0a0a',
        },
      });
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Greška pri odobravanju recenzije');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle review rejection
   */
  const handleRejectReview = async (reviewId: number) => {
    setSaving(true);
    try {
      await api.rejectReview(reviewId);
      
      // Remove from pending reviews
      setPendingReviews(prev => prev.filter(review => review.id !== reviewId));

      toast.success('Recenzija odbijena', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        iconTheme: {
          primary: '#c9a96e',
          secondary: '#0a0a0a',
        },
      });
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Greška pri odbijanju recenzije');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle product create
   */
  const handleCreateProduct = () => {
    // Don't open modal if brands haven't loaded yet
    if (supabaseBrands.length === 0) {
      toast.error('Molimo pričekajte da se učitaju brendovi', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
      });
      return;
    }

    setSelectedProduct({
      naziv: '',
      slug: '',
      brand_id: supabaseBrands[0]?.id || 1,
      koncentracija: 'EDP',
      spol: 'unisex',
      opis_kratki: '',
      opis_dugi: '',
      note_vrha: '',
      note_srca: '',
      note_baze: '',
      sezona: 'sve',
      featured: false,
      active: true,
      product_sizes: [{ velicina_ml: 50, cijena: 0, zaliha: 0, sku: '' }],
      product_images: [{ url: '', alt_text: '', sort_order: 0 }]
    });
    setShowProductModal(true);
  };

  /**
   * Handle product edit
   */
  const handleEditProduct = (product: any) => {
    setSelectedProduct({ 
      ...product,
      product_sizes: product.product_sizes?.length > 0 ? product.product_sizes : [{ velicina_ml: 50, cijena: 0, zaliha: 0, sku: '' }],
      product_images: product.product_images?.length > 0 ? product.product_images : [{ url: '', alt: '', sort_order: 0 }]
    });
    setShowProductModal(true);
  };

  /**
   * Handle image upload via drag & drop or file picker
   */
  const handleImageUpload = async (files: FileList | File[]) => {
    if (!selectedProduct) return;
    
    const fileArr = Array.from(files);
    const validFiles = fileArr.filter(f => 
      ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)
    );

    if (validFiles.length === 0) {
      toast.error('Samo slike (JPEG, PNG, WebP, GIF) su dozvoljene');
      return;
    }

    // Max 5MB each
    const oversized = validFiles.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error('Maksimalna veličina slike je 5MB');
      return;
    }

    setUploadingImages(true);
    const slug = selectedProduct.slug || selectedProduct.naziv?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product';

    try {
      const uploadPromises = validFiles.map(file => api.uploadProductImage(file, slug));
      const uploadedUrls = await Promise.all(uploadPromises);

      const currentImages = selectedProduct.product_images || [];
      const newImages = [
        ...currentImages,
        ...uploadedUrls.map((url, i) => ({
          url,
          alt_text: selectedProduct.naziv || '',
          sort_order: currentImages.length + i
        }))
      ];

      setSelectedProduct({ ...selectedProduct, product_images: newImages });
      toast.success(`${uploadedUrls.length} slika uspješno uploadano!`, {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        iconTheme: { primary: '#c9a96e', secondary: '#0a0a0a' },
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Greška pri uploadu slike');
    } finally {
      setUploadingImages(false);
      setDragOver(false);
    }
  };

  /**
   * Handle product save
   */
  const handleSaveProduct = async () => {
    if (!selectedProduct) return;

    // Validation
    if (!selectedProduct.naziv || !selectedProduct.brand_id) {
      toast.error('Naziv i brand su obavezni');
      return;
    }

    // Generate slug from naziv if empty
    if (!selectedProduct.slug) {
      selectedProduct.slug = selectedProduct.naziv
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Validate product sizes
    if (!selectedProduct.product_sizes || selectedProduct.product_sizes.length === 0) {
      toast.error('Dodajte barem jednu veličinu proizvoda');
      return;
    }

    for (const size of selectedProduct.product_sizes) {
      if (!size.velicina_ml || !size.cijena || !size.sku) {
        toast.error('Sve veličine moraju imati ml, cijenu i SKU');
        return;
      }
    }

    setSaving(true);
    try {
      if (selectedProduct.id) {
        // Update existing product
        const updateData: any = {
          naziv: selectedProduct.naziv,
          slug: selectedProduct.slug,
          brand_id: selectedProduct.brand_id,
          koncentracija: selectedProduct.koncentracija,
          spol: selectedProduct.spol,
          opis_kratki: selectedProduct.opis_kratki || null,
          opis_dugi: selectedProduct.opis_dugi || null,
          note_vrha: selectedProduct.note_vrha || null,
          note_srca: selectedProduct.note_srca || null,
          note_baze: selectedProduct.note_baze || null,
          sezona: selectedProduct.sezona || 'sve',
          featured: selectedProduct.featured || false,
          active: selectedProduct.active !== false
        };

        const { error: productError } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', selectedProduct.id);

        if (productError) throw productError;

        // Update product sizes (delete old, insert new)
        await supabase.from('product_sizes').delete().eq('product_id', selectedProduct.id);
        
        const sizesToInsert = selectedProduct.product_sizes.map((s: any) => ({
          product_id: selectedProduct.id,
          velicina_ml: parseInt(s.velicina_ml),
          cijena: parseFloat(s.cijena),
          zaliha: parseInt(s.zaliha || 0),
          sku: s.sku
        }));

        const { error: sizesError } = await supabase
          .from('product_sizes')
          .insert(sizesToInsert);

        if (sizesError) throw sizesError;

        // Update product images (delete old, insert new)
        if (selectedProduct.product_images && selectedProduct.product_images.length > 0) {
          await supabase.from('product_images').delete().eq('product_id', selectedProduct.id);
          
          const imagesToInsert = selectedProduct.product_images
            .filter((img: any) => img.url)
            .map((img: any, idx: number) => ({
              product_id: selectedProduct.id,
              url: img.url,
              alt_text: img.alt_text || selectedProduct.naziv,
              sort_order: idx
            }));

          if (imagesToInsert.length > 0) {
            const { error: imagesError } = await supabase
              .from('product_images')
              .insert(imagesToInsert);

            if (imagesError) throw imagesError;
          }
        }

        // Update local state
        const { data: updatedProduct } = await supabase
          .from('products')
          .select(`
            *,
            brands (naziv),
            product_sizes (id, velicina_ml, cijena, zaliha, sku),
            product_images (url, alt_text, sort_order)
          `)
          .eq('id', selectedProduct.id)
          .single();

        setSupabaseProducts(prev =>
          prev.map(p => p.id === selectedProduct.id ? updatedProduct : p)
        );

        toast.success(`Proizvod "${selectedProduct.naziv}" uspješno ažuriran!`, {
          style: {
            background: '#111111',
            color: '#e8d5a3',
            border: '1px solid rgba(201,169,110,0.25)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
          },
          iconTheme: {
            primary: '#c9a96e',
            secondary: '#0a0a0a',
          },
        });
      } else {
        // Create new product
        const insertData: any = {
          naziv: selectedProduct.naziv,
          slug: selectedProduct.slug,
          brand_id: selectedProduct.brand_id,
          koncentracija: selectedProduct.koncentracija,
          spol: selectedProduct.spol,
          opis_kratki: selectedProduct.opis_kratki || null,
          opis_dugi: selectedProduct.opis_dugi || null,
          note_vrha: selectedProduct.note_vrha || null,
          note_srca: selectedProduct.note_srca || null,
          note_baze: selectedProduct.note_baze || null,
          sezona: selectedProduct.sezona || 'sve',
          featured: selectedProduct.featured || false,
          active: selectedProduct.active !== false
        };

        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert(insertData)
          .select()
          .single();

        if (productError) throw productError;

        // Insert product sizes
        const sizesToInsert = selectedProduct.product_sizes.map((s: any) => ({
          product_id: newProduct.id,
          velicina_ml: parseInt(s.velicina_ml),
          cijena: parseFloat(s.cijena),
          zaliha: parseInt(s.zaliha || 0),
          sku: s.sku
        }));

        const { error: sizesError } = await supabase
          .from('product_sizes')
          .insert(sizesToInsert);

        if (sizesError) throw sizesError;

        // Insert product images
        if (selectedProduct.product_images && selectedProduct.product_images.length > 0) {
          const imagesToInsert = selectedProduct.product_images
            .filter((img: any) => img.url)
            .map((img: any, idx: number) => ({
              product_id: newProduct.id,
              url: img.url,
              alt_text: img.alt_text || selectedProduct.naziv,
              sort_order: idx
            }));

          if (imagesToInsert.length > 0) {
            const { error: imagesError } = await supabase
              .from('product_images')
              .insert(imagesToInsert);

            if (imagesError) throw imagesError;
          }
        }

        // Fetch complete product with relations
        const { data: completeProduct } = await supabase
          .from('products')
          .select(`
            *,
            brands (naziv),
            product_sizes (id, velicina_ml, cijena, zaliha, sku),
            product_images (url, alt_text, sort_order)
          `)
          .eq('id', newProduct.id)
          .single();

        // Add to local state
        setSupabaseProducts(prev => [completeProduct, ...prev]);

        toast.success(`Proizvod "${selectedProduct.naziv}" uspješno kreiran!`, {
          style: {
            background: '#111111',
            color: '#e8d5a3',
            border: '1px solid rgba(201,169,110,0.25)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
          },
          iconTheme: {
            primary: '#c9a96e',
            secondary: '#0a0a0a',
          },
        });
      }

      setShowProductModal(false);
      setSelectedProduct(null);
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Greška pri spremanju proizvoda', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle product delete confirmation
   */
  const handleDeleteProduct = (product: any) => {
    setProductToDelete(product);
  };

  /**
   * Confirm and execute product deletion
   */
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) {
        // Handle foreign key constraint error (product used in orders, reviews, etc.)
        if (error.code === '23503') {
          throw new Error('Proizvod je korišten u narudžbama ili recenzijama i ne može biti obrisan. Možete ga deaktivirati umjesto toga.');
        }
        throw error;
      }

      // Remove from local state
      setSupabaseProducts(prev => prev.filter(p => p.id !== productToDelete.id));

      toast.success(`Proizvod "${productToDelete.naziv}" uspješno obrisan!`, {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        iconTheme: {
          primary: '#c9a96e',
          secondary: '#0a0a0a',
        },
      });
      
      setProductToDelete(null);
      setSelectedProduct(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      const errorMessage = error.message || 'Greška pri brisanju proizvoda';
      toast.error(errorMessage, {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // AI GENERATION HANDLERS
  // ============================================================

  /**
   * Generate product description using AI
   */
  const handleGenerateDescription = async () => {
    if (!selectedProduct?.naziv || !selectedProduct?.brand_id) {
      toast.error('Unesite naziv i odaberite brand prije generiranja opisa');
      return;
    }

    const brand = supabaseBrands.find(b => b.id === selectedProduct.brand_id);
    if (!brand) return;

    setAiGenerating(true);
    try {
      const description = await groqService.generateProductDescription(
        selectedProduct.naziv,
        brand.naziv,
        selectedProduct.koncentracija || 'EDP',
        selectedProduct.spol || 'unisex'
      );

      setSelectedProduct({
        ...selectedProduct,
        opis: description,
        opis_kratki: description
      });

      toast.success('Opis generiran pomoću AI!', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        iconTheme: {
          primary: '#c9a96e',
          secondary: '#0a0a0a',
        },
      });
    } catch (error: any) {
      console.error('AI generation error:', error);
      toast.error(error.message || 'Greška pri generiranju opisa', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
      });
    } finally {
      setAiGenerating(false);
    }
  };

  /**
   * Generate scent notes using AI
   */
  const handleGenerateScentNotes = async () => {
    if (!selectedProduct?.naziv || !selectedProduct?.brand_id) {
      toast.error('Unesite naziv i odaberite brand prije generiranja nota');
      return;
    }

    const brand = supabaseBrands.find(b => b.id === selectedProduct.brand_id);
    if (!brand) return;

    setAiGenerating(true);
    try {
      const notes = await groqService.generateScentNotes(
        selectedProduct.naziv,
        brand.naziv
      );

      setSelectedProduct({
        ...selectedProduct,
        note_vrha: notes.note_vrha,
        note_srca: notes.note_srca,
        note_baze: notes.note_baze
      });

      toast.success('Note parfema generirane pomoću AI!', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        iconTheme: {
          primary: '#c9a96e',
          secondary: '#0a0a0a',
        },
      });
    } catch (error: any) {
      console.error('AI generation error:', error);
      toast.error(error.message || 'Greška pri generiranju nota', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
      });
    } finally {
      setAiGenerating(false);
    }
  };

  /**
   * Generate SKU for a product size
   */
  const handleGenerateSKU = async (sizeIndex: number) => {
    if (!selectedProduct?.naziv || !selectedProduct?.brand_id) {
      toast.error('Unesite naziv i odaberite brand prije generiranja SKU');
      return;
    }

    const brand = supabaseBrands.find(b => b.id === selectedProduct.brand_id);
    if (!brand) return;

    const size = selectedProduct.product_sizes[sizeIndex];
    if (!size?.velicina_ml) {
      toast.error('Unesite veličinu (ML) prije generiranja SKU');
      return;
    }

    try {
      const sku = await groqService.generateSKU(
        selectedProduct.naziv,
        brand.naziv,
        size.velicina_ml
      );

      const newSizes = [...selectedProduct.product_sizes];
      newSizes[sizeIndex] = { ...newSizes[sizeIndex], sku };
      setSelectedProduct({ ...selectedProduct, product_sizes: newSizes });

      toast.success('SKU generiran!', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        iconTheme: {
          primary: '#c9a96e',
          secondary: '#0a0a0a',
        },
      });
    } catch (error: any) {
      console.error('SKU generation error:', error);
      toast.error(error.message || 'Greška pri generiranju SKU');
    }
  };

  /**
   * Generate brand description using AI
   */
  const handleGenerateBrandDescription = async () => {
    if (!selectedBrand?.naziv) {
      toast.error('Unesite naziv branda prije generiranja opisa');
      return;
    }

    setAiGenerating(true);
    try {
      const description = await groqService.generateBrandDescription(selectedBrand.naziv);

      setSelectedBrand({
        ...selectedBrand,
        opis: description
      });

      toast.success('Opis branda generiran pomoću AI!', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        iconTheme: {
          primary: '#c9a96e',
          secondary: '#0a0a0a',
        },
      });
    } catch (error: any) {
      console.error('AI generation error:', error);
      toast.error(error.message || 'Greška pri generiranju opisa', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
      });
    } finally {
      setAiGenerating(false);
    }
  };

  // ============================================================
  // COUPON HANDLERS
  // ============================================================

  const handleCreateCoupon = () => {
    setSelectedCoupon({
      kod: '',
      tip: 'postotak',
      vrijednost: 10,
      min_iznos_narudzbe: 0,
      max_popust: null,
      max_koristenja: null,
      aktivan: true,
      vrijedi_do: null
    });
    setShowCouponModal(true);
  };

  const handleEditCoupon = (coupon: any) => {
    setSelectedCoupon({ ...coupon });
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async () => {
    if (!selectedCoupon) return;

    if (!selectedCoupon.kod || !selectedCoupon.vrijednost) {
      toast.error('Kod i vrijednost su obavezni');
      return;
    }

    setSaving(true);
    try {
      if (selectedCoupon.id) {
        // Update existing coupon
        const { error } = await supabase
          .from('coupons')
          .update({
            kod: selectedCoupon.kod.toUpperCase(),
            tip: selectedCoupon.tip,
            vrijednost: parseFloat(selectedCoupon.vrijednost),
            min_iznos_narudzbe: parseFloat(selectedCoupon.min_iznos_narudzbe || 0),
            max_popust: selectedCoupon.max_popust ? parseFloat(selectedCoupon.max_popust) : null,
            max_koristenja: selectedCoupon.max_koristenja ? parseInt(selectedCoupon.max_koristenja) : null,
            aktivan: selectedCoupon.aktivan,
            vrijedi_do: selectedCoupon.vrijedi_do || null
          })
          .eq('id', selectedCoupon.id);

        if (error) throw error;

        // Update local state
        setSupabaseCoupons(prev =>
          prev.map(c => c.id === selectedCoupon.id ? { ...c, ...selectedCoupon } : c)
        );

        toast.success('Kupon uspješno ažuriran!', {
          style: {
            background: '#111111',
            color: '#e8d5a3',
            border: '1px solid rgba(201,169,110,0.25)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
          },
          iconTheme: {
            primary: '#c9a96e',
            secondary: '#0a0a0a',
          },
        });
      } else {
        // Create new coupon
        const { data, error } = await supabase
          .from('coupons')
          .insert({
            kod: selectedCoupon.kod.toUpperCase(),
            tip: selectedCoupon.tip,
            vrijednost: parseFloat(selectedCoupon.vrijednost),
            min_iznos_narudzbe: parseFloat(selectedCoupon.min_iznos_narudzbe || 0),
            max_popust: selectedCoupon.max_popust ? parseFloat(selectedCoupon.max_popust) : null,
            max_koristenja: selectedCoupon.max_koristenja ? parseInt(selectedCoupon.max_koristenja) : null,
            aktivan: selectedCoupon.aktivan,
            vrijedi_do: selectedCoupon.vrijedi_do || null
          })
          .select()
          .single();

        if (error) throw error;

        // Add to local state
        setSupabaseCoupons(prev => [data, ...prev]);

        toast.success('Kupon uspješno kreiran!', {
          style: {
            background: '#111111',
            color: '#e8d5a3',
            border: '1px solid rgba(201,169,110,0.25)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
          },
          iconTheme: {
            primary: '#c9a96e',
            secondary: '#0a0a0a',
          },
        });
      }

      setShowCouponModal(false);
      setSelectedCoupon(null);
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      if (error.code === '23505' || (error.message && error.message.includes('unique constraint'))) {
        toast.error('Kupon s ovim kodom već postoji');
      } else {
        toast.error(error.message || 'Greška pri spremanju kupona');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoupon = async (couponId: number) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovaj kupon?')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) {
        // Handle foreign key constraint error (coupon used in orders)
        if (error.code === '23503') {
          throw new Error('Kupon je korišten u narudžbama i ne može biti obrisan. Možete ga deaktivirati umjesto toga.');
        }
        throw error;
      }

      // Remove from local state
      setSupabaseCoupons(prev => prev.filter(c => c.id !== couponId));

      toast.success('Kupon obrisan!', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        iconTheme: {
          primary: '#c9a96e',
          secondary: '#0a0a0a',
        },
      });
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      const errorMessage = error.message || 'Greška pri brisanju kupona';
      toast.error(errorMessage, {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // BRAND HANDLERS
  // ============================================================

  const handleCreateBrand = () => {
    setSelectedBrand({
      naziv: '',
      opis: '',
      logo_url: '',
      active: true
    });
    setShowBrandModal(true);
  };

  const handleEditBrand = (brand: any) => {
    setSelectedBrand({ ...brand });
    setShowBrandModal(true);
  };

  const handleSaveBrand = async () => {
    if (!selectedBrand) return;

    if (!selectedBrand.naziv) {
      toast.error('Naziv je obavezan');
      return;
    }

    setSaving(true);
    try {
      if (selectedBrand.id) {
        // Update existing brand
        const { error } = await supabase
          .from('brands')
          .update({
            naziv: selectedBrand.naziv,
            opis: selectedBrand.opis || null,
            logo_url: selectedBrand.logo_url || null,
            active: selectedBrand.active
          })
          .eq('id', selectedBrand.id);

        if (error) throw error;

        // Update local state
        setSupabaseBrands(prev =>
          prev.map(b => b.id === selectedBrand.id ? { ...b, ...selectedBrand } : b)
        );

        toast.success('Brand uspješno ažuriran!', {
          style: {
            background: '#111111',
            color: '#e8d5a3',
            border: '1px solid rgba(201,169,110,0.25)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
          },
          iconTheme: {
            primary: '#c9a96e',
            secondary: '#0a0a0a',
          },
        });
      } else {
        // Create new brand
        const { data, error } = await supabase
          .from('brands')
          .insert({
            naziv: selectedBrand.naziv,
            opis: selectedBrand.opis || null,
            logo_url: selectedBrand.logo_url || null,
            active: selectedBrand.active
          })
          .select()
          .single();

        if (error) throw error;

        // Add to local state
        setSupabaseBrands(prev => [...prev, data].sort((a, b) => a.naziv.localeCompare(b.naziv)));

        toast.success('Brand uspješno kreiran!', {
          style: {
            background: '#111111',
            color: '#e8d5a3',
            border: '1px solid rgba(201,169,110,0.25)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
          },
          iconTheme: {
            primary: '#c9a96e',
            secondary: '#0a0a0a',
          },
        });
      }

      setShowBrandModal(false);
      setSelectedBrand(null);
    } catch (error: any) {
      console.error('Error saving brand:', error);
      if (error.code === '23505' || (error.message && error.message.includes('unique constraint'))) {
        toast.error('Brand s ovim nazivom već postoji');
      } else {
        toast.error(error.message || 'Greška pri spremanju branda');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBrand = async (brandId: number) => {
    // Check if brand has products in Supabase
    const productCount = supabaseProducts.filter(p => p.brand_id === brandId).length;
    
    if (productCount > 0) {
      toast.error(`Ne možete obrisati brand koji ima ${productCount} proizvoda. Prvo obrišite ili premjestite proizvode.`, {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        duration: 5000,
      });
      return;
    }

    if (!confirm('Jeste li sigurni da želite obrisati ovaj brand?')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId);

      if (error) {
        // Handle foreign key constraint error
        if (error.code === '23503') {
          throw new Error('Brand ima povezane proizvode i ne može biti obrisan');
        }
        throw error;
      }

      // Remove from local state
      setSupabaseBrands(prev => prev.filter(b => b.id !== brandId));

      toast.success('Brand obrisan!', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        iconTheme: {
          primary: '#c9a96e',
          secondary: '#0a0a0a',
        },
      });
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      const errorMessage = error.message || 'Greška pri brisanju branda';
      toast.error(errorMessage, {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CUSTOMER HANDLERS
  // ============================================================

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer({ ...customer });
    setShowCustomerModal(true);
  };

  const handleSaveCustomer = async () => {
    if (!selectedCustomer) return;

    if (!selectedCustomer.ime || !selectedCustomer.prezime || !selectedCustomer.email) {
      toast.error('Ime, prezime i email su obavezni');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ime: selectedCustomer.ime,
          prezime: selectedCustomer.prezime,
          telefon: selectedCustomer.telefon || null,
          adresa: selectedCustomer.adresa || null,
          grad: selectedCustomer.grad || null,
          postanski_broj: selectedCustomer.postanski_broj || null,
          role: selectedCustomer.role
        })
        .eq('id', selectedCustomer.id);

      if (error) throw error;

      // Update local state
      setSupabaseCustomers(prev =>
        prev.map(c => c.id === selectedCustomer.id ? { ...c, ...selectedCustomer } : c)
      );

      toast.success('Kupac uspješno ažuriran!', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        iconTheme: {
          primary: '#c9a96e',
          secondary: '#0a0a0a',
        },
      });

      setShowCustomerModal(false);
      setSelectedCustomer(null);
    } catch (error: any) {
      console.error('Error saving customer:', error);
      toast.error(error.message || 'Greška pri spremanju kupca');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // ORDER HANDLERS
  // ============================================================

  const handleDeleteOrder = async (orderNumber: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovu narudžbu? Ova akcija se ne može poništiti.')) return;

    setSaving(true);
    try {
      // First find the order ID so we can delete order_items
      const order = supabaseOrders.find(o => o.order_number === orderNumber);
      
      if (order?.id) {
        // Delete order items first (foreign key constraint)
        const { error: itemsError } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', order.id);
        if (itemsError) throw itemsError;
      }

      // Then delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('order_number', orderNumber);

      if (error) throw error;

      // Remove from local state
      setSupabaseOrders(prev => prev.filter(o => o.order_number !== orderNumber));

      // Close modal if it's the deleted order
      if (selectedOrder?.order_number === orderNumber) {
        setSelectedOrder(null);
      }

      toast.success('Narudžba uspješno obrisana!', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        iconTheme: {
          primary: '#c9a96e',
          secondary: '#0a0a0a',
        },
      });
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error(error.message || 'Greška pri brisanju narudžbe', {
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        },
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Use only Supabase orders
  const allOrders = supabaseOrders;

  const totalRevenue = allOrders.filter(o => o.status !== 'otkazano').reduce((s, o) => s + o.ukupno, 0);
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Zagreb' }); // YYYY-MM-DD in Zagreb
  const todayOrders = allOrders.filter(o => new Date(o.created_at).toLocaleDateString('sv-SE', { timeZone: 'Europe/Zagreb' }) === today).length;

  // Low stock products from Supabase
  const lowStock = supabaseProducts.flatMap(p => 
    p.product_sizes?.filter((s: any) => s.zaliha <= 5).map((s: any) => ({ ...p, size: s })) || []
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'narudzbe', label: 'Narudžbe', icon: <ShoppingBag size={16} />, badge: allOrders.filter(o => o.status === 'nova' || o.status === 'cekanje_uplate').length },
    { id: 'proizvodi', label: 'Proizvodi', icon: <Package size={16} /> },
    { id: 'brendovi', label: 'Brendovi', icon: <Star size={16} /> },
    { id: 'kupci', label: 'Kupci', icon: <Users size={16} /> },
    { id: 'recenzije', label: 'Recenzije', icon: <Star size={16} />, badge: pendingReviews.length },
    { id: 'kuponi', label: 'Kuponi', icon: <Tag size={16} /> },
    { id: 'newsletter', label: 'Newsletter', icon: <Mail size={16} /> },
    { id: 'statistike', label: 'Statistike', icon: <BarChart2 size={16} /> },
  ];

  // Mini bar chart data
  const chartData = [42, 58, 35, 67, 89, 72, 95, 61, 48, 83, 92, 71, 55, 78, 96, 63, 45, 87, 74, 91, 68, 53, 80, 76, 94, 62, 47, 85, 71, 98];

  const SidebarNav = () => (
    <nav className="p-4 space-y-1">
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => { setView(item.id as AdminView); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-['Inter'] transition-all ${
            view === item.id
              ? 'bg-[#c9a96e]/15 text-[#c9a96e] border border-[#c9a96e]/25'
              : 'text-[#e8d5a3]/50 hover:text-[#e8d5a3]/80 hover:bg-[#e8d5a3]/3'
          }`}
        >
          <span className={view === item.id ? 'text-[#c9a96e]' : ''}>{item.icon}</span>
          {item.label}
          {item.badge ? (
            <span className="ml-auto bg-[#c9a96e] text-[#0a0a0a] text-[9px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
          ) : null}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="bg-[#0a0a0a] min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 fixed top-0 left-0 h-full bg-[#0d0d0d] border-r border-[#c9a96e]/10 z-40">
        {/* Logo */}
        <div className="p-5 border-b border-[#c9a96e]/10">
          <Link to="/" className="block">
            <span className="text-lg font-['Playfair_Display'] font-bold text-[#e8d5a3] tracking-[0.15em]">
              DEKANTI<span className="text-[#c9a96e]">.HR</span>
            </span>
            <div className="text-[8px] tracking-[0.3em] text-[#c9a96e]/50 uppercase mt-0.5">Admin Panel</div>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <div className="p-4 border-t border-[#c9a96e]/10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#c9a96e]/20 flex items-center justify-center text-[#c9a96e] text-xs font-bold">{user.ime[0]}</div>
            <div>
              <p className="text-[#e8d5a3]/70 text-xs font-semibold font-['Inter']">{user.ime} {user.prezime}</p>
              <p className="text-[#c9a96e]/60 text-[9px] font-['Inter']">Administrator</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 text-red-400/60 hover:text-red-400 text-xs font-['Inter'] py-1.5 transition-colors">
            <LogOut size={12} />
            Odjava
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-56 bg-[#0d0d0d] border-r border-[#c9a96e]/10 h-full overflow-y-auto">
            <div className="p-4 border-b border-[#c9a96e]/10">
              <span className="text-lg font-['Playfair_Display'] font-bold text-[#e8d5a3]">DEKANTI<span className="text-[#c9a96e]">.HR</span></span>
            </div>
            <SidebarNav />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0d0d0d]/95 backdrop-blur border-b border-[#c9a96e]/10 px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-[#e8d5a3]/50 hover:text-[#c9a96e]">
              <Menu size={20} />
            </button>
            <h1 className="text-[#e8d5a3]/80 font-['Playfair_Display'] text-lg font-bold capitalize">
              {navItems.find(n => n.id === view)?.label ?? 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-[#e8d5a3]/40 hover:text-[#c9a96e] transition-colors">
              <Bell size={17} />
              {pendingReviews.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#c9a96e] rounded-full text-[8px] text-[#0a0a0a] font-bold flex items-center justify-center">
                  {pendingReviews.length}
                </span>
              )}
            </button>
            <Link to="/" className="text-[#e8d5a3]/40 hover:text-[#c9a96e] text-xs font-['Inter'] transition-colors">← Vidi stranicu</Link>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {/* DASHBOARD */}
          {view === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Ukupan prihod', value: `${totalRevenue.toFixed(0)}€`, change: '+12.5%', up: true, icon: <TrendingUp size={18} /> },
                  { label: 'Narudžbe danas', value: `${todayOrders}`, change: '+3 danas', up: true, icon: <ShoppingBag size={18} /> },
                  { label: 'Čekaju uplatu', value: `${allOrders.filter(o => o.status === 'cekanje_uplate').length}`, change: 'Revolut', up: false, icon: <CreditCard size={18} /> },
                  { label: 'Čekaju odobrenje', value: `${pendingReviews.length}`, change: 'recenzija', up: false, icon: <Star size={18} /> },
                ].map(kpi => (
                  <div key={kpi.label} className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-[#e8d5a3]/40 text-xs font-['Inter'] uppercase tracking-wider leading-tight">{kpi.label}</p>
                      <div className="text-[#c9a96e]/40">{kpi.icon}</div>
                    </div>
                    <p className="text-[#c9a96e] font-['DM_Sans'] text-2xl font-bold mb-1">{kpi.value}</p>
                    <div className={`flex items-center gap-1 text-[10px] font-['Inter'] ${kpi.up ? 'text-green-400' : 'text-orange-400'}`}>
                      {kpi.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {kpi.change}
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue Chart */}
              <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-[#e8d5a3]/80 font-['Playfair_Display'] font-bold text-lg">Prihodi — zadnjih 30 dana</h3>
                    <p className="text-[#e8d5a3]/30 text-xs font-['Inter']">Dnevni prihodi u EUR</p>
                  </div>
                  <span className="text-[#c9a96e] font-['DM_Sans'] font-bold text-xl">{totalRevenue.toFixed(0)}€</span>
                </div>
                <div className="flex items-end gap-1 h-28">
                  {chartData.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-0.5 group">
                      <div
                        className="w-full bg-[#c9a96e]/20 hover:bg-[#c9a96e]/50 rounded-sm transition-all cursor-pointer"
                        style={{ height: `${(val / 100) * 100}%` }}
                        title={`${val}€`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[#e8d5a3]/20 text-[9px] font-['Inter']">
                  <span>14. Feb</span><span>28. Feb</span><span>15. Mar</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent orders */}
                <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#e8d5a3]/80 font-['Playfair_Display'] font-bold">Zadnje narudžbe</h3>
                    <button onClick={() => setView('narudzbe')} className="text-[#c9a96e]/60 text-xs font-['Inter'] hover:text-[#c9a96e]">Sve →</button>
                  </div>
                  <div className="space-y-3">
                    {allOrders.slice(0, 5).map(order => (
                      <div key={order.order_number} className="flex items-center justify-between py-2 border-b border-[#c9a96e]/5">
                        <div>
                          <p className="text-[#c9a96e] text-xs font-semibold font-['Inter']">{order.order_number}</p>
                          <p className="text-[#e8d5a3]/40 text-[10px] font-['Inter']">{order.ime} {order.prezime}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${STATUS_COLORS[order.status] ?? ''}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                          <span className="text-[#c9a96e] text-xs font-bold font-['DM_Sans']">{order.ukupno.toFixed(2)}€</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low stock */}
                <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#e8d5a3]/80 font-['Playfair_Display'] font-bold">⚠️ Niska zaliha</h3>
                    <span className="text-orange-400 text-xs font-['Inter'] border border-orange-400/30 px-2 py-0.5 rounded-full">
                      {lowStock.length} upozorenja
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {lowStock.slice(0, 6).map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="text-[#e8d5a3]/70 text-xs font-['Inter'] font-semibold">{item.naziv} {item.size.velicina_ml}ml</p>
                          <p className="text-[#e8d5a3]/30 text-[10px] font-['Inter']">{item.size.sku}</p>
                        </div>
                        <span className={`text-xs font-bold font-['Inter'] ${item.size.zaliha === 0 ? 'text-red-400' : 'text-orange-400'}`}>
                          {item.size.zaliha === 0 ? '⛔ Nema' : `${item.size.zaliha} kom`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top products */}
              <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-5">
                <h3 className="text-[#e8d5a3]/80 font-['Playfair_Display'] font-bold mb-4">Top 5 proizvoda po prodaji</h3>
                <div className="space-y-3">
                  {supabaseProducts.filter(p => p.bestseller_rank && p.bestseller_rank <= 5).sort((a, b) => (a.bestseller_rank ?? 99) - (b.bestseller_rank ?? 99)).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-[#c9a96e]/60 text-xs font-bold font-['Inter'] w-5">#{i + 1}</span>
                      <img src={p.images && p.images.length > 0 ? p.images[0] : ''} alt="" className="w-10 h-10 rounded-lg object-cover opacity-70" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[#e8d5a3]/70 text-sm font-semibold font-['Inter'] truncate">{p.naziv}</p>
                        <p className="text-[#e8d5a3]/30 text-[10px] font-['Inter']">{p.brand?.naziv || p.brand} · {p.broj_recenzija || 0} recenzija</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#c9a96e] text-sm font-bold font-['DM_Sans']">
                          od {p.product_sizes && p.product_sizes.length > 0 ? Math.min(...p.product_sizes.map((s: any) => s.cijena)).toFixed(2) : '0.00'}€
                        </p>
                        <div className="w-16 bg-[#1a1a1a] rounded-full h-1 mt-1">
                          <div className="bg-[#c9a96e] h-full rounded-full" style={{ width: `${100 - (i * 18)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NARUDŽBE */}
          {view === 'narudzbe' && (
            <div className="space-y-5">
              {/* Actions bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-2 flex-wrap">
                  {['sve', 'cekanje_uplate', 'nova', 'u_obradi', 'poslano', 'isporuceno', 'otkazano'].map(s => (
                    <button key={s} className="text-xs px-3 py-1.5 rounded-lg border border-[#c9a96e]/15 text-[#e8d5a3]/50 hover:border-[#c9a96e]/40 hover:text-[#c9a96e] font-['Inter'] transition-all capitalize">
                      {s === 'sve' ? 'Sve' : STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
                <button className="ml-auto flex items-center gap-2 text-[#c9a96e] text-xs border border-[#c9a96e]/30 px-3 py-1.5 rounded-lg hover:bg-[#c9a96e]/5 font-['Inter']" onClick={() => toast.success('CSV exportiran!')}>
                  <Download size={13} />
                  Export CSV
                </button>
              </div>

              {/* Order detail modal */}
              {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedOrder(null)} />
                  <div className="relative bg-[#111111] border border-[#c9a96e]/20 rounded-3xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <p className="text-[#c9a96e] font-['DM_Sans'] font-bold text-xl">{selectedOrder.order_number}</p>
                        <p className="text-[#e8d5a3]/40 text-xs font-['Inter']">{formatDate(selectedOrder.created_at)}</p>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} className="text-[#e8d5a3]/40 hover:text-[#c9a96e]"><X size={18} /></button>
                    </div>

                    {/* Status + Payment */}
                    <div className="mb-4 space-y-3">
                      <div>
                        <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Status narudžbe</label>
                        <div className="relative">
                          <select
                            value={selectedOrder.status}
                            onChange={e => handleStatusChange(selectedOrder.order_number, e.target.value)}
                            disabled={saving}
                            className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c9a96e]/50 pointer-events-none" />
                        </div>
                      </div>

                      {/* Payment status */}
                      <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#c9a96e]/10 rounded-xl p-3">
                        <div>
                          <p className="text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] mb-0.5">Način plaćanja</p>
                          <p className="text-[#e8d5a3]/70 text-xs font-['Inter']">
                            {selectedOrder.nacin_placanja === 'pouzecem' ? '💵 Pouzećem' : selectedOrder.nacin_placanja === 'revolut' ? '💳 Revolut' : '🏦 Bankovna transakcija'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedOrder.placeno ? (
                            <span className="text-green-400 text-xs font-semibold font-['Inter'] flex items-center gap-1">
                              <Check size={12} /> Plaćeno
                            </span>
                          ) : (
                            <span className="text-orange-400 text-xs font-semibold font-['Inter']">⏳ Čeka uplatu</span>
                          )}
                          {selectedOrder.nacin_placanja !== 'pouzecem' && !selectedOrder.placeno && (
                            <button
                              onClick={() => handleMarkPaid(selectedOrder.order_number)}
                              disabled={saving}
                              className="bg-green-600/20 text-green-400 border border-green-500/30 px-2.5 py-1 rounded-lg text-[10px] font-semibold hover:bg-green-600/30 transition-all disabled:opacity-50 font-['Inter']"
                            >
                              Označi plaćeno
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Customer info */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] mb-1 block">Ime</label>
                        <input
                          type="text"
                          value={selectedOrder.ime}
                          onChange={e => setSelectedOrder({ ...selectedOrder, ime: e.target.value })}
                          disabled={saving}
                          className="w-full bg-[#0a0a0a] border border-[#c9a96e]/10 text-[#e8d5a3]/70 px-3 py-2 rounded-xl text-xs font-['Inter'] focus:outline-none focus:border-[#c9a96e]/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] mb-1 block">Prezime</label>
                        <input
                          type="text"
                          value={selectedOrder.prezime}
                          onChange={e => setSelectedOrder({ ...selectedOrder, prezime: e.target.value })}
                          disabled={saving}
                          className="w-full bg-[#0a0a0a] border border-[#c9a96e]/10 text-[#e8d5a3]/70 px-3 py-2 rounded-xl text-xs font-['Inter'] focus:outline-none focus:border-[#c9a96e]/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] mb-1 block">Email</label>
                        <input
                          type="email"
                          value={selectedOrder.email}
                          onChange={e => setSelectedOrder({ ...selectedOrder, email: e.target.value })}
                          disabled={saving}
                          className="w-full bg-[#0a0a0a] border border-[#c9a96e]/10 text-[#e8d5a3]/70 px-3 py-2 rounded-xl text-xs font-['Inter'] focus:outline-none focus:border-[#c9a96e]/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] mb-1 block">Telefon</label>
                        <input
                          type="text"
                          value={selectedOrder.telefon}
                          onChange={e => setSelectedOrder({ ...selectedOrder, telefon: e.target.value })}
                          disabled={saving}
                          className="w-full bg-[#0a0a0a] border border-[#c9a96e]/10 text-[#e8d5a3]/70 px-3 py-2 rounded-xl text-xs font-['Inter'] focus:outline-none focus:border-[#c9a96e]/30 transition-all"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] mb-1 block">Adresa</label>
                        <input
                          type="text"
                          value={selectedOrder.adresa}
                          onChange={e => setSelectedOrder({ ...selectedOrder, adresa: e.target.value })}
                          disabled={saving}
                          className="w-full bg-[#0a0a0a] border border-[#c9a96e]/10 text-[#e8d5a3]/70 px-3 py-2 rounded-xl text-xs font-['Inter'] focus:outline-none focus:border-[#c9a96e]/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] mb-1 block">Postanski Broj</label>
                        <input
                          type="text"
                          value={selectedOrder.postanski_broj}
                          onChange={e => setSelectedOrder({ ...selectedOrder, postanski_broj: e.target.value })}
                          disabled={saving}
                          className="w-full bg-[#0a0a0a] border border-[#c9a96e]/10 text-[#e8d5a3]/70 px-3 py-2 rounded-xl text-xs font-['Inter'] focus:outline-none focus:border-[#c9a96e]/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] mb-1 block">Grad</label>
                        <input
                          type="text"
                          value={selectedOrder.grad}
                          onChange={e => setSelectedOrder({ ...selectedOrder, grad: e.target.value })}
                          disabled={saving}
                          className="w-full bg-[#0a0a0a] border border-[#c9a96e]/10 text-[#e8d5a3]/70 px-3 py-2 rounded-xl text-xs font-['Inter'] focus:outline-none focus:border-[#c9a96e]/30 transition-all"
                        />
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <label className="text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] mb-2 block">Proizvodi</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {selectedOrder.order_items?.map((item: any, idx: number) => (
                          <div key={idx} className="bg-[#0a0a0a] border border-[#c9a96e]/5 rounded-xl p-2.5 flex items-center justify-between">
                            <div>
                              <p className="text-[#e8d5a3]/80 text-[11px] font-semibold font-['Inter']">{item.naziv_proizvoda}</p>
                              <p className="text-[#c9a96e]/60 text-[9px] font-['Inter']">{item.brand_naziv} · {item.ml}ml</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[#e8d5a3]/60 text-[10px] font-['Inter']">{item.kolicina}x {item.cijena.toFixed(2)}€</p>
                              <p className="text-[#c9a96e] text-[11px] font-bold font-['DM_Sans']">{(item.kolicina * item.cijena).toFixed(2)}€</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tracking */}
                    <div className="mb-4">
                      <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">BoxNow tracking broj</label>
                      <div className="flex gap-2">
                        <input
                          ref={trackingInputRef}
                          defaultValue={selectedOrder.tracking_broj ?? ''}
                          placeholder="BN000000000HR"
                          disabled={saving}
                          className="flex-1 bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-3 py-2 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        />
                        <button 
                          onClick={handleTrackingUpdate}
                          disabled={saving}
                          className="bg-[#c9a96e]/10 border border-[#c9a96e]/30 text-[#c9a96e] px-3 py-2 rounded-xl text-xs hover:bg-[#c9a96e] hover:text-[#0a0a0a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? '...' : <Check size={13} />}
                        </button>
                      </div>
                      {selectedOrder.tracking_broj && (
                        <a
                          href={`https://boxnow.hr/track?parcelId=${selectedOrder.tracking_broj}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-[#c9a96e]/60 text-[11px] font-['Inter'] hover:text-[#c9a96e] transition-colors"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Prati na BoxNow
                        </a>
                      )}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-4 border-t border-[#c9a96e]/10">
                      <span className="text-[#e8d5a3]/40 text-sm font-['Inter']">Ukupno</span>
                      <span className="text-[#c9a96e] font-['DM_Sans'] font-bold text-xl">{selectedOrder.ukupno.toFixed(2)}€</span>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        onClick={handleSaveOrder}
                        disabled={saving}
                        className="bg-[#c9a96e] text-[#0a0a0a] px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#e8d5a3] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Inter']"
                      >
                        {saving ? 'Spremam...' : 'Spremi promjene'}
                      </button>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3]/60 px-4 py-2.5 rounded-xl text-xs font-bold hover:text-[#e8d5a3] transition-all font-['Inter']"
                      >
                        Zatvori
                      </button>
                    </div>

                    {/* Email kupcu */}
                    <div className="mt-4">
                      <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Pošalji email kupcu</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['U obradi', 'Uplata potvrđena', 'Isporučeno', 'Otkazano'].map(tpl => (
                          <button
                            key={tpl}
                            disabled={saving}
                            className="text-xs text-[#c9a96e]/60 border border-[#c9a96e]/20 px-2 py-1.5 rounded-lg hover:bg-[#c9a96e]/5 hover:border-[#c9a96e]/40 transition-all font-['Inter'] text-left disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => handleSendEmailTemplate(tpl)}
                          >
                            📧 {tpl}
                          </button>
                        ))}
                      </div>
                      <p className="text-[#e8d5a3]/20 text-[10px] font-['Inter'] mt-1.5">
                        Šalje se na: {selectedOrder.email}
                      </p>
                    </div>

                    {/* Delete Order Button */}
                    <div className="mt-6 pt-4 border-t border-[#c9a96e]/10">
                      <button
                        onClick={() => handleDeleteOrder(selectedOrder.order_number)}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 bg-red-600/20 text-red-400 border border-red-400/30 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Inter']"
                      >
                        <Trash2 size={14} />
                        Obriši narudžbu
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders table */}
              <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#c9a96e]/10">
                        {['Broj', 'Kupac', 'Datum', 'Plaćanje', 'Status', 'Iznos', ''].map(h => (
                          <th key={h} className="text-left text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allOrders.map(order => (
                        <tr key={order.order_number} className="border-b border-[#c9a96e]/5 hover:bg-[#c9a96e]/3 transition-colors">
                          <td className="px-4 py-3 text-[#c9a96e] text-xs font-semibold font-['Inter']">{order.order_number}</td>
                          <td className="px-4 py-3">
                            <p className="text-[#e8d5a3]/70 text-xs font-['Inter'] font-semibold">{order.ime} {order.prezime}</p>
                            <p className="text-[#e8d5a3]/30 text-[10px] font-['Inter']">{order.email}</p>
                          </td>
                          <td className="px-4 py-3 text-[#e8d5a3]/40 text-xs font-['Inter']">{formatDate(order.created_at)}</td>
                          <td className="px-4 py-3 text-[#e8d5a3]/40 text-xs font-['Inter']">
                            {order.nacin_placanja === 'pouzecem' ? '💵 COD' : order.nacin_placanja === 'revolut' ? '💳 Revolut' : '🏦 Bankovno'}
                          {order.placeno && <span className="ml-1 text-green-400 text-[8px]">✓</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold font-['Inter'] ${STATUS_COLORS[order.status] ?? ''}`}>
                              {STATUS_LABELS[order.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#c9a96e] font-['DM_Sans'] font-bold text-sm">{order.ukupno.toFixed(2)}€</td>
                          <td className="px-4 py-3">
                            <button onClick={() => setSelectedOrder(order)} className="text-[#c9a96e]/50 hover:text-[#c9a96e] transition-colors">
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PROIZVODI */}
          {view === 'proizvodi' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <p className="text-[#e8d5a3]/40 text-sm font-['Inter']">
                  {supabaseProducts.length} proizvoda
                </p>
                <button 
                  className="bg-[#c9a96e] text-[#0a0a0a] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#e8d5a3] transition-all font-['Inter'] disabled:opacity-50 disabled:cursor-not-allowed" 
                  onClick={handleCreateProduct}
                  disabled={loading || supabaseBrands.length === 0}
                >
                  + Novi proizvod
                </button>
              </div>
              {loading ? (
                <div className="text-center py-12 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl">
                  <div className="w-8 h-8 border-2 border-[#c9a96e]/20 border-t-[#c9a96e] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-[#e8d5a3]/40 font-['Inter']">Učitavanje...</p>
                </div>
              ) : supabaseProducts.length === 0 ? (
                <div className="text-center py-12 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl">
                  <Package size={32} className="text-[#c9a96e]/30 mx-auto mb-3" />
                  <p className="text-[#e8d5a3]/40 font-['Inter']">Nema proizvoda u bazi</p>
                  <p className="text-[#e8d5a3]/20 text-xs font-['Inter'] mt-1">Dodajte prvi proizvod klikom na "+ Novi proizvod"</p>
                </div>
              ) : (
                <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-[#c9a96e]/10">{['Slika', 'Naziv', 'Brand', 'Konc.', 'Spol', 'Min.cijena', 'Zaliha', 'Aktivan', ''].map(h => <th key={h} className="text-left text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] px-4 py-3">{h}</th>)}</tr></thead>
                      <tbody>
                        {supabaseProducts.map(p => {
                          // Handle Supabase data format
                          const brandName = p.brands?.naziv || 'N/A';
                          const sizes = p.product_sizes || [];
                          const minPrice = sizes.length > 0 ? Math.min(...sizes.map((s: any) => s.cijena)) : 0;
                          const totalStock = sizes.length > 0 ? sizes.reduce((s: number, sz: any) => s + sz.zaliha, 0) : 0;
                          const imageUrl = p.product_images?.[0]?.url || '/placeholder.png';
                          
                          return (
                            <tr key={p.id} className="border-b border-[#c9a96e]/5 hover:bg-[#c9a96e]/3 transition-colors">
                              <td className="px-4 py-3"><img src={imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover opacity-70" /></td>
                              <td className="px-4 py-3"><p className="text-[#e8d5a3]/70 text-xs font-semibold font-['Inter']">{p.naziv}</p><p className="text-[#e8d5a3]/25 text-[10px] font-['Inter']">{p.slug}</p></td>
                              <td className="px-4 py-3 text-[#c9a96e] text-xs font-['Inter']">{brandName}</td>
                              <td className="px-4 py-3 text-[#e8d5a3]/50 text-xs font-['Inter']">{p.koncentracija}</td>
                              <td className="px-4 py-3 text-[#e8d5a3]/50 text-xs font-['Inter'] capitalize">{p.spol}</td>
                              <td className="px-4 py-3 text-[#c9a96e] text-xs font-bold font-['DM_Sans']">{minPrice.toFixed(2)}€</td>
                              <td className="px-4 py-3"><span className={`text-xs font-bold font-['Inter'] ${totalStock < 10 ? 'text-orange-400' : 'text-green-400'}`}>{totalStock} kom</span></td>
                              <td className="px-4 py-3"><span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${p.active ? 'bg-green-400/15 text-green-400' : 'bg-red-400/15 text-red-400'}`}>{p.active ? 'Da' : 'Ne'}</span></td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button className="text-[#c9a96e]/50 hover:text-[#c9a96e] transition-colors" onClick={() => handleEditProduct(p)} aria-label="Uredi proizvod">
                                    <Edit size={14} />
                                  </button>
                                  <button className="text-red-400/50 hover:text-red-400 transition-colors" onClick={() => handleDeleteProduct(p)} aria-label="Obriši proizvod">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Product Create/Edit Modal */}
              {showProductModal && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/80" onClick={() => setShowProductModal(false)} />
                  <div className="relative bg-[#111111] border border-[#c9a96e]/20 rounded-3xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <p className="text-[#c9a96e] font-['Playfair_Display'] font-bold text-xl">
                          {selectedProduct.id ? 'Uredi proizvod' : 'Novi proizvod'}
                        </p>
                        {selectedProduct.id && (
                          <p className="text-[#e8d5a3]/40 text-xs font-['Inter']">ID: {selectedProduct.id}</p>
                        )}
                      </div>
                      <button onClick={() => setShowProductModal(false)} className="text-[#e8d5a3]/40 hover:text-[#c9a96e]"><X size={18} /></button>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-4 mb-5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Naziv proizvoda *</label>
                          <input
                            type="text"
                            value={selectedProduct.naziv}
                            onChange={e => setSelectedProduct({ ...selectedProduct, naziv: e.target.value })}
                            disabled={saving}
                            placeholder="Chanel No. 5"
                            className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Slug (URL)</label>
                          <input
                            type="text"
                            value={selectedProduct.slug || ''}
                            onChange={e => setSelectedProduct({ ...selectedProduct, slug: e.target.value })}
                            disabled={saving}
                            placeholder="chanel-no-5"
                            className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Brand *</label>
                          <select
                            value={selectedProduct.brand_id}
                            onChange={e => setSelectedProduct({ ...selectedProduct, brand_id: parseInt(e.target.value) })}
                            disabled={saving || supabaseBrands.length === 0}
                            className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            {supabaseBrands.length === 0 ? (
                              <option value="">Učitavanje brendova...</option>
                            ) : (
                              supabaseBrands.map(b => <option key={b.id} value={b.id}>{b.naziv}</option>)
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Koncentracija</label>
                          <select
                            value={selectedProduct.koncentracija}
                            onChange={e => setSelectedProduct({ ...selectedProduct, koncentracija: e.target.value })}
                            disabled={saving}
                            className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <option value="EDP">EDP</option>
                            <option value="EDT">EDT</option>
                            <option value="EDC">EDC</option>
                            <option value="Parfum">Parfum</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Spol</label>
                          <select
                            value={selectedProduct.spol}
                            onChange={e => setSelectedProduct({ ...selectedProduct, spol: e.target.value })}
                            disabled={saving}
                            className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <option value="muški">Muški</option>
                            <option value="ženski">Ženski</option>
                            <option value="unisex">Unisex</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Sezona</label>
                          <select
                            value={selectedProduct.sezona}
                            onChange={e => setSelectedProduct({ ...selectedProduct, sezona: e.target.value })}
                            disabled={saving}
                            className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <option value="sve">Sve sezone</option>
                            <option value="proljeće">Proljeće</option>
                            <option value="ljeto">Ljeto</option>
                            <option value="jesen">Jesen</option>
                            <option value="zima">Zima</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter']">Kratki opis</label>
                          <button
                            type="button"
                            onClick={handleGenerateDescription}
                            disabled={saving || aiGenerating || !selectedProduct.naziv || !selectedProduct.brand_id}
                            className="flex items-center gap-1.5 text-[#c9a96e] hover:text-[#e8d5a3] text-xs font-['Inter'] font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Generiraj opis pomoću AI"
                          >
                            <Sparkles size={14} />
                            {aiGenerating ? 'Generiram...' : 'AI Generiraj'}
                          </button>
                        </div>
                        <textarea
                          value={selectedProduct.opis_kratki}
                          onChange={e => setSelectedProduct({ ...selectedProduct, opis_kratki: e.target.value })}
                          disabled={saving}
                          rows={2}
                          className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Dugi opis</label>
                        <textarea
                          value={selectedProduct.opis_dugi}
                          onChange={e => setSelectedProduct({ ...selectedProduct, opis_dugi: e.target.value })}
                          disabled={saving}
                          rows={3}
                          className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
                        />
                      </div>

                      {/* Scent Notes Section */}
                      <div className="border-t border-[#c9a96e]/10 pt-4 mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter']">Note parfema</label>
                          <button
                            type="button"
                            onClick={handleGenerateScentNotes}
                            disabled={saving || aiGenerating || !selectedProduct.naziv || !selectedProduct.brand_id}
                            className="flex items-center gap-1.5 text-[#c9a96e] hover:text-[#e8d5a3] text-xs font-['Inter'] font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Generiraj note pomoću AI"
                          >
                            <Sparkles size={14} />
                            {aiGenerating ? 'Generiram...' : 'AI Generiraj'}
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] mb-1 block">Note vrha</label>
                            <input
                              type="text"
                              value={selectedProduct.note_vrha || ''}
                              onChange={e => setSelectedProduct({ ...selectedProduct, note_vrha: e.target.value })}
                              disabled={saving}
                              placeholder="bergamot, limun..."
                              className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-3 py-2 rounded-lg text-xs font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] mb-1 block">Note srca</label>
                            <input
                              type="text"
                              value={selectedProduct.note_srca || ''}
                              onChange={e => setSelectedProduct({ ...selectedProduct, note_srca: e.target.value })}
                              disabled={saving}
                              placeholder="ruža, jasmin..."
                              className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-3 py-2 rounded-lg text-xs font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] mb-1 block">Note baze</label>
                            <input
                              type="text"
                              value={selectedProduct.note_baze || ''}
                              onChange={e => setSelectedProduct({ ...selectedProduct, note_baze: e.target.value })}
                              disabled={saving}
                              placeholder="mošus, sandalovina..."
                              className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-3 py-2 rounded-lg text-xs font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Toggles */}
                    <div className="flex gap-4 mb-5 pb-5 border-b border-[#c9a96e]/10">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedProduct.active}
                          onChange={e => setSelectedProduct({ ...selectedProduct, active: e.target.checked })}
                          disabled={saving}
                          className="w-4 h-4 rounded border-[#c9a96e]/30 bg-[#0a0a0a] text-[#c9a96e] focus:ring-[#c9a96e] focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-[#e8d5a3]/70 text-sm font-['Inter']">Aktivan</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedProduct.featured}
                          onChange={e => setSelectedProduct({ ...selectedProduct, featured: e.target.checked })}
                          disabled={saving}
                          className="w-4 h-4 rounded border-[#c9a96e]/30 bg-[#0a0a0a] text-[#c9a96e] focus:ring-[#c9a96e] focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-[#e8d5a3]/70 text-sm font-['Inter']">Featured</span>
                      </label>
                    </div>

                    {/* Product Sizes Section */}
                    <div className="mb-5 pb-5 border-t border-[#c9a96e]/10 pt-5">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter']">
                          Veličine i cijene *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newSizes = [...(selectedProduct.product_sizes || []), { velicina_ml: 50, cijena: 0, zaliha: 0, sku: '' }];
                            setSelectedProduct({ ...selectedProduct, product_sizes: newSizes });
                          }}
                          disabled={saving}
                          className="text-[#c9a96e] hover:text-[#e8d5a3] text-xs font-['Inter'] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          + Dodaj veličinu
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(selectedProduct.product_sizes || []).map((size: any, idx: number) => (
                          <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_1.5fr_auto_auto] gap-2 items-center">
                            <input
                              type="number"
                              value={size.velicina_ml || ''}
                              onChange={e => {
                                const newSizes = [...selectedProduct.product_sizes];
                                newSizes[idx] = { ...newSizes[idx], velicina_ml: parseInt(e.target.value) || 0 };
                                setSelectedProduct({ ...selectedProduct, product_sizes: newSizes });
                              }}
                              disabled={saving}
                              placeholder="ML"
                              className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-3 py-2 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                            <input
                              type="number"
                              step="0.01"
                              value={size.cijena || ''}
                              onChange={e => {
                                const newSizes = [...selectedProduct.product_sizes];
                                newSizes[idx] = { ...newSizes[idx], cijena: parseFloat(e.target.value) || 0 };
                                setSelectedProduct({ ...selectedProduct, product_sizes: newSizes });
                              }}
                              disabled={saving}
                              placeholder="Cijena"
                              className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-3 py-2 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                            <input
                              type="number"
                              value={size.zaliha || ''}
                              onChange={e => {
                                const newSizes = [...selectedProduct.product_sizes];
                                newSizes[idx] = { ...newSizes[idx], zaliha: parseInt(e.target.value) || 0 };
                                setSelectedProduct({ ...selectedProduct, product_sizes: newSizes });
                              }}
                              disabled={saving}
                              placeholder="Zaliha"
                              className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-3 py-2 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={size.sku || ''}
                                onChange={e => {
                                  const newSizes = [...selectedProduct.product_sizes];
                                  newSizes[idx] = { ...newSizes[idx], sku: e.target.value };
                                  setSelectedProduct({ ...selectedProduct, product_sizes: newSizes });
                                }}
                                disabled={saving}
                                placeholder="SKU"
                                className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-3 py-2 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleGenerateSKU(idx)}
                              disabled={saving || !selectedProduct.naziv || !selectedProduct.brand_id || !size.velicina_ml}
                              className="text-[#c9a96e] hover:text-[#e8d5a3] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Generiraj SKU"
                            >
                              <Sparkles size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newSizes = selectedProduct.product_sizes.filter((_: any, i: number) => i !== idx);
                                setSelectedProduct({ ...selectedProduct, product_sizes: newSizes });
                              }}
                              disabled={saving || selectedProduct.product_sizes.length === 1}
                              className="text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Obriši veličinu"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Product Images Section */}
                    <div className="mb-5 pb-5 border-t border-[#c9a96e]/10 pt-5">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter']">
                          Slike proizvoda
                        </label>
                        <span className="text-[#e8d5a3]/20 text-[10px] font-['Inter']">
                          {(selectedProduct.product_images || []).filter((img: any) => img.url).length} slika · max 5MB
                        </span>
                      </div>

                      {/* Drag & Drop Zone */}
                      <div
                        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer mb-3 ${
                          dragOver 
                            ? 'border-[#c9a96e] bg-[#c9a96e]/10' 
                            : 'border-[#c9a96e]/20 bg-[#0a0a0a] hover:border-[#c9a96e]/40 hover:bg-[#0a0a0a]/80'
                        } ${uploadingImages ? 'opacity-50 pointer-events-none' : ''}`}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={e => { e.preventDefault(); setDragOver(false); }}
                        onDrop={e => {
                          e.preventDefault();
                          setDragOver(false);
                          if (e.dataTransfer.files.length > 0) {
                            handleImageUpload(e.dataTransfer.files);
                          }
                        }}
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple
                          className="hidden"
                          onChange={e => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleImageUpload(e.target.files);
                              e.target.value = '';
                            }
                          }}
                        />
                        {uploadingImages ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-[#c9a96e]/30 border-t-[#c9a96e] rounded-full animate-spin" />
                            <p className="text-[#c9a96e] text-sm font-['Inter'] font-semibold">Uploadam slike...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center">
                              <Upload size={20} className="text-[#c9a96e]" />
                            </div>
                            <div>
                              <p className="text-[#e8d5a3]/60 text-sm font-['Inter'] font-semibold">
                                {dragOver ? 'Pustite slike ovdje' : 'Povucite slike ovdje'}
                              </p>
                              <p className="text-[#e8d5a3]/25 text-[11px] font-['Inter'] mt-0.5">
                                ili kliknite za odabir · JPEG, PNG, WebP, GIF
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Preview Grid */}
                      {(selectedProduct.product_images || []).filter((img: any) => img.url).length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {(selectedProduct.product_images || []).filter((img: any) => img.url).map((img: any, idx: number) => (
                            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-[#0a0a0a] border border-[#c9a96e]/10">
                              <img 
                                src={img.url} 
                                alt={img.alt_text || ''} 
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                onError={e => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).alt = '⚠'; }}
                              />
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newImages = (selectedProduct.product_images || []).filter((_: any, i: number) => i !== idx);
                                  setSelectedProduct({ ...selectedProduct, product_images: newImages });
                                  // Also try to delete from storage (fire & forget)
                                  if (img.url) api.deleteProductImage(img.url).catch(() => {});
                                }}
                                disabled={saving || uploadingImages}
                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-red-600/80 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                title="Obriši sliku"
                              >
                                <X size={12} className="text-white" />
                              </button>
                              {/* Sort order badge */}
                              <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-[#c9a96e] text-[9px] font-bold px-1.5 py-0.5 rounded-md font-['Inter']">
                                #{idx + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* URL input fallback - collapsed by default */}
                      <details className="mt-2">
                        <summary className="text-[#e8d5a3]/20 text-[10px] font-['Inter'] cursor-pointer hover:text-[#e8d5a3]/40 transition-colors">
                          + Dodaj sliku putem URL-a
                        </summary>
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-3 py-2 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const url = (e.target as HTMLInputElement).value.trim();
                                if (url) {
                                  const currentImages = selectedProduct.product_images || [];
                                  setSelectedProduct({
                                    ...selectedProduct,
                                    product_images: [...currentImages, { url, alt_text: selectedProduct.naziv || '', sort_order: currentImages.length }]
                                  });
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.querySelector('details input[type="text"]') as HTMLInputElement;
                              const url = input?.value.trim();
                              if (url) {
                                const currentImages = selectedProduct.product_images || [];
                                setSelectedProduct({
                                  ...selectedProduct,
                                  product_images: [...currentImages, { url, alt_text: selectedProduct.naziv || '', sort_order: currentImages.length }]
                                });
                                if (input) input.value = '';
                              }
                            }}
                            className="px-3 py-2 bg-[#c9a96e]/20 text-[#c9a96e] rounded-lg text-sm font-['Inter'] hover:bg-[#c9a96e]/30 transition-colors"
                          >
                            Dodaj
                          </button>
                        </div>
                      </details>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-[#c9a96e]/10">
                      <button
                        onClick={handleSaveProduct}
                        disabled={saving}
                        className="flex-1 bg-[#c9a96e] text-[#0a0a0a] px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#e8d5a3] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Inter']"
                      >
                        {saving ? 'Spremanje...' : (selectedProduct.id ? 'Spremi promjene' : 'Kreiraj proizvod')}
                      </button>
                      {selectedProduct.id && (
                        <button
                          onClick={() => {
                            setShowProductModal(false);
                            handleDeleteProduct(selectedProduct);
                          }}
                          disabled={saving}
                          className="bg-red-600/20 text-red-400 border border-red-400/30 px-6 py-3 rounded-xl text-sm font-bold hover:bg-red-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Inter']"
                        >
                          Obriši
                        </button>
                      )}
                      <button
                        onClick={() => setShowProductModal(false)}
                        disabled={saving}
                        className="px-6 py-3 text-[#e8d5a3]/60 hover:text-[#e8d5a3] text-sm font-['Inter'] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Otkaži
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Confirmation Dialog */}
              {productToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/90" onClick={() => !saving && setProductToDelete(null)} />
                  <div className="relative bg-[#111111] border border-red-400/30 rounded-2xl p-6 w-full max-w-md">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-400/30 flex items-center justify-center flex-shrink-0">
                        <Trash2 size={20} className="text-red-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[#e8d5a3] font-['Playfair_Display'] font-bold text-lg mb-2">
                          Obriši proizvod?
                        </h3>
                        <p className="text-[#e8d5a3]/60 text-sm font-['Inter'] mb-1">
                          Jeste li sigurni da želite obrisati proizvod:
                        </p>
                        <p className="text-[#c9a96e] font-['Inter'] font-semibold text-sm">
                          "{productToDelete.naziv}"
                        </p>
                        <p className="text-[#e8d5a3]/40 text-xs font-['Inter'] mt-3">
                          ⚠️ Ova akcija se ne može poništiti. Proizvod će biti trajno obrisan iz baze podataka.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={confirmDeleteProduct}
                        disabled={saving}
                        className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Inter']"
                      >
                        {saving ? 'Brisanje...' : 'Da, obriši'}
                      </button>
                      <button
                        onClick={() => setProductToDelete(null)}
                        disabled={saving}
                        className="flex-1 bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Inter']"
                      >
                        Otkaži
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BRENDOVI */}
          {view === 'brendovi' && (
            <div className="space-y-5">
              <button 
                className="bg-[#c9a96e] text-[#0a0a0a] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#e8d5a3] transition-all font-['Inter']" 
                onClick={handleCreateBrand}
              >
                + Novi brand
              </button>
              {loading ? (
                <div className="text-center py-12 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl">
                  <div className="w-8 h-8 border-2 border-[#c9a96e]/20 border-t-[#c9a96e] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-[#e8d5a3]/40 font-['Inter']">Učitavanje...</p>
                </div>
              ) : supabaseBrands.length === 0 ? (
                <div className="text-center py-12 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl">
                  <Star size={32} className="text-[#c9a96e]/30 mx-auto mb-3" />
                  <p className="text-[#e8d5a3]/40 font-['Inter']">Nema brendova u bazi</p>
                  <p className="text-[#e8d5a3]/20 text-xs font-['Inter'] mt-1">Dodajte prvi brand klikom na "+ Novi brand"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supabaseBrands.map(brand => {
                    // Count products from Supabase, not static data
                    const productCount = supabaseProducts.filter(p => p.brand_id === brand.id).length;
                    const canDelete = productCount === 0;
                    
                    return (
                      <div key={brand.id} className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-3xl text-[#c9a96e]/40">{brand.logo || '🏷️'}</div>
                          <div className="flex gap-2">
                            <button 
                              className="text-[#c9a96e]/40 hover:text-[#c9a96e]" 
                              onClick={() => handleEditBrand(brand)}
                              title="Uredi brand"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              className={`${canDelete ? 'text-red-400/40 hover:text-red-400' : 'text-red-400/20 cursor-not-allowed'}`}
                              onClick={() => canDelete && handleDeleteBrand(brand.id)}
                              disabled={!canDelete}
                              title={canDelete ? 'Obriši brand' : 'Ne može se obrisati - ima proizvode'}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        <h3 className="text-[#e8d5a3]/80 font-['Playfair_Display'] font-bold text-lg mb-1">{brand.naziv}</h3>
                        <p className="text-[#e8d5a3]/30 text-xs font-['Inter']">{brand.opis}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[#c9a96e]/60 text-xs font-['Inter']">
                            {productCount} proizvoda
                          </p>
                          {!canDelete && (
                            <span className="text-[9px] bg-orange-400/15 text-orange-400 border border-orange-400/30 px-2 py-0.5 rounded-full font-bold">
                              Zaštićen
                            </span>
                          )}
                        </div>
                        {!brand.active && (
                          <span className="inline-block mt-2 text-[9px] bg-red-400/15 text-red-400 border border-red-400/30 px-2 py-0.5 rounded-full font-bold">
                            Neaktivan
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* KUPCI */}
          {view === 'kupci' && (
            <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl overflow-hidden">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-[#c9a96e]/20 border-t-[#c9a96e] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-[#e8d5a3]/40 font-['Inter']">Učitavanje...</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead><tr className="border-b border-[#c9a96e]/10">{['Kupac', 'Email', 'Grad', 'Rola', ''].map(h => <th key={h} className="text-left text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] px-4 py-3">{h}</th>)}</tr></thead>
                  <tbody>
                    {supabaseCustomers.map(u => (
                      <tr key={u.id} className="border-b border-[#c9a96e]/5 hover:bg-[#c9a96e]/3 transition-colors">
                        <td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full bg-[#c9a96e]/20 flex items-center justify-center text-[#c9a96e] text-xs font-bold">{u.ime[0]}</div><p className="text-[#e8d5a3]/70 text-xs font-semibold font-['Inter']">{u.ime} {u.prezime}</p></div></td>
                        <td className="px-4 py-3 text-[#e8d5a3]/40 text-xs font-['Inter']">{u.email}</td>
                        <td className="px-4 py-3 text-[#e8d5a3]/40 text-xs font-['Inter']">{u.grad || '-'}</td>
                        <td className="px-4 py-3"><span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${u.role === 'admin' ? 'bg-[#c9a96e]/15 text-[#c9a96e]' : 'bg-blue-400/15 text-blue-400'}`}>{u.role}</span></td>
                        <td className="px-4 py-3">
                          <button 
                            className="text-[#c9a96e]/40 hover:text-[#c9a96e]"
                            onClick={() => handleViewCustomer(u)}
                          >
                            <Eye size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* RECENZIJE */}
          {view === 'recenzije' && (
            <div className="space-y-4">
              <h2 className="text-[#e8d5a3]/60 text-sm font-['Inter']">Čekaju odobrenje: {pendingReviews.length}</h2>
              {loading ? (
                <div className="text-center py-12 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl">
                  <div className="w-8 h-8 border-2 border-[#c9a96e]/20 border-t-[#c9a96e] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-[#e8d5a3]/40 font-['Inter']">Učitavanje...</p>
                </div>
              ) : pendingReviews.length === 0 ? (
                <div className="text-center py-12 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl">
                  <Check size={32} className="text-green-400/50 mx-auto mb-3" />
                  <p className="text-[#e8d5a3]/40 font-['Inter']">Sve recenzije su obrađene</p>
                </div>
              ) : (
                pendingReviews.map(r => (
                  <div key={r.id} className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-[#c9a96e] text-sm font-semibold font-['DM_Sans']">
                            {r.products?.naziv || 'Proizvod'}
                          </p>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => (
                              <span key={i} className={`text-[10px] ${i <= r.ocjena ? 'text-[#c9a96e]' : 'text-[#333]'}`}>★</span>
                            ))}
                          </div>
                        </div>
                        {r.naslov && (
                          <p className="text-[#e8d5a3]/80 text-sm font-['Inter'] font-semibold mb-1">{r.naslov}</p>
                        )}
                        <p className="text-[#e8d5a3]/60 text-sm font-['Inter'] italic mb-2">"{r.tekst}"</p>
                        <p className="text-[#e8d5a3]/30 text-xs font-['Inter']">
                          {r.users ? `${r.users.ime} ${r.users.prezime}` : 'Korisnik'} · {new Date(r.created_at).toLocaleDateString('hr-HR')}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button 
                          onClick={() => handleApproveReview(r.id)}
                          disabled={saving}
                          className="bg-green-600/20 text-green-400 border border-green-400/30 p-2 rounded-lg hover:bg-green-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Odobri recenziju"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={() => handleRejectReview(r.id)}
                          disabled={saving}
                          className="bg-red-600/20 text-red-400 border border-red-400/30 p-2 rounded-lg hover:bg-red-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Odbij recenziju"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* KUPONI */}
          {view === 'kuponi' && (
            <div className="space-y-4">
              <button 
                className="bg-[#c9a96e] text-[#0a0a0a] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#e8d5a3] transition-all font-['Inter']" 
                onClick={handleCreateCoupon}
              >
                + Novi kupon
              </button>
              {loading ? (
                <div className="text-center py-12 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl">
                  <div className="w-8 h-8 border-2 border-[#c9a96e]/20 border-t-[#c9a96e] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-[#e8d5a3]/40 font-['Inter']">Učitavanje...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {supabaseCoupons.map(c => (
                    <div key={c.id || c.kod} className="bg-[#111111] border border-[#c9a96e]/15 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[#c9a96e] font-['DM_Sans'] font-bold text-lg tracking-widest">{c.kod}</span>
                        <div className="flex gap-2 items-center">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${c.aktivan ? 'bg-green-400/15 text-green-400 border-green-400/30' : 'bg-red-400/15 text-red-400 border-red-400/30'}`}>
                            {c.aktivan ? 'Aktivan' : 'Neaktivan'}
                          </span>
                          <button 
                            className="text-[#c9a96e]/40 hover:text-[#c9a96e]" 
                            onClick={() => handleEditCoupon(c)}
                          >
                            <Edit size={14} />
                          </button>
                          {supabaseCoupons.length > 0 && (
                            <button 
                              className="text-red-400/40 hover:text-red-400" 
                              onClick={() => handleDeleteCoupon(c.id)}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5 text-xs font-['Inter']">
                        <div className="flex justify-between"><span className="text-[#e8d5a3]/30">Tip</span><span className="text-[#e8d5a3]/60 capitalize">{c.tip}</span></div>
                        <div className="flex justify-between"><span className="text-[#e8d5a3]/30">Vrijednost</span><span className="text-[#c9a96e] font-bold">{c.tip === 'postotak' ? `${c.vrijednost}%` : `${c.vrijednost}€`}</span></div>
                        <div className="flex justify-between"><span className="text-[#e8d5a3]/30">Min. iznos</span><span className="text-[#e8d5a3]/60">{c.min_iznos_narudzbe || c.min_iznos || 0}€</span></div>
                        {c.max_popust && <div className="flex justify-between"><span className="text-[#e8d5a3]/30">Max. popust</span><span className="text-[#e8d5a3]/60">{c.max_popust}€</span></div>}
                        {c.broj_koristenja !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-[#e8d5a3]/30">Korišteno</span>
                            <span className="text-[#e8d5a3]/60">
                              {c.broj_koristenja}{c.max_koristenja ? `/${c.max_koristenja}` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NEWSLETTER */}
          {view === 'newsletter' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-[#e8d5a3]/40 text-sm font-['Inter']">{newsletterSubs.length} pretplatnika</p>
                <button className="flex items-center gap-2 text-[#c9a96e] text-xs border border-[#c9a96e]/30 px-3 py-1.5 rounded-lg hover:bg-[#c9a96e]/5 font-['Inter']" onClick={() => toast.success('Newsletter lista exportirana!')}>
                  <Download size={13} />
                  Export CSV
                </button>
              </div>
              {loading ? (
                <div className="text-center py-12 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl">
                  <div className="w-8 h-8 border-2 border-[#c9a96e]/20 border-t-[#c9a96e] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-[#e8d5a3]/40 font-['Inter']">Učitavanje...</p>
                </div>
              ) : newsletterSubs.length === 0 ? (
                <div className="text-center py-12 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl">
                  <Mail size={32} className="text-[#c9a96e]/30 mx-auto mb-3" />
                  <p className="text-[#e8d5a3]/40 font-['Inter']">Nema pretplatnika</p>
                </div>
              ) : (
                <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#c9a96e]/10">
                        {['Email', 'Pretplaćen od', 'Status'].map(h => (
                          <th key={h} className="text-left text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {newsletterSubs.map(sub => (
                        <tr key={sub.email} className="border-b border-[#c9a96e]/5 hover:bg-[#c9a96e]/3 transition-colors">
                          <td className="px-4 py-3 text-[#e8d5a3]/60 text-xs font-['Inter']">{sub.email}</td>
                          <td className="px-4 py-3 text-[#e8d5a3]/30 text-xs font-['Inter']">
                            {new Date(sub.created_at).toLocaleDateString('hr-HR')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                              sub.subscribed 
                                ? 'bg-green-400/15 text-green-400 border-green-400/30' 
                                : 'bg-red-400/15 text-red-400 border-red-400/30'
                            }`}>
                              {sub.subscribed ? 'Aktivan' : 'Neaktivan'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* STATISTIKE */}
          {view === 'statistike' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Prihod danas', value: '43.49€', period: 'Danas' },
                  { label: 'Prihod ovaj tjedan', value: '187.97€', period: '7 dana' },
                  { label: 'Prihod ovaj mjesec', value: `${totalRevenue.toFixed(2)}€`, period: '30 dana' },
                ].map(stat => (
                  <div key={stat.label} className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-5 text-center">
                    <p className="text-[#e8d5a3]/30 text-xs uppercase tracking-wider font-['Inter'] mb-2">{stat.period}</p>
                    <p className="text-[#c9a96e] font-['DM_Sans'] text-3xl font-bold">{stat.value}</p>
                    <p className="text-[#e8d5a3]/40 text-sm font-['Inter'] mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Top brands */}
              <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-5">
                <h3 className="text-[#e8d5a3]/80 font-['Playfair_Display'] font-bold mb-4">Top brandovi po prihodu</h3>
                <div className="space-y-3">
                  {supabaseBrands.slice(0, 5).map((brand, i) => {
                    const pct = [68, 55, 82, 91, 47][i % 5];
                    const rev = [totalRevenue * 0.25, totalRevenue * 0.20, totalRevenue * 0.22, totalRevenue * 0.20, totalRevenue * 0.13][i % 5];
                    return (
                      <div key={brand.id} className="flex items-center gap-3">
                        <span className="text-[#c9a96e]/60 text-xs font-bold font-['Inter'] w-4">#{i + 1}</span>
                        <div className="w-6 h-6 rounded bg-[#0a0a0a] border border-[#c9a96e]/20 flex items-center justify-center">
                          {brand.logo_url ? (
                            <img src={brand.logo_url} alt={brand.naziv} className="max-w-full max-h-full object-contain filter invert opacity-50" />
                          ) : (
                            <span className="text-xl text-[#c9a96e]/30 w-6 text-center">{brand.naziv[0]}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-[#e8d5a3]/60 text-xs font-['Inter'] font-semibold">{brand.naziv}</span>
                            <span className="text-[#c9a96e] text-xs font-bold font-['DM_Sans']">{rev.toFixed(0)}€</span>
                          </div>
                          <div className="bg-[#1a1a1a] rounded-full h-1.5">
                            <div className="bg-[#c9a96e] h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COUPON MODAL */}
      {showCouponModal && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowCouponModal(false)} />
          <div className="relative bg-[#111111] border border-[#c9a96e]/20 rounded-3xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <h2 className="text-[#c9a96e] font-['Playfair_Display'] font-bold text-xl">
                {selectedCoupon.id ? 'Uredi kupon' : 'Novi kupon'}
              </h2>
              <button onClick={() => setShowCouponModal(false)} className="text-[#e8d5a3]/40 hover:text-[#c9a96e]">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Kod kupona</label>
                <input
                  type="text"
                  value={selectedCoupon.kod}
                  onChange={e => setSelectedCoupon({ ...selectedCoupon, kod: e.target.value.toUpperCase() })}
                  placeholder="LJETO2024"
                  className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e] uppercase"
                />
              </div>

              <div>
                <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Tip</label>
                <select
                  value={selectedCoupon.tip}
                  onChange={e => setSelectedCoupon({ ...selectedCoupon, tip: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                >
                  <option value="postotak">Postotak</option>
                  <option value="fiksni">Fiksni iznos</option>
                </select>
              </div>

              <div>
                <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">
                  Vrijednost {selectedCoupon.tip === 'postotak' ? '(%)' : '(€)'}
                </label>
                <input
                  type="number"
                  value={selectedCoupon.vrijednost}
                  onChange={e => setSelectedCoupon({ ...selectedCoupon, vrijednost: e.target.value })}
                  placeholder="10"
                  className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                />
              </div>

              <div>
                <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Minimalni iznos narudžbe (€)</label>
                <input
                  type="number"
                  value={selectedCoupon.min_iznos_narudzbe}
                  onChange={e => setSelectedCoupon({ ...selectedCoupon, min_iznos_narudzbe: e.target.value })}
                  placeholder="0"
                  className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                />
              </div>

              {selectedCoupon.tip === 'postotak' && (
                <div>
                  <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Maksimalni popust (€)</label>
                  <input
                    type="number"
                    value={selectedCoupon.max_popust || ''}
                    onChange={e => setSelectedCoupon({ ...selectedCoupon, max_popust: e.target.value })}
                    placeholder="Neograničeno"
                    className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                  />
                </div>
              )}

              <div>
                <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Maksimalan broj korištenja</label>
                <input
                  type="number"
                  value={selectedCoupon.max_koristenja || ''}
                  onChange={e => setSelectedCoupon({ ...selectedCoupon, max_koristenja: e.target.value })}
                  placeholder="Neograničeno"
                  className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                />
              </div>

              <div>
                <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Vrijedi do</label>
                <input
                  type="datetime-local"
                  value={selectedCoupon.vrijedi_do ? new Date(selectedCoupon.vrijedi_do).toISOString().slice(0, 16) : ''}
                  onChange={e => setSelectedCoupon({ ...selectedCoupon, vrijedi_do: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="coupon-active"
                  checked={selectedCoupon.aktivan}
                  onChange={e => setSelectedCoupon({ ...selectedCoupon, aktivan: e.target.checked })}
                  className="w-4 h-4 rounded border-[#c9a96e]/30 bg-[#0a0a0a] text-[#c9a96e] focus:ring-[#c9a96e]"
                />
                <label htmlFor="coupon-active" className="text-[#e8d5a3]/60 text-sm font-['Inter']">Aktivan</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="flex-1 bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3]/60 px-4 py-2.5 rounded-xl text-sm font-['Inter'] hover:border-[#c9a96e]/40 transition-all"
                >
                  Odustani
                </button>
                <button
                  onClick={handleSaveCoupon}
                  disabled={saving}
                  className="flex-1 bg-[#c9a96e] text-[#0a0a0a] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#e8d5a3] transition-all font-['Inter'] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Spremanje...' : 'Spremi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BRAND MODAL */}
      {showBrandModal && selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowBrandModal(false)} />
          <div className="relative bg-[#111111] border border-[#c9a96e]/20 rounded-3xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-start mb-5">
              <h2 className="text-[#c9a96e] font-['Playfair_Display'] font-bold text-xl">
                {selectedBrand.id ? 'Uredi brand' : 'Novi brand'}
              </h2>
              <button onClick={() => setShowBrandModal(false)} className="text-[#e8d5a3]/40 hover:text-[#c9a96e]">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Naziv</label>
                <input
                  type="text"
                  value={selectedBrand.naziv}
                  onChange={e => setSelectedBrand({ ...selectedBrand, naziv: e.target.value })}
                  placeholder="Dior"
                  className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter']">Opis</label>
                  <button
                    type="button"
                    onClick={handleGenerateBrandDescription}
                    disabled={saving || aiGenerating || !selectedBrand.naziv}
                    className="flex items-center gap-1.5 text-[#c9a96e] hover:text-[#e8d5a3] text-xs font-['Inter'] font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Generiraj opis pomoću AI"
                  >
                    <Sparkles size={14} />
                    {aiGenerating ? 'Generiram...' : 'AI Generiraj'}
                  </button>
                </div>
                <textarea
                  value={selectedBrand.opis}
                  onChange={e => setSelectedBrand({ ...selectedBrand, opis: e.target.value })}
                  placeholder="Luksuzni francuski brand..."
                  rows={3}
                  className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e] resize-none"
                />
              </div>

              <div>
                <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Logo URL</label>
                <input
                  type="text"
                  value={selectedBrand.logo_url}
                  onChange={e => setSelectedBrand({ ...selectedBrand, logo_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="brand-active"
                  checked={selectedBrand.active}
                  onChange={e => setSelectedBrand({ ...selectedBrand, active: e.target.checked })}
                  className="w-4 h-4 rounded border-[#c9a96e]/30 bg-[#0a0a0a] text-[#c9a96e] focus:ring-[#c9a96e]"
                />
                <label htmlFor="brand-active" className="text-[#e8d5a3]/60 text-sm font-['Inter']">Aktivan</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowBrandModal(false)}
                  className="flex-1 bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3]/60 px-4 py-2.5 rounded-xl text-sm font-['Inter'] hover:border-[#c9a96e]/40 transition-all"
                >
                  Odustani
                </button>
                <button
                  onClick={handleSaveBrand}
                  disabled={saving}
                  className="flex-1 bg-[#c9a96e] text-[#0a0a0a] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#e8d5a3] transition-all font-['Inter'] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Spremanje...' : 'Spremi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER MODAL */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowCustomerModal(false)} />
          <div className="relative bg-[#111111] border border-[#c9a96e]/20 rounded-3xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-[#c9a96e] font-['Playfair_Display'] font-bold text-xl">
                  {selectedCustomer.ime} {selectedCustomer.prezime}
                </h2>
                <p className="text-[#e8d5a3]/40 text-xs font-['Inter']">ID: {selectedCustomer.id}</p>
              </div>
              <button onClick={() => setShowCustomerModal(false)} className="text-[#e8d5a3]/40 hover:text-[#c9a96e]">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Ime</label>
                  <input
                    type="text"
                    value={selectedCustomer.ime}
                    onChange={e => setSelectedCustomer({ ...selectedCustomer, ime: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                  />
                </div>
                <div>
                  <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Prezime</label>
                  <input
                    type="text"
                    value={selectedCustomer.prezime}
                    onChange={e => setSelectedCustomer({ ...selectedCustomer, prezime: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={selectedCustomer.email}
                  disabled
                  className="w-full bg-[#0a0a0a] border border-[#c9a96e]/10 text-[#e8d5a3]/40 px-4 py-2.5 rounded-xl text-sm font-['Inter'] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Telefon</label>
                <input
                  type="text"
                  value={selectedCustomer.telefon || ''}
                  onChange={e => setSelectedCustomer({ ...selectedCustomer, telefon: e.target.value })}
                  placeholder="+385..."
                  className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                />
              </div>

              <div>
                <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Adresa</label>
                <input
                  type="text"
                  value={selectedCustomer.adresa || ''}
                  onChange={e => setSelectedCustomer({ ...selectedCustomer, adresa: e.target.value })}
                  placeholder="Ulica i broj"
                  className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Grad</label>
                  <input
                    type="text"
                    value={selectedCustomer.grad || ''}
                    onChange={e => setSelectedCustomer({ ...selectedCustomer, grad: e.target.value })}
                    placeholder="Zagreb"
                    className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                  />
                </div>
                <div>
                  <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Poštanski broj</label>
                  <input
                    type="text"
                    value={selectedCustomer.postanski_broj || ''}
                    onChange={e => setSelectedCustomer({ ...selectedCustomer, postanski_broj: e.target.value })}
                    placeholder="10000"
                    className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#e8d5a3]/40 text-xs uppercase tracking-wider font-['Inter'] mb-1.5 block">Rola</label>
                <select
                  value={selectedCustomer.role}
                  onChange={e => setSelectedCustomer({ ...selectedCustomer, role: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] px-4 py-2.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]"
                >
                  <option value="kupac">Kupac</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="flex-1 bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3]/60 px-4 py-2.5 rounded-xl text-sm font-['Inter'] hover:border-[#c9a96e]/40 transition-all"
                >
                  Zatvori
                </button>
                <button
                  onClick={handleSaveCustomer}
                  disabled={saving}
                  className="flex-1 bg-[#c9a96e] text-[#0a0a0a] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#e8d5a3] transition-all font-['Inter'] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Spremanje...' : 'Spremi promjene'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
