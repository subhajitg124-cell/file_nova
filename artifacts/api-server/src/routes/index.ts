import { Router, type IRouter } from "express";
import healthRouter from "./health";
import shareRouter from "./share";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(shareRouter);
router.use(contactRouter);

export default router;
