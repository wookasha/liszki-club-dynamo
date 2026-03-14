import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Save } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";

const AdminHistory = () => {
  const [content, setContent] = useState("");
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("club_history").select("*").limit(1).single();
      if (data) {
        setContent(data.content);
        setHistoryId(data.id);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    if (historyId) {
      await supabase.from("club_history").update({ content, updated_at: new Date().toISOString() }).eq("id", historyId);
    } else {
      const { data } = await supabase.from("club_history").insert({ content }).select().single();
      if (data) setHistoryId(data.id);
    }
    setMessage("✅ Zapisano");
    setSaving(false);
  };

  return (
    <ScrollAnimation>
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-heading text-lg font-bold text-foreground mb-4">Historia klubu</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Edytuj treść strony „Historia klubu". Oddzielaj akapity pustą linią.
        </p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
        />
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Zapisuję..." : "Zapisz"}
          </button>
          {message && <span className="text-sm text-pitch-green">{message}</span>}
        </div>
      </div>
    </ScrollAnimation>
  );
};

export default AdminHistory;
