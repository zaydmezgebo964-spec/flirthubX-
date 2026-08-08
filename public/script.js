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

    roomMembers: []
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

        if (!Array.isArray(state.messages)) {
            state.messages = [];
        }

        if (!Array.isArray(state.roomMembers)) {
            state.roomMembers = [];
        }

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

        const element =
            document.getElementById(id);

        if (element) {
            element.classList.add("hidden");
        }

    });
}


function showScreen(id) {

    hideAllScreens();

    const element =
        document.getElementById(id);

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

        const existingAccount =
            loadState();

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

    state.selectedGender =
        gender;

    document
        .querySelectorAll(".gender-option")
        .forEach(option => {

            option.classList.remove(
                "selected"
            );

        });

    button.classList.add(
        "selected"
    );

}


function continueToAvatar() {

    const nameInput =
        document.getElementById(
            "playerName"
        );

    const ageInput =
        document.getElementById(
            "playerAge"
        );

    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    const age =
        ageInput
            ? Number(ageInput.value)
            : 0;


    if (!name) {

        alert(
            "Please enter your name."
        );

        return;
    }


    if (!age || age < 18) {

        alert(
            "You must be 18 or older to use FlirtHubX."
        );

        return;
    }


    if (!state.selectedGender) {

        alert(
            "Please select your gender."
        );

        return;
    }


    state.name =
        name;

    state.age =
        age;

    state.gender =
        state.selectedGender;


    showScreen(
        "avatarScreen"
    );

}


/* =========================================================
   AVATAR
========================================================= */

function selectAvatar(
    button,
    avatar
) {

    state.selectedAvatar =
        avatar;

    document
        .querySelectorAll(".avatar-option")
        .forEach(option => {

            option.classList.remove(
                "selected"
            );

        });

    button.classList.add(
        "selected"
    );

}


function finishProfile() {

    if (!state.selectedAvatar) {

        alert(
            "Please choose an avatar."
        );

        return;
    }


    state.avatar =
        state.selectedAvatar;

    state.profileCreated =
        true;

    saveState();

    updateAccountUI();

    renderRoom();

    showScreen(
        "homeScreen"
    );

    /*
     * Connect to multiplayer
     * after profile creation.
     */

    if (
        flirthubSocket &&
        flirthubSocket.connected
    ) {

        joinCurrentRoom();

    }

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

    showScreen(
        "homeScreen"
    );

}


function openAccount() {

    updateAccountUI();

    showScreen(
        "accountScreen"
    );

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


/* =========================================================
   ROOM MEMBERS
========================================================= */

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
                member.avatar ||
                "https://i.pravatar.cc/150?img=12";

            image.alt =
                member.name ||
                "Player";


            avatar.appendChild(
                image
            );


            if (member.online) {

                const dot =
                    document.createElement(
                        "span"
                    );

                dot.className =
                    "online-dot";

                avatar.appendChild(
                    dot
                );

            }


            const name =
                document.createElement(
                    "span"
                );

            name.className =
                "room-member-name";

            name.textContent =
                member.name ||
                "Player";


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


            bubble.appendChild(
                text
            );


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


            wrapper.appendChild(
                name
            );

            wrapper.appendChild(
                bubble
            );

            wrapper.appendChild(
                time
            );


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


    /*
     * REAL MULTIPLAYER
     */

    if (
        flirthubSocket &&
        flirthubSocket.connected
    ) {

        flirthubSocket.emit(
            "sendMessage",
            {
                text: text
            }
        );

        input.value = "";

        return;
    }


    /*
     * LOCAL DEMO
     */

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


    setTimeout(
        () => {

            const reply = {

                id:
                    Date.now(),

                name:
                    "Alex",

                gender:
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

function translateMessage(
    message
) {

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

    if (
        flirthubSocket &&
        flirthubSocket.connected
    ) {

        let nextRoom =
            Number(state.room) + 1;

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

        return;
    }


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

function openMemberAccount(
    member
) {

    alert(
        `${member.name}\n\n` +
        `Gender: ${
            member.gender || "Unknown"
        }\n\n` +
        `Status: ${
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

    if (state.money < 10) {

        alert(
            "You need 10 Money to play a song."
        );

        return;
    }


    state.songPoints += 10;

    state.money -= 10;


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

        happy: "😊",

        love: "❤️",

        sad: "😔",

        cool: "😎"

    };


    const input =
        document.getElementById(
            "roomInput"
        );


    if (input) {

        input.value =
            emotions[type] ||
            "😊";

    }


    closeEmotions();

}


/* =========================================================
   STORE — NOW BELONGS TO ROOM
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

    /*
     * Prevent claiming repeatedly
     * during the same day.
     */

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);


    const lastClaim =
        localStorage.getItem(
            "flirthubx_daily_hearts"
        );


    if (lastClaim === today) {

        alert(
            "You already claimed today's 50 Hearts. ❤️"
        );

        return;
    }


    state.hearts += 50;


    localStorage.setItem(
        "flirthubx_daily_hearts",
        today
    );


    saveState();

    updateAccountUI();


    alert(
        "You claimed 50 free Hearts! ❤️"
    );

}


/* =========================================================
   TELEGRAM STARS PURCHASE
========================================================= */

function buyHearts(
    amount,
    stars
) {

    /*
     * IMPORTANT:
     *
     * This is still a placeholder.
     *
     * Telegram Stars payments must be
     * processed through the Telegram
     * Bot API/server before adding
     * paid Hearts.
     */


    if (
        window.Telegram &&
        Telegram.WebApp
    ) {

        alert(
            `${amount.toLocaleString()} Hearts\n\n` +
            `Price: ${stars} Telegram Stars\n\n` +
            `Telegram Stars payment will be connected next.`
        );

    } else {

        alert(
            `${amount.toLocaleString()} Hearts\n\n` +
            `Price: ${stars} Telegram Stars`
        );

    }

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

    state.premium =
        true;

    saveState();

    updateAccountUI();

}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(text) {

    return String(text)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


function escapeAttribute(text) {

    return String(text)
        .replaceAll(
            "\\",
            "\\\\"
        )
        .replaceAll(
            "'",
            "\\'"
        )
        .replaceAll(
            '"',
            "&quot;"
        );

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
   REAL-TIME SOCKET.IO
========================================================= */

let flirthubSocket = null;


/* =========================================================
   CONNECT SERVER
========================================================= */

function connectFlirtHubServer() {

    if (
        typeof io === "undefined"
    ) {

        console.warn(
            "Socket.IO has not loaded yet."
        );

        return;
    }


    if (flirthubSocket) {
        return;
    }


    flirthubSocket =
        io();


    /* =====================================================
       CONNECT
    ===================================================== */

    flirthubSocket.on(
        "connect",
        () => {

            console.log(
                "FlirtHubX connected:",
                flirthubSocket.id
            );


            if (
                state.profileCreated &&
                state.name
            ) {

                joinCurrentRoom();

            }

        }
    );


    /* =====================================================
       ROOM JOINED
    ===================================================== */

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


    /* =====================================================
       ROOM FULL
    ===================================================== */

    flirthubSocket.on(
        "roomFull",
        data => {

            alert(
                `Room ${data.room} is full (10/10).\n\n` +
                `Please choose another room.`
            );

        }
    );


    /* =====================================================
       PLAYER JOINED
    ===================================================== */

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


    /* =====================================================
       PLAYER LEFT
    ===================================================== */

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


    /* =====================================================
       ROOM USERS
    ===================================================== */

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


    /* =====================================================
       NEW MESSAGE
    ===================================================== */

    flirthubSocket.on(
        "newMessage",
        message => {

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
                        String(
                            message.userId
                        ) ===
                        String(
                            getCurrentUserId()
                        ),

                    time:
                        new Date(
                            message.timestamp
                        ).toLocaleTimeString(
                            [],
                            {
                                hour:
                                    "2-digit",

                                minute:
                                    "2-digit"
                            }
                        )

                });

            }


            saveState();

            renderMessages();

        }
    );


    /* =====================================================
       TYPING
    ===================================================== */

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


    /* =====================================================
       KISS REQUEST
    ===================================================== */

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


    /* =====================================================
       KISS RESPONSE
    ===================================================== */

    flirthubSocket.on(
        "kissResponse",
        data => {

            if (data.accepted) {

                state.kissPoints += 1;

                saveState();

                updateAccountUI();

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


    /* =====================================================
       PLAYER BLOCKED
    ===================================================== */

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
   JOIN ROOM
========================================================= */

function joinCurrentRoom() {

    if (
        !flirthubSocket ||
        !flirthubSocket.connected
    ) {

        return;
    }


    if (
        !state.profileCreated ||
        !state.name
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
   KISS
========================================================= */

function requestKiss(
    socketId
) {

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

function blockPlayer(
    socketId
) {

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
   TYPING
========================================================= */

let typingTimer = null;


function sendTypingStatus() {

    if (
        !flirthubSocket ||
        !flirthubSocket.connected
    ) {

        return;
    }


    flirthubSocket.emit(
        "typing"
    );


    clearTimeout(
        typingTimer
    );


    typingTimer =
        setTimeout(
            () => {

                if (
                    flirthubSocket &&
                    flirthubSocket.connected
                ) {

                    flirthubSocket.emit(
                        "stopTyping"
                    );

                }

            },
            1000
        );

}


/* =========================================================
   CONNECT WHEN READY
========================================================= */

initializeTelegram();


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            connectFlirtHubServer();

            const input =
                document.getElementById(
                    "roomInput"
                );

            if (input) {

                input.addEventListener(
                    "input",
                    sendTypingStatus
                );

            }

        }
    );

} else {

    connectFlirtHubServer();

}
