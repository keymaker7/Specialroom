import { Button } from "@/components/ui/button";
import { Menu, Plus, Calendar as CalendarIcon } from "lucide-react";
import { formatDate, getToday } from "@/lib/utils";
import { useState } from "react";
import ReservationModal from "./reservation-modal";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = getToday();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between max-md:px-4 max-md:py-3">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 mobile-touch touch-feedback"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="ml-4 lg:ml-0 text-2xl font-bold text-gray-800 max-md:text-xl mobile-text-large">
            대시보드
          </h2>
        </div>
        <div className="flex items-center space-x-4 max-md:space-x-2">
          <Button 
            className="btn-primary max-md:text-sm max-md:px-3 max-md:py-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2 max-md:w-3 max-md:h-3 max-md:mr-1" />
            <span className="max-md:hidden">새 예약</span>
            <span className="md:hidden">예약</span>
          </Button>
          <div className="flex items-center space-x-2 text-sm text-gray-600 max-md:text-xs max-md:space-x-1">
            <CalendarIcon className="w-4 h-4 max-md:w-3 max-md:h-3" />
            <span className="max-md:hidden">{formatDate(today)}</span>
            <span className="md:hidden">{formatDate(today).substring(5)}</span>
          </div>
        </div>
      </div>
      
      <ReservationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </header>
  );
}
