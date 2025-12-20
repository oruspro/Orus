import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'app-cours',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  template: `
    <div class="page-container">
      
      <!-- HEADER -->
      <header class="header">
        <div class="academy-badge">Académie Orus</div>
        <h1 class="page-title">
          Arbre de <span class="text-gradient">Compétences</span>
        </h1>
        <p class="subtitle">
          Maîtrisez les techniques secrètes des champions. 
          Combinez théorie fondamentale et outils d'entraînement intensif.
        </p>
      </header>

      <!-- MENU PRINCIPAL -->
      <div class="dashboard-grid">
        
        <!-- SECTION : FONDAMENTAUX -->
        <section class="track-section">
          <h2 class="track-title"><span class="icon">🔑</span> Systèmes & Bases</h2>
          <div class="cards-row">
            
            <!-- Carte : Palais & Grand Système -->
            <div class="glass-card course-card primary-card" (click)="go('/cours-palais')">
              <div class="card-icon">🏛️</div>
              <div class="card-content">
                <h3>Palais & Grand Système</h3>
                <p>Le socle absolu. Apprenez à coder les nombres en images et à les stocker dans des lieux.</p>
                <div class="card-tags">
                  <span class="tag theory">Cours</span>
                  <span class="tag tool">Éditeur 00-99</span>
                </div>
              </div>
              <div class="card-arrow">→</div>
            </div>

            <!-- Carte : Flashcards 00-99 (ACTIVE) -->
            <div class="glass-card course-card" (click)="go('/grand-systeme-revision')">
              <div class="card-icon">⚡</div>
              <div class="card-content">
                <h3>Révision Flashcards</h3>
                <p>Outil type "Anki" pour ancrer vos 100 images de base (00-99) dans votre réflexe.</p>
                <div class="card-tags"><span class="tag tool">Entraînement</span></div>
              </div>
              <div class="card-arrow">→</div>
            </div>

             <!-- Carte : Extension 100-999 (Désactivé) -->
             <div class="glass-card course-card locked">
              <div class="card-icon">🚀</div>
              <div class="card-content">
                <h3>Système 100-999</h3>
                <p>Passez au niveau supérieur en combinant ambiances et images.</p>
                <div class="card-tags"><span class="tag locked-tag">En reconstruction</span></div>
              </div>
              <div class="card-arrow">🔒</div>
            </div>

          </div>
        </section>

        <!-- SECTION : TECHNIQUES SPÉCIFIQUES -->
        <section class="track-section">
          <h2 class="track-title"><span class="icon">📚</span> Disciplines</h2>
          <div class="cards-row">

            <!-- Carte : Cartes -->
            <div class="glass-card course-card" (click)="go('/cours-cartes')">
              <div class="card-icon">🃏</div>
              <div class="card-content">
                <h3>Mémoriser les Cartes</h3>
                <p>Techniques pour retenir un paquet de 52 cartes dans l'ordre parfait.</p>
                <div class="card-tags"><span class="tag theory">Guide</span></div>
              </div>
              <div class="card-arrow">→</div>
            </div>

             <!-- Carte : Chiffres (Redirige vers cours pour l'instant) -->
             <div class="glass-card course-card" (click)="go('/cours')">
              <div class="card-icon">𝜋</div>
              <div class="card-content">
                <h3>Mémoriser les Chiffres</h3>
                <p>Comment retenir des milliers de décimales avec le PAO ou le système majeur.</p>
                <div class="card-tags"><span class="tag theory">Guide</span></div>
              </div>
              <div class="card-arrow">→</div>
            </div>

            <!-- Carte : Dates -->
            <div class="glass-card course-card" (click)="go('/cours-dates')">
              <div class="card-icon">📅</div>
              <div class="card-content">
                <h3>Dates Historiques</h3>
                <p>Associez événements et années grâce à la créativité visuelle.</p>
                <div class="card-tags"><span class="tag theory">Cours</span></div>
              </div>
              <div class="card-arrow">→</div>
            </div>

          </div>
        </section>

        <!-- SECTION : ATELIERS -->
        <section class="track-section">
          <h2 class="track-title"><span class="icon">🛠️</span> Ateliers Pratiques</h2>
          <div class="cards-row">
            
            <div class="glass-card course-card" (click)="go('/cartes-loci-entrainement')">
              <div class="card-icon">🎯</div>
              <div class="card-content">
                <h3>Cartes & Loci</h3>
                <p>Entraînement spécifique : une carte = une position.</p>
                <div class="card-tags"><span class="tag tool">Exercice</span></div>
              </div>
              <div class="card-arrow">→</div>
            </div>

             <!-- Placeholder Palais -->
             <div class="glass-card course-card" (click)="go('/palais-builder')">
              <div class="card-icon">🏰</div>
              <div class="card-content">
                <h3>Constructeur de Palais</h3>
                <p>Outil de visualisation 3D de vos loci.</p>
                <div class="card-tags"><span class="tag tool">Nouveau</span></div>
              </div>
              <div class="card-arrow">→</div>
            </div>

          </div>
        </section>

      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #6366f1;
      --glass-bg: rgba(30, 41, 59, 0.7);
      --glass-border: 1px solid rgba(255, 255, 255, 0.08);
      --glass-hover: rgba(30, 41, 59, 0.9);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      
      --tag-theory: #38bdf8;
      --tag-tool: #10b981;
      --tag-advanced: #f59e0b;
      --tag-locked: #64748b;

      display: block;
    }

    .page-container {
      max-width: 1000px;
      margin: 0 auto;
      padding-bottom: 4rem;
    }

    /* HEADER */
    .header { text-align: center; margin-bottom: 3rem; animation: fadeIn 0.6s ease-out; }
    .academy-badge {
      display: inline-block; padding: 0.4rem 1rem; border-radius: 99px;
      background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3);
      color: #818cf8; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
      margin-bottom: 1rem;
    }
    .page-title { font-size: 3rem; font-weight: 800; margin: 0 0 1rem 0; color: white; line-height: 1.1; }
    .text-gradient {
      background: linear-gradient(135deg, #fff 0%, #818cf8 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .subtitle { font-size: 1.1rem; color: var(--text-muted); max-width: 600px; margin: 0 auto; line-height: 1.6; }

    /* DASHBOARD */
    .dashboard-grid { display: flex; flex-direction: column; gap: 3rem; animation: slideUp 0.6s ease-out; }
    .track-section { display: flex; flex-direction: column; gap: 1.5rem; }
    .track-title { font-size: 1.4rem; color: white; display: flex; align-items: center; gap: 0.5rem; margin: 0; }
    .cards-row {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    /* CARDS */
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: var(--glass-border);
      border-radius: 20px;
      padding: 1.5rem;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .course-card {
      display: flex; align-items: center; gap: 1rem; cursor: pointer; position: relative; overflow: hidden; min-height: 140px;
    }
    .course-card:hover:not(.locked) {
      transform: translateY(-5px); background: var(--glass-hover);
      border-color: rgba(99, 102, 241, 0.4); box-shadow: 0 15px 30px rgba(0,0,0,0.3);
    }
    .primary-card { border-left: 4px solid var(--primary); }
    
    .card-icon {
      font-size: 2.5rem; background: rgba(255,255,255,0.05); width: 64px; height: 64px;
      border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .card-content { flex: 1; }
    .card-content h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: white; }
    .card-content p { margin: 0 0 0.8rem 0; font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; }
    
    .card-tags { display: flex; gap: 0.5rem; }
    .tag { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; }
    .theory { background: rgba(56, 189, 248, 0.15); color: var(--tag-theory); }
    .tool { background: rgba(16, 185, 129, 0.15); color: var(--tag-tool); }
    .advanced { background: rgba(245, 158, 11, 0.15); color: var(--tag-advanced); }
    .locked-tag { background: rgba(100, 116, 139, 0.2); color: var(--tag-locked); }

    .card-arrow { color: var(--text-muted); font-size: 1.2rem; transition: transform 0.2s; }
    .course-card:hover .card-arrow { transform: translateX(5px); color: white; }

    .locked { opacity: 0.6; cursor: default; border-style: dashed; }
    .locked:hover { transform: none; box-shadow: none; border-color: var(--glass-border); }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @media (max-width: 600px) { .courses-grid { grid-template-columns: 1fr; } }
  `]
})
export class CoursComponent {
  constructor(private router: Router) {}
  go(path: string) { this.router.navigate([path]); }
}