import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Save, RotateCcw } from "lucide-react";
import { DEFAULT_GRADE_SCHEDULES, type GradeSchedule, type PeriodTime } from "@shared/timeConfig";
import { useToast } from "@/hooks/use-toast";

interface TimeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TimeConfigModal({ isOpen, onClose }: TimeConfigModalProps) {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<GradeSchedule[]>(DEFAULT_GRADE_SCHEDULES);

  const updatePeriodTime = (gradeIndex: number, period: string, field: 'start' | 'end', value: string) => {
    setSchedules(prev => prev.map((schedule, index) => {
      if (index === gradeIndex) {
        return {
          ...schedule,
          periods: {
            ...schedule.periods,
            [period]: {
              ...schedule.periods[period],
              [field]: value
            }
          }
        };
      }
      return schedule;
    }));
  };

  const resetToDefaults = () => {
    setSchedules(DEFAULT_GRADE_SCHEDULES);
    toast({
      title: "초기화 완료",
      description: "시간표가 기본값으로 초기화되었습니다.",
    });
  };

  const saveConfiguration = () => {
    // In a real implementation, this would save to localStorage or backend
    localStorage.setItem('gradeSchedules', JSON.stringify(schedules));
    toast({
      title: "저장 완료",
      description: "시간표 설정이 저장되었습니다.",
    });
    onClose();
  };

  const getGradeName = (gradeIndex: number) => {
    switch (gradeIndex) {
      case 0: return "1-2학년";
      case 1: return "3-4학년";
      case 2: return "5-6학년";
      default: return `${gradeIndex + 1}학년`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            교시별 시간대 설정
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="0" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {schedules.map((_, index) => (
              <TabsTrigger key={index} value={index.toString()}>
                {getGradeName(index)}
              </TabsTrigger>
            ))}
          </TabsList>

          {schedules.map((schedule, gradeIndex) => (
            <TabsContent key={gradeIndex} value={gradeIndex.toString()}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {getGradeName(gradeIndex)} 시간표
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(schedule.periods).map(([period, time]) => (
                      <div key={period} className="grid grid-cols-4 gap-4 items-center p-4 border rounded-lg">
                        <div className="font-medium">
                          {time.isBreak ? (
                            <span className="text-green-600">{time.label}</span>
                          ) : (
                            <span className="text-blue-600">{period}교시</span>
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`${gradeIndex}-${period}-start`} className="text-sm">
                            시작 시간
                          </Label>
                          <Input
                            id={`${gradeIndex}-${period}-start`}
                            type="time"
                            value={time.start}
                            onChange={(e) => updatePeriodTime(gradeIndex, period, 'start', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${gradeIndex}-${period}-end`} className="text-sm">
                            종료 시간
                          </Label>
                          <Input
                            id={`${gradeIndex}-${period}-end`}
                            type="time"
                            value={time.end}
                            onChange={(e) => updatePeriodTime(gradeIndex, period, 'end', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          {time.start} - {time.end}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            기본값으로 초기화
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={saveConfiguration}>
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}