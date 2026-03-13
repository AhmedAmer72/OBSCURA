import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { WagmiProvider } from "wagmi";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { config } from "@/config/wagmi";
import GooeyNav from "@/components/elite/GooeyNav";
import NavRightSlot from "@/components/elite/NavRightSlot";
import Index from "./pages/Index.tsx";
import HomePage from "./pages/HomePage.tsx";
import PayPage from "./pages/PayPage.tsx";
import DocsPage from "./pages/DocsPage.tsx";
import PrivacyPage from "./pages/PrivacyPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import VotePage from "./pages/VotePage.tsx";
import CreditPage from "./pages/CreditPage.tsx";
import EcosystemPage from "./pages/EcosystemPage.tsx";
import PMFPage from "./pages/PMFPage.tsx";
import ContactsPage from "./pages/ContactsPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import IdentityPage from "./pages/IdentityPage.tsx";
import MobileDownloadPage from "./pages/MobileDownloadPage.tsx";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { ValuesRevealProvider } from "@/contexts/ValuesRevealContext";
const queryClient = new QueryClient();

/** App workspace routes use the integrated light shell (icon rail + sidebar + top bar). */
const WORKSPACE_PATHS = new Set(["/home", "/pay", "/pay/contacts", "/pay/settings", "/settings", "/identity", "/vote", "/credit", "/ecosystem"]);

/** Marketing pages ship their own nav (SpadeLandingNav) — skip global GooeyNav. */
const SELF_NAV_PATHS = new Set(["/docs", "/privacy", "/download"]);

const normalizePath = (pathname: string) => {
  const base = pathname.split("?")[0].replace(/\/$/, "") || "/";
  return base;
};

const isWorkspacePath = (pathname: string) => {
  const p = normalizePath(pathname);
  return WORKSPACE_PATHS.has(p) || p.startsWith("/pay/");
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const isWorkspace = isWorkspacePath(location.pathname);
  const isSelfNav = SELF_NAV_PATHS.has(normalizePath(location.pathname));
  const isSageShell = isLanding || isWorkspace || isSelfNav;

  return (
    <>
      <div className={isSageShell ? "min-h-screen bg-sage-1" : "min-h-screen bg-background"}>
        {!isLanding && !isWorkspace && !isSelfNav && <GooeyNav rightSlot={<NavRightSlot />} />}

        {/* Landing scroll-pin sections need no transform ancestor (breaks sticky). */}
        {isLanding ? (
          <Routes location={location}>
            <Route path="/" element={<Index />} />
          </Routes>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
            >
              <Routes location={location}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/pay" element={<PayPage />} />
                <Route path="/pay/contacts" element={<ContactsPage />} />
                <Route path="/pay/settings" element={<Navigate to="/settings" replace />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/identity" element={<IdentityPage />} />
                <Route path="/vote" element={<VotePage />} />
                <Route path="/credit" element={<CreditPage />} />
                <Route path="/ecosystem" element={<EcosystemPage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/download" element={<MobileDownloadPage />} />
                <Route path="/pmf" element={<PMFPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </>
  );
};

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PreferencesProvider>
          <ValuesRevealProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </ValuesRevealProvider>
        </PreferencesProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
