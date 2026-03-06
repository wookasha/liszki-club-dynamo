import { useState } from "react";
import { MapPin, Mail, Phone, Facebook, Youtube, CheckCircle, Send } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";
import PrivacyClause from "@/components/PrivacyClause";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", data: formData }),
      });
      if (!res.ok) throw new Error("Błąd wysyłki");
      setSubmitted(true);
    } catch {
      setError("Nie udało się wysłać wiadomości. Spróbuj ponownie.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <h1 className="section-heading text-4xl md:text-5xl mb-2">Kontakt</h1>
          <div className="section-heading-accent mb-10" />
        </ScrollAnimation>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Info */}
          <ScrollAnimation>
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h2 className="font-heading text-xl font-bold text-foreground mb-4">Dane kontaktowe</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Adres</p>
                      <p className="text-sm text-muted-foreground">LKS Liszczanka Liszki<br />ul. Księdza Bascika 24<br />32-060 Liszki</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <a href="mailto:liszczanka.liszki@gmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">liszczanka.liszki@gmail.com</a>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h2 className="font-heading text-xl font-bold text-foreground mb-4">Social media</h2>
              <div className="flex gap-3">
                  <a href="https://www.facebook.com/LiszczankaLiszki" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors text-sm">
                    <Facebook className="w-4 h-4" /> Facebook
                  </a>
                  <a href="https://www.youtube.com/@liszczankaliszki8483" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors text-sm">
                    <Youtube className="w-4 h-4" /> YouTube
                  </a>
                </div>
                <p className="text-muted-foreground/20 text-[9px] font-mono mt-3 select-all" title="Kto pamięta? - Bogusław Moniak">BM·185</p>
              </div>

              {/* Google Map */}
              <div className="glass-card rounded-xl overflow-hidden h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1500!2d19.765381941533445!3d50.041477070374306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDAyJzI5LjMiTiAxOcKwNDUnNTUuNCJF!5e0!3m2!1spl!2spl!4v1600000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokalizacja klubu Liszczanka Liszki"
                />
              </div>
            </div>
          </ScrollAnimation>

          {/* Contact Form */}
          <ScrollAnimation delay={0.1}>
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Napisz do nas</h2>
            {submitted ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <CheckCircle className="w-16 h-16 text-pitch-green mx-auto mb-4" />
                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Wiadomość wysłana!</h3>
                <p className="text-muted-foreground">Odpowiemy najszybciej jak to możliwe.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 md:p-8 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Imię i nazwisko</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Temat</label>
                  <input type="text" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Wiadomość</label>
                  <textarea rows={5} required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <PrivacyClause accepted={privacyAccepted} onChange={setPrivacyAccepted} />
                {error && <p className="text-destructive text-sm">{error}</p>}
                <button type="submit" disabled={sending || !privacyAccepted} className="w-full py-3 bg-primary text-primary-foreground font-heading font-semibold uppercase rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  <Send className="w-4 h-4" /> {sending ? "Wysyłanie..." : "Wyślij wiadomość"}
                </button>
              </form>
            )}
          </ScrollAnimation>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
