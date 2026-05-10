import { Server } from "socket.io";

const connections = {};
const messages = {};
const DEBUG_RTC = process.env.DEBUG_RTC === "true";
const slog = (...args) => {
  if (DEBUG_RTC) console.log("[Confeera:socket]", ...args);
};

const findRoomBySocketId = (socketId) =>
  Object.keys(connections).find((room) => connections[room]?.includes(socketId));

const normalizeRoom = (roomPath) => String(roomPath || "").trim();

const removeSocketFromRoom = (io, socket, room) => {
  if (!room || !connections[room]) return;

  connections[room] = connections[room].filter((participantId) => participantId !== socket.id);
  socket.leave(room);

  socket.to(room).emit("user-left", socket.id);
  slog("room:left", { room, socketId: socket.id, remaining: connections[room] });

  if (connections[room].length === 0) {
    delete connections[room];
    delete messages[room];
  }
};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    slog("socket:connect", socket.id);

    socket.on("join-call", (roomPath) => {
      const room = normalizeRoom(roomPath);
      if (!room) return;

      if (socket.data.room && socket.data.room !== room) {
        removeSocketFromRoom(io, socket, socket.data.room);
      }

      if (!connections[room]) {
        connections[room] = [];
      }

      const existingClients = connections[room].filter((participantId) => participantId !== socket.id);

      if (!connections[room].includes(socket.id)) {
        connections[room].push(socket.id);
      }

      socket.data.room = room;
      socket.join(room);

      slog("room:join", { room, socketId: socket.id, existingClients, clients: connections[room] });

      socket.emit("room-users", {
        room,
        socketId: socket.id,
        clients: connections[room],
        existingClients,
      });

      socket.to(room).emit("user-joined", socket.id, connections[room]);

      if (messages[room]?.length) {
        messages[room].forEach((item) => {
          io.to(socket.id).emit("chat-message", item);
        });
      }
    });

    socket.on("signal", (toId, message) => {
      if (!toId || !message) return;
      slog("signal:relay", { from: socket.id, to: toId });
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (payload, legacySender) => {
      const room = findRoomBySocketId(socket.id);
      if (!room) return;

      if (!messages[room]) {
        messages[room] = [];
      }

      const message =
        typeof payload === "object" && payload !== null
          ? payload
          : { data: payload, sender: legacySender };

      const item = {
        id: message.id || `${socket.id}-${Date.now()}`,
        sender: message.sender || "Anonymous",
        data: String(message.data || ""),
        socketIdSender: socket.id,
        at: message.at || new Date().toISOString(),
      };

      if (!item.data.trim()) return;

      messages[room].push(item);
      slog("chat:message", { room, id: item.id, from: socket.id });

      io.to(room).emit("chat-message", item);
    });

    socket.on("disconnect", () => {
      const room = findRoomBySocketId(socket.id);
      slog("socket:disconnect", { socketId: socket.id, room });
      if (!room) return;
      removeSocketFromRoom(io, socket, room);
    });
  });

  return io;
};
