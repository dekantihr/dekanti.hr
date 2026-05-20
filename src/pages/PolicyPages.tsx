import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Shield, RotateCcw, Truck, FileText, Cookie } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

function PolicyLayout({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="flex items-center gap-2 mb-8">
            <Link to="/" className="text-[#c9a96e]/60 hover:text-[#c9a96e] text-sm flex items-center gap-1 transition-colors">
              <ArrowLeft size={14} /> Početna
            </Link>
            <span className="text-[#c9a96e]/30">/</span>
            <span className="text-[#e8d5a3]/60 text-sm">{subtitle}</span>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={100}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[#c9a96e]">{icon}</span>
            <p className="text-[#c9a96e] text-xs tracking-[0.25em] uppercase font-medium font-['Inter']">{subtitle}</p>
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl md:text-5xl font-bold text-[#e8d5a3] mb-12">
            {title}
          </h1>
        </ScrollReveal>

        <div className="space-y-10">
          {children}
        </div>
      </div>
    </div>
  );
}

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <ScrollReveal animation="fade-up" delay={number * 80}>
      <div className="border-l-2 border-[#c9a96e]/20 pl-6 hover:border-[#c9a96e]/40 transition-colors duration-500">
        <h2 className="font-['Cormorant_Garamond'] text-xl md:text-2xl font-semibold text-[#e8d5a3] mb-4 flex items-center gap-3">
          <span className="text-[#c9a96e] text-sm font-['Inter'] font-bold">{String(number).padStart(2, '0')}</span>
          {title}
        </h2>
        <div className="text-[#e8d5a3]/60 font-['Inter_Tight'] font-light leading-relaxed space-y-3">
          {children}
        </div>
      </div>
    </ScrollReveal>
  );
}

export function FAQPage() {
  return (
    <PolicyLayout title="Često postavljana pitanja" subtitle="FAQ" icon={<HelpCircle size={18} />}>
      <Section number={1} title="Otkuda nabavljate parfeme i zašto ne prodajete cijele bočice?">
        <p>
          dekanti.hr se bavi isključivo prodajom dekanta (putnih i testnih pakiranja) koje točimo iz originalnih flakona. Naš fokus je na tzv. sivom tržištu (Gray Market) unutar Europske unije. Surađujemo s ovlaštenim distributerima koji nam ustupaju testerska pakiranja, višak zaliha (overstock) te ambalažu s manjim estetskim oštećenjima koja ne može ići u klasičnu maloprodaju.
        </p>
        <p>
          Budući da su cijele bočice rezervirane za službene prezentacije i testiranja, mi ih otkupljujemo u velikim količinama i pretkačemo u manje mililitraže, omogućujući vam pristup luksuzu po znatno nižim cijenama.
        </p>
      </Section>

      <Section number={2} title="Zašto su cijene dekanata i do 30% niže nego u klasičnim trgovinama?">
        <p>
          Kao online platforma nemamo troškove najma luksuznih prostora u središtima gradova, pratećih režija niti velikog broja zaposlenika. Svi naši parfemi nabavljaju se direktno kroz partnerske kanale bez posrednika.
        </p>
        <p>
          Primjerice, dok u klasičnoj parfumeriji cijena parfema od 100 ml iznosi 200 €, naš optimizirani lanac nabave i raspodjela kroz formate od 2ml, 5ml, 10ml i 20ml omogućuju nam da istu količinu pretočenog mirisa ponudimo za ukupno oko 140 €, radeći na velikom volumenu umjesto na visokim pojedinačnim maržama.
        </p>
      </Section>

      <Section number={3} title="Zašto ne nudite plaćanje pouzećem (COD)?">
        <p>
          Kako bismo osigurali najnižu moguću cijenu dostave i maksimalnu brzinu obrade, automatizirali smo naš sustav naplate. Plaćanje pouzećem znatno poskupljuje uslugu dostave zbog bankovnih i kurirskih naknada za manipulaciju gotovinom.
        </p>
        <p>
          Izbacivanjem pouzeća štitimo i vaš novčanik od skrivenih troškova. Naše kartično plaćanje i uplate putem sigurnih digitalnih linkova (Revolut / M-Banking) osigurani su najvišim standardima enkripcije i jamče vam 100% sigurnu kupnju.
        </p>
      </Section>

      <Section number={4} title="Koliko traje dostava i kako mogu pratiti paket?">
        <p>
          Sve narudžbe zaprimljene do 14:00 šaljemo isti dan. Dostava preko BoxNow paketomata traje 1–2 radna dana. Nakon što paket predamo kurirskoj službi, na vaš email i mobitel stiže kôd za preuzimanje kojim možete pratiti lokaciju paketa u stvarnom vremenu.
        </p>
        <p>
          Također, praćenje narudžbe moguće je putem naše stranice <Link to="/pracenje" className="text-[#c9a96e] hover:underline">Praćenje narudžbe</Link> — dovoljno je unijeti broj narudžbe i email.
        </p>
      </Section>

      <Section number={5} title="Jesu li parfemi originalni?">
        <p>
          Da, svi parfemi su 100% originalni i toče se direktno iz autentičnih flakona nabavljenih preko ovlaštenih kanala. Svaki dekant nosi isti miris, trajnost i kvalitetu kao i proizvod iz luksuzne parfumerije.
        </p>
        <p>
          Naša usluga dekantiranja omogućuje vam da isprobate više različitih mirisa bez ulaganja u punu bočicu — idealno za otkrivanje novih favorita ili putovanja.
        </p>
      </Section>

      <Section number={6} title="Koje veličine dekanta nudite?">
        <p>
          Nudimo četiri standardne veličine: 2ml ( testerski uzorak ), 5ml ( putno pakiranje ), 10ml ( mjesečna količina ) i 20ml ( premium pakiranje ). Svi dekanti pakirani su u kvalitetne staklene bočice s raspršivačem za preciznu i higijensku upotrebu.
        </p>
      </Section>
    </PolicyLayout>
  );
}

export function PrivacyPage() {
  return (
    <PolicyLayout title="Pravila privatnosti" subtitle="Privatnost" icon={<Shield size={18} />}>
      <Section number={1} title="Podaci koje prikupljamo">
        <p>
          Prilikom narudžbe prikupljamo samo nužne podatke potrebne za dostavu paketa: vaše ime i prezime, broj mobitela, e-mail adresu i odabranu lokaciju paketomata.
        </p>
        <p>
          Prilikom registracije na web stranicu prikupljamo ime, prezime, email adresu i lozinku. Lozinka se pohranjuje u kriptiranom obliku i mi joj nemamo pristup.
        </p>
      </Section>

      <Section number={2} title="Sigurnost plaćanja">
        <p>
          Sve financijske transakcije obavljaju se izvan našeg poslužitelja, putem zaštićenih i kriptiranih vanjskih platformi za plaćanje (Revolut / digitalni platni nalozi). Dekanti.hr niti u jednom trenutku nema pristup podacima s vaše kartice niti ih pohranjuje.
        </p>
        <p>
          Sva komunikacija između vašeg uređaja i našeg poslužitelja zaštićena je SSL enkripcijom (HTTPS), što jamči da vaši osobni podaci ne mogu biti presretnuti trećim stranama.
        </p>
      </Section>

      <Section number={3} title="Dijeljenje podataka s trećim stranama">
        <p>
          Vaše podatke (ime, mobitel) dijelimo isključivo s dostavnom službom (HP Pošta24) kako bi vam se mogao generirati kod za preuzimanje paketa. Podaci se nikada neće prodavati ili dijeliti s marketinškim agencijama.
        </p>
        <p>
          U slučaju slanja newslettera koristimo sigurne servise za masovno slanje emaila koji su usklađeni s GDPR regulativom. U svakom trenutku možete se odjaviti s liste pretplatnika klikom na link u emailu.
        </p>
      </Section>

      <Section number={4} title="Vaša prava">
        <p>
          Sukladno Općoj uredbi o zaštiti podataka (GDPR), imate pravo na pristup, ispravak, brisanje i prenosivost vaših osobnih podataka. Također imate pravo prigovora na obradu i pravo ograničenja obrade.
        </p>
        <p>
          Za ostvarivanje bilo kojeg od navedenih prava, kontaktirajte nas putem emaila <span className="text-[#c9a96e]">info@dekanti.hr</span>. Odgovaramo u roku od 30 dana.
        </p>
      </Section>

      <Section number={5} title="Kolačići (Cookies)">
        <p>
          Naša web stranica koristi isključivo nužne kolačiće za ispravan rad košarice, sustava prijave i sigurnosti. Ne koristimo kolačiće za praćenje ponašanja niti profiliranje korisnika za marketinške svrhe.
        </p>
      </Section>
    </PolicyLayout>
  );
}

export function RefundPage() {
  return (
    <PolicyLayout title="Povrat novca i reklamacije" subtitle="Povrat" icon={<RotateCcw size={18} />}>
      <Section number={1} title="Oštećenje prilikom transporta">
        <p>
          Ako je staklena bočica dekanata stigla razbijena ili napuknuta, potrebno nam je poslati fotografiju paketa na naš e-mail <span className="text-[#c9a96e]">info@dekanti.hr</span> ili Instagram podršku u roku od 24 sata od preuzimanja s paketomata.
        </p>
        <p>
          U tom slučaju šaljemo novi paket o našem trošku ili vršimo puni povrat novca na isti način plaćanja koji ste koristili prilikom kupnje.
        </p>
      </Section>

      <Section number={2} title="Krivi proizvod">
        <p>
          Ako vam je greškom isporučen krivi miris ili kriva mililitraža od one koju ste naručili, poslat ćemo vam ispravan proizvod bez ikakvih dodatnih troškova. U slučaju da proizvod više nije dostupan na zalihama, nudimo zamjenu za proizvod iste vrijednosti ili puni povrat novca.
        </p>
        <p>
          Kontaktirajte nas unutar 14 dana od primitka paketa kako bismo mogli brzo riješiti situaciju.
        </p>
      </Section>

      <Section number={3} title="Otvoreni proizvodi">
        <p>
          Sukladno Zakonu o zaštiti potrošača, povrat novca za parfemske dekante koji su ispravno isporučeni, a koji su otvoreni i korišteni (isprobani), nije moguć zbog narušavanja higijenskog integriteta proizvoda.
        </p>
        <p>
          Svaki naš miris toči se u sterilnim uvjetima neposredno prije slanja i garantira maksimalnu svježinu. Budući da se radi o kozmetičkom proizvodu koji dolazi u dodir s kožom nakon otvaranja, ne možemo ga ponovno prodati niti vratiti u opticaj.
        </p>
      </Section>

      <Section number={4} title="Povrat neotvorenih proizvoda">
        <p>
          Ako proizvod nije otvaran i želite ga vratiti, imate pravo na povrat u roku od 14 dana od primitka paketa. Proizvod mora biti u originalnom stanju, neotvoren i neoštećen.
        </p>
        <p>
          Troškove povrata snosi kupac. Nakon što primimo i pregledamo vraćeni proizvod, povrat novca izvršit ćemo u roku od 14 dana na isti način plaćanja.
        </p>
      </Section>

      <Section number={5} title="Neispravna uplata (krivi iznos)">
        <p>
          Ako je kupac putem Revoluta ili bankovnog transfera uplatio iznos koji se razlikuje od iznosa narudžbe, vrijede sljedeća pravila:
        </p>
        <ul className="space-y-2 mt-2">
          {[
            'Uplata niža od navedenog iznosa: narudžba se ne obrađuje i ne šalje dok se razlika ne doplati. Kupac je dužan kontaktirati nas na info@dekanti.hr s dokazom uplate i brojem narudžbe.',
            'Uplata viša od navedenog iznosa: razlika se ne vraća automatski. Kupac može zatražiti povrat razlike pisanim zahtjevom na info@dekanti.hr u roku od 14 dana od uplate. Povrat se vrši na isti Revolut račun ili IBAN s kojeg je uplata stigla.',
            'Namjerna uplata nižeg iznosa uz tvrdnju da je uplata bila ispravna: smatra se pokušajem prijevare. U tom slučaju narudžba se trajno otkazuje, uplata se ne vraća, a slučaj se može prijaviti nadležnim tijelima.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] mt-2 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3">
          Kupac je klikom na gumb <span className="text-[#c9a96e] font-semibold">"Platio sam — pošalji narudžbu"</span> i označavanjem potvrdnog okvira na stranici za plaćanje izričito potvrdio da je upoznat s ovim uvjetima i da je uplatio točan iznos. Ta potvrda bilježi se u sustavu kao dokaz prihvaćanja uvjeta.
        </p>
      </Section>
    </PolicyLayout>
  );
}

export function TermsPage() {
  return (
    <PolicyLayout title="Uvjeti korištenja" subtitle="Uvjeti" icon={<FileText size={18} />}>
      <Section number={1} title="Opće odredbe">
        <p>
          Ovi uvjeti korištenja reguliraju odnos između dekanti.hr (u daljnjem tekstu: "Platforma", "mi") i korisnika web stranice. Korištenjem naše web stranice potvrđujete da ste pročitali, razumjeli i prihvatili ove uvjete.
        </p>
        <p>
          Platforma zadržava pravo izmjene ovih uvjeta u bilo kojem trenutku. Značajne izmjene bit će objavljene na web stranici i/ili poslane putem emaila.
        </p>
      </Section>

      <Section number={2} title="Narudžbe i plaćanje">
        <p>
          Sve cijene su izražene u eurima (EUR) i uključuju PDV. Troškovi dostave prikazani su odvojeno prije finalizacije narudžbe.
        </p>
        <p>
          Narudžba se smatra zaprimljenom tek nakon uspješnog plaćanja. U slučaju da plaćanje nije uspješno, narudžba se automatski otkazuje nakon 30 minuta.
        </p>
        <p>
          Prihvaćamo sljedeće načine plaćanja: Revolut i digitalne bankovne uplate.
        </p>
      </Section>

      <Section number={3} title="Obveza plaćanja točnog iznosa — Revolut">
        <p>
          Kod plaćanja putem Revoluta, kupac je <span className="text-[#c9a96e] font-semibold">dužan uplatiti točno onaj iznos koji je prikazan na stranici za plaćanje</span> i koji je generiran sustavom narudžbe. Iznos je izražen u eurima (EUR).
        </p>
        <p>
          Svaka uplata koja se razlikuje od navedenog iznosa — bez obzira je li viša ili niža — smatra se <span className="text-[#c9a96e] font-semibold">neispravnom uplatom</span> i povlači sljedeće posljedice:
        </p>
        <ul className="space-y-2 mt-2">
          {[
            'Narudžba neće biti obrađena niti poslana dok se uplata ne uskladi s navedenim iznosom.',
            'Uplata niža od navedenog iznosa neće biti prihvaćena kao valjana — narudžba ostaje u statusu "čeka uplatu" dok se razlika ne doplati.',
            'Uplata viša od navedenog iznosa tretira se kao greška kupca — razlika se ne vraća automatski, već isključivo na pisani zahtjev kupca upućen na info@dekanti.hr.',
            'dekanti.hr ne snosi odgovornost za kašnjenje ili neisporuku narudžbe uzrokovanu neispravnom uplatom.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] mt-2 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3">
          Klikom na gumb <span className="text-[#c9a96e] font-semibold">"Platio sam — pošalji narudžbu"</span> na stranici za plaćanje, kupac potvrđuje da je upoznat s ovim uvjetima i da je uplatio točan iznos naveden u narudžbi. Ova potvrda bilježi se u sustavu zajedno s brojem narudžbe, iznosom i vremenskom oznakom te služi kao dokaz prihvaćanja uvjeta plaćanja.
        </p>
      </Section>

      <Section number={4} title="Dostava">
        <p>
          Dostavu vršimo isključivo putem BoxNow paketomata širom Hrvatske. Cijena dostave iznosi 4,50 € za sve narudžbe. Besplatna dostava na narudžbe iznad 50 €.
        </p>
        <p>
          Rok isporuke je 1–2 radna dana od trenutka predaje paketa kurirskoj službi. U blagdanskim razdobljima rok isporuke može biti duži.
        </p>
      </Section>

      <Section number={5} title="Zalihe i dostupnost">
        <p>
          Svi proizvodi na web stranici dostupni su unutar navedenih zaliha. U rijetkim slučajevima može se dogoditi da je proizvod istovremeno naručen od više kupaca i da zaliha bude iscrpljena prije obrade vaše narudžbe.
        </p>
        <p>
          U slučaju nedostupnosti proizvoda nakon zaprimljene uplate, kontaktirat ćemo vas putem emaila s opcijama: zamjena proizvodom iste vrijednosti, dodavanje kredita na račun ili puni povrat novca.
        </p>
      </Section>

      <Section number={6} title="Odgovornost">
        <p>
          dekanti.hr ne odgovara za eventualne alergijske reakcije na parfemske sastojke. Preporučujemo da prije kupnje provjerite listu sastojaka ako imate poznate alergije.
        </p>
        <p>
          Parfemske note i trajnost mirisa mogu varirati ovisno o PH vrijednosti kože, načinu primjene i klimatskim uvjetima.
        </p>
      </Section>

      <Section number={7} title="Intelektualno vlasništvo">
        <p>
          Svi sadržaji na web stranici (slike, tekstovi, logotipi, dizajn) zaštićeni su autorskim pravima i mogu se koristiti isključivo u osobne, nekomercijalne svrhe.
        </p>
      </Section>
    </PolicyLayout>
  );
}

export function ShippingPage() {
  return (
    <PolicyLayout title="Dostava i isporuka" subtitle="Dostava" icon={<Truck size={18} />}>
      <Section number={1} title="Način dostave">
        <p>
          Sve narudžbe šaljemo isključivo putem HP Pošta24 paketomata — najbrže i najpovoljnije rješenje dostave u Hrvatskoj. Nakon što paket predamo kurirskoj službi, na vaš broj mobitela stiže SMS s kodom za preuzimanje.
        </p>
        <p>
          HP Pošta24 paketomati dostupni su na više od 200 lokacija diljem Hrvatske, a mnogi rade 24/7 što vam omogućuje preuzimanje u vrijeme koje vama najbolje odgovara.
        </p>
      </Section>

      <Section number={2} title="Cijena dostave">
        <p>
          Standardna cijena dostave iznosi <span className="text-[#c9a96e] font-semibold">3,50 €</span> po narudžbi — bez obzira na broj proizvoda ili težinu paketa.
        </p>
        <p>
          Na svim narudžbama iznad <span className="text-[#c9a96e] font-semibold">50 €</span> dostava je <span className="text-[#c9a96e] font-semibold">besplatna</span>.
        </p>
      </Section>

      <Section number={3} title="Rokovi isporuke">
        <p>
          Narudžbe zaprimljene do <span className="text-[#c9a96e]">14:00</span> šaljemo isti dan. Narudžbe zaprimljene nakon 14:00 šaljemo sljedeći radni dan.
        </p>
        <p>
          Rok isporuke nakon predaje paketa kuriru je 1–2 radna dana. Tijekom blagdanskog razdoblja (Božić, Uskrs, ljeto) rokovi mogu biti produženi za 1–2 dana.
        </p>
      </Section>

      <Section number={4} title="Praćenje paketa">
        <p>
          Nakon što paket bude predan kuriru, na vaš email stiže obavijest s poveznicom za praćenje. Također možete pratiti status narudžbe putem naše stranice <Link to="/pracenje" className="text-[#c9a96e] hover:underline">Praćenje narudžbe</Link>.
        </p>
        <p>
          Paket možete pratiti i putem HP Pošta24 aplikacije ili web stranice unosom koda za preuzimanje koji stiže SMS-om.
        </p>
      </Section>

      <Section number={5} title="Neisporučeni paketi">
        <p>
          Ako paket niste preuzeli u roku od 3 dana od dostave u paketomat, vraća se nama. U tom slučaju kontaktirat ćemo vas kako bismo dogovorili ponovno slanje (uz dodatnu naknadu za dostavu) ili povrat novca umanjen za troškove dostave.
        </p>
      </Section>
    </PolicyLayout>
  );
}

export function CookiePage() {
  return (
    <PolicyLayout title="Pravila o kolačićima" subtitle="Kolačići" icon={<Cookie size={18} />}>
      <Section number={1} title="Što su kolačići?">
        <p>
          Kolačići (cookies) su male tekstualne datoteke koje web stranica pohranjuje na vaš uređaj prilikom posjeta. Oni omogućuju web stranici da pamti vaše radnje i preference (kao što su sadržaj košarice, prijava, jezik) tijekom određenog vremenskog razdoblja.
        </p>
      </Section>

      <Section number={2} title="Koje kolačiće koristimo?">
        <p>
          Naša web stranica koristi isključivo nužne kolačiće bez kojih stranica ne može ispravno funkcionirati:
        </p>
        <ul className="space-y-2 mt-2">
          {[
            'Košarica — pamti proizvode koje ste dodali u košaricu',
            'Sesija prijave — održava vašu prijavu tijekom pregledavanja',
            'Sigurnost — zaštita od CSRF napada',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] mt-2 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section number={3} title="Ne koristimo praćenje">
        <p>
          Važno napomenuti da <span className="text-[#c9a96e] font-semibold">ne koristimo</span> analitičke kolačiće (Google Analytics), marketing kolačiće (Facebook Pixel) niti bilo kakve druge kolačiće za praćenje vašeg ponašanja ili profiliranje.
        </p>
        <p>
          Vaša privatnost nam je prioritet, zato smo se odlučili za minimalnu upotrebu kolačića — samo onih bez kojih stranica ne može funkcionirati.
        </p>
      </Section>

      <Section number={4} title="Upravljanje kolačićima">
        <p>
          Većina web preglednika automatski prihvaća kolačiće, ali vi ih možete blokirati ili obrisati u postavkama preglednika. Napominjemo da onemogućavanje nužnih kolačića može uzrokovati neispravan rad web stranice, posebno košarice i sustava prijave.
        </p>
      </Section>
    </PolicyLayout>
  );
}

export function ContactPage() {
  return (
    <PolicyLayout title="Kontakt" subtitle="Kontakt" icon={<HelpCircle size={18} />}>
      <Section number={1} title="Email podrška">
        <p>
          Za sva pitanja vezana uz narudžbe, proizvode, dostavu i reklamacije slobodno nam se obratite putem emaila:
        </p>
        <p className="text-[#c9a96e] font-semibold text-lg mt-2">info@dekanti.hr</p>
        <p className="text-sm">Odgovaramo u roku od 24 sata na radne dane.</p>
      </Section>

      <Section number={2} title="Instagram">
        <p>
          Najbrži način za neformalni kontakt, DM i pregled noviteta:
        </p>
        <p className="text-[#c9a96e] font-semibold text-lg mt-2">@dekanti.hr</p>
      </Section>

      <Section number={3} title="Radno vrijeme podrške">
        <p>
          Naš tim za korisničku podršku dostupan je:
        </p>
        <ul className="space-y-2 mt-2">
          {[
            'Ponedjeljak — Petak: 09:00 – 17:00',
            'Subota: 10:00 – 14:00',
            'Nedjelja i blagdani: Ne radimo',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] mt-2 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section number={4} title="Adresa">
        <p>
          dekanti.hr je isključivo online platforma i nemamo fizičku maloprodaju. Sve narudžbe šaljemo putem HP Pošta24 paketomata.
        </p>
        <p className="text-sm mt-2">
          Sjedište tvrtke: Zagreb, Hrvatska
        </p>
      </Section>
    </PolicyLayout>
  );
}
