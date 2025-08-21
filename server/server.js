const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");

// ---------- Config Variables ----------
const PORT = 3000;
const MONGO_URI =
  "mongodb+srv://chatapp-90:8169576470@cluster0.biywaf7.mongodb.net/";   //--change ur db link
const JWT_SECRET = "super-strong-secret-key";

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
});

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// ---------- MongoDB Connection ----------
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    server.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });


  app.get("/messages/unread/:userId", async (req, res) => {
  const userId = req.params.userId;
  const count = await Message.countDocuments({ senderId: userId, recipientId: req.user._id, read: false });
  res.json({ count });
});
// ---------- Schemas & Models ----------
const userSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    online: { type: Boolean, default: false },
  },
  { timestamps: true }
);
userSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model("User", userSchema);

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: { type: String, index: true },
    content: { type: String, trim: true },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
messageSchema.index({ senderId: 1, recipientId: 1, timestamp: -1 });
messageSchema.index({ recipientId: 1, senderId: 1, timestamp: -1 });
messageSchema.pre("save", function (next) {
  if (this.senderId && this.recipientId) {
    this.conversationId = getRoomName(this.senderId, this.recipientId);
  }
  next();
});
const Message = mongoose.model("Message", messageSchema);

// ---------- Utils ----------
const getRoomName = (id1, id2) => [String(id1), String(id2)].sort().join("-");

// ---------- Auth Middleware ----------
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ---------- Routes ----------
app.get("/health", (_req, res) => res.json({ ok: true }));

// register
app.post("/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        online: user.online,
      },
    });
  } catch (err) {
    console.error("register error", err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// ---------- Protected Routes ----------

// get all users (except self)
app.get("/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password"
    );
    res.json(users);
  } catch (err) {
    console.error("get users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// get messages for a conversation with a specific user
app.get(
  "/conversations/:recipientId/messages",
  authMiddleware,
  async (req, res) => {
    try {
      const { recipientId } = req.params;
      const room = getRoomName(req.user._id, recipientId);
      const messages = await Message.find({ conversationId: room })
        .sort({ createdAt: 1 })
        .populate("senderId", "username email")
        .populate("recipientId", "username email");

      res.json(messages);
    } catch (err) {
      console.error("get conversation messages error:", err);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  }
);
app.post("/messages/send", authMiddleware, async (req, res) => {
  const { recipientId, text } = req.body;
  const room = getRoomName(req.user._id, recipientId);

  const message = await Message.create({
    conversationId: room,
    senderId: req.user._id,
    recipientId,
    text,
  });

  res.json(message);
});

// login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        online: user.online,
      },
    });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

/** ---------- Socket Authentication ---------- **/
io.use(async (socket, next) => {
  try {
    const raw =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    const token = raw?.startsWith("Bearer ") ? raw.split(" ")[1] : raw;
    if (!token) return next(new Error("Authentication error: no token"));

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return next(new Error("Authentication error: user not found"));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

/** ---------- Socket Events ---------- **/
// Global user socket tracking
const onlineUsers = {}; // userId -> Set of socketIds

io.on("connection", async (socket) => {
  const userId = socket.user._id.toString();

  // Track online users
  if (!onlineUsers[userId]) onlineUsers[userId] = new Set();
  onlineUsers[userId].add(socket.id);

  if (onlineUsers[userId].size === 1) {
    io.emit("user:status", { userId, online: true, lastSeen: null });
    await User.findByIdAndUpdate(userId, { online: true });
  }

  console.log(`User ${userId} connected. Sockets: ${onlineUsers[userId].size}`);

  // Join conversation rooms
  socket.on("join", ({ recipientId }) => {
    if (!recipientId) return;
    const room = getRoomName(userId, recipientId);
    socket.join(room);
  });

  // Send message
  socket.on("message:send", async (message) => {
    try {
      const { recipientId, content, replyTo } = message;
      if (!recipientId || !content) return;

      const newMessage = new Message({
        senderId: userId,
        recipientId,
        content,
        replyTo: replyTo || null,
        status: "sent", // initial status
      });

      await newMessage.save();

      const room = getRoomName(userId, recipientId);
      io.to(room).emit("message:new", newMessage);

      // Mark as delivered if recipient online
      if (onlineUsers[recipientId] && onlineUsers[recipientId].size > 0) {
        newMessage.status = "delivered";
        await newMessage.save();
        io.to(room).emit("message:status", { messageId: newMessage._id, status: "delivered" });
      }

    } catch (err) {
      console.error("message:send error:", err.message);
    }
  });

  // Mark messages as read
  socket.on("messages:read", async ({ senderId }) => {
    try {
      const unreadMessages = await Message.find({
        senderId,
        recipientId: userId,
        status: { $in: ["sent", "delivered"] },
      });

      for (let msg of unreadMessages) {
        msg.status = "read";
        await msg.save();

        const room = getRoomName(userId, senderId);
        io.to(room).emit("message:status", { messageId: msg._id, status: "read" });
      }
    } catch (err) {
      console.error("messages:read error:", err.message);
    }
  });

  // Typing indicators
  socket.on("typing:start", ({ recipientId }) => {
    if (!recipientId) return;
    const room = getRoomName(userId, recipientId);
    io.to(room).emit("typing:start", { userId });
  });

  socket.on("typing:stop", ({ recipientId }) => {
    if (!recipientId) return;
    const room = getRoomName(userId, recipientId);
    io.to(room).emit("typing:stop", { userId });
  });

  // Disconnect
  socket.on("disconnect", async () => {
    onlineUsers[userId].delete(socket.id);
    if (onlineUsers[userId].size === 0) {
      io.emit("user:status", { userId, online: false, lastSeen: new Date() });
      await User.findByIdAndUpdate(userId, { online: false });
    }
    console.log(`User ${userId} disconnected. Remaining sockets: ${onlineUsers[userId].size}`);
  });
});



/** ---------- Error Middleware ---------- **/
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ error: "Something went wrong!" });
});

/** ---------- Safety Nets ---------- **/
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});
