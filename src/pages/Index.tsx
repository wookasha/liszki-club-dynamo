import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Trophy, ArrowRight, Facebook, Instagram, MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import ScrollAnimation from "@/components/ScrollAnimation";
import CountdownTimer from "@/components/CountdownTimer";
import heroImage from "@/assets/hero-stadium.jpg";
import clubLogo from "@/assets/club-logo.png";

// Demo data
const nextMatch = {
  date: "2026-03-15T15:00:00",
  home: "Liszczanka Liszki",
  away: "Wawel Kraków",
  venue: "Stadion w Liszkach",
  league: "Klasa okręgowa, grupa II",
};

const demoNews = [
  { id: "1", title: "Zwycięstwo w derbach gminy!", excerpt: "Liszczanka pokonała rywali 3:1 w emocjonującym meczu derbowym.", created_at: "2026-02-20", category: "Mecze", image_url: null as string | null },
  { id: "2", title: "Nabór do grup młodzieżowych", excerpt: "Zapraszamy dzieci w wieku 4-12 lat na treningi piłkarskie.", created_at: "2026-02-18", category: "Młodzież", image_url: null as string | null },
  { id: "3", title: "Nowy sponsor dołącza do klubu", excerpt: "Z radością witamy firmę Royal Ride jako nowego partnera Liszczanki.", created_at: "2026-02-15", category: "Klub", image_url: null as string | null },
];

const sponsors = [
  "Gmina Liszki – Urząd", "MIKI – lider zielonych zmian", "PH Instal",
  "Stomatologia Stupka", "Centrum Medyczne Liszki", "Entek – Hurtownia opakowań",
  "Royal Ride – Wynajem Limuzyn", "TransHandel", "U Jędrusia Cieszy Smakiem",
];

interface NextMatchData { date: string; home: string; away: string; venue: string; }
interface LeagueRow { position: number; team: string; played: number; points: number; is_own_team: boolean; }
interface LastResult { home: string; away: string; score_home: number; score_away: number; }

const Index = () => {
  const [news, setNews] = useState(demoNews);
  const [nextMatch, setNextMatch] = useState<NextMatchData | null>(null);
  const [leagueTable, setLeagueTable] = useState<LeagueRow[]>([]);
  const [lastResults, setLastResults] = useState<LastResult[]>([]);

  useEffect(() => {
    // Fetch news
    supabase.from("news_posts").select("id, title, excerpt, category, created_at, image_url")
      .eq("published", true).order("created_at", { ascending: false }).limit(3)
      .then(({ data }) => { if (data && data.length > 0) setNews(data); });

    // Fetch next match
    supabase.from("matches").select("*")
      .eq("is_played", false).order("match_date", { ascending: true }).limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const m = data[0] as any;
          setNextMatch({ date: m.match_date, home: m.home_team, away: m.away_team, venue: m.venue === "dom" ? "Stadion w Liszkach" : "Wyjazd" });
        }
      });

    // Fetch last results
    supabase.from("matches").select("*")
      .eq("is_played", true).order("match_date", { ascending: false }).limit(3)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setLastResults((data as any[]).map((m) => ({ home: m.home_team, away: m.away_team, score_home: m.score_home, score_away: m.score_away })));
        }
      });

    // Fetch league table (top 5)
    supabase.from("league_table").select("*")
      .order("position", { ascending: true }).limit(5)
      .then(({ data }) => {
        if (data && data.length > 0) setLeagueTable(data as LeagueRow[]);
      });
  }, []);
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Stadion piłkarski" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-club-red/10 via-transparent to-club-blue/10" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Club badge */}
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6">
              <img src={clubLogo} alt="LKS Liszczanka Liszki" className="w-full h-full object-contain" />
            </div>

            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-tight">
              Liszczanka Liszki
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground font-heading tracking-widest mb-2">
              Tradycja od 1948 roku
            </p>
            <div className="w-24 h-1 mx-auto bg-gradient-to-r from-club-red via-club-white to-club-blue rounded-full mb-8" />

            <p className="text-muted-foreground max-w-xl mx-auto mb-10 text-sm md:text-base">
              Klasa okręgowa Kraków, grupa II • Liszki, woj. małopolskie
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/terminarz"
                className="px-6 py-3 bg-primary text-primary-foreground font-heading font-semibold uppercase rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Terminarz
              </Link>
              <Link
                to="/sponsorzy"
                className="px-6 py-3 border border-foreground/20 text-foreground font-heading font-semibold uppercase rounded-md hover:bg-foreground/10 transition-colors flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                Zostań sponsorem
              </Link>
            </div>
          </motion.div>

          {/* Countdown */}
          {nextMatch && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-sm text-muted-foreground mb-3 font-medium uppercase tracking-wider">
              Następny mecz za
            </p>
            <div className="flex justify-center">
              <CountdownTimer targetDate={nextMatch.date} />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {nextMatch.home} vs {nextMatch.away} • {nextMatch.venue}
            </p>
          </motion.div>
          )}
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronRight className="w-6 h-6 text-muted-foreground rotate-90" />
        </motion.div>
      </section>

      {/* Next Match */}
      {nextMatch && (
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <ScrollAnimation>
            <div className="glass-card p-6 md:p-8 rounded-xl max-w-3xl mx-auto text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Klasa okręgowa, grupa II
              </p>
              <div className="flex items-center justify-center gap-4 md:gap-8 my-6">
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-2">
                    <span className="font-heading text-sm font-bold text-primary">LKS</span>
                  </div>
                  <p className="font-heading text-sm md:text-base font-bold text-foreground">{nextMatch.home}</p>
                </div>
                <div>
                  <p className="font-heading text-3xl md:text-4xl font-bold text-muted-foreground">VS</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(nextMatch.date).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(nextMatch.date).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                    <span className="font-heading text-sm font-bold text-muted-foreground">{nextMatch.away.substring(0, 3).toUpperCase()}</span>
                  </div>
                  <p className="font-heading text-sm md:text-base font-bold text-foreground">{nextMatch.away}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {nextMatch.venue}
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
      )}

      {/* Last Results */}
      {lastResults.length > 0 && (
      <section className="py-4 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto py-2 justify-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wider shrink-0 font-medium">
              Ostatnie wyniki:
            </span>
            {lastResults.map((r, i) => {
              const liszczankaHome = r.home.includes("Liszczanka");
              const lGoals = liszczankaHome ? r.score_home : r.score_away;
              const oGoals = liszczankaHome ? r.score_away : r.score_home;
              const win = lGoals > oGoals;
              return (
                <div key={i} className="flex items-center gap-2 shrink-0 text-sm">
                  <span className="text-foreground font-medium">{r.home}</span>
                  <span className={`font-heading font-bold px-2 py-0.5 rounded ${win ? "bg-pitch-green/20 text-pitch-green" : "bg-muted text-muted-foreground"}`}>
                    {r.score_home}:{r.score_away}
                  </span>
                  <span className="text-foreground font-medium">{r.away}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* News */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <ScrollAnimation>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="section-heading">Aktualności</h2>
                <div className="section-heading-accent" />
              </div>
              <Link to="/aktualnosci" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium">
                Wszystkie <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map((item, i) => (
              <ScrollAnimation key={item.id} delay={i * 0.1}>
                <article className="glass-card rounded-xl overflow-hidden hover-lift group cursor-pointer">
                  {item.image_url ? (
                    <div className="h-48 overflow-hidden">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {item.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString("pl-PL")}</span>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                  </div>
                </article>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* League Table */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <ScrollAnimation>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="section-heading">Tabela ligowa</h2>
                <div className="section-heading-accent" />
              </div>
              <Link to="/tabela" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium">
                Pełna tabela <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollAnimation>

          <ScrollAnimation>
            <div className="glass-card rounded-xl overflow-hidden max-w-2xl mx-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">#</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Drużyna</th>
                    <th className="text-center py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">M</th>
                    <th className="text-center py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Pkt</th>
                  </tr>
                </thead>
                <tbody>
                  {leagueTable.map((row) => (
                    <tr
                      key={row.position}
                      className={`border-b border-border/50 last:border-0 ${
                        row.is_own_team ? "bg-primary/10 border-l-2 border-l-primary" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-sm font-medium text-muted-foreground">{row.position}</td>
                      <td className={`py-3 px-4 text-sm font-medium ${row.is_own_team ? "text-primary font-bold" : "text-foreground"}`}>
                        {row.team}
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-muted-foreground">{row.played}</td>
                      <td className="py-3 px-4 text-sm text-center font-bold text-foreground">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Sponsors */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <ScrollAnimation>
            <div className="text-center mb-10">
              <h2 className="section-heading">Nasi Sponsorzy</h2>
              <div className="section-heading-accent mx-auto" />
              <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
                Dziękujemy naszym partnerom za wsparcie lokalnej piłki nożnej
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {sponsors.map((name, i) => (
              <ScrollAnimation key={name} delay={i * 0.05}>
                <div className="glass-card rounded-lg p-4 md:p-6 text-center hover-lift cursor-pointer min-h-[80px] flex items-center justify-center">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">{name}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          <ScrollAnimation>
            <div className="text-center mt-10">
              <Link
                to="/sponsorzy"
                className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary font-heading font-semibold uppercase text-sm rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Zostań sponsorem
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4 text-center">
          <ScrollAnimation>
            <h2 className="section-heading mb-2">Śledź nas</h2>
            <div className="section-heading-accent mx-auto" />
            <p className="text-sm text-muted-foreground mt-4 mb-8">
              Bądź na bieżąco z życiem klubu
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-4 glass-card rounded-xl hover-lift"
              >
                <Facebook className="w-6 h-6 text-club-blue" />
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">Facebook</p>
                  <p className="text-xs text-muted-foreground">Polub nasz profil</p>
                </div>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-4 glass-card rounded-xl hover-lift"
              >
                <Instagram className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">Instagram</p>
                  <p className="text-xs text-muted-foreground">Zobacz zdjęcia</p>
                </div>
              </a>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
};

export default Index;
