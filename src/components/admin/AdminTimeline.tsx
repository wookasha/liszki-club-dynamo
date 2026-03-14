import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save, Trash2, GripVertical } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";

interface TimelineEvent {
  id: string;
  year_label: string;
  title: string;
  description: string;
  sort_order: number;
}

const AdminTimeline = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("timeline_events").select("*").order("sort_order");
    if (data) setEvents(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = () => {
    const maxOrder = events.length > 0 ? Math.max(...events.map((e) => e.sort_order)) : 0;
    setEvents([...events, { id: `new-${Date.now()}`, year_label: "", title: "", description: "", sort_order: maxOrder + 1 }]);
  };

  const handleChange = (index: number, field: keyof TimelineEvent, value: string) => {
    const updated = [...events];
    (updated[index] as any)[field] = value;
    setEvents(updated);
  };

  const handleDelete = async (index: number) => {
    const event = events[index];
    if (!event.id.startsWith("new-")) {
      await supabase.from("timeline_events").delete().eq("id", event.id);
    }
    setEvents(events.filter((_, i) => i !== index));
    setMessage("✅ Usunięto");
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      const payload = { year_label: e.year_label, title: e.title, description: e.description, sort_order: i + 1 };

      if (e.id.startsWith("new-")) {
        await supabase.from("timeline_events").insert(payload);
      } else {
        await supabase.from("timeline_events").update(payload).eq("id", e.id);
      }
    }

    await load();
    setMessage("✅ Zapisano");
    setSaving(false);
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Ładowanie...</div>;

  return (
    <ScrollAnimation>
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">Oś czasu</h2>
            <p className="text-xs text-muted-foreground">Zarządzaj wydarzeniami na osi czasu.</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Dodaj
          </button>
        </div>

        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={event.id} className="bg-muted/50 border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground mt-2 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      value={event.year_label}
                      onChange={(e) => handleChange(index, "year_label", e.target.value)}
                      placeholder="Rok / okres"
                      className="px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      value={event.title}
                      onChange={(e) => handleChange(index, "title", e.target.value)}
                      placeholder="Tytuł wydarzenia"
                      className="px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <textarea
                    value={event.description}
                    onChange={(e) => handleChange(index, "description", e.target.value)}
                    placeholder="Opis wydarzenia"
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                  />
                </div>
                <button
                  onClick={() => handleDelete(index)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Zapisuję..." : "Zapisz wszystko"}
          </button>
          {message && <span className="text-sm text-pitch-green">{message}</span>}
        </div>
      </div>
    </ScrollAnimation>
  );
};

export default AdminTimeline;
