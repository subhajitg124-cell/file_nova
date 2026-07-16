import { Router, type IRouter } from "express";
import healthRouter from "./health";
import shareRouter from "./share";

const router: IRouter = Router();

router.use(healthRouter);
router.use(shareRouter);

export default router;
