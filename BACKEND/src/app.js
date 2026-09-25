import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import { connectToSocket } from "./controllers/socketManger.js";
import userRoutes from "./routes/users.routes.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://conferra.onrender.com",
  "https://conferra-server.onrender.com",
];

const envOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const app = express();
const server = createServer(app);
const io = connectToSocket(server, allowedOrigins);

app.set("port", process.env.PORT || 5000);

app.use(cors(corsOptions));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

app.get("/home", (req, res) => {
    return res.json({ hello: "world" });
});

const start = async () => {
  await connectDB();

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\n[Error] Port ${app.get("port")} is already in use. Please close the process running on port ${app.get("port")} or specify a different PORT in .env.\n`
      );
      process.exit(1);
    } else {
      console.error("Server error:", err);
    }
  });

  server.listen(app.get("port"), () => {
    console.log(`LISTENING ON PORT ${app.get("port")}`);
  });
};

start();
