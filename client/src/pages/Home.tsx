import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import logoPath from "@assets/logo_transparant_1773836623738.png";
import marioPath from "@assets/favicon.jpg";
import heroImg1 from "@assets/Verbindingsweg_1773836246967.jpg";
import heroImg2 from "@assets/Voorfoto_1773836246967.JPG";
import heroImg3 from "@assets/WhatsApp_Image_2025-05-02_at_22.07.25_(3)_1773836246967.jpeg";
import { Home as HomeIcon, Building2, Palette, MapPin, Phone, Mail, Menu, X, Newspaper } from "lucide-react";
import type { NewsArticle, NewsCategory } from "@shared/schema";

const NAV_ITEMS = [
  { label: "HOME", href: "#home", isRoute: false },
  { label: "PROJECTEN", href: "/projecten", isRoute: true },
  { label: "OVER", href: "#over", isRoute: false },
  { label: "NIEUWS", href: "/nieuws", isRoute: true },
  { label: "CONTACT", href: "#contact", isRoute: false },
];

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur shadow-md" : "bg-white/80 backdrop-blur-sm"
      }`}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <a href="#home" className="flex-shrink-0" data-testid="link-logo">
          <img src={logoPath} alt="Van Heerikhuize Architectuur" className="h-14 w-auto" />
        </a>

        <nav className="hidden md:flex items-center gap-1" data-testid="nav-desktop">
          {NAV_ITEMS.map((item) =>
            item.isRoute ? (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-[#333] tracking-wide hover:text-[#96AB50] transition-colors font-heading"
                data-testid={`link-nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-[#333] tracking-wide hover:text-[#96AB50] transition-colors font-heading"
                data-testid={`link-nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        <button
          className="md:hidden p-2 text-[#333]"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-testid="button-mobile-menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg" data-testid="nav-mobile">
          {NAV_ITEMS.map((item) =>
            item.isRoute ? (
              <Link
                key={item.label}
                href={item.href}
                className="block px-6 py-3 text-sm font-medium text-[#333] hover:bg-[#F7FAEE] hover:text-[#96AB50] transition-colors"
                onClick={() => setMobileOpen(false)}
                data-testid={`link-mobile-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="block px-6 py-3 text-sm font-medium text-[#333] hover:bg-[#F7FAEE] hover:text-[#96AB50] transition-colors"
                onClick={() => setMobileOpen(false)}
                data-testid={`link-mobile-${item.label.toLowerCase()}`}
              >
                {item.label}
              </a>
            )
          )}
        </div>
      )}
    </header>
  );
}

const HERO_IMAGES = [
  { src: heroImg1, alt: "Verbindingsweg – woonproject" },
  { src: heroImg2, alt: "Bedrijfspand – werkproject" },
  { src: heroImg3, alt: "Aanbouw – interieurproject" },
];

function HeroSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  return (
    <section id="home" className="relative w-full" data-testid="section-hero">
      <div className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {HERO_IMAGES.map((img, i) => (
              <div key={i} className="relative flex-[0_0_100%] h-full">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20" data-testid="carousel-dots">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              data-testid={`carousel-dot-${i}`}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === selectedIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Ga naar afbeelding ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="relative -mt-40 z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ServiceCard
            icon={<HomeIcon size={40} className="text-[#96AB50]" />}
            title="Wonen"
            description="Nieuwbouw en verbouw van woningen; van modern, jaren 30 tot landelijke stijl. Een brede ervaring, zodat maatwerk een tweede natuur is."
          />
          <ServiceCard
            icon={<Building2 size={40} className="text-[#96AB50]" />}
            title="Werken"
            description="Nieuwbouw en verbouw van utiliteitpanden; kantoren tot bedrijfshallen en van winkels tot agrarische panden."
          />
          <ServiceCard
            icon={<Palette size={40} className="text-[#96AB50]" />}
            title="Interieur"
            description="3 dimensionaal interieur ontwerp en Virtual Reality, waarin u kunt rondlopen en rondkijken. Een beleving die u niet snel zult vergeten."
          />
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="bg-white/90 backdrop-blur-sm p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
      data-testid={`card-service-${title.toLowerCase()}`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-[#333] uppercase tracking-wider mb-4 font-heading">
        {title}
      </h3>
      <p className="text-sm text-[#555] leading-relaxed mb-6">
        {description}
      </p>
      <a
        href="#diensten"
        className="inline-block bg-[#96AB50] text-white px-8 py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-[#829745] transition-colors"
        data-testid={`button-meer-${title.toLowerCase()}`}
      >
        Meer
      </a>
    </div>
  );
}

function AboutSection() {
  return (
    <section id="over" className="py-20 bg-[#F7FAEE]" data-testid="section-about">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative">
            <div className="relative overflow-hidden">
              <img
                src={marioPath}
                alt="Mario van Heerikhuize"
                className="w-full max-w-md mx-auto object-cover grayscale"
              />
            </div>
            <div className="mt-4 text-center">
              <h4 className="text-sm font-semibold text-[#333] font-heading">
                Mario van Heerikhuize
              </h4>
              <p className="text-xs text-[#777] italic mt-1">
                Mario ontwerpt de wens van de klant steeds verder in detail
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#333] mb-6 font-heading">
              Van Heerikhuize Architectuur
            </h2>
            <div className="space-y-4 text-[#555] text-[15px] leading-relaxed">
              <p>
                Een architectenbureau dat u volledig ontzorgt, maar wel met één aanspreekpunt.
                Mario van Heerikhuize ontwerpt de wens van de klant steeds verder in detail, om dit
                vervolgens in de uitvoering tot bloei te zien komen.
              </p>
              <p>
                Na vijftien jaar in de architectenbranche gewerkt te hebben, is Mario van
                Heerikhuize zijn hart achteraan gegaan en begon hij volledig voor zichzelf. De
                passie van de architect, die bouwkunde van huis uit heeft meegekregen, ligt zowel
                bij nieuwbouw als verbouw.
              </p>
              <p>
                U kunt bij Van Heerikhuize Architectuur terecht als particulier, als zakelijke
                klant, voor nieuw- of verbouw van woningen, zakelijke of agrarische panden. Heeft u
                (ver)bouwplannen? Neem gerust vrijblijvend contact op, dan denken wij graag met u
                mee.
              </p>
              <p className="font-medium">Ons bureau is gevestigd in Ede.</p>
            </div>
            <a
              href="#contact"
              className="inline-block mt-8 bg-[#96AB50] text-white px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-[#829745] transition-colors"
              data-testid="button-contact-cta"
            >
              Neem contact op
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function TabsSection() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label: "Werkzaamheden",
      image: "/images/werkzaamheden.jpg",
      content:
        "Van de eerste schets van wensen en ideeën van de klant, tot de bouwaanvraag en het tekenwerk voor de uitvoering — wij kunnen het gehele traject verzorgen om zo tot een goed bouwplan te komen. Onze werkwijze is transparant en gestructureerd, zodat u op elk moment weet waar u aan toe bent.\n\nDaarnaast onderhouden we het contact met gemeenten en andere betrokken partijen, zodat de bouwaanvraag soepel en zonder vertraging verloopt. Het resultaat: een doordacht, uitvoerbaar plan dat aansluit bij uw visie én voldoet aan alle technische en wettelijke eisen.",
    },
    {
      label: "Werkwijze",
      image: "/images/werkwijze.jpg",
      content:
        "Persoonlijk contact is bij Van Heerikhuize Architectuur gewaarborgd, waardoor onnodige kosten worden voorkomen. Door samenwerking met andere specialisten, heeft het architectenbureau een groot team met aanvullende expertise en slagkracht achter zich staan. Hierdoor kunnen wij elke uitdaging aan, zonder het persoonlijke contact te verliezen.\n\nOm het overzicht te behouden en een goede onderlinge afstemming binnen grotere projecten te realiseren, werken wij met BIM. Dit Bouw Informatie Model houd in dat de verschillende betrokken partijen met elkaars informatie werken voor een optimaal resultaat.\n\nOm een ieder een goed beeld te geven van het plan wordt er gewerkt in de verschillende fases met 3D visualisaties en maquettes.",
    },
    {
      label: "Duurzaamheid",
      image: "/images/duurzaamheid.jpg",
      content:
        "Bij ons is duurzaamheid een fundamentele kernwaarde. Ons doel is om meerwaarde te creëren voor u. Dit kan door duurzaam te ontwerpen in combinatie met de juiste installatie. Maar misschien nog wel meer door een hoogwaardige ontwerp te realiseren die lang mee gaat en qua architectuur onmisbaar wordt voor zijn omgeving.\n\nDaarnaast werken wij aan het bereiken van de nieuwe economie: klimaatneutraal, circulair, inclusief en met transparante ketens. Vandaar dat wij partner zijn van MVO Nederland.",
    },
  ];

  return (
    <section id="diensten" className="py-20 bg-white" data-testid="section-tabs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap border-b border-gray-200 mb-8">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-3 text-sm font-semibold tracking-wide transition-colors font-heading ${
                activeTab === i
                  ? "text-[#96AB50] border-b-2 border-[#96AB50]"
                  : "text-[#777] hover:text-[#333]"
              }`}
              data-testid={`button-tab-${tab.label.toLowerCase()}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="overflow-hidden">
            <img
              src={tabs[activeTab].image}
              alt={tabs[activeTab].label}
              className="w-full h-[350px] object-cover"
              data-testid="img-tab-content"
            />
          </div>
          <div
            className="text-[#555] text-[15px] leading-relaxed whitespace-pre-line"
            data-testid="text-tab-content"
          >
            {tabs[activeTab].content}
          </div>
        </div>
      </div>
    </section>
  );
}

type NewsArticleWithCategory = NewsArticle & { category: NewsCategory | null };

function NieuwsSection() {
  const { data: articles, isLoading } = useQuery<NewsArticleWithCategory[]>({
    queryKey: ["/api/news"],
  });

  const latest = articles?.slice(0, 3) ?? [];

  return (
    <section id="nieuws" className="py-20 bg-white" data-testid="section-nieuws">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#333] text-center mb-4 font-heading">
          Nieuws
        </h2>
        <p className="text-center text-[#777] mb-12 max-w-2xl mx-auto text-[15px]">
          Blijf op de hoogte van de laatste ontwikkelingen bij Van Heerikhuize Architectuur.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse" data-testid={`skeleton-nieuws-${i}`}>
                <div className="bg-gray-200 h-52 mb-4" />
                <div className="bg-gray-200 h-3 w-1/3 mb-2 rounded" />
                <div className="bg-gray-200 h-5 w-3/4 mb-2 rounded" />
                <div className="bg-gray-200 h-3 w-full rounded" />
              </div>
            ))}
          </div>
        ) : latest.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="nieuws-leeg">
            <Newspaper size={48} className="text-gray-300 mb-4" />
            <p className="text-[#777] text-[15px]">
              Er zijn nog geen nieuwsberichten geplaatst.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latest.map((article) => (
              <Link key={article.id} href={`/nieuws/${article.id}`} className="group block" data-testid={`card-nieuws-${article.id}`}>
                <div className="overflow-hidden mb-4">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {article.category && (
                  <p className="text-xs text-[#96AB50] font-semibold uppercase tracking-wider mb-2">
                    {article.category.name}
                  </p>
                )}
                <h4 className="font-bold text-[#333] font-heading mb-2 group-hover:text-[#96AB50] transition-colors">
                  {article.title}
                </h4>
                {article.content && (
                  <p className="text-sm text-[#555] leading-relaxed line-clamp-3">
                    {article.content.replace(/<[^>]*>/g, "")}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}

        {!isLoading && latest.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/nieuws"
              className="inline-block border border-[#96AB50] text-[#96AB50] px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-[#96AB50] hover:text-white transition-colors"
              data-testid="link-meer-nieuws"
            >
              Alle nieuwsberichten
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function ContactSection() {
  const [formData, setFormData] = useState({ email: "", naam: "", bericht: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus("sent");
        setFormData({ email: "", naam: "", bericht: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="py-20 bg-[#F7FAEE]" data-testid="section-contact">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <div className="space-y-8">
              <div className="flex items-start gap-4" data-testid="contact-locatie">
                <div className="w-10 h-10 bg-[#96AB50] flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-white" />
                </div>
                <div>
                  <h5 className="font-bold text-[#333] text-sm uppercase tracking-wider font-heading mb-1">
                    Locatie
                  </h5>
                  <p className="text-[#555] text-sm">Kolkakkerweg 76</p>
                  <p className="text-[#555] text-sm">6713 DE EDE</p>
                </div>
              </div>

              <div className="flex items-start gap-4" data-testid="contact-telefoon">
                <div className="w-10 h-10 bg-[#96AB50] flex items-center justify-center flex-shrink-0">
                  <Phone size={20} className="text-white" />
                </div>
                <div>
                  <h5 className="font-bold text-[#333] text-sm uppercase tracking-wider font-heading mb-1">
                    Telefoon
                  </h5>
                  <p className="text-[#555] text-sm">06 17 67 60 13</p>
                </div>
              </div>

              <div className="flex items-start gap-4" data-testid="contact-email">
                <div className="w-10 h-10 bg-[#96AB50] flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-white" />
                </div>
                <div>
                  <h5 className="font-bold text-[#333] text-sm uppercase tracking-wider font-heading mb-1">
                    Email
                  </h5>
                  <p className="text-[#555] text-sm">info@heerikhuize.nl</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <iframe
                title="Locatie Van Heerikhuize Architectuur"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2452.5!2d5.6585469!3d52.0384159!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c7ad4b6ac15a95%3A0x550bf925e7d71612!2sKolkakkerweg%2076%2C%206713%20DE%20Ede!5e0!3m2!1snl!2snl!4v1700000000000"
                className="w-full h-[250px] border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                data-testid="map-embed"
              />
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-[#333] mb-8 font-heading">Contact</h3>
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-contact">
              <div>
                <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50] transition-colors bg-white"
                  data-testid="input-email"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">
                  Naam
                </label>
                <input
                  type="text"
                  required
                  value={formData.naam}
                  onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50] transition-colors bg-white"
                  data-testid="input-naam"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">
                  Bericht
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.bericht}
                  onChange={(e) => setFormData({ ...formData, bericht: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50] transition-colors resize-none bg-white"
                  data-testid="input-bericht"
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="bg-[#96AB50] text-white px-10 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-[#829745] transition-colors disabled:opacity-60"
                data-testid="button-verzenden"
              >
                {status === "sending" ? "Verzenden..." : "Verzenden"}
              </button>

              {status === "sent" && (
                <p className="text-[#96AB50] text-sm font-medium" data-testid="text-success">
                  Bedankt! Je bericht is verstuurd.
                </p>
              )}
              {status === "error" && (
                <p className="text-red-500 text-sm font-medium" data-testid="text-error">
                  Niet mogelijk om je bericht te sturen. Controleer de fouten en probeer opnieuw a.u.b.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#333] text-white py-8" data-testid="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            Van Heerikhuize Architectuur - Architecten & Bouwadviseurs
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-[#96AB50] transition-colors" data-testid="link-footer-privacy">Privacyverklaring</Link>
            <Link href="/algemene-voorwaarden" className="text-sm text-gray-400 hover:text-[#96AB50] transition-colors" data-testid="link-footer-av">Algemene Voorwaarden</Link>
            <Link href="/admin/login" className="text-sm text-gray-400 hover:text-[#96AB50] transition-colors" data-testid="link-footer-hq">Heerikhuize HQ</Link>
          </div>
          <p className="text-sm text-gray-500">© 2025 Alle rechten voorbehouden</p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen" data-testid="page-home">
      <Header />
      <HeroSection />
      <AboutSection />
      <TabsSection />
      <NieuwsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
