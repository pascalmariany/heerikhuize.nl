import { Link, useRoute } from "wouter";
import logoPath from "@assets/logo.png";
import { Menu, X, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { label: "HOME", href: "/" },
  { label: "PROJECTEN", href: "/projecten" },
  { label: "OVER", href: "/#over" },
  { label: "NIEUWS", href: "/nieuws" },
  { label: "CONTACT", href: "/#contact" },
];

type NewsCategory = {
  id: number;
  name: string;
  slug: string;
};

type NewsArticle = {
  id: number;
  title: string;
  content: string;
  image: string;
  categoryId: number | null;
  published: number;
  createdAt: string;
  category: NewsCategory | null;
};

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

export default function NieuwsDetailPage() {
  const [, params] = useRoute("/nieuws/:id");
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/news/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [params?.id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F7FAEE] flex flex-col" data-testid="page-nieuws-detail">
      <Header />
      <div className="pt-20" />

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-[#777] text-lg">Laden...</p>
        </div>
      ) : error || !article ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <p className="text-[#777] text-lg mb-4">Artikel niet gevonden.</p>
          <Link href="/nieuws" className="text-[#96AB50] hover:text-[#829745] font-semibold">
            ← Terug naar nieuws
          </Link>
        </div>
      ) : (
        <>
          <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              data-testid="img-article-hero"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
              <div className="max-w-4xl mx-auto">
                {article.category && (
                  <span className="inline-block text-[11px] font-semibold uppercase px-3 py-1 bg-[#96AB50] text-white tracking-wider mb-3" data-testid="badge-article-category">
                    {article.category.name}
                  </span>
                )}
                <h1 className="text-2xl md:text-4xl font-bold text-white font-heading" data-testid="text-article-title">
                  {article.title}
                </h1>
                <p className="text-white/70 mt-2 text-sm">{formatDate(article.createdAt)}</p>
              </div>
            </div>
          </div>

          <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
            <Link
              href="/nieuws"
              className="inline-flex items-center gap-2 text-[#96AB50] hover:text-[#829745] mb-8 text-sm font-semibold"
              data-testid="link-back-nieuws"
            >
              <ArrowLeft size={16} />
              Terug naar nieuws
            </Link>

            <div className="bg-white p-6 md:p-10 shadow-sm" data-testid="section-article-content">
              {article.content ? (
                <div className="prose prose-sm max-w-none text-[#555] leading-relaxed whitespace-pre-wrap" data-testid="text-article-content">
                  {article.content}
                </div>
              ) : (
                <p className="text-[#999] italic" data-testid="text-no-article-content">
                  Dit artikel heeft nog geen inhoud.
                </p>
              )}
            </div>
          </main>
        </>
      )}

      <Footer />
    </div>
  );
}
