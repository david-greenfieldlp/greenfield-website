/* ============================================
   BENTO GRID ROTATION
   Content-swap crossfade, 7-second cycle,
   clockwise through all portfolio companies.
   ============================================ */

(function () {
    'use strict';

    // ── Configuration ──────────────────────────────
    const ROTATION_INTERVAL = 7000;   // ms between rotations
    const FADE_DURATION     = 0.6;    // seconds per crossfade (0.3 out + 0.3 in)
    const STAGGER_DELAY     = 0.07;   // seconds between each slot's fade
    const INITIAL_DELAY     = 4000;   // ms before first rotation (let entry anims finish)

    // ── Slot order (clockwise path) ────────────────
    //  0 = featured (entry) → 1 → 2 → 3 → 4 → 5 → 6 (exit)
    const SLOT_ORDER = [0, 1, 2, 3, 4, 5, 6];
    const SLOT_COUNT = SLOT_ORDER.length;

    // ── Initial slot → company mapping ─────────────
    //  Matches the HTML data-slot attributes
    const initialSlotIds = [
        'vast',       // slot 0 — featured
        'coralogix',  // slot 1 — top-mid
        'exodigo',    // slot 2 — top-right
        'silverfort', // slot 3 — bot-right
        'aai',        // slot 4 — bot-mid-right
        'torq',       // slot 5 — bot-mid-left
        'robco',      // slot 6 — bot-left (exit)
    ];

    // ── Build full rotation queue ──────────────────
    //  Staged companies enter after the initial 7, then loop.
    const stagedIds = PORTFOLIO
        .map(c => c.id)
        .filter(id => !initialSlotIds.includes(id));

    const allCompanyIds = [...initialSlotIds, ...stagedIds];

    // Track current state: index = slot, value = company id
    let slotState = [...initialSlotIds];
    let nextEntryIndex = SLOT_COUNT; // first "new" company

    // ── Helpers ────────────────────────────────────

    function getCompany(id) {
        return PORTFOLIO.find(c => c.id === id);
    }

    function getSlotEl(slotIndex) {
        return document.querySelector('[data-slot="' + slotIndex + '"]');
    }

    /** Swap all visible content inside a card to match a company */
    function applyCompanyToCard(cardEl, company) {
        // Background image
        const bg = cardEl.querySelector('.bento-card-bg');
        if (bg) bg.style.backgroundImage = "url('" + company.bg + "')";

        // data-category (for AAI special hover styling, etc.)
        cardEl.setAttribute('data-category', company.category);

        // Favicon / logo
        const logo = cardEl.querySelector('.bento-card-logo-img');
        if (logo) {
            logo.src = company.favicon;
            logo.alt = company.name;
        }

        // Sector tag
        const tag = cardEl.querySelector('.bento-card-tag');
        if (tag) tag.textContent = company.sector;

        // Name
        const name = cardEl.querySelector('.bento-card-name');
        if (name) name.textContent = company.name;

        // Description (innerHTML for <br> support)
        const desc = cardEl.querySelector('.bento-card-desc');
        if (desc) desc.innerHTML = company.description;

        // Meta: round + year
        const stage = cardEl.querySelector('.bento-card-stage');
        if (stage) stage.textContent = company.round || '';

        const year = cardEl.querySelector('.bento-card-location');
        if (year) year.textContent = company.year || '';
    }

    // ── Core rotation tick ─────────────────────────

    function rotateTick() {
        // Determine the new company entering slot 0
        const enteringId = allCompanyIds[nextEntryIndex % allCompanyIds.length];
        nextEntryIndex++;

        // Build new slot state: each slot takes the previous slot's company
        const oldState = [...slotState];
        const newState = [enteringId];
        for (let i = 1; i < SLOT_COUNT; i++) {
            newState[i] = oldState[i - 1];
        }

        // Animate crossfade, staggered clockwise
        const tl = gsap.timeline();

        SLOT_ORDER.forEach(function (slotIdx, i) {
            const cardEl = getSlotEl(slotIdx);
            if (!cardEl) return;

            const newCompany = getCompany(newState[slotIdx]);
            if (!newCompany) return;

            // Skip if content isn't changing
            if (newState[slotIdx] === oldState[slotIdx]) return;

            const content = cardEl.querySelector('.bento-card-content');
            const bgEl    = cardEl.querySelector('.bento-card-bg');
            const delay   = i * STAGGER_DELAY;
            const half    = FADE_DURATION * 0.5;

            // Phase 1: fade out
            tl.to([content, bgEl], {
                opacity: 0,
                duration: half,
                ease: 'power2.in',
            }, delay);

            // Phase 2: swap data at midpoint
            tl.call(function () {
                applyCompanyToCard(cardEl, newCompany);
            }, null, delay + half);

            // Phase 3: fade in
            tl.to([content, bgEl], {
                opacity: 1,
                duration: half,
                ease: 'power2.out',
            }, delay + half);
        });

        // Update state
        slotState = newState;
    }

    // ── Pause controls ─────────────────────────────

    let intervalId = null;
    let isPaused   = false;

    function startRotation() {
        intervalId = setInterval(function () {
            if (!isPaused) rotateTick();
        }, ROTATION_INTERVAL);
    }

    function setupHoverPause() {
        const grid = document.querySelector('.dashboard-bento-grid');
        if (!grid) return;
        grid.addEventListener('mouseenter', function () { isPaused = true; });
        grid.addEventListener('mouseleave', function () { isPaused = false; });
    }

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', function () {
        isPaused = document.hidden;
    });

    // ── Preload images ─────────────────────────────

    function preloadImages() {
        PORTFOLIO.forEach(function (company) {
            var img = new Image();
            img.src = company.bg;
            // Also preload favicons
            var fav = new Image();
            fav.src = company.favicon;
        });
    }

    // ── Init ───────────────────────────────────────

    function init() {
        preloadImages();
        setupHoverPause();
        setTimeout(startRotation, INITIAL_DELAY);
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

})();
