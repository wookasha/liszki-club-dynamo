import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ScrollAnimation from "@/components/ScrollAnimation";

interface YouthGroup {
  id: string;
  name: string;
  ages: string;
  schedule: string;
  location: string;
  coach: string;
  sort_order: number;
}

const emptyForm = { name: "", ages: "", schedule: "", location: "Stadion w Liszkach", coach: "", sort_order: 0 };

const AdminYouth = () => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<YouthGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    setLoading(true);
    const { data } = await supabase.from("youth_groups").select("*").order("sort_order");
    if (data) setGroups(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Podaj nazwę grupy", variant: "destructive" }); return; }

    if (editing) {
      const { error } = await supabase.from("youth_groups").update(form).eq("id", editing);
      if (error) { toast({ title: "Błąd zapisu", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Zaktualizowano grupę" });
    } else {
      const { error } = await supabase.from("youth_groups").insert(form);
      if (error) { toast({ title: "Błąd dodawania", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Dodano grupę" });
    }
    resetForm();
    fetchGroups();
  };

  const handleEdit = (group: YouthGroup) => {
    setEditing(group.id);
    setForm({ name: group.name, ages: group.ages, schedule: group.schedule, location: group.location, coach: group.coach, sort_order: group.sort_order });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć tę grupę?")) return;
    await supabase.from("youth_groups").delete().eq("id", id);
    toast({ title: "Usunięto grupę" });
    fetchGroups();
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
  };

  const inputClass = "w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <ScrollAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-foreground">Grupy młodzieżowe</h2>
          {!showForm && (
            <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Dodaj grupę
            </button>
          )}
        </div>

        {showForm && (
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              {editing ? "Edytuj grupę" : "Nowa grupa"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nazwa grupy</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="np. Żaki" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Wiek</label>
                <input type="text" value={form.ages} onChange={(e) => setForm({ ...form, ages: e.target.value })} placeholder="np. 4-6 lat" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Termin treningu</label>
                <input type="text" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="np. Wtorek i Czwartek 16:00-17:00" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Miejsce treningu</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="np. Stadion w Liszkach" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Trener</label>
                <input type="text" value={form.coach} onChange={(e) => setForm({ ...form, coach: e.target.value })} placeholder="np. Jan Kowalski" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Kolejność</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
                <Save className="w-4 h-4" /> {editing ? "Zapisz zmiany" : "Dodaj"}
              </button>
              <button onClick={resetForm} className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-md hover:text-foreground transition-colors">
                <X className="w-4 h-4" /> Anuluj
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground text-sm">Ładowanie...</p>
        ) : groups.length === 0 ? (
          <p className="text-muted-foreground text-sm">Brak grup. Dodaj pierwszą grupę młodzieżową.</p>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <div key={group.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-bold text-foreground">{group.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {group.ages} · {group.schedule} · {group.location} · Trener: {group.coach}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(group)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(group.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollAnimation>
  );
};

export default AdminYouth;
