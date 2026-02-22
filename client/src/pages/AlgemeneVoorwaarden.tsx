import { Link } from "wouter";
import logoPath from "@assets/logo.png";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { FileDown } from "lucide-react";

const NAV_ITEMS = [
  { label: "HOME", href: "/" },
  { label: "PROJECTEN", href: "/projecten" },
  { label: "OVER", href: "/#over" },
  { label: "NIEUWS", href: "/nieuws" },
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
            <Link key={item.label} href={item.href} className="px-4 py-2 text-sm font-medium text-[#333] tracking-wide hover:text-[#96AB50] transition-colors font-heading" data-testid={`link-nav-${item.label.toLowerCase()}`}>{item.label}</Link>
          ))}
        </nav>
        <button className="md:hidden p-2 text-[#333]" onClick={() => setMobileOpen(!mobileOpen)} data-testid="button-mobile-menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg" data-testid="nav-mobile">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className="block px-6 py-3 text-sm font-medium text-[#333] hover:bg-[#F7FAEE] hover:text-[#96AB50] transition-colors" onClick={() => setMobileOpen(false)} data-testid={`link-mobile-${item.label.toLowerCase()}`}>{item.label}</Link>
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
          <p className="text-sm text-gray-500">© 2025 Alle rechten voorbehouden</p>
        </div>
      </div>
    </footer>
  );
}

export default function AlgemeneVoorwaardenPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7FAEE] flex flex-col" data-testid="page-algemene-voorwaarden">
      <Header />
      <div className="pt-20" />

      <section className="bg-[#96AB50] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading" data-testid="text-av-heading">
            Algemene Voorwaarden
          </h1>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white p-6 md:p-10 shadow-sm space-y-6" data-testid="section-av-content">

          <p className="text-[#555] text-sm leading-relaxed">
            Op onze werkzaamheden is <strong>De Nieuwe Regeling (DNR) 2011</strong> van toepassing. Deze regelt de rechtsverhouding tussen de opdrachtgever en adviseur (architect, ingenieur).
          </p>

          <p className="text-[#555] text-sm leading-relaxed">
            Voor de inhoud van de DNR kunt u het document hieronder downloaden:
          </p>

          <a
            href="https://www.heerikhuize.nl/wp-content/uploads/2022/02/Rechtsverhouding-DNR2011-juli2013-NED.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#96AB50] text-white px-6 py-3 text-sm font-semibold hover:bg-[#829745] transition-colors"
            data-testid="link-download-dnr"
          >
            <FileDown size={18} />
            Rechtsverhouding DNR 2011 (PDF) downloaden
          </a>

        </div>
      </main>

      <Footer />
    </div>
  );
}
