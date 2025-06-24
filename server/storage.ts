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

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if rooms already exist
      const existingRooms = await db.select().from(rooms).limit(1);
      if (existingRooms.length > 0) {
        return; // Data already exists
      }

      // Initialize default rooms
      const defaultRooms = [
        { name: "강당", isActive: true },
        { name: "음악실", isActive: true },
        { name: "미술실", isActive: true },
        { name: "과학실", isActive: true },
        { name: "컴퓨터실", isActive: true },
        { name: "도서관", isActive: true },
        { name: "체육관", isActive: true },
        { name: "영어체험실", isActive: true },
        { name: "풋살장", isActive: true },
        { name: "방송실", isActive: true },
        { name: "보건실", isActive: true },
        { name: "상담실", isActive: true }
      ];

      await db.insert(rooms).values(defaultRooms);

      // Initialize default classes
      const defaultClasses = [];
      for (let grade = 1; grade <= 6; grade++) {
        for (let classNum = 1; classNum <= 6; classNum++) {
          defaultClasses.push({
            name: `${grade}학년 ${classNum}반`,
            grade: grade,
            classNumber: classNum
          });
        }
      }

      await db.insert(classes).values(defaultClasses);
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }

  // Room methods
  async getRooms(): Promise<Room[]> {
    return await db.select().from(rooms).where(eq(rooms.isActive, true));
  }

  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room || undefined;
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const [newRoom] = await db.insert(rooms).values(room).returning();
    return newRoom;
  }

  async updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined> {
    const [updatedRoom] = await db
      .update(rooms)
      .set(room)
      .where(eq(rooms.id, id))
      .returning();
    return updatedRoom || undefined;
  }

  async deleteRoom(id: number): Promise<boolean> {
    const result = await db
      .update(rooms)
      .set({ isActive: false })
      .where(eq(rooms.id, id));
    return result.rowCount > 0;
  }

  // Class methods
  async getClasses(): Promise<Class[]> {
    return await db.select().from(classes);
  }

  async getClass(id: number): Promise<Class | undefined> {
    const [class_] = await db.select().from(classes).where(eq(classes.id, id));
    return class_ || undefined;
  }

  async createClass(class_: InsertClass): Promise<Class> {
    const [newClass] = await db.insert(classes).values(class_).returning();
    return newClass;
  }

  // Reservation methods
  async getReservations(): Promise<ReservationWithDetails[]> {
    const result = await db
      .select({
        id: reservations.id,
        roomId: reservations.roomId,
        classId: reservations.classId,
        date: reservations.date,
        periods: reservations.periods,
        purpose: reservations.purpose,
        notes: reservations.notes,
        createdAt: reservations.createdAt,
        room: {
          id: rooms.id,
          name: rooms.name,
          isActive: rooms.isActive,
          createdAt: rooms.createdAt
        },
        class: {
          id: classes.id,
          name: classes.name,
          grade: classes.grade,
          classNumber: classes.classNumber,
          createdAt: classes.createdAt
        }
      })
      .from(reservations)
      .innerJoin(rooms, eq(reservations.roomId, rooms.id))
      .innerJoin(classes, eq(reservations.classId, classes.id));

    return result.map(row => ({
      id: row.id,
      roomId: row.roomId,
      classId: row.classId,
      date: row.date,
      periods: row.periods,
      purpose: row.purpose,
      notes: row.notes,
      createdAt: row.createdAt,
      room: row.room,
      class: row.class
    }));
  }

  async getReservation(id: number): Promise<ReservationWithDetails | undefined> {
    const result = await db
      .select({
        id: reservations.id,
        roomId: reservations.roomId,
        classId: reservations.classId,
        date: reservations.date,
        periods: reservations.periods,
        purpose: reservations.purpose,
        notes: reservations.notes,
        createdAt: reservations.createdAt,
        room: {
          id: rooms.id,
          name: rooms.name,
          isActive: rooms.isActive,
          createdAt: rooms.createdAt
        },
        class: {
          id: classes.id,
          name: classes.name,
          grade: classes.grade,
          classNumber: classes.classNumber,
          createdAt: classes.createdAt
        }
      })
      .from(reservations)
      .innerJoin(rooms, eq(reservations.roomId, rooms.id))
      .innerJoin(classes, eq(reservations.classId, classes.id))
      .where(eq(reservations.id, id));

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      id: row.id,
      roomId: row.roomId,
      classId: row.classId,
      date: row.date,
      periods: row.periods,
      purpose: row.purpose,
      notes: row.notes,
      createdAt: row.createdAt,
      room: row.room,
      class: row.class
    };
  }

  async getReservationsByDate(date: string): Promise<ReservationWithDetails[]> {
    const result = await db
      .select({
        id: reservations.id,
        roomId: reservations.roomId,
        classId: reservations.classId,
        date: reservations.date,
        periods: reservations.periods,
        purpose: reservations.purpose,
        notes: reservations.notes,
        createdAt: reservations.createdAt,
        room: {
          id: rooms.id,
          name: rooms.name,
          isActive: rooms.isActive,
          createdAt: rooms.createdAt
        },
        class: {
          id: classes.id,
          name: classes.name,
          grade: classes.grade,
          classNumber: classes.classNumber,
          createdAt: classes.createdAt
        }
      })
      .from(reservations)
      .innerJoin(rooms, eq(reservations.roomId, rooms.id))
      .innerJoin(classes, eq(reservations.classId, classes.id))
      .where(eq(reservations.date, date));

    return result.map(row => ({
      id: row.id,
      roomId: row.roomId,
      classId: row.classId,
      date: row.date,
      periods: row.periods,
      purpose: row.purpose,
      notes: row.notes,
      createdAt: row.createdAt,
      room: row.room,
      class: row.class
    }));
  }

  async getReservationsByDateRange(startDate: string, endDate: string): Promise<ReservationWithDetails[]> {
    const result = await db
      .select({
        id: reservations.id,
        roomId: reservations.roomId,
        classId: reservations.classId,
        date: reservations.date,
        periods: reservations.periods,
        purpose: reservations.purpose,
        notes: reservations.notes,
        createdAt: reservations.createdAt,
        room: {
          id: rooms.id,
          name: rooms.name,
          isActive: rooms.isActive,
          createdAt: rooms.createdAt
        },
        class: {
          id: classes.id,
          name: classes.name,
          grade: classes.grade,
          classNumber: classes.classNumber,
          createdAt: classes.createdAt
        }
      })
      .from(reservations)
      .innerJoin(rooms, eq(reservations.roomId, rooms.id))
      .innerJoin(classes, eq(reservations.classId, classes.id))
      .where(and(
        gte(reservations.date, startDate),
        lte(reservations.date, endDate)
      ));

    return result.map(row => ({
      id: row.id,
      roomId: row.roomId,
      classId: row.classId,
      date: row.date,
      periods: row.periods,
      purpose: row.purpose,
      notes: row.notes,
      createdAt: row.createdAt,
      room: row.room,
      class: row.class
    }));
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const [newReservation] = await db
      .insert(reservations)
      .values(reservation)
      .returning();
    return newReservation;
  }

  async updateReservation(id: number, reservation: Partial<InsertReservation>): Promise<Reservation | undefined> {
    const [updatedReservation] = await db
      .update(reservations)
      .set(reservation)
      .where(eq(reservations.id, id))
      .returning();
    return updatedReservation || undefined;
  }

  async deleteReservation(id: number): Promise<boolean> {
    const result = await db.delete(reservations).where(eq(reservations.id, id));
    return result.rowCount > 0;
  }

  async checkReservationConflict(
    roomId: number,
    date: string,
    periods: string[],
    excludeId?: number
  ): Promise<boolean> {
    let query = db
      .select()
      .from(reservations)
      .where(and(
        eq(reservations.roomId, roomId),
        eq(reservations.date, date)
      ));

    if (excludeId) {
      query = db
        .select()
        .from(reservations)
        .where(and(
          eq(reservations.roomId, roomId),
          eq(reservations.date, date),
          eq(reservations.id, excludeId)
        ));
    }

    const existingReservations = await query;

    return existingReservations.some(existing => 
      existing.periods.some(period => periods.includes(period))
    );
  }
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
      { name: "표현무용실" },
      { name: "야외정원(4층)" },
      { name: "시청각실1" },
      { name: "시청각실2" },
      { name: "제 1 컴퓨터실" },
      { name: "제 2 컴퓨터실" }
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

    // Add special classes
    defaultClasses.push(
      { name: "유치원", grade: 0, classNumber: 1 },
      { name: "복합특수", grade: 0, classNumber: 2 }
    );

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
      
      if (!room) {
        console.error(`Room not found for reservation ${reservation.id}, roomId: ${reservation.roomId}`);
        return null;
      }
      
      if (!class_) {
        console.error(`Class not found for reservation ${reservation.id}, classId: ${reservation.classId}`);
        return null;
      }

      return {
        ...reservation,
        room,
        class: class_,
      };
    }).filter(Boolean) as ReservationWithDetails[];
  }
}

// Use database storage for persistent data
export const storage = new DatabaseStorage();
