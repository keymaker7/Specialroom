import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle, Users } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">이번주 예약 현황</h1>
        <Badge variant="outline" className="ml-2">
          {formatDate(weekRange.start)} ~ {formatDate(weekRange.end)}
        </Badge>
      </div>

      <div className="grid gap-4">
        {weekDays.map(date => {
          const dayReservations = reservationsByDate[date] || [];
          const conflicts = findTimeConflicts(dayReservations);
          const hasConflicts = conflicts.some(c => c.timeOverlap);

          return (
            <Card key={date} className={`${hasConflicts ? 'border-red-500 bg-red-50' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {formatDate(date)} ({getDayName(date)})
                    </span>
                    {hasConflicts && (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <Badge variant={dayReservations.length > 0 ? "default" : "secondary"}>
                    {dayReservations.length}건
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dayReservations.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">예약이 없습니다</p>
                ) : (
                  <div className="space-y-3">
                    {conflicts.length > 0 ? (
                      // Show conflicts grouped by period
                      conflicts.map(conflict => (
                        <div 
                          key={conflict.period}
                          className={`p-3 rounded-lg border ${
                            conflict.timeOverlap ? 'bg-red-100 border-red-300' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              {formatPeriodLabel(conflict.period, conflict.reservations[0].class.grade)}
                            </span>
                            {conflict.timeOverlap && (
                              <Badge variant="destructive" className="text-xs">
                                시간 중복
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2">
                            {conflict.reservations.map(reservation => {
                              const gradeSchedule = getGradeSchedule(reservation.class.grade);
                              const periodTime = gradeSchedule.periods[conflict.period];
                              
                              return (
                                <div key={reservation.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium">{reservation.class.name}</span>
                                    <span className="text-sm text-gray-600">
                                      → {reservation.room.name}
                                    </span>
                                    <span className="text-xs text-purple-600 font-medium">
                                      ({reservation.class.grade}학년)
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {periodTime ? `${periodTime.start} - ${periodTime.end}` : '시간 미정'}
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
                        <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{reservation.class.name}</span>
                            <span className="text-sm text-gray-600">
                              → {reservation.room.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {(reservation.periods || []).map(p => formatPeriodLabel(p, reservation.class.grade)).join(', ')}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            이번주 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reservations.length}</div>
              <div className="text-sm text-gray-600">총 예약</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(reservationsByDate).length}
              </div>
              <div className="text-sm text-gray-600">예약 있는 날</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(reservations.map(r => r.roomId)).size}
              </div>
              <div className="text-sm text-gray-600">사용 특별실</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(reservationsByDate).reduce((sum, dayReservations) => 
                  sum + findTimeConflicts(dayReservations).filter(c => c.timeOverlap).length, 0
                )}
              </div>
              <div className="text-sm text-gray-600">시간 중복</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}