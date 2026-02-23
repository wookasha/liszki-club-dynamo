import ScrollAnimation from "@/components/ScrollAnimation";

const table = [
  { pos: 1, team: "Orlęta Ryczów", played: 18, won: 13, drawn: 3, lost: 2, gf: 40, ga: 15, points: 42 },
  { pos: 2, team: "Skała Nowa Huta", played: 18, won: 12, drawn: 2, lost: 4, gf: 35, ga: 18, points: 38 },
  { pos: 3, team: "Liszczanka Liszki", played: 18, won: 10, drawn: 5, lost: 3, gf: 32, ga: 16, points: 35, highlight: true },
  { pos: 4, team: "Wawel Kraków", played: 18, won: 10, drawn: 3, lost: 5, gf: 28, ga: 20, points: 33 },
  { pos: 5, team: "Borek Kraków", played: 18, won: 9, drawn: 3, lost: 6, gf: 25, ga: 22, points: 30 },
  { pos: 6, team: "Hutnik II Kraków", played: 18, won: 8, drawn: 4, lost: 6, gf: 24, ga: 21, points: 28 },
  { pos: 7, team: "Orkan Poręba", played: 18, won: 7, drawn: 5, lost: 6, gf: 22, ga: 20, points: 26 },
  { pos: 8, team: "Wisła Czernichów", played: 18, won: 7, drawn: 3, lost: 8, gf: 20, ga: 24, points: 24 },
  { pos: 9, team: "Tęcza Zabierzów", played: 18, won: 6, drawn: 4, lost: 8, gf: 19, ga: 26, points: 22 },
  { pos: 10, team: "Sokół Mogilany", played: 18, won: 5, drawn: 4, lost: 9, gf: 18, ga: 28, points: 19 },
  { pos: 11, team: "Zamek Brzeźnica", played: 18, won: 4, drawn: 3, lost: 11, gf: 14, ga: 30, points: 15 },
  { pos: 12, team: "Piast Skawina", played: 18, won: 2, drawn: 3, lost: 13, gf: 10, ga: 38, points: 9 },
];

const LeagueTablePage = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <h1 className="section-heading text-4xl md:text-5xl mb-2">Tabela ligowa</h1>
          <p className="text-muted-foreground mb-2">Klasa okręgowa Kraków, grupa II</p>
          <div className="section-heading-accent mb-10" />
        </ScrollAnimation>

        <ScrollAnimation delay={0.1}>
          <div className="glass-card rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  {["#", "Drużyna", "M", "W", "R", "P", "Bz", "Bs", "Pkt"].map((h) => (
                    <th key={h} className="py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium text-center first:text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr
                    key={row.pos}
                    className={`border-b border-border/50 last:border-0 transition-colors hover:bg-muted/30 ${
                      row.highlight ? "bg-primary/10 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <td className="py-3 px-3 text-sm font-medium text-muted-foreground">{row.pos}</td>
                    <td className={`py-3 px-3 text-sm font-medium text-left ${row.highlight ? "text-primary font-bold" : "text-foreground"}`}>
                      {row.team}
                    </td>
                    <td className="py-3 px-3 text-sm text-center text-muted-foreground">{row.played}</td>
                    <td className="py-3 px-3 text-sm text-center text-muted-foreground">{row.won}</td>
                    <td className="py-3 px-3 text-sm text-center text-muted-foreground">{row.drawn}</td>
                    <td className="py-3 px-3 text-sm text-center text-muted-foreground">{row.lost}</td>
                    <td className="py-3 px-3 text-sm text-center text-muted-foreground">{row.gf}</td>
                    <td className="py-3 px-3 text-sm text-center text-muted-foreground">{row.ga}</td>
                    <td className="py-3 px-3 text-sm text-center font-bold text-foreground">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
};

export default LeagueTablePage;
