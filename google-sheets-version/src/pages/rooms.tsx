import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRoomSchema, type InsertRoom } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  Plus, 
  DoorOpen, 
  Trash2,
  CheckCircle,
  XCircle,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Rooms() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ["/api/reservations"],
  });

  const form = useForm<InsertRoom>({
    resolver: zodResolver(insertRoomSchema),
    defaultValues: {
      name: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertRoom) => {
      const response = await apiRequest("POST", "/api/rooms", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({
        title: "성공",
        description: "특별실이 추가되었습니다.",
      });
      setIsModalOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "특별실 추가에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/rooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "성공",
        description: "특별실이 삭제되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "특별실 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = async (id: number, roomName: string) => {
    // Check if room has reservations
    const roomReservations = reservations.filter((r: any) => r.roomId === id);
    
    if (roomReservations.length > 0) {
      toast({
        title: "삭제 불가",
        description: "예약이 있는 특별실은 삭제할 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`정말 "${roomName}" 특별실을 삭제하시겠습니까?`)) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: InsertRoom) => {
    createMutation.mutate(data);
  };

  const getRoomStats = (roomId: number) => {
    const roomReservations = reservations.filter((r: any) => r.roomId === roomId);
    const today = new Date().toISOString().split('T')[0];
    const todayReservations = roomReservations.filter((r: any) => r.date === today);
    
    return {
      totalReservations: roomReservations.length,
      todayReservations: todayReservations.length,
      hasToday: todayReservations.length > 0
    };
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">특별실 관리</h1>
        <Button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          특별실 추가
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">전체 특별실</p>
                <p className="text-3xl font-bold text-primary">{rooms.length}</p>
              </div>
              <DoorOpen className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">오늘 사용 중</p>
                <p className="text-3xl font-bold text-accent">
                  {rooms.filter((room: any) => getRoomStats(room.id).hasToday).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">전체 예약</p>
                <p className="text-3xl font-bold text-secondary">{reservations.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="w-5 h-5" />
            특별실 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              등록된 특별실이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>특별실명</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>전체 예약</TableHead>
                    <TableHead>오늘 예약</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room: any) => {
                    const stats = getRoomStats(room.id);
                    return (
                      <TableRow key={room.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DoorOpen className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{room.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {stats.hasToday ? (
                              <>
                                <XCircle className="w-4 h-4 text-red-500" />
                                <Badge className="status-occupied">사용 중</Badge>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <Badge className="status-available">이용 가능</Badge>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {stats.totalReservations}건
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stats.hasToday ? "destructive" : "secondary"}>
                            {stats.todayReservations}건
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(room.createdAt).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(room.id, room.name)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Room Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 특별실 추가</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>특별실명 *</FormLabel>
                    <FormControl>
                      <Input placeholder="특별실명을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                >
                  취소
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "추가 중..." : "추가"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
