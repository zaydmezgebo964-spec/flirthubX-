/* =========================================================
   FLIRTHUBX - MATCHING SCRIPT.JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

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
       DEFAULT AVATAR
    ===================================================== */

    function createDefaultAvatar(gender) {

        const isFemale = gender === "female";

        const bg = isFemale ? "#e94c9b" : "#5b4bdb";
        const skin = isFemale ? "#f4c7a5" : "#f2c09b";
        const hair = isFemale ? "#5a3428" : "#2d2528";

        return "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg"
                     width="300"
                     height="300"
                     viewBox="0 0 300 300">

                    <rect width="300"
                          height="300"
                          rx="40"
                          fill="${bg}"/>

                    <circle cx="150"
                            cy="125"
                            r="65"
                            fill="${skin}"/>

                    <path d="
                        M82 130
                        C55 70 90 35 150 42
                        C215 35 245 85 215 145
                        L195 105
                        C170 80 125 80 100 110
                        Z"
                        fill="${hair}"/>

                    <circle cx="125"
                            cy="128"
                            r="7"
                            fill="#222"/>

                    <circle cx="175"
                            cy="128"
                            r="7"
                            fill="#222"/>

                    <path d="
                        M130 165
                        Q150 178 170 165"
                        fill="none"
                        stroke="#a94d62"
                        stroke-width="6"
                        stroke-linecap="round"/>

                    <path d="
                        M72 300
                        Q85 205 150 200
                        Q215 205 228 300"
                        fill="#302f75"/>

                </svg>
            `);
    }


    /* =====================================================
       SAVE PLAYER
    ===================================================== */

    function savePlayer() {

        try {

            localStorage.setItem(
                "flirthubXPlayer",
                JSON.stringify(player)
            );

            localStorage.setItem(
                "flirthubXHearts",
                hearts
            );

            localStorage.setItem(
                "flirthubXCoins",
                coins
            );

        } catch (error) {

            console.error(
                "Could not save player:",
                error
            );

        }
    }


    /* =====================================================
       LOAD PLAYER
    ===================================================== */

    function loadPlayer() {

        try {

            const saved =
                localStorage.getItem(
                    "flirthubXPlayer"
                );

            if (saved) {

                const data =
                    JSON.parse(saved);

                if (data) {

                    player = {
                        ...player,
                        ...data
                    };

                }

            }


            const savedHearts =
                localStorage.getItem(
                    "flirthubXHearts"
                );

            const savedCoins =
                localStorage.getItem(
                    "flirthubXCoins"
                );


            if (savedHearts !== null) {

                hearts =
                    Number(savedHearts);

            }


            if (savedCoins !== null) {

                coins =
                    Number(savedCoins);

            }

        } catch (error) {

            console.error(
                "Could not load player:",
                error
            );

        }

    }


    /* =====================================================
       UPDATE CURRENCY
    ===================================================== */

    function updateCurrency() {

        if (heartCount) {

            heartCount.textContent =
                hearts;

        }

        if (coinCount) {

            coinCount.textContent =
                coins;

        }

        if (storeCoinCount) {

            storeCoinCount.textContent =
                coins;

        }

        savePlayer();
    }


    /* =====================================================
       SHOW SETUP STEP
    ===================================================== */

    function showSetupStep(step) {

        setupStep = step;

        const steps = [
            setupStep1,
            setupStep2,
            setupStep3
        ];

        steps.forEach((item, index) => {

            if (!item) return;

            if (index + 1 === step) {

                item.classList.remove("hidden");

                item.style.display = "block";

            } else {

                item.classList.add("hidden");

                item.style.display = "none";

            }

        });


        if (step === 3) {

            updateFinalPreview();

        }

    }


    /* =====================================================
       START SETUP
    ===================================================== */

    function startSetup() {

        if (loadingScreen) {

            loadingScreen.classList.add("hidden");

        }

        if (setupScreen) {

            setupScreen.classList.remove("hidden");

            setupScreen.style.display = "flex";

        }

        showSetupStep(1);
    }


    /* =====================================================
       BACK TO LOADING
    ===================================================== */

    window.goBackToLoading = function () {

        if (setupScreen) {

            setupScreen.classList.add("hidden");

        }

        if (loadingScreen) {

            loadingScreen.classList.remove("hidden");

            loadingScreen.style.display = "flex";

        }

    };


    /* =====================================================
       GENDER
    ===================================================== */

    window.selectGender = function (gender) {

        selectedGender = gender;

        document
            .querySelectorAll(".gender-option")
            .forEach(button => {

                button.classList.remove("selected");

                if (
                    button.dataset.gender === gender
                ) {

                    button.classList.add("selected");

                }

            });


        updateDefaultAvatar();
    };


    /* =====================================================
       DEFAULT AVATAR UPDATE
    ===================================================== */

    function updateDefaultAvatar() {

        if (!defaultAvatarIcon) return;

        const icon =
            defaultAvatarIcon.querySelector("i");

        if (!icon) return;

        if (selectedGender === "female") {

            icon.className =
                "fa-solid fa-venus";

        } else if (selectedGender === "male") {

            icon.className =
                "fa-solid fa-mars";

        } else {

            icon.className =
                "fa-solid fa-user";

        }

    }


    /* =====================================================
       NEXT SETUP STEP
    ===================================================== */

    window.nextSetupStep = function () {

        /* STEP 1 */

        if (setupStep === 1) {

            const name =
                userName
                    ? userName.value.trim()
                    : "";

            const age =
                userAge
                    ? Number(userAge.value)
                    : 0;


            if (!name) {

                showToast(
                    "Please enter your name."
                );

                return;

            }


            if (!age || age < 18) {

                showToast(
                    "You must be 18 or older."
                );

                return;

            }


            if (!selectedGender) {

                showToast(
                    "Please choose your gender."
                );

                return;

            }


            player.name = name;
            player.age = age;
            player.gender = selectedGender;


            prepareAvatar();

            showSetupStep(2);

            return;
        }


        /* STEP 2 */

        if (setupStep === 2) {

            if (selectedAvatar) {

                player.avatar =
                    selectedAvatar;

            } else {

                player.avatar =
                    createDefaultAvatar(
                        player.gender
                    );

            }


            showSetupStep(3);

        }

    };


    /* =====================================================
       PREVIOUS SETUP STEP
    ===================================================== */

    window.previousSetupStep = function () {

        if (setupStep > 1) {

            showSetupStep(
                setupStep - 1
            );

        }

    };


    /* =====================================================
       PREPARE AVATAR
    ===================================================== */

    function prepareAvatar() {

        selectedAvatar = null;


        if (avatarPreview) {

            avatarPreview.src =
                createDefaultAvatar(
                    selectedGender
                );

            avatarPreview.classList.add(
                "hidden"
            );

        }


        if (avatarInput) {

            avatarInput.value = "";

        }


        if (defaultAvatarIcon) {

            defaultAvatarIcon.classList.remove(
                "hidden"
            );

        }

    }


    /* =====================================================
       OPEN GALLERY
    ===================================================== */

    window.openGallery = function () {

        if (avatarInput) {

            avatarInput.click();

        }

    };


    /* =====================================================
       PREVIEW AVATAR
    ===================================================== */

    window.previewAvatar = function (event) {

        const file =
            event.target.files &&
            event.target.files[0];

        if (!file) return;


        if (!file.type.startsWith("image/")) {

            showToast(
                "Please choose an image."
            );

            return;

        }


        const reader =
            new FileReader();


        reader.onload = function (e) {

            selectedAvatar =
                e.target.result;


            if (avatarPreview) {

                avatarPreview.src =
                    selectedAvatar;

                avatarPreview.classList.remove(
                    "hidden"
                );

            }


            if (defaultAvatarIcon) {

                defaultAvatarIcon.classList.add(
                    "hidden"
                );

            }

        };


        reader.readAsDataURL(file);

    };


    /* =====================================================
       SKIP AVATAR
    ===================================================== */

    window.skipAvatar = function () {

        selectedAvatar = null;

        player.avatar =
            createDefaultAvatar(
                player.gender
            );

        showSetupStep(3);

    };


    /* =====================================================
       FINAL PREVIEW
    ===================================================== */

    function updateFinalPreview() {

        if (finalName) {

            finalName.textContent =
                player.name || "Your Name";

        }


        if (finalInfo) {

            finalInfo.textContent =
                `${player.age || 18} • ${
                    player.gender === "female"
                        ? "Girl"
                        : "Boy"
                }`;

        }


        const avatar =
            player.avatar ||
            selectedAvatar ||
            createDefaultAvatar(
                player.gender
            );


        if (finalAvatar) {

            finalAvatar.src =
                avatar;

            finalAvatar.classList.remove(
                "hidden"
            );

        }


        if (finalDefaultAvatar) {

            finalDefaultAvatar.classList.add(
                "hidden"
            );

        }

    }


    /* =====================================================
       FINISH SETUP
    ===================================================== */

    window.finishSetup = function () {

        if (!player.name) {

            showToast(
                "Please complete your profile."
            );

            showSetupStep(1);

            return;

        }


        if (!player.avatar) {

            player.avatar =
                createDefaultAvatar(
                    player.gender
                );

        }


        savePlayer();

        openApp();

    };


    /* =====================================================
       OPEN APP
    ===================================================== */

    function openApp() {

        if (loadingScreen) {

            loadingScreen.classList.add(
                "hidden"
            );

        }

        if (setupScreen) {

            setupScreen.classList.add(
                "hidden"
            );

        }

        if (appScreen) {

            appScreen.classList.remove(
                "hidden"
            );

            appScreen.style.display =
                "flex";

        }


        updatePlayerUI();

        updateCurrency();

        switchSection("game");

    }


    /* =====================================================
       UPDATE PLAYER UI
    ===================================================== */

    function updatePlayerUI() {

        const avatar =
            player.avatar ||
            createDefaultAvatar(
                player.gender
            );


        if (gamePlayerName) {

            gamePlayerName.textContent =
                player.name || "You";

        }


        if (gameAvatar) {

            gameAvatar.src =
                avatar;

            gameAvatar.classList.remove(
                "hidden"
            );

        }


        if (gameDefaultAvatar) {

            gameDefaultAvatar.classList.add(
                "hidden"
            );

        }


        if (accountName) {

            accountName.textContent =
                player.name || "Your Name";

        }


        if (accountAge) {

            accountAge.textContent =
                player.age || "18";

        }


        if (accountAvatar) {

            accountAvatar.src =
                avatar;

            accountAvatar.classList.remove(
                "hidden"
            );

        }


        if (accountDefaultAvatar) {

            accountDefaultAvatar.classList.add(
                "hidden"
            );

        }

    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    window.switchSection = function (section) {

        const sections = {
            game: document.getElementById(
                "gameSection"
            ),

            messages: document.getElementById(
                "messagesSection"
            ),

            account: document.getElementById(
                "accountSection"
            )
        };


        Object.values(sections).forEach(item => {

            if (!item) return;

            item.classList.add("hidden");

            item.classList.remove(
                "active-section"
            );

        });


        const selected =
            sections[section];


        if (selected) {

            selected.classList.remove(
                "hidden"
            );

            selected.classList.add(
                "active-section"
            );

        }


        const navButtons = {
            game: document.getElementById(
                "gameNav"
            ),

            messages: document.getElementById(
                "messagesNav"
            ),

            account: document.getElementById(
                "accountNav"
            )
        };


        Object.values(navButtons).forEach(button => {

            if (button) {

                button.classList.remove(
                    "active"
                );

            }

        });


        if (navButtons[section]) {

            navButtons[section].classList.add(
                "active"
            );

        }

    };


    /* =====================================================
       SPIN BOTTLE
    ===================================================== */

    window.spinBottle = function () {

        const bottle =
            document.getElementById(
                "spinBottleButton"
            );

        const status =
            document.getElementById(
                "spinStatus"
            );


        if (!bottle) return;


        if (bottle.classList.contains(
            "spinning"
        )) {

            return;

        }


        bottle.classList.add(
            "spinning"
        );


        if (status) {

            status.textContent =
                "Spinning...";

        }


        const players = [
            "Alex",
            "Mia",
            "Lina"
        ];


        const chosen =
            players[
                Math.floor(
                    Math.random() *
                    players.length
                )
            ];


        setTimeout(() => {

            bottle.classList.remove(
                "spinning"
            );


            if (status) {

                status.textContent =
                    `The bottle chose ${chosen}! ❤️`;

            }


            const selected =
                document.getElementById(
                    "selectedPlayer"
                );


            if (selected) {

                selected.textContent =
                    chosen;

            }


            const modal =
                document.getElementById(
                    "spinModal"
                );


            if (modal) {

                modal.classList.remove(
                    "hidden"
                );

            }

        }, 1500);

    };


    window.closeSpinModal = function () {

        const modal =
            document.getElementById(
                "spinModal"
            );

        if (modal) {

            modal.classList.add(
                "hidden"
            );

        }

    };


    /* =====================================================
       GIFT PANEL
    ===================================================== */

    window.openGiftPanel = function () {

        const panel =
            document.getElementById(
                "giftPanel"
            );

        if (panel) {

            panel.classList.remove(
                "hidden"
            );

        }

    };


    window.closeGiftPanel = function () {

        const panel =
            document.getElementById(
                "giftPanel"
            );

        if (panel) {

            panel.classList.add(
                "hidden"
            );

        }

    };


    /* =====================================================
       SEND GIFT
    ===================================================== */

    window.sendGift = function (
        giftName,
        loveAmount
    ) {

        if (hearts < loveAmount) {

            showToast(
                "Not enough hearts ❤️"
            );

            return;

        }


        hearts -= loveAmount;

        updateCurrency();

        closeGiftPanel();


        showToast(
            `${giftName} sent to ${currentPlayer} ❤️`
        );

    };


    /* =====================================================
       LOVE
    ===================================================== */

    window.sendLove = function () {

        if (hearts <= 0) {

            showToast(
                "You have no hearts left ❤️"
            );

            return;

        }


        hearts--;

        updateCurrency();


        showToast(
            `You sent love to ${currentPlayer} ❤️`
        );

    };


    /* =====================================================
       ADMIRE
    ===================================================== */

    window.admireCurrentPlayer = function () {

        showToast(
            `You admired ${currentPlayer} ⭐`
        );

    };


    /* =====================================================
       STORE
    ===================================================== */

    window.openStore = function () {

        const modal =
            document.getElementById(
                "storeModal"
            );

        if (modal) {

            modal.classList.remove(
                "hidden"
            );

        }

        updateCurrency();

    };


    window.closeStore = function () {

        const modal =
            document.getElementById(
                "storeModal"
            );

        if (modal) {

            modal.classList.add(
                "hidden"
            );

        }

    };


    window.buyHearts = function (
        amount,
        price
    ) {

        if (coins < price) {

            showToast(
                "Not enough coins 🪙"
            );

            return;

        }


        coins -= price;

        hearts += amount;

        updateCurrency();

        showToast(
            `+${amount} Hearts ❤️`
        );

    };


    /* =====================================================
       REFRESH ROOM
    ===================================================== */

    window.refreshRoom = function () {

        showToast(
            "Room refreshed 🔄"
        );

    };


    /* =====================================================
       PLAYER PROFILE
    ===================================================== */

    window.openPlayerProfile = function (
        name
    ) {

        currentPlayer = name;


        const modal =
            document.getElementById(
                "playerProfileModal"
            );


        const nameElement =
            document.getElementById(
                "profilePlayerName"
            );


        const imageElement =
            document.getElementById(
                "profilePlayerImage"
            );


        if (nameElement) {

            nameElement.textContent =
                name;

        }


        if (imageElement) {

            const images = {

                Alex:
                    "https://i.pravatar.cc/500?img=12",

                Mia:
                    "https://i.pravatar.cc/500?img=47",

                Lina:
                    "https://i.pravatar.cc/500?img=44"

            };


            imageElement.src =
                images[name] ||
                images.Alex;

        }


        if (modal) {

            modal.classList.remove(
                "hidden"
            );

        }

    };


    window.closePlayerProfile = function () {

        const modal =
            document.getElementById(
                "playerProfileModal"
            );

        if (modal) {

            modal.classList.add(
                "hidden"
            );

        }

    };


    window.openOwnProfile = function () {

        switchSection("account");

    };


    window.admirePlayerFromProfile =
        function () {

            showToast(
                `You admired ${currentPlayer} ❤️`
            );

        };


    window.giftPlayerFromProfile =
        function () {

            closePlayerProfile();

            openGiftPanel();

        };


    /* =====================================================
       CHAT
    ===================================================== */

    const messageInput =
        document.getElementById(
            "messageInput"
        );


    window.openChat = function (name) {

        currentPlayer = name;


        const chatWindow =
            document.getElementById(
                "chatWindow"
            );


        const chatName =
            document.getElementById(
                "activeChatName"
            );


        const chatAvatar =
            document.getElementById(
                "activeChatAvatar"
            );


        const images = {

            Alex:
                "https://i.pravatar.cc/200?img=12",

            Mia:
                "https://i.pravatar.cc/200?img=47",

            Lina:
                "https://i.pravatar.cc/200?img=44"

        };


        if (chatName) {

            chatName.textContent =
                name;

        }


        if (chatAvatar) {

            chatAvatar.src =
                images[name] ||
                images.Alex;

        }


        if (chatWindow) {

            chatWindow.classList.remove(
                "hidden"
            );

        }

    };


    window.closeChat = function () {

        const chatWindow =
            document.getElementById(
                "chatWindow"
            );

        if (chatWindow) {

            chatWindow.classList.add(
                "hidden"
            );

        }

    };


    window.handleMessageKey = function (
        event
    ) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendChatMessage();

        }

    };


    window.sendChatMessage = function () {

        if (!messageInput) return;


        const text =
            messageInput.value.trim();


        if (!text) return;


        const messages =
            document.getElementById(
                "chatMessages"
            );


        if (!messages) return;


        const message =
            document.createElement(
                "div"
            );


        message.className =
            "message sent";


        message.innerHTML = `
            <div class="message-bubble">
                ${escapeHTML(text)}
            </div>

            <small>
                ${getTime()}
            </small>
        `;


        messages.appendChild(
            message
        );


        messageInput.value = "";


        messages.scrollTop =
            messages.scrollHeight;


        setTimeout(() => {

            const replies = [

                "Haha, that's cute ❤️",

                "Really? Tell me more 😊",

                "I like your vibe 👀",

                "Maybe we should spin the bottle 😉",

                "Nice! ❤️"

            ];


            const reply =
                replies[
                    Math.floor(
                        Math.random() *
                        replies.length
                    )
                ];


            const received =
                document.createElement(
                    "div"
                );


            received.className =
                "message received";


            received.innerHTML = `
                <div class="message-bubble">
                    ${reply}
                </div>

                <small>
                    ${getTime()}
                </small>
            `;


            messages.appendChild(
                received
            );


            messages.scrollTop =
                messages.scrollHeight;

        }, 800);

    };


    window.addEmoji = function () {

        if (!messageInput) return;

        messageInput.value += " ❤️";

        messageInput.focus();

    };


    /* =====================================================
       ACCOUNT BUTTONS
    ===================================================== */

    window.openSettings = function () {

        showToast(
            "Settings coming soon ⚙️"
        );

    };


    window.openInventory = function () {

        showToast(
            "Inventory coming soon 👜"
        );

    };


    window.openRelationships = function () {

        showToast(
            "Relationships coming soon ❤️"
        );

    };


    window.openGuests = function () {

        showToast(
            "Guests coming soon 👀"
        );

    };


    window.openClub = function () {

        showToast(
            "Club coming soon 🛡️"
        );

    };


    window.inviteFriends = function () {

        coins += 15000;

        updateCurrency();

        showToast(
            "+15000 coins 🪙"
        );

    };


    window.editProfile = function () {

        showToast(
            "Profile editing coming soon 👤"
        );

    };


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {

        const toast =
            document.getElementById(
                "toast"
            );

        const toastMessage =
            document.getElementById(
                "toastMessage"
            );


        if (!toast) {

            alert(message);

            return;

        }


        if (toastMessage) {

            toastMessage.textContent =
                message;

        }


        toast.classList.remove(
            "hidden"
        );


        clearTimeout(
            window.toastTimer
        );


        window.toastTimer =
            setTimeout(() => {

                toast.classList.add(
                    "hidden"
                );

            }, 2200);

    }


    /* =====================================================
       TIME
    ===================================================== */

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


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

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


    /* Existing account */

    if (
        player.name &&
        player.age &&
        player.avatar
    ) {

        openApp();

    } else {

        if (loadingScreen) {

            loadingScreen.classList.remove(
                "hidden"
            );

            loadingScreen.style.display =
                "flex";

        }

        if (setupScreen) {

            setupScreen.classList.add(
                "hidden"
            );

        }

        if (appScreen) {

            appScreen.classList.add(
                "hidden"
            );

        }

    }


    /* Loading time */

    setTimeout(() => {

        if (
            loadingScreen &&
            !loadingScreen.classList.contains(
                "hidden"
            )
        ) {

            startSetup();

        }

    }, 1800);

});
