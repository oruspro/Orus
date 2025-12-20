import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LeaderboardService, RankedEntry } from '../service/leaderboard.service';
import { AuthService } from '../service/auth.service';
import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, AsyncPipe],
  template: `
    <div class="page-container">

      <!-- HERO SECTION -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-badge">Entraînement Cognitif Avancé</div>
          <h1 class="hero-title">
            Passez votre mémoire au <br>
            <span class="text-gradient">Niveau Supérieur</span>
          </h1>
          <p class="hero-subtitle">
            Orus est la plateforme d'entraînement mental inspirée de l'esport.
            Mesurez, structurez et optimisez vos performances cognitives.
          </p>

          <div class="hero-actions">
            <button class="btn-primary cta-main" (click)="go('normal')">
              <span class="icon">▶</span> Lancer une session
            </button>
            <button class="btn-secondary cta-sub" (click)="scrollToModes()">
              Explorer les modes
            </button>
          </div>

          <!-- METRICS HUD -->
          <div class="hero-stats glass-card">
            <div class="stat-item">
              <div class="stat-value">300+</div>
              <div class="stat-label">Chiffres / session</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">52</div>
              <div class="stat-label">Cartes (ordre exact)</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value">∞</div>
              <div class="stat-label">Potentiel</div>
            </div>
          </div>
        </div>
      </section>

      <!-- LEADERBOARD PREVIEW -->
      <section class="leaderboard-preview">
        <div class="preview-header">
          <h3>🏆 Champions du moment (Chiffres)</h3>
          <button class="btn-link" (click)="go('classe')">Voir tout le classement →</button>
        </div>
        
        <div class="podium-grid">
          <div class="podium-card" *ngFor="let p of topPlayers; let i = index">
            <div class="rank-number">#{{ i + 1 }}</div>
            <div class="player-avatar">{{ p.pseudo[0].toUpperCase() }}</div>
            <div class="player-name">{{ p.pseudo }}</div>
            <div class="player-score">{{ p.score }} pts</div>
          </div>
        </div>
      </section>

      <!-- MODES DE JEU (GRID) -->
      <section class="modes-section" id="modes">
        <div class="section-header">
          <h2>Choisissez votre arène</h2>
          <p>Des formats adaptés pour l'apprentissage ou la compétition.</p>
        </div>

        <!-- 
           CORRECTION ICI :
           On utilise un objet { u: ... } pour que le *ngIf soit toujours vrai (l'objet existe),
           même si l'utilisateur à l'intérieur est null.
           Cela permet d'afficher la grille même si on est déconnecté.
        -->
        <ng-container *ngIf="{ currentUser: auth.user$ | async } as authState">
          <div class="modes-grid">
            
            <!-- MODE NORMAL -->
            <div class="mode-card interactive-card" (click)="go('normal')">
              <div class="mode-icon">🎮</div>
              <div class="mode-info">
                <h3>Entraînement Libre</h3>
                <p>Sans pression. Testez vos techniques et affinez vos images mentales à votre rythme.</p>
              </div>
              <div class="mode-arrow">→</div>
            </div>

            <!-- MODE CLASSÉ -->
            <div class="mode-card interactive-card ranked" (click)="go('classe')">
              <div class="mode-icon">🏆</div>
              <div class="mode-info">
                <div class="card-title-row">
                  <h3>Mode Classé</h3>
                  <span class="limit-badge">5/jour (Gratuit)</span>
                </div>
                <p>Grimpez dans le ladder. Système Elo compétitif.</p>
              </div>
              <div class="mode-arrow">→</div>
            </div>

            <!-- MODE VERSUS -->
            <div class="mode-card interactive-card" (click)="go('versus')">
              <div class="mode-icon">⚔️</div>
              <div class="mode-info">
                <h3>Versus (Multi)</h3>
                <p>Duels en temps réel. Mêmes données, même chrono. Que le meilleur gagne.</p>
              </div>
              <div class="mode-arrow">→</div>
            </div>

            <!-- COURS -->
            <div class="mode-card interactive-card learning" (click)="go('cours')">
              <div class="mode-icon">📚</div>
              <div class="mode-info">
                <h3>Académie</h3>
                <p>Apprenez les techniques des champions (Palais Mental, Grand Système).</p>
              </div>
              <div class="mode-arrow">→</div>
            </div>

            <!-- FOCUS ROOM (VERROUILLAGE PREMIUM) -->
            <!-- On vérifie authState.currentUser?.isPremium -->
            <div class="mode-card interactive-card focus-card" 
                 [class.locked]="!authState.currentUser?.isPremium"
                 (click)="handleFocusClick(authState.currentUser)">
              
              <div class="mode-icon">👁️</div>
              <div class="mode-info">
                <div class="card-title-row">
                  <h3>Salle de Focus</h3>
                  <span *ngIf="!authState.currentUser?.isPremium" class="lock-badge">🔒 Premium</span>
                </div>
                <p>Échauffement visuel. Préparez votre "œil mental" avant la session.</p>
              </div>
              
              <div class="mode-arrow">
                {{ authState.currentUser?.isPremium ? '→' : '🔒' }}
              </div>
            </div>

          </div>
        </ng-container>
      </section>

      <!-- FEATURES / POURQUOI -->
      <section class="features-section">
        <div class="section-header">
          <h2>Pourquoi s'entraîner ?</h2>
        </div>

        <div class="features-grid">
          <div class="feature-box solid-card">
            <div class="feature-icon">🧠</div>
            <h4>Neuroplasticité</h4>
            <p>La mémoire est une compétence qui se muscle par la répétition ciblée.</p>
          </div>
          <div class="feature-box solid-card">
            <div class="feature-icon">⚡</div>
            <h4>Vitesse & Focus</h4>
            <p>Améliorez votre concentration et réduisez votre temps de traitement de l'information.</p>
          </div>
          <div class="feature-box solid-card">
            <div class="feature-icon">🎓</div>
            <h4>Quotidien & Études</h4>
            <p>Retenez plus facilement cours, noms, listes et concepts complexes.</p>
          </div>
        </div>
      </section>

      <!-- FOOTER CTA -->
      <section class="footer-cta glass-card">
        <div class="cta-content">
          <h2>Rejoignez l'élite cognitive</h2>
          <p>Commencez votre ascension dès maintenant. C'est gratuit.</p>
          <button class="btn-gold" (click)="go('offres')">Voir les offres Orus+</button>
        </div>
      </section>

      <!-- FOOTER CONTACT -->
      <footer class="main-footer">
        <p>Un bug ? Une suggestion ? L'équipe est à l'écoute.</p>
        <a href="mailto:contact@orus-mind.com?subject=Feedback%20Orus%20Mind" class="btn-contact">
          <span class="icon">💬</span> Nous contacter
        </a>
      </footer>

    </div>
  `,
  styles: [`
    :host {
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --glass-bg: rgba(30, 41, 59, 0.6);
      --glass-border: 1px solid rgba(255, 255, 255, 0.08);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --gold: #f59e0b;
      
      --feature-bg: #112a2a; 
      --feature-border: #1d4d4d;
      --feature-accent: #2dd4bf;
    }

    .page-container {
      max-width: 1100px;
      margin: 0 auto;
      padding-bottom: 2rem;
    }

    /* --- HERO SECTION --- */
    .hero-section {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      position: relative;
      padding: 2rem 1rem;
    }
    .hero-content { max-width: 800px; z-index: 2; }
    .hero-badge {
      display: inline-block; padding: 0.4rem 1rem; border-radius: 99px;
      background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3);
      color: #818cf8; font-size: 0.8rem; font-weight: 600; letter-spacing: 1px;
      text-transform: uppercase; margin-bottom: 1.5rem; animation: fadeInDown 0.8s ease-out;
    }
    .hero-title {
      font-size: 3.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem; color: white;
      animation: fadeInUp 0.8s ease-out 0.2s backwards;
    }
    .text-gradient {
      background: linear-gradient(135deg, #fff 0%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 1.2rem; color: var(--text-muted); margin-bottom: 2.5rem; line-height: 1.6;
      max-width: 600px; margin-left: auto; margin-right: auto; animation: fadeInUp 0.8s ease-out 0.4s backwards;
    }
    .hero-actions {
      display: flex; gap: 1rem; justify-content: center; margin-bottom: 4rem;
      animation: fadeInUp 0.8s ease-out 0.6s backwards;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--primary-hover));
      color: white; border: none; padding: 0.8rem 2rem; border-radius: 99px; font-weight: 600;
      font-size: 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
      transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5); }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.05); color: white; border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.8rem 2rem; border-radius: 99px; font-weight: 600; font-size: 1rem; cursor: pointer;
      transition: background 0.2s;
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }

    .hero-stats {
      display: flex; justify-content: space-around; align-items: center; padding: 1.5rem;
      border-radius: 20px; max-width: 600px; margin: 0 auto;
      animation: fadeInUp 0.8s ease-out 0.8s backwards;
    }
    .stat-item { flex: 1; }
    .stat-value { font-size: 1.8rem; font-weight: 800; color: white; margin-bottom: 0.2rem; }
    .stat-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.1); }

    /* --- LEADERBOARD PREVIEW --- */
    .leaderboard-preview {
      max-width: 800px; margin: 0 auto 4rem; padding: 0 1rem; animation: fadeInUp 0.8s ease-out 1s backwards;
    }
    .preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .preview-header h3 { font-size: 1.2rem; color: white; margin: 0; }
    .btn-link { background: none; border: none; color: var(--gold); cursor: pointer; font-size: 0.9rem; text-decoration: underline; }
    
    .podium-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .podium-card {
      background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px; padding: 1rem; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
    }
    .rank-number { font-size: 0.8rem; color: #64748b; font-weight: 700; }
    .player-avatar {
      width: 40px; height: 40px; border-radius: 50%; background: var(--primary);
      color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;
    }
    .player-name { font-weight: 600; color: white; font-size: 0.9rem; }
    .player-score { color: var(--gold); font-weight: 700; font-family: monospace; }

    /* --- MODES GRID --- */
    .modes-section { padding: 4rem 1rem; }
    .section-header { text-align: center; margin-bottom: 3rem; }
    .section-header h2 { font-size: 2.2rem; margin-bottom: 0.5rem; color: white; }
    .section-header p { color: var(--text-muted); }

    .modes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .mode-card {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7));
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    
    .mode-card::before {
      content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
      background: var(--primary); opacity: 0; transition: opacity 0.3s;
    }
    .mode-card:hover { transform: translateY(-5px); border-color: rgba(99, 102, 241, 0.4); }
    .mode-card:hover::before { opacity: 1; }

    .mode-card.ranked:hover { border-color: var(--gold); }
    .mode-card.ranked::before { background: var(--gold); }
    
    /* STYLE FOCUS CARD (SPECIFIQUE) */
    .focus-card:hover { border-color: #a855f7; }
    .focus-card:hover::before { background: #a855f7; }

    /* STYLE LOCKED (GRISÉ) */
    .mode-card.locked {
      filter: grayscale(0.8);
      opacity: 0.8;
      border-color: rgba(255, 255, 255, 0.05);
    }
    .mode-card.locked:hover {
      filter: grayscale(0.5); /* Se colore un peu au survol */
      opacity: 1;
      transform: translateY(-2px);
      border-color: var(--gold); /* Bordure or pour suggérer l'upgrade */
    }
    .mode-card.locked:hover::before { background: var(--gold); opacity: 0.5; }

    .lock-badge {
      font-size: 0.7rem; background: rgba(0, 0, 0, 0.3); color: #fbbf24;
      border: 1px solid #fbbf24; padding: 0.1rem 0.4rem; border-radius: 4px;
      font-weight: 700; white-space: nowrap; text-transform: uppercase;
    }

    .mode-icon { font-size: 2.5rem; }
    .mode-info { flex: 1; }
    .mode-info h3 { margin: 0 0 0.5rem 0; font-size: 1.2rem; color: white; }
    .mode-info p { margin: 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; }
    .mode-arrow { margin-left: auto; font-size: 1.5rem; color: var(--text-muted); opacity: 0; transform: translateX(-10px); transition: all 0.3s; }
    .mode-card:hover .mode-arrow { opacity: 1; transform: translateX(0); color: white; }
    
    .card-title-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.3rem; }
    .limit-badge { font-size: 0.65rem; background: rgba(245, 158, 11, 0.15); color: var(--gold); border: 1px solid rgba(245, 158, 11, 0.3); padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 700; white-space: nowrap; }

    /* --- FEATURES --- */
    .features-section { padding: 2rem 1rem 6rem; }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }
    
    .feature-box {
      background: linear-gradient(145deg, #112a2a, #0d2222); 
      border: 1px solid var(--feature-border);
      text-align: center;
      padding: 2rem;
      cursor: default; 
      transition: all 0.2s ease;
      border-radius: 20px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }
    
    .feature-box::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--feature-accent), #0ea5e9);
      opacity: 0.9;
    }

    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      display: inline-block;
      padding: 1rem;
      background: #0f172a; 
      color: var(--feature-accent); 
      border: 1px solid var(--feature-border);
      border-radius: 50%;
      box-shadow: 0 0 15px rgba(45, 212, 191, 0.1);
    }
    .feature-box h4 { font-size: 1.2rem; margin-bottom: 0.8rem; color: #f0fdfa; font-weight: 700; }
    .feature-box p { color: #99f6e4; font-size: 0.95rem; line-height: 1.6; opacity: 0.8; }

    /* --- FOOTER CTA --- */
    .footer-cta {
      text-align: center;
      padding: 4rem 2rem;
      background: linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9));
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .footer-cta h2 { font-size: 2rem; color: white; margin-bottom: 1rem; }
    .btn-gold {
      background: linear-gradient(135deg, var(--gold), #d97706);
      color: #1e293b;
      border: none;
      padding: 1rem 2.5rem;
      border-radius: 99px;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      margin-top: 2rem;
      transition: transform 0.2s;
    }
    .btn-gold:hover { transform: scale(1.05); }

    /* --- MAIN FOOTER --- */
    .main-footer {
      margin-top: 4rem;
      padding: 2rem 0;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.05);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .main-footer p { color: var(--text-muted); font-size: 0.9rem; margin: 0; }
    
    .btn-contact {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: #cbd5e1;
      text-decoration: none;
      padding: 0.6rem 1.2rem;
      border-radius: 99px;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .btn-contact:hover {
      background: rgba(255,255,255,0.1);
      color: white;
      border-color: rgba(255,255,255,0.25);
      transform: translateY(-2px);
    }

    /* --- GLASS CARD UTIL --- */
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: var(--glass-border);
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    /* ANIMATIONS */
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 768px) {
      .hero-title { font-size: 2.5rem; }
      .hero-actions { flex-direction: column; width: 100%; max-width: 300px; margin-left: auto; margin-right: auto; }
      .hero-stats { flex-direction: column; gap: 1.5rem; }
      .stat-divider { width: 40px; height: 1px; }
      .podium-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private lbService = inject(LeaderboardService);
  public auth = inject(AuthService);
  topPlayers: RankedEntry[] = [];

  constructor(private router: Router) {}

  async ngOnInit() {
    const entries = await this.lbService.getLeaderboard('chiffres');
    
    if (entries && entries.length > 0) {
      this.topPlayers = entries.slice(0, 3);
    } else {
      this.topPlayers = [
        { uid: 'bot1', pseudo: 'NeuroKing', score: 98, updatedAt: '' },
        { uid: 'bot2', pseudo: 'OrusAlpha', score: 92, updatedAt: '' },
        { uid: 'bot3', pseudo: 'MemoMaster', score: 85, updatedAt: '' }
      ];
    }
  }

  go(path: string): void {
    this.router.navigate(['/' + path]);
  }

  handleFocusClick(user: any): void {
    if (user && user.isPremium) {
      this.go('focus');
    } else {
      this.go('offres');
    }
  }

  scrollToModes(): void {
    const el = document.getElementById('modes');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}