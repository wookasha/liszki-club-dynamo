import { usePlayerStats } from "@/hooks/use-queries";
import ScrollAnimation from "@/components/ScrollAnimation";
import { Trophy, Star, ShieldCheck } from "lucide-react";
import { useMemo } from "react";

interface CardStat {
  player_name: string;
  yellow: number;
  red: number;
}

const StatsPage = () => {
  const { data: rawStats = [], isLoading: loading } = usePlayerStats();

  const { scorers, assisters, cleanSheets, cards } = useMemo(() => {
    const scorers = rawStats.filter((s: any) => s.stat_type === "goals");
    const assisters = rawStats.filter((s: any) => s.stat_type === "assists");
    const cleanSheets = rawStats.filter((s: any) => s.stat_type === "clean_sheets");

    const yellowCards = rawStats.filter((s: any) => s.stat_type === "yellow_cards");
    const redCards = rawStats.filter((s: any) => s.stat_type === "red_cards");

    const playerMap = new Map<string, CardStat>();
    yellowCards.forEach((s: any) => {
      playerMap.set(s.player_name, { player_name: s.player_name, yellow: s.count, red: 0 });
    });
    redCards.forEach((s: any) => {
      const existing = playerMap.get(s.player_name);
      if (existing) existing.red = s.count;
      else playerMap.set(s.player_name, { player_name: s.player_name, yellow: 0, red: s.count });
    });

    const cards = Array.from(playerMap.values()).sort((a, b) => (b.yellow + b.red) - (a.yellow + a.red));
    return { scorers, assisters, cleanSheets, cards };
  }, [rawStats]);

  const renderTable = (title: string, icon: React.ReactNode, data: any[], emptyMsg: string) => (
    <ScrollAnimation>
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          {icon}
          <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
        </div>
        {data.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">{emptyMsg}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zawodnik</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                    {title === "Strzelcy" ? "Bramki" : "Asysty"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((player: any, idx: number) => (
                  <tr key={player.id} className={`border-b border-border/50 transition-colors hover:bg-muted/20 ${idx < 3 ? "bg-primary/5" : ""}`}>
                    <td className="px-6 py-3 text-sm font-bold text-muted-foreground">
                      {idx < 3 ? (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          idx === 0 ? "bg-yellow-500/20 text-yellow-500" :
                          idx === 1 ? "bg-gray-400/20 text-gray-400" :
                          "bg-amber-700/20 text-amber-700"
                        }`}>{idx + 1}</span>
                      ) : idx + 1}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-foreground">{player.player_name}</td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-primary">{player.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ScrollAnimation>
  );

  const YellowCardIcon = () => <div className="w-4 h-5 rounded-[2px] bg-yellow-400 border border-yellow-500 inline-block" />;
  const RedCardIcon = () => <div className="w-4 h-5 rounded-[2px] bg-red-500 border border-red-600 inline-block" />;

  const renderCardsTable = () => (
    <ScrollAnimation>
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="flex gap-1"><YellowCardIcon /><RedCardIcon /></div>
          <h2 className="font-heading text-xl font-bold text-foreground">Kartki</h2>
        </div>
        {cards.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">Brak danych o kartkach</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zawodnik</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">
                    <div className="flex justify-center"><YellowCardIcon /></div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">
                    <div className="flex justify-center"><RedCardIcon /></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {cards.map((player, idx) => (
                  <tr key={player.player_name} className="border-b border-border/50 transition-colors hover:bg-muted/20">
                    <td className="px-6 py-3 text-sm font-bold text-muted-foreground">{idx + 1}</td>
                    <td className="px-6 py-3 text-sm font-medium text-foreground">{player.player_name}</td>
                    <td className="px-6 py-3 text-center text-sm font-bold text-yellow-500">{player.yellow}</td>
                    <td className="px-6 py-3 text-center text-sm font-bold text-red-500">{player.red}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ScrollAnimation>
  );

  if (loading) {
    return (
      <div className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <ScrollAnimation>
          <div className="text-center mb-12">
            <h1 className="section-heading text-3xl md:text-4xl mb-4">Statystyki indywidualne</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Klasyfikacja strzelców, asystentów i kartek w bieżącym sezonie
            </p>
          </div>
        </ScrollAnimation>
        <div className="space-y-8">
          {renderTable("Strzelcy", <Trophy className="w-5 h-5 text-yellow-500" />, scorers, "Brak danych o strzelcach")}
          {renderTable("Asystenci", <Star className="w-5 h-5 text-primary" />, assisters, "Brak danych o asystentach")}
          {renderCardsTable()}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
