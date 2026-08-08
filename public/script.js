/* =========================================================
   FLIRTHUBX - MAIN JAVASCRIPT
========================================================= */

/* =========================
   TELEGRAM
========================= */

let tg = null;

if (window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
}


/* =========================
   PLAYER DATA
========================= */

let playerData = {
    name: "Zayd",
    age: 20,
    gender: "Male",
    avatar: "",
    hearts: 50,
    money: 10,
    kissPoints: 0,
    songPoints: 0,
    streak: 0,
    league: "Bronze",
    rank: 346
};


/* =========================
   ROOM DATA
========================= */

let currentRoom = 4;

let roomPlayers = [

    {
        id: 1,
        name: "Alex",
        age: 22,
        avatar: "https://i.pravatar.cc/300?img=12",
        rank: 120,
        league: "Silver",
        hearts: 45,
        kissPoints: 120,
        online: true
    },

    {
        id: 2,
        name: "Mia",
        age: 21,
        avatar: "https://i.pravatar.cc/300?img=47",
        rank: 84,
        league: "Gold",
        hearts: 72,
        kissPoints: 245,
        online: true
    },

    {
        id: 3,
        name: "Daniel",
        age: 24,
        avatar: "https://i.pravatar.cc/300?img=11",
        rank: 52,
        league: "Diamond",
        hearts: 130,
        kissPoints: 460,
        online: true
    },

    {
        id: 4,
        name: "Lina",
        age: 22,
        avatar: "https://i.pravatar.cc/300?img=44",
        rank: 96,
        league: "Gold",
        hearts: 81,
        kissPoints: 190,
        online: true
    },

    {
        id: 5,
        name: "Noah",
        age: 23,
        avatar: "https://i.pravatar.cc/300?img=68",
        rank: 150,
        league: "Silver",
        hearts: 39,
        kissPoints: 98,
        online: true
    },

    {
        id: 6,
        name: "Emma",
        age: 20,
        avatar: "https://i.pravatar.cc/300?img=32",
        rank: 71,
        league: "Gold",
        hearts: 94,
        kissPoints: 230,
        online: true
    }

];


/* =========================
   MESSAGES
========================= */

let messages = [

    {
        user: "Alex",
        text: "Nice to meet you! 😊",
        time: "10:34",
        mine: false
    },

    {
        user: "Zayd",
        text: "Thanks you too",
        time: "10:34",
        mine: true
    },

    {
        user: "Alex",
        text: "Nice to meet you! 😊",
        time: "10:34",
        mine: false
    }

];


/* =========================
   DOM HELPERS
========================= */

function $(id) {
    return document.getElementById(id);
}


function hideAllScreens() {

    const screens = document.querySelectorAll(
        ".screen, .app-screen"
    );

    screens.forEach(screen => {
        screen.classList.add("hidden");
    });

}


/* =========================
   START GAME
========================= */

function startGame() {

    hideAllScreens();

    $("profileScreen").classList.remove("hidden");

}


/* =========================
   START SCREEN
========================= */

function backToStart() {

    hideAllScreens();

    $("startScreen").classList.remove("hidden");

}


/* =========================
   PROFILE
========================= */

let selectedGender = "";
let selectedAvatar = "";


function selectGender(button, gender) {

    document.querySelectorAll(
        ".gender-option"
    ).forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");

    selectedGender = gender;

}


function continueToAvatar() {

    const name = $("playerName").value.trim();
    const age = Number($("playerAge").value);

    if (!name) {
        alert("Please enter your name.");
        return;
    }

    if (!age || age < 18) {
        alert("You must be 18 or older.");
        return;
    }

    if (!selectedGender) {
        alert("Please choose your gender.");
        return;
    }

    playerData.name = name;
    playerData.age = age;
    playerData.gender = selectedGender;

    hideAllScreens();

    $("avatarScreen").classList.remove("hidden");

}


function selectAvatar(button, avatar) {

    document.querySelectorAll(
        ".avatar-option"
    ).forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");

    selectedAvatar = avatar;

}


function backToProfile() {

    hideAllScreens();

    $("profileScreen").classList.remove("hidden");

}


function finishProfile() {

    if (!selectedAvatar) {
        alert("Please choose an avatar.");
        return;
    }

    playerData.avatar = selectedAvatar;

    updateAccount();

    openRoomTab();

}


/* =========================
   ROOM
========================= */

function openRoomTab() {

    hideAllScreens();

    $("homeScreen").classList.remove("hidden");

    renderRoom();

    renderMessages();

}


function renderRoom() {

    if ($("roomNumber")) {
        $("roomNumber").textContent = currentRoom;
    }

    if ($("roomPeople")) {
        $("roomPeople").textContent =
            Math.min(roomPlayers.length + 1, 10);
    }

    renderRoomPlayers();

    updateRoomCurrencies();

}


/* =========================
   ROOM PLAYERS
========================= */

function renderRoomPlayers() {

    const container = $("roomMembers");

    if (!container) return;

    container.innerHTML = "";

    roomPlayers.slice(0, 6).forEach(player => {

        const card = document.createElement("button");

        card.className = "room-player-card";

        card.onclick = function () {
            openPlayerProfile(player.id);
        };

        card.innerHTML = `

            <div class="player-photo-wrap">

                <img
                    class="player-photo"
                    src="${player.avatar}"
                    alt="${player.name}"
                >

                <span class="player-online"></span>

            </div>

            <div class="player-name">
                ${escapeHTML(player.name)}
            </div>

            <div class="player-age">
                ${player.age}
            </div>

        `;

        container.appendChild(card);

    });


    /* YOUR CARD */

    const yourCard = document.createElement("button");

    yourCard.className =
        "room-player-card your-card";

    yourCard.onclick = function () {
        openAccount();
    };

    const avatar =
        playerData.avatar ||
        "https://i.pravatar.cc/300?img=12";

    yourCard.innerHTML = `

        <div class="player-photo-wrap">

            <img
                class="player-photo"
                src="${avatar}"
                alt="You"
            >

        </div>

        <div class="player-name">
            ${escapeHTML(playerData.name)}
        </div>

        <div class="player-age">
            YOU
        </div>

    `;

    container.appendChild(yourCard);

}


/* =========================
   ROOM CURRENCIES
========================= */

function updateRoomCurrencies() {

    let hearts =
        document.querySelector("#roomHeartBalance");

    let money =
        document.querySelector("#roomMoneyBalance");

    if (hearts) {
        hearts.textContent = playerData.hearts;
    }

    if (money) {
        money.textContent = playerData.money;
    }

}


/* =========================
   ROOM CHANGE
========================= */

function changeRoom() {

    currentRoom++;

    if (currentRoom > 10) {
        currentRoom = 1;
    }

    roomPlayers =
        [...roomPlayers]
        .sort(() => Math.random() - 0.5);

    renderRoom();

    addSystemMessage(
        `You entered Room ${currentRoom}.`
    );

}


/* =========================
   SPIN BOTTLE
========================= */

function spinBottle() {

    if (roomPlayers.length === 0) {
        return;
    }

    const randomPlayer =
        roomPlayers[
            Math.floor(
                Math.random() * roomPlayers.length
            )
        ];

    addSystemMessage(
        `🍾 The bottle points to ${randomPlayer.name}!`
    );

    setTimeout(() => {

        openPlayerProfile(randomPlayer.id);

    }, 500);

}


/* =========================
   PLAYER PROFILE
========================= */

function openPlayerProfile(playerId) {

    const player =
        roomPlayers.find(
            p => p.id === playerId
        );

    if (!player) return;

    const modal =
        document.createElement("div");

    modal.className =
        "player-profile-modal";

    modal.id =
        "playerProfileModal";

    modal.innerHTML = `

        <div class="player-profile-card">

            <button
                class="player-profile-close"
                onclick="closePlayerProfile()"
            >
                ×
            </button>

            <img
                class="player-profile-image"
                src="${player.avatar}"
                alt="${player.name}"
            >

            <h2>
                ${escapeHTML(player.name)}, ${player.age}
            </h2>

            <div class="player-league">
                🏆 ${player.league}
            </div>

            <div class="player-points-grid">

                <div>
                    <strong>${player.rank}</strong>
                    <small>Rank</small>
                </div>

                <div>
                    <strong>♥ ${player.hearts}</strong>
                    <small>Hearts</small>
                </div>

                <div>
                    <strong>💋 ${player.kissPoints}</strong>
                    <small>Kiss points</small>
                </div>

            </div>

            <div class="player-profile-actions">

                <button
                    onclick="admirePlayer(${player.id})"
                >
                    ❤️ Admire
                </button>

                <button
                    onclick="openGiftForPlayer(${player.id})"
                >
                    🎁 Gift
                </button>

                <button
                    class="kick-button"
                    onclick="kickPlayer(${player.id})"
                >
                    🚫 Kick
                </button>

            </div>

        </div>

    `;

    document.body.appendChild(modal);

}


function closePlayerProfile() {

    const modal =
        $("playerProfileModal");

    if (modal) {
        modal.remove();
    }

}


/* =========================
   ADMIRE
========================= */

function admirePlayer(playerId) {

    const player =
        roomPlayers.find(
            p => p.id === playerId
        );

    if (!player) return;

    if (playerData.hearts <= 0) {

        alert("You don't have enough hearts.");

        return;

    }

    playerData.hearts--;

    player.hearts++;

    player.kissPoints++;

    updateRoomCurrencies();

    addSystemMessage(
        `❤️ You admired ${player.name}!`
    );

    closePlayerProfile();

}


/* =========================
   KICK
========================= */

function kickPlayer(playerId) {

    const index =
        roomPlayers.findIndex(
            p => p.id === playerId
        );

    if (index === -1) return;

    const player =
        roomPlayers[index];

    roomPlayers.splice(index, 1);

    closePlayerProfile();

    renderRoom();

    addSystemMessage(
        `🚫 ${player.name} was removed from the room.`
    );

}


/* =========================
   GIFTS
========================= */

const gifts = [

    {
        name: "Phone",
        icon: "📱",
        cost: 5
    },

    {
        name: "Tomato",
        icon: "🍅",
        cost: 1
    },

    {
        name: "Pants",
        icon: "👖",
        cost: 2
    },

    {
        name: "Rose",
        icon: "🌹",
        cost: 3
    },

    {
        name: "Coffee",
        icon: "☕",
        cost: 2
    },

    {
        name: "Crown",
        icon: "👑",
        cost: 10
    },

    {
        name: "Diamond",
        icon: "💎",
        cost: 15
    },

    {
        name: "Teddy Bear",
        icon: "🧸",
        cost: 5
    },

    {
        name: "Watermelon",
        icon: "🍉",
        cost: 1
    },

    {
        name: "Cake",
        icon: "🍰",
        cost: 4
    },

    {
        name: "Duck",
        icon: "🦆",
        cost: 2
    },

    {
        name: "Perfume",
        icon: "🧴",
        cost: 6
    }

];


let giftTarget = null;


function openGiftStore() {

    openGiftForPlayer(null);

}


function openGiftForPlayer(playerId) {

    giftTarget = playerId;

    const modal =
        document.createElement("div");

    modal.className =
        "gift-modal";

    modal.id =
        "giftModal";

    modal.innerHTML = `

        <div class="gift-panel">

            <button
                class="gift-close"
                onclick="closeGiftModal()"
            >
                ×
            </button>

            <h2>
                🎁 Send a Gift
            </h2>

            <p>
                Choose something special
            </p>

            <div class="gift-grid">

                ${gifts.map((gift, index) => `

                    <button
                        class="gift-item"
                        onclick="sendGift(${index})"
                    >

                        <span class="gift-icon">
                            ${gift.icon}
                        </span>

                        <strong>
                            ${gift.name}
                        </strong>

                        <small>
                            ♥ ${gift.cost}
                        </small>

                    </button>

                `).join("")}

            </div>

        </div>

    `;

    document.body.appendChild(modal);

}


function closeGiftModal() {

    const modal =
        $("giftModal");

    if (modal) {
        modal.remove();
    }

}


function sendGift(index) {

    const gift = gifts[index];

    if (!gift) return;

    if (playerData.hearts < gift.cost) {

        alert("You don't have enough hearts.");

        return;

    }

    playerData.hearts -= gift.cost;

    updateRoomCurrencies();

    let targetName = "the room";

    if (giftTarget) {

        const player =
            roomPlayers.find(
                p => p.id === giftTarget
            );

        if (player) {
            targetName = player.name;
        }

    }

    addSystemMessage(
        `🎁 ${playerData.name} sent ${gift.icon} ${gift.name} to ${targetName}!`
    );

    closeGiftModal();

}


/* =========================
   MUSIC
========================= */

function openMusic() {

    const modal =
        $("musicModal");

    if (modal) {
        modal.classList.remove("hidden");
    }

}


function closeMusic() {

    const modal =
        $("musicModal");

    if (modal) {
        modal.classList.add("hidden");
    }

}


function searchMusic() {

    const input =
        $("musicSearch");

    const results =
        $("musicResults");

    if (!input || !results) return;

    const query =
        input.value.trim();

    if (!query) {

        results.innerHTML =
            "<p>Search for a song.</p>";

        return;

    }

    results.innerHTML = `

        <div class="music-result">

            <strong>
                🎵 ${escapeHTML(query)}
            </strong>

            <button
                onclick="playMusic('${escapeHTML(query)}')"
            >
                Play
            </button>

        </div>

    `;

}


function playMusic(title) {

    const player =
        $("musicPlayer");

    const titleElement =
        $("musicTitle");

    if (titleElement) {
        titleElement.textContent = title;
    }

    if (player) {
        player.classList.remove("hidden");
    }

    closeMusic();

}


function openEmotions() {

    const modal =
        $("emotionModal");

    if (modal) {
        modal.classList.remove("hidden");
    }

}


function closeEmotions() {

    const modal =
        $("emotionModal");

    if (modal) {
        modal.classList.add("hidden");
    }

}


function sendEmotion(type) {

    const emotions = {

        happy: "☺️ Happy",

        love: "❤️ Love",

        sad: "😢 Sad",

        cool: "😎 Cool"

    };

    sendRoomMessage(
        emotions[type] || "☺️"
    );

    closeEmotions();

}


/* =========================
   MESSAGES
========================= */

function renderMessages() {

    const container =
        $("roomMessages");

    if (!container) return;

    container.innerHTML = "";

    messages.forEach(message => {

        const messageElement =
            document.createElement("div");

        messageElement.className =
            message.mine
                ? "message-row mine"
                : "message-row";

        messageElement.innerHTML = `

            <div class="message-content">

                <strong>
                    ${escapeHTML(message.user)}
                </strong>

                <div class="message-bubble">

                    ${escapeHTML(message.text)}

                </div>

                <small>
                    ${message.time}
                </small>

            </div>

        `;

        container.appendChild(
            messageElement
        );

    });

    container.scrollTop =
        container.scrollHeight;

}


function sendRoomMessage(customText = null) {

    const input =
        $("roomInput");

    const text =
        customText ||
        (input ? input.value.trim() : "");

    if (!text) return;

    const now =
        new Date();

    const time =
        now.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    messages.push({

        user: playerData.name,

        text: text,

        time: time,

        mine: true

    });

    if (input) {
        input.value = "";
    }

    renderMessages();

    simulateReply();

}


function handleRoomEnter(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendRoomMessage();

    }

}


function simulateReply() {

    const replies = [

        "Nice 😊",

        "Haha really? 😄",

        "That's interesting ❤️",

        "Nice to meet you!",

        "Tell me more 👀"

    ];

    const randomPlayer =
        roomPlayers[
            Math.floor(
                Math.random() *
                roomPlayers.length
            )
        ];

    if (!randomPlayer) return;

    setTimeout(() => {

        const reply =
            replies[
                Math.floor(
                    Math.random() *
                    replies.length
                )
            ];

        messages.push({

            user: randomPlayer.name,

            text: reply,

            time: new Date()
                .toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                ),

            mine: false

        });

        renderMessages();

    }, 1200);

}


function addSystemMessage(text) {

    messages.push({

        user: "FlirtHubX",

        text: text,

        time: new Date()
            .toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            ),

        mine: false

    });

    renderMessages();

}


/* =========================
   ACCOUNT
========================= */

function openAccount() {

    hideAllScreens();

    $("accountScreen").classList.remove("hidden");

    updateAccount();

}


function updateAccount() {

    if ($("accountAvatar")) {

        $("accountAvatar").src =
            playerData.avatar ||
            "https://i.pravatar.cc/300?img=12";

    }

    if ($("accountName")) {
        $("accountName").textContent =
            playerData.name;
    }

    if ($("accountAge")) {
        $("accountAge").textContent =
            playerData.age;
    }

    if ($("accountGender")) {
        $("accountGender").textContent =
            playerData.gender;
    }

    if ($("heartBalance")) {
        $("heartBalance").textContent =
            playerData.hearts;
    }

    if ($("moneyBalance")) {
        $("moneyBalance").textContent =
            playerData.money;
    }

    if ($("kissBalance")) {
        $("kissBalance").textContent =
            playerData.kissPoints;
    }

    if ($("songPoints")) {
        $("songPoints").textContent =
            playerData.songPoints;
    }

    if ($("leagueName")) {
        $("leagueName").textContent =
            playerData.league;
    }

    if ($("streakCount")) {

        $("streakCount").textContent =
            `${playerData.streak} day streak`;

    }

}


/* =========================
   STORE
========================= */

function openStore() {

    const modal =
        $("storeModal");

    if (modal) {
        modal.classList.remove("hidden");
    }

}


function closeStore() {

    const modal =
        $("storeModal");

    if (modal) {
        modal.classList.add("hidden");
    }

}


function claimDailyHearts() {

    playerData.hearts += 50;

    updateAccount();

    updateRoomCurrencies();

    alert("❤️ 50 hearts added!");

}


function buyHearts(amount, stars) {

    /*
       Telegram Stars payment will be connected
       here later through the Telegram Bot backend.
    */

    alert(
        `${amount} Hearts for ${stars} Telegram Stars`
    );

}


/* =========================
   SETTINGS
========================= */

function openSettings() {

    const modal =
        $("settingsModal");

    if (modal) {
        modal.classList.remove("hidden");
    }

}


function closeSettings() {

    const modal =
        $("settingsModal");

    if (modal) {
        modal.classList.add("hidden");
    }

}


function privacyMessage() {

    alert(
        "Your profile information is stored for your FlirtHubX account."
    );

}


/* =========================
   FRIENDS
========================= */

function openFriends() {

    alert(
        "Friends system will open here."
    );

}


/* =========================
   SECURITY
========================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================
   LOADING
========================= */

window.addEventListener(
    "load",
    () => {

        setTimeout(() => {

            const loading =
                $("loadingScreen");

            const start =
                $("startScreen");

            if (loading) {
                loading.classList.add("hidden");
            }

            if (start) {
                start.classList.remove("hidden");
            }

        }, 1200);

    }
);
