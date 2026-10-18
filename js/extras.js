(() => {
    'use strict';
    const techs = [['fab fa-js', 'JavaScript'], ['fab fa-react', 'React'], ['fab fa-node-js', 'Node.js'], ['fab fa-php', 'PHP'], ['fas fa-database', 'MySQL'], ['fab fa-python', 'Python'], ['fab fa-java', 'Java'], ['fab fa-html5', 'HTML5'], ['fab fa-css3-alt', 'CSS3'], ['fab fa-angular', 'Angular'], ['fab fa-aws', 'AWS'], ['fab fa-docker', 'Docker'], ['fab fa-git-alt', 'Git'], ['fab fa-github', 'GitHub']];
    const marquee = document.createElement('div');
    marquee.className = 'marquee';
    marquee.setAttribute('aria-hidden', 'true');
    const items = techs.map(([icon, name]) => `<span><i class="${icon}"></i>${name}</span>`).join('');
    marquee.innerHTML = `<div class="marquee-track">${items}${items}</div>`;
    document.querySelector('.stack-strip')?.after(marquee);

    // Pauso las animaciones que quedan fuera de pantalla xd.
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-offscreen', !entry.isIntersecting)), { rootMargin: '80px' });
        [document.querySelector('.hero-section'), marquee].filter(Boolean).forEach(element => observer.observe(element));
    }
})();
