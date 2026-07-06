import { Router } from "express";
import { createStreamChatChannel, getOrderById, getOrders, sendVideoInvite } from "../controllers/order.controller";

const router = Router()

router.get('/get-orders', getOrders)
router.get('/get-order-by-id/:id', getOrderById)
router.post('/:id/create-stream-chat-channel', createStreamChatChannel)
router.post('/:id/send-video-invite', sendVideoInvite)

export default router