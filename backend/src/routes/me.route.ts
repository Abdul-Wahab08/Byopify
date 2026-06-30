import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response, Router } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, isAuthenticated } = getAuth(req)

        if (!isAuthenticated || !userId) return res.status(401).json({
            data: null,
            message: "Unauthorized",
        });

        const user = await db
            .select()
            .from(users)
            .where(eq(users.clerkUserId, userId))
            .limit(1)

        return res.status(200).json({
            data: user,
            message: "Logged in user's details fetched successfully",
        });

    } catch (error) {
        next(error)
    }
})

export default router