const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the game
app.use(express.static(path.join(__dirname, "public")));

// --------------------------------------------------
// TEMPORARY GAME DATABASE
// --------------------------------------------------

const users = new Map();
const rooms = new Map();

const MAX_ROOM_USERS = 10;

// Create rooms
for (let i = 1; i <= 100; i++) {
    rooms.set(i, new Set());
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function createUser(id, data = {}) {
    return {
        id,
        name: data.name || "Player",
        age: Number(data.age) || 18,
        photo: data.photo || "",
        hearts: Number(data.hearts) || 50,
        kissPoints: Number(data.kissPoints) || 0,
        songPoints: Number(data.songPoints) || 0,

        league: data.league || "Bronze",

        online: true,
        lastSeen: Date.now(),

        streak: 0,
        streakStatus: "black",

        language: data.language || "English",

        gifts: [],
        emotions: [],

        friends: [],
        blocked: [],

        roomId: null,

        createdAt: Date.now()
    };
}

function getRoom(roomId) {
    return rooms.get(Number(roomId));
}

function findAvailableRoom() {
    for (const [id, members] of rooms.entries()) {
        if (members.size < MAX_ROOM_USERS) {
            return id;
        }
    }

    return null;
}

function publicUser(user) {
    if (!user) return null;

    return {
        id: user.id,
        name: user.name,
        age: user.age,
        photo: user.photo,

        hearts: user.hearts,
        kissPoints: user.kissPoints,
        songPoints: user.songPoints,

        league: user.league,

        online: user.online,
        lastSeen: user.lastSeen,

        streak: user.streak,
        streakStatus: user.streakStatus,

        language: user.language,

        roomId: user.roomId
    };
}

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        app: "FlirtHubX",
        status: "online"
    });
});

// --------------------------------------------------
// USER API
// --------------------------------------------------

app.post("/api/users", (req, res) => {
    const id =
        req.body.id ||
        `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (users.has(id)) {
        return res.json({
            success: true,
            user: publicUser(users.get(id))
        });
    }

    const user = createUser(id, req.body);

    users.set(id, user);

    res.json({
        success: true,
        user: publicUser(user)
    });
});

app.get("/api/users/:id", (req, res) => {
    const user = users.get(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: "User not found"
        });
    }

    res.json({
        success: true,
        user: publicUser(user)
    });
});

// --------------------------------------------------
// HEARTS
// --------------------------------------------------

app.post("/api/hearts/send", (req, res) => {
    const { fromId, toId, amount } = req.body;

    const sender = users.get(fromId);
    const receiver = users.get(toId);

    const value = Number(amount);

    if (!sender || !receiver) {
        return res.status(404).json({
            success: false,
            error: "User not found"
        });
    }

    if (!Number.isFinite(value) || value <= 0) {
        return res.status(400).json({
            success: false,
            error: "Invalid amount"
        });
    }

    if (sender.hearts < value) {
        return res.status(400).json({
            success: false,
            error: "Not enough hearts"
        });
    }

    sender.hearts -= value;
    receiver.hearts += value;

    io.to(`user:${toId}`).emit("heartsReceived", {
        from: publicUser(sender),
        amount: value
    });

    res.json({
        success: true,
        sender: publicUser(sender),
        receiver: publicUser(receiver)
    });
});

// --------------------------------------------------
// ROOMS
// --------------------------------------------------

app.get("/api/rooms", (req, res) => {
    const result = [];

    for (const [id, members] of rooms.entries()) {
        result.push({
            id,
            people: members.size,
            capacity: MAX_ROOM_USERS,
            full: members.size >= MAX_ROOM_USERS
        });
    }

    res.json({
        success: true,
        rooms: result
    });
});

app.post("/api/rooms/join", (req, res) => {
    const { userId, roomId } = req.body;

    const user = users.get(userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: "User not found"
        });
    }

    let targetRoom = roomId ? Number(roomId) : findAvailableRoom();

    if (!rooms.has(targetRoom)) {
        return res.status(404).json({
            success: false,
            error: "Room does not exist"
        });
    }

    const room = rooms.get(targetRoom);

    if (room.size >= MAX_ROOM_USERS) {
        return res.status(409).json({
            success: false,
            error: "Room is full"
        });
    }

    // Leave previous room
    if (user.roomId && rooms.has(user.roomId)) {
        rooms.get(user.roomId).delete(userId);
    }

    room.add(userId);
    user.roomId = targetRoom;

    res.json({
        success: true,
        roomId: targetRoom,
        user: publicUser(user)
    });
});

app.post("/api/rooms/leave", (req, res) => {
    const { userId } = req.body;

    const user = users.get(userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: "User not found"
        });
    }

    if (user.roomId && rooms.has(user.roomId)) {
        rooms.get(user.roomId).delete(userId);
    }

    user.roomId = null;

    res.json({
        success: true
    });
});

// --------------------------------------------------
// ONLINE / LAST SEEN
// --------------------------------------------------

app.get("/api/users/:id/status", (req, res) => {
    const user = users.get(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false
        });
    }

    res.json({
        success: true,
        online: user.online,
        lastSeen: user.lastSeen
    });
});

// --------------------------------------------------
// SOCKET.IO REAL-TIME CHAT
// --------------------------------------------------

io.on("connection", (socket) => {

    console.log("Connected:", socket.id);

    socket.on("register", (userId) => {

        if (!userId) return;

        let user = users.get(userId);

        if (!user) {
            user = createUser(userId);
            users.set(userId, user);
        }

        user.online = true;
        user.lastSeen = Date.now();

        socket.userId = userId;

        socket.join(`user:${userId}`);

        io.emit("userStatus", {
            userId,
            online: true,
            lastSeen: user.lastSeen
        });
    });

    // ------------------------------------------------
    // JOIN ROOM
    // ------------------------------------------------

    socket.on("joinRoom", (roomId) => {

        if (!socket.userId) return;

        const user = users.get(socket.userId);
        const id = Number(roomId);

        if (!rooms.has(id)) return;

        const room = rooms.get(id);

        if (room.size >= MAX_ROOM_USERS) {
            socket.emit("roomFull", {
                roomId: id
            });
            return;
        }

        if (user.roomId && rooms.has(user.roomId)) {
            rooms.get(user.roomId).delete(socket.userId);
            socket.leave(`room:${user.roomId}`);
        }

        room.add(socket.userId);

        user.roomId = id;

        socket.join(`room:${id}`);

        io.to(`room:${id}`).emit("roomUsers", {
            roomId: id,
            users: [...room]
                .map(id => publicUser(users.get(id)))
                .filter(Boolean)
        });
    });

    // ------------------------------------------------
    // CHAT MESSAGE
    // ------------------------------------------------

    socket.on("message", (data) => {

        if (!socket.userId) return;

        const user = users.get(socket.userId);

        if (!user) return;

        const message = {
            id: Date.now(),
            senderId: socket.userId,
            senderName: user.name,
            text: String(data.text || "").slice(0, 2000),
            time: Date.now()
        };

        if (user.roomId) {
            io.to(`room:${user.roomId}`).emit("message", message);
        }
    });

    // ------------------------------------------------
    // TYPING
    // ------------------------------------------------

    socket.on("typing", () => {

        const user = users.get(socket.userId);

        if (!user || !user.roomId) return;

        socket.to(`room:${user.roomId}`).emit("typing", {
            userId: socket.userId,
            name: user.name
        });
    });

    // ------------------------------------------------
    // DISCONNECT
    // ------------------------------------------------

    socket.on("disconnect", () => {

        if (!socket.userId) return;

        const user = users.get(socket.userId);

        if (!user) return;

        user.online = false;
        user.lastSeen = Date.now();

        io.emit("userStatus", {
            userId: socket.userId,
            online: false,
            lastSeen: user.lastSeen
        });

        console.log("Disconnected:", socket.userId);
    });
});

// --------------------------------------------------
// STREAK CHECK
// --------------------------------------------------

setInterval(() => {

    const now = Date.now();

    for (const user of users.values()) {

        if (user.streak > 0) {

            const hours =
                (now - user.lastSeen) / (1000 * 60 * 60);

            if (hours >= 24) {
                user.streakStatus = "black";
            }
        }
    }

}, 60 * 1000);

// --------------------------------------------------
// LEAGUE CALCULATION
// --------------------------------------------------

function getLeague(kissPoints) {

    if (kissPoints >= 10000) return "Diamond";
    if (kissPoints >= 5000) return "Platinum";
    if (kissPoints >= 2500) return "Gold";
    if (kissPoints >= 1000) return "Silver";

    return "Bronze";
}

app.post("/api/kiss/points", (req, res) => {

    const { userId, points } = req.body;

    const user = users.get(userId);

    if (!user) {
        return res.status(404).json({
            success: false
        });
    }

    const value = Math.max(0, Number(points) || 0);

    user.kissPoints += value;
    user.league = getLeague(user.kissPoints);

    res.json({
        success: true,
        kissPoints: user.kissPoints,
        league: user.league
    });
});

// --------------------------------------------------
// GIFT
// --------------------------------------------------

app.post("/api/gifts/send", (req, res) => {

    const { fromId, toId, gift } = req.body;

    const sender = users.get(fromId);
    const receiver = users.get(toId);

    if (!sender || !receiver) {
        return res.status(404).json({
            success: false
        });
    }

    receiver.gifts.push({
        fromId,
        gift,
        time: Date.now()
    });

    io.to(`user:${toId}`).emit("giftReceived", {
        from: publicUser(sender),
        gift
    });

    res.json({
        success: true
    });
});

// --------------------------------------------------
// TRANSLATION PLACEHOLDER
// --------------------------------------------------

// The real translation service will be connected in the final
// production setup. The game can support:
//
// English
// Arabic
// Russian
// Turkish
// Uzbek
//
// and additional languages later.

app.post("/api/translate", async (req, res) => {

    const { text, targetLanguage } = req.body;

    if (!text) {
        return res.status(400).json({
            success: false,
            error: "Text required"
        });
    }

    // Temporary response.
    // Part 5 will connect the real translation service.

    res.json({
        success: true,
        original: text,
        translated: text,
        targetLanguage: targetLanguage || "English"
    });
});

// --------------------------------------------------
// SPA FALLBACK
// --------------------------------------------------

app.get("*", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

server.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("FlirtHubX server started");
    console.log(`Port: ${PORT}`);
    console.log("--------------------------------");
});
