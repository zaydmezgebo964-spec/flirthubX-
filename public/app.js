/* =========================================================
   FLIRTHUBX — APP.JS
   Main client-side game logic
========================================================= */

"use strict";

/* =========================================================
   STATE
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

    premium: false,

    language: "en",

    roomMembers: [],
    messages: [],

    privateMessages: {},

    blockedUsers: [],

    selectedMember: null,
    currentChatUser: null,

    league: "Bronze",
    leaguePoints: 0,

    lastDailyReward: null
};


/* =========================================================
   DEFAULT ROOM PLAYERS
========================================================= */

const defaultPlayers = [
    {
        id: "alex",
        name: "Alex",
        age: 22,
        gender: "Male",
        avatar: "https://i.pravatar.cc/150?img=12",
        online: true
    },
    {
        id: "mia",
        name: "Mia",
        age: 21,
        gender: "Female",
        avatar: "https://i.pravatar.cc/150?img=47",
        online: true
    },
    {
        id: "daniel",
        name: "Daniel",
        age: 23,
        gender: "Male",
        avatar: "https://i.pravatar.cc/150?img=11",
        online: true
    },
    {
        id: "lina",
        name: "Lina",
        age: 20,
        gender: "Female",
        avatar: "https://i.pravatar.cc/150?img=44",
        online: false
    }
];


/* =========================================================
   SOCKET
========================================================= */

let flirthubSocket = null;


/* =========================================================
   STORAGE
========================================================= */

function saveState() {

    try {

        localStorage.setItem(
            "flirthubx_state",
            JSON.stringify(state)
        );

    } catch (error) {

        console.error(
            "Could not save state:",
            error
        );

    }
}


function loadState() {

    try {

        const saved =
            localStorage.getItem(
                "flirthubx_state"
            );

        if (!saved) {
            return false;
        }

        const data =
            JSON.parse(saved);

        Object.assign(
            state,
            data
        );

        return true;

    } catch (error) {

        console.error(
            "Could not load state:",
            error
        );

        return false;
    }
}


/* =========================================================
   HELPERS
========================================================= */

function $(id) {
    return document.getElementById(id);
}


function showElement(id) {

    const element = $(id);

    if (element) {
        element.classList.remove("hidden");
    }
}


function hideElement(id) {

    const element = $(id);

    if (element) {
        element.classList.add("hidden");
    }
}


function showModal(id) {

    const modal = $(id);

    if (modal) {
        modal.classList.remove("hidden");
    }
}


function closeModal(id) {

    const modal = $(id);

    if (modal) {
        modal.classList.add("hidden");
    }
}


function notify(message, icon = "✓") {

    const notification =
        $("notification");

    const text =
        $("notificationText");

    const iconElement =
        $("notificationIcon");

    if (!notification) {
        alert(message);
        return;
    }

    if (text) {
        text.textContent = message;
    }

    if (iconElement) {
        iconElement.textContent = icon;
    }

    notification.classList.add(
        "show"
    );

    setTimeout(() => {

        notification.classList.remove(
            "show"
        );

    }, 2500);
}


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


function escapeHTML(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   SCREEN NAVIGATION
========================================================= */

function showScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove(
                "active"
            );

            screen.classList.add(
                "hidden"
            );

        });

    const screen = $(id);

    if (screen) {

        screen.classList.remove(
            "hidden"
        );

        screen.classList.add(
            "active"
        );

    }
}


function hideAllScreens() {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove(
                "active"
            );

            screen.classList.add(
                "hidden"
            );

        });
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {

    loadState();

    if (
        !Array.isArray(
            state.roomMembers
        ) ||
        state.roomMembers.length === 0
    ) {

        state.roomMembers =
            [...defaultPlayers];

    }

    setupButtons();

    updateAllUI();

    startLoading();

    initializeTelegram();

    connectFlirtHubServer();

}


/* =========================================================
   LOADING
========================================================= */

function startLoading() {

    const progress =
        $("loadingProgress");

    const percent =
        $("loadingPercent");

    let value = 0;

    const interval =
        setInterval(() => {

            value += 5;

            if (progress) {
                progress.style.width =
                    `${value}%`;
            }

            if (percent) {
                percent.textContent =
                    `${value}%`;
            }

            if (value >= 100) {

                clearInterval(
                    interval
                );

                setTimeout(() => {

                    hideElement(
                        "loadingScreen"
                    );

                    if (
                        state.profileCreated &&
                        state.name
                    ) {

                        showScreen(
                            "homeScreen"
                        );

                        renderRoom();

                    } else {

                        showScreen(
                            "startScreen"
                        );

                    }

                }, 300);

            }

        }, 40);

}


/* =========================================================
   TELEGRAM
========================================================= */

function initializeTelegram() {

    if (
        window.Telegram &&
        Telegram.WebApp
    ) {

        try {

            Telegram.WebApp.ready();

            Telegram.WebApp.expand();

        } catch (error) {

            console.log(
                "Telegram initialization skipped."
            );

        }

    }

}


/* =========================================================
   BUTTON SETUP
========================================================= */

function setupButtons() {

    /* START */

    $("startButton")?.addEventListener(
        "click",
        startGame
    );


    /* ACCOUNT */

    $("profileButton")?.addEventListener(
        "click",
        openAccount
    );

    $("accountBack")?.addEventListener(
        "click",
        () => {

            showScreen(
                state.profileCreated
                    ? "homeScreen"
                    : "startScreen"
            );

        }
    );


    /* CREATE ACCOUNT */

    $("createAccountButton")
        ?.addEventListener(
            "click",
            createAccount
        );


    /* AVATAR */

    $("chooseAvatarButton")
        ?.addEventListener(
            "click",
            () => {

                $("avatarInput")?.click();

            }
        );


    $("avatarInput")
        ?.addEventListener(
            "change",
            handleAvatarUpload
        );


    /* HEARTS */

    $("buyHeartButton")
        ?.addEventListener(
            "click",
            openStore
        );


    /* MUSIC */

    $("songButton")
        ?.addEventListener(
            "click",
            openMusic
        );


    /* SETTINGS */

    $("settingsButton")
        ?.addEventListener(
            "click",
            openSettings
        );


    /* CHANGE ROOM */

    $("changeRoomButton")
        ?.addEventListener(
            "click",
            openRoomChanger
        );


    /* CHAT */

    $("sendRoomMessageButton")
        ?.addEventListener(
            "click",
            sendRoomMessage
        );


    $("roomMessageInput")
        ?.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    sendRoomMessage();

                }

            }
        );


    /* BOTTLE */

    $("bottle")
        ?.addEventListener(
            "click",
            spinBottle
        );


    $("bottleArea")
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                        "bottleArea" ||
                    event.target.classList.contains(
                        "bottle-glow"
                    )
                ) {

                    spinBottle();

                }

            }
        );


    /* KISS */

    $("kissButton")
        ?.addEventListener(
            "click",
            acceptKiss
        );


    $("refuseButton")
        ?.addEventListener(
            "click",
            refuseKiss
        );


    /* USER */

    $("messageUserButton")
        ?.addEventListener(
            "click",
            openPrivateChat
        );


    $("blockUserButton")
        ?.addEventListener(
            "click",
            blockSelectedUser
        );


    $("giftButton")
        ?.addEventListener(
            "click",
            openGiftStore
        );


    /* PRIVATE CHAT */

    $("sendPrivateMessageButton")
        ?.addEventListener(
            "click",
            sendPrivateMessage
        );


    $("privateMessageInput")
        ?.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    sendPrivateMessage();

                }

            }
        );


    /* MUSIC SEARCH */

    $("songSearchButton")
        ?.addEventListener(
            "click",
            searchMusic
        );


    $("songSearchInput")
        ?.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    searchMusic();

                }

            }
        );


    /* SETTINGS */

    $("languageSettingButton")
        ?.addEventListener(
            "click",
            () => showModal(
                "languageModal"
            )
        );


    $("privacySettingButton")
        ?.addEventListener(
            "click",
            () => {

                notify(
                    "Privacy settings coming soon.",
                    "🔒"
                );

            }
        );


    $("notificationsSettingButton")
        ?.addEventListener(
            "click",
            () => {

                notify(
                    "Notifications settings coming soon.",
                    "🔔"
                );

            }
        );


    $("accountSettingButton")
        ?.addEventListener(
            "click",
            openAccount
        );


    /* LANGUAGE */

    document
        .querySelectorAll(
            "[data-language]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    changeLanguage(
                        button.dataset.language
                    );

                }
            );

        });


    /* CLOSE BUTTONS */

    document
        .querySelectorAll(
            "[data-close]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.dataset.close
                    );

                }
            );

        });


    /* REWARD */

    $("claimRewardButton")
        ?.addEventListener(
            "click",
            claimDailyReward
        );


    /* EDIT PROFILE */

    $("editProfileButton")
        ?.addEventListener(
            "click",
            () => {

                closeModal(
                    "profileModal"
                );

                showScreen(
                    "accountScreen"
                );

                fillAccountForm();

            }
        );


    /* EMOTIONS */

    $("emotionGrid")
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target.tagName ===
                    "BUTTON"
                ) {

                    const emotion =
                        event.target.textContent;

                    sendEmotion(
                        emotion
                    );

                }

            }
        );

}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    if (
        state.profileCreated &&
        state.name
    ) {

        showScreen(
            "homeScreen"
        );

        renderRoom();

    } else {

        showScreen(
            "accountScreen"
        );

    }

}


/* =========================================================
   ACCOUNT CREATION
========================================================= */

function createAccount() {

    const name =
        $("nameInput")?.value.trim();

    const age =
        Number(
            $("ageInput")?.value
        );


    const genderButton =
        document.querySelector(
            ".gender-button.selected"
        );


    const gender =
        genderButton
            ? genderButton.dataset.gender
            : "";


    if (!name) {

        notify(
            "Please enter your name.",
            "⚠️"
        );

        return;
    }


    if (
        !age ||
        age < 18
    ) {

        notify(
            "You must be 18 or older.",
            "🔞"
        );

        return;
    }


    if (!gender) {

        notify(
            "Please choose your gender.",
            "⚠️"
        );

        return;
    }


    state.name =
        name;

    state.age =
        age;

    state.gender =
        gender === "female"
            ? "Female"
            : "Male";


    if (!state.avatar) {

        state.avatar =
            gender === "female"
                ? "https://i.pravatar.cc/300?img=47"
                : "https://i.pravatar.cc/300?img=12";

    }


    state.profileCreated =
        true;


    saveState();

    updateAllUI();

    showScreen(
        "homeScreen"
    );

    renderRoom();

    notify(
        "Account created! ❤️",
        "✓"
    );

    joinCurrentRoom();

}


/* =========================================================
   ACCOUNT FORM
========================================================= */

function fillAccountForm() {

    if ($("nameInput")) {
        $("nameInput").value =
            state.name || "";
    }

    if ($("ageInput")) {
        $("ageInput").value =
            state.age || 18;
    }

    document
        .querySelectorAll(
            ".gender-button"
        )
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.dataset.gender ===
                    String(
                        state.gender
                    ).toLowerCase()
            );

        });

}


function handleAvatarUpload(event) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload = () => {

        state.avatar =
            reader.result;

        const preview =
            $("avatarPreview");

        if (preview) {

            preview.innerHTML =
                `<img src="${reader.result}" alt="Avatar">`;

        }

        saveState();

        updateAllUI();

    };


    reader.readAsDataURL(file);

}


/* =========================================================
   GENDER BUTTONS
========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".gender-button"
            );

        if (!button) {
            return;
        }

        document
            .querySelectorAll(
                ".gender-button"
            )
            .forEach(
                item =>
                    item.classList.remove(
                        "selected"
                    )
            );

        button.classList.add(
            "selected"
        );

    }
);


/* =========================================================
   UI UPDATE
========================================================= */

function updateAllUI() {

    updateBalances();

    updateProfileUI();

    updateLeagueUI();

}


function updateBalances() {

    const heart =
        $("heartBalance");

    if (heart) {
        heart.textContent =
            state.hearts;
    }


    const profileHearts =
        $("profileHearts");

    if (profileHearts) {
        profileHearts.textContent =
            state.hearts;
    }


    const kisses =
        $("profileKisses");

    if (kisses) {
        kisses.textContent =
            state.kissPoints;
    }


    const songs =
        $("profileSongPoints");

    if (songs) {
        songs.textContent =
            state.songPoints;
    }

}


function updateProfileUI() {

    if ($("profileName")) {
        $("profileName").textContent =
            state.name || "Your Name";
    }

    if ($("profileAge")) {
        $("profileAge").textContent =
            state.age || 18;
    }

    if ($("profileAvatar")) {

        $("profileAvatar").innerHTML =
            state.avatar
                ? `<img src="${state.avatar}" alt="Avatar">`
                : "👤";

    }


    if ($("accountName")) {
        $("accountName").textContent =
            state.name;
    }

}


function updateLeagueUI() {

    const name =
        $("leagueName");

    const icon =
        $("leagueIcon");

    const profileLeague =
        $("profileLeague");


    let leagueName =
        "Bronze League";

    let leagueIcon =
        "🥉";


    if (
        state.leaguePoints >= 1000
    ) {

        leagueName =
            "Diamond League";

        leagueIcon =
            "💎";

    } else if (
        state.leaguePoints >= 600
    ) {

        leagueName =
            "Gold League";

        leagueIcon =
            "🥇";

    } else if (
        state.leaguePoints >= 300
    ) {

        leagueName =
            "Silver League";

        leagueIcon =
            "🥈";

    }


    if (name) {
        name.textContent =
            leagueName;
    }

    if (icon) {
        icon.textContent =
            leagueIcon;
    }

    if (profileLeague) {
        profileLeague.textContent =
            `${leagueIcon} ${leagueName.replace(" League", "")}`;
    }

}


/* =========================================================
   ACCOUNT BUTTON
========================================================= */

function openAccount() {

    updateAllUI();

    fillAccountForm();

    showModal(
        "profileModal"
    );

}


/* =========================================================
   ROOM
========================================================= */

function renderRoom() {

    renderPlayers();

    renderMessages();

    const roomNumber =
        $("roomNumber");

    const playerCount =
        $("playerCount");


    if (roomNumber) {
        roomNumber.textContent =
            state.room;
    }


    if (playerCount) {

        playerCount.textContent =
            `${Math.min(
                state.roomMembers.length,
                10
            )} / 10`;

    }

}


function renderPlayers() {

    const grid =
        $("playerGrid");

    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    state.roomMembers
        .slice(0, 10)
        .forEach(player => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "player-card";


            const avatar =
                document.createElement(
                    "div"
                );

            avatar.className =
                "player-avatar";


            const img =
                document.createElement(
                    "img"
                );

            img.src =
                player.avatar ||
                "https://i.pravatar.cc/150?img=12";

            img.alt =
                player.name;


            avatar.appendChild(
                img
            );


            if (player.online) {

                const online =
                    document.createElement(
                        "span"
                    );

                online.className =
                    "online-dot";

                avatar.appendChild(
                    online
                );

            }


            const name =
                document.createElement(
                    "strong"
                );

            name.textContent =
                player.name;


            const age =
                document.createElement(
                    "small"
                );

            age.textContent =
                player.age
                    ? `${player.age}`
                    : "";


            card.appendChild(
                avatar
            );

            card.appendChild(
                name
            );

            card.appendChild(
                age
            );


            card.addEventListener(
                "click",
                () => {

                    openPlayerProfile(
                        player
                    );

                }
            );


            grid.appendChild(
                card
            );

        });

}


/* =========================================================
   PLAYER PROFILE
========================================================= */

function openPlayerProfile(player) {

    if (!player) {
        return;
    }


    state.selectedMember =
        player;


    const avatar =
        $("userAvatar");

    const name =
        $("userName");

    const age =
        $("userAge");


    if (avatar) {

        avatar.innerHTML =
            `<img src="${
                player.avatar ||
                "https://i.pravatar.cc/150"
            }" alt="Avatar">`;

    }


    if (name) {
        name.textContent =
            player.name;
    }


    if (age) {
        age.textContent =
            player.age
                ? `${player.age} years old`
                : player.gender || "";
    }


    showModal(
        "userModal"
    );

}


/* =========================================================
   CHANGE ROOM
========================================================= */

function openRoomChanger() {

    const list =
        $("roomList");

    if (!list) {
        return;
    }


    list.innerHTML = "";


    for (
        let room = 1;
        room <= 20;
        room++
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.className =
            "room-choice";


        const current =
            room ===
            Number(state.room);


        button.innerHTML =
            `
                <strong>Room ${room}</strong>
                <span>
                    ${current
                        ? "CURRENT"
                        : "Join"}
                </span>
            `;


        if (current) {
            button.classList.add(
                "current"
            );
        }


        button.addEventListener(
            "click",
            () => {

                changeRoom(
                    room
                );

            }
        );


        list.appendChild(
            button
        );

    }


    showModal(
        "roomModal"
    );

}


function changeRoom(room) {

    const nextRoom =
        Number(room);


    if (
        !nextRoom ||
        nextRoom < 1
    ) {

        return;

    }


    if (
        flirthubSocket &&
        flirthubSocket.connected
    ) {

        flirthubSocket.emit(
            "changeRoom",
            {
                room:
                    nextRoom
            }
        );

    } else {

        state.room =
            nextRoom;

        state.messages = [];

        state.roomMembers =
            [...defaultPlayers];

        saveState();

        renderRoom();

    }


    closeModal(
        "roomModal"
    );


    notify(
        `Room ${nextRoom} selected.`,
        "🔄"
    );

}


/* =========================================================
   BOTTLE SPIN
========================================================= */

let bottleSpinning =
    false;


function spinBottle() {

    if (bottleSpinning) {
        return;
    }


    const bottle =
        $("bottle");


    if (!bottle) {
        return;
    }


    bottleSpinning =
        true;


    const rotation =
        1080 +
        Math.floor(
            Math.random() * 720
        );


    bottle.style.transition =
        "transform 3s cubic-bezier(.17,.67,.22,1)";


    bottle.style.transform =
        `rotate(${rotation}deg)`;


    notify(
        "The bottle is spinning! 🍾",
        "🍾"
    );


    setTimeout(
        () => {

            bottleSpinning =
                false;


            const players =
                state.roomMembers.filter(
                    player =>
                        !isSamePlayer(
                            player,
                            getCurrentUser()
                        )
                );


            if (
                players.length === 0
            ) {

                notify(
                    "Waiting for more players...",
                    "👥"
                );

                return;

            }


            const target =
                players[
                    Math.floor(
                        Math.random() *
                        players.length
                    )
                ];


            state.selectedMember =
                target;


            showKissChoice(
                target
            );


        },
        3200
    );

}


/* =========================================================
   CURRENT USER
========================================================= */

function getCurrentUser() {

    return {
        id:
            getCurrentUserId(),

        name:
            state.name || "You",

        age:
            state.age,

        gender:
            state.gender,

        avatar:
            state.avatar,

        online:
            true
    };

}


function isSamePlayer(a, b) {

    if (!a || !b) {
        return false;
    }

    return (
        a.id &&
        b.id &&
        String(a.id) ===
        String(b.id)
    );

}


/* =========================================================
   KISS CHOICE
========================================================= */

let kissCountdown =
    null;


function showKissChoice(player) {

    state.selectedMember =
        player;


    const myName =
        $("choiceMyName");

    const targetName =
        $("choiceTargetName");

    const myAvatar =
        $("choiceMyAvatar");

    const targetAvatar =
        $("choiceTargetAvatar");


    if (myName) {
        myName.textContent =
            state.name || "You";
    }


    if (targetName) {
        targetName.textContent =
            player.name;
    }


    if (myAvatar) {

        myAvatar.innerHTML =
            state.avatar
                ? `<img src="${state.avatar}" alt="">`
                : "👤";

    }


    if (targetAvatar) {

        targetAvatar.innerHTML =
            `<img src="${
                player.avatar ||
                "https://i.pravatar.cc/150"
            }" alt="">`;

    }


    showModal(
        "choiceModal"
    );


    let seconds =
        10;


    const timer =
        $("kissTimer");


    if (timer) {
        timer.textContent =
            seconds;
    }


    clearInterval(
        kissCountdown
    );


    kissCountdown =
        setInterval(
            () => {

                seconds--;

                if (timer) {
                    timer.textContent =
                        seconds;
                }


                if (
                    seconds <= 0
                ) {

                    clearInterval(
                        kissCountdown
                    );

                    closeModal(
                        "choiceModal"
                    );

                    notify(
                        "Time's up!",
                        "⏰"
                    );

                }

            },
            1000
        );

}


function acceptKiss() {

    clearInterval(
        kissCountdown
    );


    const target =
        state.selectedMember;


    closeModal(
        "choiceModal"
    );


    if (!target) {
        return;
    }


    state.kissPoints += 10;

    state.hearts =
        Math.max(
            0,
            state.hearts - 5
        );


    state.leaguePoints += 10;


    saveState();

    updateAllUI();


    if (
        flirthubSocket &&
        flirthubSocket.connected &&
        target.socketId
    ) {

        flirthubSocket.emit(
            "kissRequest",
            {
                targetSocketId:
                    target.socketId
            }
        );

    } else {

        notify(
            `You kissed ${target.name}! 💋`,
            "💋"
        );

    }

}


function refuseKiss() {

    clearInterval(
        kissCountdown
    );


    closeModal(
        "choiceModal"
    );


    notify(
        "You refused the kiss.",
        "❌"
    );

}


/* =========================================================
   KISS REQUEST FROM SERVER
========================================================= */

function handleKissRequest(data) {

    const player = {

        name:
            data.fromName ||
            "Someone",

        socketId:
            data.fromSocketId,

        avatar:
            data.fromAvatar ||
            "https://i.pravatar.cc/150"

    };


    state.selectedMember =
        player;


    const accepted =
        confirm(
            `${player.name} wants to kiss you 💋\n\nAccept?`
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


    if (accepted) {

        state.kissPoints += 10;

        state.leaguePoints += 10;

        saveState();

        updateAllUI();

        notify(
            `${player.name} kissed you! 💋`,
            "💋"
        );

    }

}


/* =========================================================
   ROOM CHAT
========================================================= */

function sendRoomMessage() {

    const input =
        $("roomMessageInput");


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
            `${Date.now()}-${Math.random()}`,

        userId:
            getCurrentUserId(),

        name:
            state.name || "You",

        gender:
            state.gender,

        text:
            text,

        mine:
            true,

        time:
            getTime(),

        timestamp:
            Date.now()

    };


    if (
        flirthubSocket &&
        flirthubSocket.connected
    ) {

        flirthubSocket.emit(
            "sendMessage",
            {
                text:
                    text
            }
        );

    } else {

        state.messages.push(
            message
        );

        saveState();

        renderMessages();

    }


    input.value = "";

}


/* =========================================================
   RENDER MESSAGES
========================================================= */

function renderMessages() {

    const container =
        $("roomMessages");


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
                message.mine
                    ? "message mine"
                    : "message other";


            const name =
                document.createElement(
                    "strong"
                );


            name.className =
                "message-name";


            name.textContent =
                message.name ||
                "Player";


            const bubble =
                document.createElement(
                    "div"
                );


            bubble.className =
                "message-bubble";


            bubble.textContent =
                message.text;


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


            wrapper.addEventListener(
                "contextmenu",
                event => {

                    event.preventDefault();

                    openTranslation(
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
   SOCKET MESSAGE
========================================================= */

function handleNewMessage(message) {

    const exists =
        state.messages.some(
            item =>
                String(item.id) ===
                String(message.id)
        );


    if (exists) {
        return;
    }


    state.messages.push({

        id:
            message.id ||
            `${Date.now()}-${Math.random()}`,

        userId:
            message.userId,

        name:
            message.name ||
            "Player",

        gender:
            message.gender,

        text:
            message.text ||
            "",

        mine:
            String(
                message.userId
            ) ===
            String(
                getCurrentUserId()
            ),

        time:
            message.timestamp
                ? new Date(
                    message.timestamp
                ).toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )
                : getTime()

    });


    saveState();

    renderMessages();

}


/* =========================================================
   TRANSLATION
========================================================= */

function openTranslation(message) {

    if (!message) {
        return;
    }


    const original =
        $("originalMessage");

    const translated =
        $("translatedMessage");


    if (original) {
        original.textContent =
            message.text;
    }


    if (translated) {

        translated.textContent =
            getDemoTranslation(
                message.text
            );

    }


    showModal(
        "translationModal"
    );

}


function getDemoTranslation(text) {

    const lower =
        String(text).toLowerCase();


    const translations = {

        "hello":
            "Hello",

        "hi":
            "Hello",

        "how are you":
            "How are you?",

        "nice to meet you":
            "Nice to meet you",

        "i love you":
            "I love you"

    };


    return (
        translations[lower] ||
        "Automatic translation will be connected to the translation service."
    );

}


/* =========================================================
   PRIVATE CHAT
========================================================= */

function openPrivateChat() {

    const user =
        state.selectedMember;


    if (!user) {
        return;
    }


    state.currentChatUser =
        user;


    closeModal(
        "userModal"
    );


    const name =
        $("chatName");

    const avatar =
        $("chatAvatar");

    const status =
        $("chatStatus");


    if (name) {
        name.textContent =
            user.name;
    }


    if (avatar) {

        avatar.innerHTML =
            `<img src="${
                user.avatar ||
                "https://i.pravatar.cc/150"
            }" alt="">`;

    }


    if (status) {

        status.textContent =
            user.online
                ? "Online"
                : "Offline";

    }


    showModal(
        "chatModal"
    );


    renderPrivateMessages();

}


function sendPrivateMessage() {

    const input =
        $("privateMessageInput");


    if (!input) {
        return;
    }


    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    const user =
        state.currentChatUser;


    if (!user) {
        return;
    }


    const userId =
        getPlayerId(
            user
        );


    if (
        !state.privateMessages[userId]
    ) {

        state.privateMessages[userId] =
            [];

    }


    state.privateMessages[userId].push({

        id:
            Date.now(),

        text:
            text,

        mine:
            true,

        time:
            getTime()

    });


    input.value = "";

    saveState();

    renderPrivateMessages();


    setTimeout(
        () => {

            if (
                state.currentChatUser !==
                user
            ) {

                return;

            }


            state.privateMessages[userId]
                .push({

                    id:
                        Date.now(),

                    text:
                        "That's nice 😊",

                    mine:
                        false,

                    time:
                        getTime()

                });


            saveState();

            renderPrivateMessages();

        },
        1000
    );

}


function renderPrivateMessages() {

    const container =
        $("privateMessages");


    if (!container) {
        return;
    }


    const user =
        state.currentChatUser;


    if (!user) {
        return;
    }


    const userId =
        getPlayerId(
            user
        );


    const messages =
        state.privateMessages[userId] ||
        [];


    container.innerHTML = "";


    messages.forEach(
        message => {

            const bubble =
                document.createElement(
                    "div"
                );


            bubble.className =
                message.mine
                    ? "private-message mine"
                    : "private-message other";


            bubble.textContent =
                message.text;


            container.appendChild(
                bubble
            );

        }
    );


    container.scrollTop =
        container.scrollHeight;

}


/* =========================================================
   BLOCK USER
========================================================= */

function blockSelectedUser() {

    const user =
        state.selectedMember;


    if (!user) {
        return;
    }


    if (
        !confirm(
            `Block ${user.name}?`
        )
    ) {

        return;

    }


    const id =
        getPlayerId(
            user
        );


    if (
        !state.blockedUsers.includes(
            id
        )
    ) {

        state.blockedUsers.push(
            id
        );

    }


    state.roomMembers =
        state.roomMembers.filter(
            member =>
                getPlayerId(
                    member
                ) !== id
        );


    saveState();

    renderRoom();

    closeModal(
        "userModal"
    );


    notify(
        `${user.name} blocked.`,
        "🚫"
    );


    if (
        flirthubSocket &&
        flirthubSocket.connected &&
        user.socketId
    ) {

        flirthubSocket.emit(
            "blockPlayer",
            {
                targetSocketId:
                    user.socketId
            }
        );

    }

}


/* =========================================================
   MUSIC
========================================================= */

function openMusic() {

    showModal(
        "songModal"
    );

}


function searchMusic() {

    const input =
        $("songSearchInput");

    const results =
        $("songResults");


    if (!input || !results) {
        return;
    }


    const query =
        input.value.trim();


    if (!query) {

        results.innerHTML =
            `
            <div class="empty-state">
                Type a song name first.
            </div>
            `;

        return;
    }


    results.innerHTML =
        `
        <div class="music-result">

            <div class="music-cover">
                🎵
            </div>

            <div class="music-info">

                <strong>
                    ${escapeHTML(query)}
                </strong>

                <small>
                    YouTube Music
                </small>

            </div>

            <button
                class="primary-button"
                id="playSearchSong">
                PLAY
            </button>

        </div>
        `;


    $("playSearchSong")
        ?.addEventListener(
            "click",
            () => {

                playSong(
                    query
                );

            }
        );

}


function playSong(song) {

    if (
        state.money < 10
    ) {

        notify(
            "You need 10 coins to play a song.",
            "💰"
        );

        return;

    }


    state.money -= 10;

    state.songPoints += 10;

    state.leaguePoints += 5;

    saveState();

    updateAllUI();


    notify(
        `Playing "${song}" 🎵`,
        "🎵"
    );


    closeModal(
        "songModal"
    );

}


/* =========================================================
   GIFTS
========================================================= */

function openGiftStore() {

    const grid =
        $("giftGrid");


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    const gifts = [

        {
            emoji: "🌹",
            name: "Rose",
            price: 10
        },

        {
            emoji: "🍫",
            name: "Chocolate",
            price: 20
        },

        {
            emoji: "💐",
            name: "Flowers",
            price: 30
        },

        {
            emoji: "💎",
            name: "Diamond",
            price: 100
        },

        {
            emoji: "💖",
            name: "Love Heart",
            price: 50
        },

        {
            emoji: "🎁",
            name: "Mystery Gift",
            price: 75
        }

    ];


    gifts.forEach(
        gift => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "gift-item";


            button.innerHTML =
                `
                <span class="gift-icon">
                    ${gift.emoji}
                </span>

                <strong>
                    ${gift.name}
                </strong>

                <small>
                    ❤️ ${gift.price}
                </small>
                `;


            button.addEventListener(
                "click",
                () => {

                    sendGift(
                        gift
                    );

                }
            );


            grid.appendChild(
                button
            );

        }
    );


    showModal(
        "giftModal"
    );

}


function sendGift(gift) {

    const target =
        state.selectedMember;


    if (!target) {

        notify(
            "Choose a player first.",
            "⚠️"
        );

        return;

    }


    if (
        state.hearts <
        gift.price
    ) {

        notify(
            "Not enough Hearts.",
            "❤️"
        );

        return;

    }


    state.hearts -=
        gift.price;


    state.kissPoints += 2;

    state.leaguePoints +=
        Math.floor(
            gift.price / 5
        );


    saveState();

    updateAllUI();


    closeModal(
        "giftModal"
    );


    notify(
        `You sent ${gift.name} ${gift.emoji} to ${target.name}!`,
        "🎁"
    );

}


/* =========================================================
   EMOTIONS
========================================================= */

function sendEmotion(emotion) {

    const input =
        $("roomMessageInput");


    if (input) {

        input.value =
            emotion;

    }


    closeModal(
        "emotionModal"
    );

}


/* =========================================================
   STORE
========================================================= */

function openStore() {

    const amount =
        50;


    state.hearts +=
        amount;


    saveState();

    updateAllUI();


    notify(
        `+${amount} free Hearts ❤️`,
        "❤️"
    );

}


/* =========================================================
   DAILY REWARD
========================================================= */

function claimDailyReward() {

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);


    if (
        state.lastDailyReward ===
        today
    ) {

        notify(
            "You already claimed today's reward.",
            "🎁"
        );

        return;

    }


    state.lastDailyReward =
        today;


    state.hearts +=
        50;


    state.leaguePoints +=
        25;


    saveState();

    updateAllUI();

    closeModal(
        "rewardModal"
    );


    notify(
        "Daily reward claimed! +50 Hearts ❤️",
        "🎁"
    );

}


/* =========================================================
   LANGUAGE
========================================================= */

function changeLanguage(language) {

    state.language =
        language;


    const names = {

        en: "English",

        ar: "العربية",

        ru: "Русский",

        tr: "Türkçe",

        uz: "O'zbek",

        ko: "한국어"

    };


    const current =
        $("currentLanguage");


    if (current) {

        current.textContent =
            names[language] ||
            "English";

    }


    saveState();

    closeModal(
        "languageModal"
    );


    notify(
        `Language changed to ${
            names[language] ||
            "English"
        }`,
        "🌐"
    );

}


/* =========================================================
   SOCKET.IO CONNECTION
========================================================= */

function connectFlirtHubServer() {

    if (
        typeof io ===
        "undefined"
    ) {

        console.warn(
            "Socket.IO is not available. Running local mode."
        );

        return;
    }


    try {

        flirthubSocket =
            io();


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


        flirthubSocket.on(
            "roomJoined",
            data => {

                state.room =
                    Number(
                        data.room
                    ) || 1;


                if (
                    Array.isArray(
                        data.users
                    )
                ) {

                    state.roomMembers =
                        data.users;

                }


                saveState();

                renderRoom();

            }
        );


        flirthubSocket.on(
            "roomUsers",
            users => {

                if (
                    Array.isArray(
                        users
                    )
                ) {

                    state.roomMembers =
                        users.filter(
                            user =>
                                !state.blockedUsers.includes(
                                    getPlayerId(
                                        user
                                    )
                                )
                        );

                }


                renderRoom();

            }
        );


        flirthubSocket.on(
            "playerJoined",
            player => {

                const exists =
                    state.roomMembers.some(
                        member =>
                            getPlayerId(
                                member
                            ) ===
                            getPlayerId(
                                player
                            )
                    );


                if (!exists) {

                    state.roomMembers.push(
                        player
                    );

                }


                renderRoom();

                notify(
                    `${player.name} joined the room.`,
                    "👋"
                );

            }
        );


        flirthubSocket.on(
            "playerLeft",
            data => {

                state.roomMembers =
                    state.roomMembers.filter(
                        player =>
                            player.socketId !==
                            data.socketId
                    );


                renderRoom();

            }
        );


        flirthubSocket.on(
            "newMessage",
            handleNewMessage
        );


        flirthubSocket.on(
            "roomFull",
            data => {

                notify(
                    `Room ${data.room} is full.`,
                    "⚠️"
                );

            }
        );


        flirthubSocket.on(
            "kissRequest",
            handleKissRequest
        );


        flirthubSocket.on(
            "kissResponse",
            data => {

                if (
                    data.accepted
                ) {

                    state.kissPoints +=
                        10;

                    state.leaguePoints +=
                        10;

                    saveState();

                    updateAllUI();

                    notify(
                        `${data.fromName || "Player"} accepted your kiss! 💋`,
                        "💋"
                    );

                } else {

                    notify(
                        `${data.fromName || "Player"} refused your kiss.`,
                        "❌"
                    );

                }

            }
        );


        flirthubSocket.on(
            "playerBlocked",
            () => {

                notify(
                    "Player blocked.",
                    "🚫"
                );

            }
        );


        flirthubSocket.on(
            "connect_error",
            error => {

                console.warn(
                    "Socket connection error:",
                    error.message
                );

            }
        );


        flirthubSocket.on(
            "disconnect",
            () => {

                console.log(
                    "Disconnected from server."
                );

            }
        );


    } catch (error) {

        console.error(
            "Socket initialization failed:",
            error
        );

    }

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


function getPlayerId(player) {

    if (!player) {
        return "";
    }


    return String(
        player.id ||
        player.userId ||
        player.socketId ||
        player.name ||
        ""
    );

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


    flirthubSocket.emit(
        "joinRoom",
        {

            room:
                state.room || 1,

            id:
                getCurrentUserId(),

            name:
                state.name || "Player",

            age:
                state.age || 18,

            gender:
                state.gender || "Male",

            avatar:
                state.avatar || ""

        }
    );

}


/* =========================================================
   MAKE GLOBAL FUNCTIONS
   For HTML buttons that may use onclick=""
========================================================= */

window.startGame =
    startGame;

window.openAccount =
    openAccount;

window.openMusic =
    openMusic;

window.openGiftStore =
    openGiftStore;

window.openStore =
    openStore;

window.spinBottle =
    spinBottle;

window.acceptKiss =
    acceptKiss;

window.refuseKiss =
    refuseKiss;

window.sendRoomMessage =
    sendRoomMessage;

window.changeRoom =
    changeRoom;

window.openRoomChanger =
    openRoomChanger;

window.createAccount =
    createAccount;

window.sendGift =
    sendGift;

window.openSettings =
    () => showModal(
        "settingsModal"
    );

window.closeModal =
    closeModal;


/* =========================================================
   END
========================================================= */
