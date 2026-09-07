import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { catalogRouter } from "./catalog";
import { controlRouter } from "./control";
import { contactRouter } from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(catalogRouter);
router.use(contactRouter);
router.use("/control", controlRouter);

export default router;
