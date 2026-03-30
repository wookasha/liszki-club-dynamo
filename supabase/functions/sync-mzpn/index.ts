import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_TABLE_URL =
  "https://malopolskizpn.pl/rozgrywki/2025-2026/seniorzy/ko2_krakow/?view=table";
const DEFAULT_SCHEDULE_URL =
  "https://malopolskizpn.pl/rozgrywki/2025-2026/seniorzy/ko2_krakow/?view=schedule";

const REGIO_URL =
  "https://regiowyniki.pl/kalendarz/Pilka_Nozna/2025/2026/Malopolskie/Liga_okregowa/Krakow_II/";

const OWN_TEAM_KEYWORD = "LISZCZANKA";

// Normalize team name from UPPERCASE to Title Case
function normalizeName(raw: string): string {
  return raw
    .trim()
    .split(/\s+/)
    .map((w) => {
      if (w.length <= 2) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

// ── Common interfaces ──
interface TableRow {
  position: number;
  team: string;
  played: number;
  points: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  is_own_team: boolean;
}

interface MatchRow {
  match_date: string;
  home_team: string;
  away_team: string;
  score_home: number | null;
  score_away: number | null;
  is_played: boolean;
  venue: string;
  has_time: boolean;
}

// ══════════════════════════════════════════════
// MZPN PARSERS (existing)
// ══════════════════════════════════════════════

function parseTable(md: string): TableRow[] {
  const rows: TableRow[] = [];
  const re =
    /\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+):(\d+)\s*\|/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const team = normalizeName(m[2]);
    rows.push({
      position: parseInt(m[1]),
      team,
      played: parseInt(m[3]),
      points: parseInt(m[4]),
      won: parseInt(m[5]),
      drawn: parseInt(m[6]),
      lost: parseInt(m[7]),
      goals_for: parseInt(m[8]),
      goals_against: parseInt(m[9]),
      is_own_team: m[2].toUpperCase().includes(OWN_TEAM_KEYWORD),
    });
  }
  return rows;
}

function parseSchedule(md: string, knownTeams: string[] = []): MatchRow[] {
  const matches: MatchRow[] = [];
  const lines = md.split("\n").map((l) => l.trim()).filter(Boolean);
  const teamsUpper = knownTeams.map((t) => t.toUpperCase());

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const dateMatch = line.match(
      /^(\d{1,2})\.(\d{2})\.(\d{4})\s*(\d{2}:\d{2})?$/
    );
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, "0");
      const month = dateMatch[2];
      const year = dateMatch[3];
      const time = dateMatch[4] || null;
      const hasTime = !!dateMatch[4];
      const offset = getPolishOffset(parseInt(month), parseInt(day), parseInt(year));
      const timeStr = time || "00:00";
      const dateStr = `${year}-${month}-${day}T${timeStr}:00${offset}`;

      i++;
      if (i < lines.length) {
        const matchLine = lines[i];
        if (/^Kolejka\s+\d+$/i.test(matchLine)) { i++; continue; }

        const playedMatch = matchLine.match(
          /^(.+?)(\d+):(\d+)\s*\([^)]+\)(.+)$/
        );
        if (playedMatch) {
          const homeTeam = normalizeName(playedMatch[1]);
          const awayTeam = normalizeName(playedMatch[4]);
          matches.push({
            match_date: dateStr,
            home_team: homeTeam,
            away_team: awayTeam,
            score_home: parseInt(playedMatch[2]),
            score_away: parseInt(playedMatch[3]),
            is_played: true,
            venue: getVenue(playedMatch[1], playedMatch[4]),
            has_time: hasTime,
          });
        } else {
          let found = false;
          if (teamsUpper.length > 0) {
            const matchUpper = matchLine.toUpperCase();
            for (const team of teamsUpper) {
              if (matchUpper.startsWith(team)) {
                const restStart = team.length;
                const rest = matchLine.substring(restStart).trim();
                if (rest.length > 0) {
                  matches.push({
                    match_date: dateStr,
                    home_team: normalizeName(matchLine.substring(0, restStart)),
                    away_team: normalizeName(rest),
                    score_home: null,
                    score_away: null,
                    is_played: false,
                    venue: getVenue(matchLine.substring(0, restStart), rest),
                    has_time: hasTime,
                  });
                  found = true;
                  break;
                }
              }
            }
          }
          if (!found) {
            const cities = ["KRAKÓW", "LISZKI", "KASZÓW", "ZIELONKI"];
            let splitIdx = -1;
            for (const city of cities) {
              const idx = matchLine.toUpperCase().indexOf(city);
              if (idx !== -1) {
                const endOfFirst = idx + city.length;
                if (endOfFirst < matchLine.length) { splitIdx = endOfFirst; break; }
              }
            }
            if (splitIdx > 0) {
              matches.push({
                match_date: dateStr,
                home_team: normalizeName(matchLine.substring(0, splitIdx)),
                away_team: normalizeName(matchLine.substring(splitIdx)),
                score_home: null,
                score_away: null,
                is_played: false,
                venue: getVenue(matchLine.substring(0, splitIdx), matchLine.substring(splitIdx)),
                has_time: hasTime,
              });
            }
          }
        }
      }
    }
    i++;
  }
  return matches;
}

function parseTableFromHtml(html: string): TableRow[] {
  const rows: TableRow[] = [];
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch: RegExpExecArray | null;
  while ((trMatch = trRegex.exec(html)) !== null) {
    const trContent = trMatch[1];
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let tdMatch: RegExpExecArray | null;
    while ((tdMatch = tdRegex.exec(trContent)) !== null) {
      cells.push(tdMatch[1].replace(/<[^>]+>/g, "").trim());
    }
    if (cells.length >= 8) {
      const pos = parseInt(cells[0]);
      if (!isNaN(pos) && pos > 0) {
        const goalsMatch = cells[7].match(/(\d+):(\d+)/);
        rows.push({
          position: pos,
          team: normalizeName(cells[1]),
          played: parseInt(cells[2]) || 0,
          points: parseInt(cells[3]) || 0,
          won: parseInt(cells[4]) || 0,
          drawn: parseInt(cells[5]) || 0,
          lost: parseInt(cells[6]) || 0,
          goals_for: goalsMatch ? parseInt(goalsMatch[1]) : 0,
          goals_against: goalsMatch ? parseInt(goalsMatch[2]) : 0,
          is_own_team: cells[1].toUpperCase().includes(OWN_TEAM_KEYWORD),
        });
      }
    }
  }
  return rows;
}

function parseScheduleFromHtml(html: string, knownTeams: string[] = []): MatchRow[] {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) return [];
  const text = mainMatch[1]
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\r/g, "");
  return parseSchedule(text, knownTeams);
}

// ══════════════════════════════════════════════
// REGIOWYNIKI.PL PARSERS (new fallback source)
// ══════════════════════════════════════════════

function parseRegioTable(md: string): TableRow[] {
  const rows: TableRow[] = [];
  // The first table section "Zestawienie ogólne" has this structure in the markdown:
  // - <position>
  //   [Team Name](link)
  //   **<points>**
  //   <played>
  //   <won>
  //   <drawn>
  //   <lost>
  //   <goals_for>:<goals_against>

  // Find the first table section (Ogólne) - ends before the second "Sezon" heading or home/away tables
  // We look for lines between "Małopolskie | Liga okręgowa | Kraków II" and "Awans"
  const lines = md.split("\n");

  // Find the start of the main table
  let startIdx = -1;
  let endIdx = lines.length;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l.includes("Małopolskie | Liga okręgowa | Kraków II") || l.includes("Małopolskie \\| Liga okręgowa \\| Kraków II")) {
      startIdx = i;
    }
    if (startIdx > -1 && i > startIdx + 5 && l === "Awans") {
      endIdx = i;
      break;
    }
  }

  if (startIdx === -1) return rows;

  // Parse the table entries
  let pos = 0;
  for (let i = startIdx; i < endIdx; i++) {
    const line = lines[i].trim();
    // Position line: just a number like "- 1" or standalone "1"
    const posMatch = line.match(/^-\s*(\d+)$/);
    if (posMatch) {
      pos = parseInt(posMatch[1]);
      // Now scan forward for team name, points, stats
      let teamName = "";
      let points = 0;
      let played = 0, won = 0, drawn = 0, lost = 0;
      let goalsFor = 0, goalsAgainst = 0;

      for (let j = i + 1; j < Math.min(i + 40, endIdx); j++) {
        const sl = lines[j].trim();
        // Team name: [Team Name](link) — take the first one that's not a flag image
        if (!teamName && sl.match(/^\[([^\]]+)\]\(https:\/\/regiowyniki\.pl\/druzyna\//)) {
          const m = sl.match(/^\[([^\]]+)\]/);
          if (m) teamName = m[1];
        }
        // Points: **39**
        if (teamName && !points && sl.match(/^\*\*(\d+)\*\*$/)) {
          const m = sl.match(/^\*\*(\d+)\*\*$/);
          if (m) points = parseInt(m[1]);
          // Next few non-empty lines are: played, won, drawn, lost
          const stats: number[] = [];
          for (let k = j + 1; k < Math.min(j + 20, endIdx) && stats.length < 4; k++) {
            const statLine = lines[k].trim();
            if (statLine.match(/^\d+$/)) {
              stats.push(parseInt(statLine));
            }
            // Goals line: 47:16
            if (statLine.match(/^\d+:\d+$/)) {
              const gm = statLine.match(/^(\d+):(\d+)$/);
              if (gm) {
                goalsFor = parseInt(gm[1]);
                goalsAgainst = parseInt(gm[2]);
              }
              break;
            }
          }
          if (stats.length >= 4) {
            played = stats[0];
            won = stats[1];
            drawn = stats[2];
            lost = stats[3];
          }
          break;
        }
      }

      if (teamName && pos > 0) {
        rows.push({
          position: pos,
          team: teamName,
          played,
          points,
          won,
          drawn,
          lost,
          goals_for: goalsFor,
          goals_against: goalsAgainst,
          is_own_team: teamName.toUpperCase().includes(OWN_TEAM_KEYWORD),
        });
      }
    }
  }

  return rows;
}

function parseRegioSchedule(md: string): MatchRow[] {
  const matches: MatchRow[] = [];
  const lines = md.split("\n");

  // Polish month abbreviations used by regiowyniki: sie, wrz, paź, lis, gru, sty, lut, mar, kwi, maj, cze, lip
  const monthMap: Record<string, string> = {
    "sty": "01", "lut": "02", "mar": "03", "kwi": "04",
    "maj": "05", "cze": "06", "lip": "07", "sie": "08",
    "wrz": "09", "paź": "10", "lis": "11", "gru": "12",
  };

  // Find schedule section — starts after "kolejka" patterns
  let i = 0;
  let currentYear = ""; // from the date suffix like /08 (August) -> determine year

  while (i < lines.length) {
    const line = lines[i].trim();

    // Kolejka header: **14**. kolejka
    // followed by date range: 21 mar - 22 mar

    // Match date line: "- DD mmm/MM" e.g. "- 15 sie/08" or "- 21 mar/03"
    const dateLineMatch = line.match(/^-\s+(\d{1,2})\s+(sty|lut|mar|kwi|maj|cze|lip|sie|wrz|paź|lis|gru)\/(\d{2})$/);
    if (dateLineMatch) {
      const day = dateLineMatch[1].padStart(2, "0");
      const monthAbbr = dateLineMatch[2];
      const monthNum = monthMap[monthAbbr];
      // The /MM suffix is the month number confirming the month
      // Determine year from month — season 2025/2026: Aug-Dec = 2025, Jan-Jun = 2026
      const mn = parseInt(monthNum);
      const year = mn >= 7 ? "2025" : "2026";

      // Next non-empty line should be the time (e.g., "11:00")
      let time = "";
      let j = i + 1;
      while (j < lines.length && j < i + 10) {
        const tl = lines[j].trim();
        if (tl.match(/^\d{1,2}:\d{2}$/)) {
          time = tl;
          break;
        }
        j++;
      }

      const hasTime = !!time;
      const timeStr = time || "00:00";
      const offset = getPolishOffset(mn, parseInt(day), parseInt(year));
      const dateStr = `${year}-${monthNum}-${day}T${timeStr}:00${offset}`;

      // Now find the two team names and score
      // Structure: ![Team](flag) then [Team Name](link) then score [N\\\n\\\nM\\\n\\\n:](link) then [Away Team](link) then ![Away](flag)
      // We look for consecutive team name links and score pattern
      let homeTeam = "";
      let awayTeam = "";
      let scoreHome: number | null = null;
      let scoreAway: number | null = null;
      let isPlayed = false;

      // Scan forward for the match data
      for (let k = j + 1; k < Math.min(j + 40, lines.length); k++) {
        const sl = lines[k].trim();

        // Team name link: [Team Name](https://regiowyniki.pl/mecz/...)
        const teamMatch = sl.match(/^\[([^\]]+)\]\(https:\/\/regiowyniki\.pl\/mecz\//);
        if (teamMatch) {
          if (!homeTeam) {
            homeTeam = teamMatch[1];
          } else if (!awayTeam) {
            awayTeam = teamMatch[1];
          }
        }

        // Score line: [4\\\n\\\n1\\\n\\\n:](link) — in markdown it looks like [N\\⏎\\⏎M\\⏎\\⏎:]
        const scoreMatch = sl.match(/^\[(\d+)\\{1,2}$/);
        if (scoreMatch && !isPlayed) {
          scoreHome = parseInt(scoreMatch[1]);
          // Look ahead for away score
          for (let m = k + 1; m < Math.min(k + 5, lines.length); m++) {
            const sm = lines[m].trim().match(/^(\d+)\\{0,2}$/);
            if (sm) {
              scoreAway = parseInt(sm[1]);
              isPlayed = true;
              break;
            }
          }
        }

        // End of this match entry — next date or [L] marker
        if (sl.match(/^\[L\]/) || (homeTeam && awayTeam)) {
          break;
        }
      }

      if (homeTeam && awayTeam) {
        // Check if score was actually parsed — if both are null, it's an upcoming match
        // If the score pattern wasn't found, check for a "vs" style (no score)
        if (scoreHome === null || scoreAway === null) {
          isPlayed = false;
          scoreHome = null;
          scoreAway = null;
        }

        matches.push({
          match_date: dateStr,
          home_team: homeTeam,
          away_team: awayTeam,
          score_home: scoreHome,
          score_away: scoreAway,
          is_played: isPlayed,
          venue: getVenue(homeTeam, awayTeam),
          has_time: hasTime,
        });
      }
    }
    i++;
  }

  return matches;
}

// ══════════════════════════════════════════════
// SHARED HELPERS
// ══════════════════════════════════════════════

function getVenue(homeRaw: string, awayRaw: string): string {
  const isOwnHome = homeRaw.toUpperCase().includes(OWN_TEAM_KEYWORD);
  const isOwnAway = awayRaw.toUpperCase().includes(OWN_TEAM_KEYWORD);
  return isOwnHome ? "dom" : isOwnAway ? "wyjazd" : "dom";
}

function getPolishOffset(monthNum: number, dayNum: number, yearNum: number): string {
  let offset = "+01:00"; // CET default
  if (monthNum > 3 && monthNum < 10) {
    offset = "+02:00"; // CEST for sure (Apr-Sep)
  } else if (monthNum === 3 && dayNum >= 25) {
    const lastDay = new Date(yearNum, 2, 31);
    const lastSunday = 31 - lastDay.getDay();
    if (dayNum >= lastSunday) offset = "+02:00";
  } else if (monthNum === 10) {
    const lastDay = new Date(yearNum, 9, 31);
    const lastSunday = 31 - lastDay.getDay();
    if (dayNum < lastSunday) offset = "+02:00";
  }
  return offset;
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml,text/markdown",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return res.text();
}

function htmlToText(html: string): string {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const content = mainMatch ? mainMatch[1] : html;
  return content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, " | ")
    .replace(/<\/th>/gi, " | ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "–")
    .replace(/\s+/g, " ")
    .trim();
}

// ══════════════════════════════════════════════
// MAIN HANDLER
// ══════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json().catch(() => ({}));
    const syncType = body.type || "all";

    // Get URLs from settings or use defaults
    const { data: settings } = await supabase.from("site_settings").select("key, value").in("key", ["mzpn_table_url", "mzpn_schedule_url"]);
    const settingsMap: Record<string, string> = {};
    (settings || []).forEach((s: any) => { settingsMap[s.key] = s.value; });
    const TABLE_URL = settingsMap["mzpn_table_url"] || DEFAULT_TABLE_URL;
    const SCHEDULE_URL = settingsMap["mzpn_schedule_url"] || DEFAULT_SCHEDULE_URL;

    const results: Record<string, unknown> = {};

    // ── Sync league table ──
    if (syncType === "all" || syncType === "table") {
      let tableRows: TableRow[] = [];
      let source = "";

      // Try MZPN first
      try {
        console.log("Fetching league table from MZPN:", TABLE_URL);
        const tableHtml = await fetchPage(TABLE_URL);
        tableRows = parseTableFromHtml(tableHtml);
        if (tableRows.length === 0) {
          const tableText = htmlToText(tableHtml);
          tableRows = parseTable(tableText);
        }
        if (tableRows.length > 0) source = "mzpn";
        console.log(`MZPN table: ${tableRows.length} teams`);
      } catch (e) {
        console.warn("MZPN table fetch failed:", e instanceof Error ? e.message : e);
      }

      // Fallback to regiowyniki.pl
      if (tableRows.length === 0) {
        try {
          console.log("Fallback: fetching table from regiowyniki.pl");
          const regioMd = await fetchPage(REGIO_URL);
          tableRows = parseRegioTable(regioMd);
          if (tableRows.length > 0) source = "regiowyniki";
          console.log(`Regiowyniki table: ${tableRows.length} teams`);
        } catch (e) {
          console.warn("Regiowyniki table fetch failed:", e instanceof Error ? e.message : e);
        }
      }

      if (tableRows.length > 0) {
        // Get existing teams to preserve logo_url and stadium_address
        const { data: existing } = await supabase
          .from("league_table")
          .select("team, logo_url, stadium_address");
        const logoMap: Record<string, string | null> = {};
        const existingStadiumMap: Record<string, string> = {};
        (existing || []).forEach((r: any) => {
          logoMap[r.team] = r.logo_url;
          if (r.stadium_address) existingStadiumMap[r.team] = r.stadium_address;
        });

        await supabase.from("league_table").delete().neq("id", "00000000-0000-0000-0000-000000000000");

        const inserts = tableRows.map((r) => ({
          position: r.position,
          team: r.team,
          played: r.played,
          points: r.points,
          won: r.won,
          drawn: r.drawn,
          lost: r.lost,
          goals_for: r.goals_for,
          goals_against: r.goals_against,
          is_own_team: r.is_own_team,
          logo_url: logoMap[r.team] || null,
          stadium_address: existingStadiumMap[r.team] || "",
        }));

        const { error: insertErr } = await supabase.from("league_table").insert(inserts);
        if (insertErr) throw new Error(`Table insert error: ${insertErr.message}`);

        results.table = { synced: tableRows.length, source };
      } else {
        results.table = { error: "No table data parsed from any source" };
      }
    }

    // ── Sync schedule / results ──
    if (syncType === "all" || syncType === "schedule") {
      let matchRows: MatchRow[] = [];
      let source = "";

      // Get known team names and stadium addresses from league table
      const { data: leagueTeams } = await supabase.from("league_table").select("team, stadium_address");
      const knownTeams = (leagueTeams || []).map((t: any) => t.team);
      const stadiumMap: Record<string, string> = {};
      (leagueTeams || []).forEach((t: any) => { if (t.stadium_address) stadiumMap[t.team] = t.stadium_address; });
      knownTeams.sort((a: string, b: string) => b.length - a.length);

      // Try MZPN first
      try {
        console.log("Fetching schedule from MZPN:", SCHEDULE_URL);
        const scheduleHtml = await fetchPage(SCHEDULE_URL);
        matchRows = parseScheduleFromHtml(scheduleHtml, knownTeams);
        if (matchRows.length === 0) {
          const schedText = htmlToText(scheduleHtml);
          matchRows = parseSchedule(schedText, knownTeams);
        }
        if (matchRows.length > 0) source = "mzpn";
        console.log(`MZPN schedule: ${matchRows.length} matches`);
      } catch (e) {
        console.warn("MZPN schedule fetch failed:", e instanceof Error ? e.message : e);
      }

      // Fallback to regiowyniki.pl
      if (matchRows.length === 0) {
        try {
          console.log("Fallback: fetching schedule from regiowyniki.pl");
          const regioMd = await fetchPage(REGIO_URL);
          matchRows = parseRegioSchedule(regioMd);
          if (matchRows.length > 0) source = "regiowyniki";
          console.log(`Regiowyniki schedule: ${matchRows.length} matches`);
        } catch (e) {
          console.warn("Regiowyniki schedule fetch failed:", e instanceof Error ? e.message : e);
        }
      }

      // Filter only Liszczanka matches
      const ownMatches = matchRows.filter(
        (m) => m.home_team.toUpperCase().includes(OWN_TEAM_KEYWORD) || m.away_team.toUpperCase().includes(OWN_TEAM_KEYWORD)
      );

      console.log(`Total: ${matchRows.length} matches, ${ownMatches.length} Liszczanka matches`);

      if (ownMatches.length > 0) {
        await supabase.from("matches").delete().neq("id", "00000000-0000-0000-0000-000000000000");

        for (let b = 0; b < ownMatches.length; b += 50) {
          const batch = ownMatches.slice(b, b + 50).map((m) => ({
            match_date: m.match_date,
            home_team: m.home_team,
            away_team: m.away_team,
            score_home: m.score_home,
            score_away: m.score_away,
            is_played: m.is_played,
            venue: m.venue,
            league: "Klasa okręgowa, grupa II",
            stadium_address: stadiumMap[m.home_team] || "",
            scorers: [],
          }));
          const { error } = await supabase.from("matches").insert(batch);
          if (error) throw new Error(`Matches insert error: ${error.message}`);
        }

        results.schedule = {
          synced: ownMatches.length,
          played: ownMatches.filter((m) => m.is_played).length,
          upcoming: ownMatches.filter((m) => !m.is_played).length,
          source,
        };
      } else {
        results.schedule = { error: "No schedule data parsed from any source" };
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Sync error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
