import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { ScrollToTop } from "./components/ScrollToTop";
import Layout from "./components/Layout";
import { PWAUpdateBanner } from "./components/PWAUpdateBanner";
import Index from "./pages/Index";
import NewsPage from "./pages/NewsPage";
import SchedulePage from "./pages/SchedulePage";
import LeagueTablePage from "./pages/LeagueTablePage";
import YouthPage from "./pages/YouthPage";
import GalleryPage from "./pages/GalleryPage";
import GalleryAlbumPage from "./pages/GalleryAlbumPage";
import SponsorsPage from "./pages/SponsorsPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import StatsPage from "./pages/StatsPage";
import HistoryPage from "./pages/HistoryPage";
import TimelinePage from "./pages/TimelinePage";
import SquadPage from "./pages/SquadPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/aktualnosci" element={<NewsPage />} />
            <Route path="/aktualnosci/:id" element={<NewsPage />} />
            <Route path="/terminarz" element={<SchedulePage />} />
            <Route path="/tabela" element={<LeagueTablePage />} />
            <Route path="/mlodziez" element={<YouthPage />} />
            <Route path="/galeria" element={<GalleryPage />} />
            <Route path="/galeria/:id" element={<GalleryAlbumPage />} />
            <Route path="/sponsorzy" element={<SponsorsPage />} />
            <Route path="/kontakt" element={<ContactPage />} />
            <Route path="/statystyki" element={<StatsPage />} />
            <Route path="/historia" element={<HistoryPage />} />
            <Route path="/os-czasu" element={<TimelinePage />} />
            <Route path="/kadra" element={<SquadPage />} />
            <Route path="/polityka-prywatnosci" element={<PrivacyPolicyPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <PWAUpdateBanner />
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
