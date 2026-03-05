import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Users, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clubLogo from "@/assets/club-logo.png";

interface NavItem {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
}

const navLinks: NavItem[] = [
  { href: "/", label: "Strona główna" },
  { href: "/aktualnosci", label: "Aktualności" },
  {
    href: "#",
    label: "Seniorzy",
    children: [
      { href: "/tabela", label: "Tabela" },
      { href: "/terminarz", label: "Terminarz" },
      { href: "/statystyki", label: "Statystyki indywidualne" },
    ],
  },
  { href: "/mlodziez", label: "Młodzież" },
  { href: "/galeria", label: "Galeria" },
  { href: "/sponsorzy", label: "Sponsorzy" },
  { href: "/kontakt", label: "Kontakt" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [desktopDropdown, setDesktopDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setDesktopDropdown(null);
    setMobileDropdown(null);
  }, [location]);

  const isChildActive = (link: NavItem) =>
    link.children?.some((c) => location.pathname === c.href) ?? false;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg shadow-background/50 border-b border-border"
          : "bg-background/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden">
              <img src={clubLogo} alt="LKS Liszczanka Liszki" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="font-heading text-lg md:text-xl font-bold text-foreground leading-none">
                LISZCZANKA LISZKI
              </p>
              <p className="text-xs text-muted-foreground">Tworzymy historię od 1948 roku</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setDesktopDropdown(link.label)}
                  onMouseLeave={() => setDesktopDropdown(null)}
                >
                  <Link
                    to={link.children[0]?.href || "#"}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isChildActive(link)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.label}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${desktopDropdown === link.label ? "rotate-180" : ""}`}
                    />
                  </Link>
                  <AnimatePresence>
                    {desktopDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 pt-1 z-50"
                      >
                        <div className="w-56 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              to={child.href}
                              className={`block px-4 py-2.5 text-sm transition-colors ${
                                location.pathname === child.href
                                  ? "text-primary bg-primary/10"
                                  : "text-popover-foreground hover:bg-muted/50"
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              to="/mlodziez"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-semibold text-sm uppercase rounded-md hover:bg-primary/90 transition-colors animate-pulse-glow"
            >
              <Users className="w-4 h-4" />
              Dołącz do nas
            </Link>
            <button
              onClick={() => {
                setIsOpen((prev) => !prev);
                setMobileDropdown(null);
              }}
              className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Otwórz menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/98 backdrop-blur-md border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <button
                      onClick={() =>
                        setMobileDropdown((prev) =>
                          prev === link.label ? null : link.label,
                        )
                      }
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-md text-base font-medium transition-colors ${
                        isChildActive(link)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${mobileDropdown === link.label ? "rotate-180" : ""}`}
                      />
                    </button>
                    {mobileDropdown === link.label && (
                      <div className="pl-4 space-y-0.5 mt-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={`block pl-4 pr-4 py-2.5 text-sm rounded-md transition-colors ${
                              location.pathname === child.href
                                ? "text-primary bg-primary/10"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`block px-4 py-3 rounded-md text-base font-medium transition-colors ${
                      location.pathname === link.href
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
              <Link
                to="/mlodziez"
                className="flex items-center justify-center gap-2 mt-4 px-4 py-3 bg-primary text-primary-foreground font-heading font-semibold uppercase rounded-md"
              >
                <Users className="w-4 h-4" />
                Dołącz do nas
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
