/* =========================================================
   FLIRTHUBX - MATCHING SCRIPT.JS (REFACTORED)
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // Initialize Telegram WebApp SDK if available
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }

    /* =====================================================
       PLAYER DATA
    ===================================================== */

    let player = {
        name: "",
        age: "",
        gender: "",
        avatar: ""
    };

    let setupStep = 1;
    let selectedGender = "";
    let selectedAvatar = "";
    let currentPlayer = "Alex";
    let hearts = 12;
    let coins = 250;

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const loadingScreen = document.getElementById("loadingScreen");
    const setupScreen = document.getElementById("setupScreen");
    const appScreen = document.getElementById("appScreen");

    const setupStep1 = document.getElementById("setupStep1");
    const setupStep2 = document.getElementById("setupStep2");
    const setupStep3 = document.getElementById("setupStep3");

    const userName = document.getElementById("userName");
    const userAge = document.getElementById("userAge");

    const avatarInput = document.getElementById("avatarInput");
    const avatarPreview = document.getElementById("avatarPreview");
    const defaultAvatarIcon = document.getElementById("defaultAvatarIcon");

    const finalAvatar = document.getElementById("finalAvatar");
    const finalDefaultAvatar = document.getElementById("finalDefaultAvatar");
    const finalName = document.getElementById("finalName");
    const finalInfo = document.getElementById("finalInfo");

    const gameAvatar = document.getElementById("gameAvatar");
    const gameDefaultAvatar = document.getElementById("gameDefaultAvatar");
    const gamePlayerName = document.getElementById("gamePlayerName");

    const accountAvatar = document.getElementById("accountAvatar");
    const accountDefaultAvatar = document.getElementById("accountDefaultAvatar");
    const accountName = document.getElementById("accountName");
    const accountAge = document.getElementById("accountAge");

    const heartCount = document.getElementById("heartCount");
    const coinCount = document.getElementById("coinCount");
    const storeCoinCount = document.getElementById("storeCoinCount");

    /* =====================================================
       SCREEN VISIBILITY HELPER (Fixes Blank Screen Bug)
    ===================================================== */

    function setScreenVisible(element, visible, displayType = "flex") {
        if (!element) return;
        if (visible) {
            element.classList.remove("hidden");
            element.style.display = displayType;
        } else {
            element.classList.add("hidden");
            element.style.display = "none";
        }
    }

    /* =====================================================
       DEFAULT AVATAR GENERATOR
    ===================================================== */

    function createDefaultAvatar(gender) {
        const isFemale = gender === "female";
        const bg = isFemale ? "%23e94c9b" : "%235b4bdb";
        const skin = isFemale ? "%23f4c7a5" : "%23f2c09b";
        const hair = isFemale ? "%235a3428" : "%232d2528";

        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" rx="40" fill="${bg}"/><circle cx="150" cy="125" r="65" fill="${skin}"/><path d="M82 130 C55 70 90 35 150 42 C215 35 245 85 215 145 L195 105 C170 80 125 80 100 110 Z" fill="${hair}"/><circle cx="125" cy="128" r="7" fill="%23222"/><circle cx="175" cy="128" r="7" fill="%23222"/><path d="M130 165 Q150 178 170 165" fill="none" stroke="%23a94d62" stroke-width="6" stroke-linecap="round"/><path d="M72 300 Q85 205 150 200 Q215 205 228 300" fill="%23302f75"/></svg>`;

        return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    }

    /* =====================================================
       SAVE & LOAD DATA
    ===================================================== */

    function savePlayer() {
        try {
            localStorage.setItem("flirthubXPlayer", JSON.stringify(player));
            localStorage.setItem("flirthubXHearts", hearts.toString());
            localStorage.setItem("flirthubXCoins", coins.toString());
        } catch (error) {
            console.error("Could not save player:", error);
        }
    }

    function loadPlayer() {
        try {
            const saved = localStorage.getItem("flirthubXPlayer");
            if (saved) {
                const data = JSON.parse(saved);
                if (data) player = { ...player, ...data };
            }
            const savedHearts = localStorage.getItem("flirthubXHearts");
            const savedCoins = localStorage.getItem("flirthubXCoins");

            if (savedHearts !== null) hearts = Number(savedHearts);
            if (savedCoins !== null) coins = Number(savedCoins);
        } catch (error) {
            console.error("Could not load player:", error);
        }
    }

    /* =====================================================
       UPDATE CURRENCY
    ===================================================== */

    function updateCurrency() {
        if (heartCount) heartCount.textContent = hearts;
        if (coinCount) coinCount.textContent = coins;
        if (storeCoinCount) storeCoinCount.textContent = coins;
        savePlayer();
    }

    /* =====================================================
       SHOW SETUP STEP
    ===================================================== */

    function showSetupStep(step) {
        setupStep = step;
        const steps = [setupStep1, setupStep2, setupStep3];

        steps.forEach((item, index) => {
            if (!item) return;
            setScreenVisible(item, index + 1 === step, "block");
        });

        if (step === 3) {
            updateFinalPreview();
        }
    }

    function startSetup() {
        setScreenVisible(loadingScreen, false);
        setScreenVisible(setupScreen, true, "flex");
        showSetupStep(1);
    }

    window.goBackToLoading = function () {
        setScreenVisible(setupScreen, false);
        setScreenVisible(loadingScreen, true, "flex");
    };

    window.selectGender = function (gender) {
        selectedGender = gender;
        document.querySelectorAll(".gender-option").forEach(button => {
            button.classList.remove("selected");
            if (button.dataset.gender === gender) {
                button.classList.add("selected");
            }
        });
        updateDefaultAvatar();
    };

    function updateDefaultAvatar() {
        if (!defaultAvatarIcon) return;
        const icon = defaultAvatarIcon.querySelector("i");
        if (!icon) return;

        if (selectedGender === "female") {
            icon.className = "fa-solid fa-venus";
        } else if (selectedGender === "male") {
            icon.className = "fa-solid fa-mars";
        } else {
            icon.className = "fa-solid fa-user";
        }
    }

    window.nextSetupStep = function () {
        if (setupStep === 1) {
            const name = userName ? userName.value.trim() : "";
            const age = userAge ? Number(userAge.value) : 0;

            if (!name) {
                showToast("Please enter your name.");
                return;
            }
            if (!age || age < 18) {
                showToast("You must be 18 or older.");
                return;
            }
            if (!selectedGender) {
                showToast("Please choose your gender.");
                return;
            }

            player.name = name;
            player.age = age;
            player.gender = selectedGender;

            prepareAvatar();
            showSetupStep(2);
            return;
        }

        if (setupStep === 2) {
            if (selectedAvatar) {
                player.avatar = selectedAvatar;
            } else {
                player.avatar = createDefaultAvatar(player.gender);
            }
            showSetupStep(3);
        }
    };

    window.previousSetupStep = function () {
        if (setupStep > 1) {
            showSetupStep(setupStep - 1);
        }
    };

    function prepareAvatar() {
        selectedAvatar = null;
        if (avatarPreview) {
            avatarPreview.src = createDefaultAvatar(selectedGender);
            setScreenVisible(avatarPreview, false);
        }
        if (avatarInput) avatarInput.value = "";
        if (defaultAvatarIcon) setScreenVisible(defaultAvatarIcon, true, "block");
    }

    window.openGallery = function () {
        if (avatarInput) avatarInput.click();
    };

    window.previewAvatar = function (event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showToast("Please choose an image.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            selectedAvatar = e.target.result;
            if (avatarPreview) {
                avatarPreview.src = selectedAvatar;
                setScreenVisible(avatarPreview, true, "block");
            }
            if (defaultAvatarIcon) setScreenVisible(defaultAvatarIcon, false);
        };
        reader.readAsDataURL(file);
    };

    window.skipAvatar = function () {
        selectedAvatar = null;
        player.avatar = createDefaultAvatar(player.gender);
        showSetupStep(3);
    };

    function updateFinalPreview() {
        if (finalName) finalName.textContent = player.name || "Your Name";
        if (finalInfo) {
            finalInfo.textContent = `${player.age || 18} • ${player.gender === "female" ? "Girl" : "Boy"}`;
        }

        const avatar = player.avatar || selectedAvatar || createDefaultAvatar(player.gender);

        if (finalAvatar) {
            finalAvatar.src = avatar;
            setScreenVisible(finalAvatar, true, "block");
        }
        if (finalDefaultAvatar) setScreenVisible(finalDefaultAvatar, false);
    }

    window.finishSetup = function () {
        if (!player.name) {
            showToast("Please complete your profile.");
            showSetupStep(1);
            return;
        }
        if (!player.avatar) {
            player.avatar = createDefaultAvatar(player.gender);
        }

        savePlayer();
        openApp();
    };

    /* =====================================================
       OPEN APP
    ===================================================== */

    function openApp() {
        setScreenVisible(loadingScreen, false);
        setScreenVisible(setupScreen, false);
        setScreenVisible(appScreen, true, "flex");

        updatePlayerUI();
        updateCurrency();
        switchSection("game");
    }

    function updatePlayerUI() {
        const avatar = player.avatar || createDefaultAvatar(player.gender);

        if (gamePlayerName) gamePlayerName.textContent = player.name || "You";
        if (gameAvatar) {
            gameAvatar.src = avatar;
            setScreenVisible(gameAvatar, true, "block");
        }
        if (gameDefaultAvatar) setScreenVisible(gameDefaultAvatar, false);

        if (accountName) accountName.textContent = player.name || "Your Name";
        if (accountAge) accountAge.textContent = player.age || "18";
        if (accountAvatar) {
            accountAvatar.src = avatar;
            setScreenVisible(accountAvatar, true, "block");
        }
        if (accountDefaultAvatar) setScreenVisible(accountDefaultAvatar, false);
    }

    /* =====================================================
       NAVIGATION
    ===================================================== */

    window.switchSection = function (section) {
        const sections = {
            game: document.getElementById("gameSection"),
            messages: document.getElementById("messagesSection"),
            account: document.getElementById("accountSection")
        };

        Object.values(sections).forEach(item => {
            if (item) setScreenVisible(item, false);
        });

        if (sections[section]) {
            setScreenVisible(sections[section], true, "block");
        }

        const navButtons = {
            game: document.getElementById("gameNav"),
            messages: document.getElementById("messagesNav"),
            account: document.getElementById("accountNav")
        };

        Object.values(navButtons).forEach(button => {
            if (button) button.classList.remove("active");
        });

        if (navButtons[section]) {
            navButtons[section].classList.add("active");
        }
    };

    /* =====================================================
       SPIN BOTTLE & MODALS
    ===================================================== */

    window.spinBottle = function () {
        const bottle = document.getElementById("spinBottleButton");
        const status = document.getElementById("spinStatus");

        if (!bottle || bottle.classList.contains("spinning")) return;

        bottle.classList.add("spinning");
        if (status) status.textContent = "Spinning...";

        const players = ["Alex", "Mia", "Lina"];
        const chosen = players[Math.floor(Math.random() * players.length)];

        setTimeout(() => {
            bottle.classList.remove("spinning");
            if (status) status.textContent = `The bottle chose ${chosen}! ❤️`;
            const selected = document.getElementById("selectedPlayer");
            if (selected) selected.textContent = chosen;

            const modal = document.getElementById("spinModal");
            if (modal) setScreenVisible(modal, true, "flex");
        }, 1500);
    };

    window.closeSpinModal = function () {
        setScreenVisible(document.getElementById("spinModal"), false);
    };

    window.openGiftPanel = function () {
        setScreenVisible(document.getElementById("giftPanel"), true, "flex");
    };

    window.closeGiftPanel = function () {
        setScreenVisible(document.getElementById("giftPanel"), false);
    };

    window.sendGift = function (giftName, loveAmount) {
        if (hearts < loveAmount) {
            showToast("Not enough hearts ❤️");
            return;
        }
        hearts -= loveAmount;
        updateCurrency();
        closeGiftPanel();
        showToast(`${giftName} sent to ${currentPlayer} ❤️`);
    };

    window.sendLove = function () {
        if (hearts <= 0) {
            showToast("You have no hearts left ❤️");
            return;
        }
        hearts--;
        updateCurrency();
        showToast(`You sent love to ${currentPlayer} ❤️`);
    };

    window.admireCurrentPlayer = function () {
        showToast(`You admired ${currentPlayer} ⭐`);
    };

    window.openStore = function () {
        setScreenVisible(document.getElementById("storeModal"), true, "flex");
        updateCurrency();
    };

    window.closeStore = function () {
        setScreenVisible(document.getElementById("storeModal"), false);
    };

    window.buyHearts = function (amount, price) {
        if (coins < price) {
            showToast("Not enough coins 🪙");
            return;
        }
        coins -= price;
        hearts += amount;
        updateCurrency();
        showToast(`+${amount} Hearts ❤️`);
    };

    window.refreshRoom = function () {
        showToast("Room refreshed 🔄");
    };

    /* =====================================================
       PLAYER PROFILE
    ===================================================== */

    window.openPlayerProfile = function (name) {
        currentPlayer = name;
        const modal = document.getElementById("playerProfileModal");
        const nameElement = document.getElementById("profilePlayerName");
        const imageElement = document.getElementById("profilePlayerImage");

        if (nameElement) nameElement.textContent = name;
        if (imageElement) {
            const images = {
                Alex: "https://i.pravatar.cc/500?img=12",
                Mia: "https://i.pravatar.cc/500?img=47",
                Lina: "https://i.pravatar.cc/500?img=44"
            };
            imageElement.src = images[name] || images.Alex;
        }

        if (modal) setScreenVisible(modal, true, "flex");
    };

    window.closePlayerProfile = function () {
        setScreenVisible(document.getElementById("playerProfileModal"), false);
    };

    window.openOwnProfile = function () {
        switchSection("account");
    };

    window.admirePlayerFromProfile = function () {
        showToast(`You admired ${currentPlayer} ❤️`);
    };

    window.giftPlayerFromProfile = function () {
        closePlayerProfile();
        openGiftPanel();
    };

    /* =====================================================
       CHAT
    ===================================================== */

    const messageInput = document.getElementById("messageInput");

    window.openChat = function (name) {
        currentPlayer = name;
        const chatWindow = document.getElementById("chatWindow");
        const chatName = document.getElementById("activeChatName");
        const chatAvatar = document.getElementById("activeChatAvatar");

        const images = {
            Alex: "https://i.pravatar.cc/200?img=12",
            Mia: "https://i.pravatar.cc/200?img=47",
            Lina: "https://i.pravatar.cc/200?img=44"
        };

        if (chatName) chatName.textContent = name;
        if (chatAvatar) chatAvatar.src = images[name] || images.Alex;
        if (chatWindow) setScreenVisible(chatWindow, true, "flex");
    };

    window.closeChat = function () {
        setScreenVisible(document.getElementById("chatWindow"), false);
    };

    window.handleMessageKey = function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendChatMessage();
        }
    };

    window.sendChatMessage = function () {
        if (!messageInput) return;
        const text = messageInput.value.trim();
        if (!text) return;

        const messages = document.getElementById("chatMessages");
        if (!messages) return;

        const message = document.createElement("div");
        message.className = "message sent";
        message.innerHTML = `
            <div class="message-bubble">${escapeHTML(text)}</div>
            <small style="font-size:0.65rem; opacity:0.7; display:block; margin-top:2px;">${getTime()}</small>
        `;

        messages.appendChild(message);
        messageInput.value = "";
        messages.scrollTop = messages.scrollHeight;

        setTimeout(() => {
            const replies = [
                "Haha, that's cute ❤️",
                "Really? Tell me more 😊",
                "I like your vibe 👀",
                "Maybe we should spin the bottle 😉",
                "Nice! ❤️"
            ];
            const reply = replies[Math.floor(Math.random() * replies.length)];
            const received = document.createElement("div");
            received.className = "message received";
            received.innerHTML = `
                <div class="message-bubble">${reply}</div>
                <small style="font-size:0.65rem; opacity:0.7; display:block; margin-top:2px;">${getTime()}</small>
            `;
            messages.appendChild(received);
            messages.scrollTop = messages.scrollHeight;
        }, 800);
    };

    window.addEmoji = function () {
        if (!messageInput) return;
        messageInput.value += " ❤️";
        messageInput.focus();
    };

    /* =====================================================
       ACCOUNT & UTILS
    ===================================================== */

    window.openSettings = function () { showToast("Settings coming soon ⚙️"); };
    window.openInventory = function () { showToast("Inventory coming soon 👜"); };
    window.openRelationships = function () { showToast("Relationships coming soon ❤️"); };
    window.openGuests = function () { showToast("Guests coming soon 👀"); };
    window.openClub = function () { showToast("Club coming soon 🛡️"); };

    window.inviteFriends = function () {
        coins += 15000;
        updateCurrency();
        showToast("+15000 coins 🪙");
    };

    function showToast(message) {
        const toast = document.getElementById("toast");
        const toastMessage = document.getElementById("toastMessage");
        if (!toast) {
            alert(message);
            return;
        }
        if (toastMessage) toastMessage.textContent = message;

        setScreenVisible(toast, true, "block");

        clearTimeout(window.toastTimer);
        window.toastTimer = setTimeout(() => {
            setScreenVisible(toast, false);
        }, 2200);
    }

    function getTime() {
        return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =====================================================
       INITIALIZE
    ===================================================== */

    loadPlayer();
    updateCurrency();

    if (player.name && player.age && player.avatar) {
        openApp();
    } else {
        setScreenVisible(loadingScreen, true, "flex");
        setScreenVisible(setupScreen, false);
        setScreenVisible(appScreen, false);

        setTimeout(() => {
            if (loadingScreen && !loadingScreen.classList.contains("hidden")) {
                startSetup();
            }
        }, 1800);
    }
});
