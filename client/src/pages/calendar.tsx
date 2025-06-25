import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import ReservationModal from "@/components/reservation-modal";
import { type ReservationWithDetails } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getPlannedUsageForTimeSlot, getDayOfWeek } from "@shared/scheduleData";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get reservations for the current month
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const { data: allReservations = [], isLoading } = useQuery<ReservationWithDetails[]>({
    queryKey: ["/api/reservations"],
  });

  // Filter reservations for the current month using string comparison to avoid timezone issues
  const reservations = allReservations.filter((r: ReservationWithDetails) => {
    const reservationDate = r.reservationDate; // Keep as string
    const monthStartStr = new Date(Date.UTC(year, month, 1)).toISOString().split('T')[0];
    const monthEndStr = new Date(Date.UTC(year, month + 1, 0)).toISOString().split('T')[0];
    return reservationDate >= monthStartStr && reservationDate <= monthEndStr;
  });

  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ["/api/rooms"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/reservations/${id}`);
    },
    onSuccess: () => {
      // Complete cache invalidation for immediate synchronization
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      
      // Force immediate refetch across all components
      queryClient.refetchQueries({ queryKey: ["/api/reservations"] });
      queryClient.refetchQueries({ queryKey: ["/api/statistics"] });
      
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

  const handleDelete = async (id: number, reservationInfo: string) => {
    if (window.confirm(`정말 "${reservationInfo}" 예약을 취소하시겠습니까?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Use UTC to avoid timezone conversion issues
      const dateStr = new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
      const dayReservations = reservations.filter((r: ReservationWithDetails) => {
        // Direct string comparison to avoid timezone conversion issues
        return r.date === dateStr;
      });
      days.push({
        day,
        date: dateStr,
        reservations: dayReservations,
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
    }

    return days;
  };

  const days = getDaysInMonth();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-96 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoomColor = (roomId: number) => {
    const colors = ['bg-primary', 'bg-accent', 'bg-secondary', 'bg-purple-500', 'bg-pink-500'];
    return colors[roomId % colors.length];
  };

  // Get planned schedule information for a specific date, grouped by room
  const getPlannedScheduleForDate = (dateStr: string) => {
    const dayOfWeek = getDayOfWeek(dateStr);
    const timeSlots = [
      '09:00-09:40', '09:50-10:30', '10:40-11:20', '11:30-12:10',
      '12:10-12:50', '12:20-13:00', '13:00-13:40', '13:50-14:30'
    ];
    
    const roomSchedules: Record<string, Array<{
      timeSlot: string;
      grades: string[];
    }>> = {};

    // 강당과 풋살장만 툴팁에 표시
    const filteredRooms = rooms.filter((room: any) => 
      room.name === '강당' || room.name === '풋살장'
    );

    filteredRooms.forEach((room: any) => {
      timeSlots.forEach(timeSlot => {
        const plannedGrades = getPlannedUsageForTimeSlot(room.name, dateStr, timeSlot);
        if (plannedGrades.length > 0) {
          if (!roomSchedules[room.name]) {
            roomSchedules[room.name] = [];
          }
          roomSchedules[room.name].push({
            timeSlot,
            grades: plannedGrades
          });
        }
      });
    });

    // Convert to array format for easier rendering
    return Object.entries(roomSchedules).map(([roomName, schedules]) => ({
      room: roomName,
      schedules
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">예약 달력</h1>
        <Button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          새 예약
        </Button>
      </div>

      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                오늘
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 max-md:p-4">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 max-md:gap-0.5">
            {/* Day headers */}
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 border-b max-md:p-2 max-md:text-xs">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((day, index) => {
              const plannedSchedule = day ? getPlannedScheduleForDate(day.date) : [];
              
              return (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={`min-h-[120px] p-2 border border-gray-100 ${
                          day ? 'cursor-pointer hover:bg-gray-50' : ''
                        } ${
                          day?.isToday ? 'bg-blue-50 border-primary' : 'bg-white'
                        }`}
                        onClick={() => day && handleDateClick(day.date)}
                      >
                        {day && (
                          <>
                            <div className={`text-sm font-medium mb-1 ${
                              day.isToday ? 'text-primary' : 'text-gray-800'
                            }`}>
                              {day.day}
                            </div>
                            <div className="space-y-1">
                              {day.reservations.slice(0, 3).map((reservation: any) => (
                                <div 
                                  key={reservation.id}
                                  className={`text-xs text-white px-1 py-0.5 rounded flex items-center justify-between group ${getRoomColor(reservation.roomId)}`}
                                  title={`${reservation.room.name} - ${reservation.class.name} (${reservation.purpose}) - ${reservation.periods?.join(', ') || '시간 미지정'}교시`}
                                >
                                  <span className="truncate flex-1">
                                    {reservation.room.name} {reservation.class.name} ({reservation.periods?.join(',') || '?'}교시)
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(reservation.id, `${reservation.room.name} - ${reservation.class.name}`);
                                    }}
                                    className="ml-1 h-4 w-4 p-0 text-white/80 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                              {day.reservations.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{day.reservations.length - 3}개 더
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </TooltipTrigger>
                    {day && plannedSchedule.length > 0 && (
                      <TooltipContent side="top" className="max-w-xl max-md:max-w-sm">
                        <div className="space-y-2">
                          <div className="font-medium text-sm text-center border-b pb-1">
                            {formatDate(day.date)} 계획된 이용
                          </div>
                          <div className="flex gap-4 text-xs max-md:flex-col max-md:gap-2">
                            {plannedSchedule.map((roomPlan, idx) => (
                              <div key={idx} className="bg-gray-50 p-2 rounded flex-1">
                                <div className="font-medium text-gray-700 mb-2 text-center bg-white rounded px-2 py-1">
                                  {roomPlan.room}
                                </div>
                                <div className="space-y-1">
                                  {roomPlan.schedules.map((schedule, scheduleIdx) => (
                                    <div key={scheduleIdx} className="bg-white p-1.5 rounded">
                                      <div className="text-gray-600 font-medium mb-1">
                                        {schedule.timeSlot}
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {schedule.grades.map((grade, gradeIdx) => (
                                          <span key={gradeIdx} className="text-xs px-1.5 py-0.5 bg-blue-100 rounded text-blue-800">
                                            {grade}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 text-center border-t pt-1">
                            예약 시 해당 학급과 조율 필요
                          </div>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="text-sm font-medium text-gray-700 mr-4">범례:</div>
            {rooms.map((room: any) => (
              <div key={room.id} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded ${getRoomColor(room.id)}`}></div>
                <span className="text-sm text-gray-600">{room.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ReservationModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDate("");
        }}
        defaultDate={selectedDate}
      />
    </div>
  );
}
