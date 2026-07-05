import { Router } from "express";
import { isAdminMiddleware } from "../middlewares/isAdmin.middleware";

const router = Router()
router.use(isAdminMiddleware)

export default router