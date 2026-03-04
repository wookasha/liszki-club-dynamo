import { useState, useEffect } from "react";
import { MapPin, Home, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ScrollAnimation from "@/components/ScrollAnimation";

interface Match {
  id: string;
  match_date: string;
  home_team: string;
  away_team: string;
  venue: string;
  stadium_address: string;
  score_home: number | null;
  score_away: number | null;
  is_played: boolean;
}

interface TeamLogoMap {
  [team: string]: string | null;
}

const TeamLogo = ({ url, name, size = "w-8 h-8" }: { url: string | null; name: string; size?: string }) => (
  url ? (
    <img src={url} alt={name} className={`${size} object-contain`} />
  ) : (
    <div className={`${size} rounded-full bg-muted border border-border flex items-center justify-center`}>
      <span className="text-[9px] font-bold text-muted-foreground">{name.substring(0, 3).toUpperCase()}</span>
    </div>
  )
);

const INITIAL_COUNT = 5;

const SchedulePage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [logos, setLogos] = useState<TeamLogoMap>({});
  const [loading, setLoading] = useState(true);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [matchesRes, leagueRes] = await Promise.all([
        supabase.from("matches").select("*").order("match_date", { ascending: true }),
        supabase.from("league_table").select("team, logo_url"),
      ]);
      setMatches((matchesRes.data as Match[]) || []);
      const logoMap: TeamLogoMap = {};
      ((leagueRes.data as any[]) || []).forEach((r: any) => { logoMap[r.team] = r.logo_url; });
      setLogos(logoMap);
      setLoading(false);
    };
    fetchData();
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
                  {(showAllUpcoming ? upcoming : upcoming.slice(0, INITIAL_COUNT)).map((m, i) => (
                    <ScrollAnimation key={m.id} delay={i * 0.05}>
                      <div className="glass-card rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                          <span>{new Date(m.match_date).toLocaleDateString("pl-PL", { day: "numeric", month: "long" })}</span>
                          <span>•</span>
                          <span>{(() => {
                            const d = new Date(m.match_date);
                            return d.getHours() === 0 && d.getMinutes() === 0 ? "TBD" : d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
                          })()}</span>
                        </div>
                        <div className="flex items-center gap-4 text-center">
                          <div className="flex items-center gap-2">
                            <TeamLogo url={logos[m.home_team] || null} name={m.home_team} />
                            <span className={`font-heading text-base font-bold ${m.home_team.includes("Liszczanka") ? "text-primary" : "text-foreground"}`}>{m.home_team}</span>
                          </div>
                          <span className="font-heading text-xl text-muted-foreground">vs</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-heading text-base font-bold ${m.away_team.includes("Liszczanka") ? "text-primary" : "text-foreground"}`}>{m.away_team}</span>
                            <TeamLogo url={logos[m.away_team] || null} name={m.away_team} />
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${m.venue === "dom" ? "bg-pitch-green/10 text-pitch-green" : "bg-secondary/10 text-secondary"}`}>
                          {m.venue === "dom" ? <span className="flex items-center gap-1"><Home className="w-3 h-3" /> Dom</span> : <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Wyjazd</span>}
                        </span>
                        {m.stadium_address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 md:mt-0">
                            <MapPin className="w-3 h-3 shrink-0" /> {m.stadium_address}
                          </p>
                        )}
                      </div>
                    </ScrollAnimation>
                  ))}
                  {upcoming.length > INITIAL_COUNT && (
                    <button
                      onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                      className="w-full py-3 text-sm text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAllUpcoming ? "rotate-180" : ""}`} />
                      {showAllUpcoming ? "Pokaż mniej" : `Pokaż więcej (${upcoming.length - INITIAL_COUNT})`}
                    </button>
                  )}
                </div>
              </>
            )}

            {results.length > 0 && (
              <>
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Wyniki</h2>
                </ScrollAnimation>
                <div className="space-y-4">
                  {(showAllResults ? results : results.slice(0, INITIAL_COUNT)).map((m, i) => {
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
                            <div className="flex items-center gap-2">
                              <TeamLogo url={logos[m.home_team] || null} name={m.home_team} />
                              <span className={`font-heading text-base font-bold ${m.home_team.includes("Liszczanka") ? "text-primary" : "text-foreground"}`}>{m.home_team}</span>
                            </div>
                            <span className={`font-heading text-xl font-bold px-3 py-1 rounded ${win ? "bg-pitch-green/20 text-pitch-green" : draw ? "bg-muted text-muted-foreground" : "bg-destructive/20 text-destructive"}`}>
                              {m.score_home}:{m.score_away}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`font-heading text-base font-bold ${m.away_team.includes("Liszczanka") ? "text-primary" : "text-foreground"}`}>{m.away_team}</span>
                              <TeamLogo url={logos[m.away_team] || null} name={m.away_team} />
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${m.venue === "dom" ? "bg-pitch-green/10 text-pitch-green" : "bg-secondary/10 text-secondary"}`}>
                            {m.venue === "dom" ? "Dom" : "Wyjazd"}
                          </span>
                          {m.stadium_address && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 md:mt-0">
                              <MapPin className="w-3 h-3 shrink-0" /> {m.stadium_address}
                            </p>
                          )}
                        </div>
                      </ScrollAnimation>
                    );
                  })}
                  {results.length > INITIAL_COUNT && (
                    <button
                      onClick={() => setShowAllResults(!showAllResults)}
                      className="w-full py-3 text-sm text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAllResults ? "rotate-180" : ""}`} />
                      {showAllResults ? "Pokaż mniej" : `Pokaż więcej (${results.length - INITIAL_COUNT})`}
                    </button>
                  )}
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
