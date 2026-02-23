import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookies-accepted");
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
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
                Używamy cookies, aby zapewnić najlepsze doświadczenia na naszej stronie.
              </p>
              <button
                onClick={accept}
                className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
              >
                Rozumiem
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
