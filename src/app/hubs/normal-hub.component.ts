import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-normal-hub',
  standalone: true,
  template: `
    <div class="page-container">
      
      <!-- HEADER -->
      <header class="header">
        <div class="mode-badge">Entraînement Libre</div>
        <h1 class="page-title">
          Zone de <span class="text-gradient">Pratique</span>
        </h1>
        <p class="subtitle">
          Pas de chrono officiel, pas de classement. Juste vous, votre technique 
          et la répétition pour ancrer vos automatismes.
        </p>
      </header>

      <!-- GRID DES ÉPREUVES -->
      <div class="games-grid">
        
        <!-- CARD: CHIFFRES -->
        <article class="glass-card game-card" (click)="go('/chiffres-normal')">
          <div class="card-icon">🔢</div>
          <div class="card-content">
            <h3>Séquences de Chiffres</h3>
            <p>Travaillez votre système majeur (00-99) et votre PAO sans stress.</p>
            <div class="card-meta">Focus : Précision</div>
          </div>
          <button class="btn-play">Lancer</button>
        </article>

        <!-- CARD: CARTES 1 -->
        <article class="glass-card game-card" (click)="go('/cartes1-normal')">
          <div class="card-icon">🃏</div>
          <div class="card-content">
            <h3>Paquet Unique (52)</h3>
            <p>L'exercice roi. Prenez le temps de bien visualiser chaque locus.</p>
            <div class="card-meta">Focus : Visualisation</div>
          </div>
          <button class="btn-play">Lancer</button>
        </article>

        <!-- CARD: CARTES 4 -->
        <article class="glass-card game-card" (click)="go('/cartes4-normal')">
          <div class="card-icon">📚</div>
          <div class="card-content">
            <h3>Endurance (208)</h3>
            <p>4 paquets à la suite. Idéal pour tester la solidité de votre palais mental.</p>
            <div class="card-meta">Focus : Endurance</div>
          </div>
          <button class="btn-play">Lancer</button>
        </article>

        <!-- CARD: DATES -->
        <article class="glass-card game-card" (click)="go('/dates-normal')">
          <div class="card-icon">⏳</div>
          <div class="card-content">
            <h3>Repères Historiques</h3>
            <p>Associez dates et événements pour construire votre culture générale.</p>
            <div class="card-meta">Focus : Association</div>
          </div>
          <button class="btn-play">Lancer</button>
        </article>

      </div>

    </div>
  `,
  styles: [`
    :host {
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --glass-bg: rgba(30, 41, 59, 0.6);
      --glass-border: 1px solid rgba(255, 255, 255, 0.08);
      display: block;
    }

    .page-container {
      max-width: 1100px;
      margin: 0 auto;
      padding-bottom: 4rem;
    }

    /* --- HEADER --- */
    .header {
      text-align: center;
      margin-bottom: 4rem;
      position: relative;
    }

    .mode-badge {
      display: inline-block;
      padding: 0.4rem 1rem;
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 1rem;
    }

    .page-title {
      font-size: 3rem;
      font-weight: 800;
      margin: 0 0 1rem 0;
      color: white;
      line-height: 1.1;
    }

    .text-gradient {
      background: linear-gradient(135deg, #fff 0%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      font-size: 1.1rem;
      color: #94a3b8;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* --- GRID --- */
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      padding: 0 1rem;
    }

    /* --- CARD --- */
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: var(--glass-border);
      border-radius: 24px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    /* Effet de brillance au survol */
    .glass-card::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .glass-card:hover {
      transform: translateY(-5px);
      border-color: rgba(99, 102, 241, 0.4);
      box-shadow: 0 20px 40px -5px rgba(0,0,0,0.4);
    }
    .glass-card:hover::after { opacity: 1; }

    .card-icon {
      font-size: 2.5rem;
      background: rgba(255,255,255,0.05);
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-content { flex: 1; }

    .card-content h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.4rem;
      color: white;
    }

    .card-content p {
      margin: 0 0 1rem 0;
      font-size: 0.95rem;
      color: #cbd5e1;
      line-height: 1.5;
    }

    .card-meta {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      font-weight: 600;
    }

    .btn-play {
      background: linear-gradient(135deg, var(--primary), var(--primary-hover));
      border: none;
      padding: 0.8rem;
      border-radius: 12px;
      color: white;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      width: 100%;
      text-align: center;
      transition: transform 0.2s;
      z-index: 2;
    }

    .btn-play:hover {
      transform: scale(1.02);
    }

    /* --- RESPONSIVE --- */
    @media (max-width: 640px) {
      .page-title { font-size: 2.2rem; }
      .games-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class NormalHubComponent {
  constructor(private router: Router) {}

  go(path: string): void {
    this.router.navigate([path]);
  }
}