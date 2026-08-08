/* =========================================================
   FLIRTHUBX — SCRIPT.JS
   GAME / MESSAGE / ACCOUNT
========================================================= */


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

    selectedGender: "",

    messages: [],

    roomMembers: [],

    lastDailyClaim: null,

    league: "Bronze"

};


/* =========================================================
   DEFAULT ROOM PLAYERS
========================================================= */

const demoPlayers = [

    {
        id: "demo-1",
        socketId: "demo-1",
        name: "Alex",
        gender: "Male",
        avatar: "https://i.pravatar.cc/300?img=12",
        online: true,
        rank: 124,
        admire: 18,
        kissPoints: 25,
        league: "Bronze"
    },

    {
        id: "demo-2",
        socketId: "demo-2",
        name: "Mia",
        gender: "Female",
        avatar: "https://i.pravatar.cc/300?img=47",
        online: true,
        rank: 82,
        admire: 34,
        kissPoints: 41,
        league: "Silver"
    },

    {
        id: "demo-3",
        socketId: "demo-3",
        name: "Daniel",
        gender: "Male",
        avatar: "https://i.pravatar.cc/300?img=11",
        online: true,
        rank: 156,
        admire: 12,
        kissPoints: 17,
        league: "Bronze"
    },

    {
        id: "demo-4",
        socketId: "demo-4",
        name: "Lina",
        gender: "Female",
        avatar: "https://i.pravatar.cc/300?img=44",
        online: false,
        rank: 44,
        admire: 61,
        kissPoints: 72,
        league: "Gold"
    }

];


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
            "Could not save FlirtHubX state:",
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

            state.roomMembers =
                [...demoPlayers];

            return false;

        }


        const data =
            JSON.parse(saved);


        Object.assign(
            state,
            data
        );


        if (
            !Array.isArray(
                state.roomMembers
            ) ||
            state.roomMembers.length === 0
        ) {

            state.roomMembers =
                [...demoPlayers];

        }


        if (
            !Array.isArray(
                state.messages
            )
        ) {

            state.messages = [];

        }


        return true;

    } catch (error) {

        console.error(
            "Could not load FlirtHubX data:",
            error
        );


        state.roomMembers =
            [...demoPlayers];


        return false;

    }

}


/* =========================================================
   SCREEN SYSTEM
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

            element.classList.add(
                "hidden"
            );

        }

    });

}


function showScreen(id) {

    hideAllScreens();


    const element =
        document.getElementById(id);


    if (element) {

        element.classList.remove(
            "hidden"
        );

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


        initializeTelegram();


        setTimeout(
            () => {

                const loading =
                    document.getElementById(
                        "loadingScreen"
                    );


                if (loading) {

                    loading.classList.add(
                        "hidden"
                    );

                }


                if (
                    existingAccount &&
                    state.profileCreated &&
                    state.name
                ) {

                    updateAccountUI();

                    updateRoomCurrencyUI();

                    renderRoom();

                    showScreen(
                        "homeScreen"
                    );

                } else {

                    showScreen(
                        "startScreen"
                    );

                }

            },
            1800
        );

    }
);


/* =========================================================
   START
========================================================= */

function startGame() {

    showScreen(
        "profileScreen"
    );

}


/* =========================================================
   PROFILE
========================================================= */

function backToStart() {

    showScreen(
        "startScreen"
    );

}


function backToProfile() {

    showScreen(
        "profileScreen"
    );

}


function selectGender(
    button,
    gender
) {

    state.selectedGender =
        gender;


    document
        .querySelectorAll(
            ".gender-option"
        )
        .forEach(
            option => {

                option.classList.remove(
                    "selected"
                );

            }
        );


    if (button) {

        button.classList.add(
            "selected"
        );

    }

}


/* =========================================================
   PROFILE → AVATAR
========================================================= */

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
            ? Number(
                ageInput.value
            )
            : 0;


    if (!name) {

        alert(
            "Please enter your name."
        );

        return;

    }


    if (
        !age ||
        age < 18
    ) {

        alert(
            "You must be 18 or older to use FlirtHubX."
        );

        return;

    }


    if (
        !state.selectedGender
    ) {

        alert(
            "Please select your gender."
        );

        return;

    }


    state.name =
        name.slice(0, 20);


    state.age =
        age;


    state.gender =
        state.selectedGender;


    showScreen(
        "avatarScreen"
    );

}


/* =========================================================
   GALLERY AVATAR
========================================================= */

function openAvatarGallery() {

    let input =
        document.getElementById(
            "avatarGalleryInput"
        );


    if (!input) {

        input =
            document.createElement(
                "input"
            );


        input.type =
            "file";


        input.id =
            "avatarGalleryInput";


        input.accept =
            "image/*";


        input.style.display =
            "none";


        document.body.appendChild(
            input
        );


        input.addEventListener(
            "change",
            handleAvatarFile
        );

    }


    input.click();

}


function handleAvatarFile(event) {

    const file =
        event.target.files &&
        event.target.files[0];


    if (!file) {
        return;
    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "Please select an image."
        );

        return;

    }


    /*
     * Compress the image before storing it.
     * This prevents localStorage from becoming
     * unnecessarily huge.
     */

    const reader =
        new FileReader();


    reader.onload =
        function () {

            const image =
                new Image();


            image.onload =
                function () {

                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    const maxSize =
                        500;


                    let width =
                        image.width;


                    let height =
                        image.height;


                    if (
                        width >
                        height
                    ) {

                        if (
                            width >
                            maxSize
                        ) {

                            height =
                                height *
                                maxSize /
                                width;

                            width =
                                maxSize;

                        }

                    } else {

                        if (
                            height >
                            maxSize
                        ) {

                            width =
                                width *
                                maxSize /
                                height;

                            height =
                                maxSize;

                        }

                    }


                    canvas.width =
                        width;


                    canvas.height =
                        height;


                    const ctx =
                        canvas.getContext(
                            "2d"
                        );


                    ctx.drawImage(
                        image,
                        0,
                        0,
                        width,
                        height
                    );


                    state.avatar =
                        canvas.toDataURL(
                            "image/jpeg",
                            0.82
                        );


                    state.selectedAvatar =
                        state.avatar;


                    showAvatarPreview();


                    saveState();

                };


            image.src =
                reader.result;

        };


    reader.readAsDataURL(
        file
    );

}


/* =========================================================
   AVATAR PREVIEW
========================================================= */

function showAvatarPreview() {

    const preview =
        document.getElementById(
            "avatarPreview"
        );


    if (preview) {

        preview.src =
            state.avatar;

        preview.classList.remove(
            "hidden"
        );

    }


    const avatarImages =
        document.querySelectorAll(
            ".avatar-preview-image"
        );


    avatarImages.forEach(
        image => {

            image.src =
                state.avatar;

        }
    );

}


/* =========================================================
   AVATAR SELECTION
========================================================= */

function selectAvatar(
    button,
    avatar
) {

    state.selectedAvatar =
        avatar;


    document
        .querySelectorAll(
            ".avatar-option"
        )
        .forEach(
            option => {

                option.classList.remove(
                    "selected"
                );

            }
        );


    if (button) {

        button.classList.add(
            "selected"
        );

    }


    if (
        typeof avatar ===
        "string"
    ) {

        state.avatar =
            avatar;

        showAvatarPreview();

    }

}


/* =========================================================
   FINISH PROFILE
========================================================= */

function finishProfile() {

    if (
        !state.selectedAvatar &&
        !state.avatar
    ) {

        alert(
            "Please choose a profile picture."
        );

        return;

    }


    if (
        state.selectedAvatar
    ) {

        state.avatar =
            state.selectedAvatar;

    }


    state.profileCreated =
        true;


    state.roomMembers =
        [...demoPlayers];


    saveState();


    updateAccountUI();

    updateRoomCurrencyUI();

    renderRoom();


    showScreen(
        "homeScreen"
    );


    /*
     * Connect after profile creation.
     */

    if (
        typeof connectFlirtHubServer ===
        "function"
    ) {

        connectFlirtHubServer();

    }

}


/* =========================================================
   ACCOUNT
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
            state.name ||
            "Player";

    }


    if (age) {

        age.textContent =
            state.age ||
            18;

    }


    if (gender) {

        gender.textContent =
            state.gender ||
            "Male";

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


    const league =
        document.getElementById(
            "leagueName"
        );


    if (league) {

        league.textContent =
            state.league ||
            "Bronze";

    }

}


/* =========================================================
   ROOM CURRENCY
========================================================= */

function updateRoomCurrencyUI() {

    const possibleHeartIds = [

        "roomHeartBalance",
        "roomHearts",
        "roomHeartCount"

    ];


    const possibleMoneyIds = [

        "roomMoneyBalance",
        "roomMoney",
        "roomMoneyCount"

    ];


    possibleHeartIds.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    state.hearts;

            }

        }
    );


    possibleMoneyIds.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    state.money;

            }

        }
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function openRoomTab() {

    updateRoomCurrencyUI();

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


function openMessageTab() {

    /*
     * Message screen can be connected
     * when your HTML contains messageScreen.
     */

    const messageScreen =
        document.getElementById(
            "messageScreen"
        );


    if (messageScreen) {

        renderMessages();

        updateMessageStreak();

        showScreen(
            "messageScreen"
        );

    } else {

        /*
         * If the current HTML uses the room
         * as the message page, keep it here.
         */

        renderMessages();

        showScreen(
            "homeScreen"
        );

    }

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


    updateRoomCurrencyUI();


    renderRoomMembers();

}


/* =========================================================
   ROOM MEMBER CARDS
========================================================= */

function renderRoomMembers() {

    const container =
        document.getElementById(
            "roomMembers"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const players =
        state.roomMembers
            .slice(0, 10);


    players.forEach(
        member => {

            const wrapper =
                document.createElement(
                    "button"
                );


            wrapper.type =
                "button";


            wrapper.className =
                "room-player-card";


            wrapper.dataset.socketId =
                member.socketId ||
                member.id ||
                "";


            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "room-player-avatar";


            image.src =
                member.avatar ||
                "https://i.pravatar.cc/300?img=12";


            image.alt =
                member.name ||
                "Player";


            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "room-player-name";


            name.textContent =
                member.name ||
                "Player";


            const league =
                document.createElement(
                    "small"
                );


            league.className =
                "room-player-league";


            league.textContent =
                member.league ||
                "Bronze";


            wrapper.appendChild(
                image
            );


            wrapper.appendChild(
                name
            );


            wrapper.appendChild(
                league
            );


            wrapper.addEventListener(
                "click",
                () => {

                    openMemberAccount(
                        member
                    );

                }
            );


            container.appendChild(
                wrapper
            );

        }
    );


    /*
     * Make the room look populated in demo mode.
     */

    if (
        players.length === 0
    ) {

        container.innerHTML =
            `
            <div class="empty-room">
                Waiting for players...
            </div>
            `;

    }

}


/* =========================================================
   MEMBER ACCOUNT CARD
========================================================= */

function openMemberAccount(
    member
) {

    const existing =
        document.getElementById(
            "memberProfileModal"
        );


    if (existing) {

        existing.remove();

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "memberProfileModal";


    modal.className =
        "modal member-profile-modal";


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "modal-card member-profile-card";


    const close =
        document.createElement(
            "button"
        );


    close.className =
        "modal-close";


    close.textContent =
        "×";


    close.onclick =
        () => modal.remove();


    const avatar =
        document.createElement(
            "img"
        );


    avatar.className =
        "member-profile-avatar";


    avatar.src =
        member.avatar ||
        "https://i.pravatar.cc/300?img=12";


    const name =
        document.createElement(
            "h2"
        );


    name.textContent =
        member.name ||
        "Player";


    const league =
        document.createElement(
            "div"
        );


    league.className =
        "member-league";


    league.textContent =
        `🏆 ${member.league || "Bronze"} League`;


    const stats =
        document.createElement(
            "div"
        );


    stats.className =
        "member-stat-grid";


    stats.innerHTML =
        `

        <div class="member-stat">
            <strong>${member.rank || 0}</strong>
            <small>Rank</small>
        </div>

        <div class="member-stat">
            <strong>${member.admire || 0}</strong>
            <small>Admire</small>
        </div>

        <div class="member-stat">
            <strong>${member.kissPoints || 0}</strong>
            <small>Kiss</small>
        </div>

        `;


    const admire =
        document.createElement(
            "button"
        );


    admire.className =
        "primary-modal-button";


    admire.textContent =
        "❤️ Admire";


    admire.onclick =
        () => {

            state.hearts =
                Math.max(
                    0,
                    state.hearts - 1
                );


            state.kissPoints += 1;


            saveState();


            updateAccountUI();

            updateRoomCurrencyUI();


            admire.textContent =
                "❤️ Admired";


            admire.disabled =
                true;

        };


    const kick =
        document.createElement(
            "button"
        );


    kick.className =
        "danger-button";


    kick.textContent =
        "Kick";


    kick.onclick =
        () => {

            if (
                member.socketId &&
                flirthubSocket &&
                flirthubSocket.connected
            ) {

                blockPlayer(
                    member.socketId
                );

            } else {

                alert(
                    `${member.name} cannot be kicked in demo mode.`
                );

            }

        };


    card.appendChild(
        close
    );


    card.appendChild(
        avatar
    );


    card.appendChild(
        name
    );


    card.appendChild(
        league
    );


    card.appendChild(
        stats
    );


    card.appendChild(
        admire
    );


    card.appendChild(
        kick
    );


    modal.appendChild(
        card
    );


    document.body.appendChild(
        modal
    );

}


/* =========================================================
   SPIN BOTTLE
========================================================= */

function spinBottle() {

    const players =
        state.roomMembers
            .filter(
                player =>
                    player.id !==
                    getCurrentUserId()
            );


    if (
        players.length === 0
    ) {

        alert(
            "Waiting for more players to join the room. 🍾"
        );

        return;

    }


    const selected =
        players[
            Math.floor(
                Math.random() *
                players.length
            )
        ];


    const bottle =
        document.querySelector(
            ".spin-bottle"
        );


    if (bottle) {

        bottle.classList.add(
            "spinning"
        );


        setTimeout(
            () => {

                bottle.classList.remove(
                    "spinning"
                );

            },
            1800
        );

    }


    setTimeout(
        () => {

            openMemberAccount(
                selected
            );

        },
        1900
    );

}


/* =========================================================
   MESSAGES
========================================================= */

function renderMessages() {

    const container =
        document.getElementById(
            "roomMessages"
        ) ||
        document.getElementById(
            "messageList"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


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


            const text =
                document.createElement(
                    "span"
                );


            text.textContent =
                message.text;


            bubble.appendChild(
                text
            );


            if (
                message.translation
            ) {

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


    if (
        text.length >
        500
    ) {

        alert(
            "Message is too long."
        );

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
                text:
                    text
            }
        );


        input.value =
            "";


        return;

    }


    /*
     * Offline/demo mode.
     */

    const message = {

        id:
            Date.now(),

        name:
            state.name ||
            "You",

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


    input.value =
        "";


    saveState();

    renderMessages();


    /*
     * Demo reply.
     */

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


/* =========================================================
   ENTER KEY
========================================================= */

function handleRoomEnter(
    event
) {

    if (
        event.key ===
        "Enter"
    ) {

        event.preventDefault();

        sendRoomMessage();

    }

}


/* =========================================================
   TYPING
========================================================= */

function handleTyping() {

    if (
        flirthubSocket &&
        flirthubSocket.connected
    ) {

        flirthubSocket.emit(
            "typing"
        );

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
            "Translation will appear here.";

    }


    saveState();

    renderMessages();

}


/* =========================================================
   MESSAGE STREAK
========================================================= */

function updateMessageStreak() {

    const elements =
        document.querySelectorAll(
            ".message-streak, #messageStreak, #streakCount"
        );


    elements.forEach(
        element => {

            element.textContent =
                `🔥 ${state.streak} day streak`;

        }
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
   CHANGE ROOM
========================================================= */

function changeRoom() {

    if (
        flirthubSocket &&
        flirthubSocket.connected
    ) {

        let nextRoom =
            Number(state.room) + 1;


        if (
            nextRoom >
            9999
        ) {

            nextRoom =
                1;

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


    if (
        state.room >
        20
    ) {

        state.room =
            1;

    }


    saveState();

    renderRoom();

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


/* =========================================================
   DAILY HEARTS
========================================================= */

function claimDailyHearts() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    if (
        state.lastDailyClaim ===
        today
    ) {

        alert(
            "You already claimed today's Hearts. ❤️"
        );

        return;

    }


    state.hearts +=
        50;


    state.lastDailyClaim =
        today;


    saveState();


    updateAccountUI();

    updateRoomCurrencyUI();


    alert(
        "You received 50 free Hearts! ❤️"
    );

}


/* =========================================================
   BUY HEARTS
========================================================= */

function buyHearts(
    amount,
    stars
) {

    /*
     * This is only the front-end hook.
     * Telegram Stars payment must be verified
     * by the server before adding Hearts.
     */

    if (
        window.Telegram &&
        Telegram.WebApp
    ) {

        console.log(
            "Telegram Stars purchase requested:",
            amount,
            stars
        );

    }


    alert(
        `${amount.toLocaleString()} Hearts\n\n` +
        `Price: ${stars} Telegram Stars\n\n` +
        `Telegram payment will be connected through the server.`
    );

}


/* =========================================================
   GIFTS
========================================================= */

function openGiftStore() {

    let modal =
        document.getElementById(
            "giftModal"
        );


    if (!modal) {

        modal =
            createGiftModal();

    }


    modal.classList.remove(
        "hidden"
    );

}


function createGiftModal() {

    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "giftModal";


    modal.className =
        "modal hidden";


    modal.innerHTML = `

        <div class="modal-card gift-modal-card">

            <button
                class="modal-close"
                onclick="closeGiftStore()"
            >
                ×
            </button>

            <h2>🎁 Gifts</h2>

            <p class="modal-subtitle">
                Send something special
            </p>

            <div class="gift-grid">

                <button
                    class="gift-card"
                    onclick="sendGift('Tomato',20,'🍅')"
                >
                    <span class="gift-image">
                        🍅
                    </span>

                    <strong>
                        Tomato
                    </strong>

                    <small>
                        20 ❤️
                    </small>
                </button>


                <button
                    class="gift-card"
                    onclick="sendGift('Flower',30,'🌷')"
                >
                    <span class="gift-image">
                        🌷
                    </span>

                    <strong>
                        Flower
                    </strong>

                    <small>
                        30 ❤️
                    </small>
                </button>


                <button
                    class="gift-card"
                    onclick="sendGift('Pants',60,'👖')"
                >
                    <span class="gift-image">
                        👖
                    </span>

                    <strong>
                        Stylish Pants
                    </strong>

                    <small>
                        60 ❤️
                    </small>
                </button>


                <button
                    class="gift-card"
                    onclick="sendGift('Rose',100,'🌹')"
                >
                    <span class="gift-image">
                        🌹
                    </span>

                    <strong>
                        Red Rose
                    </strong>

                    <small>
                        100 ❤️
                    </small>
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    return modal;

}


function closeGiftStore() {

    const modal =
        document.getElementById(
            "giftModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


function sendGift(
    giftName,
    price,
    icon
) {

    if (
        state.hearts <
        price
    ) {

        alert(
            "You don't have enough Hearts. ❤️"
        );

        return;

    }


    state.hearts -=
        price;


    saveState();


    updateAccountUI();

    updateRoomCurrencyUI();


    closeGiftStore();


    alert(
        `${icon} ${giftName} sent!`
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


    if (
        !input ||
        !results
    ) {

        return;

    }


    const search =
        input.value.trim();


    if (!search) {

        results.innerHTML =
            "<p>Type a song name first.</p>";

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


function playSong(
    song
) {

    state.songPoints +=
        10;


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

    updateRoomCurrencyUI();

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


function sendEmotion(
    type
) {

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
            emotions[type] ||
            "😊";


        input.focus();

    }


    closeEmotions();

}


/* =========================================================
   PREMIUM
========================================================= */

function activatePremium() {

    state.premium =
        true;


    saveState();


    updateAccountUI();


    alert(
        "Premium activated! ✨"
    );

}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(
    text
) {

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


function escapeAttribute(
    text
) {

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
   TELEGRAM
========================================================= */

function initializeTelegram() {

    if (
        typeof Telegram !==
        "undefined" &&
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

let flirthubSocket =
    null;


let socketConnecting =
    false;


/* =========================================================
   CONNECT
========================================================= */

function connectFlirtHubServer() {

    if (
        socketConnecting
    ) {

        return;

    }


    if (
        flirthubSocket &&
        flirthubSocket.connected
    ) {

        joinCurrentRoom();

        return;

    }


    if (
        typeof io ===
        "undefined"
    ) {

        console.warn(
            "Socket.IO is not loaded."
        );

        return;

    }


    socketConnecting =
        true;


    flirthubSocket =
        io();


    flirthubSocket.on(
        "connect",
        () => {

            socketConnecting =
                false;


            console.log(
                "FlirtHubX connected:",
                flirthubSocket.id
            );


            joinCurrentRoom();

        }
    );


    flirthubSocket.on(
        "connect_error",
        error => {

            socketConnecting =
                false;


            console.warn(
                "FlirtHubX connection error:",
                error.message
            );

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


    /* =====================================================
       ROOM JOINED
    ===================================================== */

    flirthubSocket.on(
        "roomJoined",
        data => {

            state.room =
                Number(
                    data.room
                ) || 1;


            state.roomMembers =
                Array.isArray(
                    data.users
                )
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
                `Room ${data.room} is full (10/10).`
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

            if (
                Array.isArray(users)
            ) {

                state.roomMembers =
                    users;

                renderRoom();

            }

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
                        message.userId ===
                        getCurrentUserId(),

                    time:
                        new Date(
                            message.timestamp
                        )
                            .toLocaleTimeString(
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
       KISS REQUEST
    ===================================================== */

    flirthubSocket.on(
        "kissRequest",
        data => {

            const accepted =
                confirm(
                    `${data.fromName} wants to kiss you 💋`
                );


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
    );


    /* =====================================================
       KISS RESPONSE
    ===================================================== */

    flirthubSocket.on(
        "kissResponse",
        data => {

            if (
                data.accepted
            ) {

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
       BLOCK
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
                state.name ||
                "Player",

            gender:
                state.gender ||
                "Male",

            avatar:
                state.avatar ||
                ""

        }
    );

}


/* =========================================================
   KISS REQUEST
========================================================= */

function requestKiss(
    socketId
) {

    if (
        !flirthubSocket ||
        !flirthubSocket.connected
    ) {

        alert(
            "You are not connected to multiplayer yet."
        );

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
            "You are not connected to multiplayer yet."
        );

        return;

    }


    if (!socketId) {
        return;
    }


    if (
        !confirm(
            "Block this player?"
        )
    ) {

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
   CLOSE MODALS WHEN CLICKING OUTSIDE
========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            event.target.classList &&
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.add(
                "hidden"
            );

        }

    }
);


/* =========================================================
   GLOBAL STARTUP
========================================================= */

initializeTelegram();
