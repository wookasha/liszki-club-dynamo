import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, X, Upload, Pencil, ArrowUp, ArrowDown, Star, Eye } from "lucide-react";
import clubLogo from "@/assets/club-logo.png";

interface SquadMember {
  id: string;
  full_name: string;
  position: string;
  shirt_number: number | null;
  photo_url: string | null;
  birth_year: number | null;
  is_captain: boolean;
  sort_order: number;
  role_label: string | null;
}

const POSITIONS = [
  { value: "goalkeeper", label: "Bramkarz", short: "BRM" },
  { value: "defender", label: "Obrońca", short: "OBR" },
  { value: "midfielder", label: "Pomocnik", short: "POM" },
  { value: "forward", label: "Napastnik", short: "NAP" },
  { value: "coach", label: "Sztab szkoleniowy", short: "SZT" },
];

/* Mini Panini card preview (front only) */
const CardPreviewPattern = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M-30 300 Q30 200 -20 100 Q-50 40 10 -20 L-40 -20 L-40 300Z" fill="#dc2626" opacity="0.65" />
    <path d="M-10 300 Q40 200 0 100 Q-30 40 30 -20 L10 -20 Q-50 40 -20 100 Q30 200 -30 300Z" fill="#ffffff" opacity="0.6" />
    <path d="M10 300 Q60 200 20 100 Q-10 40 50 -20 L30 -20 Q-30 40 0 100 Q40 200 -10 300Z" fill="#1e3a8a" opacity="0.6" />
    <path d="M200 300 Q160 250 200 200 L200 300Z" fill="#dc2626" opacity="0.45" />
    <path d="M200 300 Q170 260 200 220 L200 300Z" fill="#ffffff" opacity="0.35" />
    <path d="M200 300 Q180 270 200 240 L200 300Z" fill="#1e3a8a" opacity="0.4" />
  </svg>
);

const CardPreview = ({ name, number, position, photoUrl, isCaptain }: {
  name: string; number: string; position: string; photoUrl: string | null; isCaptain: boolean;
}) => {
  const posShort = POSITIONS.find(p => p.value === position)?.short || "—";
  return (
    <div className="w-44 aspect-[2.5/3.8] rounded-xl overflow-hidden shadow-xl border-2 border-blue-200/50 relative flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-blue-50" />
      <CardPreviewPattern />
      {/* Position badge */}
      <div className="absolute top-1.5 left-1.5 z-30 px-1.5 py-0.5 bg-blue-900/90 rounded-sm">
        <span className="font-heading font-bold text-[8px] text-white tracking-widest">{posShort}</span>
      </div>
      {/* Number */}
      {number && (
        <div className="absolute top-7 left-1.5 z-30">
          <span className="font-heading font-black text-lg text-blue-900/80 leading-none">{number}</span>
        </div>
      )}
      {/* Captain */}
      {isCaptain && (
        <div className="absolute top-7 right-1.5 z-30 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
          <Star className="w-2.5 h-2.5 text-white fill-white" />
        </div>
      )}
      {/* Club logo */}
      <div className="absolute top-1.5 right-1 z-30">
        <img src={clubLogo} alt="Herb" className="w-6 h-6 object-contain drop-shadow" />
      </div>
      {/* Photo */}
      <div className="absolute left-0 right-0 bottom-0 z-20" style={{ top: "5%" }}>
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="w-full h-full object-cover object-top"
            style={{ maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)" }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-heading font-black text-blue-900/10">{number || "?"}</span>
          </div>
        )}
      </div>
      {/* Name bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 px-2 py-1.5">
        <p className="font-heading font-bold text-[8px] text-white text-center truncate uppercase tracking-wider">
          {name || "Imię i nazwisko"}
        </p>
      </div>
    </div>
  );
};

const AdminSquad = () => {
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cardBgUrl, setCardBgUrl] = useState<string | null>(null);
  const [cardBgFile, setCardBgFile] = useState<File | null>(null);
  const [cardBgPreview, setCardBgPreview] = useState<string | null>(null);
  const [savingBg, setSavingBg] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    position: "midfielder",
    shirt_number: "",
    birth_year: "",
    is_captain: false,
    role_label: "",
  });

  useEffect(() => { fetchMembers(); loadCardBg(); }, []);

  const fetchMembers = async () => {
    const { data } = await supabase.from("squad_members").select("*").order("sort_order");
    setMembers((data as SquadMember[]) || []);
    setLoading(false);
  };

  const loadCardBg = async () => {
    const { data } = await supabase.from("site_settings").select("value").eq("key", "squad_card_bg").single();
    if (data?.value) { setCardBgUrl(data.value); setCardBgPreview(data.value); }
  };

  const handleCardBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCardBgFile(file);
    setCardBgPreview(URL.createObjectURL(file));
  };

  const saveCardBg = async () => {
    if (!cardBgFile) return;
    setSavingBg(true);
    try {
      const url = await uploadPhoto(cardBgFile);
      await supabase.from("site_settings").upsert({ key: "squad_card_bg", value: url });
      setCardBgUrl(url);
      setCardBgFile(null);
    } catch (err: any) { alert("Błąd: " + err.message); }
    setSavingBg(false);
  };

  const removeCardBg = async () => {
    await supabase.from("site_settings").upsert({ key: "squad_card_bg", value: "" });
    setCardBgUrl(null);
    setCardBgPreview(null);
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
        role_label: form.role_label.trim() || null,
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
      {/* Card background setting */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <h3 className="font-heading font-bold text-foreground mb-3 text-sm">Tło karty zawodnika</h3>
        <div className="flex items-center gap-4 flex-wrap">
          {cardBgPreview && (
            <div className="w-20 h-28 rounded-lg overflow-hidden border border-border shadow-sm">
              <img src={cardBgPreview} alt="Tło karty" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-md text-sm cursor-pointer hover:bg-muted/70 transition-colors">
              <Upload className="w-4 h-4" /> {cardBgFile ? cardBgFile.name : "Wybierz tło"}
              <input type="file" accept="image/*" onChange={handleCardBgChange} className="hidden" />
            </label>
            <div className="flex gap-2">
              {cardBgFile && (
                <button onClick={saveCardBg} disabled={savingBg} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground font-heading font-semibold text-xs rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
                  <Save className="w-3 h-3" /> {savingBg ? "Zapisuję..." : "Zapisz tło"}
                </button>
              )}
              {cardBgUrl && (
                <button onClick={removeCardBg} className="flex items-center gap-1 px-3 py-1.5 bg-muted text-destructive text-xs rounded-md hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-3 h-3" /> Usuń
                </button>
              )}
            </div>
            {!cardBgUrl && !cardBgFile && <span className="text-xs text-muted-foreground">Domyślne tło będzie użyte</span>}
          </div>
        </div>
      </div>

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
          <div className="flex gap-6 flex-col sm:flex-row">
            {/* Card preview */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" /> Podgląd karty</span>
              <CardPreview
                name={form.full_name}
                number={form.shirt_number}
                position={form.position}
                photoUrl={photoPreview || (editingId ? members.find(m => m.id === editingId)?.photo_url ?? null : null)}
                isCaptain={form.is_captain}
              />
            </div>
            {/* Form fields */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
