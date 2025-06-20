import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRoomSchema, insertClassSchema, insertReservationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Rooms endpoints
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "특별실 목록을 가져오는데 실패했습니다." });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(roomData);
      res.json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "입력 데이터가 올바르지 않습니다.", errors: error.errors });
      } else {
        res.status(500).json({ message: "특별실 생성에 실패했습니다." });
      }
    }
  });

  app.delete("/api/rooms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRoom(id);
      if (success) {
        res.json({ message: "특별실이 삭제되었습니다." });
      } else {
        res.status(404).json({ message: "특별실을 찾을 수 없습니다." });
      }
    } catch (error) {
      res.status(500).json({ message: "특별실 삭제에 실패했습니다." });
    }
  });

  // Classes endpoints
  app.get("/api/classes", async (req, res) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "학급 목록을 가져오는데 실패했습니다." });
    }
  });

  app.post("/api/classes", async (req, res) => {
    try {
      const classData = insertClassSchema.parse(req.body);
      const class_ = await storage.createClass(classData);
      res.json(class_);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "입력 데이터가 올바르지 않습니다.", errors: error.errors });
      } else {
        res.status(500).json({ message: "학급 생성에 실패했습니다." });
      }
    }
  });

  // Reservations endpoints
  app.get("/api/reservations", async (req, res) => {
    try {
      const { date, startDate, endDate } = req.query;
      
      let reservations;
      if (date) {
        reservations = await storage.getReservationsByDate(date as string);
      } else if (startDate && endDate) {
        reservations = await storage.getReservationsByDateRange(
          startDate as string, 
          endDate as string
        );
      } else {
        reservations = await storage.getReservations();
      }
      
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "예약 목록을 가져오는데 실패했습니다." });
    }
  });

  app.get("/api/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reservation = await storage.getReservation(id);
      if (reservation) {
        res.json(reservation);
      } else {
        res.status(404).json({ message: "예약을 찾을 수 없습니다." });
      }
    } catch (error) {
      res.status(500).json({ message: "예약 정보를 가져오는데 실패했습니다." });
    }
  });

  app.post("/api/reservations", async (req, res) => {
    try {
      const reservationData = insertReservationSchema.parse(req.body);
      
      // Check for conflicts
      const hasConflict = await storage.checkReservationConflict(
        reservationData.roomId,
        reservationData.reservationDate,
        reservationData.periods
      );
      
      if (hasConflict) {
        res.status(409).json({ message: "해당 시간대에 이미 예약이 있습니다." });
        return;
      }
      
      const reservation = await storage.createReservation(reservationData);
      res.json(reservation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "입력 데이터가 올바르지 않습니다.", errors: error.errors });
      } else {
        res.status(500).json({ message: "예약 생성에 실패했습니다." });
      }
    }
  });

  app.put("/api/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reservationData = insertReservationSchema.partial().parse(req.body);
      
      // Check for conflicts if room, date, or periods are being updated
      if (reservationData.roomId || reservationData.reservationDate || reservationData.periods) {
        const existing = await storage.getReservation(id);
        if (!existing) {
          res.status(404).json({ message: "예약을 찾을 수 없습니다." });
          return;
        }
        
        const roomId = reservationData.roomId || existing.roomId;
        const date = reservationData.reservationDate || existing.reservationDate;
        const periods = reservationData.periods || existing.periods || [];
        
        const hasConflict = await storage.checkReservationConflict(roomId, date, periods, id);
        
        if (hasConflict) {
          res.status(409).json({ message: "해당 시간대에 이미 예약이 있습니다." });
          return;
        }
      }
      
      const reservation = await storage.updateReservation(id, reservationData);
      if (reservation) {
        res.json(reservation);
      } else {
        res.status(404).json({ message: "예약을 찾을 수 없습니다." });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "입력 데이터가 올바르지 않습니다.", errors: error.errors });
      } else {
        res.status(500).json({ message: "예약 수정에 실패했습니다." });
      }
    }
  });

  app.delete("/api/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteReservation(id);
      if (success) {
        res.json({ message: "예약이 삭제되었습니다." });
      } else {
        res.status(404).json({ message: "예약을 찾을 수 없습니다." });
      }
    } catch (error) {
      res.status(500).json({ message: "예약 삭제에 실패했습니다." });
    }
  });

  // Statistics endpoint
  app.get("/api/statistics", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const todayReservations = await storage.getReservationsByDate(today);
      const weekReservations = await storage.getReservationsByDateRange(
        startOfWeek.toISOString().split('T')[0],
        endOfWeek.toISOString().split('T')[0]
      );
      const rooms = await storage.getRooms();
      
      // Calculate utilization (simplified)
      const totalSlots = rooms.length * 6 * 5; // 6 periods per day, 5 days per week
      const usedSlots = weekReservations.reduce((sum, r) => sum + (r.periods?.length || 0), 0);
      const utilizationRate = Math.round((usedSlots / totalSlots) * 100);
      
      res.json({
        todayReservations: todayReservations.length,
        weekReservations: weekReservations.length,
        activeRooms: rooms.length,
        utilizationRate,
      });
    } catch (error) {
      res.status(500).json({ message: "통계 데이터를 가져오는데 실패했습니다." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
