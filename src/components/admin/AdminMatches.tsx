import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X, UserPlus, Minus } from "lucide-react";

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
  league: string;
  stadium_address: string;
  score_home: number | null;
  score_away: number | null;
  is_played: boolean;
  scorers: Scorer[];
  news_slug: string | null;
}

interface NewsOption {
  slug: string;
  title: string;
}

const defaultForm = {
  match_date: "",
  home_team: "Liszczanka Liszki",
  away_team: "",
  venue: "dom",
  league: "Klasa okręgowa, grupa II",
  stadium_address: "",
  score_home: "",
  score_away: "",
  is_played: false,
  scorers: [] as Scorer[],
  news_slug: "" as string,
};

const AdminMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [stadiumMap, setStadiumMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Match | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });

  useEffect(() => { fetchMatches(); fetchTeams(); }, []);

  const fetchTeams = async () => {
    const { data } = await supabase.from("league_table").select("team, stadium_address").order("position", { ascending: true });
    setTeams((data || []).map((r: any) => r.team));
    const map: Record<string, string> = {};
    (data || []).forEach((r: any) => { if (r.stadium_address) map[r.team] = r.stadium_address; });
    setStadiumMap(map);
  };

  const fetchMatches = async () => {
    const { data, error } = await supabase.from("matches").select("*").order("match_date", { ascending: false });
    if (error) console.error("Fetch matches error:", error);
    setMatches((data as unknown as Match[]) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Append local timezone offset so Supabase stores the intended local time
    const localDate = new Date(form.match_date);
    const tzOffset = -localDate.getTimezoneOffset();
    const sign = tzOffset >= 0 ? '+' : '-';
    const absOffset = Math.abs(tzOffset);
    const tzHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
    const tzMinutes = String(absOffset % 60).padStart(2, '0');
    const matchDateWithTz = `${form.match_date}:00${sign}${tzHours}:${tzMinutes}`;

    const payload: Record<string, unknown> = {
      match_date: matchDateWithTz,
      home_team: form.home_team,
      away_team: form.away_team,
      venue: form.venue,
      league: form.league,
      stadium_address: form.stadium_address,
      score_home: form.is_played && form.score_home !== "" ? Number(form.score_home) : null,
      score_away: form.is_played && form.score_away !== "" ? Number(form.score_away) : null,
      is_played: form.is_played,
      scorers: form.is_played ? form.scorers : [],
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("matches").update(payload as any).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("matches").insert(payload as any));
    }
    if (error) {
      console.error("Save match error:", error);
      alert("Błąd zapisu: " + error.message);
    }
    setSaving(false);
    cancel();
    fetchMatches();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usuń mecz?")) return;
    await supabase.from("matches").delete().eq("id", id);
    fetchMatches();
  };

  const startEdit = (m: Match) => {
    setEditing(m);
    setCreating(false);
    setForm({
      match_date: m.match_date.slice(0, 16),
      home_team: m.home_team,
      away_team: m.away_team,
      venue: m.venue,
      league: m.league || "Klasa okręgowa, grupa II",
      stadium_address: m.stadium_address || "",
      score_home: m.score_home?.toString() || "",
      score_away: m.score_away?.toString() || "",
      is_played: m.is_played,
      scorers: (m.scorers as Scorer[]) || [],
    });
  };

  const cancel = () => {
    setEditing(null);
    setCreating(false);
    setForm({ ...defaultForm, scorers: [] });
  };

  const addScorer = (team: "home" | "away") => {
    setForm({
      ...form,
      scorers: [...form.scorers, { player: "", goals: 1, team }],
    });
  };

  const updateScorer = (index: number, field: keyof Scorer, value: string | number) => {
    const updated = [...form.scorers];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, scorers: updated });
  };

  const removeScorer = (index: number) => {
    setForm({ ...form, scorers: form.scorers.filter((_, i) => i !== index) });
  };

  const showForm = editing || creating;

  const inputClass = "w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div>
      {!showForm && (
        <button onClick={() => { setCreating(true); cancel(); setCreating(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors mb-6">
          <Plus className="w-4 h-4" /> Dodaj mecz
        </button>
      )}

      {showForm && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-foreground">{editing ? "Edytuj mecz" : "Nowy mecz"}</h2>
            <button onClick={cancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Data i godzina</label>
              <input type="datetime-local" value={form.match_date} onChange={(e) => setForm({ ...form, match_date: e.target.value })} className={inputClass} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Gospodarz</label>
                <select value={form.home_team} onChange={(e) => {
                  const team = e.target.value;
                  setForm({ ...form, home_team: team, stadium_address: stadiumMap[team] || form.stadium_address });
                }} className={inputClass}>
                  {teams.length > 0 ? teams.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  )) : <option value={form.home_team}>{form.home_team}</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Gość</label>
                <select value={form.away_team} onChange={(e) => setForm({ ...form, away_team: e.target.value })} className={inputClass}>
                  <option value="">Wybierz drużynę</option>
                  {teams.filter(t => t !== form.home_team).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Miejsce</label>
                <select value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className={inputClass}>
                  <option value="dom">Dom</option>
                  <option value="wyjazd">Wyjazd</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Liga</label>
                <input type="text" value={form.league} onChange={(e) => setForm({ ...form, league: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Adres boiska</label>
              <input type="text" placeholder="np. ul. Księdza Bascika 24, 32-060 Liszki" value={form.stadium_address} onChange={(e) => setForm({ ...form, stadium_address: e.target.value })} className={inputClass} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_played} onChange={(e) => setForm({ ...form, is_played: e.target.checked })} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-foreground">Mecz rozegrany</span>
            </label>
            {form.is_played && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Bramki gospodarz</label>
                    <input type="number" min={0} value={form.score_home} onChange={(e) => setForm({ ...form, score_home: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Bramki gość</label>
                    <input type="number" min={0} value={form.score_away} onChange={(e) => setForm({ ...form, score_away: e.target.value })} className={inputClass} />
                  </div>
                </div>

                {/* Scorers section */}
                <div className="border border-border rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Strzelcy</h3>
                  {form.scorers.map((scorer, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select value={scorer.team} onChange={(e) => updateScorer(i, "team", e.target.value)} className="px-2 py-2 bg-muted border border-border rounded-md text-foreground text-xs w-24">
                        <option value="home">Gosp.</option>
                        <option value="away">Gość</option>
                      </select>
                      <input type="text" placeholder="Nazwisko" value={scorer.player} onChange={(e) => updateScorer(i, "player", e.target.value)} className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm" />
                      <input type="number" min={1} value={scorer.goals} onChange={(e) => updateScorer(i, "goals", Number(e.target.value))} className="w-16 px-2 py-2 bg-muted border border-border rounded-md text-foreground text-sm text-center" />
                      <button onClick={() => removeScorer(i)} className="p-1.5 text-muted-foreground hover:text-destructive"><Minus className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button onClick={() => addScorer("home")} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-muted border border-border rounded-md text-foreground hover:bg-accent transition-colors">
                      <UserPlus className="w-3 h-3" /> Strzelec gosp.
                    </button>
                    <button onClick={() => addScorer("away")} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-muted border border-border rounded-md text-foreground hover:bg-accent transition-colors">
                      <UserPlus className="w-3 h-3" /> Strzelec gość
                    </button>
                  </div>
                </div>
              </>
            )}
            <button onClick={handleSave} disabled={saving || !form.match_date || !form.home_team || !form.away_team} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Zapisywanie..." : "Zapisz"}
            </button>
          </div>
        </div>
      )}

      {loading ? <p className="text-muted-foreground text-center py-8">Ładowanie...</p> : matches.length === 0 ? <p className="text-muted-foreground text-center py-8">Brak meczów.</p> : (
        <div className="space-y-3">
          {matches.map((m) => {
            const scorers = (m.scorers as Scorer[]) || [];
            return (
              <div key={m.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.match_date).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })} {new Date(m.match_date).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-medium ${m.venue === "dom" ? "bg-pitch-green/10 text-pitch-green" : "bg-secondary/10 text-secondary"}`}>
                      {m.venue === "dom" ? "Dom" : "Wyjazd"}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {m.home_team} {m.is_played ? <span className="font-heading font-bold text-primary">{m.score_home}:{m.score_away}</span> : "vs"} {m.away_team}
                  </p>
                  {m.is_played && scorers.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ⚽ {scorers.map(s => `${s.player}${s.goals > 1 ? ` (${s.goals})` : ""}`).join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(m)} className="p-2 text-muted-foreground hover:text-secondary"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminMatches;
