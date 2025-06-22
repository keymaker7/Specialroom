import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Calendar, 
  List, 
  DoorOpen, 
  BarChart3, 
  Settings,
  ClipboardList,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: '이번 주 예약 현황', href: '/', icon: Calendar },
  { name: '예약 달력', href: '/calendar', icon: Calendar },
  { name: '예약 목록', href: '/reservations', icon: List },
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
  { name: '특별실 관리', href: '/rooms', icon: DoorOpen },
  { name: '특별실 이용 계획', href: '/room-schedule-plan', icon: ClipboardList },
  { name: '통계 분석', href: '/statistics', icon: BarChart3 },
];

const systemNavigation = [
  { name: '설정', href: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "sidebar fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 lg:relative lg:z-auto",
        isOpen ? "show" : ""
      )}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">특별실 예약 관리</h1>
            <p className="text-sm text-gray-600 mt-1">효행초등학교</p>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="mt-6">
          <div className="px-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              메인 메뉴
            </h3>
          </div>
          <ul className="space-y-1 px-4">
            {navigation.map((item) => {
              const isActive = location === item.href || 
                (location === '/dashboard' && item.href === '/');
              
              return (
                <li key={item.name}>
                  <Link href={item.href} className={cn(
                    "nav-item flex items-center px-4 py-3 text-sm font-medium rounded-lg",
                    isActive && "active"
                  )}>
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div className="px-4 mb-4 mt-8">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              시스템
            </h3>
          </div>
          <ul className="space-y-1 px-4">
            {systemNavigation.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className={cn(
                  "nav-item flex items-center px-4 py-3 text-sm font-medium rounded-lg",
                  location === item.href && "active"
                )}>
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
