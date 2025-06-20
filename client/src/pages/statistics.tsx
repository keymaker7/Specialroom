import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  DoorOpen,
  BarChart3,
  Clock
} from "lucide-react";
import { getWeekRange } from "@/lib/utils";

export default function Statistics() {
  const weekRange = getWeekRange();
  
  const { data: statistics } = useQuery({
    queryKey: ["/api/statistics"],
  });

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["/api/reservations"],
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/rooms"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Process data for charts
  const roomUsageData = rooms.map((room: any) => {
    const roomReservations = reservations.filter((r: any) => r.roomId === room.id);
    return {
      name: room.name,
      reservations: roomReservations.length,
      periods: roomReservations.reduce((sum: number, r: any) => sum + (r.periods?.length || 0), 0)
    };
  });

  const monthlyData = (() => {
    const months = {};
    reservations.forEach((reservation: any) => {
      const month = reservation.reservationDate.substring(0, 7); // YYYY-MM
      if (!months[month]) {
        months[month] = 0;
      }
      months[month]++;
    });
    
    return Object.entries(months).map(([month, count]) => ({
      month: month.substring(5) + '월', // MM월
      reservations: count
    })).slice(-6); // Last 6 months
  })();

  const classUsageData = (() => {
    const classStats = {};
    reservations.forEach((reservation: any) => {
      const className = reservation.class.name;
      if (!classStats[className]) {
        classStats[className] = 0;
      }
      classStats[className]++;
    });
    
    return Object.entries(classStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 classes
  })();

  const periodUsageData = (() => {
    const periodStats = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 };
    reservations.forEach((reservation: any) => {
      reservation.periods?.forEach((period: string) => {
        if (periodStats[period] !== undefined) {
          periodStats[period]++;
        }
      });
    });
    
    return Object.entries(periodStats).map(([period, count]) => ({
      period: `${period}교시`,
      count
    }));
  })();

  const COLORS = ['#1976D2', '#4CAF50', '#FFC107', '#FF9800', '#F44336', '#9C27B0'];

  const statsData = statistics || {
    todayReservations: 0,
    weekReservations: 0,
    activeRooms: 0,
    utilizationRate: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">통계 분석</h1>
        <Badge variant="outline" className="px-3 py-1">
          전체 예약: {reservations.length}건
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">오늘 예약</p>
                <p className="text-3xl font-bold text-primary">{statsData.todayReservations}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">이번 주 예약</p>
                <p className="text-3xl font-bold text-accent">{statsData.weekReservations}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활성 특별실</p>
                <p className="text-3xl font-bold text-secondary">{statsData.activeRooms}</p>
              </div>
              <DoorOpen className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">이용률</p>
                <p className="text-3xl font-bold text-purple-600">{statsData.utilizationRate}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DoorOpen className="w-5 h-5" />
              특별실별 이용 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roomUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reservations" fill="#1976D2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Period Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              교시별 이용 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={periodUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              월별 예약 추이
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="reservations" 
                  stroke="#1976D2" 
                  strokeWidth={2}
                  dot={{ fill: "#1976D2" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              학급별 이용 순위
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classUsageData.slice(0, 8).map((item: any, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <Badge variant="secondary">{item.count}건</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Utilization Details */}
      <Card>
        <CardHeader>
          <CardTitle>특별실별 상세 이용 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomUsageData.map((room: any, index) => (
              <div key={room.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{room.name}</h4>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>총 예약:</span>
                    <span className="font-medium">{room.reservations}건</span>
                  </div>
                  <div className="flex justify-between">
                    <span>총 교시:</span>
                    <span className="font-medium">{room.periods}교시</span>
                  </div>
                  <div className="flex justify-between">
                    <span>평균 시간:</span>
                    <span className="font-medium">
                      {room.reservations > 0 ? (room.periods / room.reservations).toFixed(1) : 0}교시/건
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
