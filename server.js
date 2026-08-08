// ============================================================
// FLIRTHUBX — SERVER.JS
// ============================================================

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ============================================================
// FRONTEND
// ============================================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ============================================================
// STATUS
// ============================================================

app.get("/api/status", (req, res) => {

    res.json({
        success: true,
        app: "FlirtHubX",
        status: "online",
        multiplayer: true
    });

});


// ============================================================
// ROOMS
// ============================================================

const rooms = new Map();

const MAX_PLAYERS_PER_ROOM = 10;
const MAX_ROOM_NUMBER = 9999;


function getRoom(roomNumber) {

    if (!rooms.has(roomNumber)) {

        rooms.set(roomNumber, {
            users: new Map()
        });

    }

    return rooms.get(roomNumber);

}


function getRoomUsers(roomNumber) {

    const room = rooms.get(roomNumber);

    if (!room) {
        return [];
    }

    return Array.from(
        room.users.values()
    );

}


function deleteEmptyRoom(roomNumber) {

    const room = rooms.get(roomNumber);

    if (
        room &&
        room.users.size === 0
    ) {

        rooms.delete(roomNumber);

    }

}


// ============================================================
// SOCKET.IO
// ============================================================

io.on("connection", (socket) => {

    console.log(
        "Player connected:",
        socket.id
    );


    let currentRoom = null;
    let currentUser = null;


    // ========================================================
    // JOIN ROOM
    // ========================================================

    socket.on("joinRoom", (data = {}) => {

        let roomNumber =
            Number(data.room) || 1;

        roomNumber =
            Math.max(
                1,
                Math.min(
                    MAX_ROOM_NUMBER,
                    roomNumber
                )
            );


        const room =
            getRoom(roomNumber);


        // ----------------------------------------------------
        // ROOM FULL
        // ----------------------------------------------------

        if (
            room.users.size >=
            MAX_PLAYERS_PER_ROOM
        ) {

            socket.emit(
                "roomFull",
                {
                    room: roomNumber
                }
            );

            return;
        }


        // ----------------------------------------------------
        // REMOVE FROM OLD ROOM
        // ----------------------------------------------------

        if (currentRoom) {

            leaveCurrentRoom();

        }


        // ----------------------------------------------------
        // CREATE PLAYER
        // ----------------------------------------------------

        currentRoom =
            roomNumber;


        currentUser = {

            socketId:
                socket.id,

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

            online:
                true,

            joinedAt:
                Date.now()

        };


        room.users.set(
            socket.id,
            currentUser
        );


        socket.join(
            `room-${currentRoom}`
        );


        // ----------------------------------------------------
        // SEND ROOM TO PLAYER
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // TELL OTHER PLAYERS
        // ----------------------------------------------------

        socket
            .to(`room-${currentRoom}`)
            .emit(
                "playerJoined",
                currentUser
            );


        // ----------------------------------------------------
        // UPDATE ROOM USERS
        // ----------------------------------------------------

        io
            .to(`room-${currentRoom}`)
            .emit(
                "roomUsers",
                getRoomUsers(
                    currentRoom
                )
            );


        console.log(
            `${currentUser.name} joined room ${currentRoom}`
        );

    });


    // ========================================================
    // CHAT MESSAGE
    // ========================================================

    socket.on(
        "sendMessage",
        (data = {}) => {

            if (
                !currentRoom ||
                !currentUser
            ) {
                return;
            }


            let text =
                String(
                    data.text || ""
                ).trim();


            if (!text) {
                return;
            }


            // Maximum message length
            if (text.length > 500) {

                text =
                    text.slice(0, 500);

            }


            const message = {

                id:
                    `${Date.now()}-${socket.id}`,

                room:
                    currentRoom,

                userId:
                    currentUser.id,

                socketId:
                    socket.id,

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


            // Send to everyone in the room
            io
                .to(`room-${currentRoom}`)
                .emit(
                    "newMessage",
                    message
                );

        }
    );


    // ========================================================
    // CHANGE ROOM
    // ========================================================

    socket.on(
        "changeRoom",
        (data = {}) => {

            if (!currentUser) {
                return;
            }


            let newRoom =
                Number(data.room);


            if (
                !Number.isInteger(
                    newRoom
                )
            ) {
                return;
            }


            newRoom =
                Math.max(
                    1,
                    Math.min(
                        MAX_ROOM_NUMBER,
                        newRoom
                    )
                );


            if (
                newRoom ===
                currentRoom
            ) {
                return;
            }


            const targetRoom =
                getRoom(newRoom);


            // ------------------------------------------------
            // TARGET ROOM FULL
            // ------------------------------------------------

            if (
                targetRoom.users.size >=
                MAX_PLAYERS_PER_ROOM
            ) {

                socket.emit(
                    "roomFull",
                    {
                        room:
                            newRoom
                    }
                );

                return;
            }


            // ------------------------------------------------
            // LEAVE OLD ROOM
            // ------------------------------------------------

            leaveCurrentRoom();


            // ------------------------------------------------
            // JOIN NEW ROOM
            // ------------------------------------------------

            currentRoom =
                newRoom;


            socket.join(
                `room-${currentRoom}`
            );


            currentUser.online =
                true;


            const newRoomData =
                getRoom(
                    currentRoom
                );


            newRoomData.users.set(
                socket.id,
                currentUser
            );


            // ------------------------------------------------
            // SEND NEW ROOM
            // ------------------------------------------------

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


            // ------------------------------------------------
            // TELL OTHER PLAYERS
            // ------------------------------------------------

            socket
                .to(`room-${currentRoom}`)
                .emit(
                    "playerJoined",
                    currentUser
                );


            io
                .to(`room-${currentRoom}`)
                .emit(
                    "roomUsers",
                    getRoomUsers(
                        currentRoom
                    )
                );


            console.log(
                `${currentUser.name} moved to room ${currentRoom}`
            );

        }
    );


    // ========================================================
    // KISS REQUEST
    // ========================================================

    socket.on(
        "kissRequest",
        (data = {}) => {

            if (
                !currentRoom ||
                !currentUser
            ) {
                return;
            }


            const targetSocket =
                String(
                    data.targetSocketId ||
                    ""
                );


            if (!targetSocket) {
                return;
            }


            // Make sure target is actually
            // inside the same room.

            const room =
                rooms.get(
                    currentRoom
                );


            if (
                !room ||
                !room.users.has(
                    targetSocket
                )
            ) {
                return;
            }


            io
                .to(targetSocket)
                .emit(
                    "kissRequest",
                    {

                        fromSocketId:
                            socket.id,

                        fromName:
                            currentUser.name,

                        timeout:
                            10000

                    }
                );

        }
    );


    // ========================================================
    // KISS RESPONSE
    // ========================================================

    socket.on(
        "kissResponse",
        (data = {}) => {

            const targetSocket =
                String(
                    data.targetSocketId ||
                    ""
                );


            if (!targetSocket) {
                return;
            }


            io
                .to(targetSocket)
                .emit(
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

        }
    );


    // ========================================================
    // BLOCK PLAYER
    // ========================================================

    socket.on(
        "blockPlayer",
        (data = {}) => {

            const targetSocket =
                String(
                    data.targetSocketId ||
                    ""
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

        }
    );


    // ========================================================
    // TYPING
    // ========================================================

    socket.on(
        "typing",
        () => {

            if (!currentRoom) {
                return;
            }


            socket
                .to(`room-${currentRoom}`)
                .emit(
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

        }
    );


    socket.on(
        "stopTyping",
        () => {

            if (!currentRoom) {
                return;
            }


            socket
                .to(`room-${currentRoom}`)
                .emit(
                    "playerStoppedTyping",
                    {

                        socketId:
                            socket.id

                    }
                );

        }
    );


    // ========================================================
    // PLAYER PROFILE UPDATE
    // ========================================================

    socket.on(
        "updateProfile",
        (data = {}) => {

            if (
                !currentUser ||
                !currentRoom
            ) {
                return;
            }


            if (
                typeof data.name ===
                "string"
            ) {

                currentUser.name =
                    data.name
                        .trim()
                        .slice(0, 20);

            }


            if (
                data.gender ===
                "Male" ||
                data.gender ===
                "Female"
            ) {

                currentUser.gender =
                    data.gender;

            }


            if (
                typeof data.avatar ===
                "string"
            ) {

                currentUser.avatar =
                    data.avatar.slice(
                        0,
                        500
                    );

            }


            const room =
                rooms.get(
                    currentRoom
                );


            if (room) {

                room.users.set(
                    socket.id,
                    currentUser
                );

            }


            io
                .to(`room-${currentRoom}`)
                .emit(
                    "roomUsers",
                    getRoomUsers(
                        currentRoom
                    )
                );

        }
    );


    // ========================================================
    // LEAVE ROOM HELPER
    // ========================================================

    function leaveCurrentRoom() {

        if (!currentRoom) {
            return;
        }


        const oldRoomNumber =
            currentRoom;


        const oldRoom =
            rooms.get(
                oldRoomNumber
            );


        socket.leave(
            `room-${oldRoomNumber}`
        );


        if (oldRoom) {

            oldRoom.users.delete(
                socket.id
            );


            io
                .to(`room-${oldRoomNumber}`)
                .emit(
                    "playerLeft",
                    {

                        socketId:
                            socket.id

                    }
                );


            io
                .to(`room-${oldRoomNumber}`)
                .emit(
                    "roomUsers",
                    getRoomUsers(
                        oldRoomNumber
                    )
                );


            deleteEmptyRoom(
                oldRoomNumber
            );

        }


        currentRoom =
            null;

    }


    // ========================================================
    // DISCONNECT
    // ========================================================

    socket.on(
        "disconnect",
        () => {

            console.log(
                "Player disconnected:",
                socket.id
            );


            leaveCurrentRoom();

        }
    );

});


// ============================================================
// FALLBACK
// ============================================================

app.get(
    "*",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);


// ============================================================
// START SERVER
// ============================================================

server.listen(
    PORT,
    () => {

        console.log(
            "================================="
        );

        console.log(
            "       FLIRTHUBX SERVER"
        );

        console.log(
            "================================="
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Rooms: 1-${MAX_ROOM_NUMBER}`
        );

        console.log(
            `Players per room: ${MAX_PLAYERS_PER_ROOM}`
        );

        console.log(
            "Multiplayer: ENABLED"
        );

        console.log(
            "================================="
        );

    }
);
