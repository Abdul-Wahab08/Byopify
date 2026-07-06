import { Router } from "express";
import { createStreamChatChannel, getOrderById, getOrders } from "../controllers/order.controller";

const router = Router()

router.get('/get-orders', getOrders)
router.get('/get-order-by-id/:id', getOrderById)
router.post('/:id/create-stream-chat-channel', createStreamChatChannel)

export default router