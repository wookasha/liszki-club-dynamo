import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X, Home, MapPin } from "lucide-react";

interface Match {
  id: string;
  match_date: string;
  home_team: string;
  away_team: string;
  venue: string;
  score_home: number | null;
  score_away: number | null;
  is_played: boolean;
}

const AdminMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Match | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    match_date: "", home_team: "Liszczanka Liszki", away_team: "", venue: "dom",
    score_home: "", score_away: "", is_played: false,
  });

  useEffect(() => { fetchMatches(); }, []);

  const fetchMatches = async () => {
    const { data } = await supabase.from("matches").select("*").order("match_date", { ascending: false });
    setMatches((data as Match[]) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      match_date: form.match_date,
      home_team: form.home_team,
      away_team: form.away_team,
      venue: form.venue,
      score_home: form.is_played && form.score_home !== "" ? Number(form.score_home) : null,
      score_away: form.is_played && form.score_away !== "" ? Number(form.score_away) : null,
      is_played: form.is_played,
    };
    if (editing) {
      await supabase.from("matches").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("matches").insert(payload);
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
    setEditing(m); setCreating(false);
    setForm({
      match_date: m.match_date.slice(0, 16),
      home_team: m.home_team, away_team: m.away_team, venue: m.venue,
      score_home: m.score_home?.toString() || "", score_away: m.score_away?.toString() || "",
      is_played: m.is_played,
    });
  };

  const cancel = () => {
    setEditing(null); setCreating(false);
    setForm({ match_date: "", home_team: "Liszczanka Liszki", away_team: "", venue: "dom", score_home: "", score_away: "", is_played: false });
  };

  const showForm = editing || creating;

  return (
    <div>
      {!showForm && (
        <button onClick={() => { setCreating(true); cancel(); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors mb-6">
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
              <input type="datetime-local" value={form.match_date} onChange={(e) => setForm({ ...form, match_date: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Gospodarz</label>
                <input type="text" value={form.home_team} onChange={(e) => setForm({ ...form, home_team: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Gość</label>
                <input type="text" value={form.away_team} onChange={(e) => setForm({ ...form, away_team: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Miejsce</label>
              <select value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="dom">Dom</option>
                <option value="wyjazd">Wyjazd</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_played} onChange={(e) => setForm({ ...form, is_played: e.target.checked })} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-foreground">Mecz rozegrany</span>
            </label>
            {form.is_played && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Bramki gospodarz</label>
                  <input type="number" min={0} value={form.score_home} onChange={(e) => setForm({ ...form, score_home: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Bramki gość</label>
                  <input type="number" min={0} value={form.score_away} onChange={(e) => setForm({ ...form, score_away: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
            )}
            <button onClick={handleSave} disabled={saving || !form.match_date || !form.home_team || !form.away_team} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Zapisywanie..." : "Zapisz"}
            </button>
          </div>
        </div>
      )}

      {loading ? <p className="text-muted-foreground text-center py-8">Ładowanie...</p> : matches.length === 0 ? <p className="text-muted-foreground text-center py-8">Brak meczów.</p> : (
        <div className="space-y-3">
          {matches.map((m) => (
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
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(m)} className="p-2 text-muted-foreground hover:text-secondary"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(m.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMatches;
