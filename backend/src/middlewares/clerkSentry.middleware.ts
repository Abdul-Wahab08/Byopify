import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import * as Sentry from "@sentry/node";

export function clerkSentryMiddleware(req: Request, _res: Response, next: NextFunction) {
    const { userId } = getAuth(req);
    Sentry.getIsolationScope().setUser(userId ?
        { id: userId }
        :
        null);
    next();
}