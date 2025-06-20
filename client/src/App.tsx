import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import WeeklyOverview from "@/pages/weekly-overview";
import Calendar from "@/pages/calendar";
import Reservations from "@/pages/reservations";
import Dashboard from "@/pages/dashboard-simple";
import Rooms from "@/pages/rooms";
import Statistics from "@/pages/statistics";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={WeeklyOverview} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/reservations" component={Reservations} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/rooms" component={Rooms} />
      <Route path="/statistics" component={Statistics} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 lg:ml-64">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="p-6">
              <Router />
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
