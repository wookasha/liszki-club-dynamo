import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsent from "./CookieConsent";
import PWAInstallBanner from "./PWAInstallBanner";

// Launch date: March 6, 2026 at 19:48 CET (UTC+1)
const LAUNCH_DATE = new Date("2026-03-06T18:48:00Z"); // 19:48 CET = 18:48 UTC

const Layout = () => {
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  const [isLaunched, setIsLaunched] = useState(() => Date.now() >= LAUNCH_DATE.getTime());

  useEffect(() => {
    if (isLaunched) return;
    const interval = setInterval(() => {
      if (Date.now() >= LAUNCH_DATE.getTime()) {
        setIsLaunched(true);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isLaunched]);

  const hideChrome = isHomepage && !isLaunched;

  return (
    <div className="min-h-screen flex flex-col">
      {!hideChrome && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideChrome && <Footer />}
      {!hideChrome && <CookieConsent />}
      {!hideChrome && <PWAInstallBanner />}
    </div>
  );
};

export default Layout;
