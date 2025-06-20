import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  Calendar,
  Clock,
  User,
  Phone
} from "lucide-react";
import { formatDate, formatTime, getPeriodLabel } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ReservationModal from "@/components/reservation-modal";

export default function Reservations() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reservations = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/reservations"],
  });

  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ["/api/rooms"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/reservations/${id}`);
    },
    onSuccess: () => {
      // Invalidate and force refetch for complete synchronization
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      queryClient.refetchQueries({ queryKey: ["/api/reservations"] });
      queryClient.refetchQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "성공",
        description: "예약이 삭제되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "예약 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("정말 이 예약을 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredReservations = reservations.filter((reservation: any) => {
    const matchesSearch = 
      reservation.room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.class.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRoom = !filterRoom || reservation.roomId.toString() === filterRoom;

    return matchesSearch && matchesRoom;
  });

  const getStatusBadge = (reservation: any) => {
    const today = new Date().toISOString().split('T')[0];
    const reservationDate = reservation.reservationDate;
    
    if (reservationDate < today) {
      return <Badge variant="secondary">완료</Badge>;
    } else if (reservationDate === today) {
      return <Badge className="bg-green-500 text-white">진행 중</Badge>;
    } else {
      return <Badge variant="outline">예정</Badge>;
    }
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
        <h1 className="text-2xl font-bold text-gray-800">예약 목록</h1>
        <Button 
          onClick={() => {
            setSelectedReservation(null);
            setIsModalOpen(true);
          }} 
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          새 예약
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="예약 검색 (특별실, 학급, 담당교사, 목적)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
                className="form-select"
              >
                <option value="">모든 특별실</option>
                {rooms.map((room: any) => (
                  <option key={room.id} value={room.id.toString()}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            예약 현황 ({filteredReservations.length}건)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterRoom ? "검색 조건에 맞는 예약이 없습니다." : "등록된 예약이 없습니다."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>날짜</TableHead>
                    <TableHead>특별실</TableHead>
                    <TableHead>학급</TableHead>
                    <TableHead>담당교사</TableHead>
                    <TableHead>시간</TableHead>
                    <TableHead>목적</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation: any) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(reservation.reservationDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {reservation.room.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {reservation.class.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reservation.teacherName}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {reservation.teacherPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium">
                              {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {reservation.periods?.map((p: string) => getPeriodLabel(p).split(' ')[0]).join(', ')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-32 truncate" title={reservation.purpose}>
                          {reservation.purpose}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(reservation)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(reservation)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(reservation.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ReservationModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReservation(null);
        }}
        reservation={selectedReservation}
      />
    </div>
  );
}
