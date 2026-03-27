import { motion } from "framer-motion";
import ScrollAnimation from "@/components/ScrollAnimation";
import { useSquadMembers } from "@/hooks/use-queries";
import { Shield, Star } from "lucide-react";

const POSITION_ORDER = ["goalkeeper", "defender", "midfielder", "forward", "coach"] as const;
const POSITION_LABELS: Record<string, string> = {
  goalkeeper: "Bramkarze",
  defender: "Obrońcy",
  midfielder: "Pomocnicy",
  forward: "Napastnicy",
  coach: "Sztab szkoleniowy",
};

const POSITION_COLORS: Record<string, string> = {
  goalkeeper: "from-amber-500/80 to-amber-700/80",
  defender: "from-blue-500/80 to-blue-700/80",
  midfielder: "from-emerald-500/80 to-emerald-700/80",
  forward: "from-red-500/80 to-red-700/80",
  coach: "from-slate-500/80 to-slate-700/80",
};

const SquadPage = () => {
  const { data: members = [], isLoading } = useSquadMembers();

  if (isLoading) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4 text-center py-20">
          <div className="animate-pulse text-muted-foreground">Ładowanie kadry...</div>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4 text-center py-20">
          <p className="text-muted-foreground">Kadra nie została jeszcze uzupełniona.</p>
        </div>
      </div>
    );
  }

  const grouped = POSITION_ORDER
    .map((pos) => ({
      position: pos,
      label: POSITION_LABELS[pos],
      colors: POSITION_COLORS[pos],
      players: members.filter((m) => m.position === pos),
    }))
    .filter((g) => g.players.length > 0);

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollAnimation>
          <h1 className="section-heading text-4xl text-center mb-2">Kadra</h1>
          <p className="text-center text-muted-foreground mb-12">Sezon 2024/2025</p>
        </ScrollAnimation>

        {grouped.map((group, gi) => (
          <div key={group.position} className="mb-12">
            <ScrollAnimation>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {group.label}
              </h2>
            </ScrollAnimation>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {group.players.map((player, i) => (
                <ScrollAnimation key={player.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.1 + i * 0.05 }}
                    className="group relative rounded-xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Photo */}
                    <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                      {player.photo_url ? (
                        <img
                          src={player.photo_url}
                          alt={player.full_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <span className="text-5xl font-heading font-bold text-muted-foreground/30">
                            {player.shirt_number || "?"}
                          </span>
                        </div>
                      )}

                      {/* Number badge */}
                      {player.shirt_number && (
                        <div className="absolute top-2 right-2 w-9 h-9 rounded-lg bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center">
                          <span className="font-heading font-bold text-sm text-foreground">
                            {player.shirt_number}
                          </span>
                        </div>
                      )}

                      {/* Captain badge */}
                      {player.is_captain && (
                        <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
                          <Star className="w-4 h-4 text-white fill-white" />
                        </div>
                      )}

                      {/* Bottom gradient overlay with position */}
                      <div className={`absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t ${group.colors} to-transparent`} />
                    </div>

                    {/* Info */}
                    <div className="p-3 text-center">
                      <h3 className="font-heading font-bold text-sm text-foreground leading-tight truncate">
                        {player.full_name}
                      </h3>
                      {player.birth_year && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          rocznik {player.birth_year}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SquadPage;
