import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { NgIf, AsyncPipe, NgClass } from '@angular/common';
import { AuthService } from './service/auth.service';         // Import du VRAI service
import { AntiCopyService } from './service/anti-copy.service'; // Import du VRAI service
import { AuthModalComponent } from './auth-modal.component'; // Import de la modale

@Component({
  selector: 'app-root',
  standalone: true,
  // On ajoute AuthModalComponent aux imports pour pouvoir l'utiliser dans le HTML
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, AsyncPipe, NgClass, AuthModalComponent],
  template: `
    <div class="app-layout">
      
      <!-- ARRIÈRE-PLAN DYNAMIQUE -->
      <div class="bg-gradient"></div>
      <div class="bg-grid"></div>

      <!-- NAVBAR -->
      <header class="navbar">
        <div class="navbar-container">
          
          <!-- LOGO -->
          <a routerLink="/" class="brand-logo" (click)="closeMenu()">
            <span class="brand-icon">🧠</span>
            <span class="brand-text">Orus</span>
          </a>

          <!-- NAVIGATION BUREAU -->
          <nav class="desktop-nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Accueil</a>
            <a routerLink="/normal" routerLinkActive="active" class="nav-link">Jeu Normal</a>
            <a routerLink="/classe" routerLinkActive="active" class="nav-link">Classé</a>
            <a routerLink="/versus" routerLinkActive="active" class="nav-link">Versus</a>
            <a routerLink="/cours" routerLinkActive="active" class="nav-link">Apprentissage</a>
          </nav>

          <!-- ACTIONS DROITE -->
          <div class="navbar-actions">
            <a routerLink="/offres" class="btn-premium desktop-only">
              <span>🚀 Early Access</span>
            </a>

            <!-- Menu Utilisateur (Connecté) -->
            <ng-container *ngIf="auth.user$ | async as user; else loginTemplate">
              <div class="user-dropdown-wrapper desktop-only">
                <button class="user-btn" (click)="toggleUserMenu()">
                  <div class="avatar">{{ (user.pseudo || user.email || 'U')[0].toUpperCase() }}</div>
                  <span class="username">{{ user.pseudo || 'Joueur' }}</span>
                </button>
                <div class="mini-dropdown" *ngIf="userMenuOpen">
                  <a routerLink="/profil" (click)="userMenuOpen = false">Mon Profil</a>
                  <button (click)="logout()" class="text-danger">Déconnexion</button>
                </div>
              </div>
            </ng-container>

            <!-- Bouton Connexion (Non connecté) -->
            <ng-template #loginTemplate>
              <button class="btn-login desktop-only" (click)="login()">Connexion</button>
            </ng-template>

            <!-- Menu Burger (Mobile) -->
            <button class="burger-btn mobile-only" [class.active]="menuOpen" (click)="toggleMenu($event)">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <!-- MENU MOBILE (Overlay) -->
      <div class="mobile-menu-overlay" [class.open]="menuOpen" (click)="closeMenu()">
        <div class="mobile-menu-panel" (click)="$event.stopPropagation()">
          
          <div class="mobile-header">
            <span class="mobile-title">Menu</span>
            <button class="close-btn" (click)="closeMenu()">✕</button>
          </div>

          <div class="mobile-links">
            <div class="section-label">Jeu</div>
            <a routerLink="/normal" (click)="closeMenu()" routerLinkActive="active-mobile">Partie Normale</a>
            <a routerLink="/classe" (click)="closeMenu()" routerLinkActive="active-mobile" class="highlight-text">Compétition Classée</a>
            <a routerLink="/versus" (click)="closeMenu()" routerLinkActive="active-mobile">Mode Versus</a>
            
            <div class="section-label">Progression</div>
            <a routerLink="/cours" (click)="closeMenu()" routerLinkActive="active-mobile">Cours & Outils</a>
            <a routerLink="/apropos" (click)="closeMenu()" routerLinkActive="active-mobile">À propos</a>

            <div class="mobile-cta-box">
              <a routerLink="/offres" (click)="closeMenu()" class="btn-premium full-width">
                Orus+ Early Access
              </a>
            </div>
          </div>

          <div class="mobile-footer">
            <ng-container *ngIf="auth.user$ | async as user; else mobileLogin">
              <div class="mobile-user-info">
                <div class="avatar small">{{ (user.pseudo || user.email || 'U')[0].toUpperCase() }}</div>
                <div class="user-details">
                  <span class="name">{{ user.pseudo || user.email }}</span>
                  <a routerLink="/profil" (click)="closeMenu()" class="profile-link">Voir mon profil</a>
                </div>
              </div>
              <button class="btn-logout-mobile" (click)="logout()">Se déconnecter</button>
            </ng-container>
            <ng-template #mobileLogin>
              <button class="btn-login full-width" (click)="login()">Se connecter</button>
            </ng-template>
          </div>

        </div>
      </div>

      <!-- CONTENU PRINCIPAL -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- MODALE D'AUTHENTIFICATION (C'est elle qui s'ouvre au clic sur "Connexion") -->
      <app-auth-modal></app-auth-modal>

    </div>
  `,
  styles: [`
    /* --- VARIABLES & RESET --- */
    :host {
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --accent: #f43f5e;
      --gold: #f59e0b;
      --bg-dark: #0f172a;
      --bg-card: rgba(30, 41, 59, 0.7);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --nav-height: 70px;
      --glass-border: 1px solid rgba(255, 255, 255, 0.08);
      display: block;
      font-family: 'Inter', system-ui, sans-serif;
    }

    /* --- LAYOUT GLOBAL --- */
    .app-layout {
      min-height: 100vh;
      color: var(--text-main);
      position: relative;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
    }

    /* --- BACKGROUNDS --- */
    .bg-gradient {
      position: fixed;
      inset: 0;
      background: radial-gradient(circle at top center, #1e293b 0%, #0f172a 60%, #020617 100%);
      z-index: -2;
    }
    .bg-grid {
      position: fixed;
      inset: 0;
      background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      z-index: -1;
      mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
    }

    /* --- NAVBAR --- */
    .navbar {
      height: var(--nav-height);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 50;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: var(--glass-border);
    }

    .navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
    }

    /* Brand */
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: white;
      font-weight: 800;
      font-size: 1.5rem;
      letter-spacing: -0.5px;
    }
    .brand-icon { font-size: 1.8rem; }
    .brand-text {
      background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Desktop Nav */
    .desktop-nav {
      display: none;
      gap: 2rem;
    }
    .nav-link {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
      transition: color 0.2s;
      position: relative;
      padding: 0.5rem 0;
    }
    .nav-link:hover { color: white; }
    .nav-link.active {
      color: white;
      text-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
    }
    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -24px;
      left: 0;
      width: 100%;
      height: 3px;
      background: var(--primary);
      border-radius: 3px 3px 0 0;
      box-shadow: 0 -2px 10px var(--primary);
    }

    /* Actions */
    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    /* Buttons */
    .btn-premium {
      background: linear-gradient(135deg, var(--gold), #ea580c);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 99px;
      font-weight: 700;
      font-size: 0.85rem;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
      white-space: nowrap;
    }
    .btn-premium:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
    }

    .btn-login {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      padding: 0.5rem 1.2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-login:hover { background: rgba(255,255,255,0.2); }

    /* User Avatar Button */
    .user-dropdown-wrapper { position: relative; }
    .user-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: transparent;
      border: none;
      cursor: pointer;
      color: white;
    }
    .avatar {
      width: 36px;
      height: 36px;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.9rem;
      border: 2px solid rgba(255,255,255,0.2);
    }
    .mini-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      width: 180px;
      padding: 0.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
    }
    .mini-dropdown a, .mini-dropdown button {
      text-align: left;
      background: none;
      border: none;
      padding: 0.6rem 0.8rem;
      color: #cbd5e1;
      font-size: 0.9rem;
      cursor: pointer;
      border-radius: 6px;
      text-decoration: none;
    }
    .mini-dropdown a:hover, .mini-dropdown button:hover {
      background: rgba(255,255,255,0.05);
      color: white;
    }
    .text-danger { color: #fca5a5 !important; }

    /* --- MOBILE MENU --- */
    .mobile-menu-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
      backdrop-filter: blur(4px);
    }
    .mobile-menu-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }

    .mobile-menu-panel {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 280px;
      background: #1e293b;
      box-shadow: -5px 0 30px rgba(0,0,0,0.5);
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      border-left: 1px solid rgba(255,255,255,0.1);
    }
    .mobile-menu-overlay.open .mobile-menu-panel {
      transform: translateX(0);
    }

    .mobile-header {
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .mobile-title { font-weight: 700; font-size: 1.2rem; }
    .close-btn { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; }

    .mobile-links {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .section-label {
      text-transform: uppercase;
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-top: 1rem;
      margin-bottom: 0.25rem;
      letter-spacing: 1px;
    }
    .mobile-links a {
      color: #e2e8f0;
      text-decoration: none;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      background: rgba(255,255,255,0.03);
      font-weight: 500;
    }
    .mobile-links a.active-mobile {
      background: rgba(99, 102, 241, 0.15);
      color: var(--primary);
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .highlight-text { color: var(--gold) !important; }

    .mobile-cta-box { margin-top: 1.5rem; }
    .full-width { width: 100%; display: block; text-align: center; }

    .mobile-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.05);
      background: rgba(0,0,0,0.2);
    }
    .mobile-user-info { display: flex; gap: 0.8rem; align-items: center; margin-bottom: 1rem; }
    .avatar.small { width: 40px; height: 40px; font-size: 1rem; }
    .user-details { display: flex; flex-direction: column; }
    .user-details .name { font-weight: 600; font-size: 0.9rem; }
    .user-details .profile-link { font-size: 0.8rem; color: var(--primary); text-decoration: none; }
    .btn-logout-mobile {
      width: 100%;
      background: transparent;
      border: 1px solid rgba(248, 113, 113, 0.3);
      color: #fca5a5;
      padding: 0.6rem;
      border-radius: 8px;
      cursor: pointer;
    }

    /* BURGER ICON STYLING */
    .burger-btn {
      background: none;
      border: none;
      width: 30px;
      height: 24px;
      position: relative;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0;
    }
    .burger-btn span {
      display: block;
      width: 100%;
      height: 2px;
      background: white;
      border-radius: 2px;
      transition: all 0.3s;
    }
    .burger-btn.active span:nth-child(1) { transform: rotate(45deg) translate(6px, 6px); }
    .burger-btn.active span:nth-child(2) { opacity: 0; }
    .burger-btn.active span:nth-child(3) { transform: rotate(-45deg) translate(6px, -7px); }

    /* --- MAIN CONTENT --- */
    .main-content {
      flex: 1;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: calc(var(--nav-height) + 2rem) 1.5rem 2rem;
    }

    /* --- RESPONSIVE MEDIA QUERIES --- */
    @media (min-width: 900px) {
      .desktop-nav { display: flex; }
      .desktop-only { display: flex !important; }
      .mobile-only { display: none !important; }
    }
    @media (max-width: 899px) {
      .desktop-only { display: none !important; }
      .mobile-only { display: flex !important; }
    }
  `]
})
export class AppComponent implements OnInit {
  menuOpen = false;
  userMenuOpen = false;

  constructor(
    public auth: AuthService,
    private antiCopy: AntiCopyService
  ) {}

  ngOnInit(): void {
    this.antiCopy.init();
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
    this.userMenuOpen = false;
  }

  login() {
    this.closeMenu();
    this.auth.openAuth(); // Ouvre maintenant la vraie modale de connexion
  }

  logout() {
    this.closeMenu();
    this.auth.signOut();
  }
}