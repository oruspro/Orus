import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgFor, NgClass, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService } from '../service/stats.service';

type Phase = 'pre' | 'mem' | 'recap' | 'result';

interface HistoryEvent {
  year: number;
  text: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const REAL_EVENTS: HistoryEvent[] = [
  { year: 33, text: 'Crucifixion de Jésus de Nazareth, naissance du christianisme.' },
  { year: 313, text: 'Édit de Milan : Constantin légalise le christianisme dans l’Empire romain.' },
  { year: 395, text: 'Division définitive de l’Empire romain entre Orient et Occident.' },
  { year: 476, text: 'Chute de l’Empire romain d’Occident après la déposition de Romulus Augustule.' },
  { year: 622, text: 'Hégire de Mahomet : début du calendrier musulman.' },
  { year: 732, text: 'Charles Martel arrête les Arabes à la bataille de Poitiers.' },
  { year: 800, text: 'Charlemagne est couronné empereur d’Occident à Rome.' },
  { year: 843, text: 'Traité de Verdun : partage de l’Empire carolingien entre les petits-fils de Charlemagne.' },
  { year: 962, text: 'Otton Ier est couronné empereur : naissance du Saint-Empire romain germanique.' },
  { year: 1000, text: 'Leif Erikson atteint l’Amérique du Nord, bien avant Christophe Colomb.' },
  { year: 1066, text: 'Bataille d’Hastings : Guillaume le Conquérant devient roi d’Angleterre.' },
  { year: 1099, text: 'Prise de Jérusalem par les croisés lors de la première croisade.' },
  { year: 1206, text: 'Gengis Khan est proclamé chef des Mongols et commence ses conquêtes.' },
  { year: 1215, text: 'Signature de la Magna Carta en Angleterre, limite le pouvoir royal.' },
  { year: 1271, text: 'Marco Polo part pour l’Asie vers la cour de Kubilaï Khan.' },
  { year: 1348, text: 'La peste noire dévaste l’Europe et tue une grande partie de la population.' },
  { year: 1453, text: 'Chute de Constantinople prise par les Ottomans, fin de l’Empire romain d’Orient.' },
  { year: 1492, text: 'Christophe Colomb atteint l’Amérique en traversant l’Atlantique.' },
  { year: 1494, text: 'Traité de Tordesillas : partage du Nouveau Monde entre Espagne et Portugal.' },
  { year: 1517, text: 'Martin Luther affiche ses 95 thèses : début de la Réforme protestante.' },
  { year: 1543, text: 'Nicolas Copernic publie son ouvrage plaçant le Soleil au centre du système.' },
  { year: 1588, text: 'Défaite de l’Invincible Armada espagnole face à l’Angleterre.' },
  { year: 1603, text: 'Début de la guerre de Trente Ans en Europe centrale.' },
  { year: 1618, text: 'Début de la guerre de Trente Ans en Europe centrale.' },
  { year: 1643, text: 'Louis XIV devient roi de France, futur “Roi Soleil”.' },
  { year: 1687, text: 'Isaac Newton publie les “Principia Mathematica”.' },
  { year: 1689, text: 'Bill of Rights en Angleterre : affirmation des droits du Parlement.' },
  { year: 1707, text: 'Acte d’Union : naissance du Royaume de Grande-Bretagne.' },
  { year: 1776, text: 'Déclaration d’indépendance des États-Unis d’Amérique.' },
  { year: 1789, text: 'Prise de la Bastille à Paris : début de la Révolution française.' },
  { year: 1799, text: 'Coup d’État du 18 Brumaire : Napoléon Bonaparte prend le pouvoir.' },
  { year: 1804, text: 'Napoléon se fait sacrer empereur des Français.' },
  { year: 1815, text: 'Défaite de Napoléon à Waterloo, fin de l’Empire napoléonien.' },
  { year: 1821, text: 'Début de la guerre d’indépendance de la Grèce contre l’Empire ottoman.' },
  { year: 1848, text: 'Printemps des peuples : vagues de révolutions en Europe.' },
  { year: 1861, text: 'Début de la guerre de Sécession aux États-Unis.' },
  { year: 1869, text: 'Inauguration du canal de Suez reliant Méditerranée et mer Rouge.' },
  { year: 1871, text: 'Proclamation de l’Empire allemand à Versailles.' },
  { year: 1885, text: 'Louis Pasteur réalise sa première vaccination contre la rage.' },
  { year: 1914, text: 'Assassinat de Sarajevo et début de la Première Guerre mondiale.' },
  { year: 1917, text: 'Révolution russe : prise du pouvoir par les bolcheviks.' },
  { year: 1919, text: 'Traité de Versailles mettant fin officiellement à la Première Guerre mondiale.' },
  { year: 1929, text: 'Krach de Wall Street : début de la Grande Dépression.' },
  { year: 1933, text: 'Hitler devient chancelier d’Allemagne.' },
  { year: 1939, text: 'Invasion de la Pologne par l’Allemagne : début de la Seconde Guerre mondiale.' },
  { year: 1945, text: 'Bombardements d’Hiroshima et Nagasaki et capitulation du Japon : fin de la guerre.' },
  { year: 1948, text: 'Création de l’État d’Israël au Proche-Orient.' },
  { year: 1949, text: 'Proclamation de la République populaire de Chine par Mao Zedong.' },
  { year: 1957, text: 'Lancement du satellite Spoutnik 1 par l’URSS : début de la conquête spatiale.' },
  { year: 1961, text: 'Construction du mur de Berlin séparant l’Est et l’Ouest.' },
  { year: 1963, text: 'Marche sur Washington et discours “I have a dream” de Martin Luther King.' },
  { year: 1969, text: 'Mission Apollo 11 : premiers pas de l’homme sur la Lune.' },
  { year: 1971, text: 'Création de Greenpeace, organisation écologiste internationale.' },
  { year: 1973, text: 'Premier choc pétrolier : hausse brutale du prix du pétrole.' },
  { year: 1986, text: 'Catastrophe nucléaire de Tchernobyl en Ukraine.' },
  { year: 1989, text: 'Chute du mur de Berlin, symbole de la fin de la guerre froide.' },
  { year: 1991, text: 'Dissolution de l’URSS, fin officielle de l’Union soviétique.' },
  { year: 1994, text: 'Fin de l’apartheid et élection de Nelson Mandela en Afrique du Sud.' },
  { year: 2001, text: 'Attentats du 11 septembre aux États-Unis.' },
  { year: 2002, text: 'Mise en circulation des pièces et billets en euro dans plusieurs pays européens.' },
  { year: 2008, text: 'Crise financière mondiale après la faillite de Lehman Brothers.' },
  { year: 2011, text: 'Printemps arabe : soulèvements populaires dans plusieurs pays arabes.' },
  { year: 2014, text: 'Annexion de la Crimée par la Russie et début du conflit en Ukraine.' },
  { year: 2019, text: 'Début de la pandémie de Covid-19 dans le monde.' },
];

function generateEvents(count: number): HistoryEvent[] {
  const shuffled = shuffle(REAL_EVENTS);
  if (count <= shuffled.length) return shuffled.slice(0, count);
  const result: HistoryEvent[] = [];
  let i = 0;
  while (result.length < count) {
    result.push(shuffled[i % shuffled.length]);
    i++;
  }
  return result;
}

// Clés
const GAMES_PLAYED_KEY = 'orus_games_played_v1';
const OFFER_SEEN_KEY = 'orus_offer_seen_v1';

@Component({
  selector: 'app-dates-trial',
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
            Chrono <span class="text-gradient">Histoire</span>
            <span *ngIf="ranked" class="badge-ranked">Classé</span>
          </h1>
          <p class="subtitle">Associez chaque événement à son année précise.</p>
        </div>
      </header>

      <!-- PHASE 1 : PRÉPARATION -->
      <section *ngIf="phase === 'pre'" class="glass-card centered-panel">
        <div class="pre-content">
          <div class="pre-label">Chargement des archives</div>
          <div class="pre-number">{{ preTimeLeft }}</div>
          <p class="pre-hint">Préparez-vous à voyager dans le temps...</p>
          <div class="meta-tag">{{ events.length }} dates à mémoriser</div>
        </div>
      </section>

      <!-- PHASE 2 : MÉMORISATION -->
      <section *ngIf="phase === 'mem'" class="game-board">
        
        <!-- HUD -->
        <div class="hud-bar glass-card">
          <div class="hud-item">
            <span class="hud-label">Temps Restant</span>
            <span class="hud-value" [class.warning]="timeLeft < 60">
              {{ minutes }}:{{ seconds }}
            </span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Objectif</span>
            <span class="hud-value">{{ events.length }} <span class="total">Dates</span></span>
          </div>
        </div>

        <!-- LISTE DES ÉVÈNEMENTS -->
        <div class="events-container glass-card">
          <div class="events-scroll">
            <div *ngFor="let ev of events; let i = index" class="event-row">
              <div class="event-year">{{ ev.year }}</div>
              <div class="event-desc">{{ ev.text }}</div>
            </div>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="controls glass-card">
          <p class="hint-text">Prenez le temps de créer des associations fortes.</p>
          <button class="btn-primary stop-btn" (click)="toRecap()">
            ⏱️ J'ai tout mémorisé (STOP)
          </button>
        </div>
      </section>

      <!-- PHASE 3 : RESTITUTION -->
      <section *ngIf="phase === 'recap'" class="glass-card recap-panel">
        <div class="panel-header">
          <div class="step-badge">Quiz</div>
          <h3>En quelle année cela s'est-il produit ?</h3>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="(currentIndex / shuffledEvents.length) * 100"></div>
        </div>

        <div class="question-card">
          <p class="question-text">{{ shuffledEvents[currentIndex]?.text }}</p>
        </div>

        <div class="input-area">
          <input
            #recapInput
            type="number"
            class="game-input"
            [(ngModel)]="answer"
            (keyup.enter)="validate()"
            placeholder="Année..."
            min="0" max="2100"
          />
          <button class="btn-validate" (click)="validate()">↵</button>
        </div>

        <div class="feedback-area">
          <div *ngIf="feedback" class="feedback-msg" [ngClass]="lastResult ? 'success' : 'error'">
            {{ feedback }}
          </div>
        </div>

        <div class="recap-footer">
          <button class="btn-text" (click)="finishEarly()">Voir les résultats</button>
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
            <span class="stat-label">Score</span>
            <span class="stat-val">{{ correctCount }}/{{ events.length }}</span>
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
            <h4>Devenez incollable en Histoire 🏛️</h4>
            <p>Débloquez le mode infini et les statistiques détaillées.</p>
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
      --error: #f43f5e;
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
    .text-gradient {
      background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
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
    .pre-hint { color: #cbd5e1; font-style: italic; margin-bottom: 1rem; }
    .meta-tag { background: rgba(255,255,255,0.1); padding: 0.4rem 1rem; border-radius: 99px; font-size: 0.85rem; color: #e2e8f0; display: inline-block; }

    /* --- MEMO PHASE --- */
    .game-board {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      align-items: center;
    }

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
    .total { font-size: 0.9rem; color: #64748b; font-weight: 400; }

    /* Events List */
    .events-container {
      width: 100%;
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 400px; /* Hauteur fixe pour le scroll */
    }
    .events-scroll {
      overflow-y: auto;
      padding: 1.5rem;
      height: 100%;
    }
    .events-scroll::-webkit-scrollbar { width: 6px; }
    .events-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

    .event-row {
      display: flex;
      gap: 1.5rem;
      padding: 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      align-items: flex-start;
    }
    .event-row:last-child { border-bottom: none; }
    .event-year {
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--primary);
      min-width: 60px;
    }
    .event-desc {
      color: #e2e8f0;
      line-height: 1.5;
      font-size: 0.95rem;
    }

    /* Controls */
    .controls { width: 100%; text-align: center; }
    .hint-text { color: #64748b; font-size: 0.85rem; margin-bottom: 1rem; }
    .stop-btn { width: 100%; padding: 0.8rem; font-size: 1rem; font-weight: 600; border-radius: 12px; }

    /* --- RECAP PHASE --- */
    .recap-panel { max-width: 600px; margin: 0 auto; text-align: center; }
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
    .progress-fill { height: 100%; background: var(--primary); transition: width 0.3s ease; }

    .question-card {
      background: rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .question-text { font-size: 1.1rem; line-height: 1.6; color: white; margin: 0; }

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
      /* Enlever les flèches du type number */
      -moz-appearance: textfield;
    }
    .game-input::-webkit-outer-spin-button,
    .game-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
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
      .offer-card { flex-direction: column; text-align: center; }
    }
  `]
})
export class DatesTrialComponent implements OnInit, OnDestroy {
  @ViewChild('recapInput') recapInput!: ElementRef;
  
  ranked = false;
  phase: Phase = 'pre';

  events: HistoryEvent[] = [];
  shuffledEvents: HistoryEvent[] = [];
  
  // Timer
  timeLeft = 300;
  timerId: any;
  preTimeLeft = 3;
  preTimerId: any;
  memDuration = 0;

  // Game
  answer: number | null = null;
  currentIndex = 0;
  correctCount = 0;
  feedback = '';
  lastResult = false;
  finalScore = 0;

  showOffersCTA = false;
  private gameRecorded = false;

  constructor(private route: ActivatedRoute, private router: Router, private statsService: StatsService) {}

  ngOnInit() {
    this.ranked = !!this.route.snapshot.data['ranked'];
    this.events = generateEvents(60); // 60 dates par défaut
    this.shuffledEvents = shuffle(this.events);
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

  // --- ACTIONS ---

  toRecap() {
    if (this.phase !== 'mem') return;
    this.phase = 'recap';
    if (this.timerId) clearInterval(this.timerId);
    const MAX_MEM = 300;
    this.memDuration = MAX_MEM - this.timeLeft;

    setTimeout(() => {
      if (this.recapInput) this.recapInput.nativeElement.focus();
    }, 100);
  }

  validate() {
    if (this.answer === null) return;
    
    const current = this.shuffledEvents[this.currentIndex];
    
    if (this.answer === current.year) {
      this.correctCount++;
      this.feedback = 'Exact !';
      this.lastResult = true;
    } else {
      this.feedback = `Faux ! C'était en ${current.year}`;
      this.lastResult = false;
    }
    
    this.answer = null;
    this.currentIndex++;
    
    if (this.currentIndex >= this.shuffledEvents.length) {
      this.finishGame();
    }
  }

  finishEarly() {
    this.finishGame();
  }

  finishGame() {
    this.phase = 'result';
    this.finalScore = this.computeScore();
    this.handleGameFinished();
  }

  computeScore(): number {
    if (!this.events.length) return 0;
    const accuracy = this.correctCount / this.events.length;
    return Math.round(accuracy * 100);
  }

  private handleGameFinished(): void {
    if (this.gameRecorded) return;
    this.gameRecorded = true;

    this.statsService.recordScore('dates', this.finalScore, this.ranked);

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
    this.router.navigate(['/offres']);
  }

  goBack() {
    this.router.navigate([ this.ranked ? '/classe' : '/normal' ]);
  }
}