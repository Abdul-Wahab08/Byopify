import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import { clerkWebhooksHandler } from "./webhooks/clerk";
import loggedInUserRouter from "./routes/me.route";
import productsRouter from "./routes/products.route";
import streamRouter from "./routes/stream.route";
import checkoutRouter from "./routes/checkout.route";
import { polarWebhooksHandler } from "./webhooks/polar";
import * as Sentry from "@sentry/node";
import { clerkSentryMiddleware } from "./middlewares/clerkSentry.middleware";
import adminRouter from "./routes/admin.route";

const app = express();

const raw = express.raw({ type: 'application/json' });

app.post('/webhooks/clerk', raw, (req, res) => {
    clerkWebhooksHandler(req, res);
})

app.post('/webhooks/polar', raw, (req, res) => {
    polarWebhooksHandler(req, res);
})

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(clerkMiddleware());
app.use(clerkSentryMiddleware)

app.use("/api/me", loggedInUserRouter);
app.use("/api/products", productsRouter);
app.use("/api/stream", streamRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/admin", adminRouter)

Sentry.setupConnectErrorHandler(app);

app.use((_err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const sentryId = (res as express.Response & { sentry?: string }).sentry;

    res.status(500).json({
        error: "Internal server error",
        ...(sentryId !== undefined && { sentryId }),
    });
})

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});