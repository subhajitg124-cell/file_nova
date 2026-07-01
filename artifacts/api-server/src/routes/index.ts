import { Router, type IRouter } from "express";
import healthRouter from "./health";
import upiPaymentsRouter from "./upiPayments";
import paymentsRouter from "./payments";
import paymentRouter from "./payment";
import shareRouter from "./share";
import razorpayRouter from "./razorpay";
// import aiPptRoutes from "./ai-ppt";

const router: IRouter = Router();

router.use(healthRouter);
router.use(upiPaymentsRouter);
router.use("/payments", paymentsRouter);
router.use("/payment", paymentRouter);
router.use(shareRouter);
// Dev-only test routes (no subscription record created)
router.use(razorpayRouter);
// router.use(aiPptRoutes);

export default router;

