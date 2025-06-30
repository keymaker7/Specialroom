import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "./components/header";
import Sidebar from "./components/sidebar";
import WeeklyOverview from "./pages/weekly-overview";
import Calendar from "./pages/calendar";
import Reservations from "./pages/reservations";
import Dashboard from "./pages/dashboard-simple";
import Statistics from "./pages/statistics";
import Rooms from "./pages/rooms";
import RoomSchedulePlan from "./pages/room-schedule-plan";
import Settings from "./pages/settings";
import NotFound from "./pages/not-found";
import { useState } from "react";

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={WeeklyOverview} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/reservations" component={Reservations} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/statistics" component={Statistics} />
      <Route path="/rooms" component={Rooms} />
      <Route path="/room-schedule-plan" component={RoomSchedulePlan} />
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
        <div className="flex min-h-screen bg-gray-50 ios-safe-area-top ios-safe-area-bottom">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 p-6 max-md:p-4 mobile-spacing">
              <Router />
            </main>
          </div>
          
          {/* Google Sheets Version Credit */}
          <div className="fixed bottom-4 left-4 z-10">
            <div className="group relative">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-3 py-1.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-green-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span className="text-xs font-mono font-medium tracking-wider">
                    Google Sheets DB
                  </span>
                </div>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
            </div>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App; 