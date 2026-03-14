import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ScrollAnimation from "@/components/ScrollAnimation";

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

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <ScrollAnimation>
          <h1 className="section-heading text-3xl md:text-4xl mb-2">Historia klubu</h1>
          <p className="text-muted-foreground mb-10">Poznaj historię LKS Liszczanka Liszki</p>
        </ScrollAnimation>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <ScrollAnimation>
            <div className="glass-card rounded-xl p-6 md:p-10">
              <div className="prose prose-sm md:prose-base max-w-none text-foreground leading-relaxed space-y-4">
                {content.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="text-foreground/90">{paragraph}</p>
                ))}
              </div>
            </div>
          </ScrollAnimation>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
