/* ============================================
   BENTO GRID ROTATION — Dashboard V2
   8 slots (VAST left card + 7 right-grid cards)
   Content-swap crossfade, 7-second cycle,
   clockwise through all portfolio companies.
   ============================================ */

(function () {
    'use strict';

    // ── Configuration ──────────────────────────────
    const ROTATION_INTERVAL = 7000;   // ms between rotations
    const FADE_DURATION     = 0.6;    // seconds per crossfade
    const STAGGER_DELAY     = 0.07;   // seconds between each slot's fade
    const INITIAL_DELAY     = 4000;   // ms before first rotation

    // ── Slot order (clockwise path) ────────────────
    //  0 = VAST full-height left card (entry)
    //  1 = Exodigo featured (top-left of right grid)
    //  2 = Coralogix (top-mid)
    //  3 = Commcrete (top-right)
    //  4 = RobCo    (bottom row 1)
    //  5 = Torq     (bottom row 2)
    //  6 = AAI      (bottom row 3)
    //  7 = Silverfort (bottom row 4, exit)
    const SLOT_COUNT = 8;

    // ── Initial slot → company mapping ─────────────
    const initialSlotIds = [
        'vast',       // slot 0 — VAST left card (entry)
        'exodigo',    // slot 1 — featured top-left
        'coralogix',  // slot 2 — top-mid
        'commcrete',  // slot 3 — top-right
        'robco',      // slot 4 — bottom 1
        'torq',       // slot 5 — bottom 2
        'aai',        // slot 6 — bottom 3
        'silverfort', // slot 7 — bottom 4 (exit)
    ];

    // ── Build full rotation queue ──────────────────
    const stagedIds = PORTFOLIO
        .map(function (c) { return c.id; })
        .filter(function (id) { return !initialSlotIds.includes(id); });

    const allCompanyIds = initialSlotIds.concat(stagedIds);

    // Track current state: index = slot, value = company id
    var slotState = initialSlotIds.slice();
    var nextEntryIndex = SLOT_COUNT; // first "new" company

    // ── Helpers ────────────────────────────────────

    function getCompany(id) {
        return PORTFOLIO.find(function (c) { return c.id === id; });
    }

    function getSlotEl(slotIndex) {
        return document.querySelector('[data-slot="' + slotIndex + '"]');
    }

    /** Swap all visible content inside a card to match a company */
    function applyCompanyToCard(cardEl, company) {
        // Background image
        var bg = cardEl.querySelector('.bento-card-bg');
        if (bg) bg.style.backgroundImage = "url('" + company.bg + "')";

        // data-category (for special hover styling)
        cardEl.setAttribute('data-category', company.category);

        // Favicon / logo
        var logo = cardEl.querySelector('.bento-card-logo-img');
        if (logo) {
            logo.src = company.favicon;
            logo.alt = company.name;
        }

        // Sector tag
        var tag = cardEl.querySelector('.bento-card-tag');
        if (tag) tag.textContent = company.sector;

        // Name
        var name = cardEl.querySelector('.bento-card-name');
        if (name) name.textContent = company.name;

        // Description (innerHTML for <br> support)
        var desc = cardEl.querySelector('.bento-card-desc');
        if (desc) desc.innerHTML = company.description;

        // Meta: round + year
        var stage = cardEl.querySelector('.bento-card-stage');
        if (stage) stage.textContent = company.round || '';

        var year = cardEl.querySelector('.bento-card-location');
        if (year) year.textContent = company.year || '';
    }

    // ── Core rotation tick ─────────────────────────

    function rotateTick() {
        // Determine the new company entering slot 0 (VAST left card).
        // Skip any company already visible on screen to prevent duplicates.
        var enteringId;
        var tries = 0;
        do {
            enteringId = allCompanyIds[nextEntryIndex % allCompanyIds.length];
            nextEntryIndex++;
            tries++;
        } while (slotState.includes(enteringId) && tries < allCompanyIds.length);

        // Build new slot state: each slot takes the previous slot's company
        var oldState = slotState.slice();
        var newState = [enteringId];
        for (var i = 1; i < SLOT_COUNT; i++) {
            newState[i] = oldState[i - 1];
        }

        // Animate crossfade, staggered clockwise
        var tl = gsap.timeline();

        for (var slotIdx = 0; slotIdx < SLOT_COUNT; slotIdx++) {
            (function (idx) {
                var cardEl = getSlotEl(idx);
                if (!cardEl) return;

                var newCompany = getCompany(newState[idx]);
                if (!newCompany) return;

                // Skip if content isn't changing
                if (newState[idx] === oldState[idx]) return;

                var content = cardEl.querySelector('.bento-card-content');
                var bgEl    = cardEl.querySelector('.bento-card-bg');
                var delay   = idx * STAGGER_DELAY;
                var half    = FADE_DURATION * 0.5;

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
            })(slotIdx);
        }

        // Update state
        slotState = newState;
    }

    // ── Pause controls ─────────────────────────────

    var intervalId = null;
    var isPaused   = false;

    function startRotation() {
        intervalId = setInterval(function () {
            if (!isPaused) rotateTick();
        }, ROTATION_INTERVAL);
    }

    function setupHoverPause() {
        // Pause on either the left VAST card or the right grid
        var vast = document.querySelector('.v2-vast-card');
        var grid = document.querySelector('.v2-bento-grid');

        [vast, grid].forEach(function (el) {
            if (!el) return;
            el.addEventListener('mouseenter', function () { isPaused = true; });
            el.addEventListener('mouseleave', function () { isPaused = false; });
        });
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
