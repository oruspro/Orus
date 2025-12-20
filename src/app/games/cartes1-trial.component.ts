import { Component, OnDestroy, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgFor, NgClass, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService } from '../service/stats.service';

type Phase = 'pre' | 'mem' | 'recap' | 'result';

interface Card {
  code: string;   // ex: "kh", "9s"
  label: string;  // ex: "K♥", "9♠"
  rank: string;   // "K", "9"
  suit: string;   // "♥", "♠"
  suitName: 'heart'|'spade'|'diamond'|'club';
}

// Clés pour le suivi
const GAMES_PLAYED_KEY = 'orus_games_played_v1';
const OFFER_SEEN_KEY = 'orus_offer_seen_v1';

function generateDeck52(): Card[] {
  const suits = [
    { code: 'h', symbol: '♥', name: 'heart' as const },
    { code: 's', symbol: '♠', name: 'spade' as const },
    { code: 'd', symbol: '♦', name: 'diamond' as const },
    { code: 'c', symbol: '♣', name: 'club' as const },
  ];
  const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

  const deck: Card[] = [];
  for (const s of suits) {
    for (const r of ranks) {
      const code = (r === '10' ? 't' : r.toLowerCase()); // 10 = t
      deck.push({ 
        code: code + s.code, 
        label: `${r}${s.symbol}`,
        rank: r,
        suit: s.symbol,
        suitName: s.name
      });
    }
  }

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

@Component({
  selector: 'app-cartes1-trial',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, DecimalPipe],
  template: `
    <div class="page-container">
      
      <!-- HEADER -->
      <header class="header">
        <button class="back-link" (click)="goBack()">
          <span class="icon">←</span> Quitter l'épreuve
        </button>
        <div class="header-content">
          <h1 class="page-title">
            Speed Cards <span class="text-gradient">52</span>
            <span *ngIf="ranked" class="badge-ranked">Classé</span>
          </h1>
          <p class="subtitle">Mémorisez le paquet complet le plus vite possible.</p>
        </div>
      </header>

      <!-- PHASE 1 : PRÉPARATION (Countdown) -->
      <section *ngIf="phase === 'pre'" class="glass-card centered-panel">
        <div class="pre-content">
          <div class="pre-label">Lancement dans</div>
          <div class="pre-number">{{ preTimeLeft }}</div>
          <p class="pre-hint">Préparez votre palais mental...</p>
        </div>
      </section>

      <!-- PHASE 2 : MÉMORISATION -->
      <section *ngIf="phase === 'mem'" class="game-board">
        
        <!-- HUD TEMPS -->
        <div class="hud-bar glass-card">
          <div class="hud-item">
            <span class="hud-label">Chrono</span>
            <span class="hud-value" [class.warning]="timeLeft < 60">
              {{ minutes }}:{{ seconds }}
            </span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Carte</span>
            <span class="hud-value">{{ memIndex + 1 }}<span class="total">/52</span></span>
          </div>
        </div>

        <!-- ZONE DE CARTE -->
        <div class="card-stage">
          <button class="nav-btn prev" (click)="prevMemCard()" [disabled]="memIndex === 0">←</button>
          
          <div class="card-container">
            <div class="playing-card" 
                 [ngClass]="isRedSuit(deck[memIndex]) ? 'red' : 'black'">
              
              <!-- Coins -->
              <div class="card-corner top-left">
                <div>{{ deck[memIndex].rank }}</div>
                <div>{{ deck[memIndex].suit }}</div>
              </div>
              <div class="card-corner bottom-right">
                <div>{{ deck[memIndex].rank }}</div>
                <div>{{ deck[memIndex].suit }}</div>
              </div>

              <!-- Centre -->
              <div class="card-center">
                {{ deck[memIndex].suit }}
              </div>
            </div>
            
            <div class="card-reflection"></div>
          </div>

          <button class="nav-btn next" (click)="nextMemCard()" [disabled]="memIndex === deck.length - 1">→</button>
        </div>

        <!-- NAVIGATION & ACTIONS -->
        <div class="controls glass-card">
          <p class="hint-text">Utilisez les flèches ← → du clavier</p>
          <button class="btn-primary stop-btn" (click)="toRecap()">
            ⏱️ J'ai tout mémorisé (STOP)
          </button>
        </div>

        <!-- APERÇU DECK (Scrollable) -->
        <div class="deck-strip">
          <div 
            *ngFor="let c of deck; let i = index" 
            class="mini-card"
            [class.active]="i === memIndex"
            [class.red]="isRedSuit(c)"
            (click)="memIndex = i"
          >
            {{ c.rank }}{{ c.suit }}
          </div>
        </div>
      </section>

      <!-- PHASE 3 : RESTITUTION -->
      <section *ngIf="phase === 'recap'" class="glass-card recap-panel">
        <div class="panel-header">
          <div class="step-badge">Restitution</div>
          <h3>Quelle est la carte n°{{ currentIndex + 1 }} ?</h3>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="(currentIndex / deck.length) * 100"></div>
        </div>

        <div class="input-area">
          <input
            #recapInput
            type="text"
            class="game-input"
            [(ngModel)]="answer"
            (keyup.enter)="validateCard()"
            placeholder="Ex: Kh, 10s..."
            autocomplete="off"
          />
          <button class="btn-validate" (click)="validateCard()">↵</button>
        </div>

        <div class="feedback-area">
          <div *ngIf="feedback" class="feedback-msg" [ngClass]="lastResult ? 'success' : 'error'">
            {{ feedback }}
          </div>
          <div class="legend">
            Code: <strong>h</strong>=♥, <strong>s</strong>=♠, <strong>d</strong>=♦, <strong>c</strong>=♣, <strong>t</strong>=10
          </div>
        </div>

        <div class="recap-footer">
          <button class="btn-text" (click)="finishEarly()">Abandonner / Voir résultats</button>
        </div>
      </section>

      <!-- PHASE 4 : RÉSULTAT -->
      <section *ngIf="phase === 'result'" class="glass-card result-panel">
        <div class="result-header">
          <h2>Session Terminée</h2>
          <div class="score-circle">
            <svg viewBox="0 0 36 36" class="circular-chart">
              <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="circle" 
                [attr.stroke-dasharray]="finalScore + ', 100'" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              />
            </svg>
            <div class="score-value">{{ finalScore }}<span>/100</span></div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Précision</span>
            <span class="stat-val">{{ goodCount }}/52</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Temps</span>
            <span class="stat-val">{{ memMinutes }}m {{ memSeconds }}s</span>
          </div>
        </div>

        <div *ngIf="ranked" class="rank-info">
          <span class="rank-icon">🏆</span> Résultat pris en compte pour le classement.
        </div>

        <!-- OFFRE BANNER (Apparaît parfois) -->
        <div *ngIf="showOfferSuggestion" class="offer-card">
          <div class="offer-content">
            <h4>Passez au niveau supérieur 🚀</h4>
            <p>Débloquez toutes les épreuves et soutenez Orus.</p>
          </div>
          <div class="offer-btns">
            <button class="btn-gold" (click)="goOffers()">Voir Orus+</button>
            <button class="btn-mute" (click)="dismissOffer()">Non merci</button>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn-primary" (click)="reload()">Rejouer</button>
          <button class="btn-secondary" (click)="goBack()">Retour Menu</button>
        </div>
      </section>

    </div>
  `,
  styles: [`
    :host {
      --card-width: 180px;
      --card-height: 260px;
      --primary: #6366f1;
      --glass-bg: rgba(30, 41, 59, 0.7);
      --glass-border: 1px solid rgba(255, 255, 255, 0.1);
      --success: #10b981;
      --error: #f43f5e;
      --gold: #f59e0b;
    }

    .page-container {
      max-width: 900px;
      margin: 0 auto;
      padding-bottom: 3rem;
      min-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    /* --- HEADER --- */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .back-link {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: color 0.2s;
    }
    .back-link:hover { color: white; }
    
    .header-content { text-align: right; }
    .page-title {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 800;
      line-height: 1;
    }
    .text-gradient {
      background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .badge-ranked {
      font-size: 0.7rem;
      background: rgba(245, 158, 11, 0.2);
      color: var(--gold);
      border: 1px solid rgba(245, 158, 11, 0.4);
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      vertical-align: middle;
      text-transform: uppercase;
    }
    .subtitle { margin: 0.2rem 0 0; color: #64748b; font-size: 0.9rem; }

    /* --- GLASS CARD --- */
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: var(--glass-border);
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }

    /* --- PRE PHASE --- */
    .centered-panel {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
      text-align: center;
    }
    .pre-label { color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-size: 0.9rem; }
    .pre-number { font-size: 6rem; font-weight: 800; color: white; line-height: 1; margin: 1rem 0; text-shadow: 0 0 30px rgba(99,102,241,0.5); }
    .pre-hint { color: #cbd5e1; font-style: italic; }

    /* --- MEMO PHASE --- */
    .game-board {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      align-items: center;
    }

    .hud-bar {
      display: flex;
      gap: 3rem;
      padding: 1rem 2rem;
      border-radius: 16px;
    }
    .hud-item { display: flex; flex-direction: column; align-items: center; }
    .hud-label { font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .hud-value { font-size: 1.5rem; font-weight: 700; color: white; font-variant-numeric: tabular-nums; }
    .hud-value.warning { color: var(--error); animation: pulse 1s infinite; }
    .total { font-size: 0.9rem; color: #64748b; font-weight: 400; }

    /* Card Stage */
    .card-stage {
      display: flex;
      align-items: center;
      gap: 2rem;
    }
    .nav-btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: white;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); transform: scale(1.1); }
    .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    /* REALISTIC CARD */
    .card-container { perspective: 1000px; }
    .playing-card {
      width: var(--card-width);
      height: var(--card-height);
      background: white;
      border-radius: 14px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Times New Roman', serif;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      user-select: none;
      transition: transform 0.3s ease;
    }
    .playing-card.red { color: #dc2626; }
    .playing-card.black { color: #1e293b; }
    
    .card-corner {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 1.4rem;
      font-weight: bold;
      line-height: 1;
    }
    .top-left { top: 12px; left: 12px; }
    .bottom-right { bottom: 12px; right: 12px; transform: rotate(180deg); }
    .card-center { font-size: 5rem; }

    /* Controls */
    .controls {
      text-align: center;
      padding: 1.5rem;
      width: 100%;
      max-width: 500px;
    }
    .hint-text { color: #64748b; font-size: 0.85rem; margin-bottom: 1rem; }
    .stop-btn { width: 100%; font-size: 1.1rem; }

    /* Deck Strip */
    .deck-strip {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      width: 100%;
      padding: 1rem 0;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.1) transparent;
    }
    .mini-card {
      min-width: 40px;
      height: 56px;
      background: rgba(255,255,255,0.1);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      cursor: pointer;
      color: #cbd5e1;
      border: 1px solid transparent;
    }
    .mini-card.red { color: #fca5a5; }
    .mini-card.active {
      background: white;
      color: #1e293b !important;
      border-color: var(--primary);
      transform: translateY(-5px);
    }

    /* --- RECAP PHASE --- */
    .recap-panel { text-align: center; max-width: 600px; margin: 0 auto; }
    .panel-header { margin-bottom: 2rem; }
    .step-badge {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      display: inline-block;
      padding: 0.3rem 0.8rem;
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    
    .progress-bar {
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      margin-bottom: 2rem;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--primary);
      transition: width 0.3s ease;
    }

    .input-area {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .game-input {
      background: rgba(15, 23, 42, 0.8);
      border: 2px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 0.8rem 1rem;
      font-size: 1.5rem;
      color: white;
      width: 180px;
      text-align: center;
      outline: none;
      text-transform: uppercase;
    }
    .game-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99,102,241,0.2); }
    
    .btn-validate {
      background: var(--primary);
      color: white;
      border: none;
      width: 54px;
      border-radius: 12px;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .feedback-msg { font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem; }
    .feedback-msg.success { color: var(--success); }
    .feedback-msg.error { color: var(--error); }
    .legend { font-size: 0.85rem; color: #64748b; }
    
    .btn-text { background: none; border: none; color: #64748b; text-decoration: underline; cursor: pointer; margin-top: 2rem; }
    
    /* --- RESULT PHASE --- */
    .result-panel { text-align: center; max-width: 600px; margin: 0 auto; }
    .score-circle {
      position: relative;
      width: 150px;
      height: 150px;
      margin: 2rem auto;
    }
    .circular-chart { display: block; margin: 0 auto; max-width: 100%; max-height: 250px; }
    .circle-bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 2.5; }
    .circle { fill: none; stroke: var(--primary); stroke-width: 2.5; stroke-linecap: round; animation: progress 1s ease-out forwards; }
    .score-value {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3rem;
      font-weight: 800;
      color: white;
    }
    .score-value span { font-size: 1rem; color: #64748b; font-weight: 400; }

    .stats-grid { display: flex; justify-content: center; gap: 3rem; margin-bottom: 2rem; }
    .stat-item { display: flex; flex-direction: column; }
    .stat-label { font-size: 0.8rem; text-transform: uppercase; color: #64748b; }
    .stat-val { font-size: 1.5rem; font-weight: 700; color: white; }

    .offer-card {
      background: linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.05));
      border: 1px solid rgba(245,158,11,0.3);
      border-radius: 16px;
      padding: 1.5rem;
      margin: 2rem 0;
      text-align: left;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .offer-content h4 { margin: 0 0 0.3rem 0; color: var(--gold); }
    .offer-content p { margin: 0; font-size: 0.9rem; color: #cbd5e1; }
    .btn-gold {
      background: var(--gold);
      color: #1e293b;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 99px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-mute { background: none; border: none; color: #64748b; font-size: 0.85rem; cursor: pointer; margin-left: 0.5rem; }

    .result-actions { display: flex; justify-content: center; gap: 1rem; }

    /* Common Buttons */
    .btn-primary {
      background: linear-gradient(135deg, var(--primary), #4f46e5);
      color: white;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 99px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }

    .btn-secondary {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      color: #cbd5e1;
      padding: 0.8rem 2rem;
      border-radius: 99px;
      cursor: pointer;
    }
    .btn-secondary:hover { border-color: white; color: white; }

    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    @keyframes progress { 0% { stroke-dasharray: 0, 100; } }

    @media (max-width: 600px) {
      .card-stage { flex-direction: column; gap: 1rem; }
      .offer-card { flex-direction: column; text-align: center; }
      .offer-btns { width: 100%; display: flex; justify-content: center; gap: 1rem; }
    }
  `]
})
export class Cartes1TrialComponent implements OnInit, OnDestroy {
  @ViewChild('recapInput') recapInput!: ElementRef;
  
  ranked = false;
  phase: Phase = 'pre';
  deck: Card[] = [];
  
  // Timer vars
  timeLeft = 300;
  timerId: any;
  preTimeLeft = 3;
  preTimerId: any;
  memDuration = 0;

  // Game state
  memIndex = 0;
  currentIndex = 0; // for recap
  answer = '';
  goodCount = 0;
  feedback = '';
  lastResult = false; // true = success
  finalScore = 0;

  // Offres
  showOfferSuggestion = false;
  private gameRecorded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private statsService: StatsService
  ) {}

  ngOnInit() {
    this.ranked = !!this.route.snapshot.data['ranked'];
    this.deck = generateDeck52();
    this.memIndex = 0;
    this.startPreTimer();
  }

  ngOnDestroy() {
    if (this.timerId) clearInterval(this.timerId);
    if (this.preTimerId) clearInterval(this.preTimerId);
  }

  // --- TIMERS ---

  startPreTimer() {
    this.preTimeLeft = 3;
    this.phase = 'pre';
    this.preTimerId = setInterval(() => {
      this.preTimeLeft--;
      if (this.preTimeLeft <= 0) {
        clearInterval(this.preTimerId);
        this.phase = 'mem';
        this.startTimer();
      }
    }, 1000);
  }

  startTimer() {
    this.timerId = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        clearInterval(this.timerId);
        this.toRecap();
      }
    }, 1000);
  }

  get minutes() { return Math.floor(this.timeLeft / 60); }
  get seconds() { return String(this.timeLeft % 60).padStart(2, '0'); }
  get memMinutes() { return Math.floor(this.memDuration / 60); }
  get memSeconds() { return this.memDuration % 60; }

  // --- ACTIONS MEMO ---

  prevMemCard() { if (this.memIndex > 0) this.memIndex--; }
  nextMemCard() { if (this.memIndex < this.deck.length - 1) this.memIndex++; }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.phase === 'mem') {
      if (event.key === 'ArrowRight') { this.nextMemCard(); event.preventDefault(); }
      if (event.key === 'ArrowLeft') { this.prevMemCard(); event.preventDefault(); }
    }
  }

  isRedSuit(card: Card): boolean {
    return card.suitName === 'heart' || card.suitName === 'diamond';
  }

  toRecap() {
    if (this.phase !== 'mem') return;
    this.phase = 'recap';
    if (this.timerId) clearInterval(this.timerId);
    this.memDuration = 300 - this.timeLeft;
    
    // Focus auto sur l'input après un court délai pour laisser le rendu se faire
    setTimeout(() => {
      if (this.recapInput) this.recapInput.nativeElement.focus();
    }, 100);
  }

  // --- ACTIONS RECAP ---

  validateCard() {
    if (!this.answer.trim()) return;
    
    const expected = this.deck[this.currentIndex].code;
    const guess = this.answer.trim().toLowerCase();

    if (guess === expected) {
      this.goodCount++;
      this.feedback = 'Correct !';
      this.lastResult = true;
    } else {
      this.feedback = `Raté ! C'était le ${this.deck[this.currentIndex].label} (${expected})`;
      this.lastResult = false;
    }

    this.answer = '';
    this.currentIndex++;

    if (this.currentIndex >= this.deck.length) {
      this.finishGame();
    }

    
  }

  finishEarly() {
    this.finishGame();
  }

  // --- RESULTATS ---

  finishGame() {
    this.phase = 'result';
    this.finalScore = this.computeScore();
    this.onGameFinished();
  }

  computeScore(): number {
    if (!this.deck.length) return 0;
    const accuracy = this.goodCount / this.deck.length; 
    const MAX_MEM = 300;
    const timeUsed = Math.min(Math.max(this.memDuration || MAX_MEM, 1), MAX_MEM);
    const speed = 1 - timeUsed / MAX_MEM;
    const speedFactor = 0.5 + 0.5 * speed;
    return Math.round(Math.max(0, Math.min(accuracy * 100 * speedFactor, 100)));
  }

  private onGameFinished() {
    if (this.gameRecorded) return;
    this.gameRecorded = true;

    // Modification importante : on passe le paramètre Ranked
    this.statsService.recordScore('cartes1', this.finalScore, this.ranked);

    // Offre Logic
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(GAMES_PLAYED_KEY);
      const current = raw ? Number(raw) || 0 : 0;
      const next = current + 1;
      localStorage.setItem(GAMES_PLAYED_KEY, String(next));
      const offerSeen = localStorage.getItem(OFFER_SEEN_KEY) === '1';
      
      if (next >= 2 && !offerSeen) {
        this.showOfferSuggestion = true;
      }
    }
  }

  // --- NAV ---

  reload() {
    // Astuce simple pour recharger le composant
    window.location.reload(); 
    // Ou navigation Angular : this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => this.router.navigate([this.router.url]));
  }

  goBack() {
    this.router.navigate([ this.ranked ? '/classe' : '/normal' ]);
  }

  goOffers() {
    this.markOfferSeen();
    this.router.navigate(['/offres']);
  }

  dismissOffer() {
    this.markOfferSeen();
    this.showOfferSuggestion = false;
  }

  private markOfferSeen() {
    if (typeof localStorage !== 'undefined') localStorage.setItem(OFFER_SEEN_KEY, '1');
  }
}