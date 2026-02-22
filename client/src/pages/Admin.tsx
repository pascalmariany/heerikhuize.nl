import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { LogOut, Plus, Pencil, Trash2, Upload, X, Images, Eye } from "lucide-react";

type ProjectImage = {
  id: number;
  projectId: number;
  image: string;
  sortOrder: number;
};

type Project = {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string | null;
  sortOrder: number;
};

type ModalState = {
  open: boolean;
  mode: "create" | "edit";
  project?: Project;
};

function ProjectModal({
  modal,
  onClose,
  onSaved,
}: {
  modal: ModalState;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("wonen");
  const [sortOrder, setSortOrder] = useState(0);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (modal.mode === "edit" && modal.project) {
      setTitle(modal.project.title);
      setCategory(modal.project.category);
      setSortOrder(modal.project.sortOrder);
      setDescription(modal.project.description || "");
      setPreview(modal.project.image);
      setImageFile(null);
    } else {
      setTitle("");
      setCategory("wonen");
      setSortOrder(0);
      setDescription("");
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
      formData.append("category", category);
      formData.append("sortOrder", String(sortOrder));
      formData.append("description", description);
      if (imageFile) formData.append("image", imageFile);

      const url =
        modal.mode === "edit"
          ? `/api/admin/projects/${modal.project!.id}`
          : "/api/admin/projects";
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="modal-project">
      <div className="bg-white w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#333] font-heading">
            {modal.mode === "edit" ? "Project bewerken" : "Nieuw project"}
          </h2>
          <button onClick={onClose} className="text-[#777] hover:text-[#333]" data-testid="button-modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">
              Titel
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50]"
              data-testid="input-project-title"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">
              Categorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50] bg-white"
              data-testid="select-project-category"
            >
              <option value="wonen">Wonen</option>
              <option value="werken">Werken</option>
              <option value="interieur">Interieur</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">
              Volgorde
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50]"
              data-testid="input-project-sort"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">
              Beschrijving
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50] resize-y"
              placeholder="Beschrijf het project..."
              data-testid="input-project-description"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">
              Hoofdafbeelding
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              data-testid="input-project-image"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm text-[#555] hover:border-[#96AB50] transition-colors"
              data-testid="button-upload-image"
            >
              <Upload size={16} />
              Afbeelding kiezen
            </button>
            {preview && (
              <div className="mt-3">
                <img src={preview} alt="Preview" className="w-full h-40 object-cover" data-testid="img-preview" />
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm" data-testid="text-modal-error">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#96AB50] text-white px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-[#829745] transition-colors disabled:opacity-60"
              data-testid="button-save-project"
            >
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-semibold text-[#555] border border-gray-300 hover:bg-gray-50 transition-colors"
              data-testid="button-cancel"
            >
              Annuleren
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImageManager({
  projectId,
  onClose,
}: {
  projectId: number;
  onClose: () => void;
}) {
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    const res = await fetch(`/api/admin/projects/${projectId}/images`);
    if (res.ok) {
      setImages(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, [projectId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }
    const res = await fetch(`/api/admin/projects/${projectId}/images`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      await fetchImages();
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm("Weet je zeker dat je deze foto wilt verwijderen?")) return;
    setDeleting(imageId);
    const res = await fetch(`/api/admin/project-images/${imageId}`, { method: "DELETE" });
    if (res.ok) {
      setImages(images.filter((i) => i.id !== imageId));
    }
    setDeleting(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="modal-images" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#333] font-heading">
            Foto's beheren
          </h2>
          <button onClick={onClose} className="text-[#777] hover:text-[#333] p-1" aria-label="Sluiten" data-testid="button-images-close">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
              data-testid="input-upload-images"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 bg-[#96AB50] text-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-[#829745] transition-colors disabled:opacity-60"
              data-testid="button-add-images"
            >
              <Upload size={16} />
              {uploading ? "Uploaden..." : "Foto's toevoegen"}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-[#777]">Laden...</div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-[#777]" data-testid="text-no-images">
              <p>Nog geen extra foto's toegevoegd.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative group" data-testid={`admin-img-${img.id}`}>
                  <img
                    src={img.image}
                    alt="Project foto"
                    className="w-full h-36 object-cover shadow-sm"
                  />
                  <button
                    onClick={() => handleDelete(img.id)}
                    disabled={deleting === img.id}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                    data-testid={`button-delete-img-${img.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("wonen");
  const [modal, setModal] = useState<ModalState>({ open: false, mode: "create" });
  const [deleting, setDeleting] = useState<number | null>(null);
  const [imageManagerId, setImageManagerId] = useState<number | null>(null);

  const checkAuth = async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      setLocation("/admin/login");
      return false;
    }
    return true;
  };

  const fetchProjects = async () => {
    const res = await fetch(`/api/projects/${activeCategory}`);
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth().then((ok) => {
      if (ok) fetchProjects();
    });
  }, [activeCategory]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLocation("/admin/login");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Weet je zeker dat je dit project wilt verwijderen?")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects(projects.filter((p) => p.id !== id));
    }
    setDeleting(null);
  };

  const categories = [
    { key: "wonen", label: "Wonen" },
    { key: "werken", label: "Werken" },
    { key: "interieur", label: "Interieur" },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-admin">
      <header className="bg-white shadow-sm" data-testid="admin-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <h1 className="text-lg font-bold text-[#333] font-heading">Heerikhuize HQ</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-[#96AB50] hover:text-[#829745] transition-colors"
              data-testid="link-view-site"
            >
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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#333] font-heading" data-testid="text-admin-title">
            Projecten beheren
          </h2>
          <button
            onClick={() => setModal({ open: true, mode: "create" })}
            className="inline-flex items-center gap-2 bg-[#96AB50] text-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-[#829745] transition-colors"
            data-testid="button-add-project"
          >
            <Plus size={16} />
            Nieuw project
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setActiveCategory(cat.key); setLoading(true); }}
              className={`px-5 py-2 text-sm font-semibold tracking-wide transition-colors ${
                activeCategory === cat.key
                  ? "bg-[#96AB50] text-white"
                  : "bg-white text-[#555] border border-gray-300 hover:border-[#96AB50]"
              }`}
              data-testid={`button-category-${cat.key}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#777]">Laden...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white shadow-sm" data-testid="text-no-projects">
            <p className="text-[#777]">Geen projecten in deze categorie.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white shadow-sm overflow-hidden"
                data-testid={`admin-card-project-${project.id}`}
              >
                <div className="h-44 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#333] text-sm mb-1 font-heading" data-testid={`text-admin-project-${project.id}`}>
                    {project.title}
                  </h3>
                  <p className="text-xs text-[#777] mb-3">Volgorde: {project.sortOrder}</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setModal({ open: true, mode: "edit", project })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#96AB50] border border-[#96AB50] hover:bg-[#96AB50] hover:text-white transition-colors"
                      data-testid={`button-edit-${project.id}`}
                    >
                      <Pencil size={12} />
                      Bewerken
                    </button>
                    <button
                      onClick={() => setImageManagerId(project.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                      data-testid={`button-images-${project.id}`}
                    >
                      <Images size={12} />
                      Foto's
                    </button>
                    <Link
                      href={`/project/${project.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#555] border border-gray-300 hover:bg-gray-100 transition-colors"
                      data-testid={`button-view-${project.id}`}
                    >
                      <Eye size={12} />
                      Bekijken
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deleting === project.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-300 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                      data-testid={`button-delete-${project.id}`}
                    >
                      <Trash2 size={12} />
                      {deleting === project.id ? "..." : "Verwijderen"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ProjectModal
        modal={modal}
        onClose={() => setModal({ open: false, mode: "create" })}
        onSaved={fetchProjects}
      />

      {imageManagerId !== null && (
        <ImageManager
          projectId={imageManagerId}
          onClose={() => setImageManagerId(null)}
        />
      )}
    </div>
  );
}
