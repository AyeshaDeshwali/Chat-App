const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messagesRoutes");
const socket = require("socket.io");

require("dotenv").config();

// CORS configuration for both frontend URLs
app.use(
  cors({
    origin: [
      "http://localhost:3000", // For local development
      "https://connectzone.vercel.app", // For your deployed frontend
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const server = app.listen(process.env.PORT, () => {
  console.log(`server is started on Port ${process.env.PORT}`);
});

// socket.io with updated CORS
const io = socket(server, {
  cors: {
    origin: [
      "http://localhost:3000", // For local development
      "https://connectzone.vercel.app", // For your deployed frontend
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Handling socket.io connections
global.onlineUsers = new Map();
io.on("connection", (socket) => {
  console.log("New user connected");

  // Storing online user
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`${userId} is online`);
  });

  // Sending messages
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.message);
    }
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("User disconnected");
    global.onlineUsers.delete(socket.id);
  });
});
