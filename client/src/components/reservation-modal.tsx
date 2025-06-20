import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReservationSchema, type InsertReservation, type Room, type Class } from "@shared/schema";
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
    // Calculate start and end time based on selected periods
    if (data.periods.length > 0) {
      const firstPeriod = Math.min(...data.periods.map(p => parseInt(p)));
      const lastPeriod = Math.max(...data.periods.map(p => parseInt(p)));
      
      const periodTimes: Record<number, { start: string; end: string }> = {
        1: { start: "09:00", end: "09:40" },
        2: { start: "09:50", end: "10:30" },
        3: { start: "10:40", end: "11:20" },
        4: { start: "11:30", end: "12:10" },
        5: { start: "13:30", end: "14:10" },
        6: { start: "14:20", end: "15:00" },
      };
      
      data.startTime = periodTimes[firstPeriod].start;
      data.endTime = periodTimes[lastPeriod].end;
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
                      {periods.map((period) => (
                        <div key={period} className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
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
                          <Input
                            type="time"
                            className="w-32"
                            placeholder="시간 입력"
                          />
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="teacherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>담당교사 *</FormLabel>
                  <FormControl>
                    <Input placeholder="담당교사명" {...field} />
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
