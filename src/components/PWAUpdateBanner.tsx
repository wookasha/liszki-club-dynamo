import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 min
const VERSION_URL = "/version.json";

export const PWAUpdateBanner = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const checkForUpdate = useCallback(async () => {
    try {
      const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const stored = localStorage.getItem("pwa-app-version");
      if (!stored) {
        localStorage.setItem("pwa-app-version", data.version);
        return;
      }
      if (stored !== data.version) {
        localStorage.setItem("pwa-pending-version", data.version);
        setUpdateAvailable(true);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    // Initial check after 10s
    const timeout = setTimeout(checkForUpdate, 10_000);
    const interval = setInterval(checkForUpdate, CHECK_INTERVAL);

    // Also check on visibility change (user returns to tab/app)
    const onVisibility = () => {
      if (document.visibilityState === "visible") checkForUpdate();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [checkForUpdate]);

  const handleUpdate = () => {
    const newVersion = localStorage.getItem("pwa-pending-version");
    if (newVersion) localStorage.setItem("pwa-app-version", newVersion);
    window.location.reload();
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-xl">
        <RefreshCw className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: "3s" }} />
        <span className="text-sm text-foreground font-medium">
          Dostępna nowa wersja!
        </span>
        <button
          onClick={handleUpdate}
          className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          Odśwież
        </button>
      </div>
    </div>
  );
};
