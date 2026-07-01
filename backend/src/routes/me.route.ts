import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response, Router } from "express";
import { getLoggedInUser } from "../lib/user";

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, isAuthenticated } = getAuth(req)

        if (!isAuthenticated || !userId) return res.status(401).json({
            data: null,
            message: "Unauthorized",
        });

        const user = await getLoggedInUser(userId)

        if (!user) {
            return res.status(404).json({
                data: null,
                message: "User not found",
            });
        }

        return res.status(200).json({
            data: user,
            message: "Logged in user's details fetched successfully",
        });

    } catch (error) {
        next(error)
    }
})

export default router