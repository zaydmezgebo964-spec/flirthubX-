/* =========================================================
   FLIRTHUBX — PART 3
   Main game interaction / application logic
   ========================================================= */

const state = {
    user: {
        name: "",
        age: "",
        gender: "",
        avatar: ""
    },

    hearts: 50,
    kisses: 0,
    songPoints: 0,
    room: 1,
    streaks: {},

    selectedPlayer: null,
    selectedGift: null,
    selectedEmotion: null,

    messages: [],

    players: [
        { id: 1, name: "Mia", age: 22, gender: "female", avatar: "👩🏻", kisses: 42, online: true },
        { id: 2, name: "Daniel", age: 24, gender: "male", avatar: "👨🏻", kisses: 31, online: true },
        { id: 3, name: "Sofia", age: 21, gender: "female", avatar: "👩🏼", kisses: 28, online: false, lastSeen: "4:56" },
        { id: 4, name: "Alex", age: 25, gender: "male", avatar: "👨🏼", kisses: 24, online: true },
        { id: 5, name: "Lina", age: 23, gender: "female", avatar: "👩🏽", kisses: 19, online: true },
        { id: 6, name: "Ryan", age: 26, gender: "male", avatar: "👨🏽", kisses: 17, online: false, lastSeen: "8:42" },
        { id: 7, name: "Emma", age: 22, gender: "female", avatar: "👩🏾", kisses: 15, online: true },
        { id: 8, name: "Noah", age: 27, gender: "male", avatar: "👨🏾", kisses: 12, online: true },
        { id: 9, name: "Anna", age: 24, gender: "female", avatar: "👩🏻‍🦰", kisses: 10, online: false, lastSeen: "2:18" },
        { id: 10, name: "Leo", age: 23, gender: "male", avatar: "👨🏻‍🦱", kisses: 8, online: true }
    ]
};


/* =========================================================
   HELPERS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const screen = $(id);

    if (screen) {
        screen.classList.add("active");
    }
}

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

function notify(message) {
    const notification = $("notification");

    if (!notification) return;

    notification.textContent = message;
    notification.classList.remove("hidden");

    clearTimeout(window.notificationTimer);

    window.notificationTimer = setTimeout(() => {
        notification.classList.add("hidden");
    }, 2500);
}


/* =========================================================
   LOCAL SAVE
   ========================================================= */

function saveGame() {
    localStorage.setItem("flirthubx_state", JSON.stringify(state));
}

function loadGame() {
    try {
        const saved = localStorage.getItem("flirthubx_state");

        if (!saved) return;

        const data = JSON.parse(saved);

        if (data.user) state.user = data.user;
        if (typeof data.hearts === "number") state.hearts = data.hearts;
        if (typeof data.kisses === "number") state.kisses = data.kisses;
        if (typeof data.songPoints === "number") state.songPoints = data.songPoints;
        if (typeof data.room === "number") state.room =
