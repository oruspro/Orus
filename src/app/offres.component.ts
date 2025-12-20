import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Restored for promo code
import { AuthService } from './service/auth.service';
import { firstValueFrom } from 'rxjs';
import { getFunctions, httpsCallable } from 'firebase/functions'; // Standard Firebase SDK
import { getApp } from 'firebase/app'; // To get the current app instance

@Component({
  selector: 'app-offres',
  standalone: true,
  imports: [RouterLink, NgIf, AsyncPipe, FormsModule],
  template: `
    <div class="page-container">
      
      <!-- HEADER -->
      <header class="header">
        <a routerLink="/" class="back-link">
          <span class="icon">←</span> Retour au QG
        </a>
        <div class="header-content">
          <h1 class="page-title">
            Devenez <span class="text-gold">Membre Fondateur</span>
          </h1>
          <p class="subtitle">
            Profitez de l'offre de lancement avant l'augmentation du prix public.
          </p>
        </div>
      </header>

      <div class="offers-grid">
        
        <!-- CARTE PRINCIPALE (PREMIUM) -->
        <section class="glass-card premium-card">
          <div class="card-glow"></div>
          <div class="badge-best">Offre Limitée</div>
          
          <div class="card-header">
            <h3>Orus+ <span class="version">Early Access</span></h3>
            
            <div class="pricing-display">
              <span class="old-price">39,90 €</span>
              <div class="current-price-block">
                <span class="currency">€</span>
                <span class="amount">19,90</span>
                <span class="frequency">/ à vie</span>
              </div>
            </div>

            <p class="payment-info">Paiement unique. Aucun abonnement caché.</p>
          </div>

          <div class="features-list">
            
            <!-- AVANTAGE 1 : JEU ILLIMITÉ -->
            <div class="feature-item">
              <div class="check-circle">🏆</div>
              <div class="feature-text">
                <strong>Mode Classé Illimité</strong>
                <p>Plus aucune limite de parties. Grimpez dans le classement Elo aussi vite que vous le pouvez.</p>
              </div>
            </div>

            <!-- AVANTAGE 2 : COURS -->
            <div class="feature-item">
              <div class="check-circle">📚</div>
              <div class="feature-text">
                <strong>Académie & Cours Complets</strong>
                <p>Accès à tous les modules d'apprentissage : Palais Mental, Grand Système, et techniques avancées.</p>
              </div>
            </div>

            <!-- AVANTAGE 3 : OUTILS EXCLUSIFS -->
            <div class="feature-item">
              <div class="check-circle">🧠</div>
              <div class="feature-text">
                <strong>Outils d'Entraînement Exclusifs</strong>
                <p>Débloquez la <em>Salle de Focus</em> pour la visualisation, et les futurs outils de concentration.</p>
              </div>
            </div>

            <!-- AVANTAGE 4 : BADGE -->
            <div class="feature-item">
              <div class="check-circle">👑</div>
              <div class="feature-text">
                <strong>Badge "Fondateur"</strong>
                <p>Un statut Gold visible sur votre profil et dans le classement à jamais.</p>
              </div>
            </div>

          </div>

          <!-- ÉTAT PREMIUM -->
          <ng-container *ngIf="auth.user$ | async as user; else buyButton">
            <div *ngIf="user.isPremium" class="premium-active-msg">
              <span class="icon">✨</span>
              Vous êtes déjà Membre Fondateur. Merci !
            </div>
            <button *ngIf="!user.isPremium" class="btn-gold-glow" (click)="buy()" [disabled]="isLoading">
              {{ isLoading ? 'Chargement de Stripe...' : 'Sécuriser ce prix maintenant' }}
            </button>
          </ng-container>
          
          <ng-template #buyButton>
            <button class="btn-gold-glow" (click)="buy()" [disabled]="isLoading">
              {{ isLoading ? 'Chargement de Stripe...' : 'Sécuriser ce prix maintenant' }}
            </button>
          </ng-template>
          
          <div class="guarantee-row">
            <span class="icon">🛡️</span> Satisfait ou remboursé (14 jours)
          </div>
        </section>

        <!-- INFO / FAQ -->
        <div class="info-column">
          
          <!-- POURQUOI CE PRIX -->
          <section class="glass-card info-card">
            <h4>Pourquoi cette réduction ?</h4>
            <p>
              Orus est en phase de construction active. En nous rejoignant maintenant, 
              vous financez les serveurs et le développement des prochains outils.
            </p>
            <p>
              En échange de votre confiance, nous vous offrons l'accès à vie 
              pour <strong>19,90 €</strong>. Le prix passera à 39,90 € (ou abonnement) une fois la version 1.0 finalisée.
            </p>
          </section>

          <!-- ÉTAT DU COMPTE -->
          <section class="glass-card account-card">
            <h4>Compte bénéficiaire</h4>
            
            <ng-container *ngIf="auth.user$ | async as user; else noUser">
              <div class="user-status logged-in" [class.premium]="user.isPremium">
                <div class="avatar">{{ (user.pseudo || 'U')[0].toUpperCase() }}</div>
                <div class="status-details">
                  <span class="username">{{ user.pseudo || user.email }}</span>
                  <span class="plan">{{ user.isPremium ? 'Membre Fondateur 👑' : 'Membre Gratuit' }}</span>
                </div>
              </div>
              <p class="status-hint success" *ngIf="!user.isPremium">✓ Prêt pour l'activation</p>
              <p class="status-hint gold" *ngIf="user.isPremium">L'offre est déjà active sur ce compte.</p>
            </ng-container>

            <ng-template #noUser>
              <div class="user-status logged-out">
                <div class="status-icon">👤</div>
                <div class="status-details">
                  <span>Non connecté</span>
                  <button class="btn-link" (click)="auth.openAuth()">Se connecter</button>
                </div>
              </div>
              <p class="status-hint warning">Connectez-vous pour activer l'offre.</p>
            </ng-template>
          </section>

          <!-- ZONE CODE PROMO (RESTORÉE) -->
          <section class="glass-card promo-card">
            <h4>Code d'activation</h4>
            <div class="promo-input-group">
              <input 
                type="text" 
                [(ngModel)]="promoCode" 
                placeholder="Code partenaire..."
                [disabled]="loadingPromo"
              >
              <button (click)="submitCode()" [disabled]="loadingPromo || !promoCode">
                {{ loadingPromo ? '...' : 'Activer' }}
              </button>
            </div>
            <p class="promo-feedback" *ngIf="promoMsg" [class.error]="promoError">
              {{ promoMsg }}
            </p>
          </section>

        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      --gold: #f59e0b;
      --gold-light: #fbbf24;
      --gold-dark: #b45309;
      --glass-bg: rgba(30, 41, 59, 0.6);
      --glass-border: 1px solid rgba(255, 255, 255, 0.08);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --success: #10b981;
      --error: #f43f5e;
    }

    .page-container {
      max-width: 1100px;
      margin: 0 auto;
      padding-bottom: 4rem;
    }

    /* --- HEADER --- */
    .header {
      text-align: center;
      margin-bottom: 3rem;
      position: relative;
    }
    .back-link {
      position: absolute;
      left: 0;
      top: 0;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    .back-link:hover { color: white; }

    .page-title {
      font-size: 3rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
      color: white;
      line-height: 1.1;
    }
    .text-gold {
      background: linear-gradient(135deg, #fff 0%, var(--gold) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { color: var(--text-muted); font-size: 1.1rem; }

    /* --- GRID --- */
    .offers-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 2rem;
      align-items: start;
    }

    /* --- GLASS CARD --- */
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: var(--glass-border);
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }

    /* --- PREMIUM CARD --- */
    .premium-card {
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 2.5rem;
    }
    /* Glow effect behind card */
    .card-glow {
      position: absolute;
      top: -50%; left: -50%;
      width: 200%; height: 200%;
      background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 60%);
      pointer-events: none;
      z-index: 0;
    }
    .badge-best {
      position: absolute;
      top: 1.5rem; right: 1.5rem;
      background: rgba(245, 158, 11, 0.2);
      color: var(--gold-light);
      border: 1px solid var(--gold);
      padding: 0.3rem 0.8rem;
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .card-header { text-align: center; margin-bottom: 2rem; position: relative; z-index: 1; }
    .card-header h3 { font-size: 1.5rem; margin: 0 0 1.5rem 0; color: white; }
    .version { color: var(--gold); font-weight: 300; }
    
    /* PRICING BLOCK */
    .pricing-display {
      display: flex; flex-direction: column; align-items: center; margin-bottom: 0.5rem;
    }
    .old-price {
      text-decoration: line-through;
      color: var(--text-muted);
      font-size: 1.2rem;
      margin-bottom: -0.5rem;
    }
    .current-price-block { display: flex; align-items: baseline; gap: 0.2rem; }
    .currency { font-size: 1.5rem; color: var(--gold); font-weight: 600; }
    .amount { font-size: 4rem; font-weight: 800; color: var(--gold); line-height: 1; }
    .frequency { color: var(--text-muted); font-size: 1.1rem; }
    .payment-info { color: #86efac; font-size: 0.9rem; margin: 0; font-weight: 500; }

    .features-list { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2.5rem; position: relative; z-index: 1; }
    
    .feature-item { display: flex; gap: 1rem; align-items: flex-start; }
    
    .check-circle { 
      background: rgba(245, 158, 11, 0.1); 
      color: var(--gold); 
      width: 32px; height: 32px; border-radius: 50%; 
      display: flex; align-items: center; justify-content: center; 
      font-size: 1.2rem; flex-shrink: 0; margin-top: 0.1rem;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    
    .feature-text strong { display: block; color: white; margin-bottom: 0.2rem; font-size: 1.05rem; }
    .feature-text p { margin: 0; color: var(--text-muted); font-size: 0.9rem; line-height: 1.4; }

    .btn-gold-glow {
      width: 100%;
      background: linear-gradient(135deg, var(--gold), var(--gold-dark));
      border: none;
      padding: 1.2rem;
      border-radius: 12px;
      color: white;
      font-size: 1.2rem;
      font-weight: 700;
      cursor: pointer;
      position: relative;
      z-index: 1;
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-gold-glow:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(245, 158, 11, 0.6); }
    .btn-gold-glow:disabled { opacity: 0.7; cursor: wait; transform: none; }

    .guarantee-row { 
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      margin-top: 1rem; color: var(--text-muted); font-size: 0.85rem; 
    }

    .premium-active-msg {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      padding: 1rem;
      border-radius: 12px;
      text-align: center;
      font-weight: 600;
    }

    /* --- INFO COLUMN --- */
    .info-column { display: flex; flex-direction: column; gap: 1.5rem; }
    
    .info-card h4, .account-card h4, .promo-card h4 { color: white; margin: 0 0 1rem 0; font-size: 1.1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; }
    .info-card p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem; }
    .info-card p:last-child { margin-bottom: 0; }

    .user-status {
      display: flex; align-items: center; gap: 1rem;
      background: rgba(255,255,255,0.05);
      padding: 1rem; border-radius: 12px;
      margin-bottom: 0.5rem;
    }
    .user-status.premium { border: 1px solid var(--gold); background: rgba(245, 158, 11, 0.1); }
    
    .avatar {
      width: 40px; height: 40px; background: var(--gold); color: #1e293b;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-weight: bold; font-size: 1.2rem;
    }
    .status-icon { font-size: 1.5rem; }
    .status-details { display: flex; flex-direction: column; }
    .username { color: white; font-weight: 600; font-size: 0.95rem; }
    .plan { color: var(--text-muted); font-size: 0.8rem; }
    .plan.premium { color: var(--gold); font-weight: 700; }
    
    .status-hint { font-size: 0.8rem; text-align: center; margin: 0; font-weight: 600; }
    .status-hint.warning { color: #fca5a5; }
    .status-hint.success { color: #86efac; }
    .status-hint.gold { color: var(--gold); }
    
    .btn-link { background: none; border: none; color: var(--gold-light); text-decoration: underline; cursor: pointer; padding: 0; font-size: 0.9rem; }

    /* Promo Code */
    .promo-input-group {
      display: flex;
      gap: 0.5rem;
    }
    .promo-input-group input {
      flex: 1;
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 0.6rem;
      border-radius: 8px;
      color: white;
      outline: none;
    }
    .promo-input-group input:focus { border-color: var(--gold); }
    .promo-input-group button {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      padding: 0 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    .promo-input-group button:hover { background: rgba(255,255,255,0.2); }
    
    .promo-feedback { font-size: 0.85rem; margin-top: 0.5rem; color: var(--success); font-weight: 600; }
    .promo-feedback.error { color: var(--error); }

    /* --- RESPONSIVE --- */
    @media (max-width: 800px) {
      .offers-grid { grid-template-columns: 1fr; }
      .header { text-align: left; }
      .back-link { position: relative; margin-bottom: 1rem; }
      .page-title { font-size: 2.5rem; }
    }
  `]
})
export class OffresComponent {
  isLoading = false;
  
  // Promo Code Props
  promoCode = '';
  promoMsg = '';
  promoError = false;
  loadingPromo = false;

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  async buy() {
    const user = await firstValueFrom(this.auth.user$);

    if (!user) {
      this.auth.openAuth();
      return;
    }

    if (user.isPremium) {
      alert("Vous êtes déjà Membre Fondateur ! Merci de votre soutien.");
      return;
    }

    this.isLoading = true;

    try {
      // Utilisation du SDK Firebase standard (pas AngularFire)
      // Cela évite l'erreur de module manquant
      const functions = getFunctions(getApp());
      const createCheckout = httpsCallable(functions, 'createStripeCheckoutSession');
      
      const result: any = await createCheckout();
      
      if (result.data && result.data.url) {
        window.location.href = result.data.url; // Redirection Stripe
      } else {
        throw new Error("Pas d'URL renvoyée par le serveur.");
      }
    } catch (error) {
      console.error('Erreur Paiement:', error);
      alert("Une erreur est survenue lors de l'initialisation du paiement. Réessayez plus tard.");
      this.isLoading = false;
    }
  }

  async submitCode() {
    if (!this.promoCode.trim()) return;
    
    const user = await firstValueFrom(this.auth.user$);
    if (!user) {
      this.promoMsg = 'Connectez-vous d\'abord.';
      this.promoError = true;
      return;
    }

    this.loadingPromo = true;
    this.promoMsg = '';
    
    try {
      const success = await this.auth.redeemCode(this.promoCode.trim());
      if (success) {
        this.promoMsg = 'Code accepté ! Premium activé.';
        this.promoError = false;
        this.promoCode = '';
      } else {
        this.promoMsg = 'Code invalide.';
        this.promoError = true;
      }
    } catch (e) {
      this.promoMsg = 'Erreur lors de l\'activation.';
      this.promoError = true;
    } finally {
      this.loadingPromo = false;
    }
  }
}