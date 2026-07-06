import { Router } from "express";
import { getOrderById, getOrders } from "../controllers/order.controller";

const router = Router()

router.get('/get-orders', getOrders)
router.get('/get-order-by-id/:id', getOrderById)

export default router