import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import ScrollAnimation from "@/components/ScrollAnimation";

interface GalleryPhoto {
  id: string;
  title: string;
  album: string;
  image_url: string;
  sort_order: number;
}

const GalleryPage = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("gallery_photos")
        .select("id, title, album, image_url, sort_order")
        .order("album")
        .order("sort_order", { ascending: true });
      setPhotos((data as GalleryPhoto[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const grouped = photos.reduce<Record<string, GalleryPhoto[]>>((acc, p) => {
    (acc[p.album] = acc[p.album] || []).push(p);
    return acc;
  }, {});

  const allPhotos = Object.values(grouped).flat();
  const currentIndex = lightbox ? allPhotos.findIndex(p => p.id === lightbox.id) : -1;

  const navigate = (dir: -1 | 1) => {
    if (currentIndex < 0) return;
    const next = (currentIndex + dir + allPhotos.length) % allPhotos.length;
    setLightbox(allPhotos[next]);
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <h1 className="section-heading text-4xl md:text-5xl mb-2">Galeria</h1>
          <div className="section-heading-accent mb-10" />
        </ScrollAnimation>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Ładowanie galerii...</p>
        ) : photos.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Galeria jest pusta. Wkrótce pojawią się zdjęcia!</p>
        ) : (
          Object.entries(grouped).map(([album, items]) => (
            <div key={album} className="mb-14">
              <ScrollAnimation>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">{album}</h2>
              </ScrollAnimation>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((photo, i) => (
                  <ScrollAnimation key={photo.id} delay={i * 0.05}>
                    <div
                      onClick={() => setLightbox(photo)}
                      className="aspect-[4/3] rounded-xl cursor-pointer hover-lift overflow-hidden border border-border/50"
                    >
                      <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  </ScrollAnimation>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4"
              onClick={() => setLightbox(null)}
            >
              <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-foreground hover:text-primary transition-colors z-10">
                <X className="w-8 h-8" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); navigate(-1); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-foreground hover:text-primary transition-colors z-10">
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); navigate(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-foreground hover:text-primary transition-colors z-10">
                <ChevronRight className="w-8 h-8" />
              </button>
              <motion.div
                key={lightbox.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-4xl max-h-[85vh] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img src={lightbox.image_url} alt={lightbox.title} className="max-w-full max-h-[80vh] object-contain rounded-xl" />
                <p className="mt-3 text-sm font-heading font-bold text-foreground">{lightbox.title}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GalleryPage;
