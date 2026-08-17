import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar, Trophy, ArrowRight, Facebook, Youtube, MapPin, ChevronRight, ExternalLink, Home, Plane } from "lucide-react";
import { motion } from "framer-motion";
import { useHomeNews, useNextMatch, useLastResults, useLeagueTable, useSponsors, useExtraTeamLogos } from "@/hooks/use-queries";
import ScrollAnimation from "@/components/ScrollAnimation";
import CountdownTimer from "@/components/CountdownTimer";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroImage from "@/assets/hero-stadium.webp";
import clubLogo from "@/assets/club-logo.png";

// Demo data
const nextMatch = {
  date: "2026-03-15T15:00:00",
  home: "Liszczanka Liszki",
  away: "Wawel Kraków",
  venue: "Stadion w Liszkach",
  league: "Klasa okręgowa, grupa II"
};

const demoNews = [
{ id: "1", slug: "zwyciestwo-w-derbach-gminy", title: "Zwycięstwo w derbach gminy!", excerpt: "Liszczanka pokonała rywali 3:1 w emocjonującym meczu derbowym.", created_at: "2026-02-20", category: "Mecze", image_url: null as string | null },
{ id: "2", slug: "nabor-do-grup-mlodziezowych", title: "Nabór do grup młodzieżowych", excerpt: "Zapraszamy dzieci w wieku 4-12 lat na treningi piłkarskie.", created_at: "2026-02-18", category: "Młodzież", image_url: null as string | null },
{ id: "3", slug: "nowy-sponsor-dolacza-do-klubu", title: "Nowy sponsor dołącza do klubu", excerpt: "Z radością witamy firmę Royal Ride jako nowego partnera Liszczanki.", created_at: "2026-02-15", category: "Klub", image_url: null as string | null }];


interface SponsorData {id: string;name: string;logo_url: string | null;website_url: string | null;}

interface NextMatchData {date: string;home: string;away: string;isHome: boolean;stadium_address: string;}
interface LeagueRow {position: number;team: string;played: number;points: number;is_own_team: boolean;logo_url: string | null;}
interface LastResult {home: string;away: string;score_home: number;score_away: number;match_date: string;}

// Launch date: March 6, 2026 at 19:48 CET (UTC+1)
const LAUNCH_DATE = new Date("2026-03-06T18:48:00Z"); // 19:48 CET = 18:48 UTC

const Index = () => {
  const [isLaunched, setIsLaunched] = useState(() => Date.now() >= LAUNCH_DATE.getTime());
  const [showTransition, setShowTransition] = useState(false);

  const { data: fetchedNews = [] } = useHomeNews();
  const { data: nextMatchRaw } = useNextMatch();
  const { data: lastResultsRaw = [] } = useLastResults();
  const { data: allLeagueRows = [] } = useLeagueTable();
  const { data: fetchedSponsors = [] } = useSponsors();
  const { data: extraLogos = {} } = useExtraTeamLogos();

  const news = fetchedNews.length > 0 ? fetchedNews : demoNews;
  const nextMatch = nextMatchRaw ? {
    date: nextMatchRaw.match_date,
    home: nextMatchRaw.home_team,
    away: nextMatchRaw.away_team,
    isHome: nextMatchRaw.venue === "dom",
    stadium_address: nextMatchRaw.stadium_address || "",
  } : null;
  const lastResults = lastResultsRaw.map((m: any) => ({
    home: m.home_team, away: m.away_team, score_home: m.score_home, score_away: m.score_away, match_date: m.match_date,
  }));
  const sponsors = fetchedSponsors as SponsorData[];

  const { leagueTable, teamLogos } = useMemo(() => {
    if (allLeagueRows.length === 0) return { leagueTable: [] as LeagueRow[], teamLogos: {} as Record<string, string | null> };
    const ownIndex = allLeagueRows.findIndex((r) => r.is_own_team);
    let slice: LeagueRow[];
    if (ownIndex === -1) {
      slice = allLeagueRows.slice(0, 5);
    } else {
      const total = allLeagueRows.length;
      const windowSize = Math.min(5, total);
      let start = Math.max(0, ownIndex - Math.floor(windowSize / 2));
      const end = Math.min(total, start + windowSize);
      start = Math.max(0, end - windowSize);
      slice = allLeagueRows.slice(start, end);
    }
    const logoMap: Record<string, string | null> = {};
    allLeagueRows.forEach((r) => { logoMap[r.team] = r.logo_url; });
    Object.entries(extraLogos).forEach(([team, url]) => { if (!logoMap[team]) logoMap[team] = url; });
    return { leagueTable: slice, teamLogos: logoMap };
  }, [allLeagueRows, extraLogos]);

  // Fire confetti burst
  const fireConfetti = async () => {
    const confetti = (await import("canvas-confetti")).default;
    const duration = 4000;
    const end = Date.now() + duration;

    const colors = ["#DC2626", "#FFFFFF", "#2563EB"]; // club colors

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // Big center burst
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors,
      startVelocity: 45,
    });
  };

  // Check launch time every second
  useEffect(() => {
    if (isLaunched) return;
    const interval = setInterval(() => {
      if (Date.now() >= LAUNCH_DATE.getTime()) {
        // Start transition sequence
        setShowTransition(true);
        fireConfetti();
        // After transition animation, show full site
        setTimeout(() => {
          setIsLaunched(true);
          setShowTransition(false);
        }, 3000);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isLaunched]);

  // Data is now fetched via React Query hooks above
  // Transition overlay after countdown hits zero
  if (showTransition) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2.5, delay: 0.5 }}
          className="absolute inset-0 bg-background z-20"
        />
        <motion.div
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative z-10 text-center"
        >
          <div className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-6">
            <img src={clubLogo} alt="LKS Liszczanka Liszki" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-heading text-5xl md:text-7xl font-bold text-foreground"
          >
            Witamy na nowej stronie!
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="w-48 h-1 mx-auto mt-4 bg-gradient-to-r from-club-red via-club-white to-club-blue rounded-full"
          />
        </motion.div>
      </div>
    );
  }

  // Landing / countdown page before launch
  if (!isLaunched) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-background">
          <img src={heroImage} alt="Stadion piłkarski" className="w-full h-full object-cover object-[center_65%] md:object-[center_60%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-club-red/15 via-transparent to-club-blue/15" />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="w-28 h-28 md:w-40 md:h-40 mx-auto mb-8">
              <img src={clubLogo} alt="LKS Liszczanka Liszki" className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-4 leading-tight">
              Liszczanka Liszki
            </h1>
            <div className="w-32 h-1 mx-auto bg-gradient-to-r from-club-red via-club-white to-club-blue rounded-full mb-6" />
            <p className="text-lg md:text-2xl text-muted-foreground font-heading tracking-widest mb-12 uppercase">
              Start strony już wkrótce
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center"
          >
            <CountdownTimer targetDate={LAUNCH_DATE.toISOString()} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-10 text-sm text-muted-foreground/70"
          >
            Premiera: 6 marca 2026, godz. 19:48
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-background">
          <img src={heroImage} alt="Stadion piłkarski" className="w-full h-full object-cover object-[center_65%] md:object-[center_60%]" fetchPriority="high" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background md:from-background/70 md:via-background/60 md:to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-club-red/10 via-transparent to-club-blue/10" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto">

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

            



            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/terminarz"
                className="px-6 py-3 bg-primary text-primary-foreground font-heading font-semibold uppercase rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">

                <Calendar className="w-5 h-5" />
                Terminarz
              </Link>
              <Link
                to="/sponsorzy"
                className="px-6 py-3 border border-foreground/20 text-foreground font-heading font-semibold uppercase rounded-md hover:bg-foreground/10 transition-colors flex items-center justify-center gap-2">

                <Trophy className="w-5 h-5" />
                Zostań sponsorem
              </Link>
            </div>
          </motion.div>

          {/* Countdown */}
          {nextMatch &&
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}>

            <p className="text-sm text-muted-foreground mb-3 font-medium uppercase tracking-wider">
              Następny mecz za
            </p>
            <div className="inline-flex justify-center">
              <CountdownTimer targetDate={nextMatch.date} />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {nextMatch.home} vs {nextMatch.away}
            </p>
          </motion.div>
          }
        </div>

        {/* Scroll indicator - hidden on mobile */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}>

          <ChevronRight className="w-6 h-6 text-muted-foreground rotate-90" />
        </motion.div>
      </section>

      {/* Next Match */}
      {nextMatch &&
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <ScrollAnimation>
            <div className="glass-card p-6 md:p-8 rounded-xl max-w-3xl mx-auto text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Klasa okręgowa, grupa II
              </p>
              <div className="flex items-center justify-center gap-4 md:gap-8 my-6">
                <div className="text-center">
                  {teamLogos[nextMatch.home] ?
                  <img src={teamLogos[nextMatch.home]!} alt={nextMatch.home} className="w-16 h-16 md:w-20 md:h-20 object-contain mx-auto mb-2" loading="lazy" decoding="async" /> :

                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-2">
                      <span className="font-heading text-sm font-bold text-primary">{nextMatch.home.substring(0, 3).toUpperCase()}</span>
                    </div>
                  }
                  <p className="font-heading text-sm md:text-base font-bold text-foreground">{nextMatch.home}</p>
                </div>
                <div>
                  <p className="font-heading text-3xl md:text-4xl font-bold text-muted-foreground">VS</p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {new Date(nextMatch.date).toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(nextMatch.date).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="text-center">
                  {teamLogos[nextMatch.away] ?
                  <img src={teamLogos[nextMatch.away]!} alt={nextMatch.away} className="w-16 h-16 md:w-20 md:h-20 object-contain mx-auto mb-2" loading="lazy" decoding="async" /> :

                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                      <span className="font-heading text-sm font-bold text-muted-foreground">{nextMatch.away.substring(0, 3).toUpperCase()}</span>
                    </div>
                  }
                  <p className="font-heading text-sm md:text-base font-bold text-foreground">{nextMatch.away}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                {nextMatch.isHome ? (
                  <Home className="w-4 h-4 shrink-0" />
                ) : (
                  <Plane className="w-4 h-4 shrink-0" />
                )}
                {nextMatch.stadium_address ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextMatch.stadium_address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <MapPin className="w-4 h-4 shrink-0" />
                    {nextMatch.stadium_address}
                  </a>
                ) : null}
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
      }

      {/* Last Results - Carousel */}
      {lastResults.length > 0 &&
      <section className="py-4 border-b border-border overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground uppercase tracking-wider shrink-0 font-medium">
              Ostatnie<br className="md:hidden" /> wyniki:
            </span>
            <Carousel
              opts={{ align: "start", loop: true }}
              plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]}
              className="flex-1 overflow-hidden">

              <CarouselContent className="-ml-4">
                {lastResults.map((r, i) => {
                   const liszczankaHome = r.home.includes("Liszczanka");
                   const lGoals = liszczankaHome ? r.score_home : r.score_away;
                   const oGoals = liszczankaHome ? r.score_away : r.score_home;
                   const win = lGoals > oGoals;
                   const loss = lGoals < oGoals;
                   const statusStyle = win ? "bg-pitch-green/20 text-pitch-green" : loss ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground";
                   const dateStr = new Date(r.match_date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" });
                   return (
                     <CarouselItem key={i} className="pl-4 basis-full">
                       <div className="flex items-center justify-center gap-3 text-sm py-2">
                         <span className="text-xs text-muted-foreground">{dateStr}</span>
                         <span className="text-foreground font-medium">{r.home}</span>
                         <span className={`font-heading font-bold px-2.5 py-0.5 rounded ${statusStyle}`}>
                           {r.score_home}:{r.score_away}
                         </span>
                         <span className="text-foreground font-medium">{r.away}</span>
                       </div>
                    </CarouselItem>);
                })}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </section>
      }

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
            {news.map((item, i) =>
            <ScrollAnimation key={item.id} delay={i * 0.1}>
                <Link to={`/aktualnosci/${item.slug}`} className="block glass-card rounded-xl overflow-hidden hover-lift group cursor-pointer h-full flex flex-col">
                  {item.image_url ?
                <div className="h-48 overflow-hidden shrink-0">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div> :

                <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                      <Calendar className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                }
                  <div className="p-5 flex flex-col flex-grow">
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
                </Link>
              </ScrollAnimation>
            )}
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
                  {leagueTable.map((row, index) =>
                  <motion.tr
                    key={row.position}
                    initial={row.is_own_team ? { backgroundColor: "hsl(var(--primary) / 0)" } : undefined}
                    animate={row.is_own_team ? { backgroundColor: ["hsl(var(--primary) / 0)", "hsl(var(--primary) / 0.15)", "hsl(var(--primary) / 0.08)"] } : undefined}
                    transition={row.is_own_team ? { duration: 1.5, delay: 0.5, ease: "easeInOut" } : undefined}
                    className={`border-b border-border/50 last:border-0 ${
                    row.is_own_team ? "border-l-2 border-l-primary" : ""}`
                    }>

                      <td className="py-3 px-4 text-sm font-medium text-muted-foreground">{row.position}</td>
                      <td className={`py-3 px-4 text-sm font-medium ${row.is_own_team ? "text-primary font-bold" : "text-foreground"}`}>
                        <div className="flex items-center gap-2">
                          {row.logo_url ?
                        <img src={row.logo_url} alt={row.team} className="w-5 h-5 object-contain shrink-0" loading="lazy" decoding="async" /> :

                        <div className="w-5 h-5 rounded-full bg-muted shrink-0" />
                        }
                          {row.team}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-muted-foreground">{row.played}</td>
                      <td className="py-3 px-4 text-sm text-center font-bold text-foreground">{row.points}</td>
                    </motion.tr>
                  )}
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {sponsors.map((sponsor, i) => {
              const url = sponsor.website_url ?
              sponsor.website_url.startsWith("http") ? sponsor.website_url : `https://${sponsor.website_url}` :
              null;
              const Wrapper = url ? "a" : "div";
              const wrapperProps = url ? { href: url, target: "_blank", rel: "noopener noreferrer" } : {};

              return (
                <ScrollAnimation key={sponsor.id} delay={i * 0.05}>
                  <Wrapper
                    {...wrapperProps as any}
                    className="glass-card rounded-xl p-5 flex items-center justify-center hover-lift cursor-pointer aspect-[3/2] group transition-all duration-300 relative overflow-hidden">

                    {sponsor.logo_url ?
                    <img src={sponsor.logo_url} alt={sponsor.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" loading="lazy" decoding="async" /> :

                    <span className="font-heading text-xl font-bold text-muted-foreground text-center">{sponsor.name}</span>
                    }
                    {url &&
                    <span className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[11px] text-primary-foreground bg-primary/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Odwiedź stronę
                        </span>
                      </span>
                    }
                  </Wrapper>
                </ScrollAnimation>);

            })}
          </div>

          <ScrollAnimation>
            <div className="text-center mt-10">
              <Link
                to="/sponsorzy"
                className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary font-heading font-semibold uppercase text-sm rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">

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
                href="https://www.facebook.com/LiszczankaLiszki"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-4 glass-card rounded-xl hover-lift">

                <Facebook className="w-6 h-6 text-club-blue" />
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">Facebook</p>
                  <p className="text-xs text-muted-foreground">Polub nasz profil</p>
                </div>
              </a>
              <a
                href="https://www.youtube.com/@liszczankaliszki8483"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-4 glass-card rounded-xl hover-lift">

                <Youtube className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">YouTube</p>
                  <p className="text-xs text-muted-foreground">Zobacz filmy</p>
                </div>
              </a>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>);

};

export default Index;