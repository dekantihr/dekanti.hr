import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Menu, X, Search, ChevronDown, Sparkles, Truck, CreditCard, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface NavbarProps {
  itemCount: number;
  wishlistCount: number;
  user: { ime: string; prezime: string; role: string } | null;
  onLogout: () => void;
  pendingCouponsCount?: number;
}

export default function Navbar({ itemCount, wishlistCount, user, onLogout, pendingCouponsCount = 0 }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdown, setUserDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserDropdown(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    
    // Validate input
    if (!query) {
      toast.error('Unesite pojam za pretragu');
      return;
    }
    
    if (query.length > 100) {
      toast.error('Pretraga je ograničena na 100 znakova');
      return;
    }
    
    // Sanitize special characters that could cause issues
    const sanitized = query.replace(/[<>]/g, '');
    
    navigate(`/parfemi?search=${encodeURIComponent(sanitized)}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const navClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
    scrolled || !isHome
      ? 'bg-[#0a0a0a]/98 backdrop-blur-md border-b border-[#c9a96e]/20 shadow-2xl'
      : 'bg-transparent'
  }`;

  return (
    <nav className={navClasses}>
      {/* Top Bar */}
      <div className="border-b border-[#c9a96e]/10 py-1.5 text-center hidden md:block bg-[#0a0a0a]/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4 text-[10px] tracking-[0.3em] text-[#c9a96e]/70 uppercase font-light font-['DM_Sans']">
          <span className="flex items-center gap-1.5 hover:text-[#c9a96e] transition-colors">
            <Sparkles size={10} className="animate-pulse" />
            Besplatna dostava iznad 50€
          </span>
          <span className="text-[#c9a96e]/30">•</span>
          <span className="flex items-center gap-1.5 hover:text-[#c9a96e] transition-colors">
            <Truck size={10} />
            BoxNow 1-2 dana
          </span>
          <span className="text-[#c9a96e]/30">•</span>
          <span className="flex items-center gap-1.5 hover:text-[#c9a96e] transition-colors">
            <CreditCard size={10} />
            Sigurno kartično plaćanje
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group logo-link">
            <img
              src="/logos/logo_white.png"
              alt="dekantihr.com"
              className="h-10 md:h-12 w-auto object-contain group-hover:opacity-90 transition-opacity duration-300"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/parfemi" className="nav-link text-xs tracking-[0.1em] text-[#e8d5a3]/80 hover:text-[#c9a96e] uppercase transition-all duration-300 font-medium font-['Inter']">
              Kolekcija
            </Link>
            <Link to="/parfemi?featured=true" className="nav-link text-xs tracking-[0.1em] text-[#e8d5a3]/80 hover:text-[#c9a96e] uppercase transition-all duration-300 font-medium font-['Inter']">
              Featured
            </Link>
            <Link to="/parfemi?sort=bestseller" className="nav-link text-xs tracking-[0.1em] text-[#e8d5a3]/80 hover:text-[#c9a96e] uppercase transition-all duration-300 font-medium font-['Inter']">
              Bestselleri
            </Link>
            <Link to="/o-nama" className="nav-link text-xs tracking-[0.1em] text-[#e8d5a3]/80 hover:text-[#c9a96e] uppercase transition-all duration-300 font-medium font-['Inter']">
              O nama
            </Link>
            <Link to="/pracenje" className="nav-link text-sm tracking-[0.15em] text-[#e8d5a3]/80 hover:text-[#c9a96e] uppercase transition-all duration-300 font-light font-['DM_Sans']">
              Praćenje
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Search */}
            <button onClick={() => setSearchOpen(!searchOpen)} className="nav-icon text-[#e8d5a3]/70 hover:text-[#c9a96e] transition-all duration-300">
              <Search size={18} />
            </button>

            {/* Wishlist */}
            <Link to="/profil?tab=wishlist" className="relative nav-icon text-[#e8d5a3]/70 hover:text-[#c9a96e] transition-all duration-300">
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-[#c9a96e] to-[#e8d5a3] text-[#0a0a0a] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(201,169,110,0.5)] animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/kosarica" className="relative nav-icon nav-icon-cart text-[#e8d5a3]/70 hover:text-[#c9a96e] transition-all duration-300">
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-[#c9a96e] to-[#e8d5a3] text-[#0a0a0a] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(201,169,110,0.5)] animate-pulse">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="user-dropdown-btn flex items-center gap-2 text-[#e8d5a3]/70 hover:text-[#c9a96e] transition-colors"
                >
                  <div className="relative">
                    <User size={18} />
                    {pendingCouponsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#c9a96e] rounded-full border border-[#0a0a0a] animate-pulse" />
                    )}
                  </div>
                  <span className="text-xs tracking-wider">{user.ime}</span>
                  <ChevronDown size={12} className={`transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
                </button>
                {userDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass border border-[#c9a96e]/20 rounded-lg shadow-2xl py-2 animate-slideInDown">
                    <Link to="/profil" className="dropdown-item block px-4 py-2.5 text-sm text-[#e8d5a3]/80 hover:text-[#c9a96e] hover:bg-[#c9a96e]/5 transition-colors">
                      Moj profil
                    </Link>
                    <Link to="/profil?tab=narudzbe" className="dropdown-item block px-4 py-2.5 text-sm text-[#e8d5a3]/80 hover:text-[#c9a96e] hover:bg-[#c9a96e]/5 transition-colors">
                      Moje narudžbe
                    </Link>
                    <Link to="/profil?tab=wishlist" className="dropdown-item block px-4 py-2.5 text-sm text-[#e8d5a3]/80 hover:text-[#c9a96e] hover:bg-[#c9a96e]/5 transition-colors">
                      Wishlist
                    </Link>
                    <Link to="/profil?tab=kuponi" className="dropdown-item flex items-center justify-between px-4 py-2.5 text-sm text-[#e8d5a3]/80 hover:text-[#c9a96e] hover:bg-[#c9a96e]/5 transition-colors">
                      <span>Moji kuponi</span>
                      {pendingCouponsCount > 0 && (
                        <span className="bg-[#c9a96e] text-[#0a0a0a] text-[9px] font-bold px-1.5 py-0.5 rounded-full">{pendingCouponsCount}</span>
                      )}
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item flex items-center gap-2 px-4 py-2.5 text-sm text-[#c9a96e] hover:bg-[#c9a96e]/5 transition-colors border-t border-[#c9a96e]/20 mt-1 pt-3">
                        <Shield size={14} />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={onLogout}
                      className="dropdown-item w-full text-left px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-400/5 transition-colors border-t border-[#c9a96e]/10 mt-1"
                    >
                      Odjava
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/prijava" className="hidden md:flex items-center gap-2 user-dropdown-btn text-[#e8d5a3]/70 hover:text-[#c9a96e] transition-colors">
                <User size={18} />
                <span className="text-xs tracking-wider">Prijava</span>
              </Link>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-[#e8d5a3]/70 hover:text-[#c9a96e] transition-colors p-1"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div className="border-t border-[#c9a96e]/10 glass px-4 py-4 animate-slideInDown">
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pretraži parfeme, brandove, note..."
              className="flex-1 glass border border-[#c9a96e]/30 text-[#e8d5a3] placeholder-[#e8d5a3]/30 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#c9a96e]/60 font-['DM_Sans'] transition-all duration-300"
              autoFocus
            />
            <button type="submit" className="bg-[#c9a96e] text-[#0a0a0a] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#e8d5a3] hover-lift btn-ripple font-['Inter']"
              style={{ 
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 0 0 rgba(201,169,110,0)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(201,169,110,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 rgba(201,169,110,0)';
              }}
            >
              Traži
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a0a0a]/98 backdrop-blur-md border-t border-[#c9a96e]/20">
          <div className="px-4 py-6 space-y-1">
            {[
              { to: '/parfemi', label: 'Kolekcija' },
              { to: '/parfemi?featured=true', label: 'Featured' },
              { to: '/parfemi?sort=bestseller', label: 'Bestselleri' },
              { to: '/pracenje', label: 'Praćenje narudžbe' },
              { to: '/o-nama', label: 'O nama' },
            ].map(link => (
              <Link key={link.to} to={link.to} className="block py-3 px-2 text-[#e8d5a3]/80 hover:text-[#c9a96e] text-sm tracking-[0.15em] uppercase border-b border-[#c9a96e]/5">
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/profil" className="block py-3 px-2 text-[#e8d5a3]/80 hover:text-[#c9a96e] text-sm tracking-[0.15em] uppercase">
                  Moj profil — {user.ime}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-2 py-3 px-2 text-[#c9a96e] text-sm tracking-[0.15em] uppercase">
                    <Shield size={16} />
                    Admin Panel
                  </Link>
                )}
                <button onClick={onLogout} className="block py-3 px-2 text-red-400 text-sm tracking-[0.15em] uppercase">
                  Odjava
                </button>
              </>
            ) : (
              <Link to="/prijava" className="block py-3 px-2 text-[#e8d5a3]/80 hover:text-[#c9a96e] text-sm tracking-[0.15em] uppercase">
                Prijava / Registracija
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
