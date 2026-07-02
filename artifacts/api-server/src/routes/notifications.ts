import { Router, type Response } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc, and, count } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

// GET /notifications (paginated)
router.get("/notifications", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [countRes] = await db
      .select({ value: count() })
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId));
    const totalCount = countRes?.value || 0;

    res.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
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
      .where(and(eq(notificationsTable.id, notifId), eq(notificationsTable.userId, userId)));

    res.json({ success: true, message: "Notification marked as read." });
  } catch (err: any) {
    logger.error({ err, notifId, userId }, "Failed to mark notification as read");
    res.status(500).json({ success: false, error: err.message || "Failed to update notification." });
  }
});

// DELETE /notifications/:id — clear a single notification
router.delete("/notifications/:id", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const notifId = String(req.params.id);
  try {
    await db
      .delete(notificationsTable)
      .where(and(eq(notificationsTable.id, notifId), eq(notificationsTable.userId, userId)));

    res.json({ success: true, message: "Notification cleared." });
  } catch (err: any) {
    logger.error({ err, notifId, userId }, "Failed to clear notification");
    res.status(500).json({ success: false, error: err.message || "Failed to clear notification." });
  }
});

// DELETE /notifications — clear all notifications for the user
router.delete("/notifications", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  try {
    await db
      .delete(notificationsTable)
      .where(eq(notificationsTable.userId, userId));

    res.json({ success: true, message: "All notifications cleared." });
  } catch (err: any) {
    logger.error({ err, userId }, "Failed to clear all notifications");
    res.status(500).json({ success: false, error: err.message || "Failed to clear all notifications." });
  }
});

export default router;
