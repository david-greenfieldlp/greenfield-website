/* ============================================
   G2M PAGE — Scripts
   Lenis, GSAP hero reveal, parallax
   ============================================ */

(function () {
    'use strict';

    /* ---------- MOBILE NAV ---------- */
    const hamburger = document.getElementById('navHamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('open');
            document.body.classList.toggle('menu-open');
        });

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('open');
                document.body.classList.remove('menu-open');
            });
        });
    }

    /* ---------- LENIS SMOOTH SCROLL ---------- */
    const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    /* ---------- NAV SCROLL BEHAVIOR ---------- */
    const nav = document.getElementById('nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (nav) {
            if (currentScroll > 80) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }
            if (currentScroll > lastScroll && currentScroll > 400) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
        }
        lastScroll = currentScroll;
    });

    /* ---------- HERO ANIMATIONS ---------- */
    const heroTl = gsap.timeline({ delay: 0.3 });

    // Title words slide up
    heroTl.from('.g2m-hero-title-word, .g2m-hero-title-super', {
        y: '110%',
        duration: 1,
        ease: 'power3.out',
        stagger: 0.08,
    });

    // Subtitle fade in
    heroTl.to('.g2m-hero-subtitle', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
    }, '-=0.4');

    // Divider grow
    heroTl.to('.g2m-hero-divider', {
        opacity: 1,
        width: 48,
        duration: 0.6,
        ease: 'power2.out',
    }, '-=0.5');

    // Description
    heroTl.to('.g2m-hero-desc', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
    }, '-=0.3');

    // Emphasis
    heroTl.to('.g2m-hero-emphasis', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
    }, '-=0.5');

    // CTA buttons
    heroTl.to('.g2m-hero-cta-group', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
    }, '-=0.4');

    // Scroll indicator
    heroTl.to('.g2m-hero-scroll', {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
    }, '-=0.3');

    /* ---------- HERO PARALLAX ---------- */
    gsap.to('.g2m-hero-bg-image', {
        y: 80,
        ease: 'none',
        scrollTrigger: {
            trigger: '.g2m-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
        },
    });


    /* ============================================
       SURVIVAL RATE CHART — Dynamic render + tooltips
       ============================================ */

    const STAGE_DATA = [
        { stage: 'Product-Market Fit', arr: '$0-3M ARR',    survivors: 100, failRate: null },
        { stage: 'Go-To-Market Fit',   arr: '$3-30M ARR',   survivors: 60,  failRate: 40 },
        { stage: 'Scale-Market Fit',    arr: '$30-100M ARR', survivors: 20,  failRate: 66 },
        { stage: '$100M+ ARR',          arr: '',             survivors: 3,   failRate: 85 },
    ];

    const FAIL_COLOR = '#ff5100';
    const chartArea = document.getElementById('g2mChartArea');
    const labelsRow = document.getElementById('g2mChartLabels');

    function isMobileChart() { return window.innerWidth < 768; }

    function buildChart() {
        if (!chartArea) return;

        // Clear previous dynamic elements (keep the SVG)
        chartArea.querySelectorAll('.g2m-bar, .g2m-gap-zone, .g2m-tooltip').forEach(el => el.remove());
        if (labelsRow) labelsRow.innerHTML = '';

        const h = chartArea.offsetHeight;
        const w = chartArea.offsetWidth;
        const mobile = isMobileChart();
        const barW = mobile ? 40 : 55;
        const count = STAGE_DATA.length;
        const spacing = w / count; // each bar occupies this much horizontal space

        /* --- Render bars --- */
        STAGE_DATA.forEach((d, i) => {
            const barH = (d.survivors / 100) * h;
            const cx = spacing * i + spacing / 2; // center x of this bar's column
            const left = cx - barW / 2;

            // Bar element
            const bar = document.createElement('div');
            bar.className = 'g2m-bar';
            bar.dataset.index = i;
            bar.style.left = left + 'px';
            bar.style.width = barW + 'px';
            bar.style.height = barH + 'px';

            // Label inside bar (or above for tiny)
            if (i === count - 1) {
                // 3% — label above
                const labelAbove = document.createElement('span');
                labelAbove.className = 'g2m-bar-label-above';
                labelAbove.textContent = d.survivors + '%';
                bar.appendChild(labelAbove);
            } else {
                const label = document.createElement('span');
                label.className = 'g2m-bar-label';
                label.textContent = d.survivors + '%';
                bar.appendChild(label);
            }

            // Tooltip
            const tip = document.createElement('div');
            tip.className = 'g2m-tooltip g2m-tooltip-bar';
            tip.innerHTML =
                '<div class="g2m-tooltip-title">' + d.survivors + '% survive</div>' +
                '<div class="g2m-tooltip-sub">' + d.stage + '</div>' +
                (d.arr ? '<div class="g2m-tooltip-sub">' + d.arr + '</div>' : '');
            chartArea.appendChild(tip);

            // Position tooltip above bar center
            function positionBarTooltip() {
                const tipW = tip.offsetWidth;
                let tipLeft = left + barW / 2 - tipW / 2;
                // Clamp to chart area
                tipLeft = Math.max(0, Math.min(tipLeft, w - tipW));
                tip.style.left = tipLeft + 'px';
                tip.style.bottom = (barH + 12) + 'px';
            }

            bar.addEventListener('mouseenter', () => {
                bar.classList.add('g2m-bar-hovered');
                positionBarTooltip();
                tip.classList.add('g2m-tooltip-visible');
            });
            bar.addEventListener('mouseleave', () => {
                bar.classList.remove('g2m-bar-hovered');
                tip.classList.remove('g2m-tooltip-visible');
            });

            // Touch support
            bar.addEventListener('touchstart', (e) => {
                e.preventDefault();
                // Hide any open tooltips
                chartArea.querySelectorAll('.g2m-tooltip-visible').forEach(t => t.classList.remove('g2m-tooltip-visible'));
                chartArea.querySelectorAll('.g2m-bar-hovered').forEach(b => b.classList.remove('g2m-bar-hovered'));
                chartArea.querySelectorAll('.g2m-gap-hovered').forEach(g => g.classList.remove('g2m-gap-hovered'));
                bar.classList.add('g2m-bar-hovered');
                positionBarTooltip();
                tip.classList.add('g2m-tooltip-visible');
            }, { passive: false });

            chartArea.appendChild(bar);
        });

        /* --- Render gap indicators --- */
        STAGE_DATA.forEach((d, i) => {
            if (d.failRate === null) return;

            const prevS = STAGE_DATA[i - 1].survivors;
            const currS = d.survivors;
            const topOfPrev = h - (prevS / 100) * h;
            const topOfCurr = h - (currS / 100) * h;
            const gapH = topOfCurr - topOfPrev;

            // Center x between prev bar and current bar
            const prevCx = spacing * (i - 1) + spacing / 2;
            const currCx = spacing * i + spacing / 2;
            const gapCx = (prevCx + currCx) / 2;

            // Gap zone — absolutely positioned, sized to the gap between bar tops
            const zone = document.createElement('div');
            zone.className = 'g2m-gap-zone';
            zone.style.left = (gapCx - 24) + 'px'; // wide enough for lines + pill
            zone.style.width = '48px';
            zone.style.top = topOfPrev + 'px';
            zone.style.height = Math.max(gapH, 20) + 'px'; // min height for tiny gaps

            // Top horizontal dotted line (at top of zone = top of prev bar)
            const lineTop = document.createElement('div');
            lineTop.className = 'g2m-gap-line g2m-gap-line-top';
            zone.appendChild(lineTop);

            // Vertical dotted stem connecting top to bottom
            const stem = document.createElement('div');
            stem.className = 'g2m-gap-stem';
            zone.appendChild(stem);

            // Bottom horizontal dotted line (at bottom of zone = top of curr bar)
            const lineBot = document.createElement('div');
            lineBot.className = 'g2m-gap-line g2m-gap-line-bottom';
            zone.appendChild(lineBot);

            // Pill centered in the gap
            const pill = document.createElement('div');
            pill.className = 'g2m-gap-pill';
            pill.textContent = d.failRate + '%';
            zone.appendChild(pill);

            // Gap tooltip
            const gapTip = document.createElement('div');
            gapTip.className = 'g2m-tooltip g2m-tooltip-gap';
            gapTip.innerHTML =
                '<div class="g2m-tooltip-title">' + d.failRate + '% fail to reach</div>' +
                '<div class="g2m-tooltip-sub">' + d.stage + '</div>';
            chartArea.appendChild(gapTip);

            function positionGapTooltip() {
                const tipH = gapTip.offsetHeight;
                const tipW = gapTip.offsetWidth;
                // Position to the right of the pill
                let tipLeft = gapCx + 30;
                let tipTop = topOfPrev + gapH / 2 - tipH / 2;
                // If overflows right, flip to left
                if (tipLeft + tipW > w) {
                    tipLeft = gapCx - tipW - 30;
                    gapTip.classList.add('g2m-tooltip-gap-flipped');
                } else {
                    gapTip.classList.remove('g2m-tooltip-gap-flipped');
                }
                gapTip.style.left = tipLeft + 'px';
                gapTip.style.top = tipTop + 'px';
            }

            pill.addEventListener('mouseenter', () => {
                pill.classList.add('g2m-gap-hovered');
                positionGapTooltip();
                gapTip.classList.add('g2m-tooltip-visible');
            });
            pill.addEventListener('mouseleave', () => {
                pill.classList.remove('g2m-gap-hovered');
                gapTip.classList.remove('g2m-tooltip-visible');
            });

            // Touch support
            pill.addEventListener('touchstart', (e) => {
                e.preventDefault();
                chartArea.querySelectorAll('.g2m-tooltip-visible').forEach(t => t.classList.remove('g2m-tooltip-visible'));
                chartArea.querySelectorAll('.g2m-bar-hovered').forEach(b => b.classList.remove('g2m-bar-hovered'));
                chartArea.querySelectorAll('.g2m-gap-hovered').forEach(g => g.classList.remove('g2m-gap-hovered'));
                pill.classList.add('g2m-gap-hovered');
                positionGapTooltip();
                gapTip.classList.add('g2m-tooltip-visible');
            }, { passive: false });

            chartArea.appendChild(zone);
        });

        /* --- Render X-axis labels --- */
        if (labelsRow) {
            STAGE_DATA.forEach((d) => {
                const div = document.createElement('div');
                div.className = 'g2m-chart-label';
                div.innerHTML =
                    '<span class="g2m-chart-label-stage">' + d.stage + '</span>' +
                    (d.arr ? '<span class="g2m-chart-label-arr">' + d.arr + '</span>' : '');
                labelsRow.appendChild(div);
            });
        }
    }

    // Dismiss tooltips on outside tap (mobile)
    document.addEventListener('touchstart', (e) => {
        if (!e.target.closest('.g2m-bar') && !e.target.closest('.g2m-gap-pill')) {
            if (chartArea) {
                chartArea.querySelectorAll('.g2m-tooltip-visible').forEach(t => t.classList.remove('g2m-tooltip-visible'));
                chartArea.querySelectorAll('.g2m-bar-hovered').forEach(b => b.classList.remove('g2m-bar-hovered'));
                chartArea.querySelectorAll('.g2m-gap-hovered').forEach(g => g.classList.remove('g2m-gap-hovered'));
            }
        }
    });

    // Build chart & rebuild on resize
    buildChart();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(buildChart, 150);
    });


    /* ============================================
       THESIS SECTION — Scroll-triggered animations
       ============================================ */

    const thesisSection = document.querySelector('.g2m-thesis');

    if (thesisSection) {
        // Left column text reveal
        gsap.from('.g2m-thesis-heading', {
            opacity: 0,
            y: 40,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.g2m-thesis',
                start: 'top 75%',
                toggleActions: 'play none none none',
            },
        });

        gsap.to('.g2m-thesis-divider', {
            opacity: 1,
            scaleX: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.g2m-thesis',
                start: 'top 70%',
                toggleActions: 'play none none none',
            },
        });

        gsap.from('.g2m-thesis-body p', {
            opacity: 0,
            y: 24,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.15,
            scrollTrigger: {
                trigger: '.g2m-thesis-body',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
        });

        // Chart card entrance
        gsap.from('.g2m-chart-card', {
            opacity: 0,
            y: 50,
            scale: 0.97,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.g2m-chart-card',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
        });

        // Bars animate from 0 height
        gsap.from('.g2m-bar', {
            scaleY: 0,
            transformOrigin: 'bottom center',
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: {
                trigger: '.g2m-chart-area',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
        });

        // Gap zones (pills + lines + stems) fade in together after bars
        gsap.from('.g2m-gap-zone', {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.15,
            delay: 0.3,
            scrollTrigger: {
                trigger: '.g2m-chart-area',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
        });

        // Chart labels
        gsap.from('.g2m-chart-label', {
            opacity: 0,
            y: 12,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.08,
            delay: 0.3,
            scrollTrigger: {
                trigger: '.g2m-chart-labels',
                start: 'top 90%',
                toggleActions: 'play none none none',
            },
        });
    }


    /* ============================================
       MISSION BANNER — Parallax + text reveal
       ============================================ */

    const missionSection = document.querySelector('.g2m-mission');

    if (missionSection) {
        // Quote mark fade in
        gsap.to('.g2m-mission-quote-mark', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.g2m-mission',
                start: 'top 75%',
            },
        });

        // Mission text reveal
        gsap.to('.g2m-mission-text', {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.g2m-mission',
                start: 'top 70%',
            },
        });

        // Image card rises into view
        gsap.to('.g2m-mission-image-card', {
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.g2m-mission-image-card',
                start: 'top 85%',
            },
        });

        // Subtle parallax on the image inside the card
        gsap.to('.g2m-mission-bg-image', {
            y: -30,
            ease: 'none',
            scrollTrigger: {
                trigger: '.g2m-mission-image-card',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
        });
    }

})();
