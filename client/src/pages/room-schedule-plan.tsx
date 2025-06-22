import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScheduleEntry {
  period: string;
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
}

interface RoomSchedule {
  roomName: string;
  schedules: ScheduleEntry[];
  notes?: string;
}

export default function RoomSchedulePlan() {
  const roomSchedules: RoomSchedule[] = [
    {
      roomName: "강당",
      schedules: [
        {
          period: "1교시",
          monday: ["체(4-5)", "체(5-1)"],
          tuesday: ["체(4-10)", "체(5-6)"],
          wednesday: ["체(3-7)", "체(6-1)"],
          thursday: ["체(3-2)", "체(6-6)"],
          friday: ["체(4-8)", "체(4-10)"]
        },
        {
          period: "2교시",
          monday: ["체(4-6)", "체(5-2)"],
          tuesday: ["체(4-11)", "체(5-7)"],
          wednesday: ["체(3-6)", "체(6-2)"],
          thursday: ["체(3-1)", "체(6-7)"],
          friday: ["체(4-9)", "체(4-11)"]
        },
        {
          period: "3교시",
          monday: ["체(4-7)", "체(5-5)"],
          tuesday: ["체(4-1)", "체(5-9)"],
          wednesday: ["체(3-5)", "체(6-3)"],
          thursday: ["체(4-1)", "체(4-7)"],
          friday: ["체(4-6)"]
        },
        {
          period: "4교시",
          monday: ["체(4-8)"],
          tuesday: ["체(4-2)"],
          wednesday: ["체(3-8)"],
          thursday: ["체(4-2)", "체(4-4)", "체(3-3)"],
          friday: ["체(3-3)"]
        },
        {
          period: "5교시",
          monday: ["체(4-9)", "체(5-4)"],
          tuesday: ["체(4-3)", "체(5-8)"],
          wednesday: ["체(3-9)", "체(6-4)"],
          thursday: ["체(4-3)", "체(4-5)"],
          friday: ["체(3-4)", "체(6-9)"]
        },
        {
          period: "5교시(5,6학년)",
          monday: ["체(5-3)"],
          tuesday: ["체(5-10)"],
          wednesday: ["체(6-5)", "체(6-8)"],
          thursday: [],
          friday: ["체(6-10)"]
        },
        {
          period: "6교시",
          monday: ["음악", "줄넘기"],
          tuesday: ["체(4-4)"],
          wednesday: ["KOVO배구"],
          thursday: [],
          friday: ["스포츠클럽"]
        }
      ],
      notes: "※블럭은 코보 수업임, 5,6학년 체육관 사용의 경우 동학년 내 조정 가능"
    },
    {
      roomName: "표현무용실(3,4체육)",
      schedules: [
        {
          period: "1교시",
          monday: ["체(3-8)"],
          tuesday: ["체(3-4)"],
          wednesday: ["체(4-4)"],
          thursday: ["체(4-8)"],
          friday: ["체(4-7)"]
        },
        {
          period: "2교시",
          monday: ["체(3-7)"],
          tuesday: ["체(3-9)"],
          wednesday: ["체(4-5)"],
          thursday: ["체(4-9)"],
          friday: ["체(4-1)"]
        },
        {
          period: "3교시",
          monday: ["체(3-6)"],
          tuesday: ["체(3-2)"],
          wednesday: ["체(4-6)"],
          thursday: ["체(4-10)"],
          friday: ["체(4-2)"]
        },
        {
          period: "4교시",
          monday: ["체(3-5)"],
          tuesday: ["체(3-3)"],
          wednesday: ["체(3-1)"],
          thursday: ["체(4-11)"],
          friday: ["체(4-3)"]
        },
        {
          period: "5교시",
          monday: ["방과후"],
          tuesday: ["방과후"],
          wednesday: ["방과후"],
          thursday: ["방과후"],
          friday: ["방과후"]
        },
        {
          period: "6교시",
          monday: ["방과후"],
          tuesday: ["방과후"],
          wednesday: ["방과후"],
          thursday: ["방과후"],
          friday: ["방과후"]
        }
      ]
    },
    {
      roomName: "놀이활동실1(1,2놀이체육)",
      schedules: [
        {
          period: "09:00~09:40",
          monday: [],
          tuesday: ["1학년"],
          wednesday: ["5학년"],
          thursday: ["2학년"],
          friday: ["유치원"]
        },
        {
          period: "09:50~10:30",
          monday: ["놀(2-1)"],
          tuesday: ["놀(2-5)"],
          wednesday: ["놀(1-1)"],
          thursday: ["놀(1-4)"],
          friday: ["유치원"]
        },
        {
          period: "10:40~11:20",
          monday: ["놀(2-2)"],
          tuesday: ["놀(2-6)"],
          wednesday: ["놀(1-2)"],
          thursday: ["놀(1-5)"],
          friday: ["복합특수"]
        },
        {
          period: "11:30~12:10",
          monday: ["놀(2-3)"],
          tuesday: ["놀(2-7)"],
          wednesday: ["놀(1-3)"],
          thursday: ["놀(1-6)"],
          friday: ["복합특수"]
        },
        {
          period: "12:10~13:00",
          monday: ["1학년"],
          tuesday: ["2학년"],
          wednesday: ["5학년"],
          thursday: ["5학년"],
          friday: ["3학년"]
        },
        {
          period: "13:00~13:40",
          monday: ["놀(2-4)"],
          tuesday: ["놀(2-8)"],
          wednesday: ["늘봄"],
          thursday: ["5학년"],
          friday: ["늘봄"]
        },
        {
          period: "13:50~14:30",
          monday: ["늘봄"],
          tuesday: ["늘봄"],
          wednesday: ["늘봄"],
          thursday: ["늘봄"],
          friday: ["늘봄"]
        }
      ]
    },
    {
      roomName: "놀이활동실2",
      schedules: [
        {
          period: "09:00~09:40",
          monday: ["6학년"],
          tuesday: ["6학년"],
          wednesday: ["6학년"],
          thursday: ["5학년"],
          friday: ["4학년"]
        },
        {
          period: "09:50~10:30",
          monday: ["6학년"],
          tuesday: ["6학년"],
          wednesday: ["5학년"],
          thursday: ["5학년"],
          friday: ["4학년"]
        },
        {
          period: "10:40~11:20",
          monday: ["3학년"],
          tuesday: ["3학년"],
          wednesday: ["3학년"],
          thursday: ["4학년"],
          friday: ["4학년"]
        },
        {
          period: "11:30~12:10",
          monday: ["3학년"],
          tuesday: ["3학년"],
          wednesday: ["4학년"],
          thursday: ["4학년"],
          friday: ["4학년"]
        },
        {
          period: "12:10~13:00",
          monday: ["6학년"],
          tuesday: ["6학년"],
          wednesday: ["6학년"],
          thursday: ["4학년"],
          friday: ["5학년"]
        },
        {
          period: "13:00~13:40",
          monday: ["6학년"],
          tuesday: ["6학년"],
          wednesday: ["5학년"],
          thursday: ["5학년"],
          friday: ["5학년"]
        },
        {
          period: "13:50~14:30",
          monday: [],
          tuesday: ["3학년"],
          wednesday: [],
          thursday: [],
          friday: []
        }
      ]
    },
    {
      roomName: "과학실1",
      schedules: [
        {
          period: "1교시",
          monday: ["과(5-6)"],
          tuesday: [],
          wednesday: [],
          thursday: ["과(5-5)"],
          friday: ["과(5-3)"]
        },
        {
          period: "2교시",
          monday: ["과(5-6)"],
          tuesday: ["과(5-3)"],
          wednesday: ["과(5-1)"],
          thursday: ["과(5-5)"],
          friday: []
        },
        {
          period: "3교시",
          monday: ["과(5-4)"],
          tuesday: ["과(5-3)"],
          wednesday: ["과(5-1)"],
          thursday: ["과(5-6)"],
          friday: []
        },
        {
          period: "4교시",
          monday: ["과(5-5)"],
          tuesday: ["과(5-4)"],
          wednesday: ["과(5-2)"],
          thursday: ["과(5-1)"],
          friday: []
        },
        {
          period: "5교시",
          monday: ["방과후"],
          tuesday: ["과(5-4)"],
          wednesday: ["과(5-2)"],
          thursday: ["과(5-2)"],
          friday: ["방과후"]
        }
      ]
    },
    {
      roomName: "과학실2",
      schedules: [
        {
          period: "1교시",
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: ["과(6-10)"],
          friday: []
        },
        {
          period: "2교시",
          monday: ["과(6-9)"],
          tuesday: ["과(6-10)"],
          wednesday: ["과(5-7)"],
          thursday: ["과(5-10)"],
          friday: ["과(5-7)"]
        },
        {
          period: "3교시",
          monday: ["과(6-9)"],
          tuesday: ["과(6-10)"],
          wednesday: ["과(5-7)"],
          thursday: ["과(5-10)"],
          friday: ["과(5-8)"]
        },
        {
          period: "4교시",
          monday: ["과(6-8)"],
          tuesday: ["과(6-9)"],
          wednesday: ["과(5-8)"],
          thursday: ["과(5-9)"],
          friday: ["과(5-9)"]
        },
        {
          period: "5교시",
          monday: ["과(6-8)"],
          tuesday: ["과(6-8)"],
          wednesday: ["과(5-8)"],
          thursday: ["과(5-9)"],
          friday: ["과(5-10)"]
        }
      ]
    },
    {
      roomName: "과학실3",
      schedules: [
        {
          period: "1교시",
          monday: [],
          tuesday: ["과(6-7)"],
          wednesday: [],
          thursday: ["과(6-1)"],
          friday: []
        },
        {
          period: "2교시",
          monday: ["과(6-5)"],
          tuesday: ["과(6-2)"],
          wednesday: ["과(6-7)"],
          thursday: ["과(6-1)"],
          friday: ["과(6-1)"]
        },
        {
          period: "3교시",
          monday: ["과(6-5)"],
          tuesday: ["과(6-2)"],
          wednesday: ["과(6-7)"],
          thursday: ["과(6-5)"],
          friday: ["과(6-2)"]
        },
        {
          period: "4교시",
          monday: ["과(6-6)"],
          tuesday: ["과(6-4)"],
          wednesday: ["과(6-3)"],
          thursday: ["과(6-6)"],
          friday: ["과(6-3)"]
        },
        {
          period: "5교시",
          monday: ["과(6-6)"],
          tuesday: ["과(6-4)"],
          wednesday: ["과(6-3)"],
          thursday: ["과(6-4)"],
          friday: ["방과후"]
        }
      ]
    },
    {
      roomName: "운동장",
      schedules: [
        {
          period: "09:00~09:40",
          monday: ["4학년"],
          tuesday: ["4학년"],
          wednesday: ["3학년"],
          thursday: ["3학년"],
          friday: ["3학년"]
        },
        {
          period: "09:50~10:30",
          monday: ["4학년"],
          tuesday: ["4학년"],
          wednesday: ["4학년"],
          thursday: ["3학년"],
          friday: ["3학년"]
        },
        {
          period: "10:40~11:20",
          monday: ["2학년"],
          tuesday: ["2학년"],
          wednesday: ["2학년"],
          thursday: ["2학년"],
          friday: ["2학년"]
        },
        {
          period: "11:30~12:10",
          monday: ["1학년"],
          tuesday: ["1학년"],
          wednesday: ["1학년"],
          thursday: ["1학년"],
          friday: ["1학년"]
        },
        {
          period: "12:10~13:00",
          monday: ["6학년"],
          tuesday: ["6학년"],
          wednesday: ["5학년"],
          thursday: ["5학년"],
          friday: ["5학년"]
        },
        {
          period: "13:00~13:40",
          monday: ["6학년"],
          tuesday: ["6학년"],
          wednesday: ["6학년"],
          thursday: ["5학년"],
          friday: ["5학년"]
        },
        {
          period: "13:50~14:30",
          monday: ["6학년"],
          tuesday: ["6학년"],
          wednesday: [],
          thursday: ["5학년"],
          friday: ["5학년"]
        }
      ]
    },
    {
      roomName: "풋살장",
      schedules: [
        {
          period: "09:00~09:40",
          monday: ["4학년"],
          tuesday: ["4학년"],
          wednesday: ["복합특수"],
          thursday: ["3학년"],
          friday: ["유치원"]
        },
        {
          period: "09:50~10:30",
          monday: ["4학년"],
          tuesday: ["4학년"],
          wednesday: ["3학년"],
          thursday: ["3학년"],
          friday: ["2학년"]
        },
        {
          period: "10:40~11:20",
          monday: ["2학년"],
          tuesday: ["2학년"],
          wednesday: ["3학년"],
          thursday: ["2학년"],
          friday: ["2학년"]
        },
        {
          period: "11:30~12:10",
          monday: ["1학년"],
          tuesday: ["1학년"],
          wednesday: ["1학년"],
          thursday: ["1학년"],
          friday: ["1학년"]
        },
        {
          period: "12:10~13:00",
          monday: ["6학년"],
          tuesday: ["6학년"],
          wednesday: ["5학년"],
          thursday: ["6학년"],
          friday: ["5학년"]
        },
        {
          period: "13:00~13:40",
          monday: ["6학년"],
          tuesday: ["6학년"],
          wednesday: ["5학년"],
          thursday: ["5학년"],
          friday: ["5학년"]
        },
        {
          period: "13:50~14:30",
          monday: ["6학년"],
          tuesday: ["와우중"],
          wednesday: ["와우중"],
          thursday: ["와우중"],
          friday: ["5학년"]
        }
      ]
    },
    {
      roomName: "제1컴퓨터실",
      schedules: [
        {
          period: "학년별 사용",
          monday: ["1학년"],
          tuesday: ["1학년"],
          wednesday: ["1학년"],
          thursday: ["1학년"],
          friday: ["1학년"]
        },
        {
          period: "방과후",
          monday: ["방과후 수업"],
          tuesday: ["방과후 수업"],
          wednesday: ["방과후 수업"],
          thursday: ["방과후 수업"],
          friday: ["방과후 수업"]
        }
      ],
      notes: "학년별 사전 조정 후 사용"
    },
    {
      roomName: "제2컴퓨터실",
      schedules: [
        {
          period: "학년별 사용",
          monday: ["2학년"],
          tuesday: ["2학년"],
          wednesday: ["2학년"],
          thursday: ["2학년"],
          friday: ["2학년"]
        },
        {
          period: "방과후",
          monday: [],
          tuesday: ["소프트웨어 연수 및 학생동아리"],
          wednesday: [],
          thursday: [],
          friday: []
        }
      ],
      notes: "학년별 사전 조정 후 사용"
    }
  ];

  const renderScheduleTable = (schedule: RoomSchedule) => (
    <Card key={schedule.roomName} className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-primary">
          {schedule.roomName}
        </CardTitle>
        {schedule.notes && (
          <p className="text-sm text-gray-600">{schedule.notes}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-2 md:mx-0">
          <table className="w-full border-collapse border border-gray-300 min-w-[600px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">시간/교시</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">월</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">화</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">수</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">목</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">금</th>
              </tr>
            </thead>
            <tbody>
              {schedule.schedules.map((entry, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-100">
                    {entry.period}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <div className="flex flex-wrap gap-1">
                      {entry.monday.map((item, itemIdx) => (
                        <Badge key={itemIdx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <div className="flex flex-wrap gap-1">
                      {entry.tuesday.map((item, itemIdx) => (
                        <Badge key={itemIdx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <div className="flex flex-wrap gap-1">
                      {entry.wednesday.map((item, itemIdx) => (
                        <Badge key={itemIdx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <div className="flex flex-wrap gap-1">
                      {entry.thursday.map((item, itemIdx) => (
                        <Badge key={itemIdx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <div className="flex flex-wrap gap-1">
                      {entry.friday.map((item, itemIdx) => (
                        <Badge key={itemIdx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-md:py-4 max-md:px-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">특별실 이용 계획</h1>
        <p className="text-gray-600">
          효행초등학교의 모든 특별실 이용 계획을 요일별, 시간대별로 확인할 수 있습니다.
        </p>
      </div>
      
      <div className="space-y-6">
        {roomSchedules.map(schedule => renderScheduleTable(schedule))}
      </div>
    </div>
  );
}