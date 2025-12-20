import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { NgIf, NgFor, NgClass, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

type Phase = 'config' | 'memo' | 'recall';

interface CardView {
  num: number;          // 1–52
  position: number;     // 1–N dans l'exercice
  rank: string;
  suitName: string;
  suitSymbol: string;
  color: 'red' | 'black';
  label: string;
  shortLabel: string;
  normalizedShort: string;
  unicode: string;
}

@Component({
  selector: 'app-cartes-loci-entrainement',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, RouterLink, FormsModule, DecimalPipe],
  template: `
    <div class="page-container">
      
      <!-- HEADER -->
      <header class="header">
        <a routerLink="/cours" class="back-link">
          <span class="icon">←</span> Retour au QG
        </a>
        <h1 class="page-title">Entraînement <span class="text-gradient">Cartes & Loci</span></h1>
        <p class="subtitle">
          Synchronisez votre <strong>Palais Mental</strong> avec le jeu de 52 cartes.
        </p>
      </header>

      <!-- 1. CONFIGURATION -->
      <section class="glass-card config-panel" *ngIf="phase === 'config'">
        <div class="panel-header">
          <div class="step-badge">Phase 1</div>
          <h3>Paramétrage de la session</h3>
        </div>
        
        <p class="instruction">
          Combien de loci souhaitez-vous entraîner ? Les cartes seront tirées aléatoirement.
        </p>

        <div class="difficulty-grid">
          <button
            *ngFor="let len of lengths"
            class="difficulty-btn"
            [ngClass]="{ 'active': len === selectedLength }"
            (click)="selectLength(len)"
          >
            <span class="diff-val">{{ len }}</span>
            <span class="diff-label">Cartes</span>
          </button>
        </div>

        <div class="action-area">
          <button class="btn-primary start-btn" (click)="startExercise()">
            Lancer la séquence
          </button>
          <p class="info-text">
            Objectif : 1 carte = 1 locus. Visualisez l'interaction.
          </p>
        </div>
      </section>

      <!-- 2. MÉMORISATION -->
      <section class="memo-container" *ngIf="phase === 'memo' && cards.length">
        
        <!-- BARRE DE NAVIGATION -->
        <div class="nav-bar glass-card">
          <button class="nav-btn" (click)="prevCard()">←</button>
          
          <div class="progress-info">
            <span class="locus-label">Locus N°</span>
            <span class="locus-val">{{ currentCard?.position }}</span>
            <span class="progress-total">sur {{ cards.length }}</span>
          </div>

          <button class="nav-btn" (click)="nextCard()">→</button>
        </div>

        <!-- ZONE CENTRALE (CARTE) -->
        <div class="card-stage" *ngIf="currentCard">
          
          <!-- LA CARTE PHYSIQUE -->
          <div class="playing-card" [ngClass]="currentCard.color">
            <div class="card-corner top-left">
              <div>{{ getRankShort(currentCard.rank) }}</div>
              <div>{{ currentCard.suitSymbol }}</div>
            </div>
            <div class="card-center">
              {{ currentCard.suitSymbol }}
            </div>
            <div class="card-corner bottom-right">
              <div>{{ getRankShort(currentCard.rank) }}</div>
              <div>{{ currentCard.suitSymbol }}</div>
            </div>
          </div>

          <!-- INFO CONTEXTUELLE -->
          <div class="context-box">
            <div class="context-title">{{ currentCard.label }}</div>
            <p class="context-hint">
              Placez cette carte sur votre locus <strong>n°{{ currentCard.position }}</strong>.
              <br><span class="faded">Créez une image mentale vivante.</span>
            </p>
          </div>
        </div>

        <!-- LISTE RÉCAPITULATIVE (SCROLLABLE) -->
        <div class="glass-card list-view">
          <h4>Séquence complète</h4>
          <!-- Ajout de la référence #scrollTrack -->
          <div class="scroll-track" #scrollTrack>
            <div
              class="mini-card-row"
              *ngFor="let c of cards; let i = index"
              [ngClass]="{ 'active': i === currentIndex }"
              (click)="selectCard(i)"
              [id]="'card-row-' + i"
            >
              <div class="pos-badge">{{ c.position }}</div>
              <div class="card-name" [class.red]="c.color === 'red'">{{ c.shortLabel }} {{ c.suitSymbol }}</div>
            </div>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="actions-footer">
          <button class="btn-secondary" (click)="backToConfig()">Arrêter</button>
          <button class="btn-primary" (click)="goToRecall()">Passer au test →</button>
        </div>
      </section>

      <!-- 3. RESTITUTION -->
      <section class="glass-card recall-panel" *ngIf="phase === 'recall' && currentRecallCard">
        <div class="panel-header">
          <div class="step-badge step-recall">Test</div>
          <h3>Restitution</h3>
        </div>

        <div class="recall-prompt">
          <p>Quelle carte avez-vous placée sur le locus...</p>
          <div class="big-locus-num">{{ currentRecallCard.position }}</div>
        </div>

        <!-- FORMULAIRE RÉPONSE -->
        <div class="input-zone">
          <label>Format: <code>4h</code> (4 Cœur), <code>Ks</code> (Roi Pique)...</label>
          <div class="input-wrapper">
            <input
              type="text"
              class="game-input"
              [(ngModel)]="answer"
              (keyup.enter)="checkAnswer()"
              placeholder="Votre réponse..."
              [disabled]="feedback !== null"
              #answerInput
            />
            <button class="btn-submit-icon" (click)="checkAnswer()" *ngIf="feedback === null">↵</button>
          </div>
        </div>

        <!-- FEEDBACK ZONE -->
        <div class="feedback-zone" *ngIf="feedback !== null" [ngClass]="{ 'success': isCorrect, 'error': !isCorrect }">
          <div class="feedback-icon">{{ isCorrect ? '✓' : '✕' }}</div>
          <div class="feedback-content">
            <div class="feedback-msg">{{ feedback }}</div>
            <div class="feedback-detail">
              C'était le <strong>{{ currentRecallCard.shortLabel }}</strong> ({{ getAnswerCode(currentRecallCard) }})
            </div>
          </div>
          <button class="btn-next" (click)="nextRecall()">Suivant →</button>
        </div>

        <!-- NAVIGATION SECONDAIRE -->
        <div class="recall-nav" *ngIf="feedback === null">
          <button class="btn-text" (click)="prevRecall()">← Précédent</button>
          <button class="btn-text" (click)="nextRecall()">Passer</button>
        </div>

        <div class="actions-footer">
           <button class="btn-secondary" (click)="backToMemo()">Revoir la mémorisation</button>
        </div>
      </section>

    </div>
  `,
  styles: [`
    :host {
      --card-width: 160px;
      --card-height: 240px;
      --primary: #6366f1;
      --success: #10b981;
      --error: #f43f5e;
      --glass-bg: rgba(30, 41, 59, 0.7);
      --glass-border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .page-container {
      max-width: 800px;
      margin: 0 auto;
      padding-bottom: 4rem;
    }

    /* --- HEADER --- */
    .header { margin-bottom: 2rem; }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      transition: color 0.2s;
    }
    .back-link:hover { color: white; }
    .page-title { font-size: 2.2rem; margin: 0 0 0.5rem 0; line-height: 1.2; }
    .text-gradient {
      background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { color: #cbd5e1; font-size: 1rem; max-width: 500px; }

    /* --- GLASS CARD GENERIC --- */
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: var(--glass-border);
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }
    
    .panel-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .step-badge {
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      padding: 0.3rem 0.8rem;
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .step-recall { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .panel-header h3 { margin: 0; font-size: 1.25rem; }

    /* --- CONFIG PHASE --- */
    .instruction { color: #cbd5e1; margin-bottom: 1.5rem; }
    .difficulty-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .difficulty-btn {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s;
      color: #94a3b8;
    }
    .difficulty-btn:hover { background: rgba(255,255,255,0.05); }
    .difficulty-btn.active {
      background: rgba(99, 102, 241, 0.2);
      border-color: var(--primary);
      color: white;
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
    }
    .diff-val { font-size: 1.5rem; font-weight: 800; }
    .diff-label { font-size: 0.75rem; text-transform: uppercase; }

    .action-area { text-align: center; }
    .info-text { font-size: 0.85rem; color: #64748b; margin-top: 1rem; }

    /* --- MEMO PHASE --- */
    .memo-container { display: flex; flex-direction: column; gap: 1.5rem; }
    
    /* Nav Bar */
    .nav-bar {
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nav-btn {
      background: rgba(255,255,255,0.1);
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .nav-btn:hover { background: rgba(255,255,255,0.2); }
    
    .progress-info { display: flex; flex-direction: column; align-items: center; }
    .locus-label { font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; }
    .locus-val { font-size: 1.5rem; font-weight: 800; color: white; }
    .progress-total { font-size: 0.8rem; color: #64748b; }

    /* Card Stage */
    .card-stage {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      padding: 1rem 0;
    }

    /* REALISTIC PLAYING CARD CSS */
    .playing-card {
      width: var(--card-width);
      height: var(--card-height);
      background: white;
      border-radius: 12px;
      position: relative;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Times New Roman', serif;
      user-select: none;
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .playing-card.red { color: #ef4444; }
    .playing-card.black { color: #1e293b; }
    
    .card-corner {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-weight: bold;
      font-size: 1.2rem;
      line-height: 1;
    }
    .top-left { top: 10px; left: 10px; }
    .bottom-right { bottom: 10px; right: 10px; transform: rotate(180deg); }
    
    .card-center { font-size: 4rem; }

    /* Context */
    .context-box { text-align: center; }
    .context-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
    .context-hint { color: #cbd5e1; line-height: 1.5; }
    .faded { color: #64748b; font-size: 0.9rem; }

    /* List View */
    .list-view { padding: 1.5rem; max-height: 200px; display: flex; flex-direction: column; }
    .list-view h4 { margin: 0 0 1rem 0; font-size: 0.9rem; color: #94a3b8; text-transform: uppercase; }
    .scroll-track { overflow-y: auto; flex: 1; padding-right: 0.5rem; scroll-behavior: smooth; }
    
    .mini-card-row {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      cursor: pointer;
      transition: background 0.2s;
    }
    .mini-card-row:hover { background: rgba(255,255,255,0.05); }
    .mini-card-row.active { background: rgba(99, 102, 241, 0.2); border-left: 3px solid var(--primary); }
    .pos-badge { 
      background: rgba(15,23,42,0.8); 
      color: #94a3b8; 
      width: 24px; 
      height: 24px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 0.75rem;
      margin-right: 0.8rem;
    }
    .card-name { font-weight: 500; font-size: 0.9rem; }
    .card-name.red { color: #fca5a5; }

    /* --- RECALL PHASE --- */
    .recall-panel { text-align: center; }
    .recall-prompt p { color: #94a3b8; margin: 0; }
    .big-locus-num { font-size: 4rem; font-weight: 800; color: white; line-height: 1; margin: 0.5rem 0 1.5rem; text-shadow: 0 0 20px rgba(99,102,241,0.5); }
    
    .input-zone { margin-bottom: 2rem; }
    .input-zone label { display: block; font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem; }
    .input-wrapper { display: flex; gap: 0.5rem; justify-content: center; }
    
    .game-input {
      background: rgba(15, 23, 42, 0.8);
      border: 2px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 0.8rem 1rem;
      font-size: 1.2rem;
      color: white;
      text-align: center;
      width: 150px;
      outline: none;
      text-transform: uppercase;
      transition: all 0.2s;
    }
    .game-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2); }
    
    .btn-submit-icon {
      background: var(--primary);
      border: none;
      width: 46px;
      border-radius: 12px;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
    }

    /* Feedback */
    .feedback-zone {
      background: rgba(0,0,0,0.3);
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      text-align: left;
      margin-bottom: 2rem;
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .feedback-zone.success { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); }
    .feedback-zone.error { background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); }
    
    .feedback-icon {
      width: 40px; height: 40px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; font-size: 1.2rem;
    }
    .success .feedback-icon { background: var(--success); color: white; }
    .error .feedback-icon { background: var(--error); color: white; }
    
    .feedback-msg { font-weight: 700; margin-bottom: 0.2rem; }
    .feedback-detail { font-size: 0.85rem; opacity: 0.8; }
    
    .btn-next {
      margin-left: auto;
      background: white;
      color: #0f172a;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }

    .recall-nav { display: flex; justify-content: space-between; margin-bottom: 2rem; }
    .btn-text { background: none; border: none; color: #64748b; cursor: pointer; text-decoration: underline; }
    .btn-text:hover { color: white; }

    /* --- COMMON BUTTONS --- */
    .btn-primary {
      background: linear-gradient(135deg, var(--primary), #4f46e5);
      color: white;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 99px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
    
    .btn-secondary {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      color: #cbd5e1;
      padding: 0.7rem 1.5rem;
      border-radius: 99px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover { border-color: white; color: white; }
    
    .actions-footer { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }

    @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    /* Scrollbar custom */
    .scroll-track::-webkit-scrollbar { width: 4px; }
    .scroll-track::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    @media (min-width: 600px) {
      .card-stage { flex-direction: row; justify-content: center; gap: 3rem; }
      .context-box { text-align: left; }
    }
  `]
})
export class CartesLociEntrainementComponent implements OnInit {
  @ViewChild('scrollTrack') scrollTrack!: ElementRef;
  
  phase: Phase = 'config';

  lengths = [20, 30, 40, 52];
  selectedLength = 20;

  cards: CardView[] = [];        // ordre de mémorisation
  recallOrder: CardView[] = [];  // ordre aléatoire de restitution

  // Mémorisation
  currentIndex = 0;

  // Restitution
  recallIndex = 0;
  answer = '';
  feedback: string | null = null;
  isCorrect: boolean | null = null;

  // Unicode decks
  private readonly UNICODE_SPADES = ['🂡','🂢','🂣','🂤','🂥','🂦','🂧','🂨','🂩','🂪','🂫','🂭','🂮'];
  private readonly UNICODE_HEARTS = ['🂱','🂲','🂳','🂴','🂵','🂶','🂷','🂸','🂹','🂺','🂻','🂽','🂾'];
  private readonly UNICODE_DIAMONDS = ['🃁','🃂','🃃','🃄','🃅','🃆','🃇','🃈','🃉','🃊','🃋','🃍','🃎'];
  private readonly UNICODE_CLUBS = ['🃑','🃒','🃓','🃔','🃕','🃖','🃗','🃘','🃙','🃚','🃛','🃝','🃞'];

  get currentCard(): CardView | null {
    return this.cards.length ? this.cards[this.currentIndex] : null;
  }

  get currentRecallCard(): CardView | null {
    return this.recallOrder.length ? this.recallOrder[this.recallIndex] : null;
  }

  ngOnInit(): void {}

  @HostListener('window:keydown', ['$event'])
  handleKeyboardNav(event: KeyboardEvent) {
    if (this.phase !== 'memo') return;

    if (event.key === 'ArrowRight') {
      this.nextCard();
    } else if (event.key === 'ArrowLeft') {
      this.prevCard();
    }
  }

  /* ---------- PHASE CONFIG ---------- */

  selectLength(len: number): void {
    this.selectedLength = len;
  }

  startExercise(): void {
    this.generateSequence();
    this.phase = 'memo';
    this.scrollToActive();
  }

  backToConfig(): void {
    this.phase = 'config';
    this.resetState();
  }

  private resetState() {
    this.cards = [];
    this.recallOrder = [];
    this.currentIndex = 0;
    this.recallIndex = 0;
    this.answer = '';
    this.feedback = null;
    this.isCorrect = null;
  }

  /* ---------- PHASE MÉMO ---------- */

  private generateSequence(): void {
    const base: number[] = Array.from({ length: 52 }, (_, i) => i + 1);
    this.shuffle(base);

    const selected = base.slice(0, this.selectedLength);
    this.cards = selected.map((num, idx) => this.buildCardView(num, idx + 1));
    this.currentIndex = 0;

    this.recallOrder = [];
    this.recallIndex = 0;
    this.answer = '';
    this.feedback = null;
    this.isCorrect = null;
  }

  prevCard(): void {
    if (!this.cards.length) return;
    if (this.currentIndex === 0) {
      this.currentIndex = this.cards.length - 1;
    } else {
      this.currentIndex--;
    }
    this.scrollToActive();
  }

  nextCard(): void {
    if (!this.cards.length) return;
    if (this.currentIndex === this.cards.length - 1) {
      this.currentIndex = 0;
    } else {
      this.currentIndex++;
    }
    this.scrollToActive();
  }
  
  selectCard(index: number) {
    this.currentIndex = index;
    this.scrollToActive();
  }

  /**
   * Scrolle la liste pour garder la carte active visible.
   */
  private scrollToActive() {
    setTimeout(() => {
      if (!this.scrollTrack) return;
      const container = this.scrollTrack.nativeElement;
      const activeEl = container.querySelector('#card-row-' + this.currentIndex);
      
      if (activeEl) {
        // block: 'nearest' permet de ne scroller que si nécessaire
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0); // Timeout pour laisser Angular mettre à jour le DOM
  }

  goToRecall(): void {
    if (!this.cards.length) return;
    this.phase = 'recall';

    this.recallOrder = [...this.cards];
    this.shuffle(this.recallOrder);

    this.recallIndex = 0;
    this.answer = '';
    this.feedback = null;
    this.isCorrect = null;
  }

  backToMemo(): void {
    this.phase = 'memo';
    this.feedback = null;
    this.isCorrect = null;
    this.scrollToActive();
  }

  /* ---------- PHASE RESTITUTION ---------- */

  checkAnswer(): void {
    const card = this.currentRecallCard;
    if (!card || this.feedback !== null) return; // Empêche double validation

    const given = this.normalizeCode(this.answer);
    const expected = this.normalizeCode(this.getAnswerCode(card));

    if (!given) return;

    if (given === expected) {
      this.feedback = 'Correct !';
      this.isCorrect = true;
    } else {
      this.feedback = 'Incorrect';
      this.isCorrect = false;
    }
  }

  prevRecall(): void {
    if (!this.recallOrder.length) return;
    if (this.recallIndex === 0) {
      this.recallIndex = this.recallOrder.length - 1;
    } else {
      this.recallIndex--;
    }
    this.resetRecallStep();
  }

  nextRecall(): void {
    if (!this.recallOrder.length) return;
    if (this.recallIndex === this.recallOrder.length - 1) {
      this.recallIndex = 0;
    } else {
      this.recallIndex++;
    }
    this.resetRecallStep();
  }

  private resetRecallStep() {
    this.answer = '';
    this.feedback = null;
    this.isCorrect = null;
  }

  /* ---------- UTILITAIRES ---------- */

  private shuffle<T>(arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  private buildCardView(num: number, position: number): CardView {
    const suits = [
      { name: 'Cœur', symbol: '♥', color: 'red' as const },
      { name: 'Trèfle', symbol: '♣', color: 'black' as const },
      { name: 'Carreau', symbol: '♦', color: 'red' as const },
      { name: 'Pique', symbol: '♠', color: 'black' as const }
    ];
    const ranks = ['As','2','3','4','5','6','7','8','9','10','Valet','Dame','Roi'];

    const suitIndex = Math.floor((num - 1) / 13);
    const rankIndex = (num - 1) % 13;
    const suit = suits[suitIndex];
    const rank = ranks[rankIndex];

    const shortLabel = `${rank} de ${suit.name}`;
    const label = `${shortLabel} ${suit.symbol}`;
    const normalizedShort = this.normalizeForCompare(shortLabel);

    let unicode = '?';
    // Mapping unicode gardé au cas où, mais moins utilisé dans le nouveau design
    if (suit.name === 'Cœur') unicode = this.UNICODE_HEARTS[rankIndex];
    else if (suit.name === 'Trèfle') unicode = this.UNICODE_CLUBS[rankIndex];
    else if (suit.name === 'Carreau') unicode = this.UNICODE_DIAMONDS[rankIndex];
    else if (suit.name === 'Pique') unicode = this.UNICODE_SPADES[rankIndex];

    return {
      num, position, rank, suitName: suit.name, suitSymbol: suit.symbol, color: suit.color,
      label, shortLabel, normalizedShort, unicode,
    };
  }

  getRankShort(rank: string): string {
    if (rank === 'As') return 'A';
    if (rank === 'Valet') return 'J';
    if (rank === 'Dame') return 'Q';
    if (rank === 'Roi') return 'K';
    if (rank === '10') return '10';
    return rank;
  }

  getAnswerCode(card: CardView): string {
    const rankCode = this.rankToCode(card.rank);
    const suitCode = this.suitToCode(card.suitName);
    return `${rankCode}${suitCode}`;
  }

  private rankToCode(rank: string): string {
    switch (rank) {
      case 'As': return 'A';
      case 'Valet': return 'J';
      case 'Dame': return 'Q';
      case 'Roi': return 'K';
      case '10': return '10';
      default: return rank;
    }
  }

  private suitToCode(suitName: string): string {
    switch (suitName) {
      case 'Cœur': return 'h';
      case 'Pique': return 's';
      case 'Carreau': return 'd';
      case 'Trèfle': return 'c';
      default: return '?';
    }
  }

  private normalizeCode(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '');
  }

  private normalizeForCompare(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  }
}