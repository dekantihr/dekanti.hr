import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, RotateCcw, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';
import { api } from '../services/api';

interface HomePageProps {
  wishlist: number[];
  onWishlistToggle: (id: number) => void;
  onAddToCart: (product: any, sizeId: number) => void;
}

export default function HomePage({ wishlist, onWishlistToggle, onAddToCart }: HomePageProps) {
  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isHeroAutoPlaying] = useState(true);
  const heroAutoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Slide direction for animations
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  // Data from database
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        const featuredData = await api.getFeaturedProducts(8);
        if (!cancelled) setFeatured(featuredData || []);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const heroSlides = [
    { title: 'Luksuz u svakoj kapi', subtitle: 'Premium decant parfemi svjetskih brandova', cta: 'Otkrij kolekciju', link: '/parfemi', accent: 'Dior · Chanel · Tom Ford · Creed' },
    { title: 'Bestselleri sezone', subtitle: 'Najpopularniji mirisi naših kupaca', cta: 'Vidi bestsellere', link: '/parfemi?sort=bestseller', accent: 'Aventus · Sauvage · Black Orchid' },
    { title: 'Novo u kolekciji', subtitle: 'Svježe dodani luksuzni mirisi', cta: 'Istraži novo', link: '/parfemi?sort=novo', accent: 'Maison Margiela · Creed · Tom Ford' },
  ];

  // Hero carousel auto-play (4 seconds)
  useEffect(() => {
    if (!isHeroAutoPlaying || isTransitioning) return;
    
    if (heroAutoPlayTimerRef.current) clearTimeout(heroAutoPlayTimerRef.current);
    
    heroAutoPlayTimerRef.current = setTimeout(() => {
      setSlideDirection('right');
      setPrevSlide(currentSlide);
      setIsTransitioning(true);
      setCurrentSlide(i => (i + 1) % heroSlides.length);
      
      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
        setPrevSlide(null);
      }, 800);
    }, 4000);
    
    return () => {
      if (heroAutoPlayTimerRef.current) clearTimeout(heroAutoPlayTimerRef.current);
    };
  }, [currentSlide, isHeroAutoPlaying, isTransitioning, heroSlides.length]);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      const result = await api.subscribeNewsletter(newsletterEmail);
      if (result.success) {
        toast.success('Hvala! Pretplatili ste se na newsletter.', {
          style: { background: '#111111', color: '#e8d5a3', border: '1px solid rgba(201,169,110,0.25)', borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '13px' },
          iconTheme: { primary: '#c9a96e', secondary: '#0a0a0a' },
        });
        setNewsletterEmail('');
      } else {
        toast.error(result.error || 'Greška pri prijavi na newsletter');
      }
    } catch {
      toast.error('Greška pri prijavi na newsletter');
    }
  };

  // Hero navigation handlers
  const handleHeroPrev = () => {
    if (isTransitioning) return;
    setSlideDirection('left');
    setPrevSlide(currentSlide);
    setIsTransitioning(true);
    setCurrentSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
    setTimeout(() => { setIsTransitioning(false); setPrevSlide(null); }, 800);
  };

  const handleHeroNext = () => {
    if (isTransitioning) return;
    setSlideDirection('right');
    setPrevSlide(currentSlide);
    setIsTransitioning(true);
    setCurrentSlide((currentSlide + 1) % heroSlides.length);
    setTimeout(() => { setIsTransitioning(false); setPrevSlide(null); }, 800);
  };

  const handleHeroSlideClick = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setSlideDirection(index > currentSlide ? 'right' : 'left');
    setPrevSlide(currentSlide);
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => { setIsTransitioning(false); setPrevSlide(null); }, 800);
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* HERO */}
      <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a]" />
          {/* Decorative elements */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#c9a96e]/3 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#c9a96e]/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#c9a96e]/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#c9a96e]/3 rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl relative min-h-[400px]">
            {/* Previous slide content (exiting) */}
            {prevSlide !== null && (
              <div 
                className={`absolute inset-0 ${
                  slideDirection === 'right' ? 'animate-slideOutLeft' : 'animate-slideOutRight'
                }`}
              >
                {/* Tagline */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-[1px] bg-[#c9a96e]" />
                <span className="text-[#c9a96e] text-xs tracking-[0.25em] uppercase font-medium font-['Inter']">
                  {heroSlides[prevSlide].accent}
                </span>
                </div>

                {/* Title */}
                <h1 className="font-['Cormorant_Garamond'] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[#e8d5a3] leading-[0.9] mb-6">
                  {heroSlides[prevSlide].title.split(' ').map((word, i) => (
                    <span key={i} className={i % 2 === 1 ? 'text-[#c9a96e] italic' : ''}>{word} </span>
                  ))}
                </h1>

                {/* Subtitle */}
                <p className="text-[#e8d5a3]/60 text-lg font-['DM_Sans'] font-light mb-10 max-w-xl leading-relaxed">
                  {heroSlides[prevSlide].subtitle}. Iskusite luksuz bez kompromisa uz naše premium decant uzorke.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    to={heroSlides[prevSlide].link}
                    className="inline-flex items-center gap-3 bg-[#c9a96e] text-[#0a0a0a] px-8 py-4 rounded-full font-['Inter'] font-semibold text-sm tracking-[0.1em] uppercase hover:bg-[#e8d5a3] hover-lift btn-ripple"
                  >
                    {heroSlides[prevSlide].cta}
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/pracenje"
                    className="inline-flex items-center gap-3 border border-[#c9a96e]/40 text-[#c9a96e] px-8 py-4 rounded-full font-['DM_Sans'] font-light text-sm tracking-[0.1em] uppercase hover:border-[#c9a96e] hover:bg-[#c9a96e]/5 transition-all duration-300 hover-glow"
                  >
                    <Package size={16} />
                    Prati narudžbu
                  </Link>
                </div>
              </div>
            )}

            {/* Current slide content (entering) */}
            <div 
              className={isTransitioning 
                ? slideDirection === 'right' ? 'animate-slideInRight' : 'animate-slideInLeft'
                : ''
              }
            >
              {/* Tagline */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-[1px] bg-[#c9a96e]" />
                <span className="text-[#c9a96e] text-xs tracking-[0.25em] uppercase font-medium font-['Inter']">
                  {heroSlides[currentSlide].accent}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-['Cormorant_Garamond'] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[#e8d5a3] leading-[0.9] mb-6">
                {heroSlides[currentSlide].title.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 === 1 ? 'text-[#c9a96e] italic' : ''}>{word} </span>
                ))}
              </h1>

              {/* Subtitle */}
              <p className="text-[#e8d5a3]/60 text-lg font-['DM_Sans'] font-light mb-10 max-w-xl leading-relaxed">
                {heroSlides[currentSlide].subtitle}. Iskusite luksuz bez kompromisa uz naše premium decant uzorke.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link
                  to={heroSlides[currentSlide].link}
                  className="inline-flex items-center gap-3 bg-[#c9a96e] text-[#0a0a0a] px-8 py-4 rounded-full font-['Inter'] font-semibold text-sm tracking-[0.1em] uppercase hover:bg-[#e8d5a3] hover-lift btn-ripple"
                  style={{ 
                    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 0 0 rgba(201,169,110,0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 50px rgba(201,169,110,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 rgba(201,169,110,0)';
                  }}
                >
                  {heroSlides[currentSlide].cta}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/pracenje"
                  className="inline-flex items-center gap-3 border border-[#c9a96e]/40 text-[#c9a96e] px-8 py-4 rounded-full font-['DM_Sans'] font-light text-sm tracking-[0.1em] uppercase hover:border-[#c9a96e] hover:bg-[#c9a96e]/5 transition-all duration-300 hover-glow"
                >
                  <Package size={16} />
                  Prati narudžbu
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10 glass rounded-full px-4 py-3">
          <button
            onClick={handleHeroPrev}
            disabled={isTransitioning}
            className="w-9 h-9 rounded-full border border-[#c9a96e]/30 flex items-center justify-center text-[#c9a96e]/60 hover:text-[#c9a96e] hover:border-[#c9a96e]/60 hover:bg-[#c9a96e]/10 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => handleHeroSlideClick(i)}
                disabled={isTransitioning}
                className="relative group disabled:cursor-not-allowed"
                aria-label={`Go to slide ${i + 1}`}
              >
                {/* Background track */}
                <div className={`transition-all duration-500 rounded-full ${
                  i === currentSlide 
                    ? 'w-10 h-1.5 bg-[#c9a96e]/20' 
                    : 'w-1.5 h-1.5 bg-[#c9a96e]/25 hover:bg-[#c9a96e]/50 hover:scale-125'
                }`} />
                
                {/* Progress fill with smooth CSS animation */}
                {i === currentSlide && !isTransitioning && (
                  <div 
                    className="absolute top-0 left-0 h-1.5 rounded-full bg-gradient-to-r from-[#c9a96e] to-[#e8d5a3] shadow-[0_0_12px_rgba(201,169,110,0.5)]"
                    style={{ 
                      width: '0%',
                      animation: 'progressFill 4s linear forwards'
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleHeroNext}
            disabled={isTransitioning}
            className="w-9 h-9 rounded-full border border-[#c9a96e]/30 flex items-center justify-center text-[#c9a96e]/60 hover:text-[#c9a96e] hover:border-[#c9a96e]/60 hover:bg-[#c9a96e]/10 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 text-[#c9a96e]/30 text-[10px] tracking-[0.15em] uppercase font-['Inter'] flex flex-col items-center gap-2 animate-float">
          <div className="w-[1px] h-12 bg-gradient-to-b from-[#c9a96e]/30 to-transparent animate-pulse" />
          Scroll
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="border-y border-[#c9a96e]/10 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Package size={18} />, title: 'Isti dan pakiranje', desc: 'Narudžbe do 14h' },
              { icon: <Truck size={18} />, title: 'BoxNow paketomat', desc: 'Dostava 1-2 radna dana' },
              { icon: <Shield size={18} />, title: 'Sigurna kupnja', desc: 'Pouzećem ili bankovno' },
              { icon: <RotateCcw size={18} />, title: '14 dana povrat', desc: 'Bez pitanja' },
            ].map((badge, idx) => (
              <div 
                key={badge.title} 
                className="flex items-center gap-3 p-4 hover:bg-[#c9a96e]/5 rounded-xl transition-all duration-300 hover-lift cursor-default group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="text-[#c9a96e]/60 flex-shrink-0 group-hover:text-[#c9a96e] group-hover:scale-110 transition-all duration-300">{badge.icon}</div>
                <div>
                  <div className="text-[#e8d5a3]/80 text-[13px] font-semibold font-['Inter'] tracking-wide">{badge.title}</div>
                  <div className="text-[#e8d5a3]/30 text-[11px] font-['Inter'] font-light">{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED SECTION — CLEAN REDESIGN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[#c9a96e] text-xs tracking-[0.25em] uppercase font-medium font-['Inter'] mb-3">
              Izdvajamo
            </p>
            <h2 className="font-['Cormorant_Garamond'] text-4xl md:text-5xl font-bold text-[#e8d5a3]">
              Featured <span className="text-[#c9a96e] italic">kolekcija</span>
            </h2>
          </div>
          <Link 
            to="/parfemi?featured=true" 
            className="view-all-link hidden md:inline-flex items-center gap-2 text-[#c9a96e] text-sm font-['Inter'] tracking-wider hover:text-[#e8d5a3] transition-colors px-4 py-2 rounded-xl border border-[#c9a96e]/20 hover:border-[#c9a96e]/40"
          >
            Vidi sve
            <ArrowRight size={14} className="arrow-icon" />
          </Link>
        </div>

        {/* Products Grid — Simple & Clean */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-[#c9a96e]/30 border-t-[#c9a96e] rounded-full animate-spin" />
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#e8d5a3]/40 font-['DM_Sans']">Nema featured proizvoda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 8).map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlist.includes(product.id)}
                onWishlistToggle={onWishlistToggle}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}

        {/* View All Link — Mobile */}
        <div className="text-center mt-10 md:hidden">
          <Link 
            to="/parfemi?featured=true" 
            className="view-all-link inline-flex items-center gap-2 text-[#c9a96e] border border-[#c9a96e]/30 px-6 py-3 rounded-xl text-sm font-['Inter'] hover:bg-[#c9a96e]/5 hover:border-[#c9a96e]/50 transition-all"
          >
            Vidi sve featured
            <ArrowRight size={14} className="arrow-icon" />
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-[#c9a96e] text-xs tracking-[0.25em] uppercase font-medium font-['Inter'] mb-3">Kako funkcionira</p>
          <h2 className="font-['Cormorant_Garamond'] text-4xl md:text-5xl font-bold text-[#e8d5a3]">
            Jednostavno kao <span className="text-[#c9a96e] italic">1, 2, 3</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-[1px] bg-gradient-to-r from-[#c9a96e]/20 via-[#c9a96e]/40 to-[#c9a96e]/20" />
          {[
            {
              step: '01',
              icon: '🔍',
              title: 'Odaberi miris',
              desc: 'Pregledaj našu kolekciju premium parfema. Filtriraj po brandu, spolu ili sezoni — pronađi savršen miris za sebe.',
            },
            {
              step: '02',
              icon: '💳',
              title: 'Naruči i plati',
              desc: 'Odaberi veličinu (2ml, 5ml ili 10ml), dodaj u košaricu i plati karticom, Apple Pay ili Revolutom. Brzo i sigurno.',
            },
            {
              step: '03',
              icon: '📦',
              title: 'Primi na kućni prag',
              desc: 'Pakiramo isti dan (do 14h). BoxNow paketomat dostava za 1–2 radna dana. Pratite pošiljku u realnom vremenu.',
            },
          ].map((item) => (
            <div key={item.step} className="relative bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-8 hover:border-[#c9a96e]/25 transition-all duration-300 group">
              {/* Step number */}
              <div className="absolute -top-4 left-8 bg-[#0a0a0a] border border-[#c9a96e]/20 rounded-full px-3 py-1">
                <span className="text-[#c9a96e]/60 text-[10px] font-bold tracking-[0.2em] font-['Inter']">{item.step}</span>
              </div>
              <div className="text-3xl mb-4 mt-2">{item.icon}</div>
              <h3 className="font-['Cormorant_Garamond'] text-xl font-bold text-[#e8d5a3] mb-3 group-hover:text-[#c9a96e] transition-colors">{item.title}</h3>
              <p className="text-[#e8d5a3]/45 text-sm font-['Inter'] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF STATS */}
      <section className="bg-[#111111] border-y border-[#c9a96e]/10 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '200+', label: 'Parfema u kolekciji', icon: '✦' },
              { number: '4.9★', label: 'Prosječna ocjena', icon: '★' },
              { number: '1–2', label: 'Dana dostava', icon: '📦' },
              { number: '100%', label: 'Originalni parfemi', icon: '🔒' },
            ].map((stat) => (
              <div key={stat.label} className="group">
                <div className="text-[#c9a96e]/40 text-lg mb-1">{stat.icon}</div>
                <div className="font-['Cormorant_Garamond'] text-4xl md:text-5xl font-bold text-[#c9a96e] mb-2 group-hover:scale-105 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-[#e8d5a3]/40 text-xs font-['Inter'] tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-[#c9a96e] text-xs tracking-[0.25em] uppercase font-medium font-['Inter'] mb-3 flex items-center justify-center gap-2">
            <Star size={12} fill="currentColor" />
            Recenzije kupaca
          </p>
          <h2 className="font-['Cormorant_Garamond'] text-4xl md:text-5xl font-bold text-[#e8d5a3]">
            Što kažu naši <span className="text-[#c9a96e] italic">kupci</span>
          </h2>
          <div className="flex justify-center items-center gap-2 mt-4">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-[#c9a96e]" fill="currentColor" />)}
            </div>
            <span className="text-[#e8d5a3]/40 text-sm font-['Inter']">4.9 / 5 — Verificirane recenzije</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Marko H.',
              location: 'Zagreb',
              rating: 5,
              text: 'Naručio sam Sauvage 5ml za probu i oduševljen sam. Miris je 100% autentičan, pakiranje uredno, stiglo za 2 dana. Definitivno naručujem opet!',
              product: 'Dior Sauvage 5ml',
              date: 'Travanj 2026',
            },
            {
              name: 'Ana K.',
              location: 'Split',
              rating: 5,
              text: 'Konačno mogu probati skupe parfeme bez da kupim cijelu bočicu. Naručila sam 3 različita mirisa, svi su točno kao u parfumeriji. Preporučujem svima!',
              product: 'Chanel No.5 · Tom Ford Black Orchid · Creed Aventus',
              date: 'Svibanj 2026',
            },
            {
              name: 'Ivan P.',
              location: 'Rijeka',
              rating: 5,
              text: 'Brza dostava, lijepo zapakirano, miris identičan originalu. Odlična ideja za sve koji žele isprobati luksuzne parfeme. Hvala dekantihr.com!',
              product: 'Creed Aventus 10ml',
              date: 'Svibanj 2026',
            },
          ].map((review) => (
            <div key={review.name} className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-6 hover:border-[#c9a96e]/25 transition-all duration-300 flex flex-col">
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={13} className="text-[#c9a96e]" fill="currentColor" />
                ))}
              </div>
              {/* Quote */}
              <p className="text-[#e8d5a3]/65 text-sm font-['Inter'] leading-relaxed flex-1 mb-5">
                "{review.text}"
              </p>
              {/* Product */}
              <div className="bg-[#c9a96e]/5 border border-[#c9a96e]/10 rounded-xl px-3 py-2 mb-4">
                <p className="text-[#c9a96e]/60 text-[10px] font-['Inter'] uppercase tracking-wider mb-0.5">Kupljeno</p>
                <p className="text-[#e8d5a3]/60 text-xs font-['Inter']">{review.product}</p>
              </div>
              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#c9a96e]/15 border border-[#c9a96e]/20 flex items-center justify-center">
                    <span className="text-[#c9a96e] text-xs font-bold font-['Inter']">{review.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-[#e8d5a3]/80 text-xs font-semibold font-['Inter']">{review.name}</p>
                    <p className="text-[#e8d5a3]/30 text-[10px] font-['Inter']">{review.location}</p>
                  </div>
                </div>
                <span className="text-[#e8d5a3]/20 text-[10px] font-['Inter']">{review.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <div className="text-center mt-10">
          <p className="text-[#e8d5a3]/25 text-xs font-['Inter'] flex items-center justify-center gap-2">
            <Shield size={11} className="text-[#c9a96e]/40" />
            Sve recenzije su od verificiranih kupaca koji su naručili na dekantihr.com
          </p>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="border-y border-[#c9a96e]/10 bg-[#111111]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left Side — Offer Details */}
            <div className="flex items-start gap-4">
              {/* Code Badge */}
              <div className="flex-shrink-0 bg-[#c9a96e]/10 border border-[#c9a96e]/30 rounded-xl px-4 py-2.5">
                <div className="text-[#c9a96e] text-xs font-bold tracking-[0.15em] uppercase font-['Inter']">
                  DOBRODOSLI10
                </div>
                <div className="text-[#c9a96e]/60 text-[9px] tracking-wider uppercase font-['DM_Sans'] mt-0.5">
                  Kupon kod
                </div>
              </div>

              {/* Offer Text */}
              <div>
                <h3 className="font-['Cormorant_Garamond'] text-xl md:text-2xl font-semibold text-[#e8d5a3] mb-1">
                  10% popusta na prvu narudžbu
                </h3>
                <p className="text-[#e8d5a3]/40 text-xs font-['DM_Sans']">
                  Min. narudžba 15€ · Max. popust 15€ · Za nove kupce
                </p>
              </div>
            </div>

            {/* Right Side — CTA */}
            <div className="flex-shrink-0">
              <Link 
                to="/parfemi" 
                className="inline-flex items-center gap-2 bg-[#c9a96e] text-[#0a0a0a] px-6 py-3 rounded-xl font-['Inter'] font-semibold text-sm tracking-wide uppercase hover:bg-[#e8d5a3] transition-colors duration-300"
              >
                Kupuj sada
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Trust Badges — Compact */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 pt-6 border-t border-[#c9a96e]/10">
            {[
              { icon: <Package size={12} />, text: 'Isti dan pakiranje' },
              { icon: <Truck size={12} />, text: 'BoxNow paketomat' },
              { icon: <Shield size={12} />, text: 'Sigurna kupnja' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2 text-[#e8d5a3]/30 text-xs font-['Inter']">
                <span className="text-[#c9a96e]/40">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER — MINIMALIST REDESIGN */}
      <section className="border-y border-[#c9a96e]/10 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Decorative Top Line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-[1px] bg-[#c9a96e]/30" />
            <span className="font-['Cormorant_Garamond'] text-5xl md:text-6xl font-light text-[#c9a96e]/40">10%</span>
            <div className="w-16 h-[1px] bg-[#c9a96e]/30" />
          </div>

          {/* Headline */}
          <h2 className="font-['Cormorant_Garamond'] text-3xl md:text-4xl font-light text-[#e8d5a3] text-center mb-3 leading-tight">
            Pretplatite se na naš newsletter
          </h2>
          
          {/* Subheadline */}
          <p className="text-[#e8d5a3]/50 text-center font-['Inter'] text-sm mb-10 max-w-xl mx-auto leading-relaxed">
            Ostvarite 10% popusta na prvu narudžbu i budite prvi koji saznaju za nove mirise i ekskluzivne ponude
          </p>

          {/* Form */}
          <form onSubmit={handleNewsletter} className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                placeholder="Unesite vašu email adresu"
                required
                className="flex-1 bg-transparent border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/30 px-5 py-3.5 rounded-xl text-sm font-['Inter'] focus:outline-none focus:border-[#c9a96e]/50 transition-colors duration-300"
                aria-label="Email adresa za newsletter"
              />
              <button 
                type="submit" 
                className="bg-[#c9a96e] text-[#0a0a0a] px-8 py-3.5 rounded-xl font-['Inter'] font-semibold text-sm tracking-wide uppercase hover:bg-[#e8d5a3] transition-colors duration-300 whitespace-nowrap"
              >
                Pretplati se
              </button>
            </div>
          </form>

          {/* Benefits — Inline with bullets */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[#e8d5a3]/40 text-xs font-['Inter'] mb-6">
            <span>Ekskluzivne ponude</span>
            <span className="text-[#c9a96e]/30">•</span>
            <span>Novi mirisi</span>
            <span className="text-[#c9a96e]/30">•</span>
            <span>Savjeti za odabir</span>
            <span className="text-[#c9a96e]/30">•</span>
            <span>Bez spama</span>
          </div>

          {/* Decorative Bottom Line */}
          <div className="w-32 h-[1px] bg-[#c9a96e]/20 mx-auto" />
        </div>
      </section>
    </div>
  );
}
