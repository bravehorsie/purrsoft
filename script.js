document.addEventListener('DOMContentLoaded', () => {

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
