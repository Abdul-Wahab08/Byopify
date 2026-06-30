import express from "express";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import { clerkWebhooksHandler } from "./webhooks/clerk";
import loggedInUserRouter from "./routes/me.route";
import productsRouter from "./routes/products.route";

const app = express();

const raw = express.raw({ type: 'application/json' });

app.post('/webhooks/clerk', raw, (req, res) => {
    clerkWebhooksHandler(req, res);
})

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(clerkMiddleware());

app.use("/api/me", loggedInUserRouter);
app.use("/api/products", productsRouter);

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});