import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Newspaper, Calendar, Trophy, ImageIcon, Handshake, Users, RefreshCw, Settings, Save, BarChart3, History, ShieldCheck } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";
import AdminNews from "@/components/admin/AdminNews";
import AdminMatches from "@/components/admin/AdminMatches";
import AdminLeague from "@/components/admin/AdminLeague";
import AdminGallery from "@/components/admin/AdminGallery";
import AdminSponsors from "@/components/admin/AdminSponsors";
import AdminYouth from "@/components/admin/AdminYouth";
import AdminStats from "@/components/admin/AdminStats";
import AdminHistory from "@/components/admin/AdminHistory";
import AdminTimeline from "@/components/admin/AdminTimeline";
import AdminSquad from "@/components/admin/AdminSquad";

const tabs = [
  { id: "news", label: "Aktualności", icon: Newspaper },
  { id: "matches", label: "Terminarz", icon: Calendar },
  { id: "league", label: "Tabela", icon: Trophy },
  { id: "squad", label: "Kadra", icon: ShieldCheck },
  { id: "gallery", label: "Galeria", icon: ImageIcon },
  { id: "sponsors", label: "Sponsorzy", icon: Handshake },
  { id: "youth", label: "Młodzież", icon: Users },
  { id: "stats", label: "Statystyki", icon: BarChart3 },
  { id: "history", label: "Historia", icon: History },
] as const;

type TabId = typeof tabs[number]["id"];

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("news");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [mzpnTableUrl, setMzpnTableUrl] = useState("");
  const [mzpnScheduleUrl, setMzpnScheduleUrl] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    checkAuth();
    loadSettings();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/login"); return; }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin");
    if (!roles || roles.length === 0) navigate("/");
  };

  const loadSettings = async () => {
    const { data } = await supabase.from("site_settings").select("key, value").in("key", ["mzpn_table_url", "mzpn_schedule_url"]);
    (data || []).forEach((s: any) => {
      if (s.key === "mzpn_table_url") setMzpnTableUrl(s.value);
      if (s.key === "mzpn_schedule_url") setMzpnScheduleUrl(s.value);
    });
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    await Promise.all([
      supabase.from("site_settings").upsert({ key: "mzpn_table_url", value: mzpnTableUrl, updated_at: new Date().toISOString() }),
      supabase.from("site_settings").upsert({ key: "mzpn_schedule_url", value: mzpnScheduleUrl, updated_at: new Date().toISOString() }),
    ]);
    setSavingSettings(false);
    setSyncResult("✅ Zapisano linki MZPN");
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("sync-mzpn", {
        body: { type: "all" },
      });
      if (error) throw error;
      if (data?.success) {
        const t = data.results?.table;
        const s = data.results?.schedule;
        const parts: string[] = [];
        if (t?.synced) parts.push(`Tabela: ${t.synced} drużyn`);
        if (s?.synced) parts.push(`Mecze: ${s.synced} (rozegrane: ${s.played}, nadchodzące: ${s.upcoming})`);
        setSyncResult(`✅ ${parts.join(" • ") || "Zsynchronizowano"}`);
      } else {
        setSyncResult(`❌ ${data?.error || "Błąd synchronizacji"}`);
      }
    } catch (err: any) {
      setSyncResult(`❌ ${err.message || "Błąd połączenia"}`);
    }
    setSyncing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <ScrollAnimation>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="section-heading text-3xl mb-1">Panel CMS</h1>
              <p className="text-muted-foreground text-sm">Zarządzaj treścią strony klubu</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-2 px-3 py-2 font-medium text-sm rounded-md transition-colors ${showSettings ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground font-heading font-semibold text-sm rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{syncing ? "Synchronizuję..." : "Synchronizuj z MZPN"}</span>
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground font-medium text-sm rounded-md hover:text-foreground transition-colors">
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Wyloguj</span>
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="glass-card rounded-xl p-6 mb-6">
              <h2 className="font-heading text-lg font-bold text-foreground mb-4">Linki MZPN do synchronizacji</h2>
              <p className="text-xs text-muted-foreground mb-4">Zmień te linki gdy rozpocznie się nowy sezon rozgrywkowy.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Link do tabeli</label>
                  <input
                    type="url"
                    value={mzpnTableUrl}
                    onChange={(e) => setMzpnTableUrl(e.target.value)}
                    placeholder="https://malopolskizpn.pl/rozgrywki/..."
                    className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Link do terminarza</label>
                  <input
                    type="url"
                    value={mzpnScheduleUrl}
                    onChange={(e) => setMzpnScheduleUrl(e.target.value)}
                    placeholder="https://malopolskizpn.pl/rozgrywki/..."
                    className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={saveSettings}
                  disabled={savingSettings}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {savingSettings ? "Zapisuję..." : "Zapisz linki"}
                </button>
              </div>
            </div>
          )}

          {syncResult && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${syncResult.startsWith("✅") ? "bg-pitch-green/10 text-pitch-green" : "bg-destructive/10 text-destructive"}`}>
              {syncResult}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-muted/50 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </ScrollAnimation>

        {activeTab === "news" && <AdminNews />}
        {activeTab === "matches" && <AdminMatches />}
        {activeTab === "league" && <AdminLeague />}
        {activeTab === "gallery" && <AdminGallery />}
        {activeTab === "sponsors" && <AdminSponsors />}
        {activeTab === "youth" && <AdminYouth />}
        {activeTab === "stats" && <AdminStats />}
        {activeTab === "history" && (
          <div className="space-y-6">
            <AdminHistory />
            <AdminTimeline />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
