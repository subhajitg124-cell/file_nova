import { Router, type IRouter } from "express";
import healthRouter from "./health";
import upiPaymentsRouter from "./upiPayments";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(upiPaymentsRouter);
router.use("/payments", paymentsRouter);

export default router;
