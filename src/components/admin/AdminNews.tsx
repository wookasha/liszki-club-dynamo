import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X, Upload, Eye, EyeOff, Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Quote, Minus, Strikethrough, Undo2, Redo2 } from "lucide-react";
import { renderNewsContent } from "@/lib/renderNewsContent";

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

const AdminNews = () => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NewsPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", content: "", excerpt: "", category: "Klub", image_url: "", published: false,
  });
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<string[]>([""]);
  const historyIndexRef = useRef(0);

  const handleEditorScroll = () => {
    const ta = contentRef.current;
    const preview = previewRef.current;
    if (!ta || !preview) return;
    const ratio = ta.scrollTop / (ta.scrollHeight - ta.clientHeight || 1);
    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
  };

  const pushHistory = (val: string) => {
    const h = historyRef.current;
    const idx = historyIndexRef.current;
    historyRef.current = [...h.slice(0, idx + 1), val];
    historyIndexRef.current = historyRef.current.length - 1;
  };

  const undo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      setForm((p) => ({ ...p, content: historyRef.current[historyIndexRef.current] }));
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      setForm((p) => ({ ...p, content: historyRef.current[historyIndexRef.current] }));
    }
  };

  const updateContent = (val: string) => {
    setForm((p) => ({ ...p, content: val }));
    pushHistory(val);
  };

  const wrapSelection = (wrapper: string) => {
    const ta = contentRef.current;
    if (!ta) return;
    const scrollTop = ta.scrollTop;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = form.content;
    const selected = text.substring(start, end);
    const newText = text.substring(0, start) + wrapper + selected + wrapper + text.substring(end);
    updateContent(newText);
    setTimeout(() => {
      ta.focus();
      ta.scrollTop = scrollTop;
      ta.selectionStart = start + wrapper.length;
      ta.selectionEnd = end + wrapper.length;
    }, 0);
  };

  const prefixLine = (prefix: string) => {
    const ta = contentRef.current;
    if (!ta) return;
    const scrollTop = ta.scrollTop;
    const start = ta.selectionStart;
    const text = form.content;
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    const newText = text.substring(0, lineStart) + prefix + text.substring(lineStart);
    updateContent(newText);
    setTimeout(() => {
      ta.focus();
      ta.scrollTop = scrollTop;
      ta.selectionStart = ta.selectionEnd = start + prefix.length;
    }, 0);
  };

  const insertLink = () => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = form.content;
    const selected = text.substring(start, end);
    const linkText = selected || "tekst linku";
    const insert = `[${linkText}](https://)`;
    const newText = text.substring(0, start) + insert + text.substring(end);
    updateContent(newText);
    const urlStart = start + linkText.length + 3;
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = urlStart;
      ta.selectionEnd = urlStart + 8;
    }, 0);
  };

  const insertSeparator = () => {
    const ta = contentRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const text = form.content;
    const insert = "\n---\n";
    const newText = text.substring(0, pos) + insert + text.substring(pos);
    updateContent(newText);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = pos + insert.length;
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === "b") { e.preventDefault(); wrapSelection("**"); }
    else if (mod && e.key === "i") { e.preventDefault(); wrapSelection("*"); }
    else if (mod && e.key === "k") { e.preventDefault(); insertLink(); }
    else if (mod && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
    else if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from("news_posts").select("*").order("created_at", { ascending: false });
    setPosts((data as NewsPost[]) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (editing) {
      await supabase.from("news_posts").update({
        title: form.title, content: form.content, excerpt: form.excerpt,
        category: form.category, image_url: form.image_url || null, published: form.published,
      }).eq("id", editing.id);
    } else {
      await supabase.from("news_posts").insert({
        title: form.title, content: form.content, excerpt: form.excerpt,
        category: form.category, image_url: form.image_url || null,
        published: form.published, author_id: session?.user.id,
        slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      });
    }
    setSaving(false);
    cancel();
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć?")) return;
    await supabase.from("news_posts").delete().eq("id", id);
    fetchPosts();
  };

  const startEdit = (post: NewsPost) => {
    setEditing(post); setCreating(false);
    setForm({ title: post.title, content: post.content, excerpt: post.excerpt, category: post.category, image_url: post.image_url || "", published: post.published });
    setImagePreview(post.image_url || null);
  };

  const cancel = () => {
    setEditing(null); setCreating(false);
    setForm({ title: "", content: "", excerpt: "", category: "Klub", image_url: "", published: false });
    setImagePreview(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("news-images").upload(fileName, file, { cacheControl: '31536000', upsert: true });
    if (error) { alert("Błąd: " + error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("news-images").getPublicUrl(fileName);
    setForm((p) => ({ ...p, image_url: publicUrl }));
    setImagePreview(publicUrl);
    setUploading(false);
  };

  const showForm = editing || creating;

  return (
    <div>
      {!showForm && (
        <button onClick={() => { setEditing(null); setForm({ title: "", content: "", excerpt: "", category: "Klub", image_url: "", published: false }); setImagePreview(null); setCreating(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors mb-6">
          <Plus className="w-4 h-4" /> Nowy wpis
        </button>
      )}

      {showForm && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-foreground">{editing ? "Edytuj wpis" : "Nowy wpis"}</h2>
            <button onClick={cancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tytuł</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Kategoria</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Zdjęcie</label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Podgląd" className="h-40 rounded-lg object-cover border border-border" />
                  <button type="button" onClick={() => { setForm((p) => ({ ...p, image_url: "" })); setImagePreview(null); }} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/50">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  {uploading ? <span className="text-sm text-muted-foreground">Przesyłanie...</span> : <><Upload className="w-8 h-8 text-muted-foreground mb-2" /><span className="text-sm text-muted-foreground">Kliknij, aby dodać zdjęcie</span></>}
                </label>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Krótki opis</label>
              <input type="text" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Treść</label>
              <div className="flex gap-1 mb-1 flex-wrap items-center">
                <button type="button" onClick={undo} className="p-1.5 rounded bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors" title="Cofnij (Ctrl+Z)"><Undo2 className="w-4 h-4" /></button>
                <button type="button" onClick={redo} className="p-1.5 rounded bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors" title="Ponów (Ctrl+Y)"><Redo2 className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-border mx-0.5" />
                <button type="button" onClick={() => wrapSelection("**")} className="p-1.5 rounded bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors" title="Pogrubienie (Ctrl+B)"><Bold className="w-4 h-4" /></button>
                <button type="button" onClick={() => wrapSelection("*")} className="p-1.5 rounded bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors" title="Kursywa (Ctrl+I)"><Italic className="w-4 h-4" /></button>
                <button type="button" onClick={() => wrapSelection("~~")} className="p-1.5 rounded bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors" title="Przekreślenie"><Strikethrough className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-border mx-0.5" />
                <button type="button" onClick={() => prefixLine("## ")} className="p-1.5 rounded bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors" title="Nagłówek H2"><Heading2 className="w-4 h-4" /></button>
                <button type="button" onClick={() => prefixLine("### ")} className="p-1.5 rounded bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors" title="Nagłówek H3"><Heading3 className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-border mx-0.5" />
                <button type="button" onClick={() => prefixLine("- ")} className="p-1.5 rounded bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors" title="Lista punktowana"><List className="w-4 h-4" /></button>
                <button type="button" onClick={() => prefixLine("1. ")} className="p-1.5 rounded bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors" title="Lista numerowana"><ListOrdered className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-border mx-0.5" />
                <button type="button" onClick={insertLink} className="p-1.5 rounded bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors" title="Link (Ctrl+K)"><Link2 className="w-4 h-4" /></button>
                <button type="button" onClick={() => prefixLine("> ")} className="p-1.5 rounded bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors" title="Cytat"><Quote className="w-4 h-4" /></button>
                <button type="button" onClick={insertSeparator} className="p-1.5 rounded bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors" title="Separator"><Minus className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <textarea ref={contentRef} rows={12} value={form.content} onChange={(e) => updateContent(e.target.value)} onKeyDown={handleKeyDown} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono" placeholder="Wpisz treść..." />
                <div className="border border-border rounded-md p-4 bg-muted/30 overflow-auto max-h-80">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Podgląd</p>
                  {form.content ? (
                    <div
                      className="prose prose-invert prose-sm max-w-none text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderNewsContent(form.content) }}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground/50 italic">Podgląd treści pojawi się tutaj...</p>
                  )}
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-foreground">Opublikowany</span>
            </label>
            <button onClick={handleSave} disabled={saving || !form.title} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Zapisywanie..." : "Zapisz"}
            </button>
          </div>
        </div>
      )}

      {loading ? <p className="text-muted-foreground text-center py-8">Ładowanie...</p> : posts.length === 0 ? <p className="text-muted-foreground text-center py-8">Brak wpisów.</p> : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{post.category}</span>
                  {post.published ? (
                    <span className="text-[10px] uppercase bg-pitch-green/10 text-pitch-green px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Eye className="w-3 h-3" /> Pub.</span>
                  ) : (
                    <span className="text-[10px] uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><EyeOff className="w-3 h-3" /> Szkic</span>
                  )}
                </div>
                <h3 className="font-heading text-sm font-bold text-foreground truncate">{post.title}</h3>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(post)} className="p-2 text-muted-foreground hover:text-secondary"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(post.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNews;
