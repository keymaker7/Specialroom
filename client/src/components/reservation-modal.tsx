import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReservationSchema, type InsertReservation, type Room, type Class } from "@shared/schema";
import { getGradeSchedule, formatPeriodLabel, getAvailablePeriods } from "@shared/timeConfig";
import { getPlannedUsageForTimeSlot, getTimeSlotFromPeriod } from "@shared/scheduleData";
import { apiRequest } from "@/lib/queryClient";
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

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation?: any;
}

const periods = ["1", "2", "3", "4", "5", "6"];

export default function ReservationModal({ 
  isOpen, 
  onClose, 
  reservation 
}: ReservationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  const form = useForm<InsertReservation>({
    resolver: zodResolver(insertReservationSchema),
    defaultValues: {
      roomId: reservation?.roomId || 0,
      classId: reservation?.classId || 0,
      teacherName: reservation?.teacherName || "",
      notes: reservation?.notes || "",
      reservationDate: reservation?.reservationDate || getToday(),
      startTime: reservation?.startTime || "09:00",
      endTime: reservation?.endTime || "09:40",
      periods: reservation?.periods || [],
    },
  });

  // Get selected class grade for time scheduling
  const selectedClassId = form.watch("classId");
  const selectedRoomId = form.watch("roomId");
  const selectedDate = form.watch("reservationDate");
  const selectedPeriods = form.watch("periods") || [];
  
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedGrade = selectedClass?.grade || 1;
  const availablePeriods = getAvailablePeriods(selectedGrade);
  const gradeSchedule = getGradeSchedule(selectedGrade);
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  // Check for planned schedule conflicts
  const getScheduleConflicts = () => {
    if (!selectedRoom || !selectedDate || !selectedPeriods.length) return [];
    
    const conflicts: Array<{
      period: string;
      timeSlot: string;
      plannedGrades: string[];
    }> = [];

    selectedPeriods.forEach((period: string) => {
      const timeSlot = getTimeSlotFromPeriod(period, selectedGrade);
      const plannedGrades = getPlannedUsageForTimeSlot(selectedRoom.name, selectedDate, timeSlot);
      
      if (plannedGrades.length > 0) {
        conflicts.push({
          period,
          timeSlot,
          plannedGrades
        });
      }
    });

    return conflicts;
  };

  const scheduleConflicts = getScheduleConflicts();

  const createMutation = useMutation({
    mutationFn: async (data: InsertReservation) => {
      const response = await apiRequest("POST", "/api/reservations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
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
    mutationFn: async (data: InsertReservation) => {
      const response = await apiRequest("PUT", `/api/reservations/${reservation.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "성공",
        description: "예약이 수정되었습니다.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "예약 수정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertReservation) => {
    // Calculate start and end time based on selected periods and grade schedule
    if (data.periods.length > 0) {
      const firstPeriod = Math.min(...data.periods.map(p => parseInt(p)));
      const lastPeriod = Math.max(...data.periods.map(p => parseInt(p)));
      
      const firstPeriodTime = gradeSchedule.periods[firstPeriod.toString()];
      const lastPeriodTime = gradeSchedule.periods[lastPeriod.toString()];
      
      data.startTime = firstPeriodTime?.start || "09:00";
      data.endTime = lastPeriodTime?.end || "09:40";
    }

    if (reservation) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reservation ? "예약 수정" : "새 예약 등록"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>특별실 *</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms.map((room: any) => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            {room.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>학급 *</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((class_: any) => (
                          <SelectItem key={class_.id} value={class_.id.toString()}>
                            {class_.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reservationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>예약 날짜 *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시간대 *</FormLabel>
                    <div className="space-y-3">
                      {selectedClass && (
                        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                          <strong>{selectedClass.name}</strong> ({selectedGrade}학년) 시간표 적용
                        </div>
                      )}
                      <div className="space-y-2">
                        {availablePeriods.map((period) => {
                          const periodTime = gradeSchedule.periods[period];
                          return (
                            <div key={period} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  id={`period-${period}`}
                                  checked={field.value.includes(period)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, period]);
                                    } else {
                                      field.onChange(field.value.filter(p => p !== period));
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`period-${period}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {period}교시
                                </label>
                              </div>
                              <div className="text-sm text-gray-600 font-mono">
                                {periodTime ? `${periodTime.start} - ${periodTime.end}` : '시간 미설정'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Schedule Conflict Warning */}
            {scheduleConflicts.length > 0 && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <div className="space-y-2">
                    <p className="font-medium">⚠️ 기존 계획된 이용 시간과 중복됩니다</p>
                    <div className="space-y-1">
                      {scheduleConflicts.map((conflict, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{conflict.period}교시 ({conflict.timeSlot})</span>
                          <div className="ml-4 mt-1">
                            <span className="text-gray-700">문의할 학급 또는 학년: </span>
                            {conflict.plannedGrades.map((grade, idx) => (
                              <Badge key={idx} variant="secondary" className="mr-1 bg-orange-100 text-orange-800">
                                {grade}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-orange-700 mt-2">
                      위 학급 또는 학년과 조율 후 예약하시기 바랍니다.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="teacherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이용 학급 *</FormLabel>
                  <FormControl>
                    <Input placeholder="이용 학급" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>참고사항</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="참고사항이 있으면 입력하세요"
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "처리 중..." : 
                 reservation ? "수정" : "등록"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
