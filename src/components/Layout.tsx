import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsent from "./CookieConsent";

// TEST: ~1 minute from now
const LAUNCH_DATE = new Date(Date.now() + 60 * 1000);

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
