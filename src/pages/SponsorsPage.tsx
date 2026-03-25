import { useState } from "react";
import { CheckCircle, Star, Award, Shield, ArrowRight, ExternalLink } from "lucide-react";
import { useSponsors } from "@/hooks/use-queries";
import ScrollAnimation from "@/components/ScrollAnimation";
import PrivacyClause from "@/components/PrivacyClause";

const packages = [
  {
    name: "Brązowy",
    price: "500 zł / sezon",
    icon: Shield,
    features: ["Logo na stronie klubu", "Podziękowanie w social media"],
    popular: false,
  },
  {
    name: "Srebrny",
    price: "1 500 zł / sezon",
    icon: Award,
    features: [
      "Logo na stronie klubu",
      "Baner na stadionie",
      "Podziękowanie w social media",
      "Logo na materiałach klubowych",
    ],
    popular: false,
  },
  {
    name: "Złoty",
    price: "3 000 zł / sezon",
    icon: Star,
    features: [
      "Logo na stronie klubu",
      "Baner na stadionie",
      "Logo na koszulkach",
      "Post sponsorski dwa razy w roku",
      "Logo na materiałach klubowych",
    ],
    popular: true,
  },
];

const SponsorsPage = () => {
  const { data: sponsors = [] } = useSponsors();
  const [formData, setFormData] = useState({ name: "", company: "", email: "", phone: "", message: "" });
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <h1 className="section-heading text-4xl md:text-5xl mb-2">Zostań sponsorem</h1>
          <p className="text-muted-foreground mb-2">Wspieraj lokalny sport i promuj swoją firmę</p>
          <div className="section-heading-accent mb-10" />
        </ScrollAnimation>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {packages.map((pkg, i) => (
            <ScrollAnimation key={pkg.name} delay={i * 0.1}>
              <div className={`glass-card rounded-xl p-6 relative hover-lift ${pkg.popular ? "border-primary ring-1 ring-primary/50" : ""}`}>
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-full">
                    Najpopularniejszy
                  </span>
                )}
                <pkg.icon className={`w-10 h-10 mb-4 ${pkg.popular ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="font-heading text-2xl font-bold text-foreground mb-1">{pkg.name}</h3>
                <p className="text-lg font-bold text-primary mb-4">{pkg.price}</p>
                <ul className="space-y-2">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-pitch-green shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollAnimation>
          ))}
        </div>

        <ScrollAnimation>
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Formularz kontaktowy</h2>
            {submitted ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <CheckCircle className="w-16 h-16 text-pitch-green mx-auto mb-4" />
                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Dziękujemy!</h3>
                <p className="text-muted-foreground">Skontaktujemy się z Państwem w sprawie współpracy.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 md:p-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Imię i nazwisko</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Firma</label>
                    <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Telefon</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Wiadomość</label>
                  <textarea rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-2.5 bg-muted border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <PrivacyClause accepted={privacyAccepted} onChange={setPrivacyAccepted} />
                <button type="submit" disabled={!privacyAccepted} className="w-full py-3 bg-primary text-primary-foreground font-heading font-semibold uppercase rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  Wyślij zapytanie <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </ScrollAnimation>

        {sponsors.length > 0 && (
          <ScrollAnimation>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6 text-center">Nasi partnerzy</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
              {sponsors.map((sponsor: any) => {
                const url = sponsor.website_url
                  ? sponsor.website_url.startsWith("http") ? sponsor.website_url : `https://${sponsor.website_url}`
                  : null;
                const Wrapper = url ? "a" : "div";
                const wrapperProps = url ? { href: url, target: "_blank", rel: "noopener noreferrer" } : {};

                return (
                  <Wrapper
                    key={sponsor.id}
                    {...wrapperProps as any}
                    className="glass-card rounded-xl p-5 flex items-center justify-center hover-lift cursor-pointer aspect-[3/2] group transition-all duration-300 relative overflow-hidden"
                  >
                    {sponsor.logo_url ? (
                      <img src={sponsor.logo_url} alt={sponsor.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <span className="font-heading text-xl font-bold text-muted-foreground text-center">{sponsor.name}</span>
                    )}
                    {url && (
                      <span className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[11px] text-primary-foreground bg-primary/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Odwiedź stronę
                        </span>
                      </span>
                    )}
                  </Wrapper>
                );
              })}
            </div>
          </ScrollAnimation>
        )}
      </div>
    </div>
  );
};

export default SponsorsPage;
