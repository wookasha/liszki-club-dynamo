import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Eye, EyeOff, LogOut, Save, ArrowLeft, X, Upload, Image } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  published: boolean;
  created_at: string;
}

const categories = ["Mecze", "Klub", "Młodzież"];

const AdminPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NewsPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "Klub",
    image_url: "",
    published: false,
  });

  useEffect(() => {
    checkAuth();
    fetchPosts();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      navigate("/");
    }
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("news_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts((data as NewsPost[]) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (editing) {
      await supabase
        .from("news_posts")
        .update({
          title: form.title,
          content: form.content,
          excerpt: form.excerpt,
          category: form.category,
          image_url: form.image_url || null,
          published: form.published,
        })
        .eq("id", editing.id);
    } else {
      await supabase.from("news_posts").insert({
        title: form.title,
        content: form.content,
        excerpt: form.excerpt,
        category: form.category,
        image_url: form.image_url || null,
        published: form.published,
        author_id: session?.user.id,
      });
    }

    setSaving(false);
    setEditing(null);
    setCreating(false);
    resetForm();
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten wpis?")) return;
    await supabase.from("news_posts").delete().eq("id", id);
    fetchPosts();
  };

  const startEdit = (post: NewsPost) => {
    setEditing(post);
    setCreating(false);
    setForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      image_url: post.image_url || "",
      published: post.published,
    });
    setImagePreview(post.image_url || null);
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    resetForm();
    setImagePreview(null);
  };

  const resetForm = () => {
    setForm({ title: "", content: "", excerpt: "", category: "Klub", image_url: "", published: false });
    setImagePreview(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("news-images")
      .upload(fileName, file);

    if (uploadError) {
      alert("Błąd uploadu: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("news-images")
      .getPublicUrl(fileName);

    setForm((prev) => ({ ...prev, image_url: publicUrl }));
    setImagePreview(publicUrl);
    setUploading(false);
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image_url: "" }));
    setImagePreview(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setCreating(false);
    resetForm();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const showForm = editing || creating;

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <ScrollAnimation>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="section-heading text-3xl mb-1">Panel CMS</h1>
              <p className="text-muted-foreground text-sm">Zarządzaj aktualnościami klubu</p>
            </div>
            <div className="flex gap-2">
              {!showForm && (
                <button
                  onClick={startCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nowy wpis
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground font-medium text-sm rounded-md hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </ScrollAnimation>

        {/* Form */}
        {showForm && (
          <ScrollAnimation>
            <div className="glass-card rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  {editing ? "Edytuj wpis" : "Nowy wpis"}
                </h2>
                <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Tytuł</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Tytuł aktualności..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Kategoria</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Zdjęcie</label>
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Podgląd" className="h-40 rounded-lg object-cover border border-border" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <span className="text-sm text-muted-foreground">Przesyłanie...</span>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Kliknij, aby dodać zdjęcie</span>
                          <span className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, WebP</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Krótki opis</label>
                  <input
                    type="text"
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Krótkie podsumowanie..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Treść</label>
                  <textarea
                    rows={8}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Pełna treść aktualności..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) => setForm({ ...form, published: e.target.checked })}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-foreground">Opublikowany</span>
                  </label>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Zapisywanie..." : "Zapisz"}
                </button>
              </div>
            </div>
          </ScrollAnimation>
        )}

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Ładowanie...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Brak wpisów. Dodaj pierwszy!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="glass-card rounded-xl p-5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {post.category}
                    </span>
                    {post.published ? (
                      <span className="text-[10px] uppercase tracking-wider bg-pitch-green/10 text-pitch-green px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Opublikowany
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Szkic
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString("pl-PL")}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground truncate">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground truncate">{post.excerpt}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(post)}
                    className="p-2 text-muted-foreground hover:text-secondary transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
