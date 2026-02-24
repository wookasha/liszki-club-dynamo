import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, ArrowUp, ArrowDown } from "lucide-react";

interface LeagueRow {
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
}

const AdminLeague = () => {
  const [rows, setRows] = useState<LeagueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRow, setNewRow] = useState({
    team: "", played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0, is_own_team: false,
  });
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { fetchRows(); }, []);

  const fetchRows = async () => {
    const { data } = await supabase.from("league_table").select("*").order("position", { ascending: true });
    setRows((data as LeagueRow[]) || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    setSaving(true);
    const position = rows.length + 1;
    await supabase.from("league_table").insert({ ...newRow, position });
    setSaving(false);
    setShowAdd(false);
    setNewRow({ team: "", played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0, is_own_team: false });
    fetchRows();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usuń drużynę z tabeli?")) return;
    await supabase.from("league_table").delete().eq("id", id);
    fetchRows();
  };

  const handleUpdate = async (row: LeagueRow, field: string, value: number | boolean) => {
    const updated = { ...row, [field]: value };
    await supabase.from("league_table").update({ [field]: value }).eq("id", row.id);
    setRows((prev) => prev.map((r) => r.id === row.id ? updated : r));
  };

  const moveRow = async (index: number, direction: "up" | "down") => {
    const newRows = [...rows];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newRows.length) return;

    const posA = newRows[index].position;
    const posB = newRows[swapIndex].position;

    await Promise.all([
      supabase.from("league_table").update({ position: posB }).eq("id", newRows[index].id),
      supabase.from("league_table").update({ position: posA }).eq("id", newRows[swapIndex].id),
    ]);

    fetchRows();
  };

  const inputCls = "w-full px-2 py-1.5 bg-muted border border-border rounded text-foreground text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Dodaj drużynę
        </button>
        <p className="text-xs text-muted-foreground">Kliknij wartości w tabeli, aby je edytować</p>
      </div>

      {showAdd && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <h2 className="font-heading text-lg font-bold text-foreground mb-4">Nowa drużyna</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1">Nazwa drużyny</label>
              <input type="text" value={newRow.team} onChange={(e) => setNewRow({ ...newRow, team: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            {[
              { key: "played", label: "M" }, { key: "won", label: "W" },
              { key: "drawn", label: "R" }, { key: "lost", label: "P" },
              { key: "goals_for", label: "Bz" }, { key: "goals_against", label: "Bs" },
              { key: "points", label: "Pkt" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-foreground mb-1">{label}</label>
                <input type="number" min={0} value={(newRow as any)[key]} onChange={(e) => setNewRow({ ...newRow, [key]: Number(e.target.value) })} className={inputCls} />
              </div>
            ))}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-1.5">
                <input type="checkbox" checked={newRow.is_own_team} onChange={(e) => setNewRow({ ...newRow, is_own_team: e.target.checked })} className="w-4 h-4 rounded" />
                <span className="text-xs font-medium text-foreground">Nasza drużyna</span>
              </label>
            </div>
          </div>
          <button onClick={handleAdd} disabled={saving || !newRow.team} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> Dodaj
          </button>
        </div>
      )}

      {loading ? <p className="text-muted-foreground text-center py-8">Ładowanie...</p> : rows.length === 0 ? <p className="text-muted-foreground text-center py-8">Tabela pusta.</p> : (
        <div className="glass-card rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                {["#", "Drużyna", "M", "W", "R", "P", "Bz", "Bs", "Pkt", ""].map((h) => (
                  <th key={h} className="py-2.5 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-center first:text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className={`border-b border-border/50 last:border-0 ${row.is_own_team ? "bg-primary/10" : ""}`}>
                  <td className="py-2 px-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>{row.position}</span>
                      <div className="flex flex-col">
                        <button onClick={() => moveRow(i, "up")} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20"><ArrowUp className="w-3 h-3" /></button>
                        <button onClick={() => moveRow(i, "down")} disabled={i === rows.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20"><ArrowDown className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </td>
                  <td className={`py-2 px-2 text-sm font-medium text-left ${row.is_own_team ? "text-primary font-bold" : "text-foreground"}`}>{row.team}</td>
                  {(["played", "won", "drawn", "lost", "goals_for", "goals_against", "points"] as const).map((field) => (
                    <td key={field} className="py-2 px-1">
                      <input type="number" min={0} value={row[field]} onChange={(e) => handleUpdate(row, field, Number(e.target.value))} className="w-12 px-1 py-1 bg-transparent border border-transparent hover:border-border focus:border-primary rounded text-sm text-center text-foreground focus:outline-none" />
                    </td>
                  ))}
                  <td className="py-2 px-2">
                    <button onClick={() => handleDelete(row.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminLeague;
