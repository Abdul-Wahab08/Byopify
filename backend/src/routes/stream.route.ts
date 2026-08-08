import { clerkClient, getAuth } from "@clerk/express";
import { NextFunction, Request, Response, Router } from "express";
import { getLoggedInUser } from "../lib/user";
import { StreamChat } from "stream-chat";
import { streamDisplayName } from "../lib/stream";

const router = Router()

router.post("/create-token", async (req: Request, res: Response, next: NextFunction) => {
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

        const streamServer = StreamChat.getInstance(process.env.STREAM_API_KEY as string, process.env.STREAM_API_SECRET as string)

        const clerkUser = await clerkClient.users.getUser(userId)

        const displayName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || null;

        const name = streamDisplayName(user.role, displayName, user.email)
        const streamId = `clerk_${userId}`

        await streamServer.upsertUser({
            id: streamId,
            name,
            image: clerkUser.imageUrl
        })

        const token = streamServer.createToken(streamId)

        return res.status(200).json({
            data: {
                token,
                id: streamId,
                name,
                apikey: process.env.STREAM_API_KEY
            },
            message: "Token created successfully",
        })
    } catch (error) {
        next(error)
    }
})

export default router