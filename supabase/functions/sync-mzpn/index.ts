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

const OWN_TEAM_KEYWORD = "LISZCZANKA";

// Normalize team name from UPPERCASE to Title Case
function normalizeName(raw: string): string {
  return raw
    .trim()
    .split(/\s+/)
    .map((w) => {
      // Keep short prepositions lowercase — not relevant here, but safe
      if (w.length <= 2) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

// ── Parse league table from markdown ──
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

function parseTable(md: string): TableRow[] {
  const rows: TableRow[] = [];
  // Match table rows: | 1 | KABEL KRAKÓW | 13 | 33 | 11 | 0 | 2 | 39:15 |
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

// ── Parse schedule from markdown ──
interface MatchRow {
  match_date: string; // ISO string
  home_team: string;
  away_team: string;
  score_home: number | null;
  score_away: number | null;
  is_played: boolean;
  venue: string;
  has_time: boolean;
}

function parseSchedule(md: string, knownTeams: string[] = []): MatchRow[] {
  const matches: MatchRow[] = [];

  // Split into lines
  const lines = md.split("\n").map((l) => l.trim()).filter(Boolean);

  // Build known teams list in uppercase for matching
  const teamsUpper = knownTeams.map((t) => t.toUpperCase());

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Match date line: "15.08.2025 11:00" or "15.08.202511:00" or "6.06.2026" (no time)
    const dateMatch = line.match(
      /^(\d{1,2})\.(\d{2})\.(\d{4})\s*(\d{2}:\d{2})?$/
    );
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, "0");
      const month = dateMatch[2];
      const year = dateMatch[3];
      const time = dateMatch[4] || null;
      const hasTime = !!dateMatch[4];

      // Determine correct Polish offset (CET +01:00 or CEST +02:00)
      const monthNum = parseInt(month);
      const dayNum = parseInt(day);
      const yearNum = parseInt(year);
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

      const timeStr = time || "00:00";
      const dateStr = `${year}-${month}-${day}T${timeStr}:00${offset}`;

      // Next line should be the match
      i++;
      if (i < lines.length) {
        const matchLine = lines[i];

        // Skip "Kolejka X" lines
        if (/^Kolejka\s+\d+$/i.test(matchLine)) {
          i++;
          continue;
        }

        // Try played match: TEAM_A<score_home>:<score_away> (<half>)TEAM_B
        const playedMatch = matchLine.match(
          /^(.+?)(\d+):(\d+)\s*\([^)]+\)(.+)$/
        );
        if (playedMatch) {
          const homeTeam = normalizeName(playedMatch[1]);
          const awayTeam = normalizeName(playedMatch[4]);
          const isOwnHome = playedMatch[1].toUpperCase().includes(OWN_TEAM_KEYWORD);
          const isOwnAway = playedMatch[4].toUpperCase().includes(OWN_TEAM_KEYWORD);

          matches.push({
            match_date: dateStr,
            home_team: homeTeam,
            away_team: awayTeam,
            score_home: parseInt(playedMatch[2]),
            score_away: parseInt(playedMatch[3]),
            is_played: true,
            venue: isOwnHome ? "dom" : isOwnAway ? "wyjazd" : "dom",
            has_time: hasTime,
          });
        } else {
          // Unplayed match: two team names concatenated
          // Strategy 1: use known teams list to find the split point
          let found = false;

          if (teamsUpper.length > 0) {
            const matchUpper = matchLine.toUpperCase();
            // Try each known team as home team prefix
            for (const team of teamsUpper) {
              if (matchUpper.startsWith(team)) {
                const restStart = team.length;
                const rest = matchLine.substring(restStart).trim();
                if (rest.length > 0) {
                  const homeTeam = normalizeName(matchLine.substring(0, restStart));
                  const awayTeam = normalizeName(rest);
                  const isOwnHome = matchLine.substring(0, restStart).toUpperCase().includes(OWN_TEAM_KEYWORD);
                  const isOwnAway = rest.toUpperCase().includes(OWN_TEAM_KEYWORD);

                  matches.push({
                    match_date: dateStr,
                    home_team: homeTeam,
                    away_team: awayTeam,
                    score_home: null,
                    score_away: null,
                    is_played: false,
                    venue: isOwnHome ? "dom" : isOwnAway ? "wyjazd" : "dom",
                    has_time: hasTime,
                  });
                  found = true;
                  break;
                }
              }
            }
          }

          // Strategy 2: fallback city-based splitting
          if (!found) {
            const cities = [
              "KRAKÓW", "LISZKI", "KASZÓW", "ZIELONKI",
            ];

            let splitIdx = -1;
            for (const city of cities) {
              const idx = matchLine.toUpperCase().indexOf(city);
              if (idx !== -1) {
                const endOfFirst = idx + city.length;
                if (endOfFirst < matchLine.length) {
                  splitIdx = endOfFirst;
                  break;
                }
              }
            }

            if (splitIdx > 0) {
              const homeTeam = normalizeName(matchLine.substring(0, splitIdx));
              const awayTeam = normalizeName(matchLine.substring(splitIdx));
              const isOwnHome = matchLine.substring(0, splitIdx).toUpperCase().includes(OWN_TEAM_KEYWORD);
              const isOwnAway = matchLine.substring(splitIdx).toUpperCase().includes(OWN_TEAM_KEYWORD);

              matches.push({
                match_date: dateStr,
                home_team: homeTeam,
                away_team: awayTeam,
                score_home: null,
                score_away: null,
                is_played: false,
                venue: isOwnHome ? "dom" : isOwnAway ? "wyjazd" : "dom",
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

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return res.text();
}

// Simple HTML-to-text: strip tags, decode basic entities
function htmlToText(html: string): string {
  // Extract only main content area
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

// Parse table from HTML directly  
function parseTableFromHtml(html: string): TableRow[] {
  const rows: TableRow[] = [];
  // Find table rows: look for <tr> containing <td> with position data
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
    // Expected: Poz, Drużyna, M, Pkt, Z, R, P, Bramki
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

// Parse schedule from HTML
function parseScheduleFromHtml(html: string, knownTeams: string[] = []): MatchRow[] {
  // Extract main content
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) return [];
  const mainHtml = mainMatch[1];

  // Convert to simple text preserving structure
  const text = mainHtml
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Determine what to sync
    const body = await req.json().catch(() => ({}));
    const syncType = body.type || "all"; // "table", "schedule", or "all"

    // Get URLs from settings or use defaults
    const { data: settings } = await supabase.from("site_settings").select("key, value").in("key", ["mzpn_table_url", "mzpn_schedule_url"]);
    const settingsMap: Record<string, string> = {};
    (settings || []).forEach((s: any) => { settingsMap[s.key] = s.value; });
    const TABLE_URL = settingsMap["mzpn_table_url"] || DEFAULT_TABLE_URL;
    const SCHEDULE_URL = settingsMap["mzpn_schedule_url"] || DEFAULT_SCHEDULE_URL;

    const results: Record<string, unknown> = {};

    // ── Sync league table ──
    if (syncType === "all" || syncType === "table") {
      console.log("Fetching league table from:", TABLE_URL);
      const tableHtml = await fetchPage(TABLE_URL);

      // Try HTML parsing first
      let tableRows = parseTableFromHtml(tableHtml);

      // Fallback to markdown-style parsing on stripped text
      if (tableRows.length === 0) {
        const tableText = htmlToText(tableHtml);
        // Reconstruct markdown-like table from pipe-separated text
        tableRows = parseTable(tableText);
      }

      console.log(`Parsed ${tableRows.length} teams`);

      if (tableRows.length > 0) {
        // Get existing teams to preserve logo_url
        const { data: existing } = await supabase
          .from("league_table")
          .select("team, logo_url");
        const logoMap: Record<string, string | null> = {};
        (existing || []).forEach((r: any) => {
          logoMap[r.team] = r.logo_url;
        });

        // Delete all existing rows and insert fresh
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
        }));

        const { error: insertErr } = await supabase.from("league_table").insert(inserts);
        if (insertErr) throw new Error(`Table insert error: ${insertErr.message}`);

        results.table = { synced: tableRows.length };
      } else {
        results.table = { error: "No table data parsed" };
      }
    }

    // ── Sync schedule / results ──
    if (syncType === "all" || syncType === "schedule") {
      console.log("Fetching schedule...");
      const scheduleHtml = await fetchPage(SCHEDULE_URL);

      // Get known team names and stadium addresses from league table
      const { data: leagueTeams } = await supabase.from("league_table").select("team, stadium_address");
      const knownTeams = (leagueTeams || []).map((t: any) => t.team);
      const stadiumMap: Record<string, string> = {};
      (leagueTeams || []).forEach((t: any) => { if (t.stadium_address) stadiumMap[t.team] = t.stadium_address; });
      // Sort by length descending so longer names match first
      knownTeams.sort((a: string, b: string) => b.length - a.length);

      let matchRows = parseScheduleFromHtml(scheduleHtml, knownTeams);

      if (matchRows.length === 0) {
        // Fallback: strip to text
        const schedText = htmlToText(scheduleHtml);
        matchRows = parseSchedule(schedText, knownTeams);
      }

      // Filter only Liszczanka matches
      const ownMatches = matchRows.filter(
        (m) => m.home_team.toUpperCase().includes(OWN_TEAM_KEYWORD) || m.away_team.toUpperCase().includes(OWN_TEAM_KEYWORD)
      );

      console.log(`Parsed ${matchRows.length} matches, ${ownMatches.length} Liszczanka matches`);

      if (ownMatches.length > 0) {
        // Delete all existing matches and insert fresh
        await supabase.from("matches").delete().neq("id", "00000000-0000-0000-0000-000000000000");

        // Insert in batches of 50
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
            stadium_address: "",
            scorers: [],
          }));
          const { error } = await supabase.from("matches").insert(batch);
          if (error) throw new Error(`Matches insert error: ${error.message}`);
        }

        results.schedule = {
          synced: ownMatches.length,
          played: ownMatches.filter((m) => m.is_played).length,
          upcoming: ownMatches.filter((m) => !m.is_played).length,
        };
      } else {
        results.schedule = { error: "No schedule data parsed" };
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
