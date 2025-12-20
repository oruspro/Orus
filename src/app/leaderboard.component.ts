import { Component, Input, OnChanges, SimpleChanges, OnInit, inject } from '@angular/core';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { LeaderboardService, RankedEntry } from './service/leaderboard.service';
import { GameKey } from './service/stats.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe],
  template: `
    <div class="leaderboard-container">
      
      <!-- SÉLECTEUR DE JEU -->
      <div class="tabs-row">
        <button 
          *ngFor="let g of games" 
          class="tab-btn" 
          [class.active]="selectedGame === g.key"
          (click)="selectGame(g.key)"
        >
          {{ g.label }}
        </button>
      </div>

      <!-- TABLEAU -->
      <div class="table-wrapper glass-card">
        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div> Chargement...
        </div>

        <table *ngIf="!loading && entries.length > 0" class="rank-table">
          <thead>
            <tr>
              <th class="col-rank">#</th>
              <th class="col-player">Joueur</th>
              <th class="col-score">Score</th>
              <th class="col-date desktop-only">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let entry of entries; let i = index" [class.top-3]="i < 3">
              <td class="col-rank">
                <span class="rank-badge" [attr.data-rank]="i + 1">{{ i + 1 }}</span>
              </td>
              <td class="col-player">
                <div class="player-cell">
                  <div class="avatar-mini">{{ (entry.pseudo || '?')[0].toUpperCase() }}</div>
                  <span class="pseudo">{{ entry.pseudo }}</span>
                  <span *ngIf="i === 0" class="crown">👑</span>
                </div>
              </td>
              <td class="col-score">{{ entry.score }}</td>
              <td class="col-date desktop-only">{{ entry.updatedAt | date:'shortDate' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- EMPTY STATE -->
        <div *ngIf="!loading && entries.length === 0" class="empty-state">
          <span class="ghost">👻</span>
          <p>Aucun classement pour le moment.<br>Soyez le premier à entrer dans la légende !</p>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      --gold: #f59e0b;
      --silver: #94a3b8;
      --bronze: #b45309;
      display: block;
    }

    .tabs-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }
    
    .tab-btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: #94a3b8;
      padding: 0.5rem 1rem;
      border-radius: 99px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
      font-size: 0.9rem;
    }
    .tab-btn:hover { background: rgba(255,255,255,0.1); color: white; }
    .tab-btn.active {
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      border-color: #818cf8;
    }

    .glass-card {
      background: rgba(30, 41, 59, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      overflow: hidden;
    }

    .rank-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    
    .rank-table th {
      padding: 1rem;
      color: #64748b;
      font-size: 0.8rem;
      text-transform: uppercase;
      font-weight: 600;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .rank-table td {
      padding: 1rem;
      color: #e2e8f0;
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }

    .col-rank { width: 60px; text-align: center; }
    .rank-badge {
      display: inline-flex; width: 28px; height: 28px;
      align-items: center; justify-content: center;
      border-radius: 50%;
      font-weight: 700;
      background: rgba(255,255,255,0.05);
      color: #94a3b8;
    }

    .top-3 .rank-badge[data-rank="1"] { background: var(--gold); color: #1e293b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.4); }
    .top-3 .rank-badge[data-rank="2"] { background: var(--silver); color: #1e293b; }
    .top-3 .rank-badge[data-rank="3"] { background: var(--bronze); color: white; }

    .player-cell { display: flex; align-items: center; gap: 0.8rem; }
    .avatar-mini {
      width: 32px; height: 32px;
      background: #4f46e5;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.8rem;
    }
    .pseudo { font-weight: 600; }
    .col-score { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #f59e0b; }
    .col-date { color: #64748b; font-size: 0.85rem; }

    .loading-state, .empty-state {
      padding: 3rem; text-align: center; color: #94a3b8;
    }
    .ghost { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
    
    @media (max-width: 600px) {
      .desktop-only { display: none; }
    }
  `]
})
export class LeaderboardComponent implements OnInit, OnChanges {
  @Input() defaultGame: GameKey = 'chiffres';
  
  // Correction ici : Typage explicite
  private lbService: LeaderboardService = inject(LeaderboardService);
  
  selectedGame: GameKey = 'chiffres';
  entries: RankedEntry[] = [];
  loading = false;

  games: {key: GameKey, label: string}[] = [
    { key: 'chiffres', label: 'Chiffres' },
    { key: 'cartes1', label: 'Cartes (52)' },
    { key: 'cartes4', label: 'Marathon' },
    { key: 'dates', label: 'Dates' }
  ];

  ngOnInit() {
    this.selectGame(this.defaultGame);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['defaultGame']) {
      this.selectGame(this.defaultGame);
    }
  }

  async selectGame(key: GameKey) {
    this.selectedGame = key;
    this.loading = true;
    try {
      this.entries = await this.lbService.getLeaderboard(key);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }
}