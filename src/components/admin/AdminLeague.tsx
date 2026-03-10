import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, ArrowUp, ArrowDown, Upload, X } from "lucide-react";

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
  logo_url: string | null;
  stadium_address: string;
}

const AdminLeague = () => {
  const [rows, setRows] = useState<LeagueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRow, setNewRow] = useState({
    team: "", played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0, is_own_team: false, stadium_address: "",
  });
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [newLogoPreview, setNewLogoPreview] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { fetchRows(); }, []);

  const fetchRows = async () => {
    const { data } = await supabase.from("league_table").select("*").order("position", { ascending: true });
    setRows((data as LeagueRow[]) || []);
    setLoading(false);
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("team-logos").upload(fileName, file);
    if (error) { console.error(error); return null; }
    const { data } = supabase.storage.from("team-logos").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleAdd = async () => {
    setSaving(true);
    const position = rows.length + 1;
    let logo_url: string | null = null;
    if (newLogoFile) logo_url = await uploadLogo(newLogoFile);
    await supabase.from("league_table").insert({ ...newRow, position, logo_url } as any);
    setSaving(false);
    setShowAdd(false);
    setNewRow({ team: "", played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0, is_own_team: false });
    setNewLogoFile(null);
    setNewLogoPreview(null);
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

  const handleLogoUpload = async (row: LeagueRow, file: File) => {
    const logo_url = await uploadLogo(file);
    if (!logo_url) return;
    await supabase.from("league_table").update({ logo_url } as any).eq("id", row.id);
    setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, logo_url } : r));
  };

  const handleNewLogoFile = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    setNewLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setNewLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
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

  const TeamLogo = ({ url, size = "w-6 h-6" }: { url: string | null; size?: string }) => (
    url ? <img src={url} alt="" className={`${size} object-contain rounded-sm`} /> :
    <div className={`${size} rounded-sm bg-muted border border-border flex items-center justify-center`}>
      <span className="text-[8px] text-muted-foreground">—</span>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Dodaj drużynę
        </button>
        <p className="text-xs text-muted-foreground">Kliknij wartości w tabeli, aby je edytować. Kliknij herb aby go zmienić.</p>
      </div>

      {showAdd && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <h2 className="font-heading text-lg font-bold text-foreground mb-4">Nowa drużyna</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="col-span-2 flex gap-3">
              <div className="shrink-0">
                <label className="block text-xs font-medium text-foreground mb-1">Herb</label>
                {newLogoPreview ? (
                  <div className="relative w-14 h-14">
                    <img src={newLogoPreview} alt="" className="w-14 h-14 object-contain rounded border border-border" />
                    <button onClick={() => { setNewLogoFile(null); setNewLogoPreview(null); }} className="absolute -top-1 -right-1 p-0.5 bg-background border border-border rounded-full"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <label className="w-14 h-14 border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleNewLogoFile(e.target.files?.[0] || null)} />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-foreground mb-1">Nazwa drużyny</label>
                <input type="text" value={newRow.team} onChange={(e) => setNewRow({ ...newRow, team: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
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
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="border-b border-border">
                {["#", "", "Drużyna", "M", "W", "R", "P", "Bz", "Bs", "Pkt", ""].map((h, i) => (
                  <th key={`${h}-${i}`} className="py-2.5 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-center first:text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className={`border-b border-border/50 last:border-0 ${row.is_own_team ? "bg-primary/10" : ""}`}>
                  <td className="py-2 px-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>{i + 1}</span>
                      <div className="flex flex-col">
                        <button onClick={() => moveRow(i, "up")} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20"><ArrowUp className="w-3 h-3" /></button>
                        <button onClick={() => moveRow(i, "down")} disabled={i === rows.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20"><ArrowDown className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-1">
                    <label className="cursor-pointer block">
                      <TeamLogo url={row.logo_url} />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleLogoUpload(row, e.target.files[0]); }} />
                    </label>
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
