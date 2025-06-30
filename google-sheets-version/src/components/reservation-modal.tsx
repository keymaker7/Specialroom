import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getGradeSchedule, formatPeriodLabel, getAvailablePeriods } from "@shared/timeConfig";
import { getPlannedUsageForTimeSlot, getTimeSlotFromPeriod, doTimeSlotsOverlap } from "@shared/scheduleData";
import { getRoomGuideline, getConflictWarnings, getRoomUsageNotes } from "@shared/roomGuidelines";
import * as SheetsAPI from "@/lib/google-sheets-api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info } from "lucide-react";
import { getPeriodLabel, getToday } from "@/lib/utils";
import { z } from "zod";

// Google Sheets API용 예약 스키마
const reservationSchema = z.object({
  roomId: z.string().min(1, "특별실을 선택해주세요"),
  classId: z.string().min(1, "학급을 선택해주세요"),
  date: z.string().min(1, "날짜를 선택해주세요"),
  timeSlot: z.string().min(1, "시간을 선택해주세요"),
  teacherName: z.string().min(1, "담당교사명을 입력해주세요"),
  purpose: z.string().min(1, "목적을 입력해주세요"),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation?: SheetsAPI.Reservation | null;
  rooms?: SheetsAPI.Room[];
  classes?: SheetsAPI.Class[];
  defaultDate?: string;
}

const timeSlots = [
  "09:00-09:40",
  "09:50-10:30", 
  "10:40-11:20",
  "11:30-12:10",
  "12:10-12:50",
  "12:20-13:00",
  "13:00-13:40",
  "13:50-14:30"
];

export default function ReservationModal({ 
  isOpen, 
  onClose, 
  reservation,
  rooms = [],
  classes = [],
  defaultDate 
}: ReservationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      roomId: reservation?.roomId || "",
      classId: reservation?.classId || "",
      teacherName: reservation?.teacherName || "",
      purpose: reservation?.purpose || "",
      date: reservation?.date || defaultDate || getToday(),
      timeSlot: reservation?.timeSlot || "",
    },
  });

  // Get selected class grade for time scheduling
  const selectedClassId = form.watch("classId");
  const selectedRoomId = form.watch("roomId");
  const selectedDate = form.watch("date");
  const selectedTimeSlot = form.watch("timeSlot");
  
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedGrade = selectedClass?.grade || 1;
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  // Reset form when modal opens with new date or reservation data
  useEffect(() => {
    if (isOpen) {
      form.reset({
        roomId: reservation?.roomId || "",
        classId: reservation?.classId || "",
        teacherName: reservation?.teacherName || "",
        purpose: reservation?.purpose || "",
        date: reservation?.date || defaultDate || getToday(),
        timeSlot: reservation?.timeSlot || "",
      });
    }
  }, [isOpen, defaultDate, reservation, form]);

  // Check for planned schedule conflicts
  const getScheduleConflicts = () => {
    if (!selectedRoom || !selectedDate || !selectedTimeSlot) return [];
    
    const conflicts: Array<{
      timeSlot: string;
      plannedGrades: string[];
    }> = [];

    // Check against planned schedules
    const day = ['일', '월', '화', '수', '목', '금', '토'][new Date(selectedDate).getDay()];
    
    if (doTimeSlotsOverlap(selectedTimeSlot, selectedTimeSlot)) {
      const plannedGrades = getPlannedUsageForTimeSlot(selectedRoom.name, selectedDate, selectedTimeSlot);
      if (plannedGrades.length > 0) {
        conflicts.push({
          timeSlot: selectedTimeSlot,
          plannedGrades: plannedGrades.filter((grade, index, arr) => arr.indexOf(grade) === index)
        });
      }
    }

    return conflicts;
  };

  const scheduleConflicts = getScheduleConflicts();

  const createMutation = useMutation({
    mutationFn: async (data: ReservationFormData) => {
      return await SheetsAPI.createReservation({
        roomId: data.roomId,
        classId: data.classId,
        date: data.date,
        timeSlot: data.timeSlot,
        teacherName: data.teacherName,
        purpose: data.purpose,
      });
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
        description: "예약이 등록되었습니다.",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "예약 등록에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ReservationFormData) => {
      if (!reservation?.id) throw new Error("예약 ID가 없습니다");
      
      return await SheetsAPI.updateReservation(reservation.id, {
        roomId: data.roomId,
        classId: data.classId,
        date: data.date,
        timeSlot: data.timeSlot,
        teacherName: data.teacherName,
        purpose: data.purpose,
      });
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
        description: "예약이 수정되었습니다.",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "예약 수정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReservationFormData) => {
    if (reservation) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reservation ? "예약 수정" : "새 예약"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 특별실 선택 */}
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>특별실</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="특별실을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 학급 선택 */}
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>학급</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="학급을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 날짜 선택 */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>날짜</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 시간 선택 */}
              <FormField
                control={form.control}
                name="timeSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시간</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="시간을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 담당교사 */}
            <FormField
              control={form.control}
              name="teacherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>담당교사</FormLabel>
                  <FormControl>
                    <Input placeholder="담당교사명을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 목적 */}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>목적</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="특별실 사용 목적을 입력하세요"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 충돌 경고 */}
            {scheduleConflicts.length > 0 && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <div className="font-semibold mb-2">시간표 중복 알림</div>
                  {scheduleConflicts.map((conflict, index) => (
                    <div key={index} className="mb-2">
                      <Badge variant="outline" className="mb-1">
                        {conflict.timeSlot}
                      </Badge>
                      <div className="text-sm">
                        계획된 수업: {conflict.plannedGrades.join(", ")}
                      </div>
                    </div>
                  ))}
                  <div className="text-sm mt-2">
                    이미 계획된 수업과 겹칠 수 있습니다. 확인 후 예약해주세요.
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* 특별실 안내사항 */}
            {selectedRoom && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <div className="font-semibold mb-2">{selectedRoom.name} 이용 안내</div>
                  <div className="text-sm">
                    수용인원: {selectedRoom.capacity}명<br />
                    {selectedRoom.description}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "처리 중..." : (reservation ? "수정하기" : "예약하기")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
