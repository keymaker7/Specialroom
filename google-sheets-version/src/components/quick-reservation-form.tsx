import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Clock, Calendar, MapPin, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as SheetsAPI from "@/lib/google-sheets-api";
import { getToday } from "@/lib/utils";

// Google Sheets API용 빠른 예약 스키마
const quickReservationSchema = z.object({
  roomId: z.string().min(1, "특별실을 선택해주세요"),
  classId: z.string().min(1, "학급을 선택해주세요"),
  date: z.string().min(1, "날짜를 선택해주세요"),
  timeSlot: z.string().min(1, "시간을 선택해주세요"),
  teacherName: z.string().min(1, "담당교사명을 입력해주세요"),
  purpose: z.string().min(1, "목적을 입력해주세요"),
});

type QuickReservationFormData = z.infer<typeof quickReservationSchema>;

interface QuickReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  rooms?: SheetsAPI.Room[];
  classes?: SheetsAPI.Class[];
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

export default function QuickReservationForm({ 
  isOpen, 
  onClose,
  rooms = [],
  classes = []
}: QuickReservationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<QuickReservationFormData>({
    resolver: zodResolver(quickReservationSchema),
    defaultValues: {
      roomId: "",
      classId: "",
      date: getToday(),
      timeSlot: "",
      teacherName: "",
      purpose: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: QuickReservationFormData) => {
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
      
      // Force immediate refetch across all components
      queryClient.refetchQueries({ queryKey: ["reservations"] });
      queryClient.refetchQueries({ queryKey: ["reservation-stats"] });
      
      toast({
        title: "성공",
        description: "빠른 예약이 등록되었습니다.",
      });
      
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "예약 등록에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuickReservationFormData) => {
    createMutation.mutate(data);
  };

  const isSubmitting = createMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            빠른 예약
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 날짜 & 시간 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      날짜
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      시간
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="시간 선택" />
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

            {/* 특별실 & 학급 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      특별실
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="특별실 선택" />
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

              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      학급
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="학급 선택" />
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
                      placeholder="간단한 사용 목적을 입력하세요"
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 제출 버튼 */}
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
                {isSubmitting ? "등록 중..." : "빠른 예약"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
