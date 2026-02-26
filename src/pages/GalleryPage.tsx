import { useState, useEffect } from "react";
import { ExternalLink, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ScrollAnimation from "@/components/ScrollAnimation";

interface GalleryAlbum {
  id: string;
  title: string;
  google_photos_url: string;
  cover_image_url: string | null;
  sort_order: number;
}

const GalleryPage = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("gallery_albums").select("*").order("sort_order", { ascending: true })
      .then(({ data }) => { setAlbums((data as GalleryAlbum[]) || []); setLoading(false); });
  }, []);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <h1 className="section-heading text-4xl md:text-5xl mb-2">Galeria</h1>
          <div className="section-heading-accent mb-10" />
        </ScrollAnimation>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Ładowanie galerii...</p>
        ) : albums.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Galeria jest pusta. Wkrótce pojawią się albumy!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album, i) => (
              <ScrollAnimation key={album.id} delay={i * 0.05}>
                <a
                  href={album.google_photos_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card rounded-xl overflow-hidden hover-lift group block"
                >
                  {album.cover_image_url ? (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={album.cover_image_url}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Image className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-5 flex items-center justify-between">
                    <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {album.title}
                    </h3>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </a>
              </ScrollAnimation>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
