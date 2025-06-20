import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Building, 
  TrendingUp, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { type ReservationWithDetails, type Room } from "@shared/schema";
import QuickReservationForm from "@/components/quick-reservation-form";
import { useState } from "react";
import ReservationModal from "@/components/reservation-modal";
import { formatDate, getWeekRange } from "@/lib/utils";

export default function Dashboard() {
  const [showQuickReservation, setShowQuickReservation] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  const weekRange = getWeekRange();

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ['/api/rooms'],
  });

  const { data: reservations = [] } = useQuery<ReservationWithDetails[]>({
    queryKey: ['/api/reservations'],
  });

  const { data: statistics = {} } = useQuery({
    queryKey: ['/api/statistics'],
  });

  const activeRooms = rooms.filter(room => room.isActive);
  const weekReservations = reservations.filter(r => {
    const reservationDate = new Date(r.reservationDate);
    const startDate = new Date(weekRange.start);
    const endDate = new Date(weekRange.end);
    return reservationDate >= startDate && reservationDate <= endDate;
  });

  const todayReservations = reservations.filter(r => r.reservationDate === new Date().toISOString().split('T')[0]);

  const handleEditReservation = (reservation: ReservationWithDetails) => {
    setSelectedReservation(reservation);
    setShowReservationModal(true);
  };

  const closeModal = () => {
    setShowReservationModal(false);
    setSelectedReservation(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600 mt-1">효행초등학교 특별실 예약 현황</p>
        </div>
        <Button 
          onClick={() => setShowQuickReservation(!showQuickReservation)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          빠른 예약
        </Button>
      </div>

      {/* Quick Reservation Form */}
      {showQuickReservation && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">빠른 예약 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickReservationForm />
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">오늘 예약</p>
                <p className="text-3xl font-bold">{todayReservations.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">이번 주 예약</p>
                <p className="text-3xl font-bold">{weekReservations.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">활성 특별실</p>
                <p className="text-3xl font-bold">{activeRooms.length}</p>
              </div>
              <Building className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">이용률</p>
                <p className="text-3xl font-bold">
                  {activeRooms.length > 0 ? Math.round((weekReservations.length / (activeRooms.length * 7)) * 100) : 0}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reservations & Room Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reservations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              최근 예약 내역
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservations.slice(0, 5).map((reservation) => (
                <div 
                  key={reservation.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleEditReservation(reservation)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-12 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-800">{reservation.room.name}</p>
                      <p className="text-sm text-gray-600">{reservation.class.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(reservation.reservationDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {(reservation.periods || []).join(', ')}교시
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {reservation.teacherName}
                    </Badge>
                  </div>
                </div>
              ))}
              {reservations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>예약 내역이 없습니다.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Room Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              특별실 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeRooms.map((room) => {
                const isOccupied = todayReservations.some(r => r.roomId === room.id);
                return (
                  <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {isOccupied ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      <span className="font-medium text-gray-800">{room.name}</span>
                    </div>
                    <Badge 
                      variant={isOccupied ? "destructive" : "default"}
                      className="text-xs"
                    >
                      {isOccupied ? '사용 중' : '이용 가능'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={closeModal}
        reservation={selectedReservation}
      />
    </div>
  );
}