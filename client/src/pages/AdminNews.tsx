import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { LogOut, Plus, Pencil, Trash2, Upload, X, Eye, Newspaper, Tag, ChevronLeft } from "lucide-react";

type NewsCategory = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
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

type ArticleModalState = {
  open: boolean;
  mode: "create" | "edit";
  article?: NewsArticle;
};

type CategoryModalState = {
  open: boolean;
  mode: "create" | "edit";
  category?: NewsCategory;
};

function CategoryModal({
  modal,
  onClose,
  onSaved,
}: {
  modal: CategoryModalState;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (modal.mode === "edit" && modal.category) {
      setName(modal.category.name);
      setSlug(modal.category.slug);
      setSortOrder(modal.category.sortOrder);
    } else {
      setName("");
      setSlug("");
      setSortOrder(0);
    }
    setError("");
  }, [modal]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (modal.mode === "create") {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Naam is verplicht");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is verplicht");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = modal.mode === "edit"
        ? `/api/admin/news-categories/${modal.category!.id}`
        : "/api/admin/news-categories";
      const method = modal.mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, sortOrder }),
      });
      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || "Opslaan mislukt");
      }
    } catch {
      setError("Er is een fout opgetreden");
    } finally {
      setSaving(false);
    }
  };

  if (!modal.open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose} data-testid="modal-news-category">
      <div className="bg-white w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#333] font-heading">
            {modal.mode === "edit" ? "Categorie bewerken" : "Nieuwe categorie"}
          </h2>
          <button onClick={onClose} className="text-[#777] hover:text-[#333] p-1" aria-label="Sluiten" data-testid="button-close-cat-modal">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">Naam</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50]"
              data-testid="input-cat-name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50]"
              data-testid="input-cat-slug"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">Volgorde</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50]"
              data-testid="input-cat-sort"
            />
          </div>
          {error && <p className="text-red-500 text-sm" data-testid="text-cat-error">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#96AB50] text-white px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-[#829745] transition-colors disabled:opacity-60"
              data-testid="button-save-category"
            >
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-semibold text-[#555] border border-gray-300 hover:bg-gray-50 transition-colors">
              Annuleren
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ArticleModal({
  modal,
  categories,
  onClose,
  onSaved,
}: {
  modal: ArticleModalState;
  categories: NewsCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [published, setPublished] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (modal.mode === "edit" && modal.article) {
      setTitle(modal.article.title);
      setContent(modal.article.content || "");
      setCategoryId(modal.article.categoryId ? String(modal.article.categoryId) : "");
      setPublished(modal.article.published);
      setPreview(modal.article.image);
      setImageFile(null);
    } else {
      setTitle("");
      setContent("");
      setCategoryId("");
      setPublished(1);
      setPreview("");
      setImageFile(null);
    }
    setError("");
  }, [modal]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Titel is verplicht");
      return;
    }
    if (modal.mode === "create" && !imageFile) {
      setError("Afbeelding is verplicht");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("categoryId", categoryId);
      formData.append("published", String(published));
      if (imageFile) formData.append("image", imageFile);

      const url = modal.mode === "edit"
        ? `/api/admin/news/${modal.article!.id}`
        : "/api/admin/news";
      const method = modal.mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, { method, body: formData });
      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || "Opslaan mislukt");
      }
    } catch {
      setError("Er is een fout opgetreden");
    } finally {
      setSaving(false);
    }
  };

  if (!modal.open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose} data-testid="modal-news-article">
      <div className="bg-white w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#333] font-heading">
            {modal.mode === "edit" ? "Artikel bewerken" : "Nieuw artikel"}
          </h2>
          <button onClick={onClose} className="text-[#777] hover:text-[#333] p-1" aria-label="Sluiten" data-testid="button-close-article-modal">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">Titel</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50]"
              data-testid="input-news-title"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">Categorie</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50] bg-white"
              data-testid="select-news-category"
            >
              <option value="">Geen categorie</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">Inhoud</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50] resize-y"
              placeholder="Schrijf het nieuwsbericht..."
              data-testid="input-news-content"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">Status</label>
            <select
              value={published}
              onChange={(e) => setPublished(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50] bg-white"
              data-testid="select-news-published"
            >
              <option value={1}>Gepubliceerd</option>
              <option value={0}>Concept</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">Afbeelding</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              data-testid="input-news-image"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm text-[#555] hover:border-[#96AB50] transition-colors"
              data-testid="button-upload-news-image"
            >
              <Upload size={16} />
              Afbeelding kiezen
            </button>
            {preview && (
              <div className="mt-3">
                <img src={preview} alt="Preview" className="w-full h-40 object-cover" data-testid="img-news-preview" />
              </div>
            )}
          </div>
          {error && <p className="text-red-500 text-sm" data-testid="text-article-error">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#96AB50] text-white px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-[#829745] transition-colors disabled:opacity-60"
              data-testid="button-save-article"
            >
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-semibold text-[#555] border border-gray-300 hover:bg-gray-50 transition-colors">
              Annuleren
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminNewsPage() {
  const [, setLocation] = useLocation();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"articles" | "categories">("articles");
  const [articleModal, setArticleModal] = useState<ArticleModalState>({ open: false, mode: "create" });
  const [categoryModal, setCategoryModal] = useState<CategoryModalState>({ open: false, mode: "create" });
  const [deleting, setDeleting] = useState<number | null>(null);

  const checkAuth = async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      setLocation("/admin/login");
      return false;
    }
    return true;
  };

  const fetchArticles = async () => {
    const res = await fetch("/api/admin/news");
    if (res.ok) setArticles(await res.json());
  };

  const fetchCategories = async () => {
    const res = await fetch("/api/news-categories");
    if (res.ok) setCategories(await res.json());
  };

  const fetchAll = async () => {
    await Promise.all([fetchArticles(), fetchCategories()]);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth().then((ok) => {
      if (ok) fetchAll();
    });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLocation("/admin/login");
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm("Weet je zeker dat je dit artikel wilt verwijderen?")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
    if (res.ok) setArticles(articles.filter((a) => a.id !== id));
    setDeleting(null);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Weet je zeker dat je deze categorie wilt verwijderen?")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/news-categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories(categories.filter((c) => c.id !== id));
      await fetchArticles();
    }
    setDeleting(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-admin-news">
      <header className="bg-white shadow-sm" data-testid="admin-news-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <h1 className="text-lg font-bold text-[#333] font-heading">Heerikhuize HQ</h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-[#96AB50] hover:text-[#829745] transition-colors">
              Bekijk website
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm text-[#777] hover:text-[#333] transition-colors"
              data-testid="button-logout"
            >
              <LogOut size={16} />
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-[#96AB50] hover:text-[#829745]" data-testid="link-back-admin">
            <ChevronLeft size={16} />
            Projecten
          </Link>
          <h2 className="text-2xl font-bold text-[#333] font-heading" data-testid="text-admin-news-title">
            Nieuws beheren
          </h2>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("articles")}
            className={`px-5 py-2 text-sm font-semibold tracking-wide transition-colors ${
              activeTab === "articles"
                ? "bg-[#96AB50] text-white"
                : "bg-white text-[#555] border border-gray-300 hover:border-[#96AB50]"
            }`}
            data-testid="tab-articles"
          >
            <span className="inline-flex items-center gap-2"><Newspaper size={14} /> Artikelen</span>
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-5 py-2 text-sm font-semibold tracking-wide transition-colors ${
              activeTab === "categories"
                ? "bg-[#96AB50] text-white"
                : "bg-white text-[#555] border border-gray-300 hover:border-[#96AB50]"
            }`}
            data-testid="tab-categories"
          >
            <span className="inline-flex items-center gap-2"><Tag size={14} /> Categorieën</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#777]">Laden...</div>
        ) : activeTab === "articles" ? (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setArticleModal({ open: true, mode: "create" })}
                className="inline-flex items-center gap-2 bg-[#96AB50] text-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-[#829745] transition-colors"
                data-testid="button-add-article"
              >
                <Plus size={16} />
                Nieuw artikel
              </button>
            </div>

            {articles.length === 0 ? (
              <div className="text-center py-12 bg-white shadow-sm" data-testid="text-no-articles">
                <p className="text-[#777]">Nog geen nieuwsberichten.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <div key={article.id} className="bg-white shadow-sm overflow-hidden" data-testid={`admin-card-article-${article.id}`}>
                    <div className="h-44 overflow-hidden">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-[#333] text-sm font-heading" data-testid={`text-article-title-${article.id}`}>
                          {article.title}
                        </h3>
                        {article.published === 0 && (
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-yellow-100 text-yellow-700 whitespace-nowrap">Concept</span>
                        )}
                      </div>
                      <p className="text-xs text-[#777] mb-1">
                        {article.category ? article.category.name : "Geen categorie"}
                      </p>
                      <p className="text-xs text-[#999] mb-3">{formatDate(article.createdAt)}</p>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setArticleModal({ open: true, mode: "edit", article })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#96AB50] border border-[#96AB50] hover:bg-[#96AB50] hover:text-white transition-colors"
                          data-testid={`button-edit-article-${article.id}`}
                        >
                          <Pencil size={12} />
                          Bewerken
                        </button>
                        <Link
                          href={`/nieuws/${article.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#555] border border-gray-300 hover:bg-gray-100 transition-colors"
                          data-testid={`button-view-article-${article.id}`}
                        >
                          <Eye size={12} />
                          Bekijken
                        </Link>
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          disabled={deleting === article.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-300 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                          data-testid={`button-delete-article-${article.id}`}
                        >
                          <Trash2 size={12} />
                          {deleting === article.id ? "..." : "Verwijderen"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setCategoryModal({ open: true, mode: "create" })}
                className="inline-flex items-center gap-2 bg-[#96AB50] text-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-[#829745] transition-colors"
                data-testid="button-add-category"
              >
                <Plus size={16} />
                Nieuwe categorie
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-12 bg-white shadow-sm" data-testid="text-no-categories">
                <p className="text-[#777]">Nog geen categorieën.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-white shadow-sm p-4 flex items-center justify-between" data-testid={`admin-card-category-${cat.id}`}>
                    <div>
                      <h3 className="font-bold text-[#333] text-sm font-heading" data-testid={`text-cat-name-${cat.id}`}>{cat.name}</h3>
                      <p className="text-xs text-[#777]">Slug: {cat.slug} · Volgorde: {cat.sortOrder}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCategoryModal({ open: true, mode: "edit", category: cat })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#96AB50] border border-[#96AB50] hover:bg-[#96AB50] hover:text-white transition-colors"
                        data-testid={`button-edit-cat-${cat.id}`}
                      >
                        <Pencil size={12} />
                        Bewerken
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        disabled={deleting === cat.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-300 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                        data-testid={`button-delete-cat-${cat.id}`}
                      >
                        <Trash2 size={12} />
                        {deleting === cat.id ? "..." : "Verwijderen"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <ArticleModal
        modal={articleModal}
        categories={categories}
        onClose={() => setArticleModal({ open: false, mode: "create" })}
        onSaved={fetchAll}
      />
      <CategoryModal
        modal={categoryModal}
        onClose={() => setCategoryModal({ open: false, mode: "create" })}
        onSaved={fetchCategories}
      />
    </div>
  );
}
