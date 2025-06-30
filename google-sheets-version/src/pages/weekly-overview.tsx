import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertTriangle, Users, Heart, Star, Trash2 } from "lucide-react";
import { getWeekRange, formatDate } from "@/lib/utils";
import { getGradeSchedule, formatPeriodLabel } from "../../shared/timeConfig";
import { useToast } from "@/hooks/use-toast";
import * as SheetsAPI from "@/lib/google-sheets-api";

// Google Sheets API 타입을 기존 타입과 호환되도록 확장
interface ReservationWithDetails extends SheetsAPI.Reservation {
  room?: SheetsAPI.Room;
  class?: SheetsAPI.Class;
  reservationDate?: string;
  periods?: string[];
}

export default function WeeklyOverview() {
  const weekRange = getWeekRange();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Google Sheets API를 사용한 데이터 조회
  const { data: rawReservations = [], isLoading: reservationsLoading } = useQuery({
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

  // 데이터 변환: Google Sheets 데이터를 기존 형식에 맞게 변환
  const reservations: ReservationWithDetails[] = rawReservations.map(reservation => {
    const room = rooms.find(r => r.id === reservation.roomId);
    const classInfo = classes.find(c => c.id === reservation.classId);
    
    return {
      ...reservation,
      room,
      class: classInfo,
      reservationDate: reservation.date,
      periods: reservation.timeSlot ? [reservation.timeSlot] : [],
    };
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await SheetsAPI.deleteReservation(id);
    },
    onSuccess: () => {
      // Invalidate and force refetch for complete synchronization
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservation-stats"] });
      queryClient.refetchQueries({ queryKey: ["reservations"] });
      queryClient.refetchQueries({ queryKey: ["reservation-stats"] });
      toast({
        title: "성공",
        description: "예약이 취소되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "예약 취소에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = async (id: string, reservationInfo: string) => {
    if (window.confirm(`정말 "${reservationInfo}" 예약을 취소하시겠습니까?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Filter reservations for this week
  const weekReservations = reservations.filter(r => {
    const reservationDate = new Date(r.reservationDate || r.date);
    const startDate = new Date(weekRange.start);
    const endDate = new Date(weekRange.end);
    return reservationDate >= startDate && reservationDate <= endDate;
  });

  // Group reservations by date
  const reservationsByDate = weekReservations.reduce((acc, reservation) => {
    const date = reservation.reservationDate || reservation.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(reservation);
    return acc;
  }, {} as Record<string, ReservationWithDetails[]>);

  // Find time conflicts
  const findTimeConflicts = (reservations: ReservationWithDetails[]) => {
    const conflicts: Array<{
      period: string;
      reservations: ReservationWithDetails[];
      timeOverlap: boolean;
    }> = [];

    // Group by period/timeSlot
    const periodGroups = reservations.reduce((acc, res) => {
      const periods = res.periods || (res.timeSlot ? [res.timeSlot] : []);
      periods.forEach(period => {
        if (!acc[period]) acc[period] = [];
        acc[period].push(res);
      });
      return acc;
    }, {} as Record<string, ReservationWithDetails[]>);

    // Check for time conflicts within each period
    Object.entries(periodGroups).forEach(([period, periodReservations]) => {
      if (periodReservations.length > 1) {
        // Check if different grades have overlapping times for the same period
        const timeConflict = periodReservations.some((res1, i) => {
          return periodReservations.slice(i + 1).some(res2 => {
            const grade1 = res1.class?.grade || 0;
            const grade2 = res2.class?.grade || 0;
            
            if (grade1 !== grade2 && grade1 > 0 && grade2 > 0) {
              const schedule1 = getGradeSchedule(grade1);
              const schedule2 = getGradeSchedule(grade2);
              
              const time1 = schedule1.periods[period];
              const time2 = schedule2.periods[period];
              
              if (time1 && time2) {
                // Check if times overlap
                const start1 = new Date(`2000-01-01T${time1.start}`);
                const end1 = new Date(`2000-01-01T${time1.end}`);
                const start2 = new Date(`2000-01-01T${time2.start}`);
                const end2 = new Date(`2000-01-01T${time2.end}`);
                
                return (start1 < end2 && start2 < end1);
              }
            }
            return false;
          });
        });
        
        conflicts.push({
          period,
          reservations: periodReservations,
          timeOverlap: timeConflict
        });
      }
    });

    return conflicts;
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
  };

  if (reservationsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">이번주 예약 현황</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Generate week days
  const weekDays = [];
  const startDate = new Date(weekRange.start);
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    weekDays.push(date.toISOString().split('T')[0]);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              이번주 예약 현황
            </h1>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1 rounded-full">
          {formatDate(weekRange.start)} ~ {formatDate(weekRange.end)}
        </Badge>
      </div>

      {/* Horizontal Week View */}
      <div className="grid grid-cols-7 gap-4 max-md:grid-cols-1 max-md:gap-2">
        {weekDays.map((date, index) => {
          const dayReservations = reservationsByDate[date] || [];
          const conflicts = findTimeConflicts(dayReservations);
          const hasConflicts = conflicts.some(c => c.timeOverlap);
          const dayName = getDayName(date);
          const isToday = date === new Date().toISOString().split('T')[0];

          return (
            <Card 
              key={date} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg max-md:flex max-md:flex-row max-md:items-center ${
                hasConflicts 
                  ? 'border-red-400 bg-gradient-to-br from-red-50 to-pink-50 shadow-red-100' 
                  : isToday
                    ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-blue-100'
                    : dayReservations.length > 0
                      ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-green-100'
                      : 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50'
              }`}
            >
              {/* Day Header */}
              <CardHeader className="pb-2 text-center max-md:pb-2 max-md:w-20 max-md:flex-shrink-0">
                <div className="space-y-1 max-md:space-y-0.5">
                  <CardTitle className={`text-lg font-bold ${
                    isToday ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {dayName}
                  </CardTitle>
                  <p className={`text-sm ${
                    isToday ? 'text-blue-500 font-medium' : 'text-gray-500'
                  }`}>
                    {new Date(date).getDate()}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    {dayReservations.length > 0 && (
                      <Badge variant={hasConflicts ? "destructive" : "secondary"} className="text-xs px-2 py-0.5">
                        {dayReservations.length}건
                      </Badge>
                    )}
                    {hasConflicts && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Reservations List */}
              <CardContent className="pt-0 max-md:flex-1 max-md:pt-2">
                <div className="space-y-2 max-md:space-y-1">
                {dayReservations.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4 max-md:py-2">
                      예약 없음
                    </p>
                  ) : (
                    dayReservations.map((reservation) => (
                        <div 
                        key={reservation.id}
                        className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 max-md:p-2"
                        >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs px-2 py-0.5 truncate">
                                {reservation.room?.name || '알 수 없는 특별실'}
                              </Badge>
                              {reservation.periods && reservation.periods.length > 0 && (
                                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                  {formatPeriodLabel(reservation.periods[0])}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {reservation.class?.name || '알 수 없는 학급'}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {reservation.teacherName || '담당자 미기재'}
                            </p>
                            {reservation.purpose && (
                              <p className="text-xs text-gray-500 truncate mt-1">
                                {reservation.purpose}
                              </p>
                            )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                            onClick={() => handleDelete(
                              reservation.id,
                              `${reservation.room?.name} - ${reservation.class?.name}`
                            )}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                            >
                            <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conflicts Summary */}
      {weekReservations.some(dayReservations => 
        findTimeConflicts(weekReservations).some(c => c.timeOverlap)
      ) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <CardTitle className="text-red-700">시간 충돌 경고</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">
              이번 주에 시간이 겹치는 예약이 있습니다. 각 날짜별 예약을 확인해주세요.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Week Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            <CardTitle>이번 주 요약</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{weekReservations.length}</div>
              <div className="text-sm text-gray-600">총 예약</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(weekReservations.map(r => r.roomId)).size}
              </div>
              <div className="text-sm text-gray-600">사용된 특별실</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(weekReservations.map(r => r.classId)).size}
              </div>
              <div className="text-sm text-gray-600">예약한 학급</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {findTimeConflicts(weekReservations).filter(c => c.timeOverlap).length}
          </div>
              <div className="text-sm text-gray-600">시간 충돌</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}