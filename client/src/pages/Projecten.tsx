import { Link } from "wouter";
import logoPath from "@assets/logo.png";
import wonenImg from "@assets/2021-001_3_1773837065330.jpg";
import werkenImg from "@assets/IMG_2141_1773837079977.jpg";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { label: "HOME", href: "/" },
  { label: "PROJECTEN", href: "/projecten" },
  { label: "OVER", href: "/#over" },
  { label: "NIEUWS", href: "/#nieuws" },
  { label: "CONTACT", href: "/#contact" },
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
        scrolled ? "bg-white/95 backdrop-blur shadow-md" : "bg-white shadow-sm"
      }`}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link href="/" className="flex-shrink-0" data-testid="link-logo">
          <img src={logoPath} alt="Van Heerikhuize Architectuur" className="h-14 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-1" data-testid="nav-desktop">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-[#333] tracking-wide hover:text-[#96AB50] transition-colors font-heading"
              data-testid={`link-nav-${item.label.toLowerCase()}`}
            >
              {item.label}
            </Link>
          ))}
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
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block px-6 py-3 text-sm font-medium text-[#333] hover:bg-[#F7FAEE] hover:text-[#96AB50] transition-colors"
              onClick={() => setMobileOpen(false)}
              data-testid={`link-mobile-${item.label.toLowerCase()}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#333] text-white py-8" data-testid="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">Van Heerikhuize Architectuur - Architecten & Bouwadviseurs</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-[#96AB50] transition-colors" data-testid="link-footer-privacy">Privacyverklaring</Link>
            <Link href="/algemene-voorwaarden" className="text-sm text-gray-400 hover:text-[#96AB50] transition-colors" data-testid="link-footer-av">Algemene Voorwaarden</Link>
          </div>
          <p className="text-sm text-gray-500">© 2025 Alle rechten voorbehouden</p>
        </div>
      </div>
    </footer>
  );
}

const CATEGORIES = [
  {
    title: "Wonen",
    href: "/projecten/wonen",
    image: wonenImg,
  },
  {
    title: "Werken",
    href: "/projecten/werken",
    image: werkenImg,
  },
  {
    title: "Interieur",
    href: "/projecten/interieur",
    image: "/images/interieur/project-1.jpg",
  },
];

export default function ProjectenPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" data-testid="page-projecten">
      <Header />
      <div className="pt-20">
        <section className="py-16 bg-[#F7FAEE]" data-testid="section-projecten">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-[#333] mb-4 font-heading" data-testid="text-projecten-title">
              Projecten
            </h1>
            <p className="text-[#555] text-[15px] mb-12" data-testid="text-projecten-subtitle">
              U vindt hier een overzicht van onze projecten.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className="group relative block overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  data-testid={`card-category-${cat.title.toLowerCase()}`}
                >
                  <div className="relative h-[350px]">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-end p-6">
                      <h2 className="text-2xl font-bold text-white font-heading tracking-wide">
                        {cat.title}
                      </h2>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white" data-testid="section-contact-cta">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-[#333] mb-4 font-heading">Neem contact op</h2>
            <p className="text-[#555] mb-8 text-[15px]">
              Heeft u (ver)bouwplannen? Neem gerust vrijblijvend contact op.
            </p>
            <Link
              href="/#contact"
              className="inline-block bg-[#96AB50] text-white px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-[#829745] transition-colors"
              data-testid="button-contact-cta"
            >
              Contact
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
