/* =========================================================
   CONFIGURAÇÃO — edite aqui o WhatsApp
   ========================================================= */
const SITE = {
    whatsapp: '5541920073911', // DDI + DDD + número, só dígitos — (41) 92007-3911
    mensagem: 'Olá, Sophia! Gostaria de agendar uma conversa.',
};

(() => {
    'use strict';

    const doc = document;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Links de WhatsApp ----------
       Qualquer <a data-whatsapp> vira link do WhatsApp.
       Mensagem própria: data-whatsapp="Texto da mensagem" */
    doc.querySelectorAll('[data-whatsapp]').forEach((link) => {
        const message = link.dataset.whatsapp || SITE.mensagem;
        link.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
        link.target = '_blank';
        link.rel = 'noopener';
    });

    /* ---------- Ano no rodapé ---------- */
    doc.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

    /* ---------- Animações ao rolar ---------- */
    const revealItems = doc.querySelectorAll('[data-reveal]');

    if (!reduceMotion && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

        revealItems.forEach((el) => revealObserver.observe(el));
    } else {
        revealItems.forEach((el) => el.classList.add('is-visible'));
    }

    /* ---------- Header, botão WhatsApp e parallax ---------- */
    const header = doc.querySelector('.site-header');
    const waFloat = doc.querySelector('.wa-float');
    const hero = doc.querySelector('.hero');
    const parallaxEl = doc.querySelector('[data-parallax]');
    const parallaxQuery = window.matchMedia('(min-width: 900px)');
    let ticking = false;

    const onScroll = () => {
        const y = window.scrollY;
        header.classList.toggle('is-scrolled', y > 24);

        if (waFloat) {
            const limit = hero ? hero.offsetHeight * 0.6 : 400;
            waFloat.classList.toggle('is-visible', y > limit);
        }

        if (parallaxEl && !reduceMotion) {
            parallaxEl.style.transform = parallaxQuery.matches
                ? `translate3d(0, ${(y * 0.12).toFixed(1)}px, 0)`
                : '';
        }

        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });
    onScroll();

    /* ---------- Menu mobile ---------- */
    const toggle = doc.querySelector('.menu-toggle');
    const menu = doc.getElementById('mobile-menu');

    const setMenu = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        menu.classList.toggle('is-open', open);
        doc.body.classList.toggle('menu-open', open);
    };

    if (toggle && menu) {
        toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
        menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
        doc.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menu.classList.contains('is-open')) {
                setMenu(false);
                toggle.focus();
            }
        });
        window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
            if (event.matches) setMenu(false);
        });
    }

    /* ---------- Link ativo no menu ---------- */
    const navLinks = Array.from(doc.querySelectorAll('.nav a[href^="#"]'));

    if (navLinks.length && 'IntersectionObserver' in window) {
        const byId = new Map(navLinks.map((link) => [link.getAttribute('href').slice(1), link]));

        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((link) => link.classList.remove('is-active'));
                const active = byId.get(entry.target.id);
                if (active) active.classList.add('is-active');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        byId.forEach((_, id) => {
            const section = doc.getElementById(id);
            if (section) navObserver.observe(section);
        });
    }
})();
