function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const hero = document.getElementById('hero');

    const MAX_DIST  = 130;
    const SPEED     = 0.4;
    const MOUSE_R   = 180;
    const PALETTE   = [
        '124,58,237',   // violet
        '6,182,212',    // cyan
        '167,139,250',  // soft violet
    ];

    let W, H, particles;
    const mouse = { x: null, y: null };

    function resize() {
        W = canvas.width  = hero.offsetWidth;
        H = canvas.height = hero.offsetHeight;
    }

    function makeParticle() {
        return {
            x:   Math.random() * W,
            y:   Math.random() * H,
            vx:  (Math.random() - 0.5) * SPEED,
            vy:  (Math.random() - 0.5) * SPEED,
            r:   Math.random() * 1.5 + 1,
            rgb: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        };
    }

    function init() {
        resize();
        // Density scales with viewport area, capped at 80
        const count = Math.min(80, Math.floor(W * H / 10000));
        particles = Array.from({ length: count }, makeParticle);
    }

    // Track mouse globally so pointer-events: none on canvas still works
    document.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
    });
    document.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    function tick() {
        ctx.clearRect(0, 0, W, H);
        const maxDistSq = MAX_DIST * MAX_DIST;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Attract toward mouse (only when cursor is within canvas bounds)
            if (mouse.x !== null && mouse.x >= 0 && mouse.x <= W && mouse.y >= 0 && mouse.y <= H) {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dSq = dx * dx + dy * dy;
                if (dSq < MOUSE_R * MOUSE_R) {
                    const d = Math.sqrt(dSq);
                    const f = (MOUSE_R - d) / MOUSE_R * 0.04;
                    p.vx += (dx / d) * f;
                    p.vy += (dy / d) * f;
                }
            }

            // Speed cap (higher ceiling so attracted particles can visibly surge)
            const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (spd > SPEED * 3.5) { p.vx = p.vx / spd * SPEED * 3.5; p.vy = p.vy / spd * SPEED * 3.5; }

            // Move + wrap edges
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
            if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;

            // Dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.rgb},0.75)`;
            ctx.fill();

            // Lines to nearby particles (j > i avoids drawing each pair twice)
            for (let j = i + 1; j < particles.length; j++) {
                const q  = particles[j];
                const dx = p.x - q.x;
                const dy = p.y - q.y;
                const dSq = dx * dx + dy * dy;
                if (dSq < maxDistSq) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = `rgba(${p.rgb},${(1 - dSq / maxDistSq) * 0.3})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(tick);
    }

    init();
    tick();
    window.addEventListener('resize', init);
}

document.addEventListener('DOMContentLoaded', () => {

    initParticles();

    // --- Scroll animations with stagger ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;

            // Stagger siblings: glass-cards and customer-badges animate in sequence
            if (el.classList.contains('glass-card') || el.classList.contains('customer-badge')) {
                const cls = el.classList.contains('glass-card') ? '.glass-card' : '.customer-badge';
                const siblings = Array.from(el.parentElement.querySelectorAll(cls));
                el.style.transitionDelay = `${siblings.indexOf(el) * 0.1}s`;
            }

            el.classList.add('visible');
            observer.unobserve(el);
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    // --- Theme toggle ---
    const themeToggle = document.getElementById('theme-toggle');

    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.classList.add('light-mode');
    }

    themeToggle?.addEventListener('click', () => {
        document.documentElement.classList.toggle('light-mode');
        localStorage.setItem('theme',
            document.documentElement.classList.contains('light-mode') ? 'light' : 'dark'
        );
    });

    // --- Mobile nav ---
    const navToggle = document.getElementById('nav-toggle');
    const navEl = navToggle?.closest('nav');

    navToggle?.addEventListener('click', () => {
        const isOpen = navEl.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when a nav link is clicked
    navEl?.querySelectorAll('ul a').forEach(link => {
        link.addEventListener('click', () => {
            navEl.classList.remove('nav-open');
            navToggle?.setAttribute('aria-expanded', 'false');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (navEl && !navEl.contains(e.target) && navEl.classList.contains('nav-open')) {
            navEl.classList.remove('nav-open');
            navToggle?.setAttribute('aria-expanded', 'false');
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navEl?.classList.contains('nav-open')) {
            navEl.classList.remove('nav-open');
            navToggle?.setAttribute('aria-expanded', 'false');
        }
    });

});
