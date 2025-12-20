import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cours-dates',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-container">
      <button class="btn-back" routerLink="/cours">← Retour à l'académie</button>
      
      <div class="detail-header">
        <h1>Mémorisation de Dates</h1>
        <p>Comment retenir l'Histoire sans effort.</p>
      </div>

      <div class="content-grid">
        <div class="glass-card content-block full-width">
          <h3>La Technique</h3>
          <p>
            Pour retenir une date (ex: <strong>1789</strong>), on ne retient pas les chiffres.
            On crée une scène visuelle.
          </p>
          
          <div class="method-steps">
            <div class="step">
              <div class="step-num">1</div>
              <div class="step-text">
                <strong>Découper :</strong> Séparez l'année. 1789 devient <strong>17</strong> et <strong>89</strong>.
              </div>
            </div>
            <div class="step">
              <div class="step-num">2</div>
              <div class="step-text">
                <strong>Encoder :</strong> Utilisez votre liste 00-99.
                <br>17 = T + K = <strong>Ticket</strong>
                <br>89 = V + P = <strong>Vapeur</strong>
              </div>
            </div>
            <div class="step">
              <div class="step-num">3</div>
              <div class="step-text">
                <strong>Associer :</strong> Imaginez la Prise de la Bastille.
                <br><em>Un gigantesque <strong>Ticket</strong> de métro sort de la Bastille dans un nuage de <strong>Vapeur</strong>.</em>
              </div>
            </div>
          </div>

          <div class="cta-center">
            <button class="btn-primary" routerLink="/dates-normal">S'entraîner sur des Dates</button>
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

    .content-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
    .glass-card { background: var(--glass-bg); backdrop-filter: blur(12px); border: var(--glass-border); border-radius: 20px; padding: 2rem; }
    .content-block h3 { margin: 0 0 1rem 0; color: white; font-size: 1.3rem; }
    .content-block p { color: #cbd5e1; line-height: 1.6; margin-bottom: 1rem; }

    .method-steps { display: flex; flex-direction: column; gap: 1.5rem; margin: 2rem 0; }
    .step { display: flex; gap: 1rem; }
    .step-num { width: 32px; height: 32px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
    .step-text { color: #cbd5e1; font-size: 0.95rem; line-height: 1.5; }
    
    .cta-center { text-align: center; margin-top: 2rem; }
    .btn-primary { background: linear-gradient(135deg, var(--primary), #4f46e5); color: white; border: none; padding: 0.8rem 2rem; border-radius: 99px; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
    .btn-primary:hover { transform: translateY(-2px); }
  `]
})
export class CoursDatesComponent {}