import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { AuthService } from '../service/auth.service';
import { StatsService } from '../service/stats.service';
import { LeaderboardComponent } from '../leaderboard.component'; // ✅ Import du composant
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-classe-hub',
  standalone: true,
  imports: [NgIf, NgClass, LeaderboardComponent],
  template: `
    <div class="page-container">
      
      <!-- HEADER -->
      <header class="header">
        <div class="rank-badge">Mode Compétitif</div>
        <h1 class="page-title">
          Épreuves <span class="text-gradient">Classées</span>
        </h1>
        <p class="subtitle">
          Votre performance définit votre rang. Mesurez-vous aux standards mondiaux 
          avec le système Elo.
        </p>
        
        <!-- LIMITATION INFO -->
        <div class="limit-info">
          <span class="info-icon">ℹ️</span>
          <span>
            Parties jouées aujourd'hui : <strong>{{ todayCount }}</strong> 
            <span *ngIf="!isPremium"> / 5</span>
            <span *ngIf="isPremium"> (Illimité)</span>
          </span>
          <a *ngIf="!isPremium" class="upgrade-link" (click)="router.navigate(['/offres'])">Débloquer l'illimité</a>
        </div>
      </header>

      <!-- NAVIGATION ONGLETS -->
      <div class="view-toggles">
        <button 
          class="toggle-btn" 
          [class.active]="activeTab === 'play'"
          (click)="activeTab = 'play'"
        >
          🎮 Jouer
        </button>
        <button 
          class="toggle-btn" 
          [class.active]="activeTab === 'rank'"
          (click)="activeTab = 'rank'"
        >
          🏆 Classements
        </button>
      </div>

      <!-- ONGLET : JOUER -->
      <div class="games-grid" *ngIf="activeTab === 'play'">
        
        <!-- CARD: CHIFFRES -->
        <article class="glass-card game-card" (click)="tryGo('/chiffres-classe')">
          <div class="card-icon">🔢</div>
          <div class="card-content">
            <h3>Chiffres</h3>
            <p>Mémorisez la plus longue suite de chiffres possible. La précision est reine.</p>
            <div class="card-meta">Standard: 5 min</div>
          </div>
          <button class="btn-play">Jouer</button>
        </article>

        <!-- CARD: CARTES 1 -->
        <article class="glass-card game-card" (click)="tryGo('/cartes1-classe')">
          <div class="card-icon">🃏</div>
          <div class="card-content">
            <h3>Speed Cards</h3>
            <p>52 cartes. Un seul paquet. C'est une course contre la montre.</p>
            <div class="card-meta">Standard: 5 min max</div>
          </div>
          <button class="btn-play">Jouer</button>
        </article>

        <!-- CARD: CARTES 4 -->
        <article class="glass-card game-card" (click)="tryGo('/cartes4-classe')">
          <div class="card-icon">📚</div>
          <div class="card-content">
            <h3>Marathon Cartes</h3>
            <p>4 paquets (208 cartes). L'épreuve d'endurance mentale ultime.</p>
            <div class="card-meta">Standard: 10 min</div>
          </div>
          <button class="btn-play">Jouer</button>
        </article>

        <!-- CARD: DATES -->
        <article class="glass-card game-card" (click)="tryGo('/dates-classe')">
          <div class="card-icon">📅</div>
          <div class="card-content">
            <h3>Dates Historiques</h3>
            <p>Associez les événements à leurs années. Culture et mémoire.</p>
            <div class="card-meta">Format : Série de 20</div>
          </div>
          <button class="btn-play">Jouer</button>
        </article>

      </div>

      <!-- ONGLET : CLASSEMENTS -->
      <div class="leaderboard-section" *ngIf="activeTab === 'rank'">
        <app-leaderboard></app-leaderboard>
      </div>

    </div>
  `,
  styles: [`
    :host {
      --gold: #f59e0b;
      --gold-hover: #d97706;
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
      margin-bottom: 3rem;
      position: relative;
    }

    .rank-badge {
      display: inline-block;
      padding: 0.4rem 1rem;
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
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
      background: linear-gradient(135deg, #fff 0%, #fcd34d 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      font-size: 1.1rem;
      color: #94a3b8;
      max-width: 600px;
      margin: 0 auto 2rem;
      line-height: 1.6;
    }

    /* Info Limit */
    .limit-info {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2);
      padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; color: #fcd34d;
    }
    .upgrade-link { text-decoration: underline; cursor: pointer; font-weight: 700; margin-left: 0.5rem; }

    /* --- TABS --- */
    .view-toggles {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 3rem;
    }
    
    .toggle-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.1rem;
      font-weight: 600;
      padding: 0.5rem 1.5rem;
      cursor: pointer;
      position: relative;
      transition: color 0.3s;
    }
    
    .toggle-btn.active {
      color: white;
    }
    
    .toggle-btn.active::after {
      content: '';
      position: absolute;
      bottom: -5px; left: 0; right: 0;
      height: 3px;
      background: var(--gold);
      border-radius: 3px;
      box-shadow: 0 0 10px var(--gold);
    }

    /* --- GRID --- */
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      padding: 0 1rem;
      animation: fadeIn 0.4s ease-out;
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
      border-color: rgba(245, 158, 11, 0.4);
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
      background: linear-gradient(135deg, var(--gold), var(--gold-hover));
      border: none;
      padding: 0.8rem;
      border-radius: 12px;
      color: #1e293b;
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
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* --- RESPONSIVE --- */
    @media (max-width: 640px) {
      .page-title { font-size: 2.2rem; }
      .games-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ClasseHubComponent {
  todayCount = 0;
  isPremium = false;
  activeTab: 'play' | 'rank' = 'play';

  constructor(
    public router: Router, 
    private auth: AuthService,
    private stats: StatsService
  ) {
    this.checkStatus();
  }

  checkStatus() {
    this.auth.user$.subscribe(user => {
      this.isPremium = user?.isPremium || false;
    });
    
    setInterval(() => {
      this.todayCount = this.stats.getTodayRankedCount();
    }, 1000);
  }

  async tryGo(path: string) {
    const user = await firstValueFrom(this.auth.user$);
    
    if (!user) {
      this.auth.openAuth();
      return;
    }

    if (!this.isPremium && this.todayCount >= 5) {
      if (confirm("🔒 Limite journalière atteinte (5/5).\n\nPassez Premium pour jouer en illimité ou revenez demain.\n\nVoir l'offre ?")) {
        this.router.navigate(['/offres']);
      }
      return;
    }

    this.router.navigate([path]);
  }
}