import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const hideSplash = () => {
  const splash = document.getElementById("splash-screen");
  if (splash) {
    splash.style.opacity = "0";
    setTimeout(() => splash.remove(), 500);
  }
};

createRoot(document.getElementById("root")!).render(<App />);

// Hide splash after app renders
requestAnimationFrame(() => {
  setTimeout(hideSplash, 800);
});
