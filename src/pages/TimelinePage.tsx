import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Calendar } from "lucide-react";
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
      {/* Header */}
      <div className="container mx-auto px-4 max-w-3xl mb-10">
        <ScrollAnimation>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Oś czasu</h1>
          </div>
          <p className="text-muted-foreground ml-[52px]">
            Najważniejsze wydarzenia w historii Liszczanki Liszki
          </p>
        </ScrollAnimation>
      </div>

      <div className="container mx-auto px-4 max-w-3xl">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] sm:left-[23px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary/40 via-primary/20 to-primary/5" />

            <div className="space-y-3">
              {events.map((event, index) => {
                const isOpen = openId === event.id;
                const isFirst = index === 0;
                const isLast = index === events.length - 1;

                return (
                  <ScrollAnimation key={event.id} delay={index * 0.04}>
                    <div className="relative pl-12 sm:pl-14">
                      {/* Dot / circle */}
                      <div className="absolute left-0 top-0 flex flex-col items-center">
                        <div
                          className={`relative z-10 w-[14px] h-[14px] sm:w-4 sm:h-4 rounded-full border-[2.5px] transition-all duration-300 mt-[18px] ${
                            isOpen
                              ? "bg-primary border-primary shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
                              : "bg-background border-primary/40 hover:border-primary/70"
                          }`}
                        />
                      </div>

                      <button
                        onClick={() => setOpenId(isOpen ? null : event.id)}
                        className={`w-full text-left rounded-xl p-4 sm:p-5 transition-all duration-200 group border ${
                          isOpen
                            ? "bg-card border-primary/20 shadow-lg shadow-primary/5"
                            : "bg-card/50 border-border hover:bg-card hover:border-border/80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2.5 mb-1">
                              <span className={`inline-block text-[11px] sm:text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                                isOpen
                                  ? "bg-primary/15 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {event.year_label}
                              </span>
                            </div>
                            <h3 className="font-heading font-bold text-foreground text-sm sm:text-base leading-snug">
                              {event.title}
                            </h3>
                          </div>
                          <div className={`p-1.5 rounded-md transition-colors ${isOpen ? "bg-primary/10" : "bg-transparent group-hover:bg-muted"}`}>
                            <ChevronDown
                              className={`w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform duration-300 ${
                                isOpen ? "rotate-180 text-primary" : ""
                              }`}
                            />
                          </div>
                        </div>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 pt-3 border-t border-border/50">
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                  {event.description}
                                </p>
                              </div>
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
