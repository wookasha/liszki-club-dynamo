import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import ScrollAnimation from "@/components/ScrollAnimation";
import clubLogo from "@/assets/club-logo.png";

const HistoryPage = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("club_history").select("content").limit(1).single();
      if (data) setContent(data.content);
      setLoading(false);
    };
    fetch();
  }, []);

  const paragraphs = content.split("\n\n").filter(Boolean);

  // First paragraph is the "lead" / intro
  const lead = paragraphs[0] || "";
  const rest = paragraphs.slice(1);

  return (
    <div className="pt-24 pb-16">
      {/* Hero banner */}
      <div className="relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-4xl py-8 md:py-12">
          <ScrollAnimation>
            <div className="flex items-center gap-4 mb-4">
              <img src={clubLogo} alt="Herb Liszczanki" className="w-14 h-14 md:w-16 md:h-16 object-contain" />
              <div>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  Historia klubu
                </h1>
                <p className="text-muted-foreground text-sm md:text-base mt-1">
                  Od łąk za kościołem do klasy okręgowej — od 1948 roku
                </p>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${90 - i * 8}%` }} />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Lead paragraph — larger, accented */}
            {lead && (
              <ScrollAnimation>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="border-l-[3px] border-primary pl-6 md:pl-8"
                >
                  <p className="text-foreground/90 text-base md:text-lg leading-relaxed font-light">
                    {lead}
                  </p>
                </motion.div>
              </ScrollAnimation>
            )}

            {/* Remaining paragraphs */}
            <div className="glass-card rounded-xl p-6 md:p-10 space-y-6">
              {rest.map((paragraph, i) => (
                <ScrollAnimation key={i} delay={i * 0.04}>
                  <p className="text-foreground/85 text-sm md:text-base leading-[1.8]">
                    {paragraph}
                  </p>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
