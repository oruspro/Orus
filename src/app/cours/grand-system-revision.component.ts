import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { NgIf, NgFor, NgClass, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface PegItem {
  index: number;
  word: string;
}

type Direction = 'number-to-word' | 'word-to-number';
type Stage = 'config' | 'quiz' | 'finished';
type Mode = 'number-to-word' | 'word-to-number' | 'mixed';

const STORAGE_KEY = 'orus-peglist-v2';

@Component({
  selector: 'app-grand-system-revision',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, RouterLink, DecimalPipe],
  template: `
    <div class="page-container">
      
      <!-- HEADER -->
      <header class="header">
        <button class="back-link" routerLink="/cours">
          <span class="icon">←</span> Retour
        </button>
        <div class="header-content">
          <h1 class="page-title">
            Flashcards <span class="text-gradient">00-99</span>
          </h1>
          <p class="subtitle">
            Entraînez vos réflexes d'association pour consolider votre Grand Système.
          </p>
        </div>
      </header>

      <!-- ÉTAPE 1 : CONFIGURATION -->
      <section *ngIf="stage === 'config'" class="glass-card config-panel">
        <div class="panel-header">
          <div class="step-badge">Setup</div>
          <h3>Paramètres de la session</h3>
        </div>

        <!-- SÉLECTEUR DE MODE -->
        <div class="config-section">
          <label class="config-label">Mode de révision</label>
          <div class="mode-grid">
            <button 
              class="mode-card" 
              [class.active]="mode === 'number-to-word'"
              (click)="mode = 'number-to-word'"
            >
              <div class="mode-icon">🔢 ➔ 📝</div>
              <div class="mode-name">Nombre vers Mot</div>
            </button>
            <button 
              class="mode-card" 
              [class.active]="mode === 'word-to-number'"
              (click)="mode = 'word-to-number'"
            >
              <div class="mode-icon">📝 ➔ 🔢</div>
              <div class="mode-name">Mot vers Nombre</div>
            </button>
            <button 
              class="mode-card" 
              [class.active]="mode === 'mixed'"
              (click)="mode = 'mixed'"
            >
              <div class="mode-icon">🔀</div>
              <div class="mode-name">Mixte Aléatoire</div>
            </button>
          </div>
        </div>

        <!-- SÉLECTEUR DE QUANTITÉ -->
        <div class="config-section">
          <label class="config-label">Nombre de cartes</label>
          <div class="count-selector">
            <button class="count-btn" (click)="startQuiz(20)">20</button>
            <button class="count-btn" (click)="startQuiz(40)">40</button>
            <button class="count-btn" (click)="startQuiz(60)">60</button>
            <button class="count-btn full" (click)="startQuiz(pegList.length)">
              Tout ({{ pegList.length }})
            </button>
          </div>
        </div>

        <div class="info-box">
          <span class="icon">💡</span>
          <p>Utilisez l'éditeur du cours "Palais Mental" pour personnaliser vos mots.</p>
        </div>
      </section>

      <!-- ÉTAPE 2 : QUIZ (FLASHCARD) -->
      <section *ngIf="stage === 'quiz'" class="game-area">
        
        <!-- HUD PROGRES -->
        <div class="hud-bar glass-card">
          <button class="btn-text" (click)="resetAll()">✕ Quitter</button>
          <div class="progress-indicator">
            Carte {{ currentIndex + 1 }} <span class="total">/ {{ cards.length }}</span>
          </div>
        </div>

        <!-- FLIP CARD INTERACTIVE -->
        <div class="scene scene--card">
          <div class="card" [class.is-flipped]="answered">
            
            <!-- FACE AVANT (QUESTION) -->
            <div class="card__face card__face--front">
              <div class="card-question-label">
                {{ currentCard?.direction === 'number-to-word' ? 'Quel est le mot ?' : 'Quel est le nombre ?' }}
              </div>
              <div class="card-content-main">
                <ng-container *ngIf="currentCard?.direction === 'number-to-word'">
                  <span class="big-text">{{ formatIndex(currentCard!.peg.index) }}</span>
                </ng-container>
                <ng-container *ngIf="currentCard?.direction === 'word-to-number'">
                  <span class="big-text word">{{ currentCard!.peg.word }}</span>
                </ng-container>
              </div>
              <div class="card-hint">Tapez votre réponse ou validez</div>
            </div>

            <!-- FACE ARRIÈRE (RÉPONSE) -->
            <div class="card__face card__face--back" [class.is-correct]="currentCard?.correct" [class.is-wrong]="currentCard?.correct === false">
              <div class="card-result-icon">
                {{ currentCard?.correct ? '✓' : '✕' }}
              </div>
              <div class="card-back-label">Réponse attendue</div>
              <div class="card-back-value">
                {{ expectedAnswerFor(currentCard!) }}
              </div>
              <div class="card-user-answer" *ngIf="currentCard?.userAnswer">
                Votre réponse : <strong>{{ currentCard?.userAnswer }}</strong>
              </div>
            </div>

          </div>
        </div>

        <!-- ZONE DE SAISIE -->
        <div class="input-zone glass-card">
          <input
            type="text"
            class="game-input"
            [(ngModel)]="currentInput"
            [disabled]="answered"
            placeholder="Votre réponse..."
            autocomplete="off"
            #answerInput
          />
          
          <!-- BOUTONS AVANT RÉPONSE -->
          <div class="action-buttons" *ngIf="!answered">
            <button class="btn-primary" (click)="submitAnswer()">Valider (Entrée)</button>
            <button class="btn-secondary" (click)="skipCard()">Je ne sais pas</button>
          </div>

          <!-- BOUTONS APRÈS RÉPONSE -->
          <div class="action-buttons" *ngIf="answered">
            <div class="feedback-msg" [class.success]="feedbackCorrect" [class.error]="feedbackCorrect === false">
              {{ feedback }}
            </div>
            <button class="btn-next" (click)="currentIndex < cards.length - 1 ? nextCard() : finishQuiz()">
              {{ currentIndex < cards.length - 1 ? 'Suivant (Entrée) →' : 'Bilan (Entrée)' }}
            </button>
          </div>
        </div>

      </section>

      <!-- ÉTAPE 3 : BILAN -->
      <section *ngIf="stage === 'finished'" class="glass-card result-panel">
        <div class="result-header">
          <h2>Session Terminée</h2>
          <div class="score-circle">
            <svg viewBox="0 0 36 36" class="circular-chart">
              <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="circle" 
                [attr.stroke-dasharray]="getSuccessPercent() + ', 100'" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              />
            </svg>
            <div class="score-value">{{ getSuccessPercent() }}%</div>
          </div>
          <p class="score-comment">{{ getComment() }}</p>
        </div>

        <div class="table-container">
          <table class="results-table">
            <thead>
              <tr>
                <th>Q</th>
                <th>Attendu</th>
                <th>Réponse</th>
                <th>État</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of cards" [class.row-error]="c.correct === false">
                <td>
                  {{ c.direction === 'number-to-word' ? formatIndex(c.peg.index) : c.peg.word }}
                </td>
                <td class="col-expected">{{ expectedAnswerFor(c) }}</td>
                <td class="col-user">{{ c.userAnswer || '-' }}</td>
                <td>
                  <span class="status-dot" [class.dot-ok]="c.correct" [class.dot-ko]="!c.correct"></span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="result-actions">
          <button class="btn-primary" (click)="resetAll()">Nouvelle Session</button>
          <button class="btn-secondary" routerLink="/cours">Retour Menu</button>
        </div>
      </section>

    </div>
  `,
  styles: [`
    :host {
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --glass-bg: rgba(30, 41, 59, 0.7);
      --glass-border: 1px solid rgba(255, 255, 255, 0.08);
      --success: #10b981;
      --error: #f43f5e;
      --gold: #f59e0b;
    }

    .page-container {
      max-width: 700px;
      margin: 0 auto;
      padding-bottom: 4rem;
      min-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    /* --- HEADER --- */
    .header { text-align: center; margin-bottom: 2rem; }
    .back-link {
      background: none; border: none; color: #94a3b8; cursor: pointer;
      font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;
    }
    .back-link:hover { color: white; }
    
    .page-title { font-size: 2.2rem; font-weight: 800; margin: 0 0 0.5rem 0; color: white; line-height: 1.1; }
    .text-gradient {
      background: linear-gradient(135deg, #fff 0%, #818cf8 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .subtitle { color: #94a3b8; font-size: 1rem; }

    /* --- CONFIG --- */
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: var(--glass-border);
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }
    .panel-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
    .step-badge {
      background: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 0.3rem 0.8rem;
      border-radius: 99px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
    }
    .panel-header h3 { margin: 0; color: white; font-size: 1.2rem; }

    .config-section { margin-bottom: 2rem; }
    .config-label { display: block; color: #cbd5e1; font-size: 0.9rem; margin-bottom: 0.8rem; font-weight: 500; }
    
    .mode-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; }
    .mode-card {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px; padding: 1.5rem; cursor: pointer; transition: all 0.2s;
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
    }
    .mode-card:hover { background: rgba(255,255,255,0.1); }
    .mode-card.active {
      background: rgba(99, 102, 241, 0.2); border-color: var(--primary);
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
    }
    .mode-icon { font-size: 1.5rem; }
    .mode-name { color: white; font-size: 0.9rem; font-weight: 600; }

    .count-selector { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .count-btn {
      flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      color: white; padding: 0.8rem; border-radius: 12px; cursor: pointer; font-weight: 600;
      transition: background 0.2s;
    }
    .count-btn:hover { background: var(--primary); border-color: var(--primary); }

    .info-box {
      background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3);
      padding: 1rem; border-radius: 12px; display: flex; gap: 0.8rem; align-items: center;
    }
    .info-box p { margin: 0; color: #fcd34d; font-size: 0.9rem; }

    /* --- GAME AREA & FLIP CARD --- */
    .game-area { display: flex; flex-direction: column; gap: 1.5rem; align-items: center; }
    
    .hud-bar {
      width: 100%; padding: 0.8rem 1.5rem; display: flex; justify-content: space-between; align-items: center;
    }
    .btn-text { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 0.9rem; }
    .btn-text:hover { color: white; }
    .progress-indicator { color: white; font-weight: 600; }
    .total { color: #64748b; font-weight: 400; }

    /* 3D FLIP STYLES */
    .scene { width: 100%; max-width: 400px; height: 260px; perspective: 1000px; }
    .card {
      width: 100%; height: 100%; position: relative;
      transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
      transform-style: preserve-3d; border-radius: 24px;
    }
    .card.is-flipped { transform: rotateY(180deg); }

    .card__face {
      position: absolute; width: 100%; height: 100%; backface-visibility: hidden;
      border-radius: 24px; display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.1);
    }

    /* FRONT FACE */
    .card__face--front {
      background: linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95));
    }
    .card-question-label { font-size: 0.85rem; text-transform: uppercase; color: #94a3b8; margin-bottom: 1rem; letter-spacing: 1px; }
    .card-content-main { flex: 1; display: flex; align-items: center; justify-content: center; }
    .big-text { font-size: 4rem; font-weight: 800; color: white; font-family: 'JetBrains Mono', monospace; }
    .big-text.word { font-size: 2.5rem; font-family: inherit; text-transform: capitalize; }
    .card-hint { font-size: 0.8rem; color: #64748b; margin-top: auto; }

    /* BACK FACE */
    .card__face--back {
      background: linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98));
      transform: rotateY(180deg); border: 2px solid transparent;
    }
    .card__face--back.is-correct { border-color: var(--success); }
    .card__face--back.is-wrong { border-color: var(--error); }

    .card-result-icon {
      font-size: 2rem; width: 50px; height: 50px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;
      background: rgba(255,255,255,0.1);
    }
    .is-correct .card-result-icon { background: var(--success); color: #064e3b; }
    .is-wrong .card-result-icon { background: var(--error); color: #7f1d1d; }

    .card-back-label { font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; }
    .card-back-value { font-size: 2rem; font-weight: 700; color: white; margin-bottom: 1rem; text-transform: capitalize; }
    .card-user-answer { font-size: 0.9rem; color: #cbd5e1; background: rgba(0,0,0,0.3); padding: 0.5rem 1rem; border-radius: 8px; }

    /* INPUT ZONE */
    .input-zone { width: 100%; max-width: 400px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .game-input {
      width: 100%; background: rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 0.8rem 1rem; color: white; font-size: 1.1rem;
      text-align: center; outline: none;
    }
    .game-input:focus { border-color: var(--primary); }
    
    .action-buttons { display: flex; gap: 0.8rem; justify-content: center; align-items: center; width: 100%; }
    .btn-primary {
      flex: 2; background: var(--primary); border: none; color: white; padding: 0.8rem;
      border-radius: 12px; font-weight: 600; cursor: pointer;
    }
    .btn-secondary {
      flex: 1; background: transparent; border: 1px solid rgba(255,255,255,0.2);
      color: #94a3b8; padding: 0.8rem; border-radius: 12px; cursor: pointer;
    }
    .btn-next {
      flex: 1; background: white; color: #0f172a; border: none; padding: 0.8rem;
      border-radius: 12px; font-weight: 700; cursor: pointer;
    }
    
    .feedback-msg { font-weight: 600; font-size: 0.9rem; margin-right: auto; }
    .feedback-msg.success { color: var(--success); }
    .feedback-msg.error { color: var(--error); }

    /* --- RESULTS --- */
    .result-panel { text-align: center; max-width: 600px; width: 100%; }
    .score-circle { position: relative; width: 120px; height: 120px; margin: 0 auto 1rem; }
    .circular-chart { display: block; margin: 0 auto; max-width: 100%; max-height: 250px; }
    .circle-bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 2.5; }
    .circle { fill: none; stroke: var(--primary); stroke-width: 2.5; stroke-linecap: round; }
    .score-value { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2rem; font-weight: 800; color: white; }
    .score-comment { color: #94a3b8; margin-bottom: 2rem; }

    .table-container { max-height: 300px; overflow-y: auto; margin-bottom: 2rem; border-radius: 12px; background: rgba(0,0,0,0.2); }
    .results-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; }
    .results-table th { padding: 1rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1); position: sticky; top: 0; background: #1e293b; }
    .results-table td { padding: 0.8rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: #cbd5e1; }
    .col-expected { color: var(--gold); font-weight: 600; }
    .row-error { background: rgba(244, 63, 94, 0.1); }
    
    .status-dot { height: 10px; width: 10px; border-radius: 50%; display: inline-block; }
    .dot-ok { background: var(--success); }
    .dot-ko { background: var(--error); }
    
    .result-actions { display: flex; justify-content: center; gap: 1rem; }

    @media (max-width: 600px) {
      .scene { height: 220px; }
      .big-text { font-size: 3rem; }
    }
  `]
})
export class GrandSystemRevisionComponent implements OnInit {
  @ViewChild('answerInput') answerInput!: ElementRef; // Pour le focus auto

  pegList: PegItem[] = [];
  cards: { peg: PegItem; direction: Direction; correct?: boolean; userAnswer?: string }[] = [];

  stage: Stage = 'config';
  mode: Mode = 'mixed';

  currentIndex = 0;
  currentInput = '';
  feedback: string | null = null;
  feedbackCorrect: boolean | null = null;
  correctCount = 0;
  answered = false;

  private defaultList: PegItem[] = [
    { index: 0, word: 'seau' }, { index: 1, word: 'dé' }, { index: 2, word: 'nez' }, { index: 3, word: 'mue' }, { index: 4, word: 'rat' },
    { index: 5, word: 'lit' }, { index: 6, word: 'jeu' }, { index: 7, word: 'gain' }, { index: 8, word: 'vin' }, { index: 9, word: 'bain' },
    { index: 10, word: 'saute' }, { index: 11, word: 'tata' }, { index: 12, word: 'thune' }, { index: 13, word: 'tome' }, { index: 14, word: 'tour' },
    { index: 15, word: 'dalle' }, { index: 16, word: 'douche' }, { index: 17, word: 'tag' }, { index: 18, word: 'Dove' }, { index: 19, word: 'tape' },
    { index: 20, word: 'naseau' }, { index: 21, word: 'natte' }, { index: 22, word: 'nana' }, { index: 23, word: 'nem' }, { index: 24, word: 'nord' },
    { index: 25, word: 'nil' }, { index: 26, word: 'neige' }, { index: 27, word: 'nuque' }, { index: 28, word: 'naive' }, { index: 29, word: 'nappe' },
    { index: 30, word: 'muse' }, { index: 31, word: 'maté' }, { index: 32, word: 'mine' }, { index: 33, word: 'maman' }, { index: 34, word: 'marre' },
    { index: 35, word: 'male' }, { index: 36, word: 'mage' }, { index: 37, word: 'Mac' }, { index: 38, word: 'Mauve' }, { index: 39, word: 'Mop' },
    { index: 40, word: 'raser' }, { index: 41, word: 'ride' }, { index: 42, word: 'rune' }, { index: 43, word: 'rame' }, { index: 44, word: 'RER' },
    { index: 45, word: 'rale' }, { index: 46, word: 'roche' }, { index: 47, word: 'rock' }, { index: 48, word: 'Rouve' }, { index: 49, word: 'Râpe' },
    { index: 50, word: 'lisse' }, { index: 51, word: 'lutte' }, { index: 52, word: 'lune' }, { index: 53, word: 'lame' }, { index: 54, word: 'lire' },
    { index: 55, word: 'Lille' }, { index: 56, word: 'lache' }, { index: 57, word: 'lac' }, { index: 58, word: 'Leffe' }, { index: 59, word: 'Lap (tours)' },
    { index: 60, word: 'chaise' }, { index: 61, word: 'Chad' }, { index: 62, word: 'jaune' }, { index: 63, word: 'Chaume' }, { index: 64, word: 'char' },
    { index: 65, word: 'châle' }, { index: 66, word: 'Jauge' }, { index: 67, word: 'Shaq' }, { index: 68, word: 'chauffe' }, { index: 69, word: 'jupe' },
    { index: 70, word: 'casse' }, { index: 71, word: 'kit' }, { index: 72, word: 'canne' }, { index: 73, word: 'camé' }, { index: 74, word: 'car' },
    { index: 75, word: 'col' }, { index: 76, word: 'cochet' }, { index: 77, word: 'coq' }, { index: 78, word: 'coiffe' }, { index: 79, word: 'cube' },
    { index: 80, word: 'fusée' }, { index: 81, word: 'vote' }, { index: 82, word: 'fan' }, { index: 83, word: 'femme' }, { index: 84, word: 'phare' },
    { index: 85, word: 'fil' }, { index: 86, word: 'vif' }, { index: 87, word: 'fac' }, { index: 88, word: 'faf' }, { index: 89, word: 'vip' },
    { index: 90, word: 'passe' }, { index: 91, word: 'pote' }, { index: 92, word: 'panne' }, { index: 93, word: 'paume' }, { index: 94, word: 'poire' },
    { index: 95, word: 'poêle' }, { index: 96, word: 'boivent' }, { index: 97, word: 'bac' }, { index: 98, word: 'baffe' }, { index: 99, word: 'pub' }
  ];

  ngOnInit(): void {
    this.loadPegListFromStorageOrDefault();
  }

  get currentCard() {
    return this.cards[this.currentIndex] ?? null;
  }

  // Écoute de la touche Entrée pour une navigation fluide
  @HostListener('window:keydown.enter')
  handleEnter() {
    if (this.stage !== 'quiz') return;

    if (!this.answered) {
      this.submitAnswer();
    } else {
      if (this.currentIndex < this.cards.length - 1) {
        this.nextCard();
      } else {
        this.finishQuiz();
      }
    }
  }

  // --- CONFIG ---

  private loadPegListFromStorageOrDefault(): void {
    if (typeof window === 'undefined') {
      this.pegList = this.defaultList;
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.pegList = this.defaultList.map((def, idx) => {
            const fromStorage = parsed[idx];
            return { index: def.index, word: fromStorage?.word || def.word };
          });
          return;
        }
      }
    } catch {}
    this.pegList = this.defaultList;
  }

  startQuiz(count: number) {
    const n = Math.min(count, this.pegList.length);
    const pool = [...this.pegList];
    
    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const selected = pool.slice(0, n);
    this.cards = selected.map(peg => ({
      peg,
      direction: this.chooseDirection()
    }));

    this.resetQuizState();
    this.stage = 'quiz';
    
    // Focus sur l'input dès le début
    setTimeout(() => this.focusInput(), 100);
  }

  private chooseDirection(): Direction {
    if (this.mode === 'mixed') return Math.random() < 0.5 ? 'number-to-word' : 'word-to-number';
    return this.mode;
  }

  private resetQuizState() {
    this.currentIndex = 0;
    this.currentInput = '';
    this.feedback = null;
    this.feedbackCorrect = null;
    this.correctCount = 0;
    this.answered = false;
  }

  private focusInput() {
    if (this.answerInput) this.answerInput.nativeElement.focus();
  }

  // --- GAMEPLAY ---

  submitAnswer() {
    if (!this.currentCard || !this.currentInput.trim()) return;
    
    const card = this.currentCard;
    const userRaw = this.currentInput.trim();
    let isCorrect = false;

    if (card.direction === 'number-to-word') {
      isCorrect = this.normalize(userRaw) === this.normalize(card.peg.word);
      this.feedback = isCorrect ? 'Bien joué !' : `Raté... C'était "${card.peg.word}"`;
    } else {
      // Pour Word -> Number, on accepte "5" ou "05"
      const expected = String(card.peg.index);
      const expectedPadded = this.formatIndex(card.peg.index);
      isCorrect = userRaw === expected || userRaw === expectedPadded;
      this.feedback = isCorrect ? 'Exact !' : `Non, c'était le ${expectedPadded}`;
    }

    this.feedbackCorrect = isCorrect;
    if (isCorrect) this.correctCount++;
    
    card.correct = isCorrect;
    card.userAnswer = userRaw;
    this.answered = true;
  }

  skipCard() {
    if (!this.currentCard) return;
    this.currentCard.correct = false;
    this.currentCard.userAnswer = '(Passé)';
    this.feedback = `La réponse était : ${this.expectedAnswerFor(this.currentCard)}`;
    this.feedbackCorrect = false;
    this.answered = true;
  }

  nextCard() {
    this.currentIndex++;
    this.currentInput = '';
    this.answered = false;
    this.feedback = null;
    // On remet le focus sur l'input pour enchaîner
    setTimeout(() => this.focusInput(), 50);
  }

  finishQuiz() {
    this.stage = 'finished';
  }

  resetAll() {
    this.stage = 'config';
  }

  // --- HELPERS ---

  formatIndex(i: number): string {
    return i.toString().padStart(2, '0');
  }

  expectedAnswerFor(card: { peg: PegItem; direction: Direction }): string {
    return card.direction === 'number-to-word' ? card.peg.word : this.formatIndex(card.peg.index);
  }

  getSuccessPercent(): number {
    if (!this.cards.length) return 0;
    return Math.round((this.correctCount / this.cards.length) * 100);
  }

  getComment(): string {
    const p = this.getSuccessPercent();
    if (p === 100) return 'Légendaire ! Votre mémoire est infaillible.';
    if (p >= 80) return 'Excellent travail, continuez ainsi.';
    if (p >= 50) return 'Bon début, mais il faut encore réviser.';
    return 'Courage, la répétition est la clé du succès.';
  }

  private normalize(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }
}