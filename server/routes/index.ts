import { Router } from "express";
import authRoutes from "./auth.routes";
import dbRoutes from "./db.routes";
import paymentRoutes from "./payment.routes";
import geminiRoutes from "./gemini.routes";
import creationsRoutes from "./creations.routes";

const router = Router();

router.use("/users",     authRoutes);
router.use("/db",        dbRoutes);
router.use("/pay",       paymentRoutes);
router.use("/gemini",    geminiRoutes);
router.use("/creations", creationsRoutes);

// Legacy alias: /api/logs → /api/db/logs
router.get("/logs", (_req, res) => res.redirect(307, "/api/db/logs"));

export default router;
