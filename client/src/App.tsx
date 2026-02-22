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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/projecten" component={ProjectenPage} />
      <Route path="/projecten/wonen" component={WonenPage} />
      <Route path="/projecten/werken" component={WerkenPage} />
      <Route path="/projecten/interieur" component={InterieurPage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
