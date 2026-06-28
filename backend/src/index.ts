import express from "express";
import cors from "cors";

const app = express();

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({ extended: true }));
app.use(cors())

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});