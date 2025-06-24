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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  periods: text("periods").array().notNull(), // e.g., ["1", "2"] for 1교시, 2교시
  purpose: text("purpose").default("특별실 이용").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
});

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true,
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
