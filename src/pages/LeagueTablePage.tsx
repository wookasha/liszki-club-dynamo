import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ScrollAnimation from "@/components/ScrollAnimation";

interface LeagueRow {
  id: string;
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
  is_own_team: boolean;
  logo_url: string | null;
}

const TeamLogo = ({ url, name }: { url: string | null; name: string }) => (
  url ? (
    <img src={url} alt={name} className="w-6 h-6 object-contain" />
  ) : (
    <div className="w-6 h-6 rounded-sm bg-muted border border-border flex items-center justify-center">
      <span className="text-[8px] font-bold text-muted-foreground">{name.substring(0, 2).toUpperCase()}</span>
    </div>
  )
);

const LeagueTablePage = () => {
  const [table, setTable] = useState<LeagueRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("league_table").select("*").order("position", { ascending: true });
      setTable((data as LeagueRow[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <h1 className="section-heading text-4xl md:text-5xl mb-2">Tabela ligowa</h1>
          <p className="text-muted-foreground mb-2">Klasa okręgowa Kraków, grupa II</p>
          <div className="section-heading-accent mb-10" />
        </ScrollAnimation>

        <ScrollAnimation delay={0.1}>
          {loading ? (
            <p className="text-muted-foreground text-center py-12">Ładowanie...</p>
          ) : table.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">Tabela jeszcze nie została uzupełniona.</p>
          ) : (
            <div className="glass-card rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    {["#", "", "Drużyna", "M", "W", "R", "P", "Bz", "Bs", "Pkt"].map((h, i) => (
                      <th key={`${h}-${i}`} className="py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium text-center first:text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.map((row) => (
                    <tr key={row.id} className={`border-b border-border/50 last:border-0 transition-colors hover:bg-muted/30 ${row.is_own_team ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}>
                      <td className="py-3 px-3 text-sm font-medium text-muted-foreground">{row.position}</td>
                      <td className="py-3 px-2">
                        <TeamLogo url={row.logo_url} name={row.team} />
                      </td>
                      <td className={`py-3 px-3 text-sm font-medium text-left ${row.is_own_team ? "text-primary font-bold" : "text-foreground"}`}>{row.team}</td>
                      <td className="py-3 px-3 text-sm text-center text-muted-foreground">{row.played}</td>
                      <td className="py-3 px-3 text-sm text-center text-muted-foreground">{row.won}</td>
                      <td className="py-3 px-3 text-sm text-center text-muted-foreground">{row.drawn}</td>
                      <td className="py-3 px-3 text-sm text-center text-muted-foreground">{row.lost}</td>
                      <td className="py-3 px-3 text-sm text-center text-muted-foreground">{row.goals_for}</td>
                      <td className="py-3 px-3 text-sm text-center text-muted-foreground">{row.goals_against}</td>
                      <td className="py-3 px-3 text-sm text-center font-bold text-foreground">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ScrollAnimation>
      </div>
    </div>
  );
};

export default LeagueTablePage;
