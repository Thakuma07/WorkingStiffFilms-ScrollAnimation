document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const teamSection = document.querySelector(".team");
    const teamMembers = gsap.utils.toArray(".team-member");
    const teamMemberCards = gsap.utils.toArray(".team-member-card");

    let cardPlaceholderEntrance = null;
    let cardSlideInAnimation = null;

    function initHeroAnimation() {
        const lines = document.querySelectorAll(".hero-title span");
        const isDesktop = window.innerWidth > 1000;

        lines.forEach((line) => {
            const text = line.textContent;
            line.innerHTML = "";
            [...text].forEach((char) => {
                const charSpan = document.createElement("span");
                charSpan.textContent = char === " " ? "\u00A0" : char;
                charSpan.style.display = "inline-block";
                line.appendChild(charSpan);
            });

            const chars = line.querySelectorAll("span");
            gsap.from(chars, {
                scrollTrigger: {
                    trigger: line,
                    start: "top 90%",
                },
                duration: isDesktop ? 2.2 : 1.2,
                opacity: 0,
                scale: 0,
                y: 20,
                rotationX: -90,
                stagger: isDesktop ? 0.12 : 0.05,
                ease: "elastic.out(1, 0.5)",
                transformOrigin: "center center",
                delay: isDesktop ? 0.3 : 0,
            });
        });

        // Inflating effect for the subtext
        gsap.from(".hero-subtext", {
            scrollTrigger: {
                trigger: ".hero-subtext",
                start: "top 95%",
            },
            duration: 1.5,
            opacity: 0,
            y: 30,
            ease: "power3.out",
            delay: 0.5
        });
    }

    function initFooterAnimation() {
        gsap.from(".hero-footer p", {
            scrollTrigger: {
                trigger: ".hero-footer",
                start: "top 100%",
            },
            duration: 1,
            opacity: 0,
            y: 20,
            stagger: 0.2,
            ease: "power2.out",
            delay: 1.2
        });
    }

    function initTeamAnimation() {
        if (window.innerWidth < 1000) {
            if (cardPlaceholderEntrance) cardPlaceholderEntrance.kill();
            if (cardSlideInAnimation) cardSlideInAnimation.kill();

            teamMembers.forEach((member) => {
                gsap.set(member, { clearProps: "all" });
                const teamMemberInitial = member.querySelector(
                    ".team-member-name-initial h1"
                );
                gsap.set(teamMemberInitial, { clearProps: "all" });
            });

            teamMemberCards.forEach((card) => {
                gsap.set(card, { clearProps: "all" });
            });

            return;
        }

        if (cardPlaceholderEntrance) cardPlaceholderEntrance.kill();
        if (cardSlideInAnimation) cardSlideInAnimation.kill();

        cardPlaceholderEntrance = ScrollTrigger.create({
            trigger: teamSection,
            start: "top bottom",
            end: "top top",
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;

                teamMembers.forEach((member, index) => {
                    const entranceDelay = 0.15;
                    const entranceDuration = 0.7;
                    const entranceStart = index * entranceDelay;
                    const entranceEnd = entranceStart + entranceDuration;

                    if (progress >= entranceStart && progress <= entranceEnd) {
                        const memberEntranceProgress =
                            (progress - entranceStart) / entranceDuration;

                        const entranceY = 125 - memberEntranceProgress * 125;
                        gsap.set(member, { y: `${entranceY}%` });

                        const teamMemberInitial = member.querySelector(
                            ".team-member-name-initial h1"
                        );
                        const initialLetterScaleDelay = 0.4;
                        const initialLetterScaleProgress = Math.max(
                            0,
                            (memberEntranceProgress - initialLetterScaleDelay) /
                            (1 - initialLetterScaleDelay)
                        );
                        gsap.set(teamMemberInitial, { scale: initialLetterScaleProgress });
                    } else if (progress > entranceEnd) {
                        gsap.set(member, { y: `0%` });
                        const teamMemberInitial = member.querySelector(
                            ".team-member-name-initial h1"
                        );
                        gsap.set(teamMemberInitial, { scale: 1 });
                    }
                });
            },
        });

        cardSlideInAnimation = ScrollTrigger.create({
            trigger: teamSection,
            start: "top top",
            end: `+=${window.innerHeight * 3}`,
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;

                teamMemberCards.forEach((card, index) => {
                    const slideInStagger = 0.075;
                    const xRotationDuration = 0.4;
                    const xRotationStart = index * slideInStagger;
                    const xRotationEnd = xRotationStart + xRotationDuration;

                    if (progress >= xRotationStart && progress <= xRotationEnd) {
                        const cardProgress =
                            (progress - xRotationStart) / xRotationDuration;

                        const cardInitialX = 300 - index * 100;
                        const cardTargetX = -50;
                        const cardSlideInX =
                            cardInitialX + cardProgress * (cardTargetX - cardInitialX);

                        const cardSlideInRotation = 20 - cardProgress * 20;

                        gsap.set(card, {
                            x: `${cardSlideInX}%`,
                            rotation: cardSlideInRotation,
                        });
                    } else if (progress > xRotationEnd) {
                        gsap.set(card, {
                            x: `-50%`,
                            rotation: 0,
                        });
                    }

                    const cardScaleStagger = 0.12;
                    const cardScaleStart = 0.4 + index * cardScaleStagger;
                    const cardScaleEnd = 1;

                    if (progress >= cardScaleStart && progress <= cardScaleEnd) {
                        const scaleProgress =
                            (progress - cardScaleStart) / (cardScaleEnd - cardScaleStart);
                        const scaleValue = 0.75 + scaleProgress * 0.25;

                        gsap.set(card, {
                            scale: scaleValue,
                        });
                    } else if (progress > cardScaleEnd) {
                        gsap.set(card, {
                            scale: 1,
                        });
                    }
                });
            },
        });
    }

    function initOutroAnimation() {
        const outroText = document.querySelector(".outro-text");
        if (!outroText) return;

        // Function to wrap words in spans while preserving inner HTML structure
        const wrapWords = (element) => {
            const nodes = Array.from(element.childNodes);
            element.innerHTML = "";

            nodes.forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const words = node.textContent.split(/(\s+)/);
                    words.forEach((word) => {
                        if (word.trim().length > 0) {
                            const container = document.createElement("span");
                            container.className = "reveal-container";
                            const item = document.createElement("span");
                            item.className = "reveal-item";
                            item.textContent = word;
                            container.appendChild(item);
                            element.appendChild(container);
                        } else if (word.includes("\n") || word.includes(" ")) {
                            element.appendChild(document.createTextNode(word));
                        }
                    });
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === "BR") {
                        element.appendChild(node);
                    } else {
                        // For spans with classes (montreal-*), wrap the whole span as a reveal unit
                        const container = document.createElement("span");
                        container.className = "reveal-container";
                        const item = node.cloneNode(true);
                        item.classList.add("reveal-item");
                        container.appendChild(item);
                        element.appendChild(container);
                    }
                }
            });
        };

        wrapWords(outroText);

        const revealItems = outroText.querySelectorAll(".reveal-item");

        gsap.from(revealItems, {
            scrollTrigger: {
                trigger: outroText,
                start: "top 85%",
                toggleActions: "play none none none",
            },
            y: "110%",
            skewY: 7,
            duration: 1.2,
            stagger: 0.03,
            ease: "power4.out",
        });
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initTeamAnimation();
            initOutroAnimation();
            ScrollTrigger.refresh();
        }, 250);
    });

    initHeroAnimation();
    initFooterAnimation();
    initTeamAnimation();
    initOutroAnimation();
});