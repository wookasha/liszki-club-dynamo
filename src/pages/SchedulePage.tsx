import { MapPin, Home } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";

const matches = [
  { date: "2026-03-15", time: "15:00", home: "Liszczanka Liszki", away: "Wawel Kraków", venue: "dom", score: null },
  { date: "2026-03-22", time: "16:00", home: "Skała Nowa Huta", away: "Liszczanka Liszki", venue: "wyjazd", score: null },
  { date: "2026-03-29", time: "15:00", home: "Liszczanka Liszki", away: "Borek Kraków", venue: "dom", score: null },
  { date: "2026-02-20", time: "15:00", home: "Liszczanka Liszki", away: "Orkan", venue: "dom", score: "3:1" },
  { date: "2026-02-13", time: "14:00", home: "Hutnik II Kraków", away: "Liszczanka Liszki", venue: "wyjazd", score: "0:2" },
  { date: "2026-02-06", time: "15:00", home: "Liszczanka Liszki", away: "Skała Nowa Huta", venue: "dom", score: "1:1" },
  { date: "2026-01-30", time: "14:00", home: "Orlęta Ryczów", away: "Liszczanka Liszki", venue: "wyjazd", score: "2:0" },
];

const SchedulePage = () => {
  const upcoming = matches.filter((m) => !m.score);
  const results = matches.filter((m) => m.score);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <h1 className="section-heading text-4xl md:text-5xl mb-2">Terminarz i wyniki</h1>
          <div className="section-heading-accent mb-10" />
        </ScrollAnimation>

        {/* Upcoming */}
        <ScrollAnimation>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Nadchodzące mecze</h2>
        </ScrollAnimation>
        <div className="space-y-4 mb-14">
          {upcoming.map((m, i) => (
            <ScrollAnimation key={i} delay={i * 0.05}>
              <div className="glass-card rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                  <span>
                    {new Date(m.date).toLocaleDateString("pl-PL", { day: "numeric", month: "long" })}
                  </span>
                  <span>•</span>
                  <span>{m.time}</span>
                </div>
                <div className="flex items-center gap-4 text-center">
                  <span className={`font-heading text-base font-bold ${m.home.includes("Liszczanka") ? "text-primary" : "text-foreground"}`}>
                    {m.home}
                  </span>
                  <span className="font-heading text-xl text-muted-foreground">vs</span>
                  <span className={`font-heading text-base font-bold ${m.away.includes("Liszczanka") ? "text-primary" : "text-foreground"}`}>
                    {m.away}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  m.venue === "dom"
                    ? "bg-pitch-green/10 text-pitch-green"
                    : "bg-secondary/10 text-secondary"
                }`}>
                  {m.venue === "dom" ? <span className="flex items-center gap-1"><Home className="w-3 h-3" /> Dom</span> : <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Wyjazd</span>}
                </span>
              </div>
            </ScrollAnimation>
          ))}
        </div>

        {/* Results */}
        <ScrollAnimation>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Wyniki</h2>
        </ScrollAnimation>
        <div className="space-y-4">
          {results.map((m, i) => {
            const [homeGoals, awayGoals] = m.score!.split(":").map(Number);
            const liszczankaHome = m.home.includes("Liszczanka");
            const liszczankaGoals = liszczankaHome ? homeGoals : awayGoals;
            const opponentGoals = liszczankaHome ? awayGoals : homeGoals;
            const win = liszczankaGoals > opponentGoals;
            const draw = liszczankaGoals === opponentGoals;

            return (
              <ScrollAnimation key={i} delay={i * 0.05}>
                <div className="glass-card rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground shrink-0">
                    {new Date(m.date).toLocaleDateString("pl-PL", { day: "numeric", month: "long" })}
                  </div>
                  <div className="flex items-center gap-4 text-center">
                    <span className={`font-heading text-base font-bold ${m.home.includes("Liszczanka") ? "text-primary" : "text-foreground"}`}>
                      {m.home}
                    </span>
                    <span className={`font-heading text-xl font-bold px-3 py-1 rounded ${
                      win ? "bg-pitch-green/20 text-pitch-green" : draw ? "bg-muted text-muted-foreground" : "bg-destructive/20 text-destructive"
                    }`}>
                      {m.score}
                    </span>
                    <span className={`font-heading text-base font-bold ${m.away.includes("Liszczanka") ? "text-primary" : "text-foreground"}`}>
                      {m.away}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    m.venue === "dom" ? "bg-pitch-green/10 text-pitch-green" : "bg-secondary/10 text-secondary"
                  }`}>
                    {m.venue === "dom" ? "Dom" : "Wyjazd"}
                  </span>
                </div>
              </ScrollAnimation>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
