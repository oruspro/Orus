import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Peg {
  index: number;
  word: string;
}

@Component({
  selector: 'app-cours-chiffres',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  template: `
    <section class="wrapper">
      <header class="header">
        <button class="back-link" routerLink="/cours">← Retour aux cours</button>
        <h2>Cours : mémorisation des chiffres</h2>
        <p class="subtitle">
          La mémorisation des chiffres repose sur deux piliers essentiels :
          <strong>le palais mental</strong> et le <strong>Grand Système</strong>.
          Ensemble, ils transforment des suites de chiffres abstraits
          en images riches, mémorables et faciles à stocker.
        </p>
      </header>

      <section class="block">
        <h3>1. Le Palais Mental : la base de la mémorisation</h3>
        <p>
          Le palais mental (ou méthode des lieux) consiste à utiliser un lieu que vous connaissez bien :
          votre maison, votre école, un trajet quotidien… Vous y définissez des
          <strong>loci</strong> : des zones précises où vous stockez mentalement des images.
        </p>
        <p>
          Lorsqu'il s'agit de mémoriser des chiffres, les images créées à partir du Grand Système
          sont placées dans ces loci, afin qu'un simple parcours mental vous permette de les retrouver.
        </p>
      </section>

      <section class="block">
        <h3>2. Une imagerie multisensorielle</h3>
        <p>
          Pour retenir efficacement une image du Grand Système, activez un maximum de sens :
        </p>
        <ul class="list">
          <li><strong>La vue :</strong> couleur, taille, luminosité, mouvement</li>
          <li><strong>L’ouïe :</strong> bruit, voix, son métallique, rugissement</li>
          <li><strong>L’odorat :</strong> odeur forte, agréable ou désagréable</li>
          <li><strong>Le toucher :</strong> rugueux, froid, collant, glissant</li>
          <li><strong>Le goût :</strong> sucré, amer, épicé</li>
        </ul>
        <p>
          Plus l’image est vivante et absurde, plus elle restera longtemps en mémoire.
        </p>
      </section>

      <section class="block">
        <h3>3. Grand Système étendu : de 000 à 999</h3>
        <p>
          Vous connaissez déjà la base de 00 à 99.
          Nous allons maintenant l’étendre pour créer une version complète en
          <strong>1000 images (000 → 999)</strong>.
        </p>

        <p class="sub">
          Vous retrouvez ci-dessous un tableau modifiable de vos mots-clés.
          Complétez-le progressivement pour créer un système entièrement personnalisé.
          Les données sont stockées localement dans votre navigateur.
        </p>

        <!-- TABLEAU GRAND SYSTÈME 0–999 -->
        <div class="table-wrapper">
          <table class="peg-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Mot associé</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let peg of extendedList">
                <td class="index-cell">{{ formatIndex(peg.index) }}</td>
                <td>
                  <input
                    [(ngModel)]="peg.word"
                    (change)="save()"
                    placeholder="Mot…"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="block">
        <h3>4. Mémoriser au-delà de 1000</h3>
        <p>
          Une fois votre système 0–999 en place, la mémorisation des grands nombres devient simple :
        </p>

        <p class="sub">
          → On réutilise les 1000 images, mais en appliquant des
          <strong>variantes thématiques</strong>.
        </p>

        <ul class="list">
          <li><strong>1000–1999 :</strong> chaque image est en chocolat</li>
          <li><strong>2000–2999 :</strong> chaque image est en métal</li>
          <li><strong>3000–3999 :</strong> chaque image est en cristal</li>
          <li><strong>4000–4999 :</strong> chaque image est faite de fumée</li>
          <li><strong>5000–5999 :</strong> chaque image est en feu</li>
          <li><strong>6000–6999 :</strong> version miniature</li>
          <li><strong>7000–7999 :</strong> version géante</li>
          <li><strong>8000–8999 :</strong> image qui flotte dans les airs</li>
          <li><strong>9000–9999 :</strong> image en or massif</li>
        </ul>

        <p class="sub">
          Avec ces variantes, vous pouvez facilement mémoriser des nombres de plusieurs dizaines de milliers de chiffres.
        </p>
      </section>
    </section>
  `,
  styles: [`
    .wrapper {
      max-width: 820px;
      margin: 0 auto;
      padding: 0.5rem 0 1.5rem;
      color: rgba(255,255,255,0.95);
    }

    .header h2 {
      font-size: 1.3rem;
      margin: 0 0 0.4rem;
    }

    .subtitle {
      margin: 0 0 0.5rem;
      font-size: 0.9rem;
      color: rgba(208,215,224,0.95);
    }

    .back-link {
      background: none;
      border: none;
      color: rgba(148,163,184,0.95);
      font-size: 0.8rem;
      cursor: pointer;
      padding: 0;
      margin-bottom: 0.4rem;
      text-align: left;
    }

    .block {
      margin-top: 1rem;
      border-radius: 24px;
      border: 1px solid rgba(148,163,184,0.7);
      background: radial-gradient(circle at top left, rgba(59,130,246,0.20), rgba(15,23,42,0.96));
      padding: 0.9rem 1.1rem;
      box-shadow: 0 12px 30px rgba(0,0,0,0.6);
    }

    .block h3 {
      font-size: 1.1rem;
      margin: 0 0 0.45rem;
    }

    .block p {
      margin: 0 0 0.4rem;
      font-size: 0.92rem;
    }

    .list {
      padding-left: 1.2rem;
      margin: 0.2rem 0 0.8rem;
      font-size: 0.9rem;
    }

    .list li {
      margin-bottom: 0.25rem;
    }

    .sub {
      margin-top: 0.5rem;
      color: rgba(208,215,224,0.95);
      font-size: 0.86rem;
    }

    .table-wrapper {
      max-height: 380px;
      overflow-y: auto;
      border-radius: 18px;
      border: 1px solid rgba(148,163,184,0.7);
      margin-top: 0.7rem;
      background: rgba(15,23,42,0.96);
    }

    .peg-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .peg-table thead {
      position: sticky;
      top: 0;
      background: linear-gradient(135deg, rgba(30,64,175,0.95), rgba(15,23,42,0.98));
      z-index: 1;
    }

    .peg-table th,
    .peg-table td {
      padding: 0.4rem 0.6rem;
      border-bottom: 1px solid rgba(31,41,55,0.9);
      text-align: left;
    }

    .index-cell {
      width: 3.3rem;
      font-variant-numeric: tabular-nums;
    }

    input {
      width: 100%;
      padding: 0.35rem 0.55rem;
      border-radius: 10px;
      border: 1px solid rgba(148,163,184,0.7);
      background: rgba(15,23,42,0.95);
      color: #e5e7eb;
      font-size: 0.9rem;
      outline: none;
    }

    input::placeholder {
      color: rgba(148,163,184,0.9);
    }

    input:focus {
      border-color: rgba(96,165,250,0.95);
      box-shadow: 0 0 0 1px rgba(96,165,250,0.6);
    }

    @media (max-width: 640px) {
      .header h2 {
        font-size: 1.25rem;
      }

      .block {
        padding: 0.8rem 0.8rem;
      }

      .peg-table th,
      .peg-table td {
        padding: 0.35rem 0.45rem;
      }
    }

    @media (min-width: 768px) {
      .header h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class CoursChiffresComponent {
  extendedList: Peg[] = [];

  constructor() {
    // Génération 000 → 999
    for (let i = 0; i < 1000; i++) {
      this.extendedList.push({
        index: i,
        word: this.defaultWord(i),
      });
    }
    this.load();
  }

  formatIndex(i: number) {
    return i.toString().padStart(3, '0');
  }

  defaultWord(_i: number) {
    // Tu peux un jour proposer une base si tu veux pré-remplir,
    // pour l’instant on laisse vide pour que l’utilisateur personnalise.
    return '';
  }

  save() {
    localStorage.setItem('orus-peg-1000', JSON.stringify(this.extendedList));
  }

  load() {
    const raw = localStorage.getItem('orus-peg-1000');
    if (!raw) return;
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        this.extendedList = arr;
      }
    } catch {
      // on ignore si le JSON est corrompu
    }
  }
}
