/* =========================================================
   FLIRTHUBX — APP.JS
   Main game logic for public/index.html
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

    messages: [],
    privateMessages: {},

    blockedUsers: [],

    roomMembers: [
        {
            id: "demo-1",
            name: "Alex",
            gender: "Male",
            age: 22,
            avatar: "https://i.pravatar.cc/150?img=12",
            online: true
        },
        {
            id: "demo-2",
            name: "Mia",
            gender: "Female",
            age: 21,
            avatar: "https://i.pravatar.cc/150?img=47",
            online: true
        },
        {
            id: "demo-3",
            name: "Daniel",
            gender: "Male",
            age: 23,
            avatar: "https://i.pravatar.cc/150?img=11",
            online: true
        },
        {
            id: "demo-4",
            name: "Lina",
            gender: "Female",
            age: 20,
            avatar: "https://i.pravatar.cc/150?img=44",
            online: false
        }
    ]
};


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let flirthubSocket = null;
let selectedUser = null;
let selectedMessage = null;
let kissTarget = null;
let kissInterval = null;
let leagueInterval = null;
let kickInterval = null;


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
        console.error("Could not save state:", error);
    }
}


function loadState() {

    try {

        const saved =
            localStorage.getItem("flirthubx_state");

        if (!saved) {
            return false;
        }

        const data = JSON.parse(saved);

        Object.assign(state, data);

        return true;

    } catch (error) {

        console.error(
            "Could not load FlirtHubX state:",
            error
        );

        return false;
    }
}


/* =========================================================
   DOM HELPERS
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


function showScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {
            screen.classList.remove("active");
            screen.classList.add("hidden");
        });

    const screen = $(id);

    if (screen) {

        screen.classList.remove("hidden");
        screen.classList.add("active");

    }
}


/* =========================================================
   NOTIFICATION
========================================================= */

function notify(message, icon = "✓") {

    const notification = $("notification");
    const text = $("notificationText");
    const notificationIcon = $("notificationIcon");

    if (!notification) {
        alert(message);
        return;
    }

    if (text) {
        text.textContent = message;
    }

    if (notificationIcon) {
        notificationIcon.textContent = icon;
    }

    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 2500);
}


/* =========================================================
   MODALS
========================================================= */

function openModal(id) {

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


function closeAllModals() {

    document
        .querySelectorAll(".modal")
        .forEach(modal => {
            modal.classList.add("hidden");
        });

    const options = $("messageOptions");

    if (options) {
        options.classList.add("hidden");
    }
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const existingAccount = loadState();

        initializeTelegram();
        initializeButtons();
        initializeAvatarUpload();
        initializeLanguageButtons();

        startLoadingAnimation();

        startLeagueTimer();

        /*
         * Wait until the loading animation finishes.
         */

        setTimeout(() => {

            if (
                existingAccount &&
                state.profileCreated &&
                state.name
            ) {

                updateAllUI();
                renderRoom();

                showScreen("homeScreen");

                connectFlirtHubServer();

            } else {

                showScreen("startScreen");

            }

        }, 1900);

    }
);


/* =========================================================
   LOADING
========================================================= */

function startLoadingAnimation() {

    const progress = $("loadingProgress");
    const percent = $("loadingPercent");

    let value = 0;

    const interval = setInterval(() => {

        value += Math.floor(
            Math.random() * 8
        ) + 3;

        if (value >= 100) {

            value = 100;

            clearInterval(interval);

        }

        if (progress) {
            progress.style.width =
                `${value}%`;
        }

        if (percent) {
            percent.textContent =
                `${value}%`;
        }

    }, 70);
}


/* =========================================================
   TELEGRAM
========================================================= */

function initializeTelegram() {

    try {

        if (
            window.Telegram &&
            Telegram.WebApp
        ) {

            Telegram.WebApp.ready();

            Telegram.WebApp.expand();

            if (
                Telegram.WebApp
                    .setHeaderColor
            ) {

                Telegram.WebApp
                    .setHeaderColor("#111111");

            }

        }

    } catch (error) {

        console.log(
            "Telegram initialization skipped.",
            error
        );

    }
}


/* =========================================================
   BUTTON INITIALIZATION
========================================================= */

function initializeButtons() {

    /* START */

    const startButton = $("startButton");

    if (startButton) {

        startButton.addEventListener(
            "click",
            () => {

                showScreen(
                    "accountScreen"
                );

            }
        );

    }


    /* ACCOUNT */

    const createAccountButton =
        $("createAccountButton");

    if (createAccountButton) {

        createAccountButton.addEventListener(
            "click",
            createAccount
        );

    }


    const accountBack = $("accountBack");

    if (accountBack) {

        accountBack.addEventListener(
            "click",
            () => {
                showScreen("startScreen");
            }
        );

    }


    /* PROFILE */

    const profileButton =
        $("profileButton");

    if (profileButton) {

        profileButton.addEventListener(
            "click",
            openMyProfile
        );

    }


    /* HEARTS */

    const buyHeartButton =
        $("buyHeartButton");

    if (buyHeartButton) {

        buyHeartButton.addEventListener(
            "click",
            openStore
        );

    }


    /* MUSIC */

    const songButton =
        $("songButton");

    if (songButton) {

        songButton.addEventListener(
            "click",
            openSongModal
        );

    }


    const songSearchButton =
        $("songSearchButton");

    if (songSearchButton) {

        songSearchButton.addEventListener(
            "click",
            searchSong
        );

    }


    /* SETTINGS */

    const settingsButton =
        $("settingsButton");

    if (settingsButton) {

        settingsButton.addEventListener(
            "click",
            () => openModal("settingsModal")
        );

    }


    /* CHANGE ROOM */

    const changeRoomButton =
        $("changeRoomButton");

    if (changeRoomButton) {

        changeRoomButton.addEventListener(
            "click",
            openRoomSelector
        );

    }


    /* ROOM CHAT */

    const sendButton =
        $("sendRoomMessageButton");

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendRoomMessage
        );

    }


    const roomInput =
        $("roomMessageInput");

    if (roomInput) {

        roomInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    sendRoomMessage();

                }

            }
        );

        roomInput.addEventListener(
            "input",
            handleTyping
        );

    }


    /* EDIT PROFILE */

    const editProfile =
        $("editProfileButton");

    if (editProfile) {

        editProfile.addEventListener(
            "click",
            () => {

                closeModal("profileModal");

                fillProfileForm();

                showScreen(
                    "accountScreen"
                );

            }
        );

    }


    /* MESSAGE USER */

    const messageUser =
        $("messageUserButton");

    if (messageUser) {

        messageUser.addEventListener(
            "click",
            openPrivateChat
        );

    }


    /* BLOCK */

    const blockUser =
        $("blockUserButton");

    if (blockUser) {

        blockUser.addEventListener(
            "click",
            blockSelectedUser
        );

    }


    const blockFromMessage =
        $("blockFromMessageButton");

    if (blockFromMessage) {

        blockFromMessage.addEventListener(
            "click",
            blockSelectedUser
        );

    }


    /* GIFT */

    const giftButton =
        $("giftButton");

    if (giftButton) {

        giftButton.addEventListener(
            "click",
            openGiftModal
        );

    }


    /* PRIVATE CHAT */

    const sendPrivate =
        $("sendPrivateMessageButton");

    if (sendPrivate) {

        sendPrivate.addEventListener(
            "click",
            sendPrivateMessage
        );

    }


    const privateInput =
        $("privateMessageInput");

    if (privateInput) {

        privateInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    sendPrivateMessage();

                }

            }
        );

    }


    /* CHAT SONG */

    const chatSongButton =
        $("chatSongButton");

    if (chatSongButton) {

        chatSongButton.addEventListener(
            "click",
            openSongModal
        );

    }


    /* MESSAGE OPTIONS */

    const translateButton =
        $("translateMessageButton");

    if (translateButton) {

        translateButton.addEventListener(
            "click",
            translateSelectedMessage
        );

    }


    const copyButton =
        $("copyMessageButton");

    if (copyButton) {

        copyButton.addEventListener(
            "click",
            copySelectedMessage
        );

    }


    const replyButton =
        $("replyMessageButton");

    if (replyButton) {

        replyButton.addEventListener(
            "click",
            replyToSelectedMessage
        );

    }


    /* LANGUAGE */

    const languageButton =
        $("languageSettingButton");

    if (languageButton) {

        languageButton.addEventListener(
            "click",
            () => openModal("languageModal")
        );

    }


    /* PRIVACY */

    const privacyButton =
        $("privacySettingButton");

    if (privacyButton) {

        privacyButton.addEventListener(
            "click",
            () => {

                notify(
                    "Privacy settings will be connected to your account.",
                    "🔒"
                );

            }
        );

    }


    /* NOTIFICATIONS */

    const notificationButton =
        $("notificationsSettingButton");

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            () => {

                notify(
                    "Notifications settings opened.",
                    "🔔"
                );

            }
        );

    }


    /* ACCOUNT SETTING */

    const accountSetting =
        $("accountSettingButton");

    if (accountSetting) {

        accountSetting.addEventListener(
            "click",
            () => {

                closeModal("settingsModal");

                openMyProfile();

            }
        );

    }


    /* DAILY REWARD */

    const claimReward =
        $("claimRewardButton");

    if (claimReward) {

        claimReward.addEventListener(
            "click",
            claimDailyReward
        );

    }


    /* SAVE ROOM */

    const saveRoom =
        $("saveRoomButton");

    if (saveRoom) {

        saveRoom.addEventListener(
            "click",
            () => {

                closeModal("kickModal");

                notify(
                    "Room saved! ❤️",
                    "✓"
                );

            }
        );

    }


    /* MODAL CLOSE BUTTONS */

    document
        .querySelectorAll("[data-close]")
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


    /* CLICK OUTSIDE MODAL */

    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        modal.classList.add(
                            "hidden"
                        );

                    }

                }
            );

        });

}


/* =========================================================
   PROFILE CREATION
========================================================= */

function createAccount() {

    const nameInput =
        $("nameInput");

    const ageInput =
        $("ageInput");

    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    const age =
        ageInput
            ? Number(ageInput.value)
            : 0;


    if (!name) {

        notify(
            "Please enter your name.",
            "!"
        );

        return;
    }


    if (
        !age ||
        age < 18 ||
        age > 100
    ) {

        notify(
            "You must be 18 or older.",
            "!"
        );

        return;
    }


    if (!state.gender) {

        notify(
            "Please select your gender.",
            "!"
        );

        return;
    }


    state.name = name;
    state.age = age;

    state.profileCreated = true;

    if (!state.avatar) {

        state.avatar =
            "https://i.pravatar.cc/300?img=12";

    }

    saveState();

    updateAllUI();

    showScreen("homeScreen");

    renderRoom();

    connectFlirtHubServer();

    notify(
        `Welcome to FlirtHubX, ${name}! ❤️`,
        "❤️"
    );

}


/* =========================================================
   AVATAR UPLOAD
========================================================= */

function initializeAvatarUpload() {

    const chooseButton =
        $("chooseAvatarButton");

    const input =
        $("avatarInput");

    if (
        !chooseButton ||
        !input
    ) {
        return;
    }


    chooseButton.addEventListener(
        "click",
        () => {
            input.click();
        }
    );


    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];

            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                notify(
                    "Please choose an image.",
                    "!"
                );

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

                    preview.innerHTML = `
                        <img
                            src="${escapeHTML(
                                state.avatar
                            )}"
                            alt="Avatar"
                        >
                    `;

                }

                saveState();

            };


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   GENDER
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
                item => {
                    item.classList.remove(
                        "selected"
                    );
                }
            );


        button.classList.add(
            "selected"
        );


        state.gender =
            button.dataset.gender ===
            "female"
                ? "Female"
                : "Male";


        saveState();

    }
);


/* =========================================================
   PROFILE FORM
========================================================= */

function fillProfileForm() {

    const nameInput =
        $("nameInput");

    const ageInput =
        $("ageInput");

    if (nameInput) {
        nameInput.value =
            state.name || "";
    }

    if (ageInput) {
        ageInput.value =
            state.age || 18;
    }


    document
        .querySelectorAll(
            ".gender-button"
        )
        .forEach(button => {

            const gender =
                button.dataset.gender ===
                "female"
                    ? "Female"
                    : "Male";

            button.classList.toggle(
                "selected",
                gender === state.gender
            );

        });


    const preview =
        $("avatarPreview");

    if (
        preview &&
        state.avatar
    ) {

        preview.innerHTML = `
            <img
                src="${escapeHTML(
                    state.avatar
                )}"
                alt="Avatar"
            >
        `;

    }

}


/* =========================================================
   ACCOUNT UI
========================================================= */

function updateAllUI() {

    updateBalances();
    updateProfileUI();
    updateLeagueUI();
}


function updateBalances() {

    setText(
        "heartBalance",
        state.hearts
    );

    setText(
        "profileHearts",
        state.hearts
    );

    setText(
        "profileKisses",
        state.kissPoints
    );

    setText(
        "profileSongPoints",
        state.songPoints
    );

}


function updateProfileUI() {

    setText(
        "profileName",
        state.name || "Your Name"
    );

    setText(
        "profileAge",
        state.age || 18
    );


    const avatar =
        $("profileAvatar");

    if (
        avatar &&
        state.avatar
    ) {

        avatar.innerHTML = `
            <img
                src="${escapeHTML(
                    state.avatar
                )}"
                alt="Profile"
            >
        `;

    }


    const choiceAvatar =
        $("choiceMyAvatar");

    if (
        choiceAvatar &&
        state.avatar
    ) {

        choiceAvatar.innerHTML = `
            <img
                src="${escapeHTML(
                    state.avatar
                )}"
                alt="You"
            >
        `;

    }


    setText(
        "choiceMyName",
        state.name || "You"
    );

}


function setText(id, value) {

    const element = $(id);

    if (element) {
        element.textContent = value;
    }

}


/* =========================================================
   MY PROFILE
========================================================= */

function openMyProfile() {

    updateAllUI();

    openModal("profileModal");

}


/* =========================================================
   ROOM
========================================================= */

function renderRoom() {

    setText(
        "roomNumber",
        state.room
    );


    const validMembers =
        state.roomMembers.filter(
            member =>
                !state.blockedUsers.includes(
                    String(
                        member.socketId ||
                        member.id
                    )
                )
        );


    setText(
        "playerCount",
        `${Math.min(
            validMembers.length,
            10
        )} / 10`
    );


    renderPlayers();
    renderMessages();

}


/* =========================================================
   PLAYERS
========================================================= */

function renderPlayers() {

    const grid =
        $("playerGrid");

    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    const players =
        state.roomMembers
            .filter(
                member =>
                    !state.blockedUsers.includes(
                        String(
                            member.socketId ||
                            member.id
                        )
                    )
            )
            .slice(0, 10);


    players.forEach(
        member => {

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


            const image =
                document.createElement(
                    "img"
                );

            image.src =
                member.avatar ||
                "https://i.pravatar.cc/150?img=12";

            image.alt =
                member.name || "Player";


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
                    "strong"
                );

            name.textContent =
                member.name || "Player";


            const age =
                document.createElement(
                    "small"
                );

            age.textContent =
                member.age
                    ? `${member.age}`
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
                    openUserProfile(member);
                }
            );


            grid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   USER PROFILE
========================================================= */

function openUserProfile(member) {

    if (!member) {
        return;
    }


    selectedUser =
        member;


    setText(
        "userName",
        member.name || "Player"
    );


    setText(
        "userAge",
        member.age
            ? `${member.age} years old`
            : ""
    );


    const avatar =
        $("userAvatar");

    if (avatar) {

        avatar.innerHTML = `
            <img
                src="${escapeHTML(
                    member.avatar ||
                    "https://i.pravatar.cc/150?img=12"
                )}"
                alt="User"
            >
        `;

    }


    openModal("userModal");

}


/* =========================================================
   PRIVATE CHAT
========================================================= */

function openPrivateChat() {

    if (!selectedUser) {
        return;
    }


    closeModal("userModal");


    const userId =
        getUserKey(selectedUser);


    if (!state.privateMessages[userId]) {

        state.privateMessages[userId] =
            [];

    }


    setText(
        "chatName",
        selectedUser.name
    );


    setText(
        "chatStatus",
        selectedUser.online
            ? "Online"
            : "Offline"
    );


    const avatar =
        $("chatAvatar");

    if (avatar) {

        avatar.innerHTML = `
            <img
                src="${escapeHTML(
                    selectedUser.avatar ||
                    "https://i.pravatar.cc/150?img=12"
                )}"
                alt="Chat"
            >
        `;

    }


    renderPrivateMessages();

    openModal("chatModal");

}


function getUserKey(user) {

    return String(
        user.socketId ||
        user.id ||
        user.name
    );

}


function renderPrivateMessages() {

    const container =
        $("privateMessages");

    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!selectedUser) {
        return;
    }


    const userId =
        getUserKey(selectedUser);


    const messages =
        state.privateMessages[userId] ||
        [];


    messages.forEach(
        message => {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                message.mine
                    ? "private-message mine"
                    : "private-message other";


            const bubble =
                document.createElement(
                    "div"
                );

            bubble.className =
                "private-bubble";


            bubble.textContent =
                message.text;


            wrapper.appendChild(
                bubble
            );


            container.appendChild(
                wrapper
            );

        }
    );


    container.scrollTop =
        container.scrollHeight;

}


function sendPrivateMessage() {

    const input =
        $("privateMessageInput");

    if (
        !input ||
        !selectedUser
    ) {
        return;
    }


    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    const userId =
        getUserKey(selectedUser);


    if (!state.privateMessages[userId]) {

        state.privateMessages[userId] =
            [];

    }


    state.privateMessages[userId].push({

        text:
            text,

        mine:
            true,

        time:
            Date.now()

    });


    input.value = "";

    saveState();

    renderPrivateMessages();


    /*
     * Demo reply.
     */

    setTimeout(
        () => {

            state.privateMessages[userId]
                .push({

                    text:
                        "Nice to meet you! 😊",

                    mine:
                        false,

                    time:
                        Date.now()

                });


            saveState();

            renderPrivateMessages();

        },
        1000
    );

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


    /*
     * Real multiplayer.
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
     * Local testing mode.
     */

    const message = {

        id:
            `${Date.now()}-${Math.random()}`,

        userId:
            getCurrentUserId(),

        name:
            state.name || "You",

        gender:
            state.gender || "Male",

        text:
            text,

        translation:
            "",

        mine:
            true,

        timestamp:
            Date.now(),

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
     * Demo response.
     */

    setTimeout(
        () => {

            const demo =
                state.roomMembers.find(
                    member =>
                        member.name !==
                        state.name
                );


            const reply = {

                id:
                    `${Date.now()}-reply`,

                userId:
                    demo
                        ? getUserKey(demo)
                        : "demo",

                name:
                    demo
                        ? demo.name
                        : "Alex",

                gender:
                    demo
                        ? demo.gender
                        : "Male",

                text:
                    "Nice to meet you! 😊",

                translation:
                    "",

                mine:
                    false,

                timestamp:
                    Date.now(),

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


/* =========================================================
   RENDER ROOM MESSAGES
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
                message.name || "Player";


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


            wrapper.addEventListener(
                "click",
                () => {

                    selectedMessage =
                        message;

                    showMessageOptions(
                        wrapper
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
   MESSAGE OPTIONS
========================================================= */

function showMessageOptions(element) {

    const options =
        $("messageOptions");

    if (!options) {
        return;
    }


    const rect =
        element.getBoundingClientRect();


    options.style.position =
        "fixed";

    options.style.left =
        `${Math.max(
            10,
            Math.min(
                window.innerWidth -
                210,
                rect.left
            )
        )}px`;

    options.style.top =
        `${Math.max(
            10,
            rect.top - 170
        )}px`;


    options.classList.remove(
        "hidden"
    );

}


document.addEventListener(
    "click",
    event => {

        const options =
            $("messageOptions");

        if (
            options &&
            !options.contains(
                event.target
            ) &&
            !event.target.closest(
                ".message"
            )
        ) {

            options.classList.add(
                "hidden"
            );

        }

    }
);


/* =========================================================
   TRANSLATION
========================================================= */

function translateSelectedMessage() {

    if (!selectedMessage) {
        return;
    }


    const original =
        $("originalMessage");

    const translated =
        $("translatedMessage");


    if (original) {

        original.textContent =
            selectedMessage.text;

    }


    if (translated) {

        translated.textContent =
            getDemoTranslation(
                selectedMessage.text
            );

    }


    const options =
        $("messageOptions");

    if (options) {
        options.classList.add(
            "hidden"
        );
    }


    openModal(
        "translationModal"
    );

}


function getDemoTranslation(text) {

    const translations = {

        "hello":
            "Hello",

        "hi":
            "Hello",

        "how are you":
            "How are you?",

        "nice to meet you":
            "Nice to meet you.",

        "good morning":
            "Good morning.",

        "good night":
            "Good night."

    };


    const key =
        text
            .trim()
            .toLowerCase();


    return translations[key] ||
        "Automatic translation will be connected to the translation service later.";

}


/* =========================================================
   COPY MESSAGE
========================================================= */

async function copySelectedMessage() {

    if (!selectedMessage) {
        return;
    }


    try {

        await navigator.clipboard.writeText(
            selectedMessage.text
        );


        notify(
            "Message copied.",
            "📋"
        );

    } catch {

        notify(
            "Could not copy message.",
            "!"
        );

    }


    closeMessageOptions();

}


function closeMessageOptions() {

    const options =
        $("messageOptions");

    if (options) {

        options.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   REPLY
========================================================= */

function replyToSelectedMessage() {

    if (!selectedMessage) {
        return;
    }


    const input =
        $("roomMessageInput");

    if (input) {

        input.value =
            `↩️ ${selectedMessage.name}: `;

        input.focus();

    }


    closeMessageOptions();

}


/* =========================================================
   TYPING
========================================================= */

let typingTimeout = null;


function handleTyping() {

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
        typingTimeout
    );


    typingTimeout =
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
   ROOM CHANGE
========================================================= */

function openRoomSelector() {

    renderRoomList();

    openModal(
        "roomModal"
    );

}


function renderRoomList() {

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
            "room-option";


        button.innerHTML = `
            <strong>Room ${room}</strong>
            <span>
                ${room === state.room
                    ? "Current room"
                    : "Join"}
            </span>
        `;


        button.addEventListener(
            "click",
            () => {

                changeRoom(
                    room
                );

                closeModal(
                    "roomModal"
                );

            }
        );


        list.appendChild(
            button
        );

    }

}


function changeRoom(room) {

    const nextRoom =
        Number(room) || 1;


    if (
        flirthubSocket &&
        flirthubSocket.connected
    ) {

        flirthubSocket.emit(
            "changeRoom",
            {
                room: nextRoom
            }
        );

        return;
    }


    state.room =
        nextRoom;


    state.messages = [];

    saveState();

    renderRoom();


    notify(
        `Joined Room ${nextRoom}`,
        "🔄"
    );

}


/* =========================================================
   MUSIC
========================================================= */

function openSongModal() {

    openModal(
        "songModal"
    );

}


function searchSong() {

    const input =
        $("songSearchInput");

    const results =
        $("songResults");


    if (
        !input ||
        !results
    ) {
        return;
    }


    const query =
        input.value.trim();


    if (!query) {

        results.innerHTML = `
            <div class="empty-state">
                Type a song name first.
            </div>
        `;

        return;
    }


    results.innerHTML = "";


    const result =
        document.createElement(
            "div"
        );

    result.className =
        "song-result";


    result.innerHTML = `
        <div class="song-cover">
            🎵
        </div>

        <div class="song-information">
            <strong>
                ${escapeHTML(query)}
            </strong>

            <small>
                Music
            </small>
        </div>

        <button>
            ▶️
        </button>
    `;


    const button =
        result.querySelector(
            "button"
        );


    button.addEventListener(
        "click",
        () => {

            playSong(
                query
            );

        }
    );


    results.appendChild(
        result
    );

}


function playSong(song) {

    if (
        state.money <
        1
    ) {

        notify(
            "You don't have enough money.",
            "!"
        );

        return;
    }


    state.songPoints += 10;

    state.money =
        Math.max(
            0,
            state.money - 1
        );


    saveState();

    updateAllUI();


    closeModal(
        "songModal"
    );


    notify(
        `${song} is playing 🎵`,
        "🎵"
    );

}


/* =========================================================
   GIFTS
========================================================= */

function openGiftModal() {

    closeModal(
        "userModal"
    );

    renderGiftGrid();

    openModal(
        "giftModal"
    );

}


function renderGiftGrid() {

    const grid =
        $("giftGrid");

    if (!grid) {
        return;
    }


    const gifts = [

        {
            name: "Rose",
            emoji: "🌹",
            price: 10
        },

        {
            name: "Heart",
            emoji: "❤️",
            price: 20
        },

        {
            name: "Chocolate",
            emoji: "🍫",
            price: 30
        },

        {
            name: "Teddy Bear",
            emoji: "🧸",
            price: 50
        },

        {
            name: "Diamond",
            emoji: "💎",
            price: 100
        },

        {
            name: "Crown",
            emoji: "👑",
            price: 200
        }

    ];


    grid.innerHTML = "";


    gifts.forEach(
        gift => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "gift-item";


            button.innerHTML = `
                <span class="gift-emoji">
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
                    sendGift(gift);
                }
            );


            grid.appendChild(
                button
            );

        }
    );

}


function sendGift(gift) {

    if (!selectedUser) {
        return;
    }


    if (
        state.hearts <
        gift.price
    ) {

        notify(
            "Not enough Hearts.",
            "!"
        );

        return;
    }


    state.hearts -=
        gift.price;


    saveState();

    updateAllUI();


    closeModal(
        "giftModal"
    );


    notify(
        `You sent ${gift.emoji} to ${selectedUser.name}!`,
        gift.emoji
    );

}


/* =========================================================
   EMOTIONS
========================================================= */

document.addEventListener(
    "click",
    event => {

        const emotion =
            event.target.closest(
                "#emotionGrid button"
            );

        if (!emotion) {
            return;
        }


        const input =
            $("roomMessageInput");

        if (input) {

            input.value +=
                emotion.textContent;

            input.focus();

        }


        closeModal(
            "emotionModal"
        );

    }
);


/* =========================================================
   KISS
========================================================= */

function openKissChoice(member) {

    kissTarget =
        member;


    setText(
        "choiceTargetName",
        member.name
    );


    const targetAvatar =
        $("choiceTargetAvatar");


    if (targetAvatar) {

        targetAvatar.innerHTML = `
            <img
                src="${escapeHTML(
                    member.avatar ||
                    "https://i.pravatar.cc/150?img=12"
                )}"
                alt="Target"
            >
        `;

    }


    openModal(
        "choiceModal"
    );


    startKissCountdown();

}


function startKissCountdown() {

    clearInterval(
        kissInterval
    );


    let seconds = 10;


    setText(
        "kissTimer",
        seconds
    );


    kissInterval =
        setInterval(
            () => {

                seconds--;

                setText(
                    "kissTimer",
                    seconds
                );


                if (
                    seconds <= 0
                ) {

                    clearInterval(
                        kissInterval
                    );

                    closeModal(
                        "choiceModal"
                    );

                }

            },
            1000
        );

}


/* KISS BUTTONS */

document.addEventListener(
    "click",
    event => {

        if (
            event.target.closest(
                "#kissButton"
            )
        ) {

            acceptKiss();

        }


        if (
            event.target.closest(
                "#refuseButton"
            )
        ) {

            refuseKiss();

        }

    }
);


function acceptKiss() {

    clearInterval(
        kissInterval
    );


    if (!kissTarget) {
        return;
    }


    state.kissPoints += 1;

    saveState();

    updateAllUI();


    if (
        flirthubSocket &&
        flirthubSocket.connected &&
        kissTarget.socketId
    ) {

        flirthubSocket.emit(
            "kissResponse",
            {
                targetSocketId:
                    kissTarget.socketId,

                accepted:
                    true
            }
        );

    }


    closeModal(
        "choiceModal"
    );


    notify(
        `You kissed ${kissTarget.name}! 💋`,
        "💋"
    );

}


function refuseKiss() {

    clearInterval(
        kissInterval
    );


    if (
        flirthubSocket &&
        flirthubSocket.connected &&
        kissTarget &&
        kissTarget.socketId
    ) {

        flirthubSocket.emit(
            "kissResponse",
            {
                targetSocketId:
                    kissTarget.socketId,

                accepted:
                    false
            }
        );

    }


    closeModal(
        "choiceModal"
    );


    notify(
        "Kiss refused.",
        "💔"
    );

}


/* =========================================================
   BLOCK USER
========================================================= */

function blockSelectedUser() {

    if (!selectedUser) {
        return;
    }


    const confirmed =
        confirm(
            `Block ${selectedUser.name}?`
        );


    if (!confirmed) {
        return;
    }


    const id =
        getUserKey(
            selectedUser
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


    if (
        flirthubSocket &&
        flirthubSocket.connected &&
        selectedUser.socketId
    ) {

        flirthubSocket.emit(
            "blockPlayer",
            {
                targetSocketId:
                    selectedUser.socketId
            }
        );

    }


    saveState();

    closeAllModals();

    renderRoom();


    notify(
        `${selectedUser.name} blocked.`,
        "🚫"
    );


    selectedUser = null;

}


/* =========================================================
   DAILY REWARD
========================================================= */

function claimDailyReward() {

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);


    const lastReward =
        localStorage.getItem(
            "flirthubx_daily_reward"
        );


    if (
        lastReward ===
        today
    ) {

        notify(
            "You already claimed today's reward.",
            "🎁"
        );

        return;
    }


    state.hearts += 50;

    localStorage.setItem(
        "flirthubx_daily_reward",
        today
    );


    saveState();

    updateAllUI();

    closeModal(
        "rewardModal"
    );


    notify(
        "You received 50 Hearts! ❤️",
        "🎁"
    );

}


/* =========================================================
   LEAGUE
========================================================= */

function updateLeagueUI() {

    const icon =
        $("leagueIcon");

    const name =
        $("leagueName");

    const profileLeague =
        $("profileLeague");


    if (
        icon &&
        name
    ) {

        if (
            state.kissPoints >=
            100
        ) {

            icon.textContent =
                "🥇";

            name.textContent =
                "Gold League";

        } else if (
            state.kissPoints >=
            30
        ) {

            icon.textContent =
                "🥈";

            name.textContent =
                "Silver League";

        } else {

            icon.textContent =
                "🥉";

            name.textContent =
                "Bronze League";

        }

    }


    if (profileLeague) {

        if (
            state.kissPoints >=
            100
        ) {

            profileLeague.textContent =
                "🥇 Gold";

        } else if (
            state.kissPoints >=
            30
        ) {

            profileLeague.textContent =
                "🥈 Silver";

        } else {

            profileLeague.textContent =
                "🥉 Bronze";

        }

    }

}


function startLeagueTimer() {

    clearInterval(
        leagueInterval
    );


    let seconds =
        24 * 60 * 60;


    leagueInterval =
        setInterval(
            () => {

                seconds--;

                if (
                    seconds <= 0
                ) {

                    seconds =
                        24 * 60 * 60;

                }


                const hours =
                    Math.floor(
                        seconds / 3600
                    );


                const minutes =
                    Math.floor(
                        (seconds % 3600) /
                        60
                    );


                const secs =
                    seconds % 60;


                setText(
                    "leagueTimer",
                    `${String(hours).padStart(
                        2,
                        "0"
                    )}:${String(minutes).padStart(
                        2,
                        "0"
                    )}:${String(secs).padStart(
                        2,
                        "0"
                    )}`
                );

            },
            1000
        );

}


/* =========================================================
   LANGUAGE
========================================================= */

function initializeLanguageButtons() {

    document
        .querySelectorAll(
            "[data-language]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const language =
                        button.dataset.language;

                    changeLanguage(
                        language
                    );

                }
            );

        });

}


function changeLanguage(language) {

    state.language =
        language || "en";


    const names = {

        en:
            "English",

        ar:
            "العربية",

        ru:
            "Русский",

        tr:
            "Türkçe",

        uz:
            "O'zbek",

        ko:
            "한국어"

    };


    setText(
        "currentLanguage",
        names[
            state.language
        ] || "English"
    );


    saveState();

    closeModal(
        "languageModal"
    );


    notify(
        `Language: ${
            names[state.language] ||
            "English"
        }`,
        "🌐"
    );

}


/* =========================================================
   SOCKET.IO
========================================================= */

function connectFlirtHubServer() {

    if (
        flirthubSocket &&
        flirthubSocket.connected
    ) {
        return;
    }


    if (
        typeof io ===
        "undefined"
    ) {

        console.log(
            "Socket.IO is not available. Local mode enabled."
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
            "disconnect",
            () => {

                console.log(
                    "FlirtHubX disconnected."
                );

            }
        );


        /* ROOM JOINED */

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


        /* ROOM FULL */

        flirthubSocket.on(
            "roomFull",
            data => {

                notify(
                    `Room ${
                        data &&
                        data.room
                            ? data.room
                            : state.room
                    } is full.`,
                    "!"
                );

            }
        );


        /* PLAYER JOINED */

        flirthubSocket.on(
            "playerJoined",
            player => {

                if (!player) {
                    return;
                }


                const exists =
                    state.roomMembers.some(
                        user =>
                            String(
                                user.socketId ||
                                user.id
                            ) ===
                            String(
                                player.socketId ||
                                player.id
                            )
                    );


                if (!exists) {

                    state.roomMembers.push(
                        player
                    );

                }


                renderRoom();

            }
        );


        /* PLAYER LEFT */

        flirthubSocket.on(
            "playerLeft",
            data => {

                if (!data) {
                    return;
                }


                state.roomMembers =
                    state.roomMembers.filter(
                        user =>
                            String(
                                user.socketId
                            ) !==
                            String(
                                data.socketId
                            )
                    );


                renderRoom();

            }
        );


        /* ROOM USERS */

        flirthubSocket.on(
            "roomUsers",
            users => {

                if (
                    Array.isArray(
                        users
                    )
                ) {

                    state.roomMembers =
                        users;

                    renderRoom();

                }

            }
        );


        /* NEW MESSAGE */

        flirthubSocket.on(
            "newMessage",
            message => {

                if (!message) {
                    return;
                }


                const exists =
                    state.messages.some(
                        item =>
                            String(
                                item.id
                            ) ===
                            String(
                                message.id
                            )
                    );


                if (!exists) {

                    state.messages.push({

                        id:
                            message.id ||
                            Date.now(),

                        userId:
                            message.userId ||
                            "",

                        name:
                            message.name ||
                            "Player",

                        gender:
                            message.gender ||
                            "",

                        text:
                            message.text ||
                            "",

                        translation:
                            "",

                        mine:
                            String(
                                message.userId
                            ) ===
                            String(
                                getCurrentUserId()
                            ),

                        timestamp:
                            message.timestamp ||
                            Date.now(),

                        time:
                            message.timestamp
                                ? new Date(
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
                                : getTime()

                    });

                }


                saveState();

                renderMessages();

            }
        );


        /* TYPING */

        flirthubSocket.on(
            "playerTyping",
            data => {

                if (
                    data &&
                    data.name
                ) {

                    console.log(
                        `${data.name} is typing...`
                    );

                }

            }
        );


        flirthubSocket.on(
            "playerStoppedTyping",
            data => {

                console.log(
                    "Player stopped typing:",
                    data
                );

            }
        );


        /* KISS REQUEST */

        flirthubSocket.on(
            "kissRequest",
            data => {

                if (!data) {
                    return;
                }


                const member = {

                    socketId:
                        data.fromSocketId,

                    name:
                        data.fromName ||
                        "Player",

                    gender:
                        data.fromGender ||
                        "",

                    age:
                        data.fromAge ||
                        18,

                    avatar:
                        data.fromAvatar ||
                        "https://i.pravatar.cc/150?img=12",

                    online:
                        true

                };


                openKissChoice(
                    member
                );

            }
        );


        /* KISS RESPONSE */

        flirthubSocket.on(
            "kissResponse",
            data => {

                if (!data) {
                    return;
                }


                if (
                    data.accepted
                ) {

                    state.kissPoints +=
                        1;

                    saveState();

                    updateAllUI();


                    notify(
                        `${
                            data.fromName ||
                            "Someone"
                        } accepted your kiss! 💋`,
                        "💋"
                    );

                } else {

                    notify(
                        `${
                            data.fromName ||
                            "Someone"
                        } rejected the kiss.`,
                        "💔"
                    );

                }

            }
        );


        /* BLOCK */

        flirthubSocket.on(
            "playerBlocked",
            () => {

                notify(
                    "Player blocked.",
                    "🚫"
                );

            }
        );


        /* ERROR */

        flirthubSocket.on(
            "connect_error",
            error => {

                console.log(
                    "Socket connection error:",
                    error
                );

            }
        );

    } catch (error) {

        console.error(
            "Could not connect to FlirtHubX server:",
            error
        );

    }

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

            gender:
                state.gender || "Male",

            age:
                state.age || 18,

            avatar:
                state.avatar || ""

        }
    );

}


/* =========================================================
   USER ID
========================================================= */

function getCurrentUserId() {

    try {

        if (
            window.Telegram &&
            Telegram.WebApp &&
            Telegram.WebApp
                .initDataUnsafe &&
            Telegram.WebApp
                .initDataUnsafe
                .user
        ) {

            return String(
                Telegram.WebApp
                    .initDataUnsafe
                    .user
                    .id
            );

        }

    } catch (error) {

        console.log(
            "Telegram user ID unavailable."
        );

    }


    let localId =
        localStorage.getItem(
            "flirthubx_local_id"
        );


    if (!localId) {

        localId =
            `local-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 10)}`;


        localStorage.setItem(
            "flirthubx_local_id",
            localId
        );

    }


    return localId;

}


/* =========================================================
   KISS REQUEST
========================================================= */

function requestKiss(socketId) {

    if (
        !flirthubSocket ||
        !flirthubSocket.connected
    ) {

        notify(
            "Multiplayer is not connected.",
            "!"
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
   KISS FROM USER PROFILE
========================================================= */

document.addEventListener(
    "click",
    event => {

        const kiss =
            event.target.closest(
                "[data-kiss]"
            );

        if (!kiss) {
            return;
        }


        if (selectedUser) {

            openKissChoice(
                selectedUser
            );

        }

    }
);


/* =========================================================
   ESCAPE HTML
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


/* =========================================================
   TIME
========================================================= */

function getTime() {

    return new Date()
        .toLocaleTimeString(
            [],
            {
                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        );

}


/* =========================================================
   EXPORT DEBUG HELPERS
========================================================= */

window.FlirtHubX = {

    state,

    saveState,

    loadState,

    renderRoom,

    openModal,

    closeModal,

    sendRoomMessage,

    changeRoom

};
