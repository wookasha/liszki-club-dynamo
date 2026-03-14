import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";

interface TimelineEvent {
  id: string;
  year_label: string;
  title: string;
  description: string;
  sort_order: number;
}

const TimelinePage = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("timeline_events").select("*").order("sort_order");
      if (data) setEvents(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <ScrollAnimation>
          <h1 className="section-heading text-3xl md:text-4xl mb-2">Oś czasu</h1>
          <p className="text-muted-foreground mb-10">Najważniejsze wydarzenia w historii Liszczanki</p>
        </ScrollAnimation>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[23px] sm:left-[27px] top-0 bottom-0 w-[2px] bg-primary/20" />

            <div className="space-y-4">
              {events.map((event, index) => {
                const isOpen = openId === event.id;
                return (
                  <ScrollAnimation key={event.id} delay={index * 0.05}>
                    <div className="relative pl-14 sm:pl-16">
                      {/* Dot */}
                      <div
                        className={`absolute left-[17px] sm:left-[21px] top-4 w-3 h-3 rounded-full border-2 transition-colors ${
                          isOpen ? "bg-primary border-primary" : "bg-background border-primary/50"
                        }`}
                      />

                      <button
                        onClick={() => setOpenId(isOpen ? null : event.id)}
                        className="w-full text-left glass-card rounded-xl p-4 sm:p-5 hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">
                              {event.year_label}
                            </span>
                            <h3 className="font-heading font-bold text-foreground text-sm sm:text-base mt-0.5">
                              {event.title}
                            </h3>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </div>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
                                {event.description}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    </div>
                  </ScrollAnimation>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePage;
