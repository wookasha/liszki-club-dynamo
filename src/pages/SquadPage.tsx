import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import ScrollAnimation from "@/components/ScrollAnimation";
import { useSquadMembers, usePlayerStats } from "@/hooks/use-queries";
import { Shield, Star, Target, Handshake } from "lucide-react";

const POSITION_ORDER = ["goalkeeper", "defender", "midfielder", "forward", "coach"] as const;
const POSITION_LABELS: Record<string, string> = {
  goalkeeper: "Bramkarze",
  defender: "Obrońcy",
  midfielder: "Pomocnicy",
  forward: "Napastnicy",
  coach: "Sztab szkoleniowy",
};

const POSITION_SHORT: Record<string, string> = {
  goalkeeper: "BRM",
  defender: "OBR",
  midfielder: "POM",
  forward: "NAP",
  coach: "SZT",
};

// Club colors: red, white, blue
const POSITION_GRADIENT: Record<string, string> = {
  goalkeeper: "from-club-blue via-sky-500 to-club-blue",
  defender: "from-club-blue via-blue-600 to-indigo-700",
  midfielder: "from-club-red via-red-600 to-rose-700",
  forward: "from-club-red via-rose-500 to-club-red",
  coach: "from-slate-600 via-slate-500 to-slate-400",
};

const POSITION_BORDER: Record<string, string> = {
  goalkeeper: "from-sky-300 via-white to-sky-400",
  defender: "from-blue-300 via-white to-blue-400",
  midfielder: "from-rose-300 via-white to-rose-400",
  forward: "from-red-300 via-white to-red-400",
  coach: "from-slate-300 via-white to-slate-400",
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
  return new Date().getFullYear() - birthYear;
}

const PaniniCard = ({
  player,
  stats,
  positionGradient,
  positionBorder,
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
  positionBorder: string;
  positionShort: string;
  delay: number;
}) => {
  const [flipped, setFlipped] = useState(false);
  const [holoPos, setHoloPos] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);
  const age = getAge(player.birth_year);
  const isCoach = player.position === "coach";

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHoloPos({ x, y });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="perspective-1000"
    >
      <div
        ref={cardRef}
        className="relative w-full aspect-[2.5/3.8] cursor-pointer"
        onClick={() => !isCoach && setFlipped((v) => !v)}
        onMouseEnter={() => !isCoach && setFlipped(true)}
        onMouseLeave={() => { setFlipped(false); setHoloPos({ x: 50, y: 50 }); }}
        onMouseMove={handleMouseMove}
      >
        <div
          className="relative w-full h-full transition-transform duration-700 ease-in-out"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ═══════ FRONT ═══════ */}
          <div
            className="absolute inset-0 rounded-lg overflow-hidden shadow-lg transition-shadow duration-500"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Border */}
            <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${positionBorder} p-[3px] z-10 pointer-events-none`}>
              <div className="w-full h-full rounded-[5px] border border-white/20" />
            </div>

            <div className="absolute inset-[3px] rounded-[5px] overflow-hidden bg-gradient-to-b from-muted to-card">
              {/* Top bar */}
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

              {/* Photo */}
              <div className="relative overflow-hidden" style={{ height: "calc(100% - 72px)" }}>
                {player.photo_url ? (
                  <img
                    src={player.photo_url}
                    alt={player.full_name}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted via-card to-muted">
                    <span className="text-6xl font-heading font-black text-muted-foreground/20">
                      {player.shirt_number || "?"}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

                {player.is_captain && (
                  <div className="absolute top-2 left-2 z-30 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg ring-2 ring-amber-300/50">
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                )}

                <div className="absolute top-2 right-2 z-30 opacity-40 w-6 h-6 rounded-sm bg-gradient-to-br from-white/80 to-white/40 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-club-red" />
                </div>
              </div>

              {/* Name plate */}
              <div className={`relative z-20 px-3 py-2 bg-gradient-to-r ${positionGradient}`}>
                <h3 className="font-heading font-bold text-[11px] sm:text-xs text-white text-center leading-tight truncate uppercase tracking-wide drop-shadow-sm">
                  {player.full_name}
                </h3>
                {age && !isCoach && (
                  <p className="text-[9px] text-white/70 text-center font-medium mt-0.5">
                    rocznik {player.birth_year}
                  </p>
                )}
              </div>
            </div>

            {/* Holographic overlay */}
            <div
              className="absolute inset-0 rounded-lg z-20 pointer-events-none opacity-0 hover-parent-holo transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${holoPos.x}% ${holoPos.y}%, 
                  rgba(255,0,80,0.15) 0%, 
                  rgba(0,100,255,0.12) 25%, 
                  rgba(255,255,255,0.1) 40%, 
                  rgba(0,200,255,0.08) 55%, 
                  rgba(255,50,100,0.06) 70%, 
                  transparent 85%)`,
                mixBlendMode: "screen",
              }}
            />
          </div>

          {/* ═══════ BACK ═══════ */}
          <div
            className="absolute inset-0 rounded-lg overflow-hidden shadow-lg"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${positionBorder} p-[3px] z-10 pointer-events-none`}>
              <div className="w-full h-full rounded-[5px] border border-white/20" />
            </div>

            <div className="absolute inset-[3px] rounded-[5px] overflow-hidden bg-gradient-to-b from-[hsl(222,47%,8%)] to-[hsl(222,44%,6%)] flex flex-col">
              <div className={`flex items-center justify-between px-3 py-1.5 bg-gradient-to-r ${positionGradient}`}>
                <span className="font-heading font-bold text-xs text-white/90 tracking-wider uppercase">
                  {positionShort}
                </span>
                {player.shirt_number && (
                  <span className="font-heading font-black text-lg text-white leading-none drop-shadow-md">
                    {player.shirt_number}
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center px-4 py-3 relative">
                {player.shirt_number && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="font-heading font-black text-[100px] leading-none text-white/[0.04]">
                      {player.shirt_number}
                    </span>
                  </div>
                )}

                <h4 className="font-heading font-bold text-xs sm:text-sm text-foreground uppercase tracking-wider mb-1 text-center leading-tight">
                  {player.full_name}
                </h4>
                {age && (
                  <p className="text-[10px] text-muted-foreground mb-4">
                    {age} lat · rocznik {player.birth_year}
                  </p>
                )}

                <div className={`w-12 h-0.5 rounded bg-gradient-to-r ${positionGradient} mb-4`} />

                <div className="w-full space-y-3">
                  <StatRow icon={<Target className="w-4 h-4 text-amber-400" />} label="Bramki" value={stats?.goals ?? 0} />
                  <StatRow icon={<Handshake className="w-4 h-4 text-emerald-400" />} label="Asysty" value={stats?.assists ?? 0} />
                  <StatRow icon={<div className="w-3 h-4 rounded-[1px] bg-yellow-400" />} label="Żółte kartki" value={stats?.yellow_cards ?? 0} />
                  <StatRow icon={<div className="w-3 h-4 rounded-[1px] bg-red-500" />} label="Czerwone" value={stats?.red_cards ?? 0} />
                </div>
              </div>

              <div className={`px-3 py-2 bg-gradient-to-r ${positionGradient}`}>
                <p className="font-heading font-bold text-[9px] text-white/60 text-center uppercase tracking-widest">
                  Sezon 2024/2025
                </p>
              </div>
            </div>

            {/* Holographic overlay on back too */}
            <div
              className="absolute inset-0 rounded-lg z-20 pointer-events-none transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${100 - holoPos.x}% ${holoPos.y}%, 
                  rgba(0,100,255,0.12) 0%, 
                  rgba(255,0,80,0.1) 30%, 
                  rgba(255,255,255,0.08) 50%, 
                  transparent 80%)`,
                mixBlendMode: "screen",
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StatRow = ({ icon, label, value, suffix = "" }: { icon: React.ReactNode; label: string; value: number; suffix?: string }) => (
  <div className="flex items-center justify-between gap-2 text-xs">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-muted-foreground">{label}</span>
    </div>
    <span className="font-heading font-bold text-foreground">{value}{suffix}</span>
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
      border: POSITION_BORDER[pos],
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
                    positionBorder={group.border}
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
