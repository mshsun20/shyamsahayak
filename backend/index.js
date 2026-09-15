import express from "express";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import env from "./config/env.js";
import connectDB from "./config/dbcon.js";
import authRouter from "./routes/auth.route.js";
import permissionRouter from "./routes/permission.route.js";
import apiClientRouter from "./routes/apiClient.route.js";
import accountRouter from "./routes/account.route.js";
import privilegeRouter from "./routes/privilege.route.js";
import roleRouter from "./routes/role.route.js";
import districtRouter from "./routes/location/district.route.js";
import chatRouter from "./routes/chat.route.js";


const allowedOrigins = [env.adminUrl, env.appUrl]

// path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust Apache proxy
app.set("trust proxy", 1);
// Debug route to verify IP + UA
app.get("/api/debug/ip", (req, res) => {
    res.json({
        ip: String(req.ip) === "::1" ? "127.0.0.1" : req.ip,
        ips: req.ips,
        xff: req.headers["x-forwarded-for"],
        ua: req.get("user-agent"),
        proto: req.protocol
    });
});

// Middleware
app.use(cors({
    origin: allowedOrigins, // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Accept', 'X-Requested-With', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200, // For legacy browser support
}));
app.use(express.json({ limit: "10000mb" }));
app.use(express.urlencoded({ extended: true, limit: "10000mb" }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10000mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10000mb" }));

// static routes
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// All routes
app.use("/api/auth", authRouter);
app.use("/api/permissions", permissionRouter);
app.use("/api/api-clients", apiClientRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/privileges", privilegeRouter);
app.use("/api/roles", roleRouter);
app.use("/api/districts", districtRouter);
app.use("/api/chats", chatRouter);

// UI Static Serving
if (['quality', 'production'].includes(env.nodeEnv)) {    
    // =========================
    // 2. Admin UI
    // =========================
    const adminDistPath = path.join(__dirname, "..", "admin", "dist");
    // Serve Admin static assets
    app.use( "/admin", express.static(adminDistPath));
    // Admin SPA fallback
    app.get(/^\/admin(?:\/.*)?$/, (_, res) => {
        res.sendFile(path.join(adminDistPath, "index.html"));
    });
    
    // =========================
    // 1. User UI
    // =========================
    const frontendDistPath = path.join(__dirname, "..", "frontend", "dist");
    // Serve User frontend static assets
    app.use(express.static(frontendDistPath));
    // User frontend SPA fallback
    app.get(/^\/(?!api|admin)(.*)$/, (_, res) => {
        res.sendFile(path.join(frontendDistPath, "index.html"));
    });
}

// ping
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the Shyam Sahayak API!" });
});

(async () => {
    await connectDB();
    app.listen(env.port, () => {
        console.log(`Server is running on port ${env.port} in ${env.nodeEnv} mode`);
    });
})();