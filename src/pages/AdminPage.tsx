import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Newspaper, Calendar, Trophy } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";
import AdminNews from "@/components/admin/AdminNews";
import AdminMatches from "@/components/admin/AdminMatches";
import AdminLeague from "@/components/admin/AdminLeague";

const tabs = [
  { id: "news", label: "Aktualności", icon: Newspaper },
  { id: "matches", label: "Terminarz", icon: Calendar },
  { id: "league", label: "Tabela", icon: Trophy },
] as const;

type TabId = typeof tabs[number]["id"];

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("news");

  useEffect(() => {
    checkAuth();
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
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground font-medium text-sm rounded-md hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" /> Wyloguj
            </button>
          </div>

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
      </div>
    </div>
  );
};

export default AdminPage;
