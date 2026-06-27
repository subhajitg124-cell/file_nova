import { Router, type Response } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

// GET /notifications
router.get("/notifications", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  try {
    // 1. Fetch user notifications
    let notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt));

    // 2. If notifications is empty, seed a welcome notification on first login
    if (notifications.length === 0) {
      const welcomeNotif = {
        userId,
        type: "welcome",
        title: "Welcome to FileNova AI! 🚀",
        message: "Experience fast, secure, and offline-first document productivity. Your files never leave your device for standalone tools.",
        isRead: false,
        link: "/workspace",
      };
      
      try {
        const insertedRows = await db.insert(notificationsTable).values(welcomeNotif).returning();
        if (insertedRows && insertedRows.length > 0) {
          notifications = insertedRows;
        } else {
          notifications = [{
            id: "welcome-notif-id",
            ...welcomeNotif,
            createdAt: new Date()
          } as any];
        }
      } catch (insertErr) {
        logger.error({ insertErr }, "Failed to seed welcome notification");
        notifications = [{
          id: "welcome-notif-id",
          ...welcomeNotif,
          createdAt: new Date()
        } as any];
      }
    }

    res.json({ success: true, notifications });
  } catch (err: any) {
    logger.error({ err, userId }, "Failed to fetch notifications");
    res.status(500).json({ success: false, error: err.message || "Failed to fetch notifications." });
  }
});

// PATCH /notifications/:id/read
router.patch("/notifications/:id/read", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const notifId = String(req.params.id);
  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, notifId));

    res.json({ success: true, message: "Notification marked as read." });
  } catch (err: any) {
    logger.error({ err, notifId, userId }, "Failed to mark notification as read");
    res.status(500).json({ success: false, error: err.message || "Failed to update notification." });
  }
});

export default router;
