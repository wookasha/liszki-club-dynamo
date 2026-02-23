import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollAnimation from "@/components/ScrollAnimation";

const galleries = [
  {
    name: "Sezon 2025/2026",
    photos: [
      { id: 1, color: "from-primary/30 to-secondary/30", label: "Mecz z Orlętami" },
      { id: 2, color: "from-secondary/30 to-pitch-green/30", label: "Trening drużyny" },
      { id: 3, color: "from-pitch-green/30 to-primary/30", label: "Derbowe emocje" },
      { id: 4, color: "from-primary/20 to-secondary/20", label: "Kibice Liszczanki" },
      { id: 5, color: "from-secondary/20 to-primary/20", label: "Szatnia po meczu" },
      { id: 6, color: "from-pitch-green/20 to-secondary/20", label: "Puchar gminy" },
    ],
  },
  {
    name: "Młodzież 2025",
    photos: [
      { id: 7, color: "from-primary/30 to-pitch-green/30", label: "Turniej młodzików" },
      { id: 8, color: "from-secondary/30 to-primary/30", label: "Trening żaków" },
      { id: 9, color: "from-pitch-green/30 to-secondary/30", label: "Orliki na boisku" },
    ],
  },
];

const GalleryPage = () => {
  const [lightbox, setLightbox] = useState<{ label: string; color: string } | null>(null);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <h1 className="section-heading text-4xl md:text-5xl mb-2">Galeria</h1>
          <div className="section-heading-accent mb-10" />
        </ScrollAnimation>

        {galleries.map((gallery) => (
          <div key={gallery.name} className="mb-14">
            <ScrollAnimation>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">{gallery.name}</h2>
            </ScrollAnimation>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.photos.map((photo, i) => (
                <ScrollAnimation key={photo.id} delay={i * 0.05}>
                  <div
                    onClick={() => setLightbox(photo)}
                    className={`aspect-[4/3] bg-gradient-to-br ${photo.color} rounded-xl cursor-pointer hover-lift flex items-center justify-center border border-border/50`}
                  >
                    <span className="text-sm text-muted-foreground font-medium">{photo.label}</span>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        ))}

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
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-6 right-6 text-foreground hover:text-primary transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className={`w-full max-w-3xl aspect-video bg-gradient-to-br ${lightbox.color} rounded-2xl flex items-center justify-center border border-border`}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-lg font-heading font-bold text-foreground">{lightbox.label}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GalleryPage;
