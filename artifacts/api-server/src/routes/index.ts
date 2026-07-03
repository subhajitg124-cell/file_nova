import { Router, type IRouter } from "express";
import healthRouter from "./health";
import upiPaymentsRouter from "./upiPayments";
import paymentRouter from "./payment";
import shareRouter from "./share";
import otpRouter from "./otp";

const router: IRouter = Router();

router.use(healthRouter);
router.use(upiPaymentsRouter);
router.use("/payment", paymentRouter);
router.use(shareRouter);
router.use(otpRouter);

export default router;
