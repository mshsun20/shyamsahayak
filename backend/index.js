import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import env from "./config/env.js";
import connectDB from "./config/dbcon.js";
import accountRouter from "./routes/account.route.js";
import chatRouter from "./routes/chat.route.js";

const allowedOrigins = {
    production: ['http://localhost:3060', 'https://shyamsahyak.shyamgroup.com'],
    quality: ['http://localhost:3061', 'https://shyamsahyak-qas.shyamgroup.com'],
    development: ['http://localhost:3062'],
}

const app = express();

// Middleware
app.use(cors({
    origin: allowedOrigins[env.nodeEnv], // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200, // For legacy browser support
}));
app.use(express.json({ limit: "10000mb" }));
app.use(express.urlencoded({ extended: true, limit: "10000mb" }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10000mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10000mb" }));

// All routes
app.use("/api/accounts", accountRouter);
app.use("/api/chats", chatRouter);

app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the Shyam Sahayak API!" });
});

(async () => {
    await connectDB();
    app.listen(env.port, () => {
        console.log(`Server is running on port ${env.port} in ${env.nodeEnv} mode`);
    });
})();