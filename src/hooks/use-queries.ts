import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── News ────────────────────────────────────────────────────────────
export interface NewsListItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  created_at: string;
  slug: string;
}

export interface NewsPost extends NewsListItem {
  content: string;
}

export const useNewsList = () =>
  useQuery({
    queryKey: ["news", "list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("id, title, excerpt, category, image_url, created_at, slug")
        .eq("published", true)
        .order("created_at", { ascending: false });
      return (data as NewsListItem[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

export const useNewsPost = (slug: string | undefined) =>
  useQuery({
    queryKey: ["news", "post", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("*")
        .eq("slug", slug!)
        .eq("published", true)
        .single();
      return data as NewsPost | null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

// ── Matches ─────────────────────────────────────────────────────────
export const useMatches = () =>
  useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: true });
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

export const useNextMatch = () =>
  useQuery({
    queryKey: ["matches", "next"],
    queryFn: async () => {
      const { data } = await supabase
        .from("matches")
        .select("match_date, home_team, away_team, venue, stadium_address")
        .eq("is_played", false)
        .order("match_date", { ascending: true })
        .limit(1);
      return data?.[0] || null;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useLastResults = (limit = 5) =>
  useQuery({
    queryKey: ["matches", "results", limit],
    queryFn: async () => {
      const { data } = await supabase
        .from("matches")
        .select("home_team, away_team, score_home, score_away, match_date")
        .eq("is_played", true)
        .order("match_date", { ascending: false })
        .limit(limit);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

// ── League Table ────────────────────────────────────────────────────
export interface LeagueRow {
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
  stadium_address: string;
}

export const useLeagueTable = () =>
  useQuery({
    queryKey: ["league_table"],
    queryFn: async () => {
      const { data } = await supabase
        .from("league_table")
        .select("*")
        .order("position", { ascending: true });
      return (data as LeagueRow[]) || [];
    },
    staleTime: 10 * 60 * 1000,
  });

// ── Team Logos (lightweight query for schedule page) ─────────────────
export const useTeamLogos = () =>
  useQuery({
    queryKey: ["league_table", "logos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("league_table")
        .select("team, logo_url");
      const map: Record<string, string | null> = {};
      (data || []).forEach((r: any) => { map[r.team] = r.logo_url; });
      return map;
    },
    staleTime: 10 * 60 * 1000,
  });

// ── Sponsors ────────────────────────────────────────────────────────
export const useSponsors = () =>
  useQuery({
    queryKey: ["sponsors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sponsors")
        .select("id, name, logo_url, website_url")
        .order("sort_order", { ascending: true });
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

// ── Gallery ─────────────────────────────────────────────────────────
export const useGalleryAlbums = () =>
  useQuery({
    queryKey: ["gallery_albums"],
    queryFn: async () => {
      const { data } = await supabase
        .from("gallery_albums")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

export const useGalleryAlbum = (id: string | undefined) =>
  useQuery({
    queryKey: ["gallery_albums", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("gallery_albums")
        .select("id, title, r2_folder_path, photo_count")
        .eq("id", id!)
        .single();
      return data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

// ── Player Stats ────────────────────────────────────────────────────
export const usePlayerStats = () =>
  useQuery({
    queryKey: ["player_stats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("player_stats")
        .select("id, player_name, stat_type, count")
        .order("count", { ascending: false });
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

// ── Club History ────────────────────────────────────────────────────
export const useClubHistory = () =>
  useQuery({
    queryKey: ["club_history"],
    queryFn: async () => {
      const { data } = await supabase
        .from("club_history")
        .select("content")
        .limit(1)
        .single();
      return data?.content || "";
    },
    staleTime: 30 * 60 * 1000,
  });

// ── Timeline Events ─────────────────────────────────────────────────
export const useTimelineEvents = () =>
  useQuery({
    queryKey: ["timeline_events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("timeline_events")
        .select("*")
        .order("sort_order");
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

export const useHasTimelineEvents = () =>
  useQuery({
    queryKey: ["timeline_events", "count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("timeline_events")
        .select("id", { count: "exact", head: true });
      return (count ?? 0) > 0;
    },
    staleTime: 10 * 60 * 1000,
  });

// ── Youth Groups ────────────────────────────────────────────────────
export const useYouthGroups = () =>
  useQuery({
    queryKey: ["youth_groups"],
    queryFn: async () => {
      const { data } = await supabase
        .from("youth_groups")
        .select("*")
        .order("sort_order");
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

// ── Squad Members ───────────────────────────────────────────────────
export const useSquadMembers = () =>
  useQuery({
    queryKey: ["squad_members"],
    queryFn: async () => {
      const { data } = await supabase
        .from("squad_members")
        .select("*")
        .order("sort_order");
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

export const useHasSquadMembers = () =>
  useQuery({
    queryKey: ["squad_members", "count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("squad_members")
        .select("id", { count: "exact", head: true });
      return (count ?? 0) > 0;
    },
    staleTime: 10 * 60 * 1000,
  });

// ── Home page news (limited) ────────────────────────────────────────
export const useHomeNews = () =>
  useQuery({
    queryKey: ["news", "home"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("id, title, excerpt, category, created_at, image_url, slug")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(3);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
