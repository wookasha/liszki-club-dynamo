import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, X, Upload, ExternalLink, GripVertical } from "lucide-react";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
  created_at: string;
}

const AdminSponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", website_url: "" });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => { fetchSponsors(); }, []);

  const fetchSponsors = async () => {
    const { data } = await supabase.from("sponsors").select("*").order("sort_order", { ascending: true });
    setSponsors((data as Sponsor[]) || []);
    setLoading(false);
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("sponsor-logos").upload(fileName, file);
    if (error) { console.error(error); return null; }
    const { data } = supabase.storage.from("sponsor-logos").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleLogoFile = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);

    let logo_url: string | null = logoPreview?.startsWith("http") ? logoPreview : null;
    if (logoFile) logo_url = await uploadLogo(logoFile);

    if (editingId) {
      await supabase.from("sponsors").update({
        name: form.name,
        logo_url,
        website_url: form.website_url || null,
      } as any).eq("id", editingId);
    } else {
      await supabase.from("sponsors").insert({
        name: form.name,
        logo_url,
        website_url: form.website_url || null,
        sort_order: sponsors.length,
      } as any);
    }

    setSaving(false);
    cancel();
    fetchSponsors();
  };

  const handleDelete = async (sponsor: Sponsor) => {
    if (!confirm(`Usuń sponsora "${sponsor.name}"?`)) return;
    if (sponsor.logo_url) {
      const path = sponsor.logo_url.split("/sponsor-logos/")[1];
      if (path) await supabase.storage.from("sponsor-logos").remove([path]);
    }
    await supabase.from("sponsors").delete().eq("id", sponsor.id);
    fetchSponsors();
  };

  const startEdit = (sponsor: Sponsor) => {
    setEditingId(sponsor.id);
    setForm({ name: sponsor.name, website_url: sponsor.website_url || "" });
    setLogoPreview(sponsor.logo_url);
    setLogoFile(null);
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", website_url: "" });
    setLogoFile(null);
    setLogoPreview(null);
  };

  const inputClass = "w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div>
      {!showForm && (
        <button onClick={() => { cancel(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors mb-6">
          <Plus className="w-4 h-4" /> Dodaj sponsora
        </button>
      )}

      {showForm && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-foreground">{editingId ? "Edytuj sponsora" : "Nowy sponsor"}</h2>
            <button onClick={cancel} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="shrink-0">
                <label className="block text-sm font-medium text-foreground mb-1">Logo</label>
                {logoPreview ? (
                  <div className="relative w-20 h-20">
                    <img src={logoPreview} alt="" className="w-20 h-20 object-contain rounded-lg border border-border bg-muted p-1" />
                    <button onClick={() => { setLogoFile(null); setLogoPreview(null); }} className="absolute -top-1 -right-1 p-0.5 bg-background border border-border rounded-full"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground mt-1">Logo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoFile(e.target.files?.[0] || null)} />
                  </label>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nazwa sponsora</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="np. Gmina Liszki" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Strona WWW (opcjonalnie)</label>
                  <input type="url" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." className={inputClass} />
                </div>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving || !form.name} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Zapisywanie..." : "Zapisz"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Ładowanie...</p>
      ) : sponsors.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Brak sponsorów. Dodaj pierwszego!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sponsors.map((sponsor) => (
            <div key={sponsor.id} className="glass-card rounded-xl p-4 flex items-center gap-4 group">
              <div className="w-16 h-16 shrink-0 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden p-1">
                {sponsor.logo_url ? (
                  <img src={sponsor.logo_url} alt={sponsor.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs font-medium text-muted-foreground text-center leading-tight">{sponsor.name.substring(0, 10)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm font-bold text-foreground truncate">{sponsor.name}</p>
                {sponsor.website_url && (
                  <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 truncate">
                    <ExternalLink className="w-3 h-3 shrink-0" /> {sponsor.website_url}
                  </a>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(sponsor)} className="p-2 text-muted-foreground hover:text-secondary transition-colors">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(sponsor)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSponsors;
