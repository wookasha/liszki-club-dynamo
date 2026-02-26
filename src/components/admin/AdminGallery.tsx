import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Upload, X, Image, FolderOpen } from "lucide-react";

interface GalleryPhoto {
  id: string;
  title: string;
  album: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  is_played: boolean;
}

const AdminGallery = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [customAlbum, setCustomAlbum] = useState(false);
  const [customAlbumName, setCustomAlbumName] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [albums, setAlbums] = useState<string[]>([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [photosRes, matchesRes] = await Promise.all([
      supabase.from("gallery_photos").select("*").order("album").order("sort_order", { ascending: true }),
      supabase.from("matches").select("id, home_team, away_team, match_date, is_played").order("match_date", { ascending: false }),
    ]);
    const items = (photosRes.data as GalleryPhoto[]) || [];
    setPhotos(items);
    setMatches((matchesRes.data as Match[]) || []);
    const uniqueAlbums = [...new Set(items.map(p => p.album))];
    setAlbums(uniqueAlbums);
    setLoading(false);
  };

  const getMatchLabel = (m: Match) => {
    const date = new Date(m.match_date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `${m.home_team} vs ${m.away_team} (${date})`;
  };

  const handleFilesChange = (files: FileList | null) => {
    if (!files) return;
    const validFiles: File[] = [];
    const previews: string[] = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith("image/")) {
        validFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          previews.push(e.target?.result as string);
          if (previews.length === validFiles.length) {
            setImageFiles(prev => [...prev, ...validFiles]);
            setImagePreviews(prev => [...prev, ...previews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    if (validFiles.length === 0) alert("Wybierz pliki graficzne");
  };

  const removeFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFilesChange(e.dataTransfer.files);
  };

  const getAlbumName = (): string => {
    if (customAlbum) return customAlbumName;
    const match = matches.find(m => m.id === selectedAlbum);
    return match ? getMatchLabel(match) : selectedAlbum;
  };

  const handleSave = async () => {
    const albumName = getAlbumName();
    if (!albumName || imageFiles.length === 0) return;
    setUploading(true);

    const currentCount = photos.filter(p => p.album === albumName).length;
    let success = 0;

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("gallery-images").upload(fileName, file);
      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        continue;
      }

      const { data: urlData } = supabase.storage.from("gallery-images").getPublicUrl(fileName);

      const { error } = await supabase.from("gallery_photos").insert({
        title: albumName,
        album: albumName,
        image_url: urlData.publicUrl,
        sort_order: currentCount + i,
      } as any);

      if (!error) success++;
    }

    if (success > 0) {
      cancel();
      fetchData();
    } else {
      alert("Nie udało się dodać zdjęć");
    }
    setUploading(false);
  };

  const handleDelete = async (photo: GalleryPhoto) => {
    if (!confirm(`Usuń to zdjęcie?`)) return;
    const path = photo.image_url.split("/gallery-images/")[1];
    if (path) await supabase.storage.from("gallery-images").remove([path]);
    await supabase.from("gallery_photos").delete().eq("id", photo.id);
    fetchData();
  };

  const handleDeleteAlbum = async (album: string) => {
    const albumPhotos = photos.filter(p => p.album === album);
    if (!confirm(`Usuń cały album "${album}" (${albumPhotos.length} zdjęć)?`)) return;
    for (const photo of albumPhotos) {
      const path = photo.image_url.split("/gallery-images/")[1];
      if (path) await supabase.storage.from("gallery-images").remove([path]);
      await supabase.from("gallery_photos").delete().eq("id", photo.id);
    }
    fetchData();
  };

  const cancel = () => {
    setShowForm(false);
    setSelectedAlbum("");
    setCustomAlbum(false);
    setCustomAlbumName("");
    setImageFiles([]);
    setImagePreviews([]);
  };

  const inputClass = "w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  const grouped = photos.reduce<Record<string, GalleryPhoto[]>>((acc, p) => {
    (acc[p.album] = acc[p.album] || []).push(p);
    return acc;
  }, {});

  return (
    <div>
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors mb-6">
          <Plus className="w-4 h-4" /> Dodaj zdjęcia
        </button>
      )}

      {showForm && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-foreground">Dodaj zdjęcia do albumu</h2>
            <button onClick={cancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            {/* Album selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Album (mecz)</label>
              {!customAlbum ? (
                <div className="space-y-2">
                  <select
                    value={selectedAlbum}
                    onChange={(e) => setSelectedAlbum(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">— Wybierz mecz —</option>
                    {matches.map(m => (
                      <option key={m.id} value={m.id}>{getMatchLabel(m)}</option>
                    ))}
                    {albums.filter(a => !matches.some(m => getMatchLabel(m) === a)).map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <button onClick={() => setCustomAlbum(true)} className="text-xs text-primary hover:text-primary/80 transition-colors">
                    + Własna nazwa albumu
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" value={customAlbumName} onChange={(e) => setCustomAlbumName(e.target.value)} placeholder="Nazwa albumu" className={`${inputClass} flex-1`} />
                  <button onClick={() => { setCustomAlbum(false); setCustomAlbumName(""); }} className="px-3 py-2 bg-muted border border-border rounded-md text-muted-foreground text-sm hover:text-foreground transition-colors">
                    Anuluj
                  </button>
                </div>
              )}
            </div>

            {/* Multi-file upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Zdjęcia (można wybrać wiele)</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById("gallery-multi-upload")?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Przeciągnij lub kliknij aby wybrać zdjęcia</p>
                <p className="text-xs text-muted-foreground mt-1">Możesz wybrać wiele plików naraz</p>
                <input id="gallery-multi-upload" type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFilesChange(e.target.files)} />
              </div>

              {imagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border border-border aspect-square">
                      <img src={preview} alt={`Podgląd ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        className="absolute top-1 right-1 p-1 bg-background/80 rounded-full text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={uploading || imageFiles.length === 0 || (!selectedAlbum && !customAlbumName)}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Przesyłanie..." : `Zapisz (${imageFiles.length} ${imageFiles.length === 1 ? "zdjęcie" : imageFiles.length < 5 ? "zdjęcia" : "zdjęć"})`}
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                {album}
                <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
              </h3>
              <button onClick={() => handleDeleteAlbum(album)} className="text-xs text-destructive hover:text-destructive/80 transition-colors">
                Usuń album
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {items.map((photo) => (
                <div key={photo.id} className="group relative rounded-lg overflow-hidden border border-border aspect-square">
                  <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/60 transition-colors flex items-center justify-center">
                    <button onClick={() => handleDelete(photo)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-destructive hover:text-destructive/80">
                      <Trash2 className="w-5 h-5" />
                    </button>
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
