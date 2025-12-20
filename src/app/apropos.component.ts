import { Component } from '@angular/core';

@Component({
  selector: 'app-apropos',
  standalone: true,
  template: `
    <div class="page-container">
      
      <!-- HERO SECTION -->
      <header class="hero">
        <div class="badge">Mission Orus</div>
        <h1 class="hero-title">
          Entraîner sa mémoire,<br>
          c’est <span class="text-gradient">investir</span> dans tout le reste.
        </h1>
        <p class="hero-text">
          Dans un monde saturé d'informations, votre capacité à retenir, 
          traiter et relier les données est votre meilleur atout. 
          <span class="highlight">Orus</span> transforme cet entraînement en une quête captivante.
        </p>
      </header>

      <!-- SECTION VISION (Pourquoi maintenant ?) -->
      <section class="content-section">
        <div class="glass-card featured">
          <h2>L'Humain face à l'IA</h2>
          <p>
            L’intelligence artificielle automatise le stockage de l'information, 
            mais elle ne remplace pas votre <strong>discernement</strong>. 
            Une mémoire entraînée est le carburant de la créativité, de l'éloquence 
            et de la pensée critique. Ne déléguez pas votre cerveau aux machines.
          </p>
        </div>
      </section>

      <!-- GRID DES PILIERS (Contenu Enrichi) -->
      <section class="features-grid">
        
        <!-- Carte 1 : Méthode -->
        <div class="glass-card">
          <div class="card-icon">🏛️</div>
          <h3>Techniques Ancestrales</h3>
          <p>
            Nous démythifions les secrets des champions de mémoire. 
            <strong>Palais Mental</strong>, Système Major, Associations... 
            Ces techniques millénaires sont intégrées directement dans le gameplay.
          </p>
        </div>

        <!-- Carte 2 : Gamification (Nouveau) -->
        <div class="glass-card">
          <div class="card-icon">🎮</div>
          <h3>Gamification Poussée</h3>
          <p>
            L'ennui est l'ennemi de la progression. Gagnez de l'XP, 
            montez en <strong>Rang Classé</strong> et débloquez des trophées. 
            Votre cerveau travaille dur, mais vous aurez l'impression de jouer.
          </p>
        </div>

        <!-- Carte 3 : Neuroplasticité (Nouveau) -->
        <div class="glass-card">
          <div class="card-icon">🧠</div>
          <h3>Neuroplasticité</h3>
          <p>
            Votre cerveau n'est pas figé. Comme un muscle, il se renforce par l'effort.
            Quelques minutes de <strong>focus intense</strong> par jour suffisent pour créer 
            de nouvelles connexions neuronales durables.
          </p>
        </div>

      </section>

      <!-- DISCLAIMER / VISION SANTÉ -->
      <section class="content-section">
        <div class="info-box">
          <span class="info-icon">ℹ️</span>
          <p>
            <strong>Note importante :</strong> Orus est un outil d'hygiène mentale et de performance, 
            pas un dispositif médical. Notre but est de vous aider à rester curieux, vif et 
            performant tout au long de votre vie.
          </p>
        </div>
      </section>

      <!-- FOOTER / CTA -->
      <footer class="apropos-footer">
        <h2>Prêt à upgrader votre cerveau ?</h2>
        <p>Rejoignez les premiers utilisateurs et commencez votre ascension.</p>
        <!-- Le bouton renverrait vers l'inscription ou le jeu -->
        <div class="footer-decoration"></div>
      </footer>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      /* On reprend les variables du thème pour la cohérence */
      --primary: #6366f1;
      --accent: #f43f5e;
      --gold: #f59e0b;
      --glass-bg: rgba(30, 41, 59, 0.6);
      --glass-border: 1px solid rgba(255, 255, 255, 0.08);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
    }

    .page-container {
      max-width: 1000px;
      margin: 0 auto;
      /* Animation d'entrée douce */
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* --- HERO --- */
    .hero {
      text-align: center;
      margin-bottom: 4rem;
      position: relative;
    }

    .badge {
      display: inline-block;
      padding: 0.4rem 1rem;
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 1.5rem;
    }

    .hero-title {
      font-size: 2.5rem;
      line-height: 1.2;
      font-weight: 800;
      margin-bottom: 1.5rem;
      color: white;
    }

    .text-gradient {
      background: linear-gradient(135deg, var(--primary) 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-text {
      font-size: 1.1rem;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .highlight {
      color: white;
      font-weight: 600;
    }

    /* --- CARDS & GLASSMORPHISM --- */
    .content-section {
      margin-bottom: 2rem;
    }

    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(10px);
      border: var(--glass-border);
      border-radius: 20px;
      padding: 2rem;
      transition: transform 0.3s ease, border-color 0.3s ease;
    }

    .glass-card:hover {
      transform: translateY(-5px);
      border-color: rgba(99, 102, 241, 0.4);
    }

    .glass-card.featured {
      border-left: 4px solid var(--primary);
      background: linear-gradient(90deg, rgba(99,102,241,0.05) 0%, rgba(30,41,59,0.6) 100%);
    }

    .glass-card h2, .glass-card h3 {
      color: white;
      margin-bottom: 0.8rem;
    }
    .glass-card p {
      color: var(--text-muted);
      line-height: 1.6;
    }

    /* --- GRID --- */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .card-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
      background: rgba(255,255,255,0.05);
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }

    /* --- INFO BOX --- */
    .info-box {
      display: flex;
      gap: 1rem;
      background: rgba(245, 158, 11, 0.1); /* Gold tint */
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 1.5rem;
      border-radius: 16px;
      align-items: flex-start;
    }

    .info-icon {
      font-size: 1.5rem;
    }

    .info-box p {
      margin: 0;
      color: #fde68a; /* Light gold text */
      font-size: 0.9rem;
      line-height: 1.5;
    }

    /* --- FOOTER --- */
    .apropos-footer {
      text-align: center;
      margin-top: 4rem;
      padding-bottom: 2rem;
    }

    .apropos-footer h2 {
      font-size: 1.8rem;
      color: white;
      margin-bottom: 0.5rem;
    }

    .footer-decoration {
      height: 1px;
      width: 100px;
      background: linear-gradient(90deg, transparent, var(--primary), transparent);
      margin: 2rem auto 0;
    }

    /* --- RESPONSIVE --- */
    @media (min-width: 768px) {
      .hero-title { font-size: 3.5rem; }
      .glass-card { padding: 2.5rem; }
    }
  `]
})
export class AproposComponent {}