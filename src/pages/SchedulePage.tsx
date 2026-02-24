import { useState, useEffect } from "react";
import { MapPin, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ScrollAnimation from "@/components/ScrollAnimation";

interface Match {
  id: string;
  match_date: string;
  home_team: string;
  away_team: string;
  venue: string;
  score_home: number | null;
  score_away: number | null;
  is_played: boolean;
}

const SchedulePage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("matches").select("*").order("match_date", { ascending: true });
      setMatches((data as Match[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const upcoming = matches.filter((m) => !m.is_played);
  const results = matches.filter((m) => m.is_played).reverse();

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <h1 className="section-heading text-4xl md:text-5xl mb-2">Terminarz i wyniki</h1>
          <div className="section-heading-accent mb-10" />
        </ScrollAnimation>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Ładowanie...</p>
        ) : matches.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Brak meczów w terminarzu.</p>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Nadchodzące mecze</h2>
                </ScrollAnimation>
                <div className="space-y-4 mb-14">
                  {upcoming.map((m, i) => (
                    <ScrollAnimation key={m.id} delay={i * 0.05}>
                      <div className="glass-card rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                          <span>{new Date(m.match_date).toLocaleDateString("pl-PL", { day: "numeric", month: "long" })}</span>
                          <span>•</span>
                          <span>{new Date(m.match_date).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div className="flex items-center gap-4 text-center">
                          <span className={`font-heading text-base font-bold ${m.home_team.includes("Liszczanka") ? "text-primary" : "text-foreground"}`}>{m.home_team}</span>
                          <span className="font-heading text-xl text-muted-foreground">vs</span>
                          <span className={`font-heading text-base font-bold ${m.away_team.includes("Liszczanka") ? "text-primary" : "text-foreground"}`}>{m.away_team}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${m.venue === "dom" ? "bg-pitch-green/10 text-pitch-green" : "bg-secondary/10 text-secondary"}`}>
                          {m.venue === "dom" ? <span className="flex items-center gap-1"><Home className="w-3 h-3" /> Dom</span> : <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Wyjazd</span>}
                        </span>
                      </div>
                    </ScrollAnimation>
                  ))}
                </div>
              </>
            )}

            {results.length > 0 && (
              <>
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Wyniki</h2>
                </ScrollAnimation>
                <div className="space-y-4">
                  {results.map((m, i) => {
                    const liszczankaHome = m.home_team.includes("Liszczanka");
                    const lGoals = liszczankaHome ? m.score_home! : m.score_away!;
                    const oGoals = liszczankaHome ? m.score_away! : m.score_home!;
                    const win = lGoals > oGoals;
                    const draw = lGoals === oGoals;
                    return (
                      <ScrollAnimation key={m.id} delay={i * 0.05}>
                        <div className="glass-card rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="text-sm text-muted-foreground shrink-0">
                            {new Date(m.match_date).toLocaleDateString("pl-PL", { day: "numeric", month: "long" })}
                          </div>
                          <div className="flex items-center gap-4 text-center">
                            <span className={`font-heading text-base font-bold ${m.home_team.includes("Liszczanka") ? "text-primary" : "text-foreground"}`}>{m.home_team}</span>
                            <span className={`font-heading text-xl font-bold px-3 py-1 rounded ${win ? "bg-pitch-green/20 text-pitch-green" : draw ? "bg-muted text-muted-foreground" : "bg-destructive/20 text-destructive"}`}>
                              {m.score_home}:{m.score_away}
                            </span>
                            <span className={`font-heading text-base font-bold ${m.away_team.includes("Liszczanka") ? "text-primary" : "text-foreground"}`}>{m.away_team}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${m.venue === "dom" ? "bg-pitch-green/10 text-pitch-green" : "bg-secondary/10 text-secondary"}`}>
                            {m.venue === "dom" ? "Dom" : "Wyjazd"}
                          </span>
                        </div>
                      </ScrollAnimation>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
