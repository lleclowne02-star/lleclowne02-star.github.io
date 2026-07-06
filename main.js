/* ============================================================
   AMP Mogador — main.js
   Fonctionnalités :
   1. Scroll animations (fade-up)
   2. Navbar : changement de style au scroll + menu mobile
   3. Compteurs animés (stats banner)
   4. Typing effect (hero title)
   5. Onglets fonctionnalités interactifs
   6. Smooth scroll
   7. Progress bar de lecture
   8. Parallax léger sur le hero
   9. Tooltip sur les cartes biodiversité
  10. Formulaire de contact avec validation + fetch vers contact.php
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. SCROLL ANIMATIONS — fade-up
  ───────────────────────────────────────── */
  const fadeEls = document.querySelectorAll('.fade-up');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  fadeEls.forEach(el => fadeObserver.observe(el));


  /* ─────────────────────────────────────────
     2. NAVBAR — style au scroll + menu mobile
  ───────────────────────────────────────── */
  const nav = document.querySelector('nav');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    updateProgressBar();
    highlightNavLink();
  });

  // Menu mobile : bouton hamburger
  const menuBtn = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Fermer le menu si on clique sur un lien
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', false);
      });
    });
  }

  // Surligner le lien actif selon la section visible
  function highlightNavLink() {
    const sections = document.querySelectorAll('section[id], div[id]');
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active-link');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active-link');
      }
    });
  }


  /* ─────────────────────────────────────────
     3. PROGRESS BAR DE LECTURE
  ───────────────────────────────────────── */
  const progressBar = document.createElement('div');
  progressBar.id = 'reading-progress';
  progressBar.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    height: 3px;
    width: 0%;
    background: linear-gradient(to right, #5DCAA5, #378ADD);
    z-index: 200;
    transition: width 0.1s linear;
  `;
  document.body.prepend(progressBar);

  function updateProgressBar() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  }


  /* ─────────────────────────────────────────
     4. COMPTEURS ANIMÉS (stats banner)
  ───────────────────────────────────────── */
  const statNums = document.querySelectorAll('.stat-num');

  function animateCounter(el) {
    const raw = el.textContent.trim();
    // Extraire la partie numérique (ignorer les unités dans le span)
    const unitSpan = el.querySelector('.stat-unit');
    const unitText = unitSpan ? unitSpan.textContent : '';
    const numStr = raw.replace(unitText, '').replace(/\s/g, '').replace(',', '.');
    const target = parseFloat(numStr);

    if (isNaN(target)) return;

    const isDecimal = numStr.includes('.');
    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      const display = isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString('fr-FR');
      el.innerHTML = display + (unitSpan ? `<span class="stat-unit">${unitText}</span>` : '');

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNums.forEach(el => animateCounter(el));
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const statsBanner = document.querySelector('.stats-banner');
  if (statsBanner) statsObserver.observe(statsBanner);


  /* ─────────────────────────────────────────
     5. ONGLETS FONCTIONNALITÉS interactifs
  ───────────────────────────────────────── */
  const funcItems = document.querySelectorAll('.func-item');

  // Données pour chaque onglet
  const funcData = [
    {
      title: 'Délimitation des zones marines protégées',
      cards: [
        {
          icon: `<path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>`,
          title: 'Zonage marin',
          text: "L'AMP est divisée en zones noyaux de protection intégrale, zones tampons d'usage régulé et zones périphériques d'activités compatibles, garantissant la régénération des stocks et la continuité de la pêche artisanale."
        },
        {
          icon: `<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
          title: 'Plan d\'aménagement (PAG)',
          text: "Un Plan d'Aménagement et de Gestion fixe les règles, objectifs quinquennaux et indicateurs de suivi. Validé par la CTAP, il est révisé périodiquement selon les données scientifiques et concertations locales."
        },
        {
          icon: `<path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>`,
          title: 'Enquêtes participatives',
          text: "Des enquêtes régulières collectent les données socio-économiques et les savoirs des pêcheurs d'Essaouira, alimentant les décisions de gestion et assurant l'adhésion des communautés locales."
        }
      ]
    },
    {
      title: 'Contrôle et surveillance des activités de pêche',
      cards: [
        {
          icon: `<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>`,
          title: 'Surveillance en mer',
          text: "Des patrouilles régulières contrôlent les activités de pêche dans les zones protégées, vérifient les engins utilisés et signalent toute infraction à la réglementation en vigueur."
        },
        {
          icon: `<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>`,
          title: 'Lutte contre la pêche INN',
          text: "L'AMP contribue activement à la lutte contre la pêche illégale, non déclarée et non réglementée (INN), en coordination avec les délégations des pêches maritimes sur le littoral."
        },
        {
          icon: `<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>`,
          title: 'Rapports de contrôle',
          text: "Des rapports périodiques documentent l'état de la pêche, les infractions constatées et les tendances des stocks halieutiques, permettant d'ajuster les mesures de gestion en temps réel."
        }
      ]
    },
    {
      title: 'Collecte de données biologiques et halieutiques',
      cards: [
        {
          icon: `<path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>`,
          title: 'Suivi des stocks',
          text: "L'INRH réalise des campagnes d'évaluation des stocks halieutiques en collaboration avec l'AMP, mesurant l'abondance, la taille et la composition des espèces cibles dans les zones protégées."
        },
        {
          icon: `<path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>`,
          title: 'Qualité des eaux',
          text: "Des analyses régulières de la qualité physico-chimique et biologique des eaux marines permettent de détecter toute pollution et d'évaluer la santé globale de l'écosystème côtier de Mogador."
        },
        {
          icon: `<path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>`,
          title: 'Indicateurs de biodiversité',
          text: "Un système d'indicateurs suit l'évolution de la biodiversité marine : richesse spécifique, intégrité des habitats benthiques, état des herbiers marins et présence des espèces emblématiques."
        }
      ]
    },
    {
      title: 'Gestion participative avec les pêcheurs locaux',
      cards: [
        {
          icon: `<path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>`,
          title: 'Comités locaux de gestion',
          text: "Des comités composés de pêcheurs, représentants locaux et gestionnaires se réunissent régulièrement pour examiner l'état de l'AMP, adapter les règles et résoudre les conflits d'usage."
        },
        {
          icon: `<path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>`,
          title: 'Formations et renforcement',
          text: "Des formations sont dispensées aux pêcheurs sur les bonnes pratiques de pêche durable, l'utilisation d'engins sélectifs et la sensibilisation aux enjeux de la conservation marine."
        },
        {
          icon: `<path d="M13 10V3L4 14h7v7l9-11h-7z"/>`,
          title: 'Alternatives économiques',
          text: "L'AMP soutient la diversification des revenus des pêcheurs à travers l'éco-tourisme marin, la transformation des produits de la mer et l'aquaculture durable adaptée au milieu local."
        }
      ]
    },
    {
      title: 'Réglementation des périodes et zones de pêche',
      cards: [
        {
          icon: `<path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>`,
          title: 'Calendriers de pêche',
          text: "Des périodes de fermeture saisonnières sont fixées pour les espèces les plus sensibles, permettant leur reproduction et la reconstitution naturelle des stocks dans les zones de l'AMP."
        },
        {
          icon: `<path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>`,
          title: 'Zones de repos biologique',
          text: "Certaines zones de l'AMP sont totalement fermées à la pêche de manière permanente ou temporaire, servant de nurseries naturelles pour la faune marine et de réservoirs de biodiversité."
        },
        {
          icon: `<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>`,
          title: 'Engins autorisés',
          text: "La réglementation précise les types d'engins de pêche autorisés dans chaque zone, interdisant les pratiques destructrices (chalutage de fond, explosifs) pour préserver les habitats benthiques."
        }
      ]
    },
    {
      title: 'Programmes de restauration des habitats',
      cards: [
        {
          icon: `<path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>`,
          title: 'Restauration des herbiers',
          text: "Des programmes de restauration des herbiers marins et des fonds rocheux dégradés sont conduits dans les zones prioritaires de l'AMP pour rétablir les habitats essentiels à la faune ichtyologique."
        },
        {
          icon: `<path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064"/>`,
          title: 'Lutte contre la pollution',
          text: "Des opérations régulières de nettoyage du littoral et de sensibilisation contre le rejet de déchets en mer contribuent à maintenir la qualité des eaux et la santé de l'écosystème de Mogador."
        },
        {
          icon: `<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>`,
          title: 'Récifs artificiels',
          text: "L'immersion de récifs artificiels dans des zones stratégiques de l'AMP crée de nouveaux habitats pour les poissons, favorise la biodiversité et contribue à la régénération des ressources halieutiques."
        }
      ]
    },
    {
      title: 'Lutte contre la pêche illégale (INN)',
      cards: [
        {
          icon: `<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>`,
          title: 'Contrôles aux débarquements',
          text: "Les délégations des pêches effectuent des contrôles systématiques aux points de débarquement et aux criées de première vente pour vérifier la légalité des captures et le respect des tailles minimales."
        },
        {
          icon: `<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>`,
          title: 'Surveillance électronique',
          text: "Des systèmes de surveillance par balises VMS et AIS permettent de suivre en temps réel les mouvements des bateaux de pêche et de détecter toute intrusion dans les zones protégées."
        },
        {
          icon: `<path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857"/>`,
          title: 'Coopération inter-agences',
          text: "L'AMP coordonne avec la Marine Royale, la Gendarmerie Royale Maritime et les délégations des pêches pour une réponse rapide et efficace aux signalements d'activités de pêche illégale."
        }
      ]
    },
    {
      title: 'Coopération institutionnelle nationale et internationale',
      cards: [
        {
          icon: `<path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
          title: 'Partenariats internationaux',
          text: "L'AMP Mogador collabore avec des organisations internationales comme l'UICN, l'UNESCO et la Convention de Ramsar pour s'aligner sur les meilleures pratiques mondiales de conservation marine."
        },
        {
          icon: `<path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>`,
          title: 'Coordination nationale',
          text: "L'AMP s'inscrit dans la stratégie nationale Halieutis et collabore étroitement avec le MPM, le HCEFLCD, l'INRH, l'ONP et les collectivités territoriales de la région Marrakech-Safi."
        },
        {
          icon: `<path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13"/>`,
          title: 'Partage de connaissances',
          text: "L'AMP participe à des réseaux régionaux de partage de données et d'expériences avec d'autres AMP de la façade atlantique africaine, contribuant à la mise en place d'un réseau cohérent d'aires protégées."
        }
      ]
    }
  ];

  function renderFuncCards(index) {
    const container = document.querySelector('.func-detail-cards');
    if (!container || !funcData[index]) return;

    const data = funcData[index];
    container.style.opacity = '0';
    container.style.transform = 'translateY(12px)';

    setTimeout(() => {
      container.innerHTML = data.cards.map(card => `
        <div class="func-detail-card">
          <div class="func-detail-card-head">
            <div class="func-detail-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-width="1.5">${card.icon}</svg>
            </div>
            <span class="func-detail-card-title">${card.title}</span>
          </div>
          <p>${card.text}</p>
        </div>
      `).join('');

      container.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 180);
  }

  funcItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      funcItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      renderFuncCards(index);
    });
  });

  // Charger le premier onglet au démarrage
  renderFuncCards(0);


  /* ─────────────────────────────────────────
     6. SMOOTH SCROLL pour tous les liens #
  ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 72; // hauteur navbar
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ─────────────────────────────────────────
     7. PARALLAX LÉGER sur le hero
  ───────────────────────────────────────── */
  const heroOrbs = document.querySelectorAll('.hero-orb');
  const heroBadges = document.querySelectorAll('.hero-badge');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    heroOrbs.forEach((orb, i) => {
      const speed = i === 0 ? 0.15 : 0.08;
      orb.style.transform = `translateY(${scrollY * speed}px)`;
    });
    heroBadges.forEach((badge, i) => {
      const speed = i % 2 === 0 ? 0.06 : 0.1;
      badge.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });


  /* ─────────────────────────────────────────
     8. TOOLTIPS sur les cartes biodiversité
  ───────────────────────────────────────── */
  const bioCards = document.querySelectorAll('.bio-card');
  const tooltipData = [
    'La plus grande colonie mondiale de Faucon d\'Éléonore (Falco eleonorae) niche sur l\'Archipel de Mogador.',
    'Les eaux de Mogador sont parmi les plus poissonneuses du Maroc grâce au courant froid des Canaries.',
    'Plusieurs espèces végétales endémiques strictement marocaines sont présentes sur l\'archipel.',
    'L\'Archipel de Mogador abrite une biodiversité marine comparable aux grandes réserves mondiales.'
  ];

  const tooltip = document.createElement('div');
  tooltip.id = 'bio-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    background: rgba(4, 44, 83, 0.95);
    color: white;
    font-size: 13px;
    line-height: 1.5;
    padding: 10px 14px;
    border-radius: 10px;
    max-width: 260px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 999;
    border: 1px solid rgba(93, 202, 165, 0.3);
  `;
  document.body.appendChild(tooltip);

  bioCards.forEach((card, i) => {
    card.addEventListener('mouseenter', (e) => {
      tooltip.textContent = tooltipData[i] || '';
      tooltip.style.opacity = '1';
    });

    card.addEventListener('mousemove', (e) => {
      tooltip.style.left = `${e.clientX + 16}px`;
      tooltip.style.top  = `${e.clientY - 10}px`;
    });

    card.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });
  });


  /* ─────────────────────────────────────────
     9. FORMULAIRE DE CONTACT
        Validation + envoi vers contact.php
  ───────────────────────────────────────── */
  const form = document.querySelector('.contact-form');

  if (form) {
    const submitBtn = form.querySelector('.form-submit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Réinitialiser les erreurs
      clearErrors();

      const nom   = form.querySelector('input[type="text"]');
      const email = form.querySelector('input[type="email"]');
      const objet = form.querySelectorAll('input[type="text"]')[1];
      const msg   = form.querySelector('textarea');

      let valid = true;

      if (!nom.value.trim()) {
        showError(nom, 'Veuillez entrer votre nom.');
        valid = false;
      }

      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        showError(email, 'Veuillez entrer une adresse e-mail valide.');
        valid = false;
      }

      if (!objet || !objet.value.trim()) {
        if (objet) showError(objet, 'Veuillez indiquer un objet.');
        valid = false;
      }

      if (!msg.value.trim() || msg.value.trim().length < 10) {
        showError(msg, 'Le message doit contenir au moins 10 caractères.');
        valid = false;
      }

      if (!valid) return;

      // Afficher état de chargement
      submitBtn.textContent = 'Envoi en cours...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';

      try {
        const formData = new FormData();
        formData.append('nom',   nom.value.trim());
        formData.append('email', email.value.trim());
        formData.append('objet', objet ? objet.value.trim() : '');
        formData.append('message', msg.value.trim());

        const response = await fetch('contact.php', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          showFormSuccess('Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.');
          form.reset();
        } else {
          showFormError(result.message || 'Une erreur est survenue. Veuillez réessayer.');
        }

      } catch (err) {
        // Si pas de serveur PHP (développement local), simuler le succès
        showFormSuccess('Message simulé envoyé ! (Connectez un serveur PHP pour l\'envoi réel.)');
        form.reset();
      } finally {
        submitBtn.textContent = 'Envoyer le message';
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
      }
    });
  }

  function showError(input, message) {
    input.style.borderColor = '#E24B4A';
    input.style.background = '#FCEBEB';
    const err = document.createElement('span');
    err.className = 'form-error';
    err.style.cssText = 'color: #A32D2D; font-size: 12px; margin-top: 4px; display: block;';
    err.textContent = message;
    input.parentNode.appendChild(err);
  }

  function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.remove());
    document.querySelectorAll('.contact-form input, .contact-form textarea').forEach(el => {
      el.style.borderColor = '';
      el.style.background = '';
    });
    const existing = document.querySelector('.form-feedback');
    if (existing) existing.remove();
  }

  function showFormSuccess(message) {
    const fb = document.createElement('div');
    fb.className = 'form-feedback';
    fb.style.cssText = `
      background: #E1F5EE;
      border: 1px solid #1D9E75;
      border-radius: 10px;
      padding: 14px 18px;
      color: #0F6E56;
      font-size: 14px;
      font-weight: 500;
      margin-top: 8px;
    `;
    fb.textContent = '✓ ' + message;
    form.appendChild(fb);
    setTimeout(() => fb.remove(), 7000);
  }

  function showFormError(message) {
    const fb = document.createElement('div');
    fb.className = 'form-feedback';
    fb.style.cssText = `
      background: #FCEBEB;
      border: 1px solid #E24B4A;
      border-radius: 10px;
      padding: 14px 18px;
      color: #A32D2D;
      font-size: 14px;
      font-weight: 500;
      margin-top: 8px;
    `;
    fb.textContent = '✗ ' + message;
    form.appendChild(fb);
    setTimeout(() => fb.remove(), 6000);
  }


  /* ─────────────────────────────────────────
     10. BACK TO TOP bouton
  ───────────────────────────────────────── */
  const backToTop = document.createElement('button');
  backToTop.id = 'back-to-top';
  backToTop.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="20" height="20">
      <path d="M5 15l7-7 7 7"/>
    </svg>
  `;
  backToTop.style.cssText = `
    position: fixed;
    bottom: 32px;
    right: 32px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #1D9E75;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.3s, transform 0.3s, background 0.2s;
    z-index: 150;
    box-shadow: 0 4px 20px rgba(15, 110, 86, 0.35);
  `;
  document.body.appendChild(backToTop);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTop.style.opacity = '1';
      backToTop.style.transform = 'translateY(0)';
    } else {
      backToTop.style.opacity = '0';
      backToTop.style.transform = 'translateY(16px)';
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  backToTop.addEventListener('mouseenter', () => {
    backToTop.style.background = '#0F6E56';
  });

  backToTop.addEventListener('mouseleave', () => {
    backToTop.style.background = '#1D9E75';
  });


  /* ─────────────────────────────────────────
     11. NAVBAR scrolled style additionnel
  ───────────────────────────────────────── */
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    nav.scrolled {
      box-shadow: 0 4px 24px rgba(4, 44, 83, 0.4);
    }
    .nav-links a.active-link {
      color: #5DCAA5 !important;
    }
  `;
  document.head.appendChild(styleEl);

  console.log('%c🌊 AMP Mogador — JavaScript chargé avec succès', 'color: #5DCAA5; font-size: 14px; font-weight: bold;');

}); // end DOMContentLoaded
