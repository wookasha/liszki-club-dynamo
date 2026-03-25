import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMatches, useTeamLogos } from "@/hooks/use-queries";
import ScrollAnimation from "@/components/ScrollAnimation";
import MatchCard from "@/components/schedule/MatchCard";

interface Scorer {
  player: string;
  goals: number;
  team: "home" | "away";
}

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
  news_slug: string | null;
  scorers: Scorer[] | null;
}

const INITIAL_COUNT = 5;

const SchedulePage = () => {
  const { data: matchesRaw = [], isLoading: loading } = useMatches();
  const { data: logos = {} } = useTeamLogos();
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);

  const matches = matchesRaw as unknown as Match[];
  const upcoming = matches.filter((m) => !m.is_played);
  const results = matches.filter((m) => m.is_played).reverse();

  const renderMatchList = (
    list: Match[],
    showAll: boolean,
    setShowAll: (v: boolean) => void,
  ) => {
    const visible = list.slice(0, INITIAL_COUNT);
    const hidden = list.slice(INITIAL_COUNT);

    return (
      <div className="space-y-3">
        {visible.map((m, i) => (
          <ScrollAnimation key={m.id} delay={i * 0.04}>
            <MatchCard
              homeTeam={m.home_team}
              awayTeam={m.away_team}
              matchDate={m.match_date}
              venue={m.venue}
              stadiumAddress={m.stadium_address}
              homeLogo={logos[m.home_team] || null}
              awayLogo={logos[m.away_team] || null}
              scoreHome={m.score_home}
              scoreAway={m.score_away}
              isPlayed={m.is_played}
              newsSlug={m.news_slug}
              scorers={m.scorers || undefined}
            />
          </ScrollAnimation>
        ))}
        <AnimatePresence>
          {showAll && hidden.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
            >
              <MatchCard
                homeTeam={m.home_team}
                awayTeam={m.away_team}
                matchDate={m.match_date}
                venue={m.venue}
                stadiumAddress={m.stadium_address}
                homeLogo={logos[m.home_team] || null}
                awayLogo={logos[m.away_team] || null}
                scoreHome={m.score_home}
                scoreAway={m.score_away}
                isPlayed={m.is_played}
                newsSlug={m.news_slug}
                scorers={m.scorers || undefined}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {list.length > INITIAL_COUNT && (
          <motion.button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-3 text-sm text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <motion.span animate={{ rotate: showAll ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.span>
            {showAll ? "Pokaż mniej" : `Pokaż więcej (${list.length - INITIAL_COUNT})`}
          </motion.button>
        )}
      </div>
    );
  };

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
          <div className="space-y-14">
            {upcoming.length > 0 && (
              <section>
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Nadchodzące mecze</h2>
                </ScrollAnimation>
                {renderMatchList(upcoming, showAllUpcoming, setShowAllUpcoming)}
              </section>
            )}
            {results.length > 0 && (
              <section>
                <ScrollAnimation>
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Wyniki</h2>
                </ScrollAnimation>
                {renderMatchList(results, showAllResults, setShowAllResults)}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
