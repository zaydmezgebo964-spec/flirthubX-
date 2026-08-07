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

// Serve the FlirtHubX frontend
app.use(express.static(path.join(__dirname, "public")));

// Basic health check
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        app: "FlirtHubX",
        status: "online"
    });
});

// Store active rooms in memory.
// This is the first multiplayer foundation.
// Later we will connect a real database.
const rooms = new Map();

function getRoom(roomNumber) {
    if (!rooms.has(roomNumber)) {
        rooms.set(roomNumber, {
            users: new Map()
        });
    }

    return rooms.get(roomNumber);
}

function getRoomUsers(roomNumber) {
    const room = getRoom(roomNumber);

    return Array.from(room.users.values());
}


// ============================================================
// SOCKET.IO — REAL-TIME ROOM SYSTEM
// ============================================================

io.on("connection", (socket) => {

    console.log("Player connected:", socket.id);

    let currentRoom = null;
    let currentUser = null;


    // --------------------------------------------------------
    // JOIN ROOM
    // --------------------------------------------------------

    socket.on("joinRoom", (data = {}) => {

        const requestedRoom =
            Number(data.room) || 1;

        const roomNumber =
            Math.max(1, Math.min(9999, requestedRoom));

        const room = getRoom(roomNumber);

        // Maximum 10 players per room
        if (room.users.size >= 10) {

            socket.emit("roomFull", {
                room: roomNumber
            });

            return;
        }


        // Leave previous room first
        if (currentRoom) {

            socket.leave(
                `room-${currentRoom}`
            );

            if (rooms.has(currentRoom)) {

                rooms
                    .get(currentRoom)
                    .users
                    .delete(socket.id);

            }
        }


        currentRoom = roomNumber;

        currentUser = {
            socketId: socket.id,

            id:
                String(
                    data.id ||
                    socket.id
                ),

            name:
                String(
                    data.name ||
                    "Player"
                ).slice(0, 20),

            gender:
                data.gender === "Female"
                    ? "Female"
                    : "Male",

            avatar:
                String(
                    data.avatar ||
                    ""
                ).slice(0, 500),

            online: true,

            joinedAt: Date.now()
        };


        room.users.set(
            socket.id,
            currentUser
        );

        socket.join(
            `room-${currentRoom}`
        );


        // Send room information to this player
        socket.emit("roomJoined", {

            room: currentRoom,

            users:
                getRoomUsers(
                    currentRoom
                )

        });


        // Tell everyone else
        socket.to(
            `room-${currentRoom}`
        ).emit(
            "playerJoined",
            currentUser
        );


        // Update player count
        io.to(
            `room-${currentRoom}`
        ).emit(
            "roomUsers",
            getRoomUsers(
                currentRoom
            )
        );


        console.log(
            `${currentUser.name} joined room ${currentRoom}`
        );

    });


    // --------------------------------------------------------
    // CHAT MESSAGE
    // --------------------------------------------------------

    socket.on("sendMessage", (data = {}) => {

        if (!currentRoom || !currentUser) {
            return;
        }


        const text =
            String(
                data.text || ""
            ).trim();


        if (!text) {
            return;
        }


        if (text.length > 500) {
            return;
        }


        const message = {

            id:
                `${Date.now()}-${socket.id}`,

            room:
                currentRoom,

            userId:
                currentUser.id,

            name:
                currentUser.name,

            gender:
                currentUser.gender,

            avatar:
                currentUser.avatar,

            text:
                text,

            timestamp:
                Date.now()

        };


        // Send to everyone in the same room
        io.to(
            `room-${currentRoom}`
        ).emit(
            "newMessage",
            message
        );

    });


    // --------------------------------------------------------
    // CHANGE ROOM
    // --------------------------------------------------------

    socket.on("changeRoom", (data = {}) => {

        const newRoom =
            Number(data.room);


        if (
            !Number.isInteger(newRoom) ||
            newRoom < 1
        ) {
            return;
        }


        const targetRoom =
            getRoom(newRoom);


        // Don't allow entering a full room
        if (
            targetRoom.users.size >= 10 &&
            currentRoom !== newRoom
        ) {

            socket.emit(
                "roomFull",
                {
                    room: newRoom
                }
            );

            return;
        }


        // Remove player from old room
        if (currentRoom) {

            socket.leave(
                `room-${currentRoom}`
            );


            const oldRoom =
                rooms.get(currentRoom);


            if (oldRoom) {

                oldRoom.users.delete(
                    socket.id
                );


                io.to(
                    `room-${currentRoom}`
                ).emit(
                    "playerLeft",
                    {
                        socketId:
                            socket.id
                    }
                );


                io.to(
                    `room-${currentRoom}`
                ).emit(
                    "roomUsers",
                    getRoomUsers(
                        currentRoom
                    )
                );

            }

        }


        currentRoom =
            newRoom;


        socket.join(
            `room-${currentRoom}`
        );


        if (!currentUser) {
            return;
        }


        currentUser.online = true;


        getRoom(
            currentRoom
        ).users.set(
            socket.id,
            currentUser
        );


        socket.emit(
            "roomJoined",
            {
                room:
                    currentRoom,

                users:
                    getRoomUsers(
                        currentRoom
                    )
            }
        );


        socket.to(
            `room-${currentRoom}`
        ).emit(
            "playerJoined",
            currentUser
        );


        io.to(
            `room-${currentRoom}`
        ).emit(
            "roomUsers",
            getRoomUsers(
                currentRoom
            )
        );

    });


    // --------------------------------------------------------
    // KISS REQUEST
    // --------------------------------------------------------

    socket.on("kissRequest", (data = {}) => {

        if (!currentRoom) {
            return;
        }


        const targetSocket =
            String(
                data.targetSocketId || ""
            );


        if (!targetSocket) {
            return;
        }


        io.to(
            targetSocket
        ).emit(
            "kissRequest",
            {
                fromSocketId:
                    socket.id,

                fromName:
                    currentUser
                        ? currentUser.name
                        : "Player",

                timeout:
                    10000
            }
        );

    });


    // --------------------------------------------------------
    // KISS RESPONSE
    // --------------------------------------------------------

    socket.on("kissResponse", (data = {}) => {

        const target =
            String(
                data.targetSocketId || ""
            );


        if (!target) {
            return;
        }


        io.to(
            target
        ).emit(
            "kissResponse",
            {
                accepted:
                    Boolean(
                        data.accepted
                    ),

                fromSocketId:
                    socket.id,

                fromName:
                    currentUser
                        ? currentUser.name
                        : "Player"
            }
        );

    });


    // --------------------------------------------------------
    // BLOCK PLAYER
    // --------------------------------------------------------

    socket.on("blockPlayer", (data = {}) => {

        const targetSocket =
            String(
                data.targetSocketId || ""
            );


        if (!targetSocket) {
            return;
        }


        socket.emit(
            "playerBlocked",
            {
                socketId:
                    targetSocket
            }
        );


        /*
         * The blocked player is not removed
         * from the entire room for everyone.
         *
         * The real database block list will later
         * control exactly what each person can see.
         */
    });


    // --------------------------------------------------------
    // TYPING
    // --------------------------------------------------------

    socket.on("typing", () => {

        if (!currentRoom) {
            return;
        }


        socket.to(
            `room-${currentRoom}`
        ).emit(
            "playerTyping",
            {
                socketId:
                    socket.id,

                name:
                    currentUser
                        ? currentUser.name
                        : "Player"
            }
        );

    });


    socket.on("stopTyping", () => {

        if (!currentRoom) {
            return;
        }


        socket.to(
            `room-${currentRoom}`
        ).emit(
            "playerStoppedTyping",
            {
                socketId:
                    socket.id
            }
        );

    });


    // --------------------------------------------------------
    // DISCONNECT
    // --------------------------------------------------------

    socket.on("disconnect", () => {

        console.log(
            "Player disconnected:",
            socket.id
        );


        if (!currentRoom) {
            return;
        }


        const room =
            rooms.get(
                currentRoom
            );


        if (room) {

            room.users.delete(
                socket.id
            );


            io.to(
                `room-${currentRoom}`
            ).emit(
                "playerLeft",
                {
                    socketId:
                        socket.id
                }
            );


            io.to(
                `room-${currentRoom}`
            ).emit(
                "roomUsers",
                getRoomUsers(
                    currentRoom
                )
            );


            // Remove empty rooms from memory
            if (
                room.users.size === 0
            ) {

                rooms.delete(
                    currentRoom
                );

            }

        }

    });

});


// ============================================================
// FALLBACK — SEND INDEX.HTML
// ============================================================

app.get("*", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});


// ============================================================
// START SERVER
// ============================================================

server.listen(
    PORT,
    () => {

        console.log(
            `FlirtHubX server running on port ${PORT}`
        );

    }
);
