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

/* ─── Geometric SVG background pattern (club colors) ─── */
const CardPattern = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 200 300"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bold curved stripes — red, white, blue */}
    <path d="M-30 300 Q30 200 -20 100 Q-50 40 10 -20 L-40 -20 L-40 300Z" fill="#1e3a8a" opacity="0.7" />
    <path d="M-10 300 Q40 200 0 100 Q-30 40 30 -20 L10 -20 Q-50 40 -20 100 Q30 200 -30 300Z" fill="#ffffff" opacity="0.5" />
    <path d="M10 300 Q60 200 20 100 Q-10 40 50 -20 L30 -20 Q-30 40 0 100 Q40 200 -10 300Z" fill="#dc2626" opacity="0.55" />
    <path d="M30 300 Q80 200 40 100 Q10 40 70 -20 L50 -20 Q-10 40 20 100 Q60 200 10 300Z" fill="#1e3a8a" opacity="0.4" />
    <path d="M50 300 Q100 200 60 100 Q30 40 90 -20 L70 -20 Q10 40 40 100 Q80 200 30 300Z" fill="#ffffff" opacity="0.3" />

    {/* Bottom corner accent */}
    <path d="M200 300 Q160 250 200 200 L200 300Z" fill="#dc2626" opacity="0.4" />
    <path d="M200 300 Q170 260 200 220 L200 300Z" fill="#1e3a8a" opacity="0.35" />
    <path d="M200 300 Q180 270 200 240 L200 300Z" fill="#ffffff" opacity="0.25" />

    {/* Top-right geometric block */}
    <rect x="140" y="0" width="60" height="10" fill="#dc2626" opacity="0.45" />
    <rect x="160" y="10" width="40" height="8" fill="#1e3a8a" opacity="0.35" />
    <rect x="170" y="18" width="30" height="6" fill="#ffffff" opacity="0.25" />
  </svg>
);

const PaniniCard = ({
  player,
  stats,
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
        className="relative w-full aspect-[2.5/3.8] cursor-pointer group"
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
            className="absolute inset-0 rounded-xl overflow-hidden shadow-xl border-2 border-blue-200/50"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* White base */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-blue-50" />

            {/* Geometric pattern overlay */}
            <CardPattern />

            {/* Position badge — top-left */}
            <div className="absolute top-2 left-2 z-30 px-2 py-0.5 bg-blue-900/90 rounded-sm">
              <span className="font-heading font-bold text-[10px] text-white tracking-widest">
                {positionShort}
              </span>
            </div>

            {/* Shirt number — top-left under position */}
            {player.shirt_number && (
              <div className="absolute top-8 left-2 z-30">
                <span className="font-heading font-black text-2xl text-blue-900/80 drop-shadow-sm leading-none">
                  {player.shirt_number}
                </span>
              </div>
            )}

            {/* Captain star */}
            {player.is_captain && (
              <div className="absolute top-2 right-2 z-30 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md ring-2 ring-amber-300/60">
                <Star className="w-3.5 h-3.5 text-white fill-white" />
              </div>
            )}

            {/* Club shield — top-right (if not captain) */}
            {!player.is_captain && (
              <div className="absolute top-2 right-2 z-30 opacity-50">
                <Shield className="w-5 h-5 text-blue-900" />
              </div>
            )}

            {/* Player photo — centered, large */}
            <div className="absolute inset-0 flex items-end justify-center z-20 pointer-events-none">
              {player.photo_url ? (
                <img
                  src={player.photo_url}
                  alt={player.full_name}
                  className="w-[85%] h-[80%] object-cover object-top drop-shadow-lg"
                  style={{ maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)" }}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-[75%] flex items-center justify-center">
                  <span className="text-7xl font-heading font-black text-blue-900/10">
                    {player.shirt_number || "?"}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom name bar */}
            <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 px-3 py-2">
              <h3 className="font-heading font-bold text-[10px] sm:text-xs text-white text-center leading-tight truncate uppercase tracking-wider">
                {player.full_name}
              </h3>
              {age && !isCoach && (
                <div className="flex items-center justify-center gap-3 mt-0.5">
                  <span className="text-[8px] text-blue-200/70 font-medium">
                    rocznik {player.birth_year}
                  </span>
                  {stats && (stats.goals > 0 || stats.assists > 0) && (
                    <div className="flex gap-1.5">
                      {stats.goals > 0 && (
                        <span className="text-[8px] bg-amber-500/80 text-white px-1 rounded-sm font-bold">{stats.goals}⚽</span>
                      )}
                      {stats.assists > 0 && (
                        <span className="text-[8px] bg-emerald-500/80 text-white px-1 rounded-sm font-bold">{stats.assists}🅰</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Holographic overlay */}
            {!flipped && (
              <div
                className="absolute inset-0 rounded-xl z-40 pointer-events-none transition-opacity duration-300"
                style={{
                  opacity: holoPos.x !== 50 || holoPos.y !== 50 ? 1 : 0,
                  background: `radial-gradient(circle at ${holoPos.x}% ${holoPos.y}%, 
                    rgba(255,0,80,0.15) 0%, 
                    rgba(0,100,255,0.12) 20%, 
                    rgba(255,255,255,0.15) 35%, 
                    rgba(0,200,255,0.08) 50%, 
                    rgba(255,50,100,0.05) 65%, 
                    transparent 80%)`,
                  mixBlendMode: "screen",
                }}
              />
            )}
          </div>

          {/* ═══════ BACK ═══════ */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-xl border-2 border-blue-200/50"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-[hsl(222,47%,10%)] to-blue-900" />
            <CardPattern />

            <div className="absolute inset-0 flex flex-col">
              {/* Top bar */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-blue-800 to-blue-600">
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

                <h4 className="font-heading font-bold text-xs sm:text-sm text-white uppercase tracking-wider mb-1 text-center leading-tight">
                  {player.full_name}
                </h4>
                {age && (
                  <p className="text-[10px] text-blue-300/70 mb-4">
                    {age} lat · rocznik {player.birth_year}
                  </p>
                )}

                <div className="w-12 h-0.5 rounded bg-gradient-to-r from-red-500 via-white to-blue-500 mb-4" />

                <div className="w-full space-y-3">
                  <StatRow icon={<Target className="w-4 h-4 text-amber-400" />} label="Bramki" value={stats?.goals ?? 0} />
                  <StatRow icon={<Handshake className="w-4 h-4 text-emerald-400" />} label="Asysty" value={stats?.assists ?? 0} />
                  <StatRow icon={<div className="w-3 h-4 rounded-[1px] bg-yellow-400" />} label="Żółte kartki" value={stats?.yellow_cards ?? 0} />
                  <StatRow icon={<div className="w-3 h-4 rounded-[1px] bg-red-500" />} label="Czerwone" value={stats?.red_cards ?? 0} />
                </div>
              </div>

              <div className="px-3 py-2 bg-gradient-to-r from-blue-800 to-blue-600">
                <p className="font-heading font-bold text-[9px] text-white/60 text-center uppercase tracking-widest">
                  Sezon 2024/2025
                </p>
              </div>
            </div>

            {/* Holographic overlay on back */}
            <div
              className="absolute inset-0 rounded-xl z-20 pointer-events-none transition-opacity duration-300"
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
      <span className="text-blue-200/70">{label}</span>
    </div>
    <span className="font-heading font-bold text-white">{value}{suffix}</span>
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
