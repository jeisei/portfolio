document.addEventListener('DOMContentLoaded', () => {

 
    const sections = document.querySelectorAll('.section');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach(section => revealObserver.observe(section));



    const links = document.querySelectorAll('.topbar__link');

    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                links.forEach(link => {
                    link.classList.toggle(
                        'is-active',
                        link.getAttribute('href') === '#' + entry.target.id
                    );
                });
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => activeObserver.observe(section));


 
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (href === '#' || href.length < 2) return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const topbarHeight = document.querySelector('.topbar')?.offsetHeight || 0;
            const offset = topbarHeight + 20;
            const y = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({ top: y, behavior: 'smooth' });
        });
    });

});

const burger = document.querySelector('.burger');
const nav    = document.getElementById('topbarNav');

const openMenu = () => {
    burger.classList.add('is-open');
    nav.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
};

const closeMenu = () => {
    burger.classList.remove('is-open');
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
};

if (burger && nav) {
    burger.addEventListener('click', () => {
        burger.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    /* Закрытие при клике по ссылке */
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    /* Закрытие по Escape */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu();
    });

    /* Сброс при возврате на десктоп */
    window.addEventListener('resize', () => {
        if (window.innerWidth > 780) closeMenu();
    });
}