import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ReservationWithDetails, type Room, type Class, type InsertRoom } from "../../shared/schema";
import { type CSVData, generateCSVContent, mapToCSVField } from "@/lib/types";
import TimeConfigModal from "@/components/time-config-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Download, 
  Upload, 
  FileText, 
  Shield,
  Lock,
  Database,
  Calendar,
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function SettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isTimeConfigOpen, setIsTimeConfigOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reservations = [] } = useQuery<ReservationWithDetails[]>({
    queryKey: ["/api/reservations"],
    enabled: isAuthenticated,
  });

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
    enabled: isAuthenticated,
  });

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
    enabled: isAuthenticated,
  });

  // Room management mutations
  const createRoomMutation = useMutation({
    mutationFn: async (data: InsertRoom) => {
      const response = await apiRequest(`/api/rooms`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      setNewRoomName("");
      toast({
        title: "성공",
        description: "특별실이 추가되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "특별실 추가에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertRoom> }) => {
      const response = await apiRequest(`/api/rooms/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      setEditingRoom(null);
      toast({
        title: "성공",
        description: "특별실이 수정되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "특별실 수정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/rooms/${id}`, {
        method: "DELETE",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({
        title: "성공",
        description: "특별실이 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "특별실 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handlePasswordSubmit = () => {
    if (password === "2017") {
      setIsAuthenticated(true);
      toast({
        title: "성공",
        description: "설정에 접근할 수 있습니다.",
      });
    } else {
      toast({
        title: "오류",
        description: "보안코드가 올바르지 않습니다.",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const csvData: CSVData = [
      ["날짜", "특별실", "학급", "교시", "목적", "참고사항"],
      ...reservations.map((r) => [
        mapToCSVField(r.date),
        mapToCSVField(r.room.name),
        mapToCSVField(r.class.name),
        mapToCSVField(r.periods.join(', ')),
        mapToCSVField(r.purpose),
        mapToCSVField(r.notes || "")
      ])
    ];

    const csvContent = generateCSVContent(csvData);

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `특별실예약_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "성공",
      description: "예약 데이터가 CSV 파일로 다운로드되었습니다.",
    });
  };

  const exportRoomsToCSV = () => {
    const csvData: CSVData = [
      ["특별실명", "상태", "등록일"],
      ...rooms.map((r) => [
        mapToCSVField(r.name),
        mapToCSVField(r.isActive ? "활성" : "비활성"),
        mapToCSVField(new Date(r.createdAt).toLocaleDateString('ko-KR'))
      ])
    ];

    const csvContent = generateCSVContent(csvData);

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `특별실목록_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "성공",
      description: "특별실 데이터가 CSV 파일로 다운로드되었습니다.",
    });
  };

  const exportClassesToCSV = () => {
    const csvData: CSVData = [
      ["학급명", "학년", "반"],
      ...classes.map((c) => [
        mapToCSVField(c.name),
        mapToCSVField(c.grade.toString()),
        mapToCSVField(c.classNumber.toString())
      ])
    ];

    const csvContent = generateCSVContent(csvData);

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `학급목록_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "성공",
      description: "학급 데이터가 CSV 파일로 다운로드되었습니다.",
    });
  };

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      createRoomMutation.mutate({ name: newRoomName.trim(), isActive: true });
    }
  };

  const handleUpdateRoom = (room: Room, newName: string) => {
    if (newName.trim() && newName !== room.name) {
      updateRoomMutation.mutate({ id: room.id, data: { name: newName.trim() } });
    } else {
      setEditingRoom(null);
    }
  };

  const handleDeleteRoom = (room: Room) => {
    if (confirm(`정말로 "${room.name}"을(를) 삭제하시겠습니까?`)) {
      deleteRoomMutation.mutate(room.id);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              보안 인증
            </CardTitle>
            <p className="text-sm text-gray-600">
              설정에 접근하려면 보안코드를 입력하세요
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">보안코드</label>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="보안코드를 입력하세요"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="showPassword" className="text-sm">
                보안코드 표시
              </label>
            </div>
            <Button 
              onClick={handlePasswordSubmit}
              className="w-full"
              disabled={!password}
            >
              <Lock className="w-4 h-4 mr-2" />
              접근하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">시스템 설정</h1>
        <Button 
          variant="outline"
          onClick={() => setIsAuthenticated(false)}
        >
          <Lock className="w-4 h-4 mr-2" />
          잠금
        </Button>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">전체 예약</p>
                <p className="text-3xl font-bold text-primary">{reservations.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">특별실 수</p>
                <p className="text-3xl font-bold text-accent">{rooms.length}</p>
              </div>
              <Database className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">학급 수</p>
                <p className="text-3xl font-bold text-secondary">{classes.length}</p>
              </div>
              <Settings className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 특별실 관리 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            특별실 관리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="새 특별실 이름"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                className="flex-1"
              />
              <Button 
                onClick={handleCreateRoom}
                disabled={!newRoomName.trim() || createRoomMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                추가
              </Button>
            </div>
            
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-2 border rounded">
                  {editingRoom?.id === room.id ? (
                    <Input
                      defaultValue={room.name}
                      onBlur={(e) => handleUpdateRoom(room, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateRoom(room, e.currentTarget.value);
                        }
                        if (e.key === 'Escape') {
                          setEditingRoom(null);
                        }
                      }}
                      autoFocus
                      className="flex-1 mr-2"
                    />
                  ) : (
                    <span className="flex-1">{room.name}</span>
                  )}
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingRoom(editingRoom?.id === room.id ? null : room)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRoom(room)}
                      disabled={deleteRoomMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            백업 및 내보내기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium">예약 데이터</span>
                <Badge variant="outline">{reservations.length}건</Badge>
              </div>
              <Button 
                onClick={exportToCSV}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV 다운로드
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-accent" />
                <span className="font-medium">특별실 데이터</span>
                <Badge variant="outline">{rooms.length}개</Badge>
              </div>
              <Button 
                onClick={exportRoomsToCSV}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV 다운로드
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-secondary" />
                <span className="font-medium">학급 데이터</span>
                <Badge variant="outline">{classes.length}개</Badge>
              </div>
              <Button 
                onClick={exportClassesToCSV}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV 다운로드
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="font-medium">교시별 시간 설정</span>
              </div>
              <Button 
                onClick={() => setIsTimeConfigOpen(true)}
                className="w-full"
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                시간표 관리
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">백업 안내</h4>
                <p className="text-sm text-blue-700 mt-1">
                  CSV 파일로 데이터를 내보내어 Excel이나 다른 프로그램에서 활용할 수 있습니다. 
                  정기적으로 백업하여 데이터를 안전하게 보관하세요.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            시스템 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">시스템 버전</label>
                <p className="text-sm text-gray-600">효행초등학교 특별실 예약 시스템 v1.0</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">최근 업데이트</label>
                <p className="text-sm text-gray-600">{new Date().toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">데이터베이스 상태</label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">정상 작동</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">보안 상태</label>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">보안 인증 완료</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Configuration Modal */}
      <TimeConfigModal 
        isOpen={isTimeConfigOpen} 
        onClose={() => setIsTimeConfigOpen(false)} 
      />
    </div>
  );
}