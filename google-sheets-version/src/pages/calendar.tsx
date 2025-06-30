import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import ReservationModal from "@/components/reservation-modal";
import { useToast } from "@/hooks/use-toast";
import * as SheetsAPI from "@/lib/google-sheets-api";
import { getPlannedUsageForTimeSlot, getDayOfWeek } from "../../shared/scheduleData";

// 데이터 변환용 인터페이스
interface ReservationWithDetails extends SheetsAPI.Reservation {
  room?: SheetsAPI.Room;
  class?: SheetsAPI.Class;
  reservationDate?: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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
  const allReservations: ReservationWithDetails[] = rawReservations.map(reservation => {
    const room = rooms.find(r => r.id === reservation.roomId);
    const classInfo = classes.find(c => c.id === reservation.classId);
    
    return {
      ...reservation,
      room,
      class: classInfo,
      reservationDate: reservation.date,
    };
  });

  // Filter reservations for the current month using string comparison to avoid timezone issues
  const reservations = allReservations.filter((r: ReservationWithDetails) => {
    const reservationDate = r.reservationDate || r.date; // Keep as string
    const monthStartStr = new Date(Date.UTC(year, month, 1)).toISOString().split('T')[0];
    const monthEndStr = new Date(Date.UTC(year, month + 1, 0)).toISOString().split('T')[0];
    return reservationDate >= monthStartStr && reservationDate <= monthEndStr;
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await SheetsAPI.deleteReservation(id);
    },
    onSuccess: () => {
      // Complete cache invalidation for immediate synchronization
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservation-stats"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      
      // Force immediate refetch across all components
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
        return (r.reservationDate || r.date) === dateStr;
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

  if (reservationsLoading) {
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

  const getRoomColor = (roomId: string) => {
    const colors = ['bg-primary', 'bg-accent', 'bg-secondary', 'bg-purple-500', 'bg-pink-500'];
    const index = rooms.findIndex(r => r.id === roomId);
    return colors[index % colors.length] || 'bg-gray-500';
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
    const filteredRooms = rooms.filter((room) => 
      room.name === '강당' || room.name === '풋살장'
    );

    filteredRooms.forEach((room) => {
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
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateMonth('prev')}
              className="hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            <CardTitle className="text-xl font-semibold text-gray-800">
              {currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
            </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateMonth('next')}
              className="hover:bg-gray-100"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => (
              <div key={index} className="min-h-[120px]">
                {day ? (
                  <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                          className={`h-full p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                            day.isToday ? 'bg-blue-50 border-blue-300' : ''
                        }`}
                          onClick={() => handleDateClick(day.date)}
                      >
                          <div className={`text-sm font-medium mb-2 ${
                            day.isToday ? 'text-blue-600' : 'text-gray-700'
                            }`}>
                              {day.day}
                            </div>
                          
                            <div className="space-y-1">
                            {day.reservations.map((reservation) => (
                                <div 
                                  key={reservation.id}
                                className={`text-xs p-1 rounded text-white truncate relative group ${
                                  getRoomColor(reservation.roomId)
                                }`}
                                >
                                <div className="flex items-center justify-between">
                                  <span className="truncate">
                                    {reservation.room?.name || '알 수 없는 특별실'}: {reservation.class?.name || '알 수 없는 학급'}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(
                                        reservation.id, 
                                        `${reservation.room?.name || '알 수 없는 특별실'} - ${reservation.class?.name || '알 수 없는 학급'}`
                                      );
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:bg-black/20 rounded p-0.5"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="text-xs opacity-90 truncate">
                                  {reservation.timeSlot || '시간 미정'}
                                </div>
                              </div>
                            ))}
                            </div>
                      </div>
                    </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <div className="space-y-2">
                          <div className="font-semibold">{formatDate(day.date)}</div>
                          
                          {day.reservations.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-blue-600 mb-1">예약 현황</div>
                              {day.reservations.map((reservation) => (
                                <div key={reservation.id} className="text-xs mb-1">
                                  <div className="font-medium">
                                    {reservation.room?.name || '알 수 없는 특별실'} - {reservation.class?.name || '알 수 없는 학급'}
                                  </div>
                                  <div className="text-gray-600">
                                    {reservation.timeSlot || '시간 미정'} | {reservation.teacherName || '담당교사 미기재'}
                                  </div>
                                  <div className="text-gray-600">
                                    목적: {reservation.purpose || '미기재'}
                          </div>
                                </div>
                                        ))}
                                      </div>
                          )}
                          
                          {getPlannedScheduleForDate(day.date).length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-orange-600 mb-1">계획된 수업</div>
                              {getPlannedScheduleForDate(day.date).map((roomSchedule, idx) => (
                                <div key={idx} className="text-xs mb-1">
                                  <div className="font-medium">{roomSchedule.room}</div>
                                  {roomSchedule.schedules.map((schedule, scheduleIdx) => (
                                    <div key={scheduleIdx} className="text-gray-600 ml-2">
                                      {schedule.timeSlot}: {schedule.grades.join(', ')}
                                    </div>
                                  ))}
                              </div>
                            ))}
                          </div>
                          )}
                          
                          {day.reservations.length === 0 && getPlannedScheduleForDate(day.date).length === 0 && (
                            <div className="text-sm text-gray-500">예약 및 계획된 수업이 없습니다.</div>
                          )}
                        </div>
                      </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                ) : (
                  <div className="h-full"></div>
                )}
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
        rooms={rooms}
        classes={classes}
      />
    </div>
  );
}
