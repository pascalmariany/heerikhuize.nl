import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/Home";
import ProjectenPage from "@/pages/Projecten";
import WonenPage from "@/pages/Wonen";
import WerkenPage from "@/pages/Werken";
import InterieurPage from "@/pages/Interieur";
import AdminLogin from "@/pages/AdminLogin";
import AdminPage from "@/pages/Admin";
import AdminNewsPage from "@/pages/AdminNews";
import ProjectDetailPage from "@/pages/ProjectDetail";
import NieuwsPage from "@/pages/Nieuws";
import NieuwsDetailPage from "@/pages/NieuwsDetail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/projecten" component={ProjectenPage} />
      <Route path="/projecten/wonen" component={WonenPage} />
      <Route path="/projecten/werken" component={WerkenPage} />
      <Route path="/projecten/interieur" component={InterieurPage} />
      <Route path="/project/:id" component={ProjectDetailPage} />
      <Route path="/nieuws" component={NieuwsPage} />
      <Route path="/nieuws/:id" component={NieuwsDetailPage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/nieuws" component={AdminNewsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]" data-testid="cookie-banner">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-[#555] flex-1 leading-relaxed">
          Deze website maakt gebruik van cookies om uw ervaring te verbeteren. Door verder te gaan op deze website, gaat u akkoord met ons gebruik van cookies. Lees ons{" "}
          <span className="text-[#96AB50] underline cursor-pointer">privacybeleid</span>{" "}
          voor meer informatie.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={accept}
            className="bg-[#96AB50] text-white px-5 py-2 text-sm font-semibold hover:bg-[#829745] transition-colors"
            data-testid="button-cookie-accept"
          >
            Accepteren
          </button>
          <button
            onClick={decline}
            className="border border-gray-300 text-[#555] px-5 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors"
            data-testid="button-cookie-decline"
          >
            Weigeren
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <CookieBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
