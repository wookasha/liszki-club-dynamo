import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsent from "./CookieConsent";

// TEST: 21:13 CET = 20:13 UTC
const LAUNCH_DATE = new Date("2026-03-05T20:13:00Z");

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
    </div>
  );
};

export default Layout;
