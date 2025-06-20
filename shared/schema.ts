import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "1학년 1반"
  grade: integer("grade").notNull(), // 1-6
  classNumber: integer("class_number").notNull(), // 1, 2, 3, etc.
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  teacherName: text("teacher_name").notNull(),
  teacherPhone: text("teacher_phone").notNull(),
  purpose: text("purpose").notNull(),
  notes: text("notes"),
  reservationDate: text("reservation_date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  periods: text("periods").array(), // e.g., ["1", "2"] for 1교시, 2교시
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
});

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true,
  teacherPhone: true,
  purpose: true,
}).extend({
  periods: z.array(z.string()).min(1, "최소 1개 교시를 선택해야 합니다"),
});

export type Room = typeof rooms.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type InsertReservation = z.infer<typeof insertReservationSchema>;

// Extended type for reservation with related data
export type ReservationWithDetails = Reservation & {
  room: Room;
  class: Class;
};
