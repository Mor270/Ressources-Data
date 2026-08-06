// Fait apparaître les sections et entrées de la timeline au fil du défilement
const revealTargets = document.querySelectorAll('.section, .timeline-entry');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealTargets.forEach((el) => revealObserver.observe(el));

// Anime les chiffres de la bande KPI en comptant jusqu'à leur valeur cible
function animateCount(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const prefix = el.getAttribute('data-prefix') || '';
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    // easeOutCubic pour un ralentissement naturel en fin de course
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = `${prefix}${value}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }
  requestAnimationFrame(tick);
}

const kpiNumbers = document.querySelectorAll('.kpi-number');
const kpiObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      kpiObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

kpiNumbers.forEach((el) => kpiObserver.observe(el));
