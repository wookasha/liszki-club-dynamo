import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";

declare global {
  interface Window {
    loadGA?: () => void;
  }
}

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const decided = localStorage.getItem("cookies-analytics");
    if (decided === null) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookies-analytics", "true");
    localStorage.setItem("cookies-accepted", "true");
    setVisible(false);
    window.loadGA?.();
  };

  const reject = () => {
    localStorage.setItem("cookies-analytics", "false");
    localStorage.setItem("cookies-accepted", "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 glass-card p-4 rounded-xl shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <Cookie className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium mb-1">
                Ta strona używa plików cookies
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Używamy cookies analitycznych (Google Analytics) do analizy ruchu na stronie.{" "}
                <a href="/polityka-prywatnosci" className="text-primary hover:underline">
                  Polityka prywatności
                </a>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={accept}
                  className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                  Akceptuję
                </button>
                <button
                  onClick={reject}
                  className="px-4 py-1.5 bg-muted text-muted-foreground text-sm font-medium rounded-md hover:bg-muted/80 transition-colors"
                >
                  Odrzucam
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
