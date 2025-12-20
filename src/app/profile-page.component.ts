import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from './service/auth.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { StatsService, GameKey, StoredStatPoint } from './service/stats.service';

interface StatPoint {
  gameIndex: number; // numéro de la partie (1,2,3...)
  score: number;     // score sur cette partie
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  template: `
    <div class="page-container" *ngIf="user">
      
      <!-- HEADER -->
      <header class="header">
        <button class="back-link" routerLink="/">
          <span class="icon">←</span> Retour au QG
        </button>
        <div class="header-content">
          <h1 class="page-title">
            Fiche <span class="text-gold">Agent</span>
          </h1>
          <p class="subtitle">
            Gérez votre identité et analysez vos performances.
          </p>
        </div>
      </header>

      <div class="profile-grid">
        
        <!-- COLONNE GAUCHE : IDENTITÉ & ELOS -->
        <div class="left-column">
          
          <!-- CARTE PROFIL -->
          <section class="glass-card profile-card">
            <div class="profile-header">
              <div class="avatar-large">{{ (user.pseudo || user.email || 'U')[0].toUpperCase() }}</div>
              <div class="profile-info">
                <span class="role-badge">Agent Orus</span>
                <h3>{{ user.email }}</h3>
              </div>
            </div>

            <div class="form-group">
              <label>Pseudo d'opérateur</label>
              <div class="input-wrapper">
                <input 
                  [(ngModel)]="pseudo" 
                  class="game-input" 
                  placeholder="Votre pseudo..." 
                />
                <button class="btn-icon" (click)="save()">💾</button>
              </div>
              <p class="hint">Visible dans les classements et le mode Versus.</p>
            </div>
          </section>

          <!-- CARTE ELOS -->
          <section class="glass-card elo-card">
            <h4>Classement Elo</h4>
            <div class="elo-grid">
              <div class="elo-item">
                <span class="elo-icon">🔢</span>
                <div class="elo-details">
                  <span class="elo-label">Chiffres</span>
                  <span class="elo-value">{{ user.elos.chiffres }}</span>
                </div>
              </div>
              <div class="elo-item">
                <span class="elo-icon">🃏</span>
                <div class="elo-details">
                  <span class="elo-label">Cartes (1)</span>
                  <span class="elo-value">{{ user.elos.cartes1 }}</span>
                </div>
              </div>
              <div class="elo-item">
                <span class="elo-icon">📚</span>
                <div class="elo-details">
                  <span class="elo-label">Cartes (4)</span>
                  <span class="elo-value">{{ user.elos.cartes4 }}</span>
                </div>
              </div>
              <div class="elo-item">
                <span class="elo-icon">📅</span>
                <div class="elo-details">
                  <span class="elo-label">Dates</span>
                  <span class="elo-value">{{ user.elos.dates }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- OFFRE (Si nécessaire) -->
          <div class="upgrade-box" (click)="openOffers()">
            <div class="upgrade-content">
              <strong>Passez Premium</strong>
              <p>Soutenez le projet et débloquez tout.</p>
            </div>
            <button class="btn-small-gold">Voir</button>
          </div>

        </div>

        <!-- COLONNE DROITE : STATISTIQUES -->
        <div class="right-column">
          <section class="glass-card stats-card">
            <div class="card-header-row">
              <h3>Analyse de progression</h3>
              <div class="live-indicator"><span class="dot"></span> Live Data</div>
            </div>

            <div class="charts-container">
              
              <!-- CHART CHIFFRES -->
              <div class="chart-block">
                <div class="chart-label">
                  <span>Chiffres</span>
                  <span class="last-score" *ngIf="stats.chiffres.length">
                    Dernier: <strong>{{ lastScore('chiffres') }}</strong>
                  </span>
                </div>
                <div class="chart-area">
                  <svg *ngIf="stats.chiffres.length" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <polyline class="chart-line color-1" [attr.points]="getPolylinePoints(stats.chiffres)"></polyline>
                  </svg>
                  <div class="empty-state" *ngIf="!stats.chiffres.length">Pas encore de données</div>
                </div>
              </div>

              <!-- CHART CARTES 1 -->
              <div class="chart-block">
                <div class="chart-label">
                  <span>Cartes (1 paquet)</span>
                  <span class="last-score" *ngIf="stats.cartes1.length">
                    Dernier: <strong>{{ lastScore('cartes1') }}</strong>
                  </span>
                </div>
                <div class="chart-area">
                  <svg *ngIf="stats.cartes1.length" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <polyline class="chart-line color-2" [attr.points]="getPolylinePoints(stats.cartes1)"></polyline>
                  </svg>
                  <div class="empty-state" *ngIf="!stats.cartes1.length">Pas encore de données</div>
                </div>
              </div>

              <!-- CHART CARTES 4 -->
              <div class="chart-block">
                <div class="chart-label">
                  <span>Cartes (4 paquets)</span>
                  <span class="last-score" *ngIf="stats.cartes4.length">
                    Dernier: <strong>{{ lastScore('cartes4') }}</strong>
                  </span>
                </div>
                <div class="chart-area">
                  <svg *ngIf="stats.cartes4.length" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <polyline class="chart-line color-3" [attr.points]="getPolylinePoints(stats.cartes4)"></polyline>
                  </svg>
                  <div class="empty-state" *ngIf="!stats.cartes4.length">Pas encore de données</div>
                </div>
              </div>

              <!-- CHART DATES -->
              <div class="chart-block">
                <div class="chart-label">
                  <span>Dates</span>
                  <span class="last-score" *ngIf="stats.dates.length">
                    Dernier: <strong>{{ lastScore('dates') }}</strong>
                  </span>
                </div>
                <div class="chart-area">
                  <svg *ngIf="stats.dates.length" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <polyline class="chart-line color-4" [attr.points]="getPolylinePoints(stats.dates)"></polyline>
                  </svg>
                  <div class="empty-state" *ngIf="!stats.dates.length">Pas encore de données</div>
                </div>
              </div>

            </div>
          </section>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      --gold: #f59e0b;
      --primary: #6366f1;
      --glass-bg: rgba(30, 41, 59, 0.6);
      --glass-border: 1px solid rgba(255, 255, 255, 0.08);
      --text-muted: #94a3b8;
      
      --chart-1: #22c55e;
      --chart-2: #38bdf8;
      --chart-3: #a855f7;
      --chart-4: #f97316;
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
    .back-link {
      position: absolute;
      left: 0;
      top: 0;
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    .back-link:hover { color: white; }

    .page-title {
      font-size: 3rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
      color: white;
      line-height: 1.1;
    }
    .text-gold {
      background: linear-gradient(135deg, #fff 0%, var(--gold) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { color: var(--text-muted); font-size: 1.1rem; }

    /* --- GRID --- */
    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 1.5rem;
      align-items: start;
    }

    .left-column { display: flex; flex-direction: column; gap: 1.5rem; }
    .right-column { display: flex; flex-direction: column; gap: 1.5rem; }

    /* --- CARDS --- */
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: var(--glass-border);
      border-radius: 24px;
      padding: 1.5rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }

    /* PROFILE CARD */
    .profile-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .avatar-large {
      width: 64px; height: 64px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem; font-weight: 700;
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
    }
    .profile-info h3 { margin: 0; font-size: 1rem; color: white; word-break: break-all; }
    .role-badge {
      background: rgba(255,255,255,0.1);
      color: #cbd5e1;
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .form-group label { display: block; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.5rem; }
    .input-wrapper { display: flex; gap: 0.5rem; }
    .game-input {
      flex: 1;
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 0.6rem;
      color: white;
      font-size: 0.95rem;
      outline: none;
    }
    .game-input:focus { border-color: var(--primary); }
    .btn-icon {
      background: var(--primary);
      border: none;
      border-radius: 8px;
      width: 40px;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex; align-items: center; justify-content: center;
    }
    .hint { font-size: 0.8rem; color: #64748b; margin-top: 0.5rem; }

    /* ELO CARD */
    .elo-card h4 { margin: 0 0 1rem 0; color: white; font-size: 1.1rem; }
    .elo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
    .elo-item {
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }
    .elo-icon { font-size: 1.2rem; }
    .elo-details { display: flex; flex-direction: column; }
    .elo-label { font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted); }
    .elo-value { font-size: 1.1rem; font-weight: 700; color: white; }

    /* UPGRADE BOX */
    .upgrade-box {
      background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05));
      border: 1px solid rgba(245,158,11,0.3);
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .upgrade-box:hover { transform: translateY(-2px); }
    .upgrade-content strong { color: var(--gold); display: block; font-size: 0.9rem; }
    .upgrade-content p { color: var(--text-muted); margin: 0; font-size: 0.8rem; }
    .btn-small-gold {
      background: var(--gold);
      color: #1e293b;
      border: none;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.8rem;
      cursor: pointer;
    }

    /* STATS CARD */
    .card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .card-header-row h3 { margin: 0; color: white; font-size: 1.2rem; }
    .live-indicator { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--success); text-transform: uppercase; letter-spacing: 1px; }
    .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }

    .charts-container { display: flex; flex-direction: column; gap: 2rem; }
    
    .chart-block { display: flex; flex-direction: column; gap: 0.5rem; }
    .chart-label { display: flex; justify-content: space-between; color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .last-score { color: white; font-size: 0.8rem; }
    .last-score strong { color: var(--gold); }

    .chart-area {
      background: rgba(0,0,0,0.3);
      border-radius: 12px;
      height: 80px;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .chart-svg { width: 100%; height: 100%; }
    .chart-line { fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
    .color-1 { stroke: var(--chart-1); }
    .color-2 { stroke: var(--chart-2); }
    .color-3 { stroke: var(--chart-3); }
    .color-4 { stroke: var(--chart-4); }

    .empty-state {
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.2); font-size: 0.8rem; font-style: italic;
    }

    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

    @media (max-width: 800px) {
      .profile-grid { grid-template-columns: 1fr; }
      .header { text-align: left; }
      .back-link { position: relative; margin-bottom: 1rem; }
      .page-title { font-size: 2.5rem; }
    }
  `]
})
export class ProfilePageComponent {
  pseudo = '';
  user!: User;

  stats: Record<GameKey, StatPoint[]> = {
    chiffres: [],
    cartes1: [],
    cartes4: [],
    dates: []
  };

  constructor(
    public auth: AuthService,
    private router: Router,
    private statsService: StatsService
  ) {
    this.init();
  }

  private async init() {
    const u = await firstValueFrom(this.auth.user$);
    if (u) {
      this.user = u;
      this.pseudo = u.pseudo;
    }
    this.loadStatsFromService();
  }

  private loadStatsFromService() {
    (['chiffres', 'cartes1', 'cartes4', 'dates'] as GameKey[]).forEach((key) => {
      const series: StoredStatPoint[] = this.statsService.getSeries(key);
      this.stats[key] = series.map(p => ({
        gameIndex: p.gameIndex,
        score: p.score
      }));
    });
  }

  save() {
    this.auth.updatePseudo(this.pseudo);
  }

  openOffers() {
    this.router.navigate(['/offres']);
  }

  lastScore(key: GameKey): number | null {
    const series = this.stats[key];
    if (!series.length) return null;
    return series[series.length - 1].score;
  }

  getPolylinePoints(series: StatPoint[]): string {
    if (!series.length) return '';

    const scores = series.map(p => p.score);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const span = max - min || 1;
    const n = series.length;

    return series.map((p, idx) => {
      const x = n === 1 ? 0 : (idx / (n - 1)) * 100;
      // Normaliser le score entre 10% et 90% de la hauteur (pour éviter de toucher les bords)
      const norm = (p.score - min) / span;
      const y = 35 - norm * 30; 
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
  }
}