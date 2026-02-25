import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Upload, X, Image, GripVertical } from "lucide-react";

interface GalleryPhoto {
  id: string;
  title: string;
  album: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

const AdminGallery = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", album: "Sezon 2025/2026" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [albums, setAlbums] = useState<string[]>([]);
  const [customAlbum, setCustomAlbum] = useState(false);

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("album")
      .order("sort_order", { ascending: true });
    const items = (data as GalleryPhoto[]) || [];
    setPhotos(items);
    const uniqueAlbums = [...new Set(items.map(p => p.album))];
    setAlbums(uniqueAlbums);
    setLoading(false);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Wybierz plik graficzny");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleSave = async () => {
    if (!imageFile || !form.title) return;
    setUploading(true);

    const ext = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery-images")
      .upload(fileName, imageFile);

    if (uploadError) {
      alert("Błąd uploadu: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("gallery-images")
      .getPublicUrl(fileName);

    const { error } = await supabase.from("gallery_photos").insert({
      title: form.title,
      album: form.album,
      image_url: urlData.publicUrl,
      sort_order: photos.filter(p => p.album === form.album).length,
    } as any);

    if (error) {
      alert("Błąd zapisu: " + error.message);
    }

    setUploading(false);
    cancel();
    fetchPhotos();
  };

  const handleDelete = async (photo: GalleryPhoto) => {
    if (!confirm(`Usuń "${photo.title}"?`)) return;
    // Delete from storage
    const path = photo.image_url.split("/gallery-images/")[1];
    if (path) {
      await supabase.storage.from("gallery-images").remove([path]);
    }
    await supabase.from("gallery_photos").delete().eq("id", photo.id);
    fetchPhotos();
  };

  const cancel = () => {
    setShowForm(false);
    setForm({ title: "", album: albums[0] || "Sezon 2025/2026" });
    setImageFile(null);
    setImagePreview(null);
    setCustomAlbum(false);
  };

  const inputClass = "w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  // Group by album
  const grouped = photos.reduce<Record<string, GalleryPhoto[]>>((acc, p) => {
    (acc[p.album] = acc[p.album] || []).push(p);
    return acc;
  }, {});

  return (
    <div>
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors mb-6">
          <Plus className="w-4 h-4" /> Dodaj zdjęcie
        </button>
      )}

      {showForm && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-foreground">Nowe zdjęcie</h2>
            <button onClick={cancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tytuł</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="np. Mecz z Orlętami" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Album</label>
              {!customAlbum ? (
                <div className="flex gap-2">
                  <select
                    value={form.album}
                    onChange={(e) => setForm({ ...form, album: e.target.value })}
                    className={`${inputClass} flex-1`}
                  >
                    {(albums.length > 0 ? albums : ["Sezon 2025/2026"]).map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <button onClick={() => { setCustomAlbum(true); setForm({ ...form, album: "" }); }} className="px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm hover:bg-accent transition-colors whitespace-nowrap">
                    + Nowy
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" value={form.album} onChange={(e) => setForm({ ...form, album: e.target.value })} placeholder="Nazwa nowego albumu" className={`${inputClass} flex-1`} />
                  <button onClick={() => { setCustomAlbum(false); setForm({ ...form, album: albums[0] || "Sezon 2025/2026" }); }} className="px-3 py-2 bg-muted border border-border rounded-md text-muted-foreground text-sm hover:text-foreground transition-colors">
                    Anuluj
                  </button>
                </div>
              )}
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Zdjęcie</label>
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img src={imagePreview} alt="Podgląd" className="w-full max-h-64 object-cover" />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full text-foreground hover:bg-background transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("gallery-upload")?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Przeciągnij lub kliknij aby wybrać zdjęcie</p>
                  <input id="gallery-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={uploading || !form.title || !form.album || !imageFile}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" /> {uploading ? "Przesyłanie..." : "Zapisz"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Ładowanie...</p>
      ) : photos.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Brak zdjęć w galerii.</p>
      ) : (
        Object.entries(grouped).map(([album, items]) => (
          <div key={album} className="mb-8">
            <h3 className="font-heading text-lg font-bold text-foreground mb-3">{album}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((photo) => (
                <div key={photo.id} className="group relative rounded-lg overflow-hidden border border-border">
                  <img src={photo.image_url} alt={photo.title} className="w-full aspect-[4/3] object-cover" />
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/60 transition-colors flex items-end">
                    <div className="w-full p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground truncate">{photo.title}</span>
                      <button onClick={() => handleDelete(photo)} className="p-1.5 text-destructive hover:text-destructive/80 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminGallery;
