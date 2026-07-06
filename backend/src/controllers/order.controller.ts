import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { getLoggedInUser } from "../lib/user";
import { orderItems, orders, products } from "../db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { isStaff } from "../lib/roles";

async function getOrders(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, isAuthenticated } = getAuth(req)

        if (!isAuthenticated) {
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
                .where(eq(orders.userId, userId))
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

        if (!isAuthenticated) {
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

        if (!isStaff(user.role) && order.userId !== userId) {
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

export {
    getOrders,
    getOrderById,
}