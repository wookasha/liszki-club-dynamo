import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, X, Upload, Pencil, ArrowUp, ArrowDown, Star } from "lucide-react";

interface SquadMember {
  id: string;
  full_name: string;
  position: string;
  shirt_number: number | null;
  photo_url: string | null;
  birth_year: number | null;
  is_captain: boolean;
  sort_order: number;
}

const POSITIONS = [
  { value: "goalkeeper", label: "Bramkarz" },
  { value: "defender", label: "Obrońca" },
  { value: "midfielder", label: "Pomocnik" },
  { value: "forward", label: "Napastnik" },
  { value: "coach", label: "Sztab szkoleniowy" },
];

const AdminSquad = () => {
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    position: "midfielder",
    shirt_number: "",
    birth_year: "",
    is_captain: false,
  });

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    const { data } = await supabase.from("squad_members").select("*").order("sort_order");
    setMembers((data as SquadMember[]) || []);
    setLoading(false);
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `squad/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("news-images").upload(path, file, {
      cacheControl: "31536000",
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("news-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let photo_url: string | undefined;
      if (photoFile) photo_url = await uploadPhoto(photoFile);

      const payload: any = {
        full_name: form.full_name,
        position: form.position,
        shirt_number: form.shirt_number ? parseInt(form.shirt_number) : null,
        birth_year: form.birth_year ? parseInt(form.birth_year) : null,
        is_captain: form.is_captain,
      };
      if (photo_url) payload.photo_url = photo_url;

      if (editingId) {
        await supabase.from("squad_members").update(payload).eq("id", editingId);
      } else {
        payload.sort_order = members.length;
        await supabase.from("squad_members").insert(payload);
      }
      cancel();
      fetchMembers();
    } catch (err: any) {
      alert("Błąd: " + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć zawodnika?")) return;
    await supabase.from("squad_members").delete().eq("id", id);
    fetchMembers();
  };

  const moveMember = async (id: string, dir: -1 | 1) => {
    const idx = members.findIndex((m) => m.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= members.length) return;
    await Promise.all([
      supabase.from("squad_members").update({ sort_order: members[swapIdx].sort_order }).eq("id", members[idx].id),
      supabase.from("squad_members").update({ sort_order: members[idx].sort_order }).eq("id", members[swapIdx].id),
    ]);
    fetchMembers();
  };

  const startEdit = (m: SquadMember) => {
    setEditingId(m.id);
    setForm({
      full_name: m.full_name,
      position: m.position,
      shirt_number: m.shirt_number?.toString() || "",
      birth_year: m.birth_year?.toString() || "",
      is_captain: m.is_captain,
    });
    setPhotoPreview(m.photo_url);
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ full_name: "", position: "midfielder", shirt_number: "", birth_year: "", is_captain: false });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  if (loading) return <div className="text-muted-foreground text-center py-8">Ładowanie...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-bold text-foreground">Kadra</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm rounded-md hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Dodaj zawodnika
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <h3 className="font-heading font-bold text-foreground mb-4">{editingId ? "Edytuj" : "Nowy"} zawodnik</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Imię i nazwisko *</label>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Pozycja</label>
              <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Numer koszulki</label>
              <input type="number" value={form.shirt_number} onChange={(e) => setForm({ ...form, shirt_number: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Rocznik</label>
              <input type="number" value={form.birth_year} onChange={(e) => setForm({ ...form, birth_year: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_captain} onChange={(e) => setForm({ ...form, is_captain: e.target.checked })} id="captain-check" className="rounded" />
              <label htmlFor="captain-check" className="text-sm text-foreground flex items-center gap-1"><Star className="w-4 h-4 text-amber-500" /> Kapitan</label>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Zdjęcie</label>
              <label className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-md text-sm cursor-pointer hover:bg-muted/70 transition-colors">
                <Upload className="w-4 h-4" /> {photoFile ? photoFile.name : "Wybierz plik"}
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {photoPreview && <img src={photoPreview} alt="Podgląd" className="mt-2 w-20 h-20 rounded-md object-cover" />}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving || !form.full_name} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Zapisuję..." : "Zapisz"}
            </button>
            <button onClick={cancel} className="flex items-center gap-2 px-3 py-2 bg-muted text-muted-foreground text-sm rounded-md hover:text-foreground transition-colors">
              <X className="w-4 h-4" /> Anuluj
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.id} className="glass-card rounded-lg p-4 flex items-center gap-4">
            {m.photo_url ? (
              <img src={m.photo_url} alt={m.full_name} className="w-12 h-12 rounded-md object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                {m.shirt_number || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-foreground truncate">{m.full_name}</span>
                {m.is_captain && <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />}
              </div>
              <span className="text-xs text-muted-foreground">
                {POSITIONS.find((p) => p.value === m.position)?.label || m.position}
                {m.shirt_number ? ` • #${m.shirt_number}` : ""}
                {m.birth_year ? ` • rocznik ${m.birth_year}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => moveMember(m.id, -1)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><ArrowUp className="w-4 h-4" /></button>
              <button onClick={() => moveMember(m.id, 1)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><ArrowDown className="w-4 h-4" /></button>
              <button onClick={() => startEdit(m)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(m.id)} className="p-1.5 text-destructive hover:text-destructive/80 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {members.length === 0 && <p className="text-muted-foreground text-center py-8">Brak zawodników w kadrze. Dodaj pierwszego!</p>}
      </div>
    </div>
  );
};

export default AdminSquad;
