import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  product_id: number;
  product_size_id: number;
  naziv: string;
  brand: string;
  ml: number;
  cijena: number;
  kolicina: number;
  image: string;
  slug: string;
  max_zaliha: number;
  // Bundle support — set when item is part of a bundle
  bundle_id?: number;
  bundle_naziv?: string;
  bundle_cijena?: number; // total bundle price (set only on first item)
  bundle_item_index?: 1 | 2 | 3; // which slot in the bundle
}

export interface AppliedCoupon {
  id?: number;
  kod: string;
  tip: 'postotak' | 'fiksni';
  vrijednost: number;
  popust_iznos: number;
  count_on_paid?: boolean;
  min_velicina_ml?: number | null;
}

const CART_KEY = 'dekanti_cart';
const WISHLIST_KEY = 'dekanti_wishlist';
const USER_KEY = 'dekanti_user';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_size_id === item.product_size_id);
      if (existing) {
        return prev.map(i =>
          i.product_size_id === item.product_size_id
            ? { ...i, kolicina: Math.min(i.kolicina + item.kolicina, i.max_zaliha) }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((product_size_id: number) => {
    setItems(prev => prev.filter(i => i.product_size_id !== product_size_id));
  }, []);

  const updateQuantity = useCallback((product_size_id: number, kolicina: number) => {
    if (kolicina <= 0) {
      removeItem(product_size_id);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.product_size_id === product_size_id
          ? { ...i, kolicina: Math.min(kolicina, i.max_zaliha) }
          : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
    localStorage.removeItem(CART_KEY);
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.cijena * i.kolicina, 0);
  const dostava = subtotal >= 50 ? 0 : subtotal > 0 ? 2.99 : 0;

  // Recalculate discount live against current subtotal so it stays correct when cart changes
  const popust = coupon
    ? coupon.tip === 'postotak'
      ? Math.min(parseFloat((subtotal * coupon.vrijednost / 100).toFixed(2)), subtotal)
      : Math.min(coupon.vrijednost, subtotal)
    : 0;

  const ukupno = Math.max(0, subtotal - popust + dostava);
  const itemCount = items.reduce((sum, i) => sum + i.kolicina, 0);

  return {
    items,
    coupon,
    setCoupon,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    dostava,
    popust,
    ukupno,
    itemCount,
  };
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const toggle = useCallback((product_id: number) => {
    setWishlist(prev =>
      prev.includes(product_id)
        ? prev.filter(id => id !== product_id)
        : [...prev, product_id]
    );
  }, []);

  const isInWishlist = useCallback((product_id: number) => wishlist.includes(product_id), [wishlist]);

  return { wishlist, toggle, isInWishlist };
}

export interface User {
  id: number;
  ime: string;
  prezime: string;
  email: string;
  role: 'admin' | 'kupac';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  return { user, login, logout };
}

export interface Order {
  order_number: string;
  status: 'cekanje_uplate' | 'nova' | 'u_obradi' | 'poslano' | 'isporuceno' | 'otkazano' | 'povrat';
  ime: string;
  prezime: string;
  email: string;
  telefon: string;
  adresa: string;
  grad: string;
  postanski_broj: string;
  napomena?: string;
  nacin_placanja: 'pouzecem' | 'bankovna' | 'kartica' | 'revolut';
  cijena_dostave: number;
  subtotal: number;
  popust_iznos: number;
  ukupno: number;
  kupon?: string;
  items: CartItem[];
  created_at: string;
  tracking_broj?: string;
  placeno?: boolean;
  datum_placanja?: string;
  payment_reference?: string;
}

export function useOrders() {
  const ORDERS_KEY = 'dekanti_orders';
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => {
      const updated = [order, ...prev];
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { orders, addOrder };
}
