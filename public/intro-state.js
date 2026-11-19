(() => {
  try {
    if (location.hash && location.hash !== '#welcome') return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const restoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    const root = document.documentElement;
    root.classList.add('page--intro-pending');
    // Reveal the page if startup stalls. The intro can still play once the module arrives.
    setTimeout(() => {
      root.classList.remove('page--intro-pending');
      history.scrollRestoration = restoration;
    }, 3000);
  } catch {
    // If navigation state is unavailable, the main page remains accessible.
  }
})();
