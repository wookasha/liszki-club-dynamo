import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsent from "./CookieConsent";

// Launch date: March 6, 2026 at 19:48 CET (UTC+1)
const LAUNCH_DATE = new Date("2026-03-05T19:50:00Z"); // 20:50 CET = 19:50 UTC

const Layout = () => {
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  const isBeforeLaunch = Date.now() < LAUNCH_DATE.getTime();
  const hideChrome = isHomepage && isBeforeLaunch;

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
