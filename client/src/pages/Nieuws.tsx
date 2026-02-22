import { Link } from "wouter";
import logoPath from "@assets/logo.png";
import { Menu, X } from "lucide-react";
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

export default function NieuwsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/news").then((r) => r.json()),
      fetch("/api/news-categories").then((r) => r.json()),
    ]).then(([arts, cats]) => {
      setArticles(arts);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  const filtered = activeCategory === "all"
    ? articles
    : articles.filter((a) => a.category?.slug === activeCategory);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F7FAEE] flex flex-col" data-testid="page-nieuws">
      <Header />
      <div className="pt-20" />

      <section className="bg-[#96AB50] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading" data-testid="text-nieuws-heading">
            Nieuws
          </h1>
          <p className="text-white/80 mt-2 text-lg">Het laatste nieuws van Van Heerikhuize Architectuur</p>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {categories.length > 0 && (
          <div className="flex gap-2 mb-8 flex-wrap" data-testid="news-category-filter">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 text-sm font-semibold tracking-wide transition-colors ${
                activeCategory === "all"
                  ? "bg-[#96AB50] text-white"
                  : "bg-white text-[#555] border border-gray-300 hover:border-[#96AB50]"
              }`}
              data-testid="filter-all"
            >
              Alles
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-2 text-sm font-semibold tracking-wide transition-colors ${
                  activeCategory === cat.slug
                    ? "bg-[#96AB50] text-white"
                    : "bg-white text-[#555] border border-gray-300 hover:border-[#96AB50]"
                }`}
                data-testid={`filter-${cat.slug}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-[#777]">Laden...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12" data-testid="text-no-news">
            <p className="text-[#777] text-lg">Nog geen nieuwsberichten beschikbaar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((article) => (
              <Link
                key={article.id}
                href={`/nieuws/${article.id}`}
                className="bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                data-testid={`card-news-${article.id}`}
              >
                <div className="h-52 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  {article.category && (
                    <span className="text-[10px] font-semibold uppercase px-2 py-1 bg-[#F7FAEE] text-[#96AB50] tracking-wider" data-testid={`badge-cat-${article.id}`}>
                      {article.category.name}
                    </span>
                  )}
                  <h3 className="font-bold text-[#333] mt-2 mb-2 font-heading group-hover:text-[#96AB50] transition-colors" data-testid={`text-news-title-${article.id}`}>
                    {article.title}
                  </h3>
                  <p className="text-xs text-[#999]">{formatDate(article.createdAt)}</p>
                  {article.content && (
                    <p className="text-sm text-[#666] mt-2 line-clamp-3">{article.content}</p>
                  )}
                  <span className="inline-block mt-3 text-sm text-[#96AB50] font-semibold">
                    Lees meer →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
