import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

interface CardRow {
  num: number;
  numLabel: string;
  rank: string;
  suit: string;
  suitName: string; // Propriété nécessaire pour le filtrage
  color: 'red' | 'black';
  pegWord: string;
}

@Component({
  selector: 'app-cours-cartes',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, RouterLink],
  template: `
    <div class="page-container">
      
      <!-- HEADER -->
      <header class="header">
        <a routerLink="/cours" class="back-link">
          <span class="icon">←</span> Retour aux cours
        </a>
        <h1 class="page-title">Mémorisation des <span class="text-gradient">Cartes</span></h1>
        <p class="subtitle">
          Maîtrisez le système PAO ou le Grand Système pour mémoriser un paquet de 52 cartes en quelques minutes.
        </p>
      </header>

      <!-- SECTION 1: PRINCIPE -->
      <section class="glass-card section-card">
        <div class="card-header">
          <div class="step-badge">Concept</div>
          <h3>La Mécanique Secrète</h3>
        </div>
        <p>
          Le cerveau retient mal les abstractions. Il retient parfaitement les images.
        </p>
        <div class="concept-flow">
          <div class="flow-item">
            <span class="flow-icon">🃏</span>
            <span class="flow-text">Carte</span>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-item">
            <span class="flow-icon">🔢</span>
            <span class="flow-text">Nombre (1-52)</span>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-item">
            <span class="flow-icon">🖼️</span>
            <span class="flow-text">Image Mentale</span>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-item">
            <span class="flow-icon">🏰</span>
            <span class="flow-text">Palais Mental</span>
          </div>
        </div>
      </section>

      <!-- SECTION 2: NUMÉROTATION (FILTRES INTERACTIFS) -->
      <section class="glass-card section-card">
        <div class="card-header">
          <div class="step-badge">Logique</div>
          <h3>Numérotation (1 à 52)</h3>
        </div>
        <p>
          Pour convertir une carte en image, on la transforme d'abord en nombre.
          L'ordre canonique est <strong class="highlight">Cœur → Trèfle → Carreau → Pique</strong>.
          <br><span class="faded">Cliquez sur une famille pour filtrer le tableau ci-dessous.</span>
        </p>
        
        <div class="suits-grid">
          <div 
            class="suit-card red" 
            [class.active]="selectedSuit === 'Cœur'"
            (click)="toggleSuitFilter('Cœur')"
          >
            <div class="suit-icon">♥</div>
            <div class="suit-name">Cœurs</div>
            <div class="suit-range">1 à 13</div>
          </div>
          <div 
            class="suit-card black"
            [class.active]="selectedSuit === 'Trèfle'"
            (click)="toggleSuitFilter('Trèfle')"
          >
            <div class="suit-icon">♣</div>
            <div class="suit-name">Trèfles</div>
            <div class="suit-range">14 à 26</div>
          </div>
          <div 
            class="suit-card red"
            [class.active]="selectedSuit === 'Carreau'"
            (click)="toggleSuitFilter('Carreau')"
          >
            <div class="suit-icon">♦</div>
            <div class="suit-name">Carreaux</div>
            <div class="suit-range">27 à 39</div>
          </div>
          <div 
            class="suit-card black"
            [class.active]="selectedSuit === 'Pique'"
            (click)="toggleSuitFilter('Pique')"
          >
            <div class="suit-icon">♠</div>
            <div class="suit-name">Piques</div>
            <div class="suit-range">40 à 52</div>
          </div>
        </div>
      </section>

      <!-- SECTION 3: TABLE DE CONVERSION -->
      <section class="glass-card section-card full-width">
        <div class="card-header">
          <div class="step-badge">Référence</div>
          <h3>Table de conversion</h3>
          <button *ngIf="selectedSuit" class="btn-reset" (click)="selectedSuit = null">
            ✕ Voir tout
          </button>
        </div>
        <p class="instruction">
          Voici les images basées sur votre liste <strong>Palais Mental</strong> (synchronisée 1-52).
        </p>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Carte</th>
                <th>Image Mentale</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of displayedRows">
                <td class="col-num">{{ row.numLabel }}</td>
                <td class="col-card" [class.red]="row.color === 'red'">
                  <span class="card-rank">{{ row.rank }}</span>
                  <span class="card-suit">{{ row.suit }}</span>
                </td>
                <td class="col-peg">{{ row.pegWord }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SECTION 4: MÉTHODE -->
      <section class="glass-card section-card">
        <div class="card-header">
          <div class="step-badge">Pratique</div>
          <h3>La Routine du Palais</h3>
        </div>
        <ul class="steps-list">
          <li>
            <span class="step-num">1</span>
            <div class="step-content">
              <strong>Préparez votre Palais</strong>
              Identifiez un trajet familier avec 52 points de passage (loci) précis. 
              Numérotez-les mentalement de 1 à 52.
            </div>
          </li>
          <li>
            <span class="step-num">2</span>
            <div class="step-content">
              <strong>L'encodage</strong>
              Piochez une carte. Convertissez-la instantanément en son image (ex: Roi de Pique = 52 = Lune).
            </div>
          </li>
          <li>
            <span class="step-num">3</span>
            <div class="step-content">
              <strong>L'association</strong>
              Placez cette image sur le locus correspondant. Faites interagir l'image avec le lieu de façon violente, absurde ou drôle.
            </div>
          </li>
        </ul>
      </section>

    </div>
  `,
  styles: [`
    :host {
      --primary: #6366f1;
      --glass-bg: rgba(30, 41, 59, 0.7);
      --glass-border: 1px solid rgba(255, 255, 255, 0.08);
      --red-suit: #f87171;
      --text-main: #e2e8f0;
      --text-muted: #94a3b8;
    }

    .page-container {
      max-width: 900px;
      margin: 0 auto;
      padding-bottom: 4rem;
    }

    /* --- HEADER --- */
    .header { margin-bottom: 3rem; }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      transition: color 0.2s;
    }
    .back-link:hover { color: white; }
    .page-title { font-size: 2.5rem; font-weight: 800; margin: 0 0 0.5rem 0; line-height: 1.1; color: white; }
    .text-gradient {
      background: linear-gradient(135deg, #fff 0%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { color: var(--text-muted); font-size: 1.1rem; max-width: 600px; line-height: 1.6; }

    /* --- GLASS CARD --- */
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: var(--glass-border);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .step-badge {
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      padding: 0.25rem 0.7rem;
      border-radius: 99px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    h3 { margin: 0; font-size: 1.3rem; color: white; }
    p { color: var(--text-main); line-height: 1.6; margin-bottom: 1rem; }
    .highlight { color: #fbbf24; }
    .instruction { font-size: 0.95rem; margin-bottom: 1.5rem; }
    .faded { color: var(--text-muted); font-style: italic; font-size: 0.85rem; }

    /* --- CONCEPT FLOW --- */
    .concept-flow {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0,0,0,0.2);
      padding: 1.5rem;
      border-radius: 16px;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .flow-item { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .flow-icon { font-size: 2rem; }
    .flow-text { font-size: 0.85rem; font-weight: 600; color: #cbd5e1; }
    .flow-arrow { color: var(--text-muted); font-size: 1.5rem; }

    /* --- SUITS GRID --- */
    .suits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .suit-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1rem;
      text-align: center;
      transition: all 0.2s;
      cursor: pointer;
    }
    .suit-card:hover { transform: translateY(-3px); background: rgba(255,255,255,0.08); }
    .suit-card.active {
      background: rgba(99, 102, 241, 0.2);
      border-color: var(--primary);
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
    }

    .suit-icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .suit-name { font-weight: 700; color: white; margin-bottom: 0.2rem; }
    .suit-range { font-size: 0.8rem; color: var(--text-muted); }
    .suit-card.red .suit-icon { color: var(--red-suit); }
    .suit-card.black .suit-icon { color: #cbd5e1; }

    /* --- DATA TABLE --- */
    .table-container {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
      max-height: 500px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    }
    .data-table th {
      background: rgba(15, 23, 42, 0.9);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--text-muted);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      position: sticky;
      top: 0;
      z-index: 1;
    }
    .data-table td {
      padding: 0.8rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      color: var(--text-main);
    }
    .data-table tr:hover { background: rgba(255,255,255,0.02); }
    .col-num { font-family: 'JetBrains Mono', monospace; color: var(--text-muted); }
    .col-card { font-weight: 700; font-family: 'Times New Roman', serif; font-size: 1.1rem; letter-spacing: 1px; }
    .col-card.red { color: var(--red-suit); }
    .col-peg { color: #fbbf24; font-weight: 500; text-transform: capitalize; }
    
    .btn-reset {
      margin-left: auto;
      background: none;
      border: 1px solid rgba(255,255,255,0.2);
      color: var(--text-muted);
      padding: 0.3rem 0.8rem;
      border-radius: 99px;
      cursor: pointer;
      font-size: 0.8rem;
    }
    .btn-reset:hover { color: white; border-color: white; }

    /* --- STEPS LIST --- */
    .steps-list { list-style: none; padding: 0; margin: 0; }
    .steps-list li {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .step-num {
      background: var(--primary);
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 0.2rem;
    }
    .step-content strong { display: block; color: white; margin-bottom: 0.3rem; font-size: 1.1rem; }
    .step-content { color: var(--text-muted); line-height: 1.6; }

    @media (max-width: 640px) {
      .concept-flow { flex-direction: column; gap: 0.5rem; }
      .flow-arrow { transform: rotate(90deg); }
      .page-title { font-size: 2rem; }
    }
  `]
})
export class CoursCartesComponent implements OnInit {
  cardRows: CardRow[] = [];
  selectedSuit: string | null = null;

  ngOnInit(): void {
    this.buildCardRows();
  }

  // Getter pour le tableau : renvoie soit tout, soit filtré
  get displayedRows(): CardRow[] {
    if (!this.selectedSuit) return this.cardRows;
    // On compare avec le nom français de la famille (Cœur, Trèfle...)
    return this.cardRows.filter(row => row.suitName === this.selectedSuit);
  }

  toggleSuitFilter(suit: string) {
    if (this.selectedSuit === suit) {
      this.selectedSuit = null;
    } else {
      this.selectedSuit = suit;
    }
  }

  private buildCardRows(): void {
    const suits = [
      { name: 'Cœur', symbol: '♥', color: 'red' as const },
      { name: 'Trèfle', symbol: '♣', color: 'black' as const },
      { name: 'Carreau', symbol: '♦', color: 'red' as const },
      { name: 'Pique', symbol: '♠', color: 'black' as const }
    ];
    const ranks = ['As','2','3','4','5','6','7','8','9','10','Valet','Dame','Roi'];

    // LISTE SYNCHRONISÉE AVEC COURS PALAIS (1-52)
    // Note : L'index 0 est vide, on commence à 1 (dé)
    const pegWords: string[] = [
      '', // 0 (non utilisé ici)
      'dé', 'nez', 'mue', 'rat', 'lit', 'jeu', 'gain', 'vin', 'bain', 'saute', // 1-10
      'tata', 'thune', 'tome', 'tour', 'dalle', 'douche', 'tag', 'Dove', 'tape', 'naseau', // 11-20
      'natte', 'nana', 'nem', 'nord', 'nil', 'neige', 'nuque', 'naive', 'nappe', 'muse', // 21-30
      'maté', 'mine', 'maman', 'marre', 'male', 'mage', 'Mac', 'Mauve', 'Mop', 'raser', // 31-40
      'ride', 'rune', 'rame', 'RER', 'rale', 'roche', 'rock', 'Rouve', 'Râpe', 'lisse', // 41-50
      'lutte', 'lune' // 51-52
    ];

    const rows: CardRow[] = [];

    for (let num = 1; num <= 52; num++) {
      const suitIndex = Math.floor((num - 1) / 13);
      const rankIndex = (num - 1) % 13;
      const suit = suits[suitIndex];
      const rank = ranks[rankIndex];

      const numLabel = num.toString().padStart(2, '0');
      const pegWord = pegWords[num] || '';

      rows.push({
        num,
        numLabel,
        rank: rank === 'As' ? 'A' : (rank === 'Roi' ? 'K' : (rank === 'Dame' ? 'Q' : (rank === 'Valet' ? 'J' : rank))),
        suit: suit.symbol,
        suitName: suit.name, // Ajout de la propriété manquante
        color: suit.color,
        pegWord,
      });
    }

    this.cardRows = rows;
  }
}