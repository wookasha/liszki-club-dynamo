import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, X, Upload, Pencil, ArrowUp, ArrowDown, Star, Eye } from "lucide-react";
import clubLogo from "@/assets/club-logo.png";
import cardBgDefault from "@/assets/card-bg.png";

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

/* Panini card preview (front only) — mirrors the real card on the public Kadra page */
const CardPreview = ({ name, number, position, photoUrl, isCaptain, cardBg }: {
  name: string; number: string; position: string; photoUrl: string | null; isCaptain: boolean; cardBg: string;
}) => {
  const posShort = POSITIONS.find(p => p.value === position)?.short || "—";
  return (
    <div
      className="w-44 aspect-[2.5/3.8] rounded-xl overflow-hidden relative flex-shrink-0"
      style={{
        boxShadow: "0 6px 20px -4px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.3)",
        border: "2px solid rgba(148,163,184,0.25)",
      }}
    >
      <img src={cardBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/20" />

      {/* Position badge — top-left */}
      <div className="absolute top-2 left-2 z-30 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-sm">
        <span className="font-heading font-bold text-[10px] text-white tracking-widest">{posShort}</span>
      </div>

      {/* Shirt number — top-left under position */}
      {number && (
        <div className="absolute top-11 left-2 z-30">
          <span className="font-heading font-black text-2xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">{number}</span>
        </div>
      )}

      {/* Captain star */}
      {isCaptain && (
        <div className="absolute top-10 right-2 z-30 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md ring-2 ring-amber-300/60">
          <span className="font-heading font-black text-xs text-white leading-none">C</span>
        </div>
      )}

      {/* Club logo — top-right corner */}
      <div className="absolute top-2 right-1.5 z-30">
        <img src={clubLogo} alt="Herb klubu" className="w-8 h-8 object-contain drop-shadow-md" />
      </div>

      {/* Player photo */}
      <div className="absolute left-0 right-0 bottom-0 z-20 pointer-events-none" style={{ top: "5%" }}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover object-top drop-shadow-lg"
            style={{ maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)" }}
          />
        ) : (
          <div className="w-full h-[75%] flex items-center justify-center">
            <span className="text-7xl font-heading font-black text-white/20">{number || "?"}</span>
          </div>
        )}
      </div>

      {/* Bottom name bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 px-3 py-2">
        <h3 className="font-heading font-bold text-[10px] sm:text-xs text-white text-center leading-tight truncate uppercase tracking-wider">
          {name || "Imię i nazwisko"}
        </h3>
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
  const [season, setSeason] = useState("");
  const [savingSeason, setSavingSeason] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    position: "midfielder",
    shirt_number: "",
    birth_year: "",
    is_captain: false,
    role_label: "",
  });

  useEffect(() => { fetchMembers(); loadSettings(); }, []);

  const fetchMembers = async () => {
    const { data } = await supabase.from("squad_members").select("*").order("sort_order");
    setMembers((data as SquadMember[]) || []);
    setLoading(false);
  };

  const loadSettings = async () => {
    const { data } = await supabase.from("site_settings").select("key, value").in("key", ["squad_card_bg", "squad_season"]);
    (data || []).forEach((s: any) => {
      if (s.key === "squad_card_bg" && s.value) { setCardBgUrl(s.value); setCardBgPreview(s.value); }
      if (s.key === "squad_season") setSeason(s.value || "");
    });
  };

  const saveSeason = async () => {
    setSavingSeason(true);
    await supabase.from("site_settings").upsert({ key: "squad_season", value: season, updated_at: new Date().toISOString() });
    setSavingSeason(false);
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
      role_label: m.role_label || "",
    });
    setPhotoPreview(m.photo_url);
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ full_name: "", position: "midfielder", shirt_number: "", birth_year: "", is_captain: false, role_label: "" });
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
      {/* Season setting */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <h3 className="font-heading font-bold text-foreground mb-3 text-sm">Sezon</h3>
        <p className="text-xs text-muted-foreground mb-3">Wyświetlany w nagłówku zakładki Kadra i na odwrocie kart zawodników.</p>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="np. 2026/2027"
            className="w-40 px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button onClick={saveSeason} disabled={savingSeason || !season.trim()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {savingSeason ? "Zapisuję..." : "Zapisz sezon"}
          </button>
        </div>
      </div>

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
                cardBg={cardBgPreview || cardBgDefault}
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
            {form.position === "coach" && (
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Rola w sztabie</label>
                <input
                  value={form.role_label}
                  onChange={(e) => setForm({ ...form, role_label: e.target.value })}
                  placeholder="np. Trener, Kierownik, Fizjoterapeuta"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
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
