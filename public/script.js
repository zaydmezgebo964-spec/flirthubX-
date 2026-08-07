/* =========================================================
   FLIRTHUBX — MAIN GAME SCRIPT
========================================================= */

const state = {
    profileCreated: false,

    name: "",
    age: 18,
    gender: "",
    avatar: "",

    hearts: 50,
    money: 10,
    kissPoints: 0,
    songPoints: 0,

    room: 1,
    streak: 0,

    selectedGender: "",
    selectedAvatar: "",

    premium: false,

    messages: [],

    roomMembers: [
        {
            id: 1,
            name: "Alex",
            gender: "Male",
            avatar: "https://i.pravatar.cc/150?img=12",
            online: true
        },
        {
            id: 2,
            name: "Mia",
            gender: "Female",
            avatar: "https://i.pravatar.cc/150?img=47",
            online: true
        },
        {
            id: 3,
            name: "Daniel",
            gender: "Male",
            avatar: "https://i.pravatar.cc/150?img=11",
            online: true
        },
        {
            id: 4,
            name: "Lina",
            gender: "Female",
            avatar: "https://i.pravatar.cc/150?img=44",
            online: false
        }
    ]
};


/* =========================================================
   STORAGE
========================================================= */

function saveState() {
    localStorage.setItem(
        "flirthubx_state",
        JSON.stringify(state)
    );
}


function loadState() {

    const saved = localStorage.getItem(
        "flirthubx_state"
    );

    if (!saved) {
        return false;
    }

    try {

        const data = JSON.parse(saved);

        Object.assign(state, data);

        return true;

    } catch (error) {

        console.error(
            "Could not load FlirtHubX data:",
            error
        );

        return false;
    }
}


/* =========================================================
   SCREEN HELPERS
========================================================= */

function hideAllScreens() {

    const screens = [
        "loadingScreen",
        "startScreen",
        "profileScreen",
        "avatarScreen",
        "homeScreen",
        "accountScreen"
    ];

    screens.forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.classList.add("hidden");
        }

    });
}


function showScreen(id) {

    hideAllScreens();

    const element = document.getElementById(id);

    if (element) {
        element.classList.remove("hidden");
    }
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const existingAccount = loadState();

        /*
         * If the player already created an account,
         * the next time they open the game they go
         * through loading and then directly to Home.
         */

        setTimeout(() => {

            const loading =
                document.getElementById(
                    "loadingScreen"
                );

            if (loading) {
                loading.classList.add("hidden");
            }

            if (
                existingAccount &&
                state.profileCreated &&
                state.name
            ) {

                updateAccountUI();

                showScreen("homeScreen");

                renderRoom();

            } else {

                showScreen("startScreen");

            }

        }, 1800);

    }
);


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    showScreen("profileScreen");

}


/* =========================================================
   PROFILE
========================================================= */

function backToStart() {

    showScreen("startScreen");

}


function backToProfile() {

    showScreen("profileScreen");

}


function selectGender(button, gender) {

    state.selectedGender = gender;

    document
        .querySelectorAll(".gender-option")
        .forEach(option => {

            option.classList.remove(
                "selected"
            );

        });

    button.classList.add("selected");

}


function continueToAvatar() {

    const nameInput =
        document.getElementById("playerName");

    const ageInput =
        document.getElementById("playerAge");

    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    const age =
        ageInput
            ? Number(ageInput.value)
            : 0;


    if (!name) {

        alert("Please enter your name.");

        return;
    }


    if (!age || age < 18) {

        alert(
            "You must be 18 or older to use FlirtHubX."
        );

        return;
    }


    if (!state.selectedGender) {

        alert("Please select your gender.");

        return;
    }


    state.name = name;
    state.age = age;
    state.gender =
        state.selectedGender;


    showScreen("avatarScreen");

}


/* =========================================================
   AVATAR
========================================================= */

function selectAvatar(button, avatar) {

    state.selectedAvatar = avatar;

    document
        .querySelectorAll(".avatar-option")
        .forEach(option => {

            option.classList.remove(
                "selected"
            );

        });

    button.classList.add("selected");

}


function finishProfile() {

    if (!state.selectedAvatar) {

        alert("Please choose an avatar.");

        return;
    }


    state.avatar =
        state.selectedAvatar;

    state.profileCreated = true;

    saveState();

    updateAccountUI();

    renderRoom();

    showScreen("homeScreen");

}


/* =========================================================
   ACCOUNT UI
========================================================= */

function updateAccountUI() {

    const name =
        document.getElementById(
            "accountName"
        );

    const age =
        document.getElementById(
            "accountAge"
        );

    const gender =
        document.getElementById(
            "accountGender"
        );

    const avatar =
        document.getElementById(
            "accountAvatar"
        );

    const hearts =
        document.getElementById(
            "heartBalance"
        );

    const money =
        document.getElementById(
            "moneyBalance"
        );

    const kisses =
        document.getElementById(
            "kissBalance"
        );

    const songs =
        document.getElementById(
            "songPoints"
        );

    const streak =
        document.getElementById(
            "streakCount"
        );

    const premium =
        document.getElementById(
            "premiumTag"
        );


    if (name) {
        name.textContent =
            state.name || "Player";
    }

    if (age) {
        age.textContent =
            state.age || 18;
    }

    if (gender) {
        gender.textContent =
            state.gender || "Male";
    }

    if (avatar) {
        avatar.src =
            state.avatar ||
            "https://i.pravatar.cc/300?img=12";
    }

    if (hearts) {
        hearts.textContent =
            state.hearts;
    }

    if (money) {
        money.textContent =
            state.money;
    }

    if (kisses) {
        kisses.textContent =
            state.kissPoints;
    }

    if (songs) {
        songs.textContent =
            state.songPoints;
    }

    if (streak) {
        streak.textContent =
            `${state.streak} day streak`;
    }

    if (premium) {

        premium.classList.toggle(
            "hidden",
            !state.premium
        );

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function openRoomTab() {

    updateAccountUI();

    renderRoom();

    showScreen("homeScreen");

}


function openAccount() {

    updateAccountUI();

    showScreen("accountScreen");

}


/* =========================================================
   ROOM
========================================================= */

function renderRoom() {

    const roomNumber =
        document.getElementById(
            "roomNumber"
        );

    const roomPeople =
        document.getElementById(
            "roomPeople"
        );

    if (roomNumber) {
        roomNumber.textContent =
            state.room;
    }

    if (roomPeople) {

        roomPeople.textContent =
            Math.min(
                state.roomMembers.length,
                10
            );

    }


    renderRoomMembers();

    renderMessages();

}


function renderRoomMembers() {

    const container =
        document.getElementById(
            "roomMembers"
        );

    if (!container) {
        return;
    }


    container.innerHTML = "";


    state.roomMembers
        .slice(0, 10)
        .forEach(member => {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "room-member";


            const avatar =
                document.createElement(
                    "div"
                );

            avatar.className =
                "room-member-avatar";


            const image =
                document.createElement(
                    "img"
                );

            image.src =
                member.avatar;

            image.alt =
                member.name;


            avatar.appendChild(image);


            if (member.online) {

                const dot =
                    document.createElement(
                        "span"
                    );

                dot.className =
                    "online-dot";

                avatar.appendChild(dot);

            }


            const name =
                document.createElement(
                    "span"
                );

            name.className =
                "room-member-name";

            name.textContent =
                member.name;


            wrapper.appendChild(
                avatar
            );

            wrapper.appendChild(
                name
            );


            wrapper.onclick = () => {

                openMemberAccount(
                    member
                );

            };


            container.appendChild(
                wrapper
            );

        });

}


/* =========================================================
   MESSAGES
========================================================= */

function renderMessages() {

    const container =
        document.getElementById(
            "roomMessages"
        );

    if (!container) {
        return;
    }


    container.innerHTML = "";


    state.messages.forEach(
        message => {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                `message ${
                    message.mine
                        ? "mine"
                        : "other"
                }`;


            const name =
                document.createElement(
                    "span"
                );

            name.className =
                `message-name ${
                    message.gender === "Female"
                        ? "girl"
                        : "boy"
                }`;

            name.textContent =
                message.name;


            const bubble =
                document.createElement(
                    "div"
                );

            bubble.className =
                "message-bubble";


            const text =
                document.createElement(
                    "span"
                );

            text.textContent =
                message.text;


            bubble.appendChild(text);


            if (message.translation) {

                const translation =
                    document.createElement(
                        "small"
                    );

                translation.className =
                    "message-translation";

                translation.textContent =
                    message.translation;

                bubble.appendChild(
                    translation
                );

            }


            const time =
                document.createElement(
                    "small"
                );

            time.className =
                "message-time";

            time.textContent =
                message.time ||
                getTime();


            wrapper.appendChild(name);

            wrapper.appendChild(bubble);

            wrapper.appendChild(time);


            /*
             * Hold a message to show
             * translation.
             */

            let holdTimer;

            wrapper.addEventListener(
                "touchstart",
                () => {

                    holdTimer =
                        setTimeout(
                            () => {

                                translateMessage(
                                    message
                                );

                            },
                            600
                        );

                }
            );


            wrapper.addEventListener(
                "touchend",
                () => {

                    clearTimeout(
                        holdTimer
                    );

                }
            );


            wrapper.addEventListener(
                "contextmenu",
                event => {

                    event.preventDefault();

                    translateMessage(
                        message
                    );

                }
            );


            container.appendChild(
                wrapper
            );

        }
    );


    container.scrollTop =
        container.scrollHeight;

}


/* =========================================================
   SEND MESSAGE
========================================================= */

function sendRoomMessage() {

    const input =
        document.getElementById(
            "roomInput"
        );

    if (!input) {
        return;
    }


    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    const message = {

        id:
            Date.now(),

        name:
            state.name || "You",

        gender:
            state.gender,

        text:
            text,

        translation:
            "",

        mine:
            true,

        time:
            getTime()

    };


    state.messages.push(
        message
    );


    input.value = "";

    saveState();

    renderMessages();


    /*
     * Demo automatic reply.
     * Later this will be replaced by
     * the real multiplayer server.
     */

    setTimeout(
        () => {

            const reply = {

                id:
                    Date.now(),

                name:
                    state.roomMembers[0]
                        ?.name ||
                    "Alex",

                gender:
                    state.roomMembers[0]
                        ?.gender ||
                    "Male",

                text:
                    "Nice to meet you! 😊",

                translation:
                    "",

                mine:
                    false,

                time:
                    getTime()

            };


            state.messages.push(
                reply
            );

            saveState();

            renderMessages();

        },
        900
    );

}


function handleRoomEnter(event) {

    if (
        event.key === "Enter"
    ) {

        event.preventDefault();

        sendRoomMessage();

    }

}


/* =========================================================
   TRANSLATION
========================================================= */

function translateMessage(message) {

    /*
     * This is the UI foundation.
     *
     * Real automatic translation will be
     * connected later to a translation service.
     */

    if (
        message.translation
    ) {

        const original =
            message.text;

        message.text =
            message.translation;

        message.translation =
            original;

    } else {

        /*
         * Demo translation.
         * Later replaced with real detection
         * + translation.
         */

        message.translation =
            "Translation will appear here";

    }


    saveState();

    renderMessages();

}


/* =========================================================
   TIME
========================================================= */

function getTime() {

    return new Date()
        .toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


/* =========================================================
   ROOM CHANGE
========================================================= */

function changeRoom() {

    /*
     * Demo room switching.
     * Real room availability will be controlled
     * by the server when multiplayer is connected.
     */

    state.room += 1;


    if (state.room > 20) {
        state.room = 1;
    }


    saveState();

    renderRoom();

}


/* =========================================================
   MEMBER ACCOUNT
========================================================= */

function openMemberAccount(member) {

    alert(
        `${member.name}\n\n` +
        `Gender: ${member.gender}\n\n` +
        `Online: ${
            member.online
                ? "Online"
                : "Offline"
        }`
    );

}


/* =========================================================
   MUSIC
========================================================= */

function openMusic() {

    const modal =
        document.getElementById(
            "musicModal"
        );

    if (modal) {
        modal.classList.remove(
            "hidden"
        );
    }

}


function closeMusic() {

    const modal =
        document.getElementById(
            "musicModal"
        );

    if (modal) {
        modal.classList.add(
            "hidden"
        );
    }

}


function searchMusic() {

    const input =
        document.getElementById(
            "musicSearch"
        );

    const results =
        document.getElementById(
            "musicResults"
        );


    if (!input || !results) {
        return;
    }


    const search =
        input.value.trim();


    if (!search) {

        results.innerHTML =
            "<p style='color:#999;margin-top:12px'>Type a song name first.</p>";

        return;
    }


    results.innerHTML = `

        <div class="music-result">

            <div class="music-cover">
                ♪
            </div>

            <div>

                <strong>
                    ${escapeHTML(search)}
                </strong>

                <small>
                    YouTube Music
                </small>

            </div>

            <button
                onclick="playSong('${escapeAttribute(search)}')"
            >
                Play
            </button>

        </div>

    `;

}


function playSong(song) {

    state.songPoints += 10;

    state.money =
        Math.max(
            0,
            state.money - 10
        );


    const title =
        document.getElementById(
            "musicTitle"
        );

    if (title) {
        title.textContent =
            song;
    }


    const player =
        document.getElementById(
            "musicPlayer"
        );

    if (player) {
        player.classList.remove(
            "hidden"
        );
    }


    saveState();

    updateAccountUI();

}


function closeMusicPlayer() {

    const player =
        document.getElementById(
            "musicPlayer"
        );

    if (player) {
        player.classList.add(
            "hidden"
        );
    }

}


/* =========================================================
   EMOTIONS
========================================================= */

function openEmotions() {

    const modal =
        document.getElementById(
            "emotionModal"
        );

    if (modal) {
        modal.classList.remove(
            "hidden"
        );
    }

}


function closeEmotions() {

    const modal =
        document.getElementById(
            "emotionModal"
        );

    if (modal) {
        modal.classList.add(
            "hidden"
        );
    }

}


function sendEmotion(type) {

    const emotions = {

        happy:
            "😊",

        love:
            "❤️",

        sad:
            "😔",

        cool:
            "😎"

    };


    const input =
        document.getElementById(
            "roomInput"
        );


    if (input) {

        input.value =
            emotions[type] || "😊";

    }


    closeEmotions();

}


/* =========================================================
   STORE
========================================================= */

function openStore() {

    const modal =
        document.getElementById(
            "storeModal"
        );

    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

}


function closeStore() {

    const modal =
        document.getElementById(
            "storeModal"
        );

    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


function claimDailyHearts() {

    state.hearts += 50;

    saveState();

    updateAccountUI();

    alert(
        "You claimed 50 free Hearts! ❤️"
    );

}


/*
 * IMPORTANT:
 * These buttons currently only demonstrate
 * the purchase flow.
 *
 * Real Telegram Stars payments must be handled
 * through Telegram's payment system on the
 * server. We will connect that later.
 */

function buyHearts(amount, stars) {

    alert(
        `${amount.toLocaleString()} Hearts\n\n` +
        `Price: ${stars} Telegram Stars\n\n` +
        `Payment system will be connected here.`
    );

}


/* =========================================================
   GIFTS
========================================================= */

function openGiftStore() {

    alert(
        "Gift store coming next. 🎁\n\n" +
        "Gifts will use Hearts and premium gifts."
    );

}


/* =========================================================
   FRIENDS
========================================================= */

function openFriends() {

    alert(
        "Friends list will appear here. 👥"
    );

}


/* =========================================================
   SETTINGS
========================================================= */

function openSettings() {

    const modal =
        document.getElementById(
            "settingsModal"
        );

    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

}


function closeSettings() {

    const modal =
        document.getElementById(
            "settingsModal"
        );

    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


function privacyMessage() {

    alert(
        "Privacy controls will be connected to the FlirtHubX account system."
    );

}


/* =========================================================
   PREMIUM
========================================================= */

function activatePremium() {

    state.premium = true;

    saveState();

    updateAccountUI();

}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(text) {

    return String(text)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'")
        .replaceAll('"', "&quot;");

}


/* =========================================================
   TELEGRAM MINI APP
========================================================= */

function initializeTelegram() {

    if (
        typeof Telegram !== "undefined" &&
        Telegram.WebApp
    ) {

        try {

            Telegram.WebApp.ready();

            Telegram.WebApp.expand();

        } catch (error) {

            console.log(
                "Telegram WebApp initialization skipped."
            );

        }

    }

}


/* =========================================================
   START TELEGRAM
========================================================= */

initializeTelegram();
/* =========================================================
   FLIRTHUBX — REAL-TIME ROOM CONNECTION
========================================================= */

let flirthubSocket = null;


/* ---------------------------------------------------------
   CONNECT TO SERVER
--------------------------------------------------------- */

function connectFlirtHubServer() {

    // Socket.IO is loaded by the server.
    if (typeof io === "undefined") {

        console.warn(
            "Socket.IO has not loaded yet."
        );

        return;
    }


    flirthubSocket = io();


    flirthubSocket.on(
        "connect",
        () => {

            console.log(
                "FlirtHubX connected:",
                flirthubSocket.id
            );


            joinCurrentRoom();

        }
    );


    /* -----------------------------------------------------
       ROOM JOINED
    ----------------------------------------------------- */

    flirthubSocket.on(
        "roomJoined",
        data => {

            state.room =
                Number(data.room) || 1;


            state.roomMembers =
                Array.isArray(data.users)
                    ? data.users
                    : [];


            saveState();

            renderRoom();

        }
    );


    /* -----------------------------------------------------
       ROOM FULL
    ----------------------------------------------------- */

    flirthubSocket.on(
        "roomFull",
        data => {

            alert(
                `Room ${data.room} is full (10/10).\n\n` +
                `Please choose another room.`
            );

        }
    );


    /* -----------------------------------------------------
       PLAYER JOINED
    ----------------------------------------------------- */

    flirthubSocket.on(
        "playerJoined",
        player => {

            const exists =
                state.roomMembers.some(
                    user =>
                        user.socketId ===
                        player.socketId
                );


            if (!exists) {

                state.roomMembers.push(
                    player
                );

            }


            renderRoom();

        }
    );


    /* -----------------------------------------------------
       PLAYER LEFT
    ----------------------------------------------------- */

    flirthubSocket.on(
        "playerLeft",
        data => {

            state.roomMembers =
                state.roomMembers.filter(
                    user =>
                        user.socketId !==
                        data.socketId
                );


            renderRoom();

        }
    );


    /* -----------------------------------------------------
       ROOM USER LIST
    ----------------------------------------------------- */

    flirthubSocket.on(
        "roomUsers",
        users => {

            state.roomMembers =
                Array.isArray(users)
                    ? users
                    : [];


            renderRoom();

        }
    );


    /* -----------------------------------------------------
       NEW MESSAGE
    ----------------------------------------------------- */

    flirthubSocket.on(
        "newMessage",
        message => {

            /*
             * Avoid adding our own message twice.
             */

            const exists =
                state.messages.some(
                    existing =>
                        existing.id ===
                        message.id
                );


            if (!exists) {

                state.messages.push({

                    id:
                        message.id,

                    name:
                        message.name,

                    gender:
                        message.gender,

                    text:
                        message.text,

                    translation:
                        "",

                    mine:
                        message.userId ===
                        getCurrentUserId(),

                    time:
                        new Date(
                            message.timestamp
                        ).toLocaleTimeString(
                            [],
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        )

                });

            }


            saveState();

            renderMessages();

        }
    );


    /* -----------------------------------------------------
       TYPING
    ----------------------------------------------------- */

    flirthubSocket.on(
        "playerTyping",
        data => {

            console.log(
                `${data.name} is typing...`
            );

        }
    );


    flirthubSocket.on(
        "playerStoppedTyping",
        data => {

            console.log(
                "Player stopped typing:",
                data.socketId
            );

        }
    );


    /* -----------------------------------------------------
       KISS REQUEST
    ----------------------------------------------------- */

    flirthubSocket.on(
        "kissRequest",
        data => {

            const accepted =
                confirm(
                    `${data.fromName} wants to kiss you 💋\n\n` +
                    `You have 10 seconds to respond.`
                );


            if (
                flirthubSocket &&
                flirthubSocket.connected
            ) {

                flirthubSocket.emit(
                    "kissResponse",
                    {
                        targetSocketId:
                            data.fromSocketId,

                        accepted:
                            accepted
                    }
                );

            }

        }
    );


    /* -----------------------------------------------------
       KISS RESPONSE
    ----------------------------------------------------- */

    flirthubSocket.on(
        "kissResponse",
        data => {

            if (data.accepted) {

                alert(
                    `${data.fromName} accepted the kiss! 💋`
                );

            } else {

                alert(
                    `${data.fromName} rejected the kiss.`
                );

            }

        }
    );


    /* -----------------------------------------------------
       BLOCK CONFIRMATION
    ----------------------------------------------------- */

    flirthubSocket.on(
        "playerBlocked",
        () => {

            alert(
                "Player blocked."
            );

        }
    );

}


/* =========================================================
   USER ID
========================================================= */

function getCurrentUserId() {

    if (
        window.Telegram &&
        Telegram.WebApp &&
        Telegram.WebApp.initDataUnsafe &&
        Telegram.WebApp.initDataUnsafe.user
    ) {

        return String(
            Telegram.WebApp
                .initDataUnsafe
                .user
                .id
        );

    }


    /*
     * Local browser ID for testing.
     */

    let localId =
        localStorage.getItem(
            "flirthubx_local_id"
        );


    if (!localId) {

        localId =
            "local-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8);


        localStorage.setItem(
            "flirthubx_local_id",
            localId
        );

    }


    return localId;

}


/* =========================================================
   JOIN CURRENT ROOM
========================================================= */

function joinCurrentRoom() {

    if (
        !flirthubSocket ||
        !flirthubSocket.connected
    ) {

        return;
    }


    flirthubSocket.emit(
        "joinRoom",
        {

            room:
                state.room || 1,

            id:
                getCurrentUserId(),

            name:
                state.name || "Player",

            gender:
                state.gender || "Male",

            avatar:
                state.avatar || ""

        }
    );

}


/* =========================================================
   REAL MESSAGE SENDING
========================================================= */

const oldSendRoomMessage =
    sendRoomMessage;


sendRoomMessage =
    function () {

        const input =
            document.getElementById(
                "roomInput"
            );


        if (!input) {
            return;
        }


        const text =
            input.value.trim();


        if (!text) {
            return;
        }


        /*
         * If the server isn't connected,
         * use the existing local demo behavior.
         */

        if (
            !flirthubSocket ||
            !flirthubSocket.connected
        ) {

            oldSendRoomMessage();

            return;
        }


        flirthubSocket.emit(
            "sendMessage",
            {
                text:
                    text
            }
        );


        input.value = "";

    };


/* =========================================================
   REAL ROOM CHANGING
========================================================= */

const oldChangeRoom =
    changeRoom;


changeRoom =
    function () {

        /*
         * If multiplayer is not connected,
         * keep the existing demo behavior.
         */

        if (
            !flirthubSocket ||
            !flirthubSocket.connected
        ) {

            oldChangeRoom();

            return;
        }


        let nextRoom =
            Number(state.room) + 1;


        /*
         * For now we allow rooms 1–9999.
         * The server will prevent a full room.
         */

        if (nextRoom > 9999) {
            nextRoom = 1;
        }


        flirthubSocket.emit(
            "changeRoom",
            {
                room:
                    nextRoom
            }
        );

    };


/* =========================================================
   KISS
========================================================= */

function requestKiss(socketId) {

    if (
        !flirthubSocket ||
        !flirthubSocket.connected
    ) {

        alert(
            "You are not connected to the room yet."
        );

        return;
    }


    if (!socketId) {
        return;
    }


    flirthubSocket.emit(
        "kissRequest",
        {
            targetSocketId:
                socketId
        }
    );

}


/* =========================================================
   BLOCK
========================================================= */

function blockPlayer(socketId) {

    if (
        !flirthubSocket ||
        !flirthubSocket.connected
    ) {

        alert(
            "You are not connected to the room yet."
        );

        return;
    }


    if (!socketId) {
        return;
    }


    const confirmed =
        confirm(
            "Block this player?"
        );


    if (!confirmed) {
        return;
    }


    flirthubSocket.emit(
        "blockPlayer",
        {
            targetSocketId:
                socketId
        }
    );

}


/* =========================================================
   CONNECT WHEN PAGE IS READY
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        connectFlirtHubServer
    );

} else {

    connectFlirtHubServer();

               }
