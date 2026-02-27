import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import NewsPage from "./pages/NewsPage";
import SchedulePage from "./pages/SchedulePage";
import LeagueTablePage from "./pages/LeagueTablePage";
import YouthPage from "./pages/YouthPage";
import GalleryPage from "./pages/GalleryPage";
import SponsorsPage from "./pages/SponsorsPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
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
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/aktualnosci" element={<NewsPage />} />
            <Route path="/aktualnosci/:id" element={<NewsPage />} />
            <Route path="/terminarz" element={<SchedulePage />} />
            <Route path="/tabela" element={<LeagueTablePage />} />
            <Route path="/mlodziez" element={<YouthPage />} />
            <Route path="/galeria" element={<GalleryPage />} />
            <Route path="/sponsorzy" element={<SponsorsPage />} />
            <Route path="/kontakt" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
