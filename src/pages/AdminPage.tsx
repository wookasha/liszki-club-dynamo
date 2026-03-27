import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut, Newspaper, Calendar, Trophy, ImageIcon, Handshake,
  Users, RefreshCw, Settings, Save, BarChart3, History,
  ShieldCheck, Menu, X, ChevronDown,
} from "lucide-react";
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

const sidebarGroups = [
  {
    label: "Treści",
    items: [
      { id: "news", label: "Aktualności", icon: Newspaper },
      { id: "gallery", label: "Galeria", icon: ImageIcon },
    ],
  },
  {
    label: "Rozgrywki",
    items: [
      { id: "matches", label: "Terminarz", icon: Calendar },
      { id: "league", label: "Tabela", icon: Trophy },
      { id: "stats", label: "Statystyki", icon: BarChart3 },
    ],
  },
  {
    label: "Klub",
    items: [
      { id: "squad", label: "Kadra", icon: ShieldCheck },
      { id: "youth", label: "Młodzież", icon: Users },
      { id: "sponsors", label: "Sponsorzy", icon: Handshake },
      { id: "history", label: "Historia", icon: History },
    ],
  },
] as const;

type TabId = "news" | "matches" | "league" | "stats" | "squad" | "youth" | "sponsors" | "gallery" | "history";

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("news");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [mzpnTableUrl, setMzpnTableUrl] = useState("");
  const [mzpnScheduleUrl, setMzpnScheduleUrl] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      const { data, error } = await supabase.functions.invoke("sync-mzpn", { body: { type: "all" } });
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

  const selectTab = (id: TabId) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const activeLabel = sidebarGroups.flatMap((g) => g.items).find((i: any) => i.id === activeTab)?.label ?? "";

  const sidebarContent = (
    <nav className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h1 className="font-heading text-lg font-bold text-foreground">Panel CMS</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Zarządzaj treścią klubu</p>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {sidebarGroups.map((group) => (
          <div key={group.label} className="mb-1">
            <p className="px-4 py-2 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">
              {group.label}
            </p>
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => selectTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border space-y-1.5">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            showSettings ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Settings className="w-4 h-4" /> Ustawienia MZPN
        </button>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Synchronizuję..." : "Sync MZPN"}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Wyloguj
        </button>
      </div>
    </nav>
  );

  return (
    <div className="pt-20 min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-border bg-card/50 flex-col fixed top-20 bottom-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-end p-2">
              <button onClick={() => setMobileOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-60">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 sticky top-20 z-20">
          <button onClick={() => setMobileOpen(true)} className="p-2 text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-heading font-bold text-foreground text-sm">{activeLabel}</span>
        </div>

        <div className="p-4 md:p-6 lg:p-8 max-w-5xl">
          {syncResult && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${syncResult.startsWith("✅") ? "bg-pitch-green/10 text-pitch-green" : "bg-destructive/10 text-destructive"}`}>
              {syncResult}
            </div>
          )}

          {showSettings && (
            <div className="glass-card rounded-xl p-6 mb-6">
              <h2 className="font-heading text-lg font-bold text-foreground mb-4">Linki MZPN do synchronizacji</h2>
              <p className="text-xs text-muted-foreground mb-4">Zmień te linki gdy rozpocznie się nowy sezon rozgrywkowy.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Link do tabeli</label>
                  <input type="url" value={mzpnTableUrl} onChange={(e) => setMzpnTableUrl(e.target.value)} placeholder="https://malopolskizpn.pl/rozgrywki/..." className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Link do terminarza</label>
                  <input type="url" value={mzpnScheduleUrl} onChange={(e) => setMzpnScheduleUrl(e.target.value)} placeholder="https://malopolskizpn.pl/rozgrywki/..." className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <button onClick={saveSettings} disabled={savingSettings} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" /> {savingSettings ? "Zapisuję..." : "Zapisz linki"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "news" && <AdminNews />}
          {activeTab === "matches" && <AdminMatches />}
          {activeTab === "league" && <AdminLeague />}
          {activeTab === "squad" && <AdminSquad />}
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
      </main>
    </div>
  );
};

export default AdminPage;
