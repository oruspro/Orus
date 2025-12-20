import { Injectable } from '@angular/core';
import { GameKey } from './stats.service';

@Injectable({ providedIn: 'root' })
export class EloService {
  
  // Facteur K : Vitesse d'évolution du classement. 
  // Plus il est haut, plus le classement bouge vite.
  private readonly K_FACTOR = 32; 

  /**
   * Calcule le nouvel Elo après une partie.
   * @param currentElo Elo actuel du joueur (ex: 1200)
   * @param gameKey Le jeu joué
   * @param score Le score brut obtenu (ex: 100, ou temps en secondes inversé...)
   * @returns { newElo, delta }
   */
  calculateNewElo(currentElo: number, gameKey: GameKey, score: number): { newElo: number, delta: number, performance: number } {
    // 1. Estimer la performance Elo de cette partie
    const performanceElo = this.getPerformanceElo(gameKey, score);

    // 2. Formule simplifiée de convergence : 
    // On déplace l'Elo actuel vers la performance réalisée.
    // Formule : Delta = K * (Probabilité de Victoire Théorique - Résultat Réel)
    // Ici adapté pour le solo : Delta = (Performance - Actuel) * (K / Poids)
    // On va utiliser une approche plus directe type "Weighted Moving Average" déguisée :
    
    // Si j'ai 1200 et que je joue comme un 1400, je devrais monter.
    // Delta = (Perf - Actuel) * 0.1 (Facteur d'amortissement)
    const damping = 0.1; 
    let delta = Math.round((performanceElo - currentElo) * damping);

    // Bornes de gain/perte pour éviter les sauts trop violents
    if (delta > 40) delta = 40;
    if (delta < -40) delta = -40;

    // Bonus de "Débutant" : Si Elo < 1000, on ne perd pas de points (ou très peu) pour encourager
    if (currentElo < 1000 && delta < 0) {
      delta = Math.round(delta * 0.2); // Réduit la perte de 80%
    }

    return {
      newElo: currentElo + delta,
      delta: delta,
      performance: performanceElo
    };
  }

  /**
   * Convertit un score de jeu en "Niveau Elo équivalent".
   * C'est ici qu'on règle la difficulté !
   */
  private getPerformanceElo(gameKey: GameKey, score: number): number {
    switch (gameKey) {
      case 'chiffres':
        // Score est entre 0 et 100+ (nombre de chiffres corrects ?)
        // Disons que le score brut ici est le score calculé dans le jeu (0-100)
        // 0 => 400 Elo
        // 50 => 1200 Elo
        // 100 => 2000 Elo
        return 400 + (score * 16); 

      case 'cartes1':
        // Score (0-100) basé sur précision + temps
        // 100 (Parfait & Rapide) => 2200 Elo
        // 50 (Moyen) => 1200 Elo
        return 400 + (score * 18);

      case 'cartes4':
        // Plus dur, donc récompense plus haute
        return 500 + (score * 20);

      case 'dates':
        // Score sur 100
        return 400 + (score * 16);

      default:
        return 1200;
    }
  }
}