import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import QuickReservationForm from "@/components/quick-reservation-form";
import { 
  Calendar, 
  Users, 
  DoorOpen, 
  TrendingUp,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { getToday, getWeekRange, formatTime, getRoomStatusColor } from "@/lib/utils";
import { Link } from "wouter";

export default function Dashboard() {
  const today = getToday();
  const weekRange = getWeekRange();

  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/statistics"],
  });

  const { data: todayReservations = [], isLoading: todayLoading } = useQuery({
    queryKey: ["/api/reservations", { date: today }],
    queryFn: () => fetch(`/api/reservations?date=${today}`).then(res => res.json()),
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const { data: weekReservations = [] } = useQuery({
    queryKey: ["/api/reservations", { startDate: weekRange.start, endDate: weekRange.end }],
    queryFn: () => fetch(`/api/reservations?startDate=${weekRange.start}&endDate=${weekRange.end}`).then(res => res.json()),
  });

  // Group today's reservations by time periods
  const groupReservationsByPeriod = () => {
    const periods = ["1", "2", "3", "4", "5", "6"];
    return periods.map(period => {
      const reservations = todayReservations.filter((r: any) => 
        r.periods && r.periods.includes(period)
      );
      return {
        period,
        reservations,
        count: reservations.length
      };
    });
  };

  const todayPeriods = groupReservationsByPeriod();

  if (statsLoading || todayLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statsData = statistics || {
    todayReservations: todayReservations.length,
    weekReservations: weekReservations.length,
    activeRooms: rooms.length,
    utilizationRate: rooms.length > 0 ? Math.round((todayReservations.length / rooms.length) * 100) : 0,
  };

  // Get week days for calendar
  const getWeekDays = () => {
    const start = new Date(weekRange.start);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push({
        date: date.getDate(),
        fullDate: date.toISOString().split('T')[0],
        reservations: weekReservations.filter((r: any) => r.date === date.toISOString().split('T')[0])
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">오늘 예약</p>
                <p className="text-3xl font-bold text-primary">{statsData.todayReservations}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-primary text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">활성</span>
              <span className="text-gray-600 ml-2">예약 건수</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">이번 주 예약</p>
                <p className="text-3xl font-bold text-accent">{statsData.weekReservations}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="text-accent text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">총</span>
              <span className="text-gray-600 ml-2">예약 건수</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활성 특별실</p>
                <p className="text-3xl font-bold text-secondary">{statsData.activeRooms}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DoorOpen className="text-secondary text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">전체 {statsData.activeRooms}개 중</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">이용률</p>
                <p className="text-3xl font-bold text-purple-600">{statsData.utilizationRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">이번 주</span>
              <span className="text-gray-600 ml-2">평균 이용률</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  오늘의 예약 현황
                </CardTitle>
                <Link href="/reservations">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
                    전체 보기 <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {todayReservations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  오늘 예약된 특별실이 없습니다.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Period-based schedule overview */}
                  <div className="grid grid-cols-6 gap-2 mb-4">
                    {todayPeriods.map(({ period, count }) => (
                      <div key={period} className="text-center">
                        <div className={`p-2 rounded-lg text-sm font-medium ${
                          count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {period}교시
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {count}건
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Detailed reservations list */}
                  <div className="space-y-3">
                    {todayReservations.slice(0, 5).map((reservation: any) => (
                      <div key={reservation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-center space-x-4">
                          <div className="w-2 h-12 bg-primary rounded-full"></div>
                          <div>
                            <p className="font-medium text-gray-800">{reservation.room.name}</p>
                            <p className="text-sm text-gray-600">{reservation.class.name}</p>
                            <p className="text-xs text-gray-500">{reservation.purpose}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-800">
                            {reservation.periods?.join(', ')}교시
                          </p>
                          <p className="text-xs text-gray-500">{reservation.notes || ""}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Room Status */}
        <div>
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-800">
                특별실 현황
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {rooms.map((room: any) => {
                  const status = getRoomStatusColor(room.id, todayReservations);
                  return (
                    <div key={room.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'occupied' ? 'bg-red-500' : 'bg-green-500'
                        }`}></div>
                        <span className="font-medium text-gray-800">{room.name}</span>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-2 py-1 rounded-full ${
                          status === 'occupied' ? 'status-occupied' : 'status-available'
                        }`}
                      >
                        {status === 'occupied' ? '사용 중' : '이용 가능'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calendar Overview */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              이번 주 예약 캘린더
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-gray-800">
                {weekRange.start} - {weekRange.end}
              </span>
              <Button variant="ghost" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {/* Headers */}
            {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className={`bg-gray-50 rounded-lg p-3 min-h-[120px] ${
                  day.fullDate === today ? 'bg-blue-50 border-2 border-primary' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  day.fullDate === today ? 'text-primary' : 'text-gray-800'
                }`}>
                  {day.date}
                </div>
                <div className="space-y-1">
                  {day.reservations.slice(0, 3).map((reservation: any) => (
                    <div 
                      key={reservation.id}
                      className="text-xs bg-primary text-white px-2 py-1 rounded truncate"
                    >
                      {reservation.room.name} {reservation.class.name}
                    </div>
                  ))}
                  {day.reservations.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{day.reservations.length - 3}개 더
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reservation Form */}
      <QuickReservationForm />
    </div>
  );
}
