import { Router, type IRouter } from "express";
import healthRouter from "./health";
import upiPaymentsRouter from "./upiPayments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(upiPaymentsRouter);

export default router;
