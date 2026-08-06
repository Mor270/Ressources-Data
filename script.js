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

// Récupère et affiche des statistiques publiques réelles depuis l'API GitHub
// (aucune authentification nécessaire : ce sont des données publiques du profil)
const GITHUB_USERNAME = 'Mor270';

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function loadGithubActivity() {
  const introEl = document.querySelector('.activity-intro');
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`),
    ]);

    if (!userRes.ok || !reposRes.ok) throw new Error('Réponse API invalide');

    const user = await userRes.json();
    const repos = await reposRes.json();

    document.getElementById('ghRepos').textContent = user.public_repos ?? '—';
    document.getElementById('ghFollowers').textContent = user.followers ?? '—';

    if (repos.length > 0) {
      document.getElementById('ghUpdated').textContent = formatDate(repos[0].pushed_at);

      // Langage le plus fréquent parmi les dépôts récents
      const langCounts = {};
      repos.forEach((repo) => {
        if (repo.language) langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      });
      const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0];
      document.getElementById('ghLang').textContent = topLang ? topLang[0] : '—';
    }

    if (introEl) {
      introEl.textContent = `Statistiques publiques de github.com/${GITHUB_USERNAME}, mises à jour à chaque visite.`;
    }

    // Liste des dépôts les plus récemment mis à jour
    const repoListEl = document.getElementById('repoList');
    if (repoListEl) {
      repoListEl.innerHTML = repos
        .filter((repo) => !repo.fork)
        .slice(0, 5)
        .map((repo) => `
          <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-item">
            <span>
              <span class="repo-name">${repo.name}</span>
              <span class="repo-desc">${repo.description ? repo.description : 'Pas de description'}</span>
            </span>
            <span class="repo-meta">★ ${repo.stargazers_count} · MAJ ${formatDate(repo.pushed_at)}</span>
          </a>
        `)
        .join('');
    }
  } catch (error) {
    if (introEl) {
      introEl.textContent = "Statistiques indisponibles pour le moment — consultez directement mon profil GitHub.";
    }
    console.error('Erreur lors du chargement des statistiques GitHub :', error);
  }
}

loadGithubActivity();
