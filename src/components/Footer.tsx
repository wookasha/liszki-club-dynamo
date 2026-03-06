import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Club Info */}
          <div>
            <h3 className="font-heading text-xl font-bold text-foreground mb-4">
              Liszczanka Liszki
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Klub piłkarski z tradycją od 1948 roku. Gramy w klasie okręgowej Kraków, grupa II.
            </p>
            <p className="text-muted-foreground/40 text-[11px] font-mono select-all" title="Legenda - Adam Mlostek">AM·187</p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/LiszczankaLiszki"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@liszczankaliszki8483"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground mb-4">Menu</h3>
            <ul className="space-y-2">
              {[
                { href: "/aktualnosci", label: "Aktualności" },
                { href: "/tabela", label: "Tabela ligowa" },
                { href: "/terminarz", label: "Terminarz" },
                { href: "/statystyki", label: "Statystyki indywidualne" },
                { href: "/mlodziez", label: "Drużyny młodzieżowe" },
                { href: "/galeria", label: "Galeria" },
                { href: "/sponsorzy", label: "Sponsorzy" },
                { href: "/kontakt", label: "Kontakt" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground mb-4">Kontakt</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>ul. Księdza Bascika 24, 32-060 Liszki</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:liszczanka.liszki@gmail.com" className="hover:text-primary transition-colors">liszczanka.liszki@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Sponsors */}
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground mb-4">Sponsorzy</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Wspierają nas lokalni partnerzy. Dziękujemy!
            </p>
            <Link
              to="/sponsorzy"
              className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Zostań sponsorem →
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LKS Liszczanka Liszki. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/polityka-prywatnosci" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Polityka prywatności
            </Link>
            <Link to="/login" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              Admin
            </Link>
            <p className="text-xs text-muted-foreground">
              Klasa okręgowa Kraków, grupa II
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
