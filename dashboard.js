/* ============================================
   GREENFIELD PARTNERS — DASHBOARD JS
   Single-viewport dashboard: clocks, counters,
   entry animations, bento hover glow
   ============================================ */

// ==========================================
// 1. WORLD CLOCKS
// ==========================================
const TIMEZONES = [
    { id: 'clock-ny',  tz: 'America/New_York'  },
    { id: 'clock-tlv', tz: 'Asia/Jerusalem'     },
    { id: 'clock-ldn', tz: 'Europe/London'      },
];

function updateClocks() {
    TIMEZONES.forEach(({ id, tz }) => {
        const now = new Date();

        // Get time parts in the target timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });

        const parts = formatter.formatToParts(now);
        const hours24 = parseInt(parts.find(p => p.type === 'hour').value);
        const minutes = parseInt(parts.find(p => p.type === 'minute').value);
        const seconds = parseInt(parts.find(p => p.type === 'second').value);

        // Digital time display (HH:MM format)
        const displayFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        const el = document.getElementById(id);
        if (el) el.textContent = displayFormatter.format(now);

        // Analog clock hands
        const clockItem = document.querySelector(`[data-timezone="${tz}"]`);
        if (!clockItem) return;

        const svgContainer = clockItem.querySelector('.clock-svg');
        if (!svgContainer) return;

        const hourHand = svgContainer.querySelector('.clock-hand-hour');
        const minuteHand = svgContainer.querySelector('.clock-hand-minute');
        const secondHand = svgContainer.querySelector('.clock-hand-second');

        const hours12 = hours24 % 12;
        const hourDeg = (hours12 * 30) + (minutes * 0.5);   // 360/12 = 30° per hour
        const minuteDeg = (minutes * 6) + (seconds * 0.1);   // 360/60 = 6° per minute
        const secondDeg = seconds * 6;                        // 360/60 = 6° per second

        if (hourHand)   hourHand.style.transform   = `rotate(${hourDeg}deg)`;
        if (minuteHand) minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
        if (secondHand) secondHand.style.transform = `rotate(${secondDeg}deg)`;
    });
}

// Update every second
setInterval(updateClocks, 1000);
updateClocks(); // initial call


// ==========================================
// 2. NAVIGATION (simplified — no scroll/Lenis)
// ==========================================
const navHamburger = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (navHamburger && mobileMenu) {
    navHamburger.addEventListener('click', () => {
        navHamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    document.querySelectorAll('.mobile-menu-link, .mobile-cta').forEach(link => {
        link.addEventListener('click', () => {
            navHamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });
}


// ==========================================
// 3. COUNTER ANIMATIONS
// ==========================================
function initCounters() {
    document.querySelectorAll('.hero-stat-number').forEach(el => {
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals) || 0;

        gsap.to(el, {
            innerText: target,
            duration: 2,
            delay: 0.8,
            ease: 'power2.out',
            snap: decimals === 0 ? { innerText: 1 } : {},
            onUpdate: function () {
                if (decimals > 0) {
                    el.innerText = parseFloat(el.innerText).toFixed(decimals);
                }
            }
        });
    });
}


// ==========================================
// 4. ENTRY ANIMATIONS (fade-in on load)
// ==========================================
function initEntryAnimations() {
    const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.3, // slight delay after page load
    });

    // Headline text
    tl.from('.dashboard-headline-text', {
        y: 30,
        opacity: 0,
        duration: 1,
    })
    // Headline button
    .from('.dashboard-headline-btn', {
        y: 15,
        opacity: 0,
        duration: 0.6,
    }, '-=0.5')
    // Bento cards stagger in
    .from('.dashboard-bento-grid .bento-card', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        stagger: 0.06,
    }, '-=0.5')
    // Clocks
    .from('.clock-item', {
        y: 15,
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.12,
        ease: 'back.out(1.4)',
    }, '-=0.5')
    // Stats
    .from('.dashboard-stat', {
        y: 15,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
    }, '-=0.4');

    // Start counters
    initCounters();
}


// ==========================================
// 5. BENTO CARD HOVER GLOW
// ==========================================
function initBentoGlow() {
    document.querySelectorAll('.bento-card').forEach(card => {
        const glow = card.querySelector('.bento-card-glow');
        if (!glow) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            glow.style.background =
                `radial-gradient(600px circle at ${x}px ${y}px, rgba(74, 144, 217, 0.08), transparent 40%)`;
        });
    });
}


// ==========================================
// 6. INIT
// ==========================================
window.addEventListener('load', () => {
    initEntryAnimations();
    initBentoGlow();
});
