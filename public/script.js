/* =========================================================
   FLIRTHUB-X
   game.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       ELEMENTS
    ========================= */

    const loadingScreen =
        document.getElementById("loading-screen");

    const startButton =
        document.getElementById("start-btn");

    const accountScreen =
        document.getElementById("account-screen");

    const avatarScreen =
        document.getElementById("avatar-screen");

    const gameScreen =
        document.getElementById("game-screen");

    const nameInput =
        document.getElementById("name");

    const ageInput =
        document.getElementById("age");

    const genderSelect =
        document.getElementById("gender");

    const accountContinue =
        document.getElementById("account-continue");

    const avatarInput =
        document.getElementById("avatar-input");

    const avatarSquare =
        document.getElementById("avatar-square");

    const avatarPreview =
        document.getElementById("avatar-preview");

    const avatarContinue =
        document.getElementById("avatar-continue");

    const avatarSkip =
        document.getElementById("avatar-skip");

    const backAvatar =
        document.getElementById("back-avatar");

    const backAccount =
        document.getElementById("back-account");


    /* =========================
       GAME DATA
    ========================= */

    let player = {
        name: "",
        age: "",
        gender: "",
        avatar: null
    };

    let selectedAvatar = null;


    /* =========================
       DEFAULT AVATARS
    ========================= */

    const boyAvatar =
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="300"
                 height="300"
                 viewBox="0 0 300 300">

                <defs>
                    <linearGradient id="bg"
                        x1="0" y1="0"
                        x2="1" y2="1">
                        <stop offset="0%"
                              stop-color="#5b4bdb"/>
                        <stop offset="100%"
                              stop-color="#9c5de5"/>
                    </linearGradient>
                </defs>

                <rect width="300"
                      height="300"
                      rx="40"
                      fill="url(#bg)"/>

                <circle cx="150"
                        cy="120"
                        r="65"
                        fill="#f2c09b"/>

                <path d="
                    M83 116
                    C78 45 221 38 218 119
                    C193 82 111 81 83 116Z"
                    fill="#2d2528"/>

                <circle cx="125"
                        cy="125"
                        r="7"
                        fill="#222"/>

                <circle cx="175"
                        cy="125"
                        r="7"
                        fill="#222"/>

                <path d="
                    M130 160
                    Q150 175 170 160"
                    fill="none"
                    stroke="#9b4c52"
                    stroke-width="6"
                    stroke-linecap="round"/>

                <path d="
                    M75 285
                    Q85 205 150 200
                    Q215 205 225 285"
                    fill="#302f75"/>
            </svg>
        `);


    const girlAvatar =
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="300"
                 height="300"
                 viewBox="0 0 300 300">

                <defs>
                    <linearGradient id="bg"
                        x1="0" y1="0"
                        x2="1" y2="1">
                        <stop offset="0%"
                              stop-color="#e63c91"/>
                        <stop offset="100%"
                              stop-color="#8e4de8"/>
                    </linearGradient>
                </defs>

                <rect width="300"
                      height="300"
                      rx="40"
                      fill="url(#bg)"/>

                <circle cx="150"
                        cy="125"
                        r="63"
                        fill="#f4c7a5"/>

                <path d="
                    M82 135
                    C45 85 80 35 145 42
                    C220 30 250 95 213 155
                    L195 112
                    C173 83 126 82 101 110
                    Z"
                    fill="#5a3428"/>

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
                    M72 285
                    Q85 205 150 200
                    Q215 205 228 285"
                    fill="#e94c9b"/>
            </svg>
        `);


    /* =========================
       SHOW / HIDE SCREENS
    ========================= */

    function showScreen(screen) {

        const screens = [
            loadingScreen,
            accountScreen,
            avatarScreen,
            gameScreen
        ];

        screens.forEach(item => {
            if (item) {
                item.classList.remove("active");
                item.style.display = "none";
            }
        });

        if (screen) {
            screen.style.display = "flex";

            setTimeout(() => {
                screen.classList.add("active");
            }, 20);
        }
    }


    /* =========================
       LOADING
    ========================= */

    setTimeout(() => {

        if (loadingScreen) {
            loadingScreen.classList.add("loaded");
        }

    }, 1200);


    /* =========================
       START GAME
    ========================= */

    if (startButton) {

        startButton.addEventListener("click", () => {

            showScreen(accountScreen);

        });

    }


    /* =========================
       ACCOUNT CONTINUE
    ========================= */

    if (accountContinue) {

        accountContinue.addEventListener("click", () => {

            const name =
                nameInput ?
                nameInput.value.trim() :
                "";

            const age =
                ageInput ?
                Number(ageInput.value) :
                0;

            const gender =
                genderSelect ?
                genderSelect.value :
                "";


            if (!name) {
                alert("Please enter your name.");
                return;
            }


            if (!age || age < 18) {
                alert("You must be 18 or older.");
                return;
            }


            if (!gender) {
                alert("Please choose your gender.");
                return;
            }


            player.name = name;
            player.age = age;
            player.gender = gender;


            prepareAvatarScreen();

            showScreen(avatarScreen);

        });

    }


    /* =========================
       PREPARE AVATAR SCREEN
    ========================= */

    function prepareAvatarScreen() {

        selectedAvatar = null;

        if (!avatarPreview) return;


        if (
            player.gender.toLowerCase() === "male" ||
            player.gender.toLowerCase() === "boy"
        ) {

            avatarPreview.src = boyAvatar;

        } else if (
            player.gender.toLowerCase() === "female" ||
            player.gender.toLowerCase() === "girl"
        ) {

            avatarPreview.src = girlAvatar;

        } else {

            avatarPreview.src = boyAvatar;

        }


        avatarPreview.classList.remove("uploaded");


        if (avatarSquare) {
            avatarSquare.classList.remove("has-image");
        }


        if (avatarInput) {
            avatarInput.value = "";
        }

    }


    /* =========================
       CLICK AVATAR SQUARE
    ========================= */

    if (avatarSquare && avatarInput) {

        avatarSquare.addEventListener("click", () => {

            avatarInput.click();

        });

    }


    /* =========================
       CHOOSE FROM GALLERY
    ========================= */

    if (avatarInput) {

        avatarInput.addEventListener("change", event => {

            const file =
                event.target.files &&
                event.target.files[0];


            if (!file) return;


            if (!file.type.startsWith("image/")) {

                alert("Please choose an image.");
                return;

            }


            const reader = new FileReader();


            reader.onload = e => {

                selectedAvatar = e.target.result;

                if (avatarPreview) {

                    avatarPreview.src =
                        selectedAvatar;

                    avatarPreview.classList.add(
                        "uploaded"
                    );

                }


                if (avatarSquare) {

                    avatarSquare.classList.add(
                        "has-image"
                    );

                }

            };


            reader.readAsDataURL(file);

        });

    }


    /* =========================
       CONTINUE AFTER AVATAR
    ========================= */

    if (avatarContinue) {

        avatarContinue.addEventListener("click", () => {

            if (selectedAvatar) {

                player.avatar =
                    selectedAvatar;

            } else {

                /*
                 User did not upload a photo.
                 Use automatic avatar.
                */

                if (
                    player.gender.toLowerCase() === "female" ||
                    player.gender.toLowerCase() === "girl"
                ) {

                    player.avatar =
                        girlAvatar;

                } else {

                    player.avatar =
                        boyAvatar;

                }

            }


            savePlayer();

            openGame();

        });

    }


    /* =========================
       SKIP AVATAR
    ========================= */

    if (avatarSkip) {

        avatarSkip.addEventListener("click", () => {

            if (
                player.gender.toLowerCase() === "female" ||
                player.gender.toLowerCase() === "girl"
            ) {

                player.avatar =
                    girlAvatar;

            } else {

                player.avatar =
                    boyAvatar;

            }


            savePlayer();

            openGame();

        });

    }


    /* =========================
       BACK FROM AVATAR
    ========================= */

    if (backAvatar) {

        backAvatar.addEventListener("click", () => {

            showScreen(accountScreen);

        });

    }


    /* =========================
       BACK FROM ACCOUNT
    ========================= */

    if (backAccount) {

        backAccount.addEventListener("click", () => {

            showScreen(loadingScreen);

        });

    }


    /* =========================
       SAVE PLAYER
    ========================= */

    function savePlayer() {

        try {

            localStorage.setItem(
                "flirthubXPlayer",
                JSON.stringify(player)
            );

        } catch (error) {

            console.log(
                "Could not save player:",
                error
            );

        }

    }


    /* =========================
       LOAD PLAYER
    ========================= */

    function loadPlayer() {

        try {

            const saved =
                localStorage.getItem(
                    "flirthubXPlayer"
                );


            if (!saved) return;


            const data =
                JSON.parse(saved);


            if (!data) return;


            player = {
                ...player,
                ...data
            };


        } catch (error) {

            console.log(
                "Could not load player:",
                error
            );

        }

    }


    /* =========================
       OPEN GAME
    ========================= */

    function openGame() {

        showScreen(gameScreen);

        updateGamePlayer();

    }


    /* =========================
       UPDATE PLAYER IN GAME
    ========================= */

    function updateGamePlayer() {

        const playerNameElements =
            document.querySelectorAll(
                "[data-player-name]"
            );


        playerNameElements.forEach(element => {

            element.textContent =
                player.name || "You";

        });


        const playerAvatarElements =
            document.querySelectorAll(
                "[data-player-avatar]"
            );


        playerAvatarElements.forEach(element => {

            if (player.avatar) {

                element.src =
                    player.avatar;

            }

        });

    }


    /* =====================================================
       GAME NAVIGATION
       GAME / MESSAGE / ACCOUNT
       ===================================================== */

    const bottomButtons =
        document.querySelectorAll(
            "[data-tab]"
        );


    const gameTab =
        document.getElementById("game-tab");

    const messageTab =
        document.getElementById("message-tab");

    const accountTab =
        document.getElementById("account-tab");


    bottomButtons.forEach(button => {

        button.addEventListener("click", () => {

            const tab =
                button.dataset.tab;


            if (tab === "game") {

                showTab(gameTab);

            }

            if (tab === "message") {

                showTab(messageTab);

            }

            if (tab === "account") {

                showTab(accountTab);

            }

        });

    });


    function showTab(tab) {

        const tabs = [
            gameTab,
            messageTab,
            accountTab
        ];


        tabs.forEach(item => {

            if (item) {

                item.classList.remove(
                    "active"
                );

                item.style.display =
                    "none";

            }

        });


        if (tab) {

            tab.style.display =
                "block";

            setTimeout(() => {

                tab.classList.add(
                    "active"
                );

            }, 10);

        }

    }


    /* =====================================================
       ROOM / SPIN BOTTLE
       ===================================================== */

    const spinBottle =
        document.getElementById(
            "spin-bottle"
        );


    if (spinBottle) {

        spinBottle.addEventListener(
            "click",
            () => {

                spinBottle.classList.add(
                    "spinning"
                );


                setTimeout(() => {

                    spinBottle.classList.remove(
                        "spinning"
                    );


                    const players = [
                        "Alex",
                        "Mia",
                        "Daniel",
                        "Lina"
                    ];


                    const randomPlayer =
                        players[
                            Math.floor(
                                Math.random() *
                                players.length
                            )
                        ];


                    alert(
                        "The bottle chose " +
                        randomPlayer +
                        " ❤️"
                    );

                }, 1800);

            }
        );

    }


    /* =====================================================
       GIFT SYSTEM
       Gifts belong INSIDE the GAME/ROOM,
       NOT inside the bottom navigation.
       ===================================================== */

    const giftButton =
        document.getElementById(
            "gift-button"
        );

    const giftPanel =
        document.getElementById(
            "gift-panel"
        );


    if (giftButton && giftPanel) {

        giftButton.addEventListener(
            "click",
            () => {

                giftPanel.classList.toggle(
                    "active"
                );

            }
        );

    }


    /* =========================
       GIFT SELECTION
    ========================= */

    document.querySelectorAll(
        "[data-gift]"
    ).forEach(gift => {

        gift.addEventListener(
            "click",
            () => {

                const giftName =
                    gift.dataset.gift ||
                    "Gift";


                const target =
                    gift.dataset.target ||
                    "Alex";


                sendGift(
                    giftName,
                    target
                );

            }
        );

    });


    function sendGift(
        giftName,
        target
    ) {

        const giftMessage =
            document.createElement(
                "div"
            );


        giftMessage.className =
            "gift-message";


        giftMessage.innerHTML = `
            <span class="gift-icon">🎁</span>
            <strong>${escapeHTML(player.name)}</strong>
            sent
            <strong>${escapeHTML(giftName)}</strong>
            to
            <strong>${escapeHTML(target)}</strong>
        `;


        const messageArea =
            document.getElementById(
                "game-messages"
            );


        if (messageArea) {

            messageArea.appendChild(
                giftMessage
            );

            messageArea.scrollTop =
                messageArea.scrollHeight;

        }


        if (giftPanel) {

            giftPanel.classList.remove(
                "active"
            );

        }

    }


    /* =====================================================
       CHAT
       ===================================================== */

    const messageInput =
        document.getElementById(
            "message-input"
        );

    const sendMessageButton =
        document.getElementById(
            "send-message"
        );

    const gameMessages =
        document.getElementById(
            "game-messages"
        );


    function sendChatMessage() {

        if (!messageInput) return;


        const text =
            messageInput.value.trim();


        if (!text) return;


        const message =
            document.createElement(
                "div"
            );


        message.className =
            "chat-message outgoing";


        message.innerHTML = `
            <div class="message-name">
                ${escapeHTML(
                    player.name || "You"
                )}
            </div>

            <div class="message-bubble">
                ${escapeHTML(text)}
            </div>

            <div class="message-time">
                ${getTime()}
            </div>
        `;


        if (gameMessages) {

            gameMessages.appendChild(
                message
            );

            gameMessages.scrollTop =
                gameMessages.scrollHeight;

        }


        messageInput.value = "";


        simulateReply();

    }


    if (sendMessageButton) {

        sendMessageButton.addEventListener(
            "click",
            sendChatMessage
        );

    }


    if (messageInput) {

        messageInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    sendChatMessage();

                }

            }
        );

    }


    /* =========================
       SIMULATED CHAT REPLY
    ========================= */

    function simulateReply() {

        const replies = [

            "Nice to meet you 😊",

            "Haha, really? 😄",

            "That's cute ❤️",

            "Tell me more about you.",

            "Maybe we should spin the bottle 😉",

            "You seem interesting 👀",

            "I like your vibe ❤️"

        ];


        const reply =
            replies[
                Math.floor(
                    Math.random() *
                    replies.length
                )
            ];


        setTimeout(() => {

            if (!gameMessages) return;


            const message =
                document.createElement(
                    "div"
                );


            message.className =
                "chat-message incoming";


            message.innerHTML = `
                <div class="message-name">
                    Alex
                </div>

                <div class="message-bubble">
                    ${reply}
                </div>

                <div class="message-time">
                    ${getTime()}
                </div>
            `;


            gameMessages.appendChild(
                message
            );


            gameMessages.scrollTop =
                gameMessages.scrollHeight;


        }, 900);

    }


    /* =====================================================
       ACCOUNT PROFILE
       ===================================================== */

    const accountName =
        document.getElementById(
            "account-name"
        );

    const accountAge =
        document.getElementById(
            "account-age"
        );

    const accountGender =
        document.getElementById(
            "account-gender"
        );

    const saveAccountButton =
        document.getElementById(
            "save-account"
        );


    function updateAccountPage() {

        if (accountName) {

            accountName.textContent =
                player.name || "Player";

        }


        if (accountAge) {

            accountAge.textContent =
                player.age || "";

        }


        if (accountGender) {

            accountGender.textContent =
                player.gender || "";

        }

    }


    if (accountTab) {

        accountTab.addEventListener(
            "click",
            updateAccountPage
        );

    }


    if (saveAccountButton) {

        saveAccountButton.addEventListener(
            "click",
            () => {

                if (accountName) {

                    player.name =
                        accountName.value.trim();

                }


                if (accountAge) {

                    player.age =
                        accountAge.value;

                }


                savePlayer();

                updateGamePlayer();

            }
        );

    }


    /* =====================================================
       ROOM PLAYER CARDS
       ===================================================== */

    document.querySelectorAll(
        "[data-player-card]"
    ).forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const name =
                    card.dataset.playerCard ||
                    "Player";


                openPlayerProfile(name);

            }
        );

    });


    /* =====================================================
       PLAYER PROFILE POPUP
       ===================================================== */

    function openPlayerProfile(name) {

        const popup =
            document.getElementById(
                "player-profile"
            );


        if (!popup) return;


        const nameElement =
            popup.querySelector(
                "[data-profile-name]"
            );


        if (nameElement) {

            nameElement.textContent =
                name;

        }


        popup.classList.add(
            "active"
        );

    }


    const closeProfile =
        document.getElementById(
            "close-player-profile"
        );


    if (closeProfile) {

        closeProfile.addEventListener(
            "click",
            () => {

                const popup =
                    document.getElementById(
                        "player-profile"
                    );


                if (popup) {

                    popup.classList.remove(
                        "active"
                    );

                }

            }
        );

    }


    /* =====================================================
       HELPER FUNCTIONS
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


    function escapeHTML(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =========================
       INITIALIZE
    ========================= */

    loadPlayer();


    /*
       If the user already has an account,
       don't force them through onboarding
       every time.
    */

    if (
        player.name &&
        player.age &&
        player.avatar &&
        gameScreen
    ) {

        showScreen(gameScreen);

        updateGamePlayer();

    } else {

        /*
           Keep loading screen visible
           when opening for the first time.
        */

        if (loadingScreen) {

            loadingScreen.style.display =
                "flex";

        }

        if (accountScreen) {

            accountScreen.style.display =
                "none";

        }

        if (avatarScreen) {

            avatarScreen.style.display =
                "none";

        }

        if (gameScreen) {

            gameScreen.style.display =
                "none";

        }

    }

});
