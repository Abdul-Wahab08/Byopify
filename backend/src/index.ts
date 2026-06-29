import express from "express";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import { clerkWebhooksHandler } from "./webhooks/clerk";

const app = express();
app.use(clerkMiddleware());
const raw = express.raw({type: 'application/json'});

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post('/api/webhooks', raw, (req, res)=>{
    clerkWebhooksHandler(req, res);
})

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});