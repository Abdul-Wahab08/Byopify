import { verifyWebhook } from "@clerk/backend/webhooks";
import { Request, Response } from "express";
import { db } from "../db/index";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { parseRole } from "../lib/roles";

export async function clerkWebhooksHandler(req: Request, res: Response) {
    try {
        const payload = req.body instanceof Buffer ? req.body.toString("utf8") : String(req.body);

        const request = new Request("http://internal/webhooks/clerk", {
            method: "POST",
            headers: new Headers(req.headers as HeadersInit),
            body: payload
        });

        const event = await verifyWebhook(request, { signingSecret: process.env.CLERK_WEBHOOK_SECRET });

        if (event.type === "user.created" || event.type === "user.updated") {
            const user = event.data

            const email = user.email_addresses?.find(address => address.id === user.primary_email_address_id)?.email_address ??
                user.email_addresses[0]?.email_address

            const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "User";

            const role = parseRole(user.public_metadata?.role);
            console.log("Role: ", role, "Email: ", email, "FullName: ", fullName, "UserId: ", user.id)

            await db
                .insert(users)
                .values({
                    clerkUserId: user.id,
                    email,
                    fullName,
                    role
                }).onConflictDoUpdate({
                    target: users.clerkUserId,
                    set: {
                        email,
                        fullName,
                        role,
                        updatedAt: new Date()
                    }
                });
        }

        if (event.type === "user.deleted") {
            const id = event.data.id
            if (id) {
                await db
                    .delete(users)
                    .where(eq(users.clerkUserId, id));
            }
        }

        res.json({ ok: true });

    } catch (error) {
        console.error("Clerk webhook error ", error);
        res.status(400).json({ ok: false });
    }
}