import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollAnimation from "@/components/ScrollAnimation";
import { useSquadMembers, usePlayerStats } from "@/hooks/use-queries";
import { Shield, Star, Target, Handshake, AlertTriangle } from "lucide-react";

const POSITION_ORDER = ["goalkeeper", "defender", "midfielder", "forward", "coach"] as const;
const POSITION_LABELS: Record<string, string> = {
  goalkeeper: "Bramkarze",
  defender: "Obrońcy",
  midfielder: "Pomocnicy",
  forward: "Napastnicy",
  coach: "Sztab szkoleniowy",
};

const POSITION_SHORT: Record<string, string> = {
  goalkeeper: "BR",
  defender: "OB",
  midfielder: "PO",
  forward: "NA",
  coach: "SZT",
};

const POSITION_GRADIENT: Record<string, string> = {
  goalkeeper: "from-amber-600 via-amber-500 to-yellow-400",
  defender: "from-blue-700 via-blue-500 to-sky-400",
  midfielder: "from-emerald-700 via-emerald-500 to-green-400",
  forward: "from-red-700 via-red-500 to-rose-400",
  coach: "from-slate-600 via-slate-500 to-slate-400",
};

interface PlayerStatsMap {
  [playerName: string]: {
    goals: number;
    assists: number;
    yellow_cards: number;
    red_cards: number;
  };
}

function buildStatsMap(stats: { player_name: string; stat_type: string; count: number }[]): PlayerStatsMap {
  const map: PlayerStatsMap = {};
  for (const s of stats) {
    if (!map[s.player_name]) {
      map[s.player_name] = { goals: 0, assists: 0, yellow_cards: 0, red_cards: 0 };
    }
    if (s.stat_type === "goals") map[s.player_name].goals = s.count;
    if (s.stat_type === "assists") map[s.player_name].assists = s.count;
    if (s.stat_type === "yellow_cards") map[s.player_name].yellow_cards = s.count;
    if (s.stat_type === "red_cards") map[s.player_name].red_cards = s.count;
  }
  return map;
}

function getAge(birthYear: number | null): number | null {
  if (!birthYear) return null;
  const now = new Date();
  return now.getFullYear() - birthYear;
}

const PaniniCard = ({
  player,
  stats,
  positionGradient,
  positionShort,
  delay,
}: {
  player: {
    id: string;
    full_name: string;
    shirt_number: number | null;
    birth_year: number | null;
    photo_url: string | null;
    is_captain: boolean;
    position: string;
  };
  stats: { goals: number; assists: number; yellow_cards: number; red_cards: number } | undefined;
  positionGradient: string;
  positionShort: string;
  delay: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const age = getAge(player.birth_year);
  const isCoach = player.position === "coach";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateY: -5 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="perspective-1000"
    >
      <div
        className="relative w-full cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered((v) => !v)}
      >
        {/* Card container with golden border */}
        <div className="relative aspect-[2.5/3.8] rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:shadow-amber-500/20 transition-all duration-500 group-hover:-translate-y-2">
          {/* Golden border frame */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 p-[3px] z-10 pointer-events-none">
            <div className="w-full h-full rounded-[5px] border-2 border-amber-400/30" />
          </div>

          {/* Inner card */}
          <div className="absolute inset-[3px] rounded-[5px] overflow-hidden bg-gradient-to-b from-muted to-card">
            {/* Top bar with position & number */}
            <div className={`relative z-20 flex items-center justify-between px-3 py-1.5 bg-gradient-to-r ${positionGradient}`}>
              <span className="font-heading font-bold text-xs text-white/90 tracking-wider uppercase">
                {positionShort}
              </span>
              {player.shirt_number && (
                <span className="font-heading font-black text-lg text-white leading-none drop-shadow-md">
                  {player.shirt_number}
                </span>
              )}
            </div>

            {/* Photo area */}
            <div className="relative flex-1 overflow-hidden" style={{ height: "calc(100% - 72px)" }}>
              {player.photo_url ? (
                <img
                  src={player.photo_url}
                  alt={player.full_name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted via-card to-muted">
                  <span className="text-6xl font-heading font-black text-muted-foreground/20">
                    {player.shirt_number || "?"}
                  </span>
                </div>
              )}

              {/* Subtle vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

              {/* Captain badge */}
              {player.is_captain && (
                <div className="absolute top-2 left-2 z-30">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg ring-2 ring-amber-300/50">
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
              )}

              {/* Panini logo-like accent */}
              <div className="absolute top-2 right-2 z-30 opacity-40">
                <div className="w-6 h-6 rounded-sm bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>

            {/* Name plate */}
            <div className={`relative z-20 px-3 py-2 bg-gradient-to-r ${positionGradient}`}>
              <h3 className="font-heading font-bold text-[11px] sm:text-xs text-white text-center leading-tight truncate uppercase tracking-wide drop-shadow-sm">
                {player.full_name}
              </h3>
              {age && !isCoach && (
                <p className="text-[9px] text-white/70 text-center font-medium mt-0.5">
                  Wiek: {age} lat
                </p>
              )}
            </div>
          </div>

          {/* Stats overlay on hover */}
          <AnimatePresence>
            {isHovered && !isCoach && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-[3px] rounded-[5px] z-30 flex flex-col items-center justify-center backdrop-blur-sm"
                style={{ background: "rgba(10, 15, 30, 0.88)" }}
              >
                {/* Decorative top line */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${positionGradient}`} />

                <div className="text-center px-3">
                  {player.shirt_number && (
                    <div className="font-heading font-black text-5xl text-amber-400/30 leading-none mb-1">
                      {player.shirt_number}
                    </div>
                  )}
                  <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider mb-4">
                    {player.full_name}
                  </h4>

                  <div className="space-y-2.5 w-full">
                    <StatRow
                      icon={<Target className="w-4 h-4 text-amber-400" />}
                      label="Bramki"
                      value={stats?.goals ?? 0}
                    />
                    <StatRow
                      icon={<Handshake className="w-4 h-4 text-emerald-400" />}
                      label="Asysty"
                      value={stats?.assists ?? 0}
                    />
                    <StatRow
                      icon={<div className="w-3 h-4 rounded-[1px] bg-yellow-400" />}
                      label="Żółte kartki"
                      value={stats?.yellow_cards ?? 0}
                    />
                    <StatRow
                      icon={<div className="w-3 h-4 rounded-[1px] bg-red-500" />}
                      label="Czerwone kartki"
                      value={stats?.red_cards ?? 0}
                    />
                    {age && (
                      <StatRow
                        icon={<span className="text-xs text-blue-400 font-bold w-4 text-center">⏳</span>}
                        label="Wiek"
                        value={age}
                        suffix=" lat"
                      />
                    )}
                  </div>
                </div>

                {/* Decorative bottom line */}
                <div className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r ${positionGradient}`} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Holographic shimmer effect */}
          <div className="absolute inset-0 rounded-lg z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-white/5" />
        </div>
      </div>
    </motion.div>
  );
};

const StatRow = ({
  icon,
  label,
  value,
  suffix = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) => (
  <div className="flex items-center justify-between gap-2 text-xs">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-muted-foreground">{label}</span>
    </div>
    <span className="font-heading font-bold text-foreground">
      {value}{suffix}
    </span>
  </div>
);

const SquadPage = () => {
  const { data: members = [], isLoading } = useSquadMembers();
  const { data: rawStats = [] } = usePlayerStats();
  const statsMap = buildStatsMap(rawStats);

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
      gradient: POSITION_GRADIENT[pos],
      short: POSITION_SHORT[pos],
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
          <div key={group.position} className="mb-14">
            <ScrollAnimation>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {group.label}
              </h2>
            </ScrollAnimation>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {group.players.map((player, i) => (
                <ScrollAnimation key={player.id}>
                  <PaniniCard
                    player={player}
                    stats={statsMap[player.full_name]}
                    positionGradient={group.gradient}
                    positionShort={group.short}
                    delay={gi * 0.08 + i * 0.04}
                  />
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
