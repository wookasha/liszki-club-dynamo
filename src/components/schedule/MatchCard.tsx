import { MapPin, Home, Plane, Calendar } from "lucide-react";

interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  venue: string;
  stadiumAddress: string;
  homeLogo: string | null;
  awayLogo: string | null;
  scoreHome?: number | null;
  scoreAway?: number | null;
  isPlayed: boolean;
}

const TeamLogo = ({ url, name, size = "w-10 h-10" }: { url: string | null; name: string; size?: string }) => (
  url ? (
    <img src={url} alt={name} className={`${size} object-contain`} />
  ) : (
    <div className={`${size} rounded-full bg-muted border border-border flex items-center justify-center`}>
      <span className="text-[10px] font-bold text-muted-foreground">{name.substring(0, 3).toUpperCase()}</span>
    </div>
  )
);

const MatchCard = ({
  homeTeam, awayTeam, matchDate, venue, stadiumAddress,
  homeLogo, awayLogo, scoreHome, scoreAway, isPlayed,
}: MatchCardProps) => {
  const date = new Date(matchDate);
  const dayNum = date.toLocaleDateString("pl-PL", { day: "numeric" });
  const monthName = date.toLocaleDateString("pl-PL", { month: "short" }).toUpperCase();
  const time = date.getHours() === 0 && date.getMinutes() === 0
    ? "TBD"
    : date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

  const liszczankaHome = homeTeam.includes("Liszczanka");
  const lGoals = liszczankaHome ? scoreHome! : scoreAway!;
  const oGoals = liszczankaHome ? scoreAway! : scoreHome!;
  const win = isPlayed && lGoals > oGoals;
  const draw = isPlayed && lGoals === oGoals;
  const loss = isPlayed && lGoals < oGoals;

  const resultAccent = win
    ? "border-l-pitch-green"
    : loss
    ? "border-l-destructive"
    : draw
    ? "border-l-muted-foreground"
    : "border-l-primary";

  return (
    <div className={`group relative rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden border-l-[3px] ${resultAccent} hover:bg-card transition-colors duration-200`}>
      <div className="flex items-stretch">
        {/* Date section */}
        <div className="flex flex-col items-center justify-center px-4 py-4 min-w-[72px] border-r border-border/40">
          <span className="text-2xl font-heading font-bold text-foreground leading-none">{dayNum}</span>
          <span className="text-[10px] font-semibold tracking-widest text-muted-foreground mt-0.5">{monthName}</span>
          {!isPlayed && (
            <span className="text-xs font-medium text-primary mt-1.5">{time}</span>
          )}
        </div>

        {/* Teams & score section */}
        <div className="flex-1 flex items-center justify-center gap-3 sm:gap-5 py-4 px-3 sm:px-6">
          {/* Home team */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0">
            <span className={`font-heading text-sm sm:text-base font-bold truncate text-right ${homeTeam.includes("Liszczanka") ? "text-primary" : "text-foreground"}`}>
              {homeTeam}
            </span>
            <TeamLogo url={homeLogo} name={homeTeam} />
          </div>

          {/* Score / VS */}
          {isPlayed ? (
            <div className={`flex items-center gap-1 font-heading text-xl sm:text-2xl font-bold px-3 py-1.5 rounded-lg min-w-[72px] justify-center ${
              win ? "bg-pitch-green/15 text-pitch-green" : loss ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"
            }`}>
              <span>{scoreHome}</span>
              <span className="text-muted-foreground text-base">:</span>
              <span>{scoreAway}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center min-w-[72px]">
              <span className="font-heading text-lg text-muted-foreground/60 tracking-wider">VS</span>
            </div>
          )}

          {/* Away team */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <TeamLogo url={awayLogo} name={awayTeam} />
            <span className={`font-heading text-sm sm:text-base font-bold truncate ${awayTeam.includes("Liszczanka") ? "text-primary" : "text-foreground"}`}>
              {awayTeam}
            </span>
          </div>
        </div>

        {/* Venue & address section */}
        <div className="hidden md:flex flex-col items-end justify-center gap-1.5 px-5 py-4 min-w-[180px] border-l border-border/40">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            venue === "dom" ? "bg-pitch-green/10 text-pitch-green" : "bg-secondary/10 text-secondary"
          }`}>
            {venue === "dom" ? <><Home className="w-3 h-3" /> Dom</> : <><Plane className="w-3 h-3" /> Wyjazd</>}
          </span>
          {stadiumAddress && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stadiumAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors max-w-[170px] truncate"
            >
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{stadiumAddress}</span>
            </a>
          )}
        </div>
      </div>

      {/* Mobile venue row */}
      <div className="flex md:hidden items-center justify-between px-4 py-2.5 border-t border-border/30 bg-muted/30">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          venue === "dom" ? "bg-pitch-green/10 text-pitch-green" : "bg-secondary/10 text-secondary"
        }`}>
          {venue === "dom" ? <><Home className="w-3 h-3" /> Dom</> : <><Plane className="w-3 h-3" /> Wyjazd</>}
        </span>
        {stadiumAddress && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stadiumAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          >
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[200px]">{stadiumAddress}</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default MatchCard;
