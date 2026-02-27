import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit, Save, X, Image } from "lucide-react";

const R2_BASE = "https://pub-d35a7dceb96745ed8eda4586e984ca7f.r2.dev";

interface GalleryAlbum {
  id: string;
  title: string;
  r2_folder_path: string;
  cover_image_url: string | null;
  photo_count: number;
  sort_order: number;
}

const AdminGallery = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GalleryAlbum | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", r2_folder_path: "", cover_image_url: "", photo_count: 0, sort_order: 0 });

  useEffect(() => { fetchAlbums(); }, []);

  const fetchAlbums = async () => {
    const { data } = await supabase.from("gallery_albums").select("*").order("sort_order", { ascending: true });
    setAlbums((data as GalleryAlbum[]) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.r2_folder_path || form.photo_count < 1) return;
    setSaving(true);
    const payload = {
      title: form.title,
      r2_folder_path: form.r2_folder_path,
      cover_image_url: form.cover_image_url || null,
      photo_count: form.photo_count,
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
    setForm({
      title: album.title,
      r2_folder_path: album.r2_folder_path,
      cover_image_url: album.cover_image_url || "",
      photo_count: album.photo_count,
      sort_order: album.sort_order,
    });
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ title: "", r2_folder_path: "", cover_image_url: "", photo_count: 0, sort_order: 0 });
  };

  const previewUrl = form.r2_folder_path && form.photo_count > 0
    ? `${R2_BASE}/${form.r2_folder_path}/photo_001.jpg`
    : null;

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
              <label className="block text-sm font-medium text-foreground mb-1">Ścieżka folderu w R2</label>
              <input type="text" value={form.r2_folder_path} onChange={(e) => setForm({ ...form, r2_folder_path: e.target.value })} placeholder="np. galeria/mecz-borek-2026" className={inputClass} />
              <p className="text-xs text-muted-foreground mt-1">
                Folder w R2 ze zdjęciami. Zdjęcia muszą mieć nazwy: photo_001.jpg, photo_002.jpg, ...
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Liczba zdjęć w albumie</label>
              <input type="number" min={0} value={form.photo_count} onChange={(e) => setForm({ ...form, photo_count: parseInt(e.target.value) || 0 })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Zdjęcie okładkowe (opcjonalne, URL)</label>
              <input type="url" value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} placeholder="Domyślnie: photo_001.jpg z albumu" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Kolejność</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className={inputClass} />
            </div>

            {/* Preview */}
            {previewUrl && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Podgląd pierwszego zdjęcia</label>
                <img src={form.cover_image_url || previewUrl} alt="Podgląd" className="h-32 rounded-lg object-cover border border-border" />
              </div>
            )}

            <button onClick={handleSave} disabled={saving || !form.title || !form.r2_folder_path || form.photo_count < 1} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
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
          {albums.map((album) => {
            const thumb = album.cover_image_url || (album.photo_count > 0 ? `${R2_BASE}/${album.r2_folder_path}/photo_001.jpg` : null);
            return (
              <div key={album.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {thumb ? (
                    <img src={thumb} alt={album.title} className="w-16 h-12 rounded-lg object-cover border border-border shrink-0" />
                  ) : (
                    <div className="w-16 h-12 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                      <Image className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-heading text-sm font-bold text-foreground truncate">{album.title}</h3>
                    <p className="text-xs text-muted-foreground">{album.photo_count} zdjęć · {album.r2_folder_path}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(album)} className="p-2 text-muted-foreground hover:text-secondary"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(album.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
