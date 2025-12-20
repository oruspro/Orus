import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Locus {
  id: number;
  name: string;
  note?: string; 
}

interface Zone {
  id: number;
  name: string;
  loci: Locus[];
  isCollapsed?: boolean;
}

interface QuizQuestion {
  question: string;
  answer: string; // La réponse attendue (normalisée)
  displayAnswer: string; // La réponse à afficher en correction
  hint: string;
  type: 'pos-to-name' | 'name-to-pos';
}

@Component({
  selector: 'app-cours-palais-builder',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      
      <!-- HEADER -->
      <header class="header">
        <a routerLink="/cours" class="back-link">
          <span class="icon">←</span> QG Académie
        </a>
        <div class="header-content">
          <div class="status-badge">Architecte v1.2</div>
          <h1 class="page-title">Constructeur de <span class="text-gold">Palais</span></h1>
        </div>
        <div class="header-actions">
           <span class="save-status">Auto-save <span class="dot"></span></span>
        </div>
      </header>

      <!-- MODE ÉDITEUR -->
      <section class="builder-interface" *ngIf="mode === 'edit'">
        
        <!-- DASHBOARD HUD -->
        <div class="hud-panel glass-card">
          <div class="hud-stat">
            <span class="label">Capacité</span>
            <span class="value">{{ totalLoci }} <span class="unit">slots</span></span>
          </div>
          <div class="hud-stat">
            <span class="label">Zones</span>
            <span class="value">{{ zones.length }}</span>
          </div>
          <div class="hud-stat health">
            <span class="label">Qualité</span>
            <div class="quality-bar">
              <div class="fill" [style.width.%]="palaceQuality"></div>
            </div>
            <span class="quality-text">{{ getQualityLabel() }}</span>
          </div>
          
          <div class="hud-actions">
            <button class="btn-play-action" (click)="startWalkthrough()" [disabled]="totalLoci === 0">
              <span class="play-icon">👁️</span> Visite
            </button>
            <button class="btn-play-action secondary" (click)="startQuiz()" [disabled]="totalLoci < 3">
              <span class="play-icon">⚡</span> Quiz
            </button>
          </div>
        </div>

        <!-- ZONE DE CONSTRUCTION -->
        <div class="blueprint-area">
          <div class="blueprint-line"></div>

          <div class="zone-wrapper" *ngFor="let zone of zones; let zIdx = index">
            <div class="zone-card glass-card" [class.collapsed]="zone.isCollapsed">
              <div class="zone-header">
                <div class="zone-drag-handle">::</div>
                <div class="zone-info">
                  <span class="zone-index">Zone {{ zIdx + 1 }}</span>
                  <input class="zone-title-input" [(ngModel)]="zone.name" placeholder="Nom de la pièce">
                </div>
                <div class="zone-meta">
                  <span class="locus-count">{{ zone.loci.length }} pts</span>
                  <button class="btn-icon" (click)="toggleCollapse(zone)">{{ zone.isCollapsed ? '▼' : '▲' }}</button>
                  <button class="btn-icon delete" (click)="deleteZone(zIdx)">✕</button>
                </div>
              </div>

              <div class="zone-body" *ngIf="!zone.isCollapsed">
                <div class="loci-grid">
                  <div class="locus-card" *ngFor="let locus of zone.loci; let lIdx = index">
                    <div class="locus-number">{{ getGlobalIndex(zIdx, lIdx) }}</div>
                    <div class="locus-content">
                      <input class="locus-input main" [(ngModel)]="locus.name" placeholder="Objet">
                      <input class="locus-input sub" [(ngModel)]="locus.note" placeholder="Note visuelle">
                    </div>
                    <button class="btn-remove-locus" (click)="deleteLocus(zIdx, lIdx)">×</button>
                  </div>
                  <button class="btn-add-locus" (click)="addLocus(zIdx)"><span class="plus">+</span></button>
                </div>
              </div>
            </div>
            <div class="connector" *ngIf="zIdx < zones.length - 1">↓</div>
          </div>

          <button class="btn-add-zone-large" (click)="addZone()">
            <span>+ Ajouter une nouvelle pièce</span>
          </button>
        </div>
      </section>

      <!-- MODE VISITE -->
      <section class="immersion-overlay" *ngIf="mode === 'walk'">
        <div class="immersion-container">
          <div class="immersion-top">
            <div class="immersion-progress">
              <div class="progress-bar"><div class="fill" [style.width.%]="((step + 1) / totalLoci) * 100"></div></div>
              <span class="progress-text">{{ step + 1 }} / {{ totalLoci }}</span>
            </div>
            <button class="btn-close-immersion" (click)="mode = 'edit'">Quitter</button>
          </div>

          <div class="immersion-stage">
            <div class="zone-indicator">
              <span class="label">Lieu Actuel</span>
              <span class="value">{{ currentStepZone }}</span>
            </div>
            <div class="locus-focus">
              <div class="locus-id">#{{ step + 1 }}</div>
              <h2 class="locus-name">{{ currentStepLocus.name }}</h2>
              <p class="locus-note" *ngIf="currentStepLocus.note">"{{ currentStepLocus.note }}"</p>
            </div>
          </div>

          <div class="immersion-controls">
            <button class="nav-btn" (click)="prevStep()" [disabled]="step === 0">← Précédent</button>
            <div class="hint-text">Utilisez les flèches du clavier</div>
            <button class="nav-btn primary" (click)="nextStep()" [disabled]="step === totalLoci - 1">Suivant →</button>
          </div>
        </div>
      </section>

      <!-- MODE QUIZ -->
      <section class="immersion-overlay quiz-mode" *ngIf="mode === 'quiz'">
        <div class="immersion-container">
          
          <div class="immersion-top">
            <div class="quiz-status">Question {{ quizIndex + 1 }} / {{ quizQuestions.length }}</div>
            <button class="btn-close-immersion" (click)="mode = 'edit'">Abandonner</button>
          </div>

          <div class="immersion-stage">
            <div class="quiz-card glass-card">
              <h3 class="quiz-question">{{ currentQuizQuestion.question }}</h3>
              <p class="quiz-hint">{{ currentQuizQuestion.hint }}</p>
              
              <div class="quiz-input-area">
                <input 
                  #quizInput
                  type="text" 
                  class="game-input" 
                  [(ngModel)]="quizAnswer" 
                  [disabled]="quizFeedback !== null"
                  (keyup.enter)="checkQuizAnswer()"
                  placeholder="Votre réponse..."
                  autocomplete="off"
                >
                <button 
                  class="btn-validate" 
                  *ngIf="quizFeedback === null"
                  (click)="checkQuizAnswer()"
                >Valider</button>
              </div>

              <div class="quiz-feedback" *ngIf="quizFeedback !== null" [ngClass]="{ 'success': quizIsCorrect, 'error': !quizIsCorrect }">
                <div class="fb-icon">{{ quizIsCorrect ? '✓' : '✕' }}</div>
                <div class="fb-content">
                  <div class="fb-msg">{{ quizFeedback }}</div>
                  <div class="fb-ans">Réponse : <strong>{{ currentQuizQuestion.displayAnswer }}</strong></div>
                </div>
                <button class="btn-next-quiz" (click)="nextQuizQuestion()">
                  {{ quizIndex < quizQuestions.length - 1 ? 'Suivant →' : 'Terminer' }}
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  `,
  styles: [`
    :host {
      --primary: #6366f1;
      --glass-bg: rgba(15, 23, 42, 0.6);
      --glass-border: 1px solid rgba(255, 255, 255, 0.08);
      --gold: #f59e0b;
      --text-muted: #94a3b8;
      --bg-dark: #0f172a;
      --success: #10b981;
      --error: #f43f5e;
    }

    .page-container { max-width: 900px; margin: 0 auto; padding-bottom: 6rem; position: relative; }

    /* HEADER */
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .back-link { color: var(--text-muted); text-decoration: none; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; }
    .back-link:hover { color: white; }
    .header-content { text-align: center; }
    .status-badge { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: var(--primary); font-weight: 700; margin-bottom: 0.2rem; }
    .page-title { font-size: 1.8rem; margin: 0; font-weight: 800; color: white; }
    .text-gold { color: var(--gold); }
    .save-status { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem; }
    .dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 5px #10b981; }

    /* HUD */
    .hud-panel { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 2rem; margin-bottom: 3rem; border-radius: 20px; background: linear-gradient(90deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9)); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    .hud-stat { display: flex; flex-direction: column; }
    .hud-stat .label { font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 1px; margin-bottom: 0.2rem; }
    .hud-stat .value { font-size: 1.8rem; font-weight: 700; color: white; line-height: 1; }
    .hud-stat .unit { font-size: 0.9rem; font-weight: 400; color: var(--text-muted); }
    .quality-bar { width: 100px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-bottom: 0.3rem; overflow: hidden; }
    .quality-bar .fill { height: 100%; background: var(--gold); transition: width 0.5s ease; }
    .quality-text { font-size: 0.8rem; color: var(--gold); font-weight: 600; }
    
    .hud-actions { display: flex; gap: 0.5rem; }
    .btn-play-action { background: var(--gold); color: #1e293b; border: none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: transform 0.2s; }
    .btn-play-action:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4); }
    .btn-play-action:disabled { opacity: 0.5; cursor: not-allowed; background: #475569; color: #94a3b8; }
    .btn-play-action.secondary { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
    .btn-play-action.secondary:hover:not(:disabled) { background: white; color: #1e293b; }

    /* BLUEPRINT */
    .blueprint-area { position: relative; padding-left: 2rem; border-left: 2px dashed rgba(255,255,255,0.1); }
    .zone-wrapper { position: relative; margin-bottom: 0; }
    .connector { height: 30px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 1.2rem; opacity: 0.5; }
    .zone-card { background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; transition: all 0.3s ease; position: relative; }
    .zone-card:hover { border-color: rgba(99, 102, 241, 0.3); background: rgba(30, 41, 59, 0.6); }
    .zone-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--primary); opacity: 0.5; }
    .zone-header { padding: 1rem 1.5rem; display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); }
    .zone-drag-handle { color: var(--text-muted); cursor: grab; font-size: 1.2rem; opacity: 0.5; }
    .zone-info { flex: 1; display: flex; flex-direction: column; }
    .zone-index { font-size: 0.7rem; text-transform: uppercase; color: var(--primary); font-weight: 700; letter-spacing: 1px; }
    .zone-title-input { background: transparent; border: none; color: white; font-weight: 700; font-size: 1.1rem; flex: 1; outline: none; padding: 0.2rem 0; }
    .zone-meta { display: flex; align-items: center; gap: 0.8rem; }
    .locus-count { font-size: 0.8rem; color: var(--text-muted); background: rgba(0,0,0,0.3); padding: 0.2rem 0.6rem; border-radius: 99px; }
    .btn-icon { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem; padding: 0.2rem; transition: color 0.2s; }
    .btn-icon:hover { color: white; }
    .btn-icon.delete:hover { color: #f43f5e; }
    .zone-body { padding: 1.5rem; background: rgba(15, 23, 42, 0.2); }
    .loci-grid { display: flex; flex-wrap: wrap; gap: 0.8rem; }
    .locus-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 0.6rem 0.8rem; display: flex; align-items: center; gap: 0.8rem; min-width: 200px; flex: 1; position: relative; }
    .locus-number { font-family: monospace; font-size: 0.9rem; font-weight: 700; color: var(--text-muted); background: rgba(0,0,0,0.3); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px; }
    .locus-content { flex: 1; display: flex; flex-direction: column; }
    .locus-input { background: transparent; border: none; outline: none; width: 100%; }
    .locus-input.main { color: white; font-weight: 500; font-size: 0.95rem; }
    .locus-input.sub { color: var(--text-muted); font-size: 0.8rem; margin-top: 0.1rem; }
    .btn-remove-locus { background: none; border: none; color: #64748b; font-size: 1.2rem; cursor: pointer; opacity: 0; transition: opacity 0.2s; }
    .locus-card:hover .btn-remove-locus { opacity: 1; }
    .btn-add-locus { width: 40px; border-radius: 8px; border: 1px dashed rgba(255,255,255,0.2); background: rgba(255,255,255,0.02); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
    .btn-add-zone-large { width: 100%; margin-top: 2rem; padding: 1.5rem; background: rgba(30, 41, 59, 0.4); border: 2px dashed rgba(255,255,255,0.1); border-radius: 16px; color: var(--text-muted); font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }

    /* IMMERSION / QUIZ */
    .immersion-overlay { position: fixed; inset: 0; background: #0f172a; z-index: 200; display: flex; flex-direction: column; animation: fadeIn 0.4s ease-out; }
    .immersion-container { max-width: 800px; margin: 0 auto; width: 100%; height: 100%; display: flex; flex-direction: column; padding: 2rem; }
    .immersion-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4rem; }
    .immersion-progress { display: flex; align-items: center; gap: 1rem; flex: 1; max-width: 300px; }
    .progress-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
    .progress-bar .fill { height: 100%; background: var(--primary); transition: width 0.3s ease; }
    .progress-text { font-family: monospace; color: var(--text-muted); font-size: 0.9rem; }
    .btn-close-immersion { background: none; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.4rem 1rem; border-radius: 99px; cursor: pointer; font-size: 0.8rem; }
    
    .immersion-stage { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .zone-indicator { margin-bottom: 2rem; opacity: 0.7; }
    .zone-indicator .label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: var(--gold); display: block; margin-bottom: 0.3rem; }
    .zone-indicator .value { font-size: 1.2rem; color: white; font-weight: 300; }
    
    .locus-focus { position: relative; animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .locus-id { font-size: 6rem; font-weight: 800; color: rgba(255,255,255,0.03); position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: -1; }
    .locus-name { font-size: 4rem; font-weight: 800; color: white; margin: 0 0 1rem 0; line-height: 1.1; }
    .locus-note { font-size: 1.2rem; color: #94a3b8; font-style: italic; max-width: 500px; margin: 0 auto; }
    .locus-placeholder-visual { width: 120px; height: 4px; background: radial-gradient(circle, var(--primary) 0%, transparent 100%); margin: 3rem auto 0; opacity: 0.5; }

    .immersion-controls { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
    .nav-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 1rem 2rem; border-radius: 12px; cursor: pointer; font-weight: 600; transition: all 0.2s; min-width: 140px; }
    .nav-btn.primary { background: white; color: #0f172a; border-color: white; }
    .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .hint-text { color: #64748b; font-size: 0.8rem; }

    /* QUIZ MODE SPECIFIC */
    .quiz-status { font-family: monospace; color: var(--primary); font-weight: 700; letter-spacing: 1px; }
    .quiz-card { width: 100%; max-width: 500px; padding: 2.5rem; background: #1e293b; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); }
    .quiz-question { font-size: 1.6rem; color: white; margin: 0 0 1rem 0; }
    .quiz-hint { color: #94a3b8; font-size: 0.9rem; margin-bottom: 2rem; }
    
    .quiz-input-area { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
    .game-input { flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.8rem; color: white; outline: none; }
    .game-input:focus { border-color: var(--primary); }
    .btn-validate { background: var(--primary); color: white; border: none; padding: 0 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; }

    .quiz-feedback { background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; animation: slideUp 0.3s ease-out; }
    .quiz-feedback.success { border: 1px solid var(--success); background: rgba(16, 185, 129, 0.1); }
    .quiz-feedback.error { border: 1px solid var(--error); background: rgba(244, 63, 94, 0.1); }
    .fb-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .success .fb-icon { background: var(--success); color: #064e3b; }
    .error .fb-icon { background: var(--error); color: #7f1d1d; }
    .fb-content { flex: 1; text-align: left; }
    .fb-msg { font-weight: 700; font-size: 1rem; margin-bottom: 0.2rem; }
    .success .fb-msg { color: var(--success); }
    .error .fb-msg { color: var(--error); }
    .fb-ans { font-size: 0.85rem; color: #cbd5e1; }
    .btn-next-quiz { background: white; color: #0f172a; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 700; cursor: pointer; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    @media (max-width: 700px) {
      .hud-panel { flex-direction: column; gap: 1.5rem; align-items: stretch; text-align: center; }
      .blueprint-area { padding-left: 0; border: none; }
      .immersion-controls { flex-direction: column; gap: 1rem; }
      .nav-btn { width: 100%; }
      .locus-name { font-size: 2.5rem; }
    }
  `]
})
export class CoursPalaisBuilderComponent {
  @ViewChild('quizInput') quizInput!: ElementRef;

  mode: 'edit' | 'walk' | 'quiz' = 'edit';
  
  // Données de démo (À remplacer par la vraie persistance)
  zones: Zone[] = [
    { 
      id: 1, 
      name: 'Entrée', 
      loci: [
        { id: 1, name: 'Paillasson', note: 'Texture rugueuse' },
        { id: 2, name: 'Poignée', note: 'Froide et métal' },
        { id: 3, name: 'Miroir', note: 'Reflet' },
        { id: 4, name: 'Porte-manteau', note: 'Bois sombre' },
        { id: 5, name: 'Interrupteur', note: 'Clic sonore' }
      ]
    },
    { 
      id: 2, 
      name: 'Cuisine', 
      loci: [
        { id: 6, name: 'Frigo', note: 'Bruit moteur' },
        { id: 7, name: 'Évier', note: 'Goutte d\'eau' },
        { id: 8, name: 'Four', note: 'Chaleur' },
        { id: 9, name: 'Table', note: 'Surface lisse' },
        { id: 10, name: 'Poubelle', note: '' }
      ] 
    }
  ];

  step = 0;

  // Quiz State
  quizQuestions: QuizQuestion[] = [];
  quizIndex = 0;
  quizAnswer = '';
  quizFeedback: string | null = null;
  quizIsCorrect: boolean | null = null;

  // --- Keyboard Handling ---
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.mode === 'walk') {
      if (event.key === 'ArrowRight') this.nextStep();
      if (event.key === 'ArrowLeft') this.prevStep();
      if (event.key === 'Escape') this.mode = 'edit';
    } else if (this.mode === 'quiz') {
      if (event.key === 'Enter') {
        if (this.quizFeedback === null) {
          this.checkQuizAnswer();
        } else {
          this.nextQuizQuestion();
        }
      }
      if (event.key === 'Escape') this.mode = 'edit';
    }
  }

  get totalLoci(): number {
    return this.zones.reduce((acc, zone) => acc + zone.loci.length, 0);
  }

  get palaceQuality(): number {
    if (this.zones.length === 0) return 0;
    const avg = this.totalLoci / this.zones.length;
    if (avg >= 4 && avg <= 8) return 100;
    if (avg < 4) return (avg / 4) * 100;
    return Math.max(0, 100 - (avg - 8) * 10);
  }

  getQualityLabel(): string {
    const q = this.palaceQuality;
    if (q >= 90) return 'Optimale ✨';
    if (q >= 60) return 'Bonne structure';
    if (q > 0) return 'À optimiser';
    return 'Vide';
  }

  // --- Helpers Visite ---
  get flattenedLoci(): { name: string, note?: string, zoneName: string }[] {
    const flat: { name: string, note?: string, zoneName: string }[] = [];
    this.zones.forEach(z => {
      z.loci.forEach(l => {
        flat.push({ name: l.name, note: l.note, zoneName: z.name });
      });
    });
    return flat;
  }

  get currentStepLocus() { return this.flattenedLoci[this.step] || { name: '', zoneName: '' }; }
  get currentStepZone(): string { return this.flattenedLoci[this.step]?.zoneName || ''; }
  get currentQuizQuestion() { return this.quizQuestions[this.quizIndex]; }

  // --- Actions Éditeur ---
  addZone() {
    this.zones.push({ id: Date.now(), name: '', loci: [], isCollapsed: false });
  }

  deleteZone(index: number) {
    if (confirm('Supprimer cette zone ?')) this.zones.splice(index, 1);
  }

  toggleCollapse(zone: Zone) { zone.isCollapsed = !zone.isCollapsed; }

  addLocus(zoneIndex: number) {
    this.zones[zoneIndex].loci.push({ id: Date.now(), name: '' });
  }

  deleteLocus(zoneIndex: number, locusIndex: number) {
    this.zones[zoneIndex].loci.splice(locusIndex, 1);
  }

  getGlobalIndex(zoneIdx: number, locusIdx: number): number {
    let count = 0;
    for (let i = 0; i < zoneIdx; i++) count += this.zones[i].loci.length;
    return count + locusIdx + 1;
  }

  // --- Actions Visite ---
  startWalkthrough() {
    if (this.totalLoci === 0) return;
    this.step = 0;
    this.mode = 'walk';
  }

  nextStep() { if (this.step < this.totalLoci - 1) this.step++; }
  prevStep() { if (this.step > 0) this.step--; }

  // --- Actions Quiz ---
  startQuiz() {
    if (this.totalLoci < 3) return; // Besoin d'un minimum
    
    // Génération des questions
    const allLoci = this.flattenedLoci;
    const questions: QuizQuestion[] = [];

    // On génère 1 question par locus (mélange type 1 et type 2)
    allLoci.forEach((locus, idx) => {
      const position = idx + 1;
      const isPosToName = Math.random() > 0.5;

      if (isPosToName) {
        questions.push({
          type: 'pos-to-name',
          question: `Quel est le locus n°${position} ?`,
          hint: `Situé dans : ${locus.zoneName}`,
          answer: this.normalize(locus.name),
          displayAnswer: locus.name
        });
      } else {
        questions.push({
          type: 'name-to-pos',
          question: `Quelle est la position de "${locus.name}" ?`,
          hint: `Situé dans : ${locus.zoneName}`,
          answer: String(position),
          displayAnswer: `Position ${position}`
        });
      }
    });

    // Mélange (Fisher-Yates)
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    this.quizQuestions = questions;
    this.quizIndex = 0;
    this.resetQuizStep();
    this.mode = 'quiz';
    
    setTimeout(() => this.focusQuizInput(), 100);
  }

  checkQuizAnswer() {
    if (!this.quizAnswer.trim()) return;
    
    const userAnswer = this.normalize(this.quizAnswer);
    const expected = this.currentQuizQuestion.answer;
    
    this.quizIsCorrect = userAnswer === expected;
    this.quizFeedback = this.quizIsCorrect ? 'Bonne réponse !' : 'Incorrect.';
  }

  nextQuizQuestion() {
    if (this.quizIndex < this.quizQuestions.length - 1) {
      this.quizIndex++;
      this.resetQuizStep();
      setTimeout(() => this.focusQuizInput(), 50);
    } else {
      this.mode = 'edit'; // Fin du quiz
    }
  }

  private resetQuizStep() {
    this.quizAnswer = '';
    this.quizFeedback = null;
    this.quizIsCorrect = null;
  }

  private focusQuizInput() {
    if (this.quizInput) this.quizInput.nativeElement.focus();
  }

  private normalize(s: string): string {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }
}