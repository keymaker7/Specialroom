// 로컬 스토리지를 데이터베이스처럼 사용하는 간단한 API
export interface LocalReservation {
  id: string;
  roomId: string;
  classId: string;
  date: string;
  timeSlot: string;
  teacherName: string;
  purpose: string;
  createdAt: string;
}

export interface LocalRoom {
  id: string;
  name: string;
  description: string;
  capacity: number;
  isActive: boolean;
}

export interface LocalClass {
  id: string;
  name: string;
  grade: number;
  section: string;
}

class LocalStorageDB {
  private getKey(table: string): string {
    return `specialroom_${table}`;
  }

  // 예약 관련
  getReservations(): LocalReservation[] {
    const data = localStorage.getItem(this.getKey('reservations'));
    return data ? JSON.parse(data) : [];
  }

  saveReservations(reservations: LocalReservation[]): void {
    localStorage.setItem(this.getKey('reservations'), JSON.stringify(reservations));
  }

  addReservation(reservation: Omit<LocalReservation, 'id' | 'createdAt'>): LocalReservation {
    const reservations = this.getReservations();
    const newReservation: LocalReservation = {
      ...reservation,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    reservations.push(newReservation);
    this.saveReservations(reservations);
    return newReservation;
  }

  deleteReservation(id: string): boolean {
    const reservations = this.getReservations();
    const filtered = reservations.filter(r => r.id !== id);
    if (filtered.length < reservations.length) {
      this.saveReservations(filtered);
      return true;
    }
    return false;
  }

  // 특별실 관련
  getRooms(): LocalRoom[] {
    const data = localStorage.getItem(this.getKey('rooms'));
    if (data) return JSON.parse(data);
    
    // 기본 특별실 데이터
    const defaultRooms: LocalRoom[] = [
      { id: '1', name: '강당', description: '체육 활동용', capacity: 200, isActive: true },
      { id: '2', name: '놀이활동실1', description: '1,2학년 놀이활동', capacity: 30, isActive: true },
      { id: '3', name: '놀이활동실2', description: '3-6학년 활동', capacity: 30, isActive: true },
      { id: '4', name: '표현무용실', description: '무용, 표현활동', capacity: 25, isActive: true },
      { id: '5', name: '운동장', description: '야외 체육활동', capacity: 300, isActive: true },
      { id: '6', name: '풋살장', description: '풋살, 소규모 체육', capacity: 20, isActive: true },
      { id: '7', name: '컴퓨터실1', description: 'ICT 교육', capacity: 28, isActive: true },
      { id: '8', name: '컴퓨터실2', description: 'ICT 교육', capacity: 28, isActive: true },
      { id: '9', name: '과학실1', description: '과학 실험', capacity: 24, isActive: true },
      { id: '10', name: '과학실2', description: '과학 실험', capacity: 24, isActive: true },
      { id: '11', name: '음악실1', description: '음악 수업', capacity: 30, isActive: true },
      { id: '12', name: '음악실2', description: '음악 수업', capacity: 30, isActive: true },
      { id: '13', name: '미술실1', description: '미술 활동', capacity: 28, isActive: true },
      { id: '14', name: '미술실2', description: '미술 활동', capacity: 28, isActive: true },
      { id: '15', name: '영어체험실', description: '영어 회화', capacity: 20, isActive: true },
      { id: '16', name: '도서실', description: '독서, 자습', capacity: 50, isActive: true },
    ];
    
    this.saveRooms(defaultRooms);
    return defaultRooms;
  }

  saveRooms(rooms: LocalRoom[]): void {
    localStorage.setItem(this.getKey('rooms'), JSON.stringify(rooms));
  }

  // 학급 관련
  getClasses(): LocalClass[] {
    const data = localStorage.getItem(this.getKey('classes'));
    if (data) return JSON.parse(data);
    
    // 기본 학급 데이터
    const defaultClasses: LocalClass[] = [];
    for (let grade = 1; grade <= 6; grade++) {
      const sections = grade <= 2 ? 8 : grade <= 4 ? 11 : 10; // 1-2학년: 8반, 3-4학년: 11반, 5-6학년: 10반
      for (let section = 1; section <= sections; section++) {
        defaultClasses.push({
          id: `${grade}-${section}`,
          name: `${grade}학년 ${section}반`,
          grade,
          section: section.toString(),
        });
      }
    }
    
    // 특수학급 추가
    defaultClasses.push(
      { id: 'special-1', name: '복합특수', grade: 0, section: '특수' },
      { id: 'kindergarten', name: '유치원', grade: 0, section: '유치' },
      { id: 'neulbom', name: '늘봄', grade: 0, section: '늘봄' }
    );
    
    this.saveClasses(defaultClasses);
    return defaultClasses;
  }

  saveClasses(classes: LocalClass[]): void {
    localStorage.setItem(this.getKey('classes'), JSON.stringify(classes));
  }

  // 데이터 초기화
  clearAll(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('specialroom_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // 데이터 내보내기/가져오기 (백업용)
  exportData(): string {
    return JSON.stringify({
      reservations: this.getReservations(),
      rooms: this.getRooms(),
      classes: this.getClasses(),
      exported: new Date().toISOString(),
    });
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.reservations) this.saveReservations(data.reservations);
      if (data.rooms) this.saveRooms(data.rooms);
      if (data.classes) this.saveClasses(data.classes);
      return true;
    } catch {
      return false;
    }
  }
}

export const localDB = new LocalStorageDB(); 