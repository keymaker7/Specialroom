import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReservationSchema, type InsertReservation, type Room, type Class } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPeriodLabel, getToday } from "@/lib/utils";

export default function QuickReservationForm() {
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
      roomId: 0,
      classId: 0,
      teacherName: "",
      notes: "",
      reservationDate: getToday(),
      startTime: "09:00",
      endTime: "09:40",
      periods: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertReservation) => {
      const response = await apiRequest("POST", "/api/reservations", data);
      return response.json();
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
        description: "예약이 등록되었습니다.",
      });
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

  const onSubmit = (data: InsertReservation) => {
    // Set periods based on selected period from dropdown
    const periodValue = form.watch("periods")[0];
    if (periodValue) {
      const periodTimes: Record<string, { start: string; end: string }> = {
        "1": { start: "09:00", end: "09:40" },
        "2": { start: "09:50", end: "10:30" },
        "3": { start: "10:40", end: "11:20" },
        "4": { start: "11:30", end: "12:10" },
        "5": { start: "13:30", end: "14:10" },
        "6": { start: "14:20", end: "15:00" },
      };
      
      data.startTime = periodTimes[periodValue].start;
      data.endTime = periodTimes[periodValue].end;
    }

    createMutation.mutate(data);
  };

  return (
    <Card className="reservation-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          빠른 예약 등록
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>특별실</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger className="form-select">
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
                  <FormLabel>학급</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger className="form-select">
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

            <FormField
              control={form.control}
              name="reservationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>예약 날짜</FormLabel>
                  <FormControl>
                    <Input type="date" className="form-input" {...field} />
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
                  <FormLabel>시간</FormLabel>
                  <Select
                    value={field.value[0] || ""}
                    onValueChange={(value) => field.onChange([value])}
                  >
                    <FormControl>
                      <SelectTrigger className="form-select">
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["1", "2", "3", "4", "5", "6"].map((period) => (
                        <SelectItem key={period} value={period}>
                          {getPeriodLabel(period)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="teacherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이용 학급</FormLabel>
                    <FormControl>
                      <Input 
                        className="form-input" 
                        placeholder="이용 학급을 입력하세요" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>참고사항</FormLabel>
                    <FormControl>
                      <Input 
                        className="form-input" 
                        placeholder="참고사항을 입력하세요" 
                        {...field} 
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4 flex justify-end space-x-3">
              <Button type="button" variant="outline" className="btn-secondary">
                취소
              </Button>
              <Button 
                type="submit" 
                className="btn-primary"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "등록 중..." : "예약 등록"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
