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
          <div className="flex-1 flex flex-col">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 p-6">
              <Router />
            </main>
          </div>
          
          {/* Developer Credit */}
          <div className="fixed bottom-4 left-4 z-10">
            <div className="group relative">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-3 py-1.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-mono font-medium tracking-wider">
                    개발자-jkey
                  </span>
                </div>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
            </div>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
