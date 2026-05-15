import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import notesRoutes from "./routes/notes.routes";
import { errorHandler, notFound } from "./middleware/error";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/peblo-notes";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Security middleware
app.use(helmet());

const allowedOrigins = [
    CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "https://peblo-notes.vercel.app",
];

const corsOptions = {
    origin: (
        origin: string | undefined,
        callback: (error: Error | null, allow?: boolean) => void,
    ) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests, please try again later.",
    },
});
app.use("/api/", limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Health check
app.get("/health", (_req, res) => {
    res.json({
        success: true,
        message: "Peblo Notes API is running",
        timestamp: new Date().toISOString(),
    });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Connect DB and start server
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1);
    });

export default app;
