import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Clock, MapPin, CheckCircle, User } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";
import PrivacyClause from "@/components/PrivacyClause";

interface YouthGroup {
  id: string;
  name: string;
  ages: string;
  schedule: string;
  location: string;
  coach: string;
  sort_order: number;
}

const YouthPage = () => {
  const [groups, setGroups] = useState<YouthGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ childName: "", age: "", parentName: "", phone: "", email: "", group: "" });
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      const { data } = await supabase.from("youth_groups").select("*").order("sort_order");
      if (data) setGroups(data);
      setLoading(false);
    };
    fetchGroups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "youth", data: formData }),
      });
      if (!res.ok) throw new Error("Błąd wysyłki");
      setSubmitted(true);
    } catch {
      setError("Nie udało się wysłać zgłoszenia. Spróbuj ponownie.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <h1 className="section-heading text-4xl md:text-5xl mb-2">Drużyny młodzieżowe</h1>
          <p className="text-muted-foreground mb-2">Zapraszamy dzieci w wieku 4-12 lat do wspólnej zabawy z piłką!</p>
          <div className="section-heading-accent mb-10" />
        </ScrollAnimation>

        {/* Age Groups */}
        {loading ? (
          <p className="text-muted-foreground text-sm mb-16">Ładowanie grup...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {groups.map((g, i) => (
              <ScrollAnimation key={g.id} delay={i * 0.1}>
                <div className="glass-card rounded-xl p-6 hover-lift">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-1">{g.name}</h3>
                  <p className="text-sm text-primary font-medium mb-3">{g.ages}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {g.schedule}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {g.location}</p>
                    <p className="flex items-center gap-2 text-pitch-green font-medium"><User className="w-4 h-4" /> Trener: {g.coach}</p>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        )}

        {/* Registration Form */}
        <ScrollAnimation>
          <div className="max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Zapisz dziecko na trening</h2>

            {submitted ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <CheckCircle className="w-16 h-16 text-pitch-green mx-auto mb-4" />
                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Dziękujemy!</h3>
                <p className="text-muted-foreground">Formularz został wysłany. Skontaktujemy się z Państwem wkrótce.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 md:p-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Imię i nazwisko dziecka</label>
                    <input type="text" required value={formData.childName} onChange={(e) => setFormData({ ...formData, childName: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Wiek dziecka</label>
                    <input type="number" min={4} max={12} required value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Imię i nazwisko rodzica</label>
                  <input type="text" required value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Telefon</label>
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Preferowana grupa</label>
                  <select required value={formData.group} onChange={(e) => setFormData({ ...formData, group: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Wybierz grupę...</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.name}>{g.name} ({g.ages})</option>
                    ))}
                  </select>
                </div>
                <PrivacyClause accepted={privacyAccepted} onChange={setPrivacyAccepted} />
                {error && <p className="text-destructive text-sm">{error}</p>}
                <button type="submit" disabled={sending || !privacyAccepted} className="w-full py-3 bg-primary text-primary-foreground font-heading font-semibold uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {sending ? "Wysyłanie..." : "Wyślij zgłoszenie"}
                </button>
              </form>
            )}
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
};

export default YouthPage;
