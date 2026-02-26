import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit, Save, X, ExternalLink } from "lucide-react";

interface GalleryAlbum {
  id: string;
  title: string;
  google_photos_url: string;
  cover_image_url: string | null;
  sort_order: number;
}

const AdminGallery = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GalleryAlbum | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", google_photos_url: "", cover_image_url: "", sort_order: 0 });

  useEffect(() => { fetchAlbums(); }, []);

  const fetchAlbums = async () => {
    const { data } = await supabase.from("gallery_albums").select("*").order("sort_order", { ascending: true });
    setAlbums((data as GalleryAlbum[]) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.google_photos_url) return;
    setSaving(true);
    const payload = {
      title: form.title,
      google_photos_url: form.google_photos_url,
      cover_image_url: form.cover_image_url || null,
      sort_order: form.sort_order,
    };
    if (editing) {
      await supabase.from("gallery_albums").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("gallery_albums").insert(payload);
    }
    setSaving(false);
    cancel();
    fetchAlbums();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten album?")) return;
    await supabase.from("gallery_albums").delete().eq("id", id);
    fetchAlbums();
  };

  const startEdit = (album: GalleryAlbum) => {
    setEditing(album);
    setForm({ title: album.title, google_photos_url: album.google_photos_url, cover_image_url: album.cover_image_url || "", sort_order: album.sort_order });
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ title: "", google_photos_url: "", cover_image_url: "", sort_order: 0 });
  };

  const inputClass = "w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div>
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors mb-6">
          <Plus className="w-4 h-4" /> Dodaj album
        </button>
      )}

      {showForm && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-foreground">{editing ? "Edytuj album" : "Nowy album"}</h2>
            <button onClick={cancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nazwa albumu</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="np. Mecz z Borkiem 15.03.2026" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Link do albumu Google Photos</label>
              <input type="url" value={form.google_photos_url} onChange={(e) => setForm({ ...form, google_photos_url: e.target.value })} placeholder="https://photos.google.com/share/..." className={inputClass} />
              <p className="text-xs text-muted-foreground mt-1">Wklej link do udostępnionego albumu z Google Photos</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Zdjęcie okładkowe (opcjonalne, URL)</label>
              <input type="url" value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} placeholder="https://..." className={inputClass} />
              {form.cover_image_url && (
                <img src={form.cover_image_url} alt="Okładka" className="mt-2 h-32 rounded-lg object-cover border border-border" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Kolejność</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className={inputClass} />
            </div>
            <button onClick={handleSave} disabled={saving || !form.title || !form.google_photos_url} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Zapisywanie..." : "Zapisz"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Ładowanie...</p>
      ) : albums.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Brak albumów.</p>
      ) : (
        <div className="space-y-3">
          {albums.map((album) => (
            <div key={album.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {album.cover_image_url ? (
                  <img src={album.cover_image_url} alt={album.title} className="w-16 h-12 rounded-lg object-cover border border-border shrink-0" />
                ) : (
                  <div className="w-16 h-12 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                    <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-heading text-sm font-bold text-foreground truncate">{album.title}</h3>
                  <a href={album.google_photos_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-primary/80 truncate block">
                    Google Photos ↗
                  </a>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(album)} className="p-2 text-muted-foreground hover:text-secondary"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(album.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
