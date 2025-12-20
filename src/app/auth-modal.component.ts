import { Component } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './service/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [NgIf, NgClass, FormsModule],
  template: `
    <!-- FOND FLOU AVEC ANIMATION -->
    <div
      *ngIf="auth.showAuth"
      class="modal-backdrop"
      (click)="auth.closeAuth()"
    >
      <!-- CONTENEUR DE LA MODALE -->
      <div
        class="modal-glass"
        (click)="$event.stopPropagation()"
      >
        <!-- EN-TÊTE -->
        <div class="modal-header">
          <div class="header-content">
            <span class="brand-icon">🧠</span>
            <h3 class="modal-title">
              {{ mode === 'in' ? 'Connexion' : 'Rejoindre Orus' }}
            </h3>
          </div>
          <button class="close-btn" (click)="auth.closeAuth()">✕</button>
        </div>

        <!-- FORMULAIRE -->
        <form (ngSubmit)="onSubmit()" class="modal-form">
          
          <!-- CHAMP EMAIL -->
          <div class="input-group">
            <label>Email</label>
            <div class="input-wrapper">
              <span class="input-icon">✉️</span>
              <input
                [(ngModel)]="email"
                name="email"
                type="email"
                placeholder="exemple@email.com"
                required
                autocomplete="email"
              />
            </div>
          </div>

          <!-- CHAMP PSEUDO (Inscription uniquement) -->
          <div class="input-group" *ngIf="mode === 'up'">
            <label>Pseudo de joueur</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input
                [(ngModel)]="pseudo"
                name="pseudo"
                type="text"
                placeholder="Votre nom de guerre"
                autocomplete="nickname"
              />
            </div>
          </div>

          <!-- CHAMP MOT DE PASSE -->
          <div class="input-group">
            <label>Mot de passe</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                [(ngModel)]="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />
            </div>
          </div>

          <!-- MESSAGE D'ERREUR -->
          <div class="error-msg" *ngIf="msg">
            <span class="error-icon">⚠️</span> {{ msg }}
          </div>

          <!-- BOUTON D'ACTION -->
          <button type="submit" class="btn-submit">
            {{ mode === 'in' ? 'Se lancer' : 'Créer mon compte' }}
          </button>

          <!-- TOGGLE MODE (Connexion <-> Inscription) -->
          <div class="switch-mode">
            <span class="text-muted">
              {{ mode === 'in' ? 'Pas encore de compte ?' : 'Déjà membre ?' }}
            </span>
            <button type="button" class="btn-link" (click)="toggleMode()">
              {{ mode === 'in' ? 'Créer un compte' : 'Se connecter' }}
            </button>
          </div>

        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --bg-input: rgba(15, 23, 42, 0.6);
      --border-color: rgba(255, 255, 255, 0.1);
      --text-muted: #94a3b8;
    }

    /* --- BACKDROP --- */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px); /* Effet flou moderne */
      z-index: 100;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      animation: fadeIn 0.3s ease-out;
    }

    /* --- MODAL CARD --- */
    .modal-glass {
      width: 100%;
      max-width: 400px;
      background: rgba(30, 41, 59, 0.75); /* Slate transluscide */
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      position: relative;
      overflow: hidden;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Effet de lueur en haut de la modale */
    .modal-glass::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    }

    /* --- HEADER --- */
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .header-content { display: flex; align-items: center; gap: 0.8rem; }
    .brand-icon { font-size: 1.5rem; }
    .modal-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.2rem;
      transition: color 0.2s;
    }
    .close-btn:hover { color: white; }

    /* --- FORM --- */
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    label {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-left: 0.2rem;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      font-size: 1rem;
      opacity: 0.7;
      pointer-events: none;
    }

    input {
      width: 100%;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 0.8rem 1rem 0.8rem 2.8rem; /* Padding gauche pour l'icône */
      color: white;
      font-size: 0.95rem;
      transition: all 0.2s;
      outline: none;
    }

    input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
      background: rgba(15, 23, 42, 0.9);
    }

    input::placeholder { color: rgba(148, 163, 184, 0.4); }

    /* --- MESSAGES --- */
    .error-msg {
      background: rgba(244, 63, 94, 0.1);
      border: 1px solid rgba(244, 63, 94, 0.3);
      color: #fda4af;
      padding: 0.6rem;
      border-radius: 8px;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* --- BUTTONS --- */
    .btn-submit {
      margin-top: 0.5rem;
      width: 100%;
      background: linear-gradient(135deg, var(--primary), #4f46e5);
      border: none;
      padding: 0.9rem;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }

    .btn-submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
    }

    .switch-mode {
      text-align: center;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }
    
    .text-muted { color: var(--text-muted); margin-right: 0.4rem; }

    .btn-link {
      background: none;
      border: none;
      color: var(--primary);
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      padding: 0;
    }
    .btn-link:hover { text-decoration: underline; color: #818cf8; }

    /* --- ANIMATIONS --- */
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { 
      from { opacity: 0; transform: translateY(20px) scale(0.95); } 
      to { opacity: 1; transform: translateY(0) scale(1); } 
    }
  `]
})
export class AuthModalComponent {
  mode: 'in' | 'up' = 'in';
  email = '';
  password = '';
  pseudo = '';
  msg: string | null = null;

  constructor(public auth: AuthService) {}

  toggleMode() {
    this.mode = this.mode === 'in' ? 'up' : 'in';
    this.msg = null;
  }

  async onSubmit() {
    this.msg = null;

    if (this.mode === 'up' && !this.pseudo.trim()) {
      this.msg = 'Choisissez un pseudo.';
      return;
    }

    try {
      if (this.mode === 'up') {
        await this.auth.signUp(this.email, this.password, this.pseudo.trim());
      } else {
        await this.auth.signIn(this.email, this.password);
      }
      this.auth.closeAuth();
    } catch (e) {
      this.msg = 'Une erreur est survenue. Vérifiez vos identifiants.';
    }
  }
}