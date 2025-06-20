import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle, Users, Heart, Star } from "lucide-react";
import { type ReservationWithDetails } from "@shared/schema";
import { getWeekRange, formatDate } from "@/lib/utils";
import { getGradeSchedule, formatPeriodLabel } from "@shared/timeConfig";

export default function WeeklyOverview() {
  const weekRange = getWeekRange();
  
  const { data: reservations = [], isLoading } = useQuery<ReservationWithDetails[]>({
    queryKey: [`/api/reservations?startDate=${weekRange.start}&endDate=${weekRange.end}`],
  });

  // Group reservations by date
  const reservationsByDate = reservations.reduce((acc, reservation) => {
    const date = reservation.reservationDate;
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

    // Group by period
    const periodGroups = reservations.reduce((acc, res) => {
      (res.periods || []).forEach(period => {
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
            const grade1 = res1.class.grade;
            const grade2 = res2.class.grade;
            
            if (grade1 !== grade2) {
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

  if (isLoading) {
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
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((date, index) => {
          const dayReservations = reservationsByDate[date] || [];
          const conflicts = findTimeConflicts(dayReservations);
          const hasConflicts = conflicts.some(c => c.timeOverlap);
          const dayName = getDayName(date);
          const isToday = date === new Date().toISOString().split('T')[0];

          return (
            <Card 
              key={date} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
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
              <CardHeader className="pb-2 text-center">
                <div className="space-y-1">
                  <div className={`text-xs font-medium uppercase tracking-wider ${
                    index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'
                  }`}>
                    {dayName}
                  </div>
                  <div className={`text-lg font-bold ${
                    isToday ? 'text-blue-600' : 'text-gray-800'
                  }`}>
                    {new Date(date).getDate()}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    {hasConflicts && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <Badge 
                      variant={dayReservations.length > 0 ? "default" : "secondary"}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        hasConflicts 
                          ? 'bg-red-500 text-white' 
                          : dayReservations.length > 0 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {dayReservations.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {/* Day Content */}
              <CardContent className="p-3 h-80 overflow-y-auto">
                {dayReservations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Heart className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs text-center">예약 없음</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conflicts.length > 0 ? (
                      // Show conflicts grouped by period
                      conflicts.map(conflict => (
                        <div 
                          key={conflict.period}
                          className={`p-2 rounded-lg border-l-4 ${
                            conflict.timeOverlap 
                              ? 'bg-red-100 border-red-400' 
                              : 'bg-blue-100 border-blue-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-700">
                              {conflict.period}교시
                            </span>
                            {conflict.timeOverlap && (
                              <Badge variant="destructive" className="text-xs px-1 py-0">
                                중복
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            {conflict.reservations.map(reservation => {
                              const gradeSchedule = getGradeSchedule(reservation.class.grade);
                              const periodTime = gradeSchedule.periods[conflict.period];
                              
                              return (
                                <div key={reservation.id} className="bg-white p-2 rounded border text-xs">
                                  <div className="font-medium text-gray-800">
                                    {reservation.class.name}
                                  </div>
                                  <div className="text-gray-600">
                                    {reservation.room.name}
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-purple-600 font-medium">
                                      {reservation.class.grade}학년
                                    </span>
                                    <span className="text-gray-500">
                                      {periodTime ? `${periodTime.start}-${periodTime.end}` : '미정'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Show regular reservations
                      dayReservations.map(reservation => (
                        <div key={reservation.id} className="bg-white p-2 rounded-lg border-l-4 border-green-400 shadow-sm">
                          <div className="text-xs space-y-1">
                            <div className="font-medium text-gray-800">
                              {reservation.class.name}
                            </div>
                            <div className="text-gray-600">
                              {reservation.room.name}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-blue-600 font-medium">
                                {(reservation.periods || []).join(', ')}교시
                              </span>
                              <span className="text-purple-600 text-xs">
                                {reservation.class.grade}학년
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>

              {/* Decorative Elements */}
              {isToday && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              )}
              {hasConflicts && (
                <div className="absolute top-2 left-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-none shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Star className="w-6 h-6 text-yellow-500" />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              이번주 요약
            </span>
            <Star className="w-6 h-6 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">{reservations.length}</div>
              <div className="text-sm text-gray-600 font-medium">총 예약</div>
            </div>
            <div className="text-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {Object.keys(reservationsByDate).length}
              </div>
              <div className="text-sm text-gray-600 font-medium">예약 있는 날</div>
            </div>
            <div className="text-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {new Set(reservations.map(r => r.roomId)).size}
              </div>
              <div className="text-sm text-gray-600 font-medium">사용 특별실</div>
            </div>
            <div className="text-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-red-600 mb-1">
                {Object.values(reservationsByDate).reduce((sum, dayReservations) => 
                  sum + findTimeConflicts(dayReservations).filter(c => c.timeOverlap).length, 0
                )}
              </div>
              <div className="text-sm text-gray-600 font-medium">시간 중복</div>
            </div>
          </div>
          
          {/* Fun message */}
          <div className="text-center mt-6">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="text-sm text-gray-600">효행초등학교 특별실을 함께 사용해요!</span>
              <Heart className="w-4 h-4 text-pink-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}