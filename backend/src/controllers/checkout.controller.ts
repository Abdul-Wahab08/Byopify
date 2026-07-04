import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import z from "zod";
import { getLoggedInUser } from "../lib/user";
import { db } from "../db";
import { CheckoutSessionLine, checkoutSessions, products } from "../db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { createCheckout } from "../lib/createCheckout";

const cartSchema = z.object({
    items: z
        .array(
            z.object({
                productId: z.uuid(),
                quantity: z.number().int().positive(),
            }),
        )
        .min(1),
});

export async function checkoutController(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, isAuthenticated } = getAuth(req)

        if (!isAuthenticated || !userId) {
            return res.status(401).json({
                data: null,
                message: "Unauthorized",
            });
        }

        const parsedCart = cartSchema.safeParse(req.body)

        if (!parsedCart.success) {
            return res.status(400).json({
                data: null,
                message: "Invalid cart",
            });
        }

        const user = await getLoggedInUser(userId)

        if (!user) {
            return res.status(404).json({
                data: null,
                message: "User not found",
            });
        }

        const ids = parsedCart.data.items.map(item => item.productId)

        const checkoutProducts = await db
            .select()
            .from(products)
            .where(and(inArray(products.id, ids), eq(products.active, true)));

        if (checkoutProducts.length !== ids.length) {
            return res.status(400).json({
                data: null,
                message: "One or more products are invalid",
            });
        }

        const byId = new Map(checkoutProducts.map((p) => [p.id, p]));
        let totalCents: number = 0;
        const lines: CheckoutSessionLine[] = [];

        for (const line of parsedCart.data.items) {
            const p = byId.get(line.productId)!;
            totalCents += p.priceCents * line.quantity;
            lines.push({
                productId: p.id,
                quantity: line.quantity,
                unitPriceCents: p.priceCents,
            });

            if (totalCents < 10) {
                return res.status(400).json({
                    data: null,
                    message: "otal below Polar minimum (e.g. USD requires at least 10 cents)",
                })
            }
        }

        const [checkoutSession] = await db
            .insert(checkoutSessions)
            .values({
                userId: user.id,
                lines,
                currency: "usd",
                totalCents,
            })
            .returning();

        const frontendUrl = process.env.FRONTEND_URL!;
        const polarCheckoutProductId = process.env.POLAR_CHECKOUT_PRODUCT_ID!;

        const successUrl = `${frontendUrl}/checkout/return?checkout_id={CHECKOUT_ID}`;
        const returnUrl = `${frontendUrl}/cart`;

        const checkout = await createCheckout({
            products: [polarCheckoutProductId],
            prices: {
                [polarCheckoutProductId]: [
                    {
                        amount_type: "fixed",
                        price_amount: totalCents,
                        price_currency: "usd",
                    }
                ],
            },
            successUrl,
            returnUrl,
            external_customer_id: userId,
            customer_email: user.email
        })

        await db
            .update(checkoutSessions)
            .set({
                polarCheckoutId: checkout.id
            })
            .where(eq(checkoutSessions.id, checkoutSession.id))

        return res.status(200).json({
            data: checkout.url,
            message: "Checkout created successfully",
        })

    } catch (error) {
        next(error)
    }
}