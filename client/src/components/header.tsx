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
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="ml-4 lg:ml-0 text-2xl font-bold text-gray-800">
            대시보드
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            className="btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            새 예약
          </Button>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4" />
            <span>{formatDate(today)}</span>
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
