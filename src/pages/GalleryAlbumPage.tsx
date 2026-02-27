import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ScrollAnimation from "@/components/ScrollAnimation";

const R2_BASE = "https://pub-d35a7dceb96745ed8eda4586e984ca7f.r2.dev";

interface GalleryAlbum {
  id: string;
  title: string;
  r2_folder_path: string;
  photo_count: number;
}

const GalleryAlbumPage = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<GalleryAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!id) return;
    supabase
      .from("gallery_albums")
      .select("id, title, r2_folder_path, photo_count")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setAlbum(data as GalleryAlbum | null);
        setLoading(false);
      });
  }, [id]);

  const getPhotoUrl = (index: number) => {
    if (!album) return "";
    return `${R2_BASE}/${album.r2_folder_path}/${index + 1}.webp`;
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null || !album) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight" && lightboxIndex < album.photo_count - 1)
        setLightboxIndex(lightboxIndex + 1);
      if (e.key === "ArrowLeft" && lightboxIndex > 0)
        setLightboxIndex(lightboxIndex - 1);
    },
    [lightboxIndex, album]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIndex]);

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground py-12">Album nie został znaleziony.</p>
          <Link to="/galeria" className="text-primary hover:underline">← Wróć do galerii</Link>
        </div>
      </div>
    );
  }

  const photos = Array.from({ length: album.photo_count }, (_, i) => i);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <Link
            to="/galeria"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Wróć do galerii
          </Link>
          <h1 className="section-heading text-3xl md:text-4xl mb-2">{album.title}</h1>
          <p className="text-muted-foreground mb-8">{album.photo_count} zdjęć</p>
        </ScrollAnimation>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((i) => (
            <ScrollAnimation key={i} delay={Math.min(i * 0.02, 0.3)}>
              <button
                onClick={() => setLightboxIndex(i)}
                className="aspect-square rounded-lg overflow-hidden group relative bg-muted"
              >
                <img
                  src={getPhotoUrl(i)}
                  alt={`${album.title} - zdjęcie ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onLoad={() => setLoadedImages((prev) => new Set(prev).add(i))}
                />
                {!loadedImages.has(i) && (
                  <div className="absolute inset-0 bg-muted animate-pulse" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            </ScrollAnimation>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-white/70 text-sm font-medium">
            {lightboxIndex + 1} / {album.photo_count}
          </div>

          {/* Previous */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              className="absolute left-2 md:left-6 z-10 p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}

          {/* Image */}
          <img
            src={getPhotoUrl(lightboxIndex)}
            alt={`${album.title} - zdjęcie ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain select-none"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          {/* Next */}
          {lightboxIndex < album.photo_count - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              className="absolute right-2 md:right-6 z-10 p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryAlbumPage;
