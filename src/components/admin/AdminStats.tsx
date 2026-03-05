import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";

interface PlayerStat {
  id: string;
  player_name: string;
  stat_type: string;
  count: number;
  sort_order: number;
}

const AdminStats = () => {
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<"goals" | "assists">("goals");
  const [newName, setNewName] = useState("");
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase
      .from("player_stats")
      .select("*")
      .order("count", { ascending: false });
    if (data) setStats(data);
    setLoading(false);
  };

  const filtered = stats.filter((s) => s.stat_type === activeType);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await supabase.from("player_stats").insert({
      player_name: newName.trim(),
      stat_type: activeType,
      count: newCount,
      sort_order: 0,
    });
    setNewName("");
    setNewCount(0);
    fetchStats();
  };

  const handleUpdate = async (id: string, count: number) => {
    await supabase.from("player_stats").update({ count }).eq("id", id);
    fetchStats();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć tego zawodnika ze statystyk?")) return;
    await supabase.from("player_stats").delete().eq("id", id);
    fetchStats();
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Ładowanie...</div>;

  return (
    <ScrollAnimation>
      <div className="space-y-6">
        {/* Type tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveType("goals")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeType === "goals" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Strzelcy
          </button>
          <button
            onClick={() => setActiveType("assists")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeType === "assists" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Asystenci
          </button>
        </div>

        {/* Add form */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-heading text-sm font-bold text-foreground mb-3">
            Dodaj {activeType === "goals" ? "strzelca" : "asystenta"}
          </h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-foreground mb-1">Zawodnik</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Imię i nazwisko"
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-foreground mb-1">
                {activeType === "goals" ? "Bramki" : "Asysty"}
              </label>
              <input
                type="number"
                min={0}
                value={newCount}
                onChange={(e) => setNewCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Dodaj
            </button>
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Brak {activeType === "goals" ? "strzelców" : "asystentów"}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((stat) => (
              <StatRow key={stat.id} stat={stat} type={activeType} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </ScrollAnimation>
  );
};

const StatRow = ({
  stat,
  type,
  onUpdate,
  onDelete,
}: {
  stat: PlayerStat;
  type: string;
  onUpdate: (id: string, count: number) => void;
  onDelete: (id: string) => void;
}) => {
  const [count, setCount] = useState(stat.count);
  const changed = count !== stat.count;

  return (
    <div className="glass-card rounded-lg p-3 flex items-center gap-3">
      <div className="flex-1 font-medium text-sm text-foreground">{stat.player_name}</div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-20 px-2 py-1 bg-muted border border-border rounded-md text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {changed && (
          <button
            onClick={() => onUpdate(stat.id, count)}
            className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
            title="Zapisz"
          >
            <Save className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(stat.id)}
          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          title="Usuń"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AdminStats;
