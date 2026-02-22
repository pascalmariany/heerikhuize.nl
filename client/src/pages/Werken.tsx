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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur shadow-md" : "bg-white shadow-sm"}`} data-testid="header">
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
          <div className="flex items-center gap-6 flex-wrap">
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} href={item.href} className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wider" data-testid={`link-footer-${item.label.toLowerCase()}`}>{item.label}</Link>
            ))}
            <Link href="/admin/login" className="text-xs text-gray-600 hover:text-gray-400 transition-colors" data-testid="link-hq">Heerikhuize HQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

type Project = { id: number; title: string; category: string; image: string; sortOrder: number };

export default function WerkenPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch("/api/projects/werken")
      .then((r) => r.json())
      .then((data) => { setProjects(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" data-testid="page-werken">
      <Header />
      <div className="pt-20">
        <section className="py-16 bg-[#F7FAEE]" data-testid="section-werken">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/projecten" className="inline-flex items-center gap-2 text-sm text-[#96AB50] hover:text-[#829745] transition-colors mb-8 font-medium" data-testid="link-back-projecten">
              <ArrowLeft size={16} />Terug naar Projecten
            </Link>
            <h1 className="text-4xl font-bold text-[#333] mb-12 font-heading" data-testid="text-werken-title">Werken</h1>
            {loading ? (
              <div className="text-center py-12 text-[#777]">Laden...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                  <div key={project.id} className="group bg-white shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden" data-testid={`card-project-${project.id}`}>
                    <div className="overflow-hidden h-56">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-[#333] text-[15px] leading-snug mb-3 font-heading" data-testid={`text-project-title-${project.id}`}>{project.title}</h3>
                      <Link href={`/project/${project.id}`} className="text-[#96AB50] text-sm font-medium hover:text-[#829745] transition-colors" data-testid={`link-lees-meer-${project.id}`}>Lees meer…</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
