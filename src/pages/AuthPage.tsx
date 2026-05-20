import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { User } from '../store/cartStore';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface AuthPageProps {
  mode: 'login' | 'register' | 'forgot';
  onLogin: (user: User) => void;
}

export default function AuthPage({ mode, onLogin }: AuthPageProps) {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', ime: '', prezime: '', confirmPass: '',
  });

  const update = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await api.login(form.email, form.password);
      onLogin(user);
      toast.success(`Dobrodošli, ${user.ime}!`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      toast.error(err.message || 'Pogrešan email ili lozinka');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ime || !form.prezime || !form.email || !form.password) { toast.error('Ispunite sva polja'); return; }
    if (form.password !== form.confirmPass) { toast.error('Lozinke se ne podudaraju'); return; }
    if (form.password.length < 8) { toast.error('Lozinka mora imati najmanje 8 znakova'); return; }
    setLoading(true);
    try {
      const user = await api.register(form.email, form.password, form.ime, form.prezime);
      onLogin(user);
      toast.success('Registracija uspješna! Dobrodošli u dekantihr.com!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Došlo je do greške prilikom registracije');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success(`Reset link poslan na ${form.email}`);
    setLoading(false);
  };

  const inputCls = "w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50 font-['Inter']";
  const labelCls = "text-[#e8d5a3]/40 text-xs font-['Inter'] uppercase tracking-wider mb-1.5 block";

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-20 md:pt-28 pb-16 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-['Playfair_Display'] font-bold text-[#e8d5a3] tracking-[0.15em]">
              DEKANTI<span className="text-[#c9a96e]">.HR</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 justify-center mt-4 mb-2">
            <div className="flex-1 h-[1px] bg-[#c9a96e]/20" />
            <span className="text-[#c9a96e] text-xs">✦</span>
            <div className="flex-1 h-[1px] bg-[#c9a96e]/20" />
          </div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#e8d5a3]">
            {mode === 'login' ? 'Prijava' : mode === 'register' ? 'Registracija' : 'Zaboravljena lozinka'}
          </h1>
          <p className="text-[#e8d5a3]/40 text-sm font-['Inter'] font-light mt-1">
            {mode === 'login' ? 'Prijavite se u vaš dekantihr.com račun' :
             mode === 'register' ? 'Kreirajte besplatan račun' :
             'Pošaljemo vam link za reset lozinke'}
          </p>
        </div>

        <div className="bg-[#111111] border border-[#c9a96e]/15 rounded-3xl p-7">
          {/* Login */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelCls}>Email adresa</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="vasa@email.com" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Lozinka</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="••••••••" required className={`${inputCls} pr-11`} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#e8d5a3]/30 hover:text-[#c9a96e] transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link to="/zaboravljena-lozinka" className="text-[#c9a96e]/60 text-xs font-['Inter'] hover:text-[#c9a96e] transition-colors">
                  Zaboravili ste lozinku?
                </Link>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#c9a96e] text-[#0a0a0a] py-4 rounded-2xl font-bold text-sm tracking-wider uppercase hover:bg-[#e8d5a3] transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" /> : <>Prijava <ArrowRight size={15} /></>}
              </button>

            </form>
          )}

          {/* Register */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Ime</label>
                  <input type="text" value={form.ime} onChange={e => update('ime', e.target.value)} placeholder="Ivan" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Prezime</label>
                  <input type="text" value={form.prezime} onChange={e => update('prezime', e.target.value)} placeholder="Horvat" required className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Email adresa</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="vasa@email.com" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Lozinka</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min. 8 znakova" required className={`${inputCls} pr-11`} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#e8d5a3]/30 hover:text-[#c9a96e] transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>Potvrda lozinke</label>
                <input type="password" value={form.confirmPass} onChange={e => update('confirmPass', e.target.value)} placeholder="Ponovite lozinku" required className={inputCls} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#c9a96e] text-[#0a0a0a] py-4 rounded-2xl font-bold text-sm tracking-wider uppercase hover:bg-[#e8d5a3] transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" /> : <>Registriraj se <ArrowRight size={15} /></>}
              </button>
              <p className="text-[#e8d5a3]/25 text-[10px] font-['Inter'] text-center">
                Registracijom prihvaćate naše <Link to="/uvjeti" className="text-[#c9a96e]/50 hover:text-[#c9a96e]">uvjete korištenja</Link>
              </p>
            </form>
          )}

          {/* Forgot */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className={labelCls}>Email adresa</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="vasa@email.com" required className={inputCls} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#c9a96e] text-[#0a0a0a] py-4 rounded-2xl font-bold text-sm tracking-wider uppercase hover:bg-[#e8d5a3] transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" /> : 'Pošalji reset link'}
              </button>
            </form>
          )}

          {/* Links */}
          <div className="mt-6 text-center">
            {mode === 'login' ? (
              <p className="text-[#e8d5a3]/35 text-sm font-['Inter']">
                Nemate račun?{' '}
                <Link to="/registracija" className="text-[#c9a96e] hover:text-[#e8d5a3] transition-colors font-semibold">
                  Registrirajte se
                </Link>
              </p>
            ) : (
              <p className="text-[#e8d5a3]/35 text-sm font-['Inter']">
                Već imate račun?{' '}
                <Link to="/prijava" className="text-[#c9a96e] hover:text-[#e8d5a3] transition-colors font-semibold">
                  Prijavite se
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
