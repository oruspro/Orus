import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface PegItem {
  index: number;
  word: string;
}

// Changement de version pour forcer le rechargement de la nouvelle liste
const STORAGE_KEY = 'orus-peglist-v2';

@Component({
  selector: 'app-cours-palais',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <button class="btn-back" routerLink="/cours">← Retour à l'académie</button>
      
      <div class="detail-header">
        <h1>Palais Mental & Grand Système</h1>
        <p>La fondation de toute mémorisation avancée.</p>
      </div>

      <div class="content-grid">
        
        <!-- Bloc Théorie Palais -->
        <div class="glass-card content-block">
          <h3>🏰 1. La Méthode des Lieux</h3>
          <p>
            Le cerveau humain est conçu pour retenir des espaces, pas des listes.
            Utilisez un lieu familier (votre maison) comme "disque dur".
          </p>
          <ul class="step-list">
            <li><strong>Le Chemin :</strong> Définissez un trajet précis (Entrée → Salon → Cuisine).</li>
            <li><strong>Les Loci :</strong> Choisissez des points d'ancrage (Paillasson, TV, Frigo).</li>
            <li><strong>L'Image :</strong> Déposez une image mentale absurde sur chaque locus.</li>
          </ul>
          <div class="tip-box">
            💡 <strong>Astuce :</strong> Plus l'image est violente, drôle ou sexuelle, mieux elle s'ancrera.
          </div>
        </div>

        <!-- Bloc Théorie Système Majeur -->
        <div class="glass-card content-block">
          <h3>🗣️ 2. Le Système Majeur (Sons)</h3>
          <p>Transformez les chiffres abstraits en sons concrets.</p>
          
          <div class="major-grid">
            <div class="major-item"><span>0</span> = s, z</div>
            <div class="major-item"><span>1</span> = t, d</div>
            <div class="major-item"><span>2</span> = n</div>
            <div class="major-item"><span>3</span> = m</div>
            <div class="major-item"><span>4</span> = r</div>
            <div class="major-item"><span>5</span> = l</div>
            <div class="major-item"><span>6</span> = ch, j</div>
            <div class="major-item"><span>7</span> = k, g</div>
            <div class="major-item"><span>8</span> = f, v</div>
            <div class="major-item"><span>9</span> = p, b</div>
          </div>
        </div>

        <!-- Bloc Éditeur 00-99 (Large) -->
        <div class="glass-card content-block full-width">
          <div class="block-header">
            <h3>📝 3. Votre Liste Personnelle (00-99)</h3>
            <div class="actions">
              <!-- Note: Le composant de révision étant désactivé pour le moment, le bouton peut rester ou être caché -->
              <!-- <button class="btn-small" routerLink="/grand-systeme-revision">Lancer Flashcards</button> -->
              <button class="btn-text warning" (click)="resetPegList()">Réinitialiser</button>
            </div>
          </div>
          
          <p class="desc">
            Définissez vos images fixes pour chaque nombre. Ces images seront vos "briques" pour mémoriser.
            <br><span class="muted">Modifiez les champs ci-dessous, la sauvegarde est automatique.</span>
          </p>

          <div class="peg-grid">
            <div class="peg-item" *ngFor="let peg of pegList">
              <div class="peg-num">{{ formatIndex(peg.index) }}</div>
              <input 
                [(ngModel)]="peg.word" 
                (ngModelChange)="savePegList()" 
                class="peg-input" 
                placeholder="..."
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #6366f1;
      --glass-bg: rgba(30, 41, 59, 0.7);
      --glass-border: 1px solid rgba(255, 255, 255, 0.08);
      --text-muted: #94a3b8;
      display: block;
    }
    .page-container { max-width: 1000px; margin: 0 auto; padding-bottom: 4rem; }
    
    .btn-back { background: none; border: none; color: var(--text-muted); cursor: pointer; margin-bottom: 1.5rem; font-size: 0.9rem; }
    .btn-back:hover { color: white; }

    .detail-header { margin-bottom: 2.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1.5rem; }
    .detail-header h1 { font-size: 2.5rem; color: white; margin: 0 0 0.5rem 0; }
    .detail-header p { font-size: 1.1rem; color: var(--text-muted); margin: 0; }

    .content-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; }
    .full-width { grid-column: 1 / -1; }

    .glass-card { background: var(--glass-bg); backdrop-filter: blur(12px); border: var(--glass-border); border-radius: 20px; padding: 2rem; }
    .content-block h3 { margin: 0 0 1rem 0; color: white; font-size: 1.3rem; }
    .content-block p { color: #cbd5e1; line-height: 1.6; margin-bottom: 1rem; }

    .step-list { padding-left: 1.2rem; color: #cbd5e1; margin-bottom: 1.5rem; }
    .step-list li { margin-bottom: 0.5rem; }
    .tip-box { background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); padding: 1rem; border-radius: 12px; color: #fcd34d; font-size: 0.9rem; }

    .major-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; margin-top: 1.5rem; }
    .major-item { background: rgba(255,255,255,0.05); padding: 0.8rem; text-align: center; border-radius: 12px; font-size: 0.9rem; color: #cbd5e1; }
    .major-item span { display: block; font-size: 1.2rem; font-weight: 800; color: var(--primary); margin-bottom: 0.2rem; }

    .block-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .desc { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem; }
    .muted { opacity: 0.7; font-style: italic; }

    .peg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.8rem; max-height: 500px; overflow-y: auto; padding-right: 0.5rem; }
    .peg-item { background: rgba(0,0,0,0.2); border-radius: 10px; padding: 0.5rem; display: flex; align-items: center; gap: 0.5rem; border: 1px solid rgba(255,255,255,0.05); }
    .peg-num { font-family: monospace; font-weight: 700; color: var(--primary); background: rgba(99, 102, 241, 0.1); padding: 0.2rem 0.5rem; border-radius: 6px; }
    .peg-input { background: transparent; border: none; color: white; width: 100%; outline: none; font-size: 0.9rem; }
    .peg-input:focus { color: var(--primary); }

    .actions { display: flex; gap: 1rem; align-items: center; }
    .btn-small { background: var(--primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
    .btn-text { background: none; border: none; cursor: pointer; font-size: 0.85rem; text-decoration: underline; }
    .warning { color: #fca5a5; }

    .peg-grid::-webkit-scrollbar { width: 6px; }
    .peg-grid::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    
    @media (max-width: 700px) { .major-grid { grid-template-columns: repeat(3, 1fr); } .peg-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class CoursPalaisComponent implements OnInit {
  pegList: PegItem[] = [];
  
  private defaultPegList: PegItem[] = [
    { index: 0, word: 'seau' }, { index: 1, word: 'dé' }, { index: 2, word: 'nez' }, { index: 3, word: 'mue' }, { index: 4, word: 'rat' },
    { index: 5, word: 'lit' }, { index: 6, word: 'jeu' }, { index: 7, word: 'gain' }, { index: 8, word: 'vin' }, { index: 9, word: 'bain' },
    { index: 10, word: 'tasse' }, { index: 11, word: 'tata' }, { index: 12, word: 'thune' }, { index: 13, word: 'tome' }, { index: 14, word: 'tour' },
    { index: 15, word: 'dalle' }, { index: 16, word: 'douche' }, { index: 17, word: 'tag' }, { index: 18, word: 'Dove' }, { index: 19, word: 'tape' },
    { index: 20, word: 'naseau' }, { index: 21, word: 'natte' }, { index: 22, word: 'nana' }, { index: 23, word: 'nem' }, { index: 24, word: 'nord' },
    { index: 25, word: 'nil' }, { index: 26, word: 'neige' }, { index: 27, word: 'nuque' }, { index: 28, word: 'navet' }, { index: 29, word: 'nappe' },
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
    this.loadPegList();
  }

  private loadPegList(): void {
    if (typeof window === 'undefined') {
      this.pegList = this.defaultPegList.map(p => ({ ...p }));
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.pegList = this.defaultPegList.map((def, idx) => {
            const fromStorage = parsed[idx];
            return { index: def.index, word: fromStorage?.word || def.word };
          });
          return;
        }
      }
    } catch {}
    this.pegList = this.defaultPegList.map(p => ({ ...p }));
  }

  savePegList(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pegList));
    } catch {}
  }

  resetPegList(): void {
    if(confirm('Réinitialiser toute la liste 00-99 aux valeurs par défaut ?')) {
      this.pegList = this.defaultPegList.map(p => ({ ...p }));
      this.savePegList();
    }
  }

  formatIndex(i: number): string {
    return i.toString().padStart(2, '0');
  }
}