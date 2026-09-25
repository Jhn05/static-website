document.addEventListener("DOMContentLoaded", () => {
    const clock = document.querySelector(".nav-clock");
    const backToTop = document.querySelector(".back-to-top");
    const funnyTimerButton = document.querySelector("#funny-timer-button");
    const funnyTimer = document.querySelector("#funny-timer");
    const raptureCountdown = document.querySelector("#rapture-countdown");
    const navLinks = [...document.querySelectorAll("nav a")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const updateClock = () => {
        const now = new Date();
        const format = (value) => String(value).padStart(2, "0");
        const hour = now.getHours();
        const twelveHour = hour % 12 || 12;
        const meridiem = hour >= 12 ? "PM" : "AM";
        clock.textContent = `${format(twelveHour)}:${format(now.getMinutes())}:${format(now.getSeconds())} ${meridiem}`;
    };

    if (clock) {
        updateClock();
        window.setInterval(updateClock, 1000);
    }

    const setActiveLink = (link) => {
        navLinks.forEach((navLink) => navLink.classList.toggle("active", navLink === link));
    };

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const currentLink = navLinks.find((link) => link.getAttribute("href") === currentPage);
    if (currentLink) {
        setActiveLink(currentLink);
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", () => setActiveLink(link));
    });

    if (!reducedMotion) {
        const updateParallax = () => {
            document.body.style.setProperty("--parallax-y", `${window.scrollY * 0.03}px`);
        };

        updateParallax();
        window.addEventListener("scroll", updateParallax, { passive: true });
    }

    if (backToTop) {
        const toggleBackToTop = () => {
            const isVisible = window.scrollY > 500;
            backToTop.classList.toggle("is-visible", isVisible);
            backToTop.setAttribute("aria-hidden", String(!isVisible));
        };

        toggleBackToTop();
        window.addEventListener("scroll", toggleBackToTop, { passive: true });
        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: reducedMotion ? "auto" : "smooth"
            });
        });
    }

    if (funnyTimerButton && funnyTimer && raptureCountdown) {
        const dayInMilliseconds = 24 * 60 * 60 * 1000;
        const countdownDuration = (341 * 365 + 84) * dayInMilliseconds
            + (5 * 60 * 60 * 1000)
            + (32 * 60 * 1000)
            + (15 * 1000);
        const countdownStorageKey = "funny-timer-target";
        let targetTime = Number(localStorage.getItem(countdownStorageKey)) || 0;
        let countdownInterval = null;
        const confettiColors = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"];
        let audioContext = null;

        const playSound = (notes) => {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass || reducedMotion) {
                return;
            }

            audioContext ||= new AudioContextClass();
            audioContext.resume();
            const startTime = audioContext.currentTime;

            notes.forEach((note, noteIndex) => {
                const oscillator = audioContext.createOscillator();
                const volume = audioContext.createGain();
                const noteStart = startTime + noteIndex * 0.12;
                oscillator.type = noteIndex === notes.length - 1 ? "triangle" : "sine";
                oscillator.frequency.value = note;
                volume.gain.setValueAtTime(0.0001, noteStart);
                volume.gain.exponentialRampToValueAtTime(0.16, noteStart + 0.02);
                volume.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.18);
                oscillator.connect(volume);
                volume.connect(audioContext.destination);
                oscillator.start(noteStart);
                oscillator.stop(noteStart + 0.2);
            });
        };

        const playYaySound = () => playSound([523.25, 659.25, 783.99, 1046.5]);
        const playAwwSound = () => playSound([392, 349.23, 293.66, 233.08]);

        const triggerConfetti = () => {
            if (reducedMotion) {
                return;
            }

            const burst = document.createElement("div");
            const buttonBounds = funnyTimerButton.getBoundingClientRect();
            burst.className = "confetti-burst";

            for (let pieceIndex = 0; pieceIndex < 64; pieceIndex += 1) {
                const piece = document.createElement("span");
                const angle = Math.random() * Math.PI * 2;
                const distance = 110 + Math.random() * 240;
                piece.className = "confetti-piece";
                piece.style.setProperty("--origin-x", `${buttonBounds.left + buttonBounds.width / 2}px`);
                piece.style.setProperty("--origin-y", `${buttonBounds.top + buttonBounds.height / 2}px`);
                piece.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
                piece.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
                piece.style.setProperty("--rotation", `${Math.random() * 720 - 360}deg`);
                piece.style.setProperty("--confetti-color", confettiColors[pieceIndex % confettiColors.length]);
                burst.append(piece);
            }

            document.body.append(burst);
            window.setTimeout(() => burst.remove(), 1000);
        };

        const updateFunnyTimer = () => {
            const remainingSeconds = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
            const years = Math.floor(remainingSeconds / (365 * 24 * 60 * 60));
            const days = Math.floor((remainingSeconds % (365 * 24 * 60 * 60)) / (24 * 60 * 60));
            const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
            const seconds = remainingSeconds % 60;
            const format = (value) => String(value).padStart(2, "0");

            raptureCountdown.textContent = `${years} Years | ${format(days)} Days | ${format(hours)} Hours | ${format(minutes)} Minutes | ${format(seconds)} Seconds`;
        };

        funnyTimerButton.addEventListener("click", () => {
            const isOpening = !funnyTimer.classList.contains("is-open");

            if (isOpening && !targetTime) {
                targetTime = Date.now() + countdownDuration;
                localStorage.setItem(countdownStorageKey, String(targetTime));
            }

            funnyTimer.classList.toggle("is-open", isOpening);
            funnyTimerButton.classList.toggle("is-open", isOpening);
            funnyTimer.setAttribute("aria-hidden", String(!isOpening));
            funnyTimerButton.setAttribute("aria-expanded", String(isOpening));
            funnyTimerButton.textContent = isOpening ? "hide funny timer" : "funny timer";

            if (isOpening) {
                updateFunnyTimer();
                triggerConfetti();
                playYaySound();
            } else {
                playAwwSound();
            }

            if (isOpening && !countdownInterval) {
                countdownInterval = window.setInterval(updateFunnyTimer, 1000);
            }
        });
    }

    const externalLinks = [...document.querySelectorAll('a[href^="http"]')];
    if (externalLinks.length) {
        const confirmation = document.createElement("div");
        confirmation.className = "link-confirmation";
        confirmation.setAttribute("aria-hidden", "true");
        confirmation.innerHTML = `
            <div class="link-confirmation__panel" role="dialog" aria-modal="true" aria-labelledby="link-confirmation-title">
                <h2 id="link-confirmation-title">Open external link?</h2>
                <p class="link-confirmation__url"></p>
                <div class="link-confirmation__actions">
                    <button class="link-confirmation__cancel" type="button">Cancel</button>
                    <button class="link-confirmation__open" type="button">Open link</button>
                </div>
            </div>`;
        document.body.append(confirmation);

        const urlText = confirmation.querySelector(".link-confirmation__url");
        const cancelButton = confirmation.querySelector(".link-confirmation__cancel");
        const openButton = confirmation.querySelector(".link-confirmation__open");
        let pendingLink = null;

        const closeConfirmation = () => {
            pendingLink = null;
            confirmation.classList.remove("is-open");
            confirmation.setAttribute("aria-hidden", "true");
        };

        const showConfirmation = (link) => {
            pendingLink = link;
            urlText.textContent = link.href;
            confirmation.classList.add("is-open");
            confirmation.setAttribute("aria-hidden", "false");
            cancelButton.focus();
        };

        externalLinks.forEach((link) => {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                showConfirmation(link);
            });
        });

        cancelButton.addEventListener("click", closeConfirmation);
        confirmation.addEventListener("click", (event) => {
            if (event.target === confirmation) {
                closeConfirmation();
            }
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && pendingLink) {
                closeConfirmation();
            }
        });
        openButton.addEventListener("click", () => {
            if (!pendingLink) {
                return;
            }

            const destination = pendingLink.href;
            const target = pendingLink.target || "_self";
            closeConfirmation();
            if (target === "_blank") {
                window.open(destination, "_blank", "noopener,noreferrer");
            } else {
                window.location.assign(destination);
            }
        });
    }
});
