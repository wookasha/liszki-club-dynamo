import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ScrollAnimation from "@/components/ScrollAnimation";
import { Trophy, Star } from "lucide-react";

interface PlayerStat {
  id: string;
  player_name: string;
  stat_type: string;
  count: number;
  sort_order: number;
}

const StatsPage = () => {
  const [scorers, setScorers] = useState<PlayerStat[]>([]);
  const [assisters, setAssisters] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from("player_stats")
        .select("*")
        .order("count", { ascending: false });

      if (data) {
        setScorers(data.filter((s) => s.stat_type === "goals"));
        setAssisters(data.filter((s) => s.stat_type === "assists"));
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const renderTable = (title: string, icon: React.ReactNode, data: PlayerStat[], emptyMsg: string) => (
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
                {data.map((player, idx) => (
                  <tr
                    key={player.id}
                    className={`border-b border-border/50 transition-colors hover:bg-muted/20 ${idx < 3 ? "bg-primary/5" : ""}`}
                  >
                    <td className="px-6 py-3 text-sm font-bold text-muted-foreground">
                      {idx < 3 ? (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          idx === 0 ? "bg-yellow-500/20 text-yellow-500" :
                          idx === 1 ? "bg-gray-400/20 text-gray-400" :
                          "bg-amber-700/20 text-amber-700"
                        }`}>
                          {idx + 1}
                        </span>
                      ) : (
                        idx + 1
                      )}
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
              Klasyfikacja strzelców i asystentów w bieżącym sezonie
            </p>
          </div>
        </ScrollAnimation>

        <div className="space-y-8">
          {renderTable("Strzelcy", <Trophy className="w-5 h-5 text-yellow-500" />, scorers, "Brak danych o strzelcach")}
          {renderTable("Asystenci", <Star className="w-5 h-5 text-primary" />, assisters, "Brak danych o asystentach")}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
