import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import { connectToSocket } from "./controllers/socketManger.js";
import userRoutes from "./routes/users.routes.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 5000);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

app.get("/home", (req, res) => {
    return res.json({ hello: "world" });
});

const start = async () => {
  await connectDB();

  server.listen(app.get("port"), () => {
    console.log(`LISTENING ON PORT ${app.get("port")}`);
  });
};

start();