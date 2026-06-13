import { Router, type IRouter } from "express";
import healthRouter from "./health";
import upiPaymentsRouter from "./upiPayments";
import paymentsRouter from "./payments";
import shareRouter from "./share";
import aiPptRoutes from "./ai-ppt";

const router: IRouter = Router();

router.use(healthRouter);
router.use(upiPaymentsRouter);
router.use("/payments", paymentsRouter);
router.use(shareRouter);
router.use(aiPptRoutes);

export default router;

