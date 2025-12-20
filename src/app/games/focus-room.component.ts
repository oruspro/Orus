import { Component, OnInit, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// --- PIPE SAFE HTML (Défini ici pour être utilisable directement) ---
@Pipe({ name: 'safeHtml', standalone: true })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

type FocusState = 'INTRO' | 'OBSERVE' | 'VISUALIZE' | 'FEEDBACK';

interface Shape {
  id: string;
  name: string;
  svg: string;
  color: string;
}

@Component({
  selector: 'app-focus-room',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe], // Le Pipe est maintenant importé réellement
  template: `
    <div class="focus-container">
      
      <!-- BOUTON RETOUR (Discret) -->
      <button class="exit-btn" (click)="exit()">✕ Quitter</button>

      <!-- ÉTAT 1 : INTRO -->
      <div *ngIf="state === 'INTRO'" class="intro-screen fade-in">
        <div class="icon-eye">👁️</div>
        <h1>La Chambre Noire</h1>
        <p class="instruction">
          Nous allons tester la persistance de votre image mentale.
        </p>
        <div class="steps">
          <div class="step"><span>1</span> Observez l'objet (10s)</div>
          <div class="step"><span>2</span> Fermez les yeux ou fixez le noir (15s)</div>
          <div class="step"><span>3</span> Projetez l'image mentalement</div>
        </div>
        <button class="btn-start" (click)="startSession()">Commencer</button>
      </div>

      <!-- ÉTAT 2 : OBSERVATION -->
      <div *ngIf="state === 'OBSERVE'" class="observe-screen fade-in">
        <div class="timer-bar">
          <div class="progress" [style.width.%]="(timeLeft / 10) * 100"></div>
        </div>
        
        <h2 class="phase-title">Mémorisez les détails</h2>
        
        <!-- L'OBJET A OBSERVER -->
        <div class="object-container" [innerHTML]="currentShape.svg | safeHtml"></div>
      </div>

      <!-- ÉTAT 3 : VISUALISATION (NOIR TOTAL) -->
      <div *ngIf="state === 'VISUALIZE'" class="visualize-screen fade-in-slow">
        <!-- Un point d'ancrage très subtil pour aider le regard -->
        <div class="anchor-point"></div>
        
        <p class="mental-guide">
          Projetez l'image ici.<br>
          <span class="sub-guide">Stabilisez la forme... la couleur...</span>
        </p>

        <!-- Barre de progression très discrète en bas -->
        <div class="mental-timer" [style.width.%]="100 - ((timeLeft / 15) * 100)"></div>
      </div>

      <!-- ÉTAT 4 : FEEDBACK -->
      <div *ngIf="state === 'FEEDBACK'" class="feedback-screen fade-in">
        <h2>Vérification</h2>
        <p>Voici l'objet réel. Votre image mentale était-elle fidèle ?</p>
        
        <div class="comparison">
          <div class="object-container ghost" [innerHTML]="currentShape.svg | safeHtml"></div>
        </div>

        <div class="feedback-actions">
          <button class="btn-feedback bad" (click)="rate(1)">Flou / Instable</button>
          <button class="btn-feedback good" (click)="rate(2)">Net / Stable</button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      background: #000000; /* Noir pur pour cet exercice */
      color: #e2e8f0;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
    }

    .focus-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .exit-btn {
      position: absolute;
      top: 2rem;
      right: 2rem;
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      font-size: 0.9rem;
      transition: color 0.3s;
      z-index: 100;
    }
    .exit-btn:hover { color: white; }

    /* --- INTRO --- */
    .intro-screen { text-align: center; max-width: 500px; padding: 2rem; }
    .icon-eye { font-size: 4rem; margin-bottom: 1rem; animation: pulse 3s infinite; }
    h1 { font-size: 2.5rem; font-weight: 200; letter-spacing: 2px; margin-bottom: 1rem; color: white; }
    .instruction { color: #94a3b8; margin-bottom: 2rem; line-height: 1.6; }
    
    .steps { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 3rem; text-align: left; }
    .step { display: flex; align-items: center; gap: 1rem; color: #cbd5e1; }
    .step span { 
      width: 24px; height: 24px; background: #334155; border-radius: 50%; 
      display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold;
    }

    .btn-start {
      background: white; color: black; border: none; padding: 1rem 3rem;
      font-size: 1.1rem; letter-spacing: 1px; cursor: pointer; border-radius: 99px;
      transition: transform 0.2s, box-shadow 0.2s; font-weight: 600;
    }
    .btn-start:hover { transform: scale(1.05); box-shadow: 0 0 20px rgba(255,255,255,0.3); }

    /* --- OBSERVE --- */
    .observe-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; }
    .timer-bar { position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: #1e293b; }
    .progress { height: 100%; background: #6366f1; transition: width 1s linear; }
    .phase-title { position: absolute; top: 15%; color: #64748b; font-weight: 300; letter-spacing: 1px; font-size: 1rem; text-transform: uppercase; }
    
    .object-container {
      width: 300px; height: 300px;
      display: flex; align-items: center; justify-content: center;
      animation: float 6s ease-in-out infinite;
    }
    /* Permet de styliser le SVG injecté */
    ::ng-deep svg { width: 100%; height: 100%; filter: drop-shadow(0 0 10px rgba(255,255,255,0.2)); }

    /* --- VISUALIZE --- */
    .visualize-screen { 
      display: flex; flex-direction: column; align-items: center; justify-content: center; 
      height: 100%; width: 100%; background: black; cursor: none; /* On cache la souris */
    }
    .anchor-point { width: 4px; height: 4px; background: #334155; border-radius: 50%; opacity: 0.5; margin-bottom: 2rem; }
    .mental-guide { color: #475569; font-weight: 300; text-align: center; animation: pulseText 4s infinite; }
    .sub-guide { font-size: 0.8rem; opacity: 0.5; }
    .mental-timer { position: absolute; bottom: 0; left: 0; height: 2px; background: #334155; transition: width 1s linear; }

    /* --- FEEDBACK --- */
    .feedback-screen { text-align: center; }
    .comparison { margin: 2rem 0; opacity: 0.7; transform: scale(0.8); }
    .feedback-actions { display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; }
    .btn-feedback {
      padding: 0.8rem 1.5rem; border: 1px solid #334155; background: transparent; color: #cbd5e1;
      cursor: pointer; border-radius: 8px; transition: all 0.2s;
    }
    .btn-feedback:hover { background: #1e293b; border-color: #64748b; color: white; }
    .btn-feedback.good:hover { border-color: #86efac; color: #86efac; }

    /* ANIMATIONS */
    .fade-in { animation: fadeIn 0.5s ease-out; }
    .fade-in-slow { animation: fadeIn 1.5s ease-in; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
    @keyframes pulseText { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

  `]
})
export class FocusRoomComponent implements OnInit, OnDestroy {
  state: FocusState = 'INTRO';
  timeLeft: number = 0;
  timer: any;
  
  shapes: Shape[] = [
    { 
      id: 'cube', name: 'Cube Néon', color: '#6366f1',
      svg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="50" y="50" width="100" height="100" stroke="#6366f1" stroke-width="4"/><rect x="70" y="30" width="100" height="100" stroke="#818cf8" stroke-width="2" stroke-opacity="0.5"/><path d="M50 50L70 30M150 50L170 30M50 150L70 130M150 150L170 130" stroke="#818cf8" stroke-width="2" stroke-opacity="0.5"/></svg>`
    },
    {
      id: 'pyramid', name: 'Pyramide', color: '#f59e0b',
      svg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 20L20 160H180L100 20Z" stroke="#f59e0b" stroke-width="4"/><path d="M100 20L100 160" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4 4"/></svg>`
    },
    {
      id: 'circle', name: 'Cercle Concentrique', color: '#ec4899',
      svg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="80" stroke="#ec4899" stroke-width="4"/><circle cx="100" cy="100" r="50" stroke="#f472b6" stroke-width="2"/><circle cx="100" cy="100" r="20" fill="#ec4899"/></svg>`
    }
  ];

  currentShape: Shape = this.shapes[0];

  constructor(private router: Router) {}

  ngOnInit() {}

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  exit() {
    this.router.navigate(['/']);
  }

  startSession() {
    // Choix aléatoire d'une forme
    this.currentShape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
    this.startObserve();
  }

  startObserve() {
    this.state = 'OBSERVE';
    this.timeLeft = 10;
    
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.startVisualize();
      }
    }, 1000);
  }

  startVisualize() {
    this.state = 'VISUALIZE';
    this.timeLeft = 15; // Un peu plus long pour laisser le temps de construire l'image

    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.state = 'FEEDBACK';
      }
    }, 1000);
  }

  rate(score: number) {
    // Ici on pourrait sauvegarder le score si on voulait
    // Pour l'instant, on boucle ou on quitte
    if (score === 2) {
      // Si c'est réussi, on propose de quitter ou de refaire avec une autre forme
      // Simplification : on relance
      this.startSession();
    } else {
      // Si raté, on réessaie la MÊME forme
      this.startObserve();
    }
  }
}