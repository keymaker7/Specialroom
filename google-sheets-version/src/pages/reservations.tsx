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
import * as SheetsAPI from "@/lib/google-sheets-api";
import ReservationModal from "@/components/reservation-modal";

// Google Sheets API 타입을 기존 타입과 호환되도록 확장
interface ReservationWithDetails extends SheetsAPI.Reservation {
  room?: SheetsAPI.Room;
  class?: SheetsAPI.Class;
  reservationDate?: string;
  periods?: string[];
}

export default function Reservations() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  const reservations: ReservationWithDetails[] = rawReservations.map(reservation => {
    const room = rooms.find(r => r.id === reservation.roomId);
    const classInfo = classes.find(c => c.id === reservation.classId);
    
    return {
      ...reservation,
      room,
      class: classInfo,
      reservationDate: reservation.date,
      periods: reservation.timeSlot ? [reservation.timeSlot] : [],
    };
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await SheetsAPI.deleteReservation(id);
    },
    onSuccess: () => {
      // Invalidate and force refetch for complete synchronization
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservation-stats"] });
      queryClient.refetchQueries({ queryKey: ["reservations"] });
      queryClient.refetchQueries({ queryKey: ["reservation-stats"] });
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

  const handleEdit = (reservation: ReservationWithDetails) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("정말 이 예약을 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch = 
      (reservation.room?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.class?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.purpose || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRoom = !filterRoom || reservation.roomId === filterRoom;

    return matchesSearch && matchesRoom;
  });

  const getStatusBadge = (reservation: ReservationWithDetails) => {
    const today = new Date().toISOString().split('T')[0];
    const reservationDate = reservation.reservationDate || reservation.date;
    
    if (reservationDate < today) {
      return <Badge variant="secondary">완료</Badge>;
    } else if (reservationDate === today) {
      return <Badge className="bg-green-500 text-white">진행 중</Badge>;
    } else {
      return <Badge variant="outline">예정</Badge>;
    }
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">모든 특별실</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
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
                  {filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(reservation.reservationDate || reservation.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {reservation.room?.name || '알 수 없는 특별실'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {reservation.class?.name || '알 수 없는 학급'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {reservation.teacherName || '미기재'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {reservation.timeSlot || '미정'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={reservation.purpose || ''}>
                          {reservation.purpose || '목적 미기재'}
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
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(reservation.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
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

      {/* Reservation Modal */}
      <ReservationModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReservation(null);
        }}
        reservation={selectedReservation}
        rooms={rooms}
        classes={classes}
      />
    </div>
  );
}
