# dekantihr.com — Kompletna dokumentacija

**Stack:** React 19 + Vite + Supabase (PostgreSQL) + Deno Edge Functions + Vercel  
**URL:** https://dekantihr.com  
**Admin:** https://dekantihr.com/admin

---

## 1. AUTENTIKACIJA (Login / Registracija)

### Kako radi
- **Vlastiti auth sustav** — ne koristi Supabase Auth, nego custom PostgreSQL funkcije
- Lozinke su hashirane bcryptom (cost 10) direktno u bazi
- Sesija se čuva u `localStorage` pod ključem `dekanti_user`
- Nema JWT tokena — sesija je samo JSON objekt `{ id, ime, prezime, email, role }`

### Rute
| Ruta | Opis |
|------|------|
| `/prijava` | Login forma |
| `/registracija` | Registracija novog korisnika |
| `/zaboravljena-lozinka` | Reset lozinke (šalje email s linkom) |
| `/reset-lozinka?token=...` | Stranica za unos nove lozinke |

### Kako funkcionira login
1. Korisnik unese email + lozinka
2. Poziva se Supabase RPC `verify_login(p_email, p_password)`
3. Funkcija uspoređuje bcrypt hash u bazi
4. Vraća `{ success: true, user: { id, ime, prezime, email, role } }`
5. User objekt se sprema u `localStorage`
6. Admin se preusmjerava na `/admin`, kupac na `/`

### Uloge
- `admin` — pristup admin panelu, sve operacije
- `kupac` — pristup profilu, narudžbama, wishlistу

### Reset lozinke
1. Korisnik unese email na `/zaboravljena-lozinka`
2. Poziva se RPC `request_password_reset(p_email)`
3. Generira se sigurni token (32 hex bajta), sprema se u `users.password_reset_token` s rokom 1 sat
4. Šalje se email s linkom `https://dekantihr.com/reset-lozinka?token=...`
5. Na stranici `/reset-lozinka` korisnik unese novu lozinku
6. Poziva se RPC `complete_password_reset(p_token, p_new_password)`

---

## 2. NEWSLETTER

### Kako radi
- Email se sprema u tablicu `newsletter` u bazi
- Nakon uspješne prijave automatski se šalje welcome email s kuponom `DOBRODOSLI10`

### Gdje se može prijaviti
1. **Newsletter popup** — pojavljuje se automatski nakon 45 sekundi ILI kad korisnik scrolluje 40% stranice
2. **Newsletter sekcija** na dnu homepage-a
3. **Footer** — forma za prijavu

### Welcome email
- Predmet: `Dobrodošli u dekantihr.com — vaš kupon je spreman`
- Sadržaj: pozdravna poruka + kupon `DOBRODOSLI10` (10% popusta, min. narudžba 15€) + gumb za katalog

### Popup ponašanje
- Prikazuje se samo jednom — nakon prijave ili odbijanja sprema se u `localStorage` (`dekanti_newsletter_popup`)
- Zatvara se: X gumb, klik izvan, Escape tipka
- Nakon uspješne prijave auto-zatvara se za 3 sekunde s progress barom

---

## 3. COOKIE BANNER

- Prikazuje se 800ms nakon prvog posjeta
- Dvije opcije: **Prihvati** / **Odbij**
- Odluka se pamti u `localStorage` (`dekanti_cookie_consent`) zauvijek
- Ne prikazuje se u admin panelu

---

## 4. KOŠARICA I CHECKOUT

### Košarica
- Sprema se u `localStorage` (`dekanti_cart`)
- Svaki item: `{ product_id, product_size_id, naziv, brand, ml, cijena, kolicina, image, slug, max_zaliha }`
- Besplatna dostava za narudžbe iznad 50€, inače 2.99€

### Kuponi
- Unose se na stranici košarice
- Validacija: provjera roka, broja korištenja, minimalnog iznosa, veličine proizvoda
- Kupon `DOBRODOSLI10`: 10% popusta, min. 15€, max. popust 15€
- Kupon `PRVIH10`: 10% na 10ml artikle, broji se samo na plaćenim narudžbama, auto-deaktivira nakon 10 plaćenih korištenja

### Checkout proces (3 koraka)
1. **Podaci** — ime, prezime, email, telefon, adresa, grad, poštanski broj, napomena
2. **Plaćanje** — odabir načina plaćanja
3. **Pregled** — pregled narudžbe prije potvrde

### Načini plaćanja
| Način | Opis |
|-------|------|
| **Revolut** | Link na `revolut.me/dekantihr` — prihvaća kartice (Visa/Mastercard), Apple Pay, Google Pay, Revolut. Narudžba se kreira s statusom `cekanje_uplate`, merchant ručno potvrđuje uplatu u admin panelu |
| ~~Bankovna transakcija~~ | Maknuto — nije dostupno |

### Revolut flow
1. Kupac klikne "Potvrdi narudžbu"
2. Generira se broj narudžbe server-side (`generate_order_number()` RPC)
3. Prikazuje se modal s linkom za plaćanje i iznosom
4. Kupac plati u Revolutu, unese broj narudžbe kao opis
5. Kupac klikne "Platio sam" — narudžba se kreira s `status: cekanje_uplate`
6. Šalje se email kupcu s detaljima
7. Merchant vidi narudžbu u admin panelu, potvrdi uplatu → status postaje `nova`
8. Stranica kupca automatski polluje svakih 8 sekundi i prikazuje toast kad je uplata potvrđena

### Narudžba
- Broj narudžbe format: `HR-2026-XXXXXX` (6 znamenki, generira se server-side bez kolizija)
- Zaliha se smanjuje odmah pri kreiranju narudžbe (RPC `decrement_stock`)
- Narudžbe gostiju (bez prijave) su podržane

---

## 5. PRAĆENJE NARUDŽBE

- Ruta: `/pracenje`
- Korisnik unese broj narudžbe
- Prikazuje se status, tracking broj (BoxNow link), stavke narudžbe
- Radi i bez prijave (samo broj narudžbe)

---

## 6. PROFIL KORISNIKA

- Ruta: `/profil` (zaštićena — treba biti prijavljen)
- Tabovi:
  - **Profil** — osobni podaci, promjena lozinke
  - **Narudžbe** — povijest narudžbi s detaljima
  - **Wishlist** — omiljeni proizvodi
  - **Kuponi** — primljeni kuponi, aktivacija

### Kuponi u profilu
- Kuponi se šalju kampanjama iz admin panela
- Status: `pending` → `activated` → `used`
- Korisnik aktivira kupon klikom, dobiva kod za unos pri checkout-u
- Notifikacija u navbaru (badge s brojem novih kupona)

---

## 7. ADMIN PANEL

**Ruta:** `/admin`  
**Pristup:** samo korisnici s `role = 'admin'`

### Navigacija (sidebar)
| Sekcija | Opis |
|---------|------|
| Dashboard | Statistike, pregled narudžbi |
| Narudžbe | Upravljanje svim narudžbama |
| Proizvodi | CRUD za parfeme |
| Brendovi | CRUD za brendove |
| Kupci | Pregled korisnika |
| Recenzije | Odobravanje/odbijanje recenzija |
| Kuponi | Kreiranje i upravljanje kuponima |
| Kampanje | Slanje kupona korisnicima emailom |
| Newsletter | Lista pretplatnika |
| Statistike | Prihodi, prodaja |

---

### 7.1 NARUDŽBE

#### Statusi narudžbi
| Status | Opis | Boja |
|--------|------|------|
| `cekanje_uplate` | Revolut — čeka potvrdu uplate | Ljubičasta |
| `nova` | Nova narudžba, uplata potvrđena | Žuta |
| `u_obradi` | U pripremi za slanje | Plava |
| `poslano` | Poslano, ima tracking broj | Ljubičasta |
| `isporuceno` | Isporučeno kupcu | Zelena |
| `otkazano` | Otkazano | Crvena |
| `povrat` | Povrat robe | Narančasta |

#### Što možeš raditi s narudžbom
- **Promjena statusa** — dropdown s dostupnim statusima
- **Unos tracking broja** — BoxNow tracking broj, automatski šalje email kupcu s linkom
- **Označi kao plaćeno** — za Revolut narudžbe, mijenja status iz `cekanje_uplate` u `nova`, šalje email kupcu
- **Uredi podatke** — ime, prezime, email, telefon, adresa, napomena
- **Obriši narudžbu** — trajno briše narudžbu i stavke
- **Pošalji email kupcu** — predlošci:
  - 📧 U obradi
  - 📧 Uplata potvrđena
  - 📧 Isporučeno
  - 📧 Otkazano

#### Email predlošci (automatski)
- Kad se postavi tracking broj + status `poslano` → automatski šalje email s BoxNow linkom
- Kad se označi kao plaćeno → automatski šalje email potvrde uplate

---

### 7.2 PROIZVODI

#### Kreiranje/uređivanje proizvoda
Polja:
- **Naziv** — ime parfema
- **Brand** — odabir iz liste brendova
- **Slug** — URL-friendly naziv (auto-generira se)
- **Koncentracija** — EDP / EDT / Parfum / EDC / EDP Extrait / EDP Intense
- **Spol** — muški / ženski / unisex
- **Sezona** — proljeće / ljeto / jesen / zima / sve
- **Kratki opis** — 1-2 rečenice
- **Dugi opis** — detaljan opis
- **Note vrha** — npr. "bergamot, limun, naranča"
- **Note srca** — npr. "ruža, jasmin, iris"
- **Note baze** — npr. "mošus, sandalovina, vanilija"
- **Featured** — prikazuje se na homepageu
- **Aktivan** — vidljiv u katalogu
- **Veličine i cijene** — dodavanje više veličina (2ml, 5ml, 10ml...) s cijenom i zalihom
- **Slike** — upload slika (drag & drop ili klik), sprema se u Supabase Storage

#### AI generiranje proizvoda
Gumb **"Generiraj sve (AI)"** — automatski popunjava:
- Slug, koncentracija, spol, sezona
- Kratki i dugi opis (na hrvatskom)
- Note vrha, srca i baze (dohvaća s Fragrantica)
- Preporučene cijene i veličine

**Fragrantica modal** — možeš zalijepiti tekst s Fragrantica stranice parfema za preciznije note (bez halucinacija AI-a)

Model: `llama-3.3-70b-versatile` (Groq API) kroz Supabase Edge Function `admin-ai`

---

### 7.3 BRENDOVI

- Kreiranje, uređivanje, brisanje brendova
- Polja: naziv, opis, logo URL, aktivan/neaktivan

---

### 7.4 KUPCI

- Pregled svih registriranih korisnika
- Podaci: ime, prezime, email, telefon, grad, datum registracije, uloga
- Klik na kupca → detalji

---

### 7.5 RECENZIJE

- Prikaz recenzija koje čekaju odobrenje
- **Odobri** → recenzija postaje vidljiva na stranici proizvoda
- **Odbij** → recenzija se briše

---

### 7.6 KUPONI

#### Kreiranje kupona
Polja:
- **Kod** — npr. `LJETO20`
- **Tip** — postotak (%) ili fiksni iznos (€)
- **Vrijednost** — npr. 10 (za 10% ili 10€)
- **Min. iznos narudžbe** — minimalni iznos za aktivaciju
- **Max. popust** — gornja granica popusta (za postotne kupone)
- **Max. korištenja** — ukupno koliko puta se može iskoristiti
- **Vrijedi do** — datum isteka
- **Min. veličina ml** — kupon vrijedi samo za određenu veličinu (npr. samo 10ml)
- **Broji na plaćenim** — ako je uključeno, korištenje se broji tek kad je narudžba plaćena

#### Posebni kuponi
- `DOBRODOSLI10` — 10% za nove kupce, šalje se welcome emailom
- `PRVIH10` — 10% na 10ml artikle, auto-deaktivira nakon 10 plaćenih narudžbi

---

### 7.7 KAMPANJE

Slanje kupona svim korisnicima ili samo newsletter pretplatnicima:
1. Odaberi kupon iz liste
2. Odaberi publiku: **Svi korisnici** ili **Newsletter pretplatnici**
3. Postavi rok važenja kupona (opcionalno)
4. Klikni **Pošalji kampanju**

Što se dogodi:
- Kreira se `user_coupons` zapis za svakog korisnika
- Svaki korisnik dobiva email s kodom kupona i linkom na profil
- Korisnik vidi kupon u profilu pod tabom "Kuponi"
- Badge u navbaru pokazuje broj novih kupona

---

### 7.8 NEWSLETTER

- Lista svih pretplatnika s emailom i datumom prijave
- Samo pregled (brisanje nije implementirano kroz UI)

---

### 7.9 STATISTIKE

- Prihodi po danima (graf)
- Ukupan broj narudžbi, prihod, prosječna vrijednost narudžbe
- Podaci dolaze iz stvarnih narudžbi u bazi

---

## 8. KATALOG PARFEMA

**Ruta:** `/parfemi`

### Filteri
- **Brand** — odabir brenda
- **Spol** — muški / ženski / unisex
- **Sezona** — proljeće / ljeto / jesen / zima / sve
- **Pretraga** — po nazivu (ILIKE)
- **Sortiranje** — po datumu, cijeni, featured

### Kartica proizvoda
- Slika, naziv, brand, koncentracija, spol
- Cijene po veličinama (2ml, 5ml, 10ml...)
- Gumb "Dodaj u košaricu" s odabirom veličine
- Wishlist gumb (srce)
- "Rasprodano" badge za veličine bez zalihe

---

## 9. STRANICA PROIZVODA

**Ruta:** `/parfemi/:slug`

- Galerija slika (fade+zoom animacija, strelice, dot indikatori, thumbnail)
- Piramida mirisa (note vrha, srca, baze)
- Odabir veličine s brojem sprejeva
- Animirani opis
- Recenzije kupaca (samo odobrene)
- Forma za pisanje recenzije (treba biti prijavljen)

---

## 10. EMAILOVI

Svi emailovi se šalju kroz Supabase Edge Function `send-email` koja koristi **Resend API**.

### Pošiljatelj
`dekanti.hr <info@dekanti.hr>`

### Lista emailova
| Okidač | Predmet |
|--------|---------|
| Prijava na newsletter | `Dobrodošli u dekantihr.com — vaš kupon je spreman` |
| Nova narudžba (bankovna) | `Narudžba HR-XXXX-XXXXXX — dekantihr.com` |
| Nova narudžba (Revolut, čeka uplatu) | `Narudžba HR-XXXX-XXXXXX — uplata se obrađuje` |
| Uplata potvrđena | `Uplata potvrđena — narudžba HR-XXXX-XXXXXX` |
| Narudžba poslana | `Narudžba HR-XXXX-XXXXXX poslana — tracking: XXXXX` |
| Narudžba u obradi (ručno) | `Narudžba HR-XXXX-XXXXXX — u obradi` |
| Narudžba isporučena (ručno) | `Narudžba HR-XXXX-XXXXXX — isporučeno!` |
| Narudžba otkazana (ručno) | `Narudžba HR-XXXX-XXXXXX — otkazana` |
| Kampanja s kuponom | `🎁 Novi kupon za vas — KOD` |
| Reset lozinke | `Reset lozinke — dekantihr.com` |

---

## 11. BAZA PODATAKA (Supabase)

### Glavne tablice
| Tablica | Opis |
|---------|------|
| `users` | Korisnici (email, bcrypt hash, ime, prezime, uloga) |
| `brands` | Brendovi parfema |
| `products` | Parfemi (naziv, slug, opis, note, koncentracija...) |
| `product_sizes` | Veličine i cijene po parfemu |
| `product_images` | Slike parfema (Supabase Storage) |
| `orders` | Narudžbe s podacima kupca |
| `order_items` | Stavke narudžbi |
| `coupons` | Kuponi |
| `user_coupons` | Veza korisnik ↔ kupon |
| `reviews` | Recenzije (odobrene/na čekanju) |
| `newsletter` | Newsletter pretplatnici |
| `wishlist` | Wishlist korisnika |
| `admin_logs` | Log admin akcija |

### Supabase Edge Functions
| Funkcija | Opis |
|----------|------|
| `send-email` | Slanje emailova kroz Resend API |
| `admin-ai` | AI generiranje sadržaja kroz Groq API |

---

## 12. ENVIRONMENT VARIJABLE

```env
# Supabase
VITE_SUPABASE_URL=https://rfstxhlbnsdsiovtrroj.supabase.co
VITE_SUPABASE_ANON_KEY=...

# Revolut
VITE_REVOLUT_USERNAME=dekantihr

# Edge Functions (Supabase Secrets)
GROQ_API_KEY=...
RESEND_API_KEY=...
FROM_EMAIL=dekanti.hr <info@dekanti.hr>
ALLOWED_ORIGIN=https://dekantihr.com
```

---

## 13. DEPLOYMENT

- **Frontend:** Vercel (auto-deploy na `git push origin main`)
- **Baza:** Supabase (hosted PostgreSQL)
- **Edge Functions:** Supabase (Deno runtime)
- **Slike:** Supabase Storage (bucket `product-images`, public)
- **Email:** Resend API

### Deploy postupak
```bash
git add -A
git commit -m "opis promjene"
git push origin main
# Vercel automatski deploya
```

---

## 14. POZNATI LIMITI / TODO

- Nema Supabase Auth — sesija je u localStorage (sigurnosni rizik ako dođe do XSS)
- Admin operacije idu direktno s anon keyem (nema server-side admin provjere za sve operacije)
- Password reset stranica `/reset-lozinka` postoji u bazi ali nema React route — treba dodati
- Recenzije se mogu pisati samo za kupljene proizvode (nije enforced u kodu, samo UI)
- Nema email verifikacije pri registraciji
