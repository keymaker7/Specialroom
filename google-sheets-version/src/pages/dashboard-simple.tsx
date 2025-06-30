import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock,
  MapPin,
  Users, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Building,
  GraduationCap,
  CalendarDays,
} from "lucide-react";
import * as SheetsAPI from "@/lib/google-sheets-api";
import { formatDate, getToday } from "@/lib/utils";
import ReservationModal from "@/components/reservation-modal";
import QuickReservationForm from "@/components/quick-reservation-form";

export default function DashboardSimple() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickFormOpen, setIsQuickFormOpen] = useState(false);

  // Google Sheets API를 사용한 데이터 조회
  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: SheetsAPI.getReservations,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: SheetsAPI.getRooms,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: SheetsAPI.getClasses,
  });

  // 통계 계산
  const stats = useMemo(() => {
    const today = getToday();
    const thisWeek = getThisWeekDates();
    const thisMonth = getThisMonthDates();

    // 오늘 예약
    const todayReservations = reservations.filter(r => r.date === today);
    
    // 이번 주 예약
    const weekReservations = reservations.filter(r => 
      thisWeek.start <= r.date && r.date <= thisWeek.end
    );
    
    // 이번 달 예약
    const monthReservations = reservations.filter(r => 
      thisMonth.start <= r.date && r.date <= thisMonth.end
    );

    // 가장 많이 사용된 특별실
    const roomUsage = reservations.reduce((acc, reservation) => {
      acc[reservation.roomId] = (acc[reservation.roomId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedRoomId = Object.entries(roomUsage).sort(([,a], [,b]) => b - a)[0]?.[0];
    const mostUsedRoom = rooms.find(r => r.id === mostUsedRoomId);

    return {
      today: todayReservations.length,
      thisWeek: weekReservations.length,
      thisMonth: monthReservations.length,
      totalRooms: rooms.length,
      totalClasses: classes.length,
      mostUsedRoom: mostUsedRoom?.name || '없음',
      utilization: rooms.length > 0 ? Math.round((monthReservations.length / (rooms.length * 30)) * 100) : 0,
    };
  }, [reservations, rooms, classes]);

  // 최근 예약 (최근 7일)
  const recentReservations = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
    return reservations
      .filter(r => r.date >= sevenDaysAgoStr)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(reservation => {
        const room = rooms.find(r => r.id === reservation.roomId);
        const classInfo = classes.find(c => c.id === reservation.classId);
        return {
          ...reservation,
          room,
          class: classInfo,
        };
      });
  }, [reservations, rooms, classes]);

  // 오늘의 예약 현황
  const todaySchedule = useMemo(() => {
    const today = getToday();
    return reservations
      .filter(r => r.date === today)
      .sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || ''))
      .map(reservation => {
        const room = rooms.find(r => r.id === reservation.roomId);
        const classInfo = classes.find(c => c.id === reservation.classId);
        return {
          ...reservation,
          room,
          class: classInfo,
        };
      });
  }, [reservations, rooms, classes]);

  if (reservationsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">대시보드</h1>
          <p className="text-gray-600 mt-1">
            {formatDate(getToday())} • 특별실 예약 현황
          </p>
        </div>
        <div className="flex gap-2">
        <Button 
            onClick={() => setIsQuickFormOpen(true)}
            variant="outline"
            size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          빠른 예약
        </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 예약
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">오늘 예약</p>
                <p className="text-2xl font-bold text-blue-700">{stats.today}</p>
                <p className="text-blue-600 text-xs">건</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">이번 주</p>
                <p className="text-2xl font-bold text-green-700">{stats.thisWeek}</p>
                <p className="text-green-600 text-xs">건</p>
              </div>
              <CalendarDays className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">이번 달</p>
                <p className="text-2xl font-bold text-purple-700">{stats.thisMonth}</p>
                <p className="text-purple-600 text-xs">건</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">이용률</p>
                <p className="text-2xl font-bold text-orange-700">{stats.utilization}%</p>
                <p className="text-orange-600 text-xs">월평균</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 오늘의 예약 현황 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              오늘의 예약 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>오늘 예약된 특별실이 없습니다.</p>
              </div>
            ) : (
            <div className="space-y-3">
                {todaySchedule.map((reservation) => (
                <div 
                  key={reservation.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-blue-500 rounded"></div>
                    <div>
                        <div className="font-medium text-gray-800">
                          {reservation.room?.name || '알 수 없는 특별실'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {reservation.class?.name || '알 수 없는 학급'} • {reservation.teacherName || '담당교사 미기재'}
                        </div>
                    </div>
                  </div>
                  <div className="text-right">
                      <div className="text-sm font-medium text-gray-800">
                        {reservation.timeSlot || '시간 미정'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {reservation.purpose || '목적 미기재'}
                      </div>
                  </div>
                </div>
              ))}
                </div>
              )}
          </CardContent>
        </Card>

        {/* 최근 예약 현황 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              최근 예약 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentReservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>최근 예약 기록이 없습니다.</p>
              </div>
            ) : (
            <div className="space-y-3">
                {recentReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {formatDate(reservation.date)}
                      </Badge>
                      <div>
                        <div className="font-medium text-gray-800">
                          {reservation.room?.name || '알 수 없는 특별실'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {reservation.class?.name || '알 수 없는 학급'}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {reservation.timeSlot || '시간 미정'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
            </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Building className="w-8 h-8 mx-auto mb-3 text-blue-600" />
            <div className="text-2xl font-bold text-gray-800">{stats.totalRooms}</div>
            <div className="text-sm text-gray-600">특별실</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <GraduationCap className="w-8 h-8 mx-auto mb-3 text-green-600" />
            <div className="text-2xl font-bold text-gray-800">{stats.totalClasses}</div>
            <div className="text-sm text-gray-600">학급</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-purple-600" />
            <div className="text-2xl font-bold text-gray-800">{stats.mostUsedRoom}</div>
            <div className="text-sm text-gray-600">인기 특별실</div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rooms={rooms}
        classes={classes}
      />

      <QuickReservationForm
        isOpen={isQuickFormOpen}
        onClose={() => setIsQuickFormOpen(false)}
        rooms={rooms}
        classes={classes}
      />
    </div>
  );
}

// Helper functions
function getThisWeekDates() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

function getThisMonthDates() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return {
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0],
  };
}