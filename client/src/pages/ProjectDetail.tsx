import { Link, useRoute } from "wouter";
import logoPath from "@assets/logo_transparant_1773836623738.png";
import { Menu, X, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
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
            <Link href="/admin/login" className="text-sm text-gray-400 hover:text-[#96AB50] transition-colors" data-testid="link-footer-hq">Heerikhuize HQ</Link>
          </div>
          <p className="text-sm text-gray-500">© 2025 Alle rechten voorbehouden</p>
        </div>
      </div>
    </footer>
  );
}

type ProjectImage = { id: number; image: string; sortOrder: number };
type ProjectData = {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string | null;
  images: ProjectImage[];
};

const CATEGORY_LABELS: Record<string, string> = {
  wonen: "Wonen",
  werken: "Werken",
  interieur: "Interieur",
};

export default function ProjectDetailPage() {
  const [, params] = useRoute("/project/:id");
  const projectId = params?.id;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!projectId) return;
    fetch(`/api/project/${projectId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setProject(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  const allImages = project
    ? [{ id: 0, image: project.image, sortOrder: -1 }, ...project.images]
    : [];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const navigateLightbox = (dir: number) => {
    setLightboxIndex((prev) => (prev + dir + allImages.length) % allImages.length);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigateLightbox(-1);
      if (e.key === "ArrowRight") navigateLightbox(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, allImages.length]);

  if (loading) {
    return (
      <div className="min-h-screen" data-testid="page-project-detail">
        <Header />
        <div className="pt-20">
          <div className="text-center py-24 text-[#777]">Laden...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen" data-testid="page-project-detail">
        <Header />
        <div className="pt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <h1 className="text-2xl font-bold text-[#333] mb-4 font-heading">Project niet gevonden</h1>
            <Link href="/projecten" className="text-[#96AB50] hover:text-[#829745] transition-colors font-medium" data-testid="link-back-projecten">
              Terug naar Projecten
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryLabel = CATEGORY_LABELS[project.category] || project.category;
  const backHref = `/projecten/${project.category}`;

  return (
    <div className="min-h-screen" data-testid="page-project-detail">
      <Header />
      <div className="pt-20">
        <section className="py-16 bg-[#F7FAEE]" data-testid="section-project-detail">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-sm text-[#96AB50] hover:text-[#829745] transition-colors mb-8 font-medium"
              data-testid="link-back-category"
            >
              <ArrowLeft size={16} />
              Terug naar {categoryLabel}
            </Link>

            <h1 className="text-3xl md:text-4xl font-bold text-[#333] mb-8 font-heading" data-testid="text-project-title">
              {project.title}
            </h1>

            <div className="mb-10">
              <div
                className="cursor-pointer overflow-hidden shadow-lg"
                onClick={() => openLightbox(0)}
                data-testid="img-main"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-[300px] md:h-[500px] object-cover hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            </div>

            {project.description && (
              <div className="bg-white p-6 md:p-10 shadow-sm mb-10" data-testid="section-description">
                <div className="prose prose-lg max-w-none text-[#555] leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </div>
              </div>
            )}

            {project.images.length > 0 && (
              <div data-testid="section-gallery">
                <h2 className="text-xl font-bold text-[#333] mb-6 font-heading" data-testid="text-gallery-title">
                  Foto's
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {project.images.map((img, idx) => (
                    <div
                      key={img.id}
                      className="cursor-pointer overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                      onClick={() => openLightbox(idx + 1)}
                      data-testid={`img-gallery-${img.id}`}
                    >
                      <img
                        src={img.image}
                        alt={`${project.title} - foto ${idx + 1}`}
                        className="w-full h-40 md:h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!project.description && project.images.length === 0 && (
              <div className="bg-white p-8 shadow-sm text-center" data-testid="text-no-content">
                <p className="text-[#777] text-lg">Meer informatie over dit project volgt binnenkort.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          data-testid="lightbox"
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            onClick={closeLightbox}
            data-testid="button-lightbox-close"
          >
            <X size={28} />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
            onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
            data-testid="button-lightbox-prev"
          >
            <ChevronLeft size={36} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
            onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
            data-testid="button-lightbox-next"
          >
            <ChevronRight size={36} />
          </button>
          <img
            src={allImages[lightboxIndex]?.image}
            alt={project.title}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
            data-testid="img-lightbox"
          />
          <div className="absolute bottom-4 text-white/60 text-sm" data-testid="text-lightbox-counter">
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
