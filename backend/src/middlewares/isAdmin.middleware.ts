import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { getLoggedInUser } from "../lib/user";

export async function isAdminMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, isAuthenticated } = getAuth(req)

        if (!isAuthenticated || !userId) {
            return res.status(401).json({
                data: null,
                message: "Unauthorized",
            });
        }

        const user = await getLoggedInUser(userId)

        if (!user) {
            return res.status(404).json({
                data: null,
                message: "User not found",
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                data: null,
                message: "Forbidden",
            });
        }

        next();
    } catch (error) {
        next(error)
    }
}