import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgFor, NgClass, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService } from '../service/stats.service';

function generateDigits(count: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < count; i++) {
    arr.push(Math.floor(Math.random() * 10));
  }
  return arr;
}

type Phase = 'pre' | 'mem' | 'recap' | 'result';

// Clés communes
const GAMES_PLAYED_KEY = 'orus_games_played_v1';
const OFFER_SEEN_KEY = 'orus_offer_seen_v1';

@Component({
  selector: 'app-chiffres-trial',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, DecimalPipe],
  template: `
    <div class="page-container">
      
      <!-- HEADER -->
      <header class="header">
        <button class="back-link" (click)="goBack()">
          <span class="icon">←</span> Quitter
        </button>
        <div class="header-content">
          <h1 class="page-title">
            Speed Numbers
            <span *ngIf="ranked" class="badge-ranked">Classé</span>
          </h1>
          <p class="subtitle">Mémorisez la plus longue séquence possible.</p>
        </div>
      </header>

      <!-- PHASE 1 : PRÉPARATION -->
      <section *ngIf="phase === 'pre'" class="glass-card centered-panel">
        <div class="pre-content">
          <div class="pre-label">Génération de la séquence</div>
          <div class="pre-number">{{ preTimeLeft }}</div>
          <p class="pre-hint">Choisissez votre taille de groupement...</p>
          
          <div class="group-selector-preview">
            <span>Groupes de :</span>
            <div class="toggles">
              <button [class.active]="groupSize===2" (click)="setGroupSize(2)">2</button>
              <button [class.active]="groupSize===3" (click)="setGroupSize(3)">3</button>
              <button [class.active]="groupSize===4" (click)="setGroupSize(4)">4</button>
            </div>
          </div>
        </div>
      </section>

      <!-- PHASE 2 : MÉMORISATION -->
      <section *ngIf="phase === 'mem'" class="game-board">
        
        <!-- HUD TEMPS & OPTIONS -->
        <div class="hud-bar glass-card">
          <div class="hud-item">
            <span class="hud-label">Temps</span>
            <span class="hud-value" [class.warning]="timeLeft < 60">
              {{ minutes }}:{{ seconds }}
            </span>
          </div>
          
          <div class="hud-divider"></div>

          <div class="hud-item group-control">
            <span class="hud-label">Chunking</span>
            <div class="toggles small">
              <button [class.active]="groupSize===2" (click)="setGroupSize(2)">2</button>
              <button [class.active]="groupSize===3" (click)="setGroupSize(3)">3</button>
              <button [class.active]="groupSize===4" (click)="setGroupSize(4)">4</button>
            </div>
          </div>
        </div>

        <!-- ZONE FOCUS (GROUPE ACTUEL) -->
        <div class="focus-stage">
          <button class="nav-btn prev" (click)="prevGroup()" [disabled]="currentGroupIndex === 0">←</button>
          
          <div class="digit-card">
            <div class="digit-value">{{ groupStrings[currentGroupIndex] }}</div>
            <div class="digit-meta">Groupe {{ currentGroupIndex + 1 }} / {{ groupStrings.length }}</div>
          </div>

          <button class="nav-btn next" (click)="nextGroup()" [disabled]="currentGroupIndex === groupStrings.length - 1">→</button>
        </div>

        <!-- SÉQUENCE COMPLÈTE (SCROLLABLE) -->
        <div class="full-sequence glass-card">
          <div class="sequence-track">
            <span 
              *ngFor="let g of groupStrings; let i = index" 
              class="seq-group"
              [class.active]="i === currentGroupIndex"
              (click)="currentGroupIndex = i"
            >
              {{ g }}
            </span>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="controls glass-card">
          <p class="hint-text">Utilisez les flèches ← → du clavier pour naviguer</p>
          <button class="btn-primary stop-btn" (click)="toRecap()">
            ⏱️ J'ai terminé la mémorisation
          </button>
        </div>
      </section>

      <!-- PHASE 3 : RESTITUTION -->
      <section *ngIf="phase === 'recap'" class="glass-card recap-panel">
        <div class="panel-header">
          <div class="step-badge">Restitution</div>
          <h3>Rappelez la séquence</h3>
        </div>

        <p class="instruction">
          Tapez les chiffres dans l'ordre. Les espaces ne comptent pas.
        </p>

        <textarea
          class="recap-area"
          [(ngModel)]="answer"
          rows="6"
          placeholder="Ex: 145 902 381..."
          spellcheck="false"
        ></textarea>

        <div class="recap-footer">
          <button class="btn-primary btn-validate" (click)="validate()">
            Valider ma réponse
          </button>
        </div>
      </section>

      <!-- PHASE 4 : RÉSULTAT -->
      <section *ngIf="phase === 'result'" class="glass-card result-panel">
        <div class="result-header">
          <h2>Analyse Terminée</h2>
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
            <span class="stat-label">Corrects (Suite)</span>
            <span class="stat-val highlight">{{ score }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Temps</span>
            <span class="stat-val">{{ memMinutes }}m {{ memSeconds }}s</span>
          </div>
        </div>

        <div *ngIf="ranked" class="rank-info">
          <span class="rank-icon">🏆</span> Résultat pris en compte pour le classement.
        </div>

        <!-- OFFRE BANNER -->
        <div *ngIf="showOffersCTA" class="offer-card">
          <div class="offer-content">
            <h4>Passez au niveau supérieur 🚀</h4>
            <p>Débloquez plus de chiffres et soutenez Orus.</p>
          </div>
          <div class="offer-btns">
            <button class="btn-gold" (click)="goOffers()">Voir Orus+</button>
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
      --primary: #6366f1;
      --glass-bg: rgba(30, 41, 59, 0.7);
      --glass-border: 1px solid rgba(255, 255, 255, 0.1);
      --success: #10b981;
      --gold: #f59e0b;
    }

    .page-container {
      max-width: 800px;
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
    .page-title { margin: 0; font-size: 1.8rem; font-weight: 800; line-height: 1; }
    .badge-ranked {
      font-size: 0.7rem;
      background: rgba(245, 158, 11, 0.2);
      color: var(--gold);
      border: 1px solid rgba(245, 158, 11, 0.4);
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      vertical-align: middle;
      text-transform: uppercase;
      margin-left: 0.5rem;
    }
    .subtitle { margin: 0.2rem 0 0; color: #64748b; font-size: 0.9rem; }

    /* --- GLASS CARD --- */
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: var(--glass-border);
      border-radius: 24px;
      padding: 1.5rem;
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
    .pre-hint { color: #cbd5e1; font-style: italic; margin-bottom: 2rem; }

    .group-selector-preview {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: center;
      color: #94a3b8;
      font-size: 0.9rem;
    }

    /* --- MEMO PHASE --- */
    .game-board {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      align-items: center;
    }

    /* HUD */
    .hud-bar {
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 100%;
      padding: 1rem;
    }
    .hud-item { display: flex; flex-direction: column; align-items: center; }
    .hud-label { font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 0.2rem; }
    .hud-value { font-size: 1.5rem; font-weight: 700; color: white; font-variant-numeric: tabular-nums; }
    .hud-value.warning { color: #f43f5e; animation: pulse 1s infinite; }
    .hud-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.1); }

    /* Toggles */
    .toggles {
      display: flex;
      background: rgba(0,0,0,0.3);
      padding: 0.3rem;
      border-radius: 99px;
      gap: 0.2rem;
    }
    .toggles button {
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 0.4rem 0.8rem;
      border-radius: 99px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .toggles button:hover { color: white; }
    .toggles button.active {
      background: var(--primary);
      color: white;
      box-shadow: 0 2px 10px rgba(99, 102, 241, 0.4);
    }
    .toggles.small button { padding: 0.2rem 0.6rem; font-size: 0.85rem; }

    /* Focus Stage */
    .focus-stage {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      width: 100%;
      margin: 1rem 0;
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

    .digit-card {
      background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      padding: 2rem 3rem;
      text-align: center;
      min-width: 200px;
      box-shadow: 0 15px 30px rgba(0,0,0,0.3);
    }
    .digit-value {
      font-size: 4rem;
      font-weight: 800;
      color: white;
      letter-spacing: 4px;
      font-family: 'JetBrains Mono', monospace;
      text-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
    }
    .digit-meta {
      margin-top: 1rem;
      color: #64748b;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Full Sequence */
    .full-sequence {
      width: 100%;
      padding: 1rem;
      overflow-x: auto;
    }
    .sequence-track {
      display: flex;
      flex-wrap: wrap;
      gap: 0.8rem;
      justify-content: center;
    }
    .seq-group {
      font-family: 'JetBrains Mono', monospace;
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
      background: rgba(255,255,255,0.05);
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 1rem;
    }
    .seq-group:hover { background: rgba(255,255,255,0.1); }
    .seq-group.active {
      background: rgba(99, 102, 241, 0.2);
      color: white;
      border: 1px solid var(--primary);
    }

    /* Controls */
    .controls { width: 100%; text-align: center; }
    .hint-text { color: #64748b; font-size: 0.85rem; margin-bottom: 1rem; }
    .stop-btn { width: 100%; padding: 0.8rem; font-size: 1rem; font-weight: 600; border-radius: 12px; }

    /* --- RECAP PHASE --- */
    .recap-panel { max-width: 600px; margin: 0 auto; text-align: center; }
    .panel-header { margin-bottom: 1.5rem; }
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
    .instruction { color: #cbd5e1; margin-bottom: 1.5rem; }
    .recap-area {
      width: 100%;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1rem;
      color: white;
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.2rem;
      letter-spacing: 2px;
      outline: none;
      resize: vertical;
      margin-bottom: 1.5rem;
    }
    .recap-area:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); }
    .btn-validate { width: 100%; padding: 0.8rem; font-size: 1rem; }

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
    .stat-val.highlight { color: #10b981; }

    /* Offer Card */
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
      padding: 0.5rem 1.2rem;
      border-radius: 99px;
      font-weight: 700;
      cursor: pointer;
    }

    .result-actions { display: flex; justify-content: center; gap: 1rem; }

    /* Common Buttons */
    .btn-primary {
      background: linear-gradient(135deg, var(--primary), #4f46e5);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(99,102,241,0.4); }

    .btn-secondary {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      color: #cbd5e1;
      padding: 0.8rem 2rem;
      border-radius: 12px;
      cursor: pointer;
    }
    .btn-secondary:hover { border-color: white; color: white; }

    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    @keyframes progress { 0% { stroke-dasharray: 0, 100; } }

    @media (max-width: 600px) {
      .focus-stage { flex-direction: column; gap: 1rem; }
      .digit-card { min-width: 100%; padding: 1.5rem; }
      .offer-card { flex-direction: column; text-align: center; }
    }
  `]
})
export class ChiffresTrialComponent implements OnInit, OnDestroy {
  ranked = false;
  phase: Phase = 'pre';

  digits: number[] = [];
  groupSize: 2 | 3 | 4 = 3;

  timeLeft = 300;          // 5 minutes
  timerId: any;
  preTimeLeft = 3;
  preTimerId: any;

  answer = '';
  score = 0;               // nb de chiffres corrects d'affilée
  finalScore = 0;          // Score Orus 0-100

  groupStrings: string[] = [];
  currentGroupIndex = 0;

  showOffersCTA = false;

  memDuration = 0;         // temps de mémo en secondes
  private gameRecorded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private statsService: StatsService
  ) {}

  ngOnInit() {
    this.ranked = !!this.route.snapshot.data['ranked'];
    this.digits = generateDigits(300); // Génère 300 chiffres
    this.buildGroups();
    this.startPreTimer();
  }

  ngOnDestroy() {
    if (this.timerId) clearInterval(this.timerId);
    if (this.preTimerId) clearInterval(this.preTimerId);
  }

  // --- TIMER ---

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

  // --- LOGIC CHUNKING ---

  buildGroups() {
    const groups: string[] = [];
    for (let i = 0; i < this.digits.length; i += this.groupSize) {
      groups.push(this.digits.slice(i, i + this.groupSize).join(''));
    }
    this.groupStrings = groups;
    // Ajuster l'index si on change de taille en cours de route
    if (this.currentGroupIndex >= this.groupStrings.length) {
      this.currentGroupIndex = Math.max(0, this.groupStrings.length - 1);
    }
  }

  setGroupSize(size: 2 | 3 | 4) {
    // Calcul de l'index approximatif pour rester au même endroit
    const currentDigitIndex = this.currentGroupIndex * this.groupSize;
    this.groupSize = size;
    this.buildGroups();
    this.currentGroupIndex = Math.floor(currentDigitIndex / size);
  }

  prevGroup() { if (this.currentGroupIndex > 0) this.currentGroupIndex--; }
  nextGroup() { if (this.currentGroupIndex < this.groupStrings.length - 1) this.currentGroupIndex++; }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.phase === 'mem') {
      if (event.key === 'ArrowRight') { this.nextGroup(); event.preventDefault(); }
      if (event.key === 'ArrowLeft') { this.prevGroup(); event.preventDefault(); }
    }
  }

  // --- TRANSITIONS ---

  toRecap() {
    if (this.phase !== 'mem') return;
    this.phase = 'recap';
    if (this.timerId) clearInterval(this.timerId);
    const MAX_MEM = 300;
    this.memDuration = MAX_MEM - this.timeLeft;
  }

  validate() {
    const cleaned = this.answer.replace(/\s+/g, '');
    let correct = 0;
    for (let i = 0; i < cleaned.length && i < this.digits.length; i++) {
      if (cleaned[i] === String(this.digits[i])) correct++;
      else break;
    }
    this.score = correct;
    this.finishGame();
  }

  finishGame() {
    this.phase = 'result';
    this.finalScore = this.computeScore();
    this.handleGameFinished();
  }

  computeScore(): number {
    if (!this.digits.length) return 0;
    // Score basé sur la longueur de la suite correcte par rapport à un objectif arbitraire (ex: 100 chiffres = 100%)
    // Pour l'instant, on reste sur une logique simple
    const accuracy = Math.min(this.score / 50, 1); // Disons que 50 chiffres c'est le top pour un débutant
    
    const MAX_MEM = 300;
    const timeUsed = Math.min(Math.max(this.memDuration || MAX_MEM, 1), MAX_MEM);
    const speed = 1 - timeUsed / MAX_MEM;
    const speedFactor = 0.5 + 0.5 * speed; // Bonus de vitesse

    return Math.round(Math.max(0, Math.min(accuracy * 100 * speedFactor * 2, 100))); // *2 pour booster le score débutant
  }

  private handleGameFinished(): void {
    if (this.gameRecorded) return;
    this.gameRecorded = true;

    this.statsService.recordScore('chiffres', this.finalScore, this.ranked);

    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(GAMES_PLAYED_KEY) ?? '0';
      const current = parseInt(raw, 10) || 0;
      const next = current + 1;
      localStorage.setItem(GAMES_PLAYED_KEY, String(next));
      const offerSeen = localStorage.getItem(OFFER_SEEN_KEY) === '1';
      
      if (next >= 2 && !offerSeen) {
        this.showOffersCTA = true;
      }
    }
  }

  // --- NAVIGATION ---

  reload() { window.location.reload(); }
  
  goOffers() {
    this.markOfferSeen();
    this.router.navigate(['/offres']);
  }

  private markOfferSeen() {
    if (typeof localStorage !== 'undefined') localStorage.setItem(OFFER_SEEN_KEY, '1');
  }

  goBack() {
    this.router.navigate([ this.ranked ? '/classe' : '/normal' ]);
  }
}