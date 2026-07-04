import { Request, Response } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { checkoutSessions, orderItems, orders } from "../db/schema";
import { Webhook } from "standardwebhooks";

function headerString(headers: Request["headers"], name: string) {
    const value = headers[name];
    return Array.isArray(value) ? value[0] : value;
}

function checkoutSessionIdFromMetadata(order: Record<string, unknown>) {
    const metadata = order.metadata;
    if (!metadata || typeof metadata !== "object") return undefined;
    const sessionId = (metadata as Record<string, unknown>).checkout_session_id;
    return typeof sessionId === "string" ? sessionId : undefined;
}

async function isAlreadyPaid(polarCheckoutId?: string, polarOrderId?: string) {
    if (polarCheckoutId) {
        const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.polarCheckoutId, polarCheckoutId))
            .limit(1)

        if (order.status === "paid") return true
    }

    if (polarOrderId) {
        const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.polarOrderId, polarOrderId))
            .limit(1)

        if (order.status === "paid") return true
    }

    return false
}

async function completeCheckoutSession(checkoutSessionId: string, polarCheckoutId: string, polarOrderId: string) {
    return await db.transaction(async (tx) => {
        const [checkoutSession] = await tx
            .select()
            .from(checkoutSessions)
            .where(eq(checkoutSessions.id, checkoutSessionId))
            .for("update")

        if (!checkoutSession) return false

        const [order] = await tx
            .insert(orders)
            .values({
                userId: checkoutSession.userId,
                status: "paid",
                totalCents: checkoutSession.totalCents,
                polarCheckoutId,
                polarOrderId
            })
            .returning()

        if (checkoutSession.lines.length) {
            await tx
                .insert(orderItems)
                .values(checkoutSession.lines.map((line) => ({
                    orderId: order.id,
                    productId: line.productId,
                    quantity: line.quantity,
                    unitPriceCents: line.unitPriceCents
                })))
        }

        await tx
            .delete(checkoutSessions)
            .where(eq(checkoutSessions.id, checkoutSessionId))

        return true
    })
}

export async function polarWebhooksHandler(req: Request, res: Response) {
    try {
        const raw = req.body instanceof Buffer ? req.body : Buffer.from(String(req.body));
        const wh = new Webhook(Buffer.from(process.env.POLAR_WEBHOOKS_SECRET!, "utf8").toString("base64"));

        const id = headerString(req.headers, "webhook-id");
        const timestamp = headerString(req.headers, "webhook-timestamp");
        const signature = headerString(req.headers, "webhook-signature");

        if (!id || !timestamp || !signature) {
            res.status(400).json({ error: "Missing webhook headers" });
            return;
        }

        wh.verify(raw, {
            "webhook-id": id,
            "webhook-timestamp": timestamp,
            "webhook-signature": signature
        });

        const event = JSON.parse(raw.toString("utf-8")) as {
            type: string;
            data?: Record<string, unknown>;
        };

        if (event.type === "order.paid" && event.data) {
            const data = event.data;
            const polarOrderId = typeof data.id === "string" ? data.id : undefined;
            const checkoutId = typeof data.checkout_id === "string" ? data.checkout_id : undefined;

            if (await isAlreadyPaid(checkoutId, polarOrderId)) {
                return res.json({
                    ok: true,
                    duplicate: true
                });
            }

            const checkoutSessionId = checkoutSessionIdFromMetadata(data)

            if (checkoutSessionId) {

                const ok = await completeCheckoutSession(checkoutSessionId, checkoutId, polarOrderId)

                if (ok) {
                    return res.json({ ok: true });
                }

                if (await isAlreadyPaid(checkoutId, polarOrderId)) {
                    return res.json({
                        ok: true,
                        duplicate: true
                    });
                }

                return res.status(500).json({
                    error: "Polar order.paid: could not fulfill checkout session",
                });
            }
        }

        res.json({ ok: true });
    } catch (error) {
        console.error("Error processing Polar webhook: ", error);
        return res.status(500).json({ error: "Error processing Polar webhook" });
    }
}