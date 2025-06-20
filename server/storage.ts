import { 
  rooms, 
  classes, 
  reservations, 
  type Room, 
  type Class, 
  type Reservation, 
  type InsertRoom, 
  type InsertClass, 
  type InsertReservation,
  type ReservationWithDetails
} from "@shared/schema";

export interface IStorage {
  // Rooms
  getRooms(): Promise<Room[]>;
  getRoom(id: number): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined>;
  deleteRoom(id: number): Promise<boolean>;

  // Classes
  getClasses(): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  createClass(class_: InsertClass): Promise<Class>;

  // Reservations
  getReservations(): Promise<ReservationWithDetails[]>;
  getReservation(id: number): Promise<ReservationWithDetails | undefined>;
  getReservationsByDate(date: string): Promise<ReservationWithDetails[]>;
  getReservationsByDateRange(startDate: string, endDate: string): Promise<ReservationWithDetails[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: number, reservation: Partial<InsertReservation>): Promise<Reservation | undefined>;
  deleteReservation(id: number): Promise<boolean>;
  checkReservationConflict(roomId: number, date: string, periods: string[], excludeId?: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private rooms: Map<number, Room> = new Map();
  private classes: Map<number, Class> = new Map();
  private reservations: Map<number, Reservation> = new Map();
  private currentRoomId = 1;
  private currentClassId = 1;
  private currentReservationId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default rooms
    const defaultRooms = [
      { name: "강당" },
      { name: "운동장" },
      { name: "풋살장" },
      { name: "놀이활동실1" },
      { name: "놀이활동실2" },
      { name: "야외정원(4층)" },
      { name: "시청각실1" },
      { name: "시청각실2" }
    ];

    defaultRooms.forEach(room => {
      const newRoom: Room = {
        id: this.currentRoomId++,
        name: room.name,
        isActive: true,
        createdAt: new Date(),
      };
      this.rooms.set(newRoom.id, newRoom);
    });

    // Initialize default classes
    const defaultClasses = [];
    const classConfig: Record<number, number> = {
      1: 6,  // 1학년 1-6반
      2: 8,  // 2학년 1-8반
      3: 9,  // 3학년 1-9반
      4: 11, // 4학년 1-11반
      5: 10, // 5학년 1-10반
      6: 10  // 6학년 1-10반
    };

    for (let grade = 1; grade <= 6; grade++) {
      for (let classNum = 1; classNum <= classConfig[grade]; classNum++) {
        defaultClasses.push({
          name: `${grade}학년 ${classNum}반`,
          grade: grade,
          classNumber: classNum,
        });
      }
    }

    defaultClasses.forEach(class_ => {
      const newClass: Class = {
        id: this.currentClassId++,
        ...class_,
      };
      this.classes.set(newClass.id, newClass);
    });
  }

  // Rooms
  async getRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter(room => room.isActive);
  }

  async getRoom(id: number): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const newRoom: Room = {
      id: this.currentRoomId++,
      name: room.name,
      isActive: room.isActive ?? true,
      createdAt: new Date(),
    };
    this.rooms.set(newRoom.id, newRoom);
    return newRoom;
  }

  async updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined> {
    const existing = this.rooms.get(id);
    if (!existing) return undefined;

    const updated: Room = { ...existing, ...room };
    this.rooms.set(id, updated);
    return updated;
  }

  async deleteRoom(id: number): Promise<boolean> {
    const room = this.rooms.get(id);
    if (!room) return false;

    // Soft delete by setting isActive to false
    room.isActive = false;
    this.rooms.set(id, room);
    return true;
  }

  // Classes
  async getClasses(): Promise<Class[]> {
    return Array.from(this.classes.values());
  }

  async getClass(id: number): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async createClass(class_: InsertClass): Promise<Class> {
    const newClass: Class = {
      id: this.currentClassId++,
      ...class_,
    };
    this.classes.set(newClass.id, newClass);
    return newClass;
  }

  // Reservations
  async getReservations(): Promise<ReservationWithDetails[]> {
    const reservations = Array.from(this.reservations.values());
    return this.enrichReservations(reservations);
  }

  async getReservation(id: number): Promise<ReservationWithDetails | undefined> {
    const reservation = this.reservations.get(id);
    if (!reservation) return undefined;
    
    const enriched = await this.enrichReservations([reservation]);
    return enriched[0];
  }

  async getReservationsByDate(date: string): Promise<ReservationWithDetails[]> {
    const reservations = Array.from(this.reservations.values())
      .filter(r => r.reservationDate === date);
    return this.enrichReservations(reservations);
  }

  async getReservationsByDateRange(startDate: string, endDate: string): Promise<ReservationWithDetails[]> {
    const reservations = Array.from(this.reservations.values())
      .filter(r => r.reservationDate >= startDate && r.reservationDate <= endDate);
    return this.enrichReservations(reservations);
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const newReservation: Reservation = {
      id: this.currentReservationId++,
      roomId: reservation.roomId,
      classId: reservation.classId,
      teacherName: reservation.teacherName,
      teacherPhone: "",
      purpose: "",
      notes: reservation.notes || null,
      reservationDate: reservation.reservationDate,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      periods: reservation.periods || null,
      createdAt: new Date(),
    };
    this.reservations.set(newReservation.id, newReservation);
    return newReservation;
  }

  async updateReservation(id: number, reservation: Partial<InsertReservation>): Promise<Reservation | undefined> {
    const existing = this.reservations.get(id);
    if (!existing) return undefined;

    const updated: Reservation = { ...existing, ...reservation };
    this.reservations.set(id, updated);
    return updated;
  }

  async deleteReservation(id: number): Promise<boolean> {
    return this.reservations.delete(id);
  }

  async checkReservationConflict(
    roomId: number, 
    date: string, 
    periods: string[], 
    excludeId?: number
  ): Promise<boolean> {
    const reservations = Array.from(this.reservations.values())
      .filter(r => r.id !== excludeId && r.roomId === roomId && r.reservationDate === date);

    for (const reservation of reservations) {
      if (reservation.periods?.some(p => periods.includes(p))) {
        return true; // Conflict found
      }
    }
    return false;
  }

  private async enrichReservations(reservations: Reservation[]): Promise<ReservationWithDetails[]> {
    return reservations.map(reservation => {
      const room = this.rooms.get(reservation.roomId);
      const class_ = this.classes.get(reservation.classId);
      
      if (!room || !class_) {
        throw new Error(`Related data not found for reservation ${reservation.id}`);
      }

      return {
        ...reservation,
        room,
        class: class_,
      };
    });
  }
}

export const storage = new MemStorage();
