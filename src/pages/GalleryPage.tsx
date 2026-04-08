import { Link } from "react-router-dom";
import { Image } from "lucide-react";
import { useState } from "react";
import { useGalleryAlbums } from "@/hooks/use-queries";
import ScrollAnimation from "@/components/ScrollAnimation";

const R2_BASE = "https://pub-d35a7dceb96745ed8eda4586e984ca7f.r2.dev";

const CoverImage = ({ url, title }: { url: string | null; title: string }) => {
  const [error, setError] = useState(false);

  if (!url || error) {
    return (
      <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <Image className="w-16 h-16 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="aspect-[4/3] overflow-hidden">
      <img
        src={url}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    </div>
  );
};

const GalleryPage = () => {
  const { data: albums = [], isLoading: loading } = useGalleryAlbums();

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <h1 className="section-heading text-4xl md:text-5xl mb-2">Galeria</h1>
          <div className="section-heading-accent mb-10" />
        </ScrollAnimation>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-5"><div className="h-5 bg-muted rounded w-2/3" /></div>
              </div>
            ))}
          </div>
        ) : albums.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Galeria jest pusta. Wkrótce pojawią się albumy!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album: any, i: number) => {
              const coverUrl = album.cover_image_url || (album.photo_count > 0
                ? `${R2_BASE}/${album.r2_folder_path}/photo_1.webp`
                : null);

              return (
                <ScrollAnimation key={album.id} delay={i * 0.05}>
                  <Link
                    to={`/galeria/${album.id}`}
                    className="glass-card rounded-xl overflow-hidden hover-lift group block h-full flex flex-col"
                  >
                    <CoverImage url={coverUrl} title={album.title} />
                    <div className="p-5 flex items-center justify-between flex-1">
                      <div>
                        <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {album.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{album.photo_count} zdjęć</p>
                      </div>
                    </div>
                  </Link>
                </ScrollAnimation>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
