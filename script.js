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

const contactForm = document.querySelector('.contact__form');

if (contactForm) {
    const submitButton = contactForm.querySelector('.contact__submit');
    const status = contactForm.querySelector('.contact__status');
    const emailFallback = contactForm.querySelector('.contact__email-fallback');

    contactForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (submitButton.disabled) return;

        const fields = new URLSearchParams(new FormData(contactForm));
        submitButton.disabled = true;
        emailFallback.hidden = true;
        status.textContent = 'Sending your message…';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: fields,
                signal: AbortSignal.timeout(12000)
            });
            if (!response.ok) {
                throw new Error('Netlify did not accept the message.');
            }

            status.textContent = 'Your message was submitted. Thank you!';
            contactForm.reset();
        } catch {
            status.textContent = 'We couldn’t confirm your message was sent. Try again or email Max directly.';
            const body = [
                `Name: ${fields.get('name')}`,
                `Company: ${fields.get('company')}`,
                `Email: ${fields.get('email')}`,
                `Phone: ${fields.get('phone')}`,
                '',
                fields.get('message')
            ].join('\r\n');
            const recipient = emailFallback.href.split('?')[0];
            emailFallback.href = `${recipient}?subject=Portfolio%20inquiry&body=${encodeURIComponent(body)}`;
            emailFallback.hidden = false;
        } finally {
            submitButton.disabled = false;
        }
    });
}

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
