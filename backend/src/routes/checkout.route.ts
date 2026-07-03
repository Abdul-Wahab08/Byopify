import { Router } from "express";
import {checkoutController} from "../controllers/checkout.controller";

const router = Router()

router.get('/checkout', checkoutController)

export default router