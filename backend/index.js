import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import env from "./config/env.js";
import connectDB from "./config/dbcon.js";

// scoket imports
import socketAuth from "./middlewares/socketAuth.middleware.js";
import { setupSocketAuthLifecycle, clearSocketAuthLifecycle } from "./sockets/socketAuthLifecycle.js";
import { registerChatSocket } from "./sockets/chat/chat.socket.js";

// Import the AI tool bootstrap to register tools
import "./ai/tools/ai.tool.bootstrap.js";

// route imports
import authRouter from "./routes/auth.route.js";
import permissionRouter from "./routes/permission.route.js";
import apiClientRouter from "./routes/apiClient.route.js";
import accountRouter from "./routes/account.route.js";
import privilegeRouter from "./routes/privilege.route.js";
import roleRouter from "./routes/role.route.js";
import productRouter from "./routes/product.route.js";
import schemeRouter from "./routes/scheme.route.js";
import knowledgeBaseRouter from "./routes/KnowledgeBase.route.js";
import conversationRouter from "./routes/conversation.route.js";
import locationRouter from "./routes/mapping/location.route.js";




// environment origins
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
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
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
app.use("/api/products", productRouter);
app.use("/api/schemes", schemeRouter);
app.use("/api/knowledge-bases", knowledgeBaseRouter);
app.use("/api/conversations", conversationRouter);
app.use("/api/location-mapping", locationRouter);

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


// (async () => {
//     await connectDB();
//     app.listen(env.port, () => {
//         console.log(`Server is running on port ${env.port} in ${env.nodeEnv} mode`);
//     });
// })();


// HTTP Server
const httpServer = http.createServer(app);

// Socket.IO Server
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.use(socketAuth);

// Socket.IO Connection

io.on("connection", (socket) => {
    console.log("\n========== SOCKET CONNECTED ==========");
    console.log("[SOCKET] ID:", socket.id);
    console.log("[SOCKET] Auth:", socket.auth);
    console.log("[SOCKET] User:", socket.user?.userId);

    socket.onAny((eventName, ...args) => {
        console.log("[SOCKET] Incoming event:", eventName);
    });

    const userId = socket.auth?.userId;

    if (userId) {
        const userRoom = `user:${userId.toString()}`;
        socket.join(userRoom);
        console.log("[SOCKET] Joined room:", userRoom);
    }

    setupSocketAuthLifecycle(io, socket);
    registerChatSocket(io, socket);

    console.log("[CHAT] Handler registered for:", socket.id);

    socket.on("disconnect", (reason) => {
        clearSocketAuthLifecycle(socket);
        console.log("[SOCKET] Disconnected:", socket.id, reason);
    });
});


// Start Application
(async () => {
    await connectDB();
    httpServer.listen(env.port, () => {
        console.log(`Server is running on port ${env.port} in ${env.nodeEnv} mode`);
        console.log(`WebSocket is running on port ${env.port}`);
    })
})();