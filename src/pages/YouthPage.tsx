import { useState } from "react";
import { Users, Clock, MapPin, CheckCircle } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";

const groups = [
  { name: "Żaki", ages: "4-6 lat", schedule: "Wtorek i Czwartek 16:00-17:00", spots: 5 },
  { name: "Orliki", ages: "7-8 lat", schedule: "Poniedziałek i Środa 16:00-17:30", spots: 3 },
  { name: "Młodziki", ages: "9-10 lat", schedule: "Wtorek i Piątek 16:30-18:00", spots: 8 },
  { name: "Trampkarze", ages: "11-12 lat", schedule: "Poniedziałek, Środa, Piątek 17:00-18:30", spots: 4 },
];

const YouthPage = () => {
  const [formData, setFormData] = useState({ childName: "", age: "", parentName: "", phone: "", email: "", group: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {groups.map((g, i) => (
            <ScrollAnimation key={g.name} delay={i * 0.1}>
              <div className="glass-card rounded-xl p-6 hover-lift">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-1">{g.name}</h3>
                <p className="text-sm text-primary font-medium mb-3">{g.ages}</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {g.schedule}</p>
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Stadion w Liszkach</p>
                </div>
                <p className="mt-4 text-xs font-medium text-pitch-green">Wolne miejsca: {g.spots}</p>
              </div>
            </ScrollAnimation>
          ))}
        </div>

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
                    <input
                      type="text"
                      required
                      value={formData.childName}
                      onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Wiek dziecka</label>
                    <input
                      type="number"
                      min={4}
                      max={12}
                      required
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Imię i nazwisko rodzica</label>
                  <input
                    type="text"
                    required
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Telefon</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Preferowana grupa</label>
                  <select
                    required
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Wybierz grupę...</option>
                    {groups.map((g) => (
                      <option key={g.name} value={g.name}>{g.name} ({g.ages})</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-primary-foreground font-heading font-semibold uppercase rounded-md hover:bg-primary/90 transition-colors"
                >
                  Wyślij zgłoszenie
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
