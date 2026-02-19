/* ============================================
   GREENFIELD PARTNERS — MAIN JS
   GSAP Animations + Lenis Smooth Scroll
   ============================================ */

// ==========================================
// 1. LENIS SMOOTH SCROLL
// ==========================================
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Connect Lenis to GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ==========================================
// 3. LOADING SEQUENCE
// ==========================================
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loaderBar');

function initLoader() {
    const tl = gsap.timeline({
        onComplete: () => {
            initHeroAnimations();
            initScrollAnimations();
            initDiagramInteractions();
        }
    });

    // Animate loader elements in
    tl.to('.loader-logo', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
    })
    .to('.loader-bar-track', {
        opacity: 1,
        duration: 0.3,
    }, '-=0.3')
    .to('.loader-text', {
        opacity: 1,
        duration: 0.3,
    }, '-=0.2');

    // Simulate loading progress
    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += Math.random() * 25 + 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadInterval);

            // Finish loading
            gsap.to(loaderBar, {
                width: '100%',
                duration: 0.3,
                ease: 'power2.out',
                onComplete: () => {
                    // Animate loader out
                    const outTl = gsap.timeline();
                    outTl.to('.loader-inner', {
                        opacity: 0,
                        y: -30,
                        duration: 0.5,
                        ease: 'power3.inOut'
                    })
                    .to(loader, {
                        yPercent: -100,
                        duration: 1,
                        ease: 'power4.inOut',
                        onComplete: () => {
                            loader.style.display = 'none';
                        }
                    }, '-=0.2');
                }
            });
        } else {
            loaderBar.style.width = progress + '%';
        }
    }, 200);
}

// ==========================================
// 4. HERO ANIMATIONS
// ==========================================
function initHeroAnimations() {
    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Title words reveal
    heroTl.to('.hero-title-word', {
        y: 0,
        opacity: 1,
        duration: 1.4,
        stagger: 0.12,
        ease: 'power4.out'
    })
    // Subtitle
    .to('.hero-subtitle', {
        y: 0,
        opacity: 1,
        duration: 0.8,
    }, '-=0.6')
    // CTA group
    .to('.hero-cta-group', {
        y: 0,
        opacity: 1,
        duration: 0.8,
    }, '-=0.5')
    // Stats
    .to('.hero-stat', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
    }, '-=0.5')
    // Scroll indicator
    .to('.hero-scroll-indicator', {
        opacity: 1,
        duration: 0.8,
    }, '-=0.3');

    // Animate numbers
    document.querySelectorAll('.hero-stat-number').forEach(el => {
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals) || 0;

        gsap.to(el, {
            innerText: target,
            duration: 2,
            delay: 1.5,
            ease: 'power2.out',
            snap: decimals === 0 ? { innerText: 1 } : {},
            onUpdate: function () {
                if (decimals > 0) {
                    el.innerText = parseFloat(el.innerText).toFixed(decimals);
                }
            }
        });
    });

    // Hero parallax on scroll
    gsap.to('.hero-bg-image', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
        }
    });

    // Fade out hero content on scroll
    gsap.to('.hero-content', {
        opacity: 0,
        y: -60,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: '30% top',
            end: '80% top',
            scrub: 0.3,
        }
    });

    // Fade scroll indicator
    gsap.to('.hero-scroll-indicator', {
        opacity: 0,
        scrollTrigger: {
            trigger: '.hero',
            start: '10% top',
            end: '30% top',
            scrub: true,
        }
    });
}

// ==========================================
// 5. SCROLL-TRIGGERED ANIMATIONS
// ==========================================
function initScrollAnimations() {

    // --- Portfolio Section Header ---
    gsap.to('.portfolio-header .section-tag', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.portfolio-header',
            start: 'top 80%',
        }
    });

    // Portfolio title lines
    gsap.from('.portfolio-title-line', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power4.out',
        scrollTrigger: {
            trigger: '.portfolio-header',
            start: 'top 80%',
        }
    });

    gsap.to('.portfolio-view-all', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.portfolio-header',
            start: 'top 80%',
        }
    });

    // --- Bento Cards ---
    const bentoCards = document.querySelectorAll('.bento-card');
    bentoCards.forEach((card, i) => {
        gsap.to(card, {
            y: 0,
            opacity: 1,
            duration: 0.9,
            delay: i * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
            }
        });
    });

    // --- Bento Card Magnetic Hover Glow ---
    bentoCards.forEach(card => {
        const glow = card.querySelector('.bento-card-glow');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            glow.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(74, 144, 217, 0.08), transparent 40%)`;
        });
    });

    // --- Global Presence Section ---
    gsap.to('.global-tag', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.global-header',
            start: 'top 80%',
        }
    });

    gsap.from('.global-title-line', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power4.out',
        scrollTrigger: {
            trigger: '.global-header',
            start: 'top 80%',
        }
    });

    gsap.from('.global-map-wrapper', {
        opacity: 0,
        scale: 0.9,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.global-map-wrapper',
            start: 'top 85%',
        }
    });

    gsap.from('.map-pin', {
        opacity: 0,
        scale: 0,
        duration: 0.6,
        stagger: 0.25,
        ease: 'back.out(1.7)',
        scrollTrigger: {
            trigger: '.global-map-wrapper',
            start: 'top 75%',
        }
    });

    gsap.from('.map-pin-label', {
        opacity: 0,
        y: 10,
        duration: 0.5,
        stagger: 0.25,
        delay: 0.3,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.global-map-wrapper',
            start: 'top 75%',
        }
    });

}

// ==========================================
// 6. INVESTMENT DIAGRAM INTERACTIONS
// ==========================================
function initDiagramInteractions() {
    // --- DESKTOP: Column hover → modal reveal ---
    const columns = document.querySelectorAll('.diagram-col');
    const modals = document.querySelectorAll('.diagram-modal');

    columns.forEach(col => {
        const colIndex = col.dataset.col;

        col.addEventListener('mouseenter', () => {
            // Add hovered state to column
            col.classList.add('hovered');

            // Show corresponding modal
            modals.forEach(modal => {
                if (modal.dataset.modal === colIndex) {
                    modal.classList.add('visible');
                } else {
                    modal.classList.remove('visible');
                }
            });
        });

        col.addEventListener('mouseleave', () => {
            col.classList.remove('hovered');
            modals.forEach(modal => modal.classList.remove('visible'));
        });
    });

    // Keep modal visible when hovering over the modal itself
    modals.forEach(modal => {
        const modalIndex = modal.dataset.modal;

        modal.addEventListener('mouseenter', () => {
            modal.classList.add('visible');
            columns.forEach(col => {
                if (col.dataset.col === modalIndex) {
                    col.classList.add('hovered');
                }
            });
        });

        modal.addEventListener('mouseleave', () => {
            modal.classList.remove('visible');
            columns.forEach(col => col.classList.remove('hovered'));
        });
    });

    // --- MOBILE: Tab switching ---
    const mobileTabs = document.querySelectorAll('.diagram-mobile-tab');
    const mobileSlides = document.querySelectorAll('.diagram-mobile-slide');
    const mobileDots = document.querySelectorAll('.diagram-mobile-dot');

    function switchMobileSlide(index) {
        // Update tabs
        mobileTabs.forEach((tab, i) => {
            tab.classList.toggle('diagram-mobile-tab-active', i == index);
        });

        // Update slides
        mobileSlides.forEach((slide, i) => {
            slide.classList.toggle('diagram-mobile-slide-active', i == index);
        });

        // Update dots
        mobileDots.forEach((dot, i) => {
            dot.classList.toggle('diagram-mobile-dot-active', i == index);
        });
    }

    mobileTabs.forEach(tab => {
        tab.addEventListener('click', () => switchMobileSlide(tab.dataset.tab));
    });

    mobileDots.forEach(dot => {
        dot.addEventListener('click', () => switchMobileSlide(dot.dataset.dot));
    });

    // --- SCROLL ANIMATIONS for the section ---
    // Lead text overlay (desktop)
    gsap.from('.invest-lead-overlay .invest-lead-text', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.diagram-desktop',
            start: 'top 80%',
        }
    });

    gsap.from('.invest-lead-overlay .invest-approach-pill-btn', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.25,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.diagram-desktop',
            start: 'top 80%',
        }
    });

    // Lead text (mobile/tablet)
    gsap.from('.invest-lead-mobile .invest-lead-text', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.invest-lead-mobile',
            start: 'top 85%',
        }
    });

    gsap.from('.invest-lead-mobile .invest-approach-pill-btn', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.25,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.invest-lead-mobile',
            start: 'top 85%',
        }
    });

    // Diagram wrapper reveal
    gsap.from('.diagram-wrapper', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.diagram-desktop',
            start: 'top 85%',
        }
    });

    // Mobile diagram reveal
    gsap.from('.diagram-mobile', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.diagram-mobile',
            start: 'top 85%',
        }
    });
}

// ==========================================
// 7. NAVIGATION
// ==========================================
const nav = document.getElementById('nav');
const navHamburger = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('mobileMenu');

// Scroll detection for nav background
let lastScroll = 0;
lenis.on('scroll', ({ scroll }) => {
    if (scroll > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    lastScroll = scroll;
});

// Mobile menu toggle
navHamburger.addEventListener('click', () => {
    navHamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');

    if (mobileMenu.classList.contains('active')) {
        lenis.stop();
    } else {
        lenis.start();
    }
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-menu-link, .mobile-cta').forEach(link => {
    link.addEventListener('click', () => {
        navHamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        lenis.start();
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            lenis.scrollTo(target, {
                offset: -80,
                duration: 1.5,
            });
        }
    });
});

// ==========================================
// 7. INIT
// ==========================================
window.addEventListener('load', () => {
    initLoader();
});
