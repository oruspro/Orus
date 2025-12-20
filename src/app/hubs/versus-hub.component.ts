import { Component } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

type VersusGameType = 'chiffres' | 'cartes1' | 'cartes4' | 'dates';

interface VersusGameDefinition {
  id: VersusGameType;
  label: string;
  description: string;
  route: string;
}

type VersusMode = 'none' | 'quick' | 'friends';

interface VersusLobbyPlayer {
  id: string;
  pseudo: string;
  isYou: boolean;
  isFriend: boolean;
  isReady: boolean; // Ajout pour le visuel
}

interface VersusLobby {
  id: string;
  maxPlayers: number;
  isPrivate: boolean;
  fillWithCommunity: boolean;
  players: VersusLobbyPlayer[];
}

@Component({
  selector: 'app-versus-hub',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      
      <!-- HEADER -->
      <header class="header">
        <a routerLink="/" class="back-link">
          <span class="icon">←</span> Retour au QG
        </a>
        <div class="header-content">
          <div class="vs-badge">PvP En Temps Réel</div>
          <h1 class="page-title">
            Versus <span class="text-gradient">Arena</span>
          </h1>
          <p class="subtitle">
            Affrontez d'autres mnémonistes en direct. Même épreuve, même chrono.
          </p>
        </div>
      </header>

      <!-- ÉTAPE 1 : CHOIX DU MODE -->
      <section *ngIf="versusMode === 'none'" class="modes-selection">
        
        <!-- MATCH RAPIDE -->
        <div class="glass-card mode-card quick" (click)="startQuickMatch()">
          <div class="card-bg-glow"></div>
          <div class="mode-icon">⚡</div>
          <div class="mode-content">
            <h3>Match Rapide</h3>
            <p>Rejoignez instantanément une partie publique aléatoire.</p>
            <div class="mode-meta">
              <span>Solo</span> • <span>Matchmaking</span> • <span>Ranked</span>
            </div>
          </div>
          <button class="btn-play">Jouer</button>
        </div>

        <!-- SALON PRIVÉ -->
        <div class="glass-card mode-card friends" (click)="startFriendsLobby()">
          <div class="mode-icon">🤝</div>
          <div class="mode-content">
            <h3>Salon Privé</h3>
            <p>Créez une lobby et invitez vos amis via un code.</p>
            <div class="mode-meta">
              <span>Multi</span> • <span>Custom</span> • <span>Fun</span>
            </div>
          </div>
          <button class="btn-secondary">Créer</button>
        </div>

      </section>

      <!-- ÉTAPE 2 : RECHERCHE / LOBBY -->
      
      <!-- CAS : RECHERCHE EN COURS -->
      <section *ngIf="isSearching" class="glass-card searching-panel">
        <div class="radar-spinner"></div>
        <h3>Recherche d'adversaires...</h3>
        <p>Estimation : <span class="highlight">00:15</span></p>
        <button class="btn-cancel" (click)="resetMode()">Annuler</button>
      </section>

      <!-- CAS : LOBBY ACTIF (Privé ou Public trouvé) -->
      <section *ngIf="!isSearching && lobby" class="lobby-container">
        
        <!-- INFO DU SALON -->
        <div class="lobby-header-row">
          <div class="lobby-id">
            <span class="label">ID SALON</span>
            <span class="code">{{ lobby.id }}</span>
          </div>
          <div class="lobby-status">
            {{ lobby.players.length }} / {{ lobby.maxPlayers }} Joueurs
          </div>
        </div>

        <!-- LISTE DES JOUEURS (GRID) -->
        <div class="players-grid">
          <div 
            class="glass-card player-slot" 
            *ngFor="let p of lobby.players"
            [class.is-me]="p.isYou"
          >
            <div class="avatar">
              {{ p.pseudo[0].toUpperCase() }}
            </div>
            <div class="player-info">
              <div class="player-name">{{ p.pseudo }}</div>
              <div class="player-status">
                <span class="status-dot ready"></span> Prêt
              </div>
            </div>
            <div class="player-badges">
              <span *ngIf="p.isYou" class="badge me">VOUS</span>
              <span *ngIf="p.isFriend" class="badge friend">AMI</span>
            </div>
          </div>

          <!-- SLOTS VIDES -->
          <div class="glass-card player-slot empty" *ngFor="let i of emptySlots">
            <div class="avatar-placeholder">?</div>
            <div class="player-info">
              <div class="player-name waiting">En attente...</div>
            </div>
          </div>
        </div>

        <!-- OPTIONS (Si salon privé) -->
        <div *ngIf="versusMode === 'friends'" class="lobby-controls glass-card">
          <h4>Inviter des joueurs</h4>
          <div class="invite-row">
            <input 
              [(ngModel)]="friendPseudo" 
              placeholder="Pseudo de l'ami..." 
              class="game-input"
              (keyup.enter)="addFriend()"
            />
            <button class="btn-icon" (click)="addFriend()">+</button>
          </div>
          
          <div class="toggle-row">
            <label class="switch">
              <input type="checkbox" [(ngModel)]="lobby.fillWithCommunity">
              <span class="slider"></span>
            </label>
            <span>Autoriser le matchmaking public</span>
          </div>
        </div>

        <!-- ACTIONS FINALES -->
        <div class="lobby-actions">
          <button class="btn-cancel-large" (click)="resetMode()">Quitter le salon</button>
          
          <div class="game-preview" *ngIf="selectedGame">
            Prochaine épreuve : <strong>{{ selectedGame.label }}</strong>
          </div>

          <button class="btn-start" (click)="versusMode === 'friends' ? launchFromFriendsLobby() : goToGame()">
            {{ versusMode === 'friends' ? 'Lancer la session' : 'Prêt !' }}
          </button>
        </div>

      </section>

    </div>
  `,
  styles: [`
    :host {
      --primary: #6366f1;
      --accent-pink: #ec4899;
      --glass-bg: rgba(30, 41, 59, 0.7);
      --glass-border: 1px solid rgba(255, 255, 255, 0.08);
      --success: #10b981;
    }

    .page-container {
      max-width: 1000px;
      margin: 0 auto;
      padding-bottom: 4rem;
      min-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    /* --- HEADER --- */
    .header {
      text-align: center;
      margin-bottom: 4rem;
      position: relative;
    }
    .back-link {
      position: absolute;
      left: 0;
      top: 0;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    .back-link:hover { color: white; }

    .vs-badge {
      display: inline-block;
      padding: 0.4rem 1rem;
      background: rgba(236, 72, 153, 0.15);
      color: #f472b6;
      border: 1px solid rgba(236, 72, 153, 0.3);
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 1rem;
    }

    .page-title {
      font-size: 3.5rem;
      font-weight: 800;
      margin: 0 0 1rem 0;
      color: white;
      line-height: 1.1;
    }
    .text-gradient {
      background: linear-gradient(135deg, #fff 0%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { color: #94a3b8; font-size: 1.1rem; }

    /* --- MODE SELECTION --- */
    .modes-selection {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      padding: 0 1rem;
    }

    .mode-card {
      position: relative;
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: var(--glass-border);
      border-radius: 24px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;
    }
    .mode-card:hover { transform: translateY(-5px); }
    
    .mode-card.quick:hover { border-color: var(--accent-pink); box-shadow: 0 15px 40px rgba(236, 72, 153, 0.2); }
    .mode-card.friends:hover { border-color: var(--primary); box-shadow: 0 15px 40px rgba(99, 102, 241, 0.2); }

    .mode-icon { font-size: 3rem; margin-bottom: 1rem; }
    .mode-content h3 { color: white; margin: 0 0 0.5rem 0; font-size: 1.5rem; }
    .mode-content p { color: #94a3b8; margin: 0 0 1.5rem 0; line-height: 1.5; }
    
    .mode-meta {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      font-size: 0.8rem;
      color: #cbd5e1;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 2rem;
    }

    .btn-play {
      background: linear-gradient(135deg, var(--accent-pink), #db2777);
      color: white; border: none; padding: 0.8rem 2.5rem; border-radius: 99px; font-weight: 700; cursor: pointer; transition: transform 0.2s;
    }
    .btn-secondary {
      background: rgba(255,255,255,0.1);
      color: white; border: 1px solid rgba(255,255,255,0.2); padding: 0.8rem 2.5rem; border-radius: 99px; font-weight: 700; cursor: pointer; transition: background 0.2s;
    }
    .btn-play:hover, .btn-secondary:hover { transform: scale(1.05); }

    /* --- SEARCHING STATE --- */
    .searching-panel {
      max-width: 500px;
      margin: 2rem auto;
      text-align: center;
      padding: 3rem;
      border-radius: 24px;
      background: var(--glass-bg);
      border: var(--glass-border);
    }
    .radar-spinner {
      width: 60px; height: 60px;
      border: 4px solid rgba(236, 72, 153, 0.3);
      border-top-color: var(--accent-pink);
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .searching-panel h3 { color: white; margin: 0 0 0.5rem 0; }
    .highlight { color: var(--accent-pink); font-weight: 700; font-family: monospace; font-size: 1.2rem; }
    .btn-cancel { background: none; border: none; color: #94a3b8; text-decoration: underline; margin-top: 1.5rem; cursor: pointer; }

    /* --- LOBBY --- */
    .lobby-container {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .lobby-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1rem;
    }
    .lobby-id { display: flex; align-items: center; gap: 0.8rem; }
    .lobby-id .label { color: #94a3b8; font-size: 0.8rem; font-weight: 700; }
    .lobby-id .code { background: rgba(255,255,255,0.1); padding: 0.3rem 0.8rem; border-radius: 8px; color: white; font-family: monospace; font-size: 1.1rem; letter-spacing: 1px; }
    .lobby-status { color: var(--success); font-weight: 600; text-transform: uppercase; font-size: 0.9rem; }

    .players-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .player-slot {
      background: var(--glass-bg);
      border: var(--glass-border);
      padding: 1.5rem;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.8rem;
      position: relative;
    }
    .player-slot.is-me { border-color: var(--primary); background: rgba(99, 102, 241, 0.1); }
    
    .avatar {
      width: 50px; height: 50px; background: var(--primary); color: white;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.2rem;
    }
    .player-name { color: white; font-weight: 600; font-size: 1rem; }
    .player-status { font-size: 0.8rem; color: #94a3b8; display: flex; align-items: center; gap: 0.4rem; }
    .status-dot { width: 8px; height: 8px; background: var(--success); border-radius: 50%; }
    
    .player-badges { position: absolute; top: 10px; right: 10px; display: flex; gap: 0.3rem; }
    .badge { font-size: 0.6rem; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 700; }
    .badge.me { background: var(--primary); color: white; }
    .badge.friend { background: var(--accent-pink); color: white; }

    /* Empty Slot */
    .player-slot.empty { border-style: dashed; opacity: 0.6; }
    .avatar-placeholder { width: 50px; height: 50px; border-radius: 50%; border: 2px dashed #94a3b8; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
    .player-name.waiting { color: #94a3b8; font-style: italic; }

    /* Lobby Controls */
    .lobby-controls { padding: 1.5rem; background: var(--glass-bg); border-radius: 16px; border: var(--glass-border); }
    .lobby-controls h4 { margin: 0 0 1rem 0; color: white; font-size: 1rem; }
    
    .invite-row { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
    .game-input { flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.6rem; color: white; outline: none; }
    .btn-icon { width: 40px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.2rem; }

    .toggle-row { display: flex; align-items: center; gap: 0.8rem; color: #cbd5e1; font-size: 0.9rem; }
    /* Switch CSS simple */
    .switch { position: relative; display: inline-block; width: 40px; height: 20px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #475569; transition: .4s; border-radius: 34px; }
    .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: var(--primary); }
    input:checked + .slider:before { transform: translateX(20px); }

    /* Lobby Actions */
    .lobby-actions {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);
    }
    .btn-cancel-large { background: none; border: 1px solid rgba(255,255,255,0.2); color: #cbd5e1; padding: 0.8rem 1.5rem; border-radius: 12px; cursor: pointer; }
    .btn-start { background: linear-gradient(135deg, var(--success), #059669); color: white; border: none; padding: 0.8rem 2.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4); }
    .game-preview { color: #94a3b8; font-size: 0.9rem; }
    .game-preview strong { color: white; }

    @media (max-width: 700px) {
      .lobby-actions { flex-direction: column; gap: 1rem; text-align: center; }
      .players-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class VersusHubComponent {
  games: VersusGameDefinition[] = [
    { id: 'chiffres', label: 'Chiffres', description: 'Séquences numériques', route: '/chiffres-normal' },
    { id: 'cartes1', label: 'Cartes (1 paquet)', description: '52 Cartes', route: '/cartes1-normal' },
    { id: 'cartes4', label: 'Cartes (4 paquets)', description: 'Endurance', route: '/cartes4-normal' },
    { id: 'dates', label: 'Dates', description: 'Chronologie', route: '/dates-normal' },
  ];

  versusMode: VersusMode = 'none';
  selectedGame: VersusGameDefinition | null = null;
  lobby: VersusLobby | null = null;
  isSearching = false;
  friendPseudo = '';

  constructor(private router: Router) {}

  // --- Helpers pour l'UI ---
  get emptySlots(): number[] {
    if (!this.lobby) return [];
    return Array(this.lobby.maxPlayers - this.lobby.players.length).fill(0);
  }

  // --- Match rapide ---
  startQuickMatch(): void {
    this.versusMode = 'quick';
    this.isSearching = true;

    // Simulation d'attente réseau
    setTimeout(() => {
      const game = this.getRandomGame();
      this.selectedGame = game;
      this.lobby = this.buildDemoLobby(false);
      this.isSearching = false;
    }, 2000);
  }

  // --- Salon privé ---
  startFriendsLobby(): void {
    this.versusMode = 'friends';
    this.selectedGame = null;
    this.friendPseudo = '';

    this.lobby = {
      id: this.generateRoomCode(),
      maxPlayers: 5,
      isPrivate: true,
      fillWithCommunity: false,
      players: [
        { id: 'you', pseudo: 'Vous', isYou: true, isFriend: true, isReady: true }
      ]
    };
  }

  addFriend(): void {
    if (!this.lobby) return;
    const pseudo = this.friendPseudo.trim();
    if (!pseudo) return;
    if (this.lobby.players.length >= this.lobby.maxPlayers) return;

    this.lobby.players.push({
      id: 'friend-' + (this.lobby.players.length + 1),
      pseudo,
      isYou: false,
      isFriend: true,
      isReady: false // Les amis invités ne sont pas prêts par défaut (simu)
    });
    this.friendPseudo = '';
  }

  launchFromFriendsLobby(): void {
    if (!this.lobby) return;
    this.selectedGame = this.getRandomGame();
    this.goToGame();
  }

  goToGame(): void {
    if (!this.selectedGame) return;
    this.router.navigate([this.selectedGame.route], {
      queryParams: {
        versus: '1',
        roomId: this.lobby?.id ?? undefined
      }
    });
  }

  resetMode(): void {
    this.versusMode = 'none';
    this.selectedGame = null;
    this.lobby = null;
    this.isSearching = false;
    this.friendPseudo = '';
  }

  // --- Utils ---
  private getRandomGame(): VersusGameDefinition {
    const idx = Math.floor(Math.random() * this.games.length);
    return this.games[idx];
  }

  private generateRoomCode(): string {
    return 'VS-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  }

  private buildDemoLobby(isPrivate: boolean): VersusLobby {
    const maxPlayers = 5;
    const pseudoPool = ['NeuroFalcon', 'MnemoFox', 'Orus_Alpha', 'CardRunner'];
    const players: VersusLobbyPlayer[] = [];

    players.push({ id: 'you', pseudo: 'Vous', isYou: true, isFriend: false, isReady: true });

    // Remplissage avec des bots pour la démo
    for (let i = 0; i < 3; i++) {
      players.push({
        id: 'p' + i,
        pseudo: pseudoPool[i],
        isYou: false,
        isFriend: false,
        isReady: true
      });
    }

    return {
      id: this.generateRoomCode(),
      maxPlayers,
      isPrivate,
      fillWithCommunity: !isPrivate,
      players,
    };
  }
}