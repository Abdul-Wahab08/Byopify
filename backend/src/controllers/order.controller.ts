import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { getLoggedInUser } from "../lib/user";
import { orderItems, orders, products, users } from "../db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { isStaff } from "../lib/roles";
import { StreamChat } from "stream-chat";
import { streamDisplayName, streamUserId } from "../lib/stream";

async function getOrders(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, isAuthenticated } = getAuth(req)

        if (!isAuthenticated || !userId) {
            return res.status(401).json({
                data: null,
                message: "Unauthorized"
            })
        }

        const user = await getLoggedInUser(userId)

        if (!user) {
            return res.status(404).json({
                data: null,
                message: "User not found"
            })
        }

        const allOrders = isStaff(user.role)
            ? await db
                .select()
                .from(orders)
                .orderBy(desc(orders.createdAt))
            : await db
                .select()
                .from(orders)
                .where(eq(orders.userId, user.id))
                .orderBy(desc(orders.createdAt))

        if (allOrders.length === 0) {
            return res.status(404).json({
                data: null,
                message: "User orders not found"
            })
        }

        const orderIds = allOrders.map((order) => order.id)
        const previewByOrder = new Map()

        if (orderIds.length > 0) {
            const items = await db
                .select({
                    orderId: orderItems.orderId,
                    quantity: orderItems.quantity,
                    name: products.name,
                    slug: products.slug,
                    imageUrl: products.imageUrl,
                })
                .from(orderItems)
                .innerJoin(products, eq(orderItems.productId, products.id))
                .where(inArray(orderItems.orderId, orderIds))

            for (const item of items) {
                const list = previewByOrder.get(item.orderId) ?? [];
                list.push({
                    name: item.name,
                    slug: item.slug,
                    imageUrl: item.imageUrl,
                    quantity: item.quantity,
                });
                previewByOrder.set(item.orderId, list);
            }
        }

        const ordersPayload = allOrders.map((order) => ({
            ...order,
            previewItems: previewByOrder.get(order.id) ?? [],
        }));

        return res.status(200).json({
            data: ordersPayload,
            message: "Orders fetched successfully",
        })
    } catch (error) {
        next(error)
    }
}

async function getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, isAuthenticated } = getAuth(req)

        if (!isAuthenticated || !userId) {
            return res.status(401).json({
                data: null,
                message: "Unauthorized"
            })
        }

        const user = await getLoggedInUser(userId)

        if (!user) {
            return res.status(404).json({
                data: null,
                message: "User not found"
            })
        }

        const orderId = req.params.id as string
        const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1)

        if (!order) {
            return res.status(404).json({
                data: null,
                message: "Order not found"
            })
        }

        if (!isStaff(user.role) && order.userId !== user.id) {
            return res.status(403).json({
                data: null,
                message: "Forbidden"
            })
        }

        const items = await db
            .select({
                id: orderItems.id,
                quantity: orderItems.quantity,
                unitPriceCents: orderItems.unitPriceCents,
                product: products
            })
            .from(orderItems)
            .innerJoin(products, eq(orderItems.productId, products.id))
            .where(eq(orderItems.orderId, orderId))

        if (items.length === 0) {
            return res.status(404).json({
                data: null,
                message: "Order items not found"
            })
        }

        return res.status(200).json({
            data: {
                order,
                items
            },
            message: "Order fetched successfully"
        })
    } catch (error) {
        next(error)
    }
}

async function createStreamChatChannel(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, isAuthenticated } = getAuth(req)

        if (!isAuthenticated || !userId) {
            return res.status(401).json({
                data: null,
                message: "Unauthorized"
            })
        }

        const user = await getLoggedInUser(userId)

        if (!user) {
            return res.status(404).json({
                data: null,
                message: "User not found"
            })
        }

        const orderId = req.params.id as string
        const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1)

        if (!order) {
            return res.status(404).json({
                data: null,
                message: "Order not found"
            })
        }

        if (!isStaff(user.role) && order.userId !== user.id) {
            return res.status(403).json({
                data: null,
                message: "Forbidden"
            })
        }

        if (order.status !== "paid") {
            return res.status(400).json({
                data: null,
                message: "Order must be paid to open support chat"
            })
        }

        const streamApiKey = process.env.STREAM_API_KEY!
        const streamApiSecret = process.env.STREAM_API_SECRET!

        const streamServer = StreamChat.getInstance(streamApiKey, streamApiSecret)

        const name = streamDisplayName(user.role, user.fullName, user.email)
        const streamChatUserId = streamUserId(userId)

        await streamServer.upsertUser({
            id: streamChatUserId,
            name,
        })

        const channelId = `order-${order.id}`
        const channel = streamServer.channel("messaging", channelId, {
            name: `Support · order ${order.id.slice(0, 8)}`,
            created_by_id: streamChatUserId,
        })

        await channel.create()
        await channel.addMembers([streamChatUserId])

        return res.status(200).json({
            data: {
                channelType: "messaging",
                channelId,
                streamChatUserId
            },
            message: "Stream chat channel created successfully"
        })
    } catch (error) {
        next(error)
    }
}

async function sendVideoInvite(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, isAuthenticated } = getAuth(req)

        if (!isAuthenticated || !userId) {
            return res.status(401).json({
                data: null,
                message: "Unauthorized"
            })
        }

        const user = await getLoggedInUser(userId)

        if (!user) {
            return res.status(404).json({
                data: null,
                message: "User not found"
            })
        }

        if (!isStaff(user.role)) {
            return res.status(403).json({
                data: null,
                message: "Admin or Support staff can send a video invite"
            })
        }

        const orderId = req.params.id as string
        const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1)

        if (!order) {
            return res.status(404).json({
                data: null,
                message: "Order not found"
            })
        }

        if (order.status !== "paid") {
            return res.status(400).json({
                data: null,
                message: "Order must be paid to send a video invite"
            })
        }

        const [customer] = await db
            .select()
            .from(users)
            .where(eq(users.id, order.userId))
            .limit(1)

        if (!customer) {
            return res.status(404).json({
                data: null,
                message: "Customer not found"
            })
        }

        const streamApiKey = process.env.STREAM_API_KEY!
        const streamApiSecret = process.env.STREAM_API_SECRET!

        const streamServer = StreamChat.getInstance(streamApiKey, streamApiSecret)

        const customerName = streamDisplayName(customer.role, customer.fullName, customer.email)
        const customerStreamId = streamUserId(customer.id)

        await streamServer.upsertUser({
            id: customerStreamId,
            name: customerName,
        })

        const staffName = streamDisplayName(user.role, user.fullName, user.email)
        const staffStreamId = streamUserId(userId)

        await streamServer.upsertUser({
            id: staffStreamId,
            name: staffName,
        })

        const channelId = `order-${order.id}`
        const channel = streamServer.channel("messaging", channelId, {
            name: `Support · order ${order.id.slice(0, 8)}`,
            created_by_id: staffStreamId,
        })

        await channel.create()
        await channel.addMembers([customerStreamId, staffStreamId])

        const frontendUrl = process.env.FRONTEND_URL!.replace(/\/+$/, "")
        const joinUrl = `${frontendUrl}/order/${order.id}/call`;

        await channel.sendMessage({
            text: `Click [here](${joinUrl}) to join the video call`,
            user_id: staffStreamId,
            video_invite: true,
            video_invite_join_url: joinUrl
        })

        return res.status(200).json({
            data: joinUrl,
            message: "Video invite sent successfully"
        })
    } catch (error) {
        next(error)
    }
}

export {
    getOrders,
    getOrderById,
    createStreamChatChannel,
    sendVideoInvite
}