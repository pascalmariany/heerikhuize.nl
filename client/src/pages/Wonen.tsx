import { Link } from "wouter";
import logoPath from "@assets/logo.png";
import { Menu, X, ArrowLeft } from "lucide-react";
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
          <p className="text-sm text-gray-400">
            Van Heerikhuize Architectuur - Architecten & Bouwadviseurs
          </p>
          <div className="flex items-center gap-6 flex-wrap">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                data-testid={`link-footer-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

const PROJECTS = [
  {
    id: 1,
    title: "Uitbreiding jaren 30 woning in Bennekom",
    image: "/images/wonen/project-1.jpg",
  },
  {
    id: 2,
    title: "Nieuwbouw woning en B&B met bijgebouw Voorthuizen",
    image: "/images/wonen/project-2.jpg",
  },
  {
    id: 3,
    title: "Jaren 50 woning uitbreiden en verduurzamen in Ede",
    image: "/images/wonen/project-3.jpg",
  },
  {
    id: 4,
    title: "Verbouwing en uitbreiding woning met bijgebouw Voorthuizen",
    image: "/images/wonen/project-4.jpg",
  },
  {
    id: 5,
    title: "Verbouwing en uitbreiding woning Otterlo",
    image: "/images/wonen/project-5.jpg",
  },
  {
    id: 6,
    title: "Nieuwbouw woning en schuur Baron van Nagellstraat Voorthuizen",
    image: "/images/wonen/project-6.jpg",
  },
  {
    id: 7,
    title: "Nieuwbouw bosvilla Muiderbos Almere",
    image: "/images/wonen/project-7.jpg",
  },
  {
    id: 8,
    title: "Nieuwbouw woning met bijgebouw Hessenweg Lunteren",
    image: "/images/wonen/project-8.jpg",
  },
  {
    id: 9,
    title: "Verbouwing woning Bennekom",
    image: "/images/wonen/project-9.jpg",
  },
  {
    id: 10,
    title: "Uitbreiding bungalow Voorthuizen",
    image: "/images/wonen/project-10.jpg",
  },
  {
    id: 11,
    title: "Uitbreiding jaren 30 woning Heuvelsepad Ede",
    image: "/images/wonen/project-11.jpg",
  },
  {
    id: 12,
    title: "Verbouw woning en schuren Rijksweg Voorthuizen",
    image: "/images/wonen/project-12.jpg",
  },
  {
    id: 13,
    title: "Uitbreiding 2-1 kapwoning Dalerveen Ede",
    image: "/images/wonen/project-13.jpg",
  },
  {
    id: 14,
    title: "Nieuwbouw 20 woningen Oosterwold",
    image: "/images/wonen/project-14.jpg",
  },
  {
    id: 15,
    title: "Uitbreiding jaren 30 woning Ede",
    image: "/images/wonen/project-15.jpg",
  },
  {
    id: 16,
    title: "Nieuwbouw woning Lunteren",
    image: "/images/wonen/project-16.jpg",
  },
  {
    id: 17,
    title: "Herbestemming kazerneterrein Ede",
    image: "/images/wonen/project-17.jpg",
  },
  {
    id: 18,
    title: "Uitbreiding Gevangenismuseum Veenhuizen",
    image: "/images/wonen/project-18.jpg",
  },
  {
    id: 19,
    title: "Verduurzamen wijk Arnhem",
    image: "/images/wonen/project-19.jpg",
  },
];

export default function WonenPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" data-testid="page-wonen">
      <Header />
      <div className="pt-20">
        <section className="py-16 bg-[#F7FAEE]" data-testid="section-wonen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/projecten"
              className="inline-flex items-center gap-2 text-sm text-[#96AB50] hover:text-[#829745] transition-colors mb-8 font-medium"
              data-testid="link-back-projecten"
            >
              <ArrowLeft size={16} />
              Terug naar Projecten
            </Link>

            <h1 className="text-4xl font-bold text-[#333] mb-12 font-heading" data-testid="text-wonen-title">
              Wonen
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {PROJECTS.map((project) => (
                <div
                  key={project.id}
                  className="group bg-white shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                  data-testid={`card-project-${project.id}`}
                >
                  <div className="overflow-hidden h-56">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[#333] text-[15px] leading-snug mb-3 font-heading" data-testid={`text-project-title-${project.id}`}>
                      {project.title}
                    </h3>
                    <span className="text-[#96AB50] text-sm font-medium hover:text-[#829745] transition-colors cursor-pointer" data-testid={`link-lees-meer-${project.id}`}>
                      Lees meer…
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
