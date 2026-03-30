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

function normalizeName(raw: string): string {
  return raw.trim().split(/\s+/).map((w) => {
    if (w.length <= 2) return w.toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(" ");
}

// ── Common interfaces ──
interface TableRow {
  position: number; team: string; played: number; points: number;
  won: number; drawn: number; lost: number;
  goals_for: number; goals_against: number; is_own_team: boolean;
}

interface MatchRow {
  match_date: string; home_team: string; away_team: string;
  score_home: number | null; score_away: number | null;
  is_played: boolean; venue: string; has_time: boolean;
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
  let offset = "+01:00";
  if (monthNum > 3 && monthNum < 10) {
    offset = "+02:00";
  } else if (monthNum === 3 && dayNum >= 25) {
    const lastSunday = 31 - new Date(yearNum, 2, 31).getDay();
    if (dayNum >= lastSunday) offset = "+02:00";
  } else if (monthNum === 10) {
    const lastSunday = 31 - new Date(yearNum, 9, 31).getDay();
    if (dayNum < lastSunday) offset = "+02:00";
  }
  return offset;
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return res.text();
}

function htmlToText(html: string): string {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const content = mainMatch ? mainMatch[1] : html;
  return content
    .replace(/<br\s*\/?>/gi, "\n").replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, " | ").replace(/<\/th>/gi, " | ")
    .replace(/<[^>]+>/g, "").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ").replace(/&#8211;/g, "–")
    .replace(/\s+/g, " ").trim();
}

// ══════════════════════════════════════════════
// MZPN PARSERS
// ══════════════════════════════════════════════

function parseTable(md: string): TableRow[] {
  const rows: TableRow[] = [];
  const re = /\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+):(\d+)\s*\|/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    rows.push({
      position: parseInt(m[1]), team: normalizeName(m[2]),
      played: parseInt(m[3]), points: parseInt(m[4]),
      won: parseInt(m[5]), drawn: parseInt(m[6]), lost: parseInt(m[7]),
      goals_for: parseInt(m[8]), goals_against: parseInt(m[9]),
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
    const dateMatch = line.match(/^(\d{1,2})\.(\d{2})\.(\d{4})\s*(\d{2}:\d{2})?$/);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, "0");
      const month = dateMatch[2]; const year = dateMatch[3];
      const time = dateMatch[4] || null; const hasTime = !!time;
      const offset = getPolishOffset(parseInt(month), parseInt(day), parseInt(year));
      const dateStr = `${year}-${month}-${day}T${time || "00:00"}:00${offset}`;
      i++;
      if (i < lines.length) {
        const matchLine = lines[i];
        if (/^Kolejka\s+\d+$/i.test(matchLine)) { i++; continue; }
        const playedMatch = matchLine.match(/^(.+?)(\d+):(\d+)\s*\([^)]+\)(.+)$/);
        if (playedMatch) {
          matches.push({
            match_date: dateStr, home_team: normalizeName(playedMatch[1]),
            away_team: normalizeName(playedMatch[4]),
            score_home: parseInt(playedMatch[2]), score_away: parseInt(playedMatch[3]),
            is_played: true, venue: getVenue(playedMatch[1], playedMatch[4]), has_time: hasTime,
          });
        } else {
          let found = false;
          if (teamsUpper.length > 0) {
            const matchUpper = matchLine.toUpperCase();
            for (const team of teamsUpper) {
              if (matchUpper.startsWith(team)) {
                const rest = matchLine.substring(team.length).trim();
                if (rest.length > 0) {
                  matches.push({
                    match_date: dateStr, home_team: normalizeName(matchLine.substring(0, team.length)),
                    away_team: normalizeName(rest), score_home: null, score_away: null,
                    is_played: false, venue: getVenue(matchLine.substring(0, team.length), rest), has_time: hasTime,
                  });
                  found = true; break;
                }
              }
            }
          }
          if (!found) {
            const cities = ["KRAKÓW", "LISZKI", "KASZÓW", "ZIELONKI"];
            let splitIdx = -1;
            for (const city of cities) {
              const idx = matchLine.toUpperCase().indexOf(city);
              if (idx !== -1) { const e = idx + city.length; if (e < matchLine.length) { splitIdx = e; break; } }
            }
            if (splitIdx > 0) {
              matches.push({
                match_date: dateStr, home_team: normalizeName(matchLine.substring(0, splitIdx)),
                away_team: normalizeName(matchLine.substring(splitIdx)),
                score_home: null, score_away: null, is_played: false,
                venue: getVenue(matchLine.substring(0, splitIdx), matchLine.substring(splitIdx)), has_time: hasTime,
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
          position: pos, team: normalizeName(cells[1]),
          played: parseInt(cells[2]) || 0, points: parseInt(cells[3]) || 0,
          won: parseInt(cells[4]) || 0, drawn: parseInt(cells[5]) || 0, lost: parseInt(cells[6]) || 0,
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
    .replace(/<br\s*\/?>/gi, "\n").replace(/<\/div>/gi, "\n")
    .replace(/<\/p>/gi, "\n").replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n").replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\r/g, "");
  return parseSchedule(text, knownTeams);
}

// ══════════════════════════════════════════════
// REGIOWYNIKI.PL HTML PARSERS (fallback)
// ══════════════════════════════════════════════

function parseRegioTableHtml(html: string): TableRow[] {
  const rows: TableRow[] = [];

  // Find the first table section (id="tabletotal")
  const sectionMatch = html.match(/id="tabletotal">([\s\S]*?)(?:<div[^>]*id="table(?:home|away|form|stats)"|<h\d|$)/i);
  if (!sectionMatch) return rows;
  const section = sectionMatch[1];

  // Each team is in a <li class="list-group-item tablegroupteam...">
  const liRegex = /<li[^>]*tablegroupteam[^>]*>([\s\S]*?)<\/li>/gi;
  let liMatch: RegExpExecArray | null;
  while ((liMatch = liRegex.exec(section)) !== null) {
    const li = liMatch[1];

    // Position: <div class="label label-default nr"...>1</div>
    const posMatch = li.match(/<div[^>]*class="[^"]*nr[^"]*"[^>]*>(\d+)<\/div>/);
    if (!posMatch) continue;
    const position = parseInt(posMatch[1]);

    // Team name: <a href="/druzyna/..." class="xhidden-xs">Team Name</a>
    const teamMatch = li.match(/<a[^>]*href="\/druzyna\/[^"]*"[^>]*class="[^"]*xhidden[^"]*"[^>]*>([^<]+)<\/a>/);
    if (!teamMatch) continue;
    const team = teamMatch[1].trim();

    // Stats divs: points (strong), played, won, drawn, lost, goals
    // <div class="col-xs-1"><strong>39</strong></div>
    const pointsMatch = li.match(/<div[^>]*col-xs-1[^>]*><strong>(\d+)<\/strong><\/div>/);
    const points = pointsMatch ? parseInt(pointsMatch[1]) : 0;

    // Remaining stats in hidden-xs-400 divs
    const statsRegex = /<div[^>]*hidden-xs-400[^>]*>(\d+)<\/div>/g;
    const stats: number[] = [];
    let sm: RegExpExecArray | null;
    while ((sm = statsRegex.exec(li)) !== null) {
      stats.push(parseInt(sm[1]));
    }
    const [played, won, drawn, lost] = stats.length >= 4 ? stats : [0, 0, 0, 0];

    // Goals: <div class="col-xs-3 col-sm-1 col-lg-1">47:16</div>
    const goalsMatch = li.match(/<div[^>]*col-sm-1[^>]*col-lg-1[^>]*>(\d+):(\d+)<\/div>/);
    const goals_for = goalsMatch ? parseInt(goalsMatch[1]) : 0;
    const goals_against = goalsMatch ? parseInt(goalsMatch[2]) : 0;

    rows.push({
      position, team, played, points, won, drawn, lost,
      goals_for, goals_against,
      is_own_team: team.toUpperCase().includes(OWN_TEAM_KEYWORD),
    });
  }
  return rows;
}

function parseRegioScheduleHtml(html: string): MatchRow[] {
  const matches: MatchRow[] = [];

  // Polish month map
  const monthMap: Record<string, string> = {
    "sty": "01", "lut": "02", "mar": "03", "kwi": "04",
    "maj": "05", "cze": "06", "lip": "07", "sie": "08",
    "wrz": "09", "paź": "10", "pa\u017a": "10", "lis": "11", "gru": "12",
  };

  // Each match is in a <li class="list-group-item"> inside schedule panels
  // Date: <div class="col-xs-7">15<span class="hidden-xs"> sie</span><span ...>/08</span></div>
  // Time: <div class="col-xs-5">11:00</div>
  // Teams: <a href="/mecz/...">Team Name<a>
  // Score: <div class="goals digits">4</div> ... <div class="goals digits">1</div>

  // Find all match list items (inside collapse panels)
  const panelRegex = /<div[^>]*id="collapse\d+"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*(?=<div[^>]*class="panel|$)/gi;
  // Actually let's just find all match <li> items
  const matchLiRegex = /<li[^>]*class="list-group-item"[^>]*>\s*<div[^>]*class="row"[^>]*>([\s\S]*?)<\/li>/gi;

  // We need to be in the schedule section, which comes after the table section
  // Find start of schedule — first "kolejka" occurrence
  const schedStart = html.indexOf("kolejka");
  if (schedStart === -1) return matches;
  const schedHtml = html.substring(schedStart);

  let liMatch: RegExpExecArray | null;
  while ((liMatch = matchLiRegex.exec(schedHtml)) !== null) {
    const li = liMatch[1];

    // Skip header rows (contain "Drużyna" or "Pkt")
    if (li.includes("Drużyna") || li.includes(">Pkt<")) continue;

    // Date: day + month abbreviation
    const dayMatch = li.match(/<div[^>]*col-xs-7[^>]*>\s*(\d{1,2})<span[^>]*hidden-xs[^>]*>\s*([a-ząćęłńóśźż]+)\s*<\/span>/i);
    const monthFallback = li.match(/\/(\d{2})<\/span>/);
    if (!dayMatch) continue;

    const day = dayMatch[1].padStart(2, "0");
    const monthAbbr = dayMatch[2].trim().toLowerCase();
    let monthNum = monthMap[monthAbbr];
    if (!monthNum && monthFallback) monthNum = monthFallback[1];
    if (!monthNum) continue;

    // Time
    const timeMatch = li.match(/<div[^>]*col-xs-5[^>]*>\s*(\d{1,2}:\d{2})\s*<\/div>/);
    const time = timeMatch ? timeMatch[1] : null;
    const hasTime = !!time;

    // Year from season
    const mn = parseInt(monthNum);
    const year = mn >= 7 ? 2025 : 2026;
    const offset = getPolishOffset(mn, parseInt(day), year);
    const dateStr = `${year}-${monthNum}-${day}T${time || "00:00"}:00${offset}`;

    // Teams: either <a href="/mecz/...">TeamName<a> (played) or plain text in <div class="...team">TeamName</div> (upcoming)
    const teamRegex = /<a[^>]*href="\/mecz\/\d+[^"]*"[^>]*>([^<]+)<(?:\/a|a)>/g;
    const teams: string[] = [];
    let tm: RegExpExecArray | null;
    while ((tm = teamRegex.exec(li)) !== null) {
      const name = tm[1].trim();
      if (name && !teams.includes(name)) teams.push(name);
    }

    // Fallback: extract from <div class="...team">TeamName</div> (upcoming matches without links)
    if (teams.length < 2) {
      const teamDivRegex = /<div[^>]*\bteam\b[^>]*>\s*(?:<a[^>]*>)?([^<]+)(?:<\/?\s*a>)?\s*<\/div>/gi;
      let tdm: RegExpExecArray | null;
      while ((tdm = teamDivRegex.exec(li)) !== null) {
        const name = tdm[1].trim();
        if (name && name.length > 1 && !teams.includes(name)) teams.push(name);
      }
    }

    // Score: <div class="goals digits">N</div>
    const scoreRegex = /<div[^>]*goals\s+digits[^>]*>(\d+)<\/div>/g;
    const scores: number[] = [];
    let sc: RegExpExecArray | null;
    while ((sc = scoreRegex.exec(li)) !== null) {
      scores.push(parseInt(sc[1]));
    }

    if (teams.length >= 2) {
      const homeTeam = teams[0];
      const awayTeam = teams[1];
      const isPlayed = scores.length >= 2;

      matches.push({
        match_date: dateStr,
        home_team: homeTeam,
        away_team: awayTeam,
        score_home: isPlayed ? scores[0] : null,
        score_away: isPlayed ? scores[1] : null,
        is_played: isPlayed,
        venue: getVenue(homeTeam, awayTeam),
        has_time: hasTime,
      });
    }
  }

  return matches;
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
    const preferredSource = body.source || "auto"; // "auto" | "mzpn" | "regiowyniki"

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

      // Try sources based on preference
      const tryMzpn = async () => {
        console.log("Fetching league table from MZPN:", TABLE_URL);
        const tableHtml = await fetchPage(TABLE_URL);
        let rows = parseTableFromHtml(tableHtml);
        if (rows.length === 0) rows = parseTable(htmlToText(tableHtml));
        console.log(`MZPN table: ${rows.length} teams`);
        return rows;
      };
      const tryRegio = async () => {
        console.log("Fetching table from regiowyniki.pl");
        const regioHtml = await fetchPage(REGIO_URL);
        const rows = parseRegioTableHtml(regioHtml);
        console.log(`Regiowyniki table: ${rows.length} teams`);
        return rows;
      };

      if (preferredSource === "mzpn") {
        try { tableRows = await tryMzpn(); if (tableRows.length > 0) source = "mzpn"; } catch (e) { console.warn("MZPN table failed:", e); }
        if (tableRows.length === 0) { try { tableRows = await tryRegio(); if (tableRows.length > 0) source = "regiowyniki"; } catch (e) { console.warn("Regiowyniki table failed:", e); } }
      } else if (preferredSource === "regiowyniki") {
        try { tableRows = await tryRegio(); if (tableRows.length > 0) source = "regiowyniki"; } catch (e) { console.warn("Regiowyniki table failed:", e); }
        if (tableRows.length === 0) { try { tableRows = await tryMzpn(); if (tableRows.length > 0) source = "mzpn"; } catch (e) { console.warn("MZPN table failed:", e); } }
      } else {
        // auto: MZPN first, fallback regio
        try { tableRows = await tryMzpn(); if (tableRows.length > 0) source = "mzpn"; } catch (e) { console.warn("MZPN table failed:", e); }
        if (tableRows.length === 0) { try { tableRows = await tryRegio(); if (tableRows.length > 0) source = "regiowyniki"; } catch (e) { console.warn("Regiowyniki table failed:", e); } }
      }

      if (tableRows.length > 0) {
        const { data: existing } = await supabase.from("league_table").select("team, logo_url, stadium_address");
        const logoMap: Record<string, string | null> = {};
        const existingStadiumMap: Record<string, string> = {};
        (existing || []).forEach((r: any) => {
          logoMap[r.team] = r.logo_url;
          if (r.stadium_address) existingStadiumMap[r.team] = r.stadium_address;
        });

        await supabase.from("league_table").delete().neq("id", "00000000-0000-0000-0000-000000000000");

        const inserts = tableRows.map((r) => ({
          position: r.position, team: r.team, played: r.played,
          points: r.points, won: r.won, drawn: r.drawn, lost: r.lost,
          goals_for: r.goals_for, goals_against: r.goals_against,
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

      const { data: leagueTeams } = await supabase.from("league_table").select("team, stadium_address");
      const knownTeams = (leagueTeams || []).map((t: any) => t.team);
      const stadiumMap: Record<string, string> = {};
      (leagueTeams || []).forEach((t: any) => { if (t.stadium_address) stadiumMap[t.team] = t.stadium_address; });
      knownTeams.sort((a: string, b: string) => b.length - a.length);

      // Try sources based on preference
      const tryMzpnSch = async () => {
        console.log("Fetching schedule from MZPN:", SCHEDULE_URL);
        const scheduleHtml = await fetchPage(SCHEDULE_URL);
        let rows = parseScheduleFromHtml(scheduleHtml, knownTeams);
        if (rows.length === 0) rows = parseSchedule(htmlToText(scheduleHtml), knownTeams);
        console.log(`MZPN schedule: ${rows.length} matches`);
        return rows;
      };
      const tryRegioSch = async () => {
        console.log("Fetching schedule from regiowyniki.pl");
        const regioHtml = await fetchPage(REGIO_URL);
        const rows = parseRegioScheduleHtml(regioHtml);
        console.log(`Regiowyniki schedule: ${rows.length} matches`);
        return rows;
      };

      if (preferredSource === "mzpn") {
        try { matchRows = await tryMzpnSch(); if (matchRows.length > 0) source = "mzpn"; } catch (e) { console.warn("MZPN schedule failed:", e); }
        if (matchRows.length === 0) { try { matchRows = await tryRegioSch(); if (matchRows.length > 0) source = "regiowyniki"; } catch (e) { console.warn("Regiowyniki schedule failed:", e); } }
      } else if (preferredSource === "regiowyniki") {
        try { matchRows = await tryRegioSch(); if (matchRows.length > 0) source = "regiowyniki"; } catch (e) { console.warn("Regiowyniki schedule failed:", e); }
        if (matchRows.length === 0) { try { matchRows = await tryMzpnSch(); if (matchRows.length > 0) source = "mzpn"; } catch (e) { console.warn("MZPN schedule failed:", e); } }
      } else {
        try { matchRows = await tryMzpnSch(); if (matchRows.length > 0) source = "mzpn"; } catch (e) { console.warn("MZPN schedule failed:", e); }
        if (matchRows.length === 0) { try { matchRows = await tryRegioSch(); if (matchRows.length > 0) source = "regiowyniki"; } catch (e) { console.warn("Regiowyniki schedule failed:", e); } }
      }

      const ownMatches = matchRows.filter(
        (m) => m.home_team.toUpperCase().includes(OWN_TEAM_KEYWORD) || m.away_team.toUpperCase().includes(OWN_TEAM_KEYWORD)
      );

      console.log(`Total: ${matchRows.length} matches, ${ownMatches.length} Liszczanka`);

      if (ownMatches.length > 0) {
        await supabase.from("matches").delete().neq("id", "00000000-0000-0000-0000-000000000000");

        for (let b = 0; b < ownMatches.length; b += 50) {
          const batch = ownMatches.slice(b, b + 50).map((m) => ({
            match_date: m.match_date, home_team: m.home_team, away_team: m.away_team,
            score_home: m.score_home, score_away: m.score_away, is_played: m.is_played,
            venue: m.venue, league: "Klasa okręgowa, grupa II",
            stadium_address: stadiumMap[m.home_team] || "", scorers: [],
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
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
