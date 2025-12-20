import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audioContext: AudioContext | null = null;
  private isMuted = false;
  private volume = 0.3; // Volume global (0.0 à 1.0)

  // Dictionnaire des fichiers (à remplir plus tard avec vos vrais mp3)
  private sounds: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    // Initialisation du contexte audio pour le synthétiseur (fallback)
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API non supporté');
    }

    // Préchargement des fichiers (si vous les ajoutez dans assets/sounds/)
    // this.load('hover', 'assets/sounds/ui_hover.mp3');
    // this.load('click', 'assets/sounds/ui_click.mp3');
    // this.load('success', 'assets/sounds/success.mp3');
    // this.load('error', 'assets/sounds/error.mp3');
  }

  /**
   * Active ou désactive le son
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  get muted(): boolean {
    return this.isMuted;
  }

  /**
   * Joue un son
   * @param type Le type de son ('hover', 'click', 'success', 'error', 'start')
   */
  play(type: 'hover' | 'click' | 'success' | 'error' | 'start') {
    if (this.isMuted) return;

    // 1. Essayer de jouer le fichier MP3 s'il existe
    if (this.sounds.has(type)) {
      const audio = this.sounds.get(type)!;
      audio.currentTime = 0; // Rembobiner pour pouvoir rejouer très vite
      audio.play().catch(e => console.warn('Autoplay bloqué', e));
      return;
    }

    // 2. Sinon, utiliser le synthétiseur (Bips générés par code)
    if (this.audioContext) {
      this.playSynthSound(type);
    }
  }

  // --- LOGIQUE INTERNE (Chargement & Synthé) ---

  private load(key: string, path: string) {
    const audio = new Audio();
    audio.src = path;
    audio.volume = this.volume;
    audio.load();
    this.sounds.set(key, audio);
  }

  /**
   * Génère des sons "retro" à la volée pour tester sans fichiers
   */
  private playSynthSound(type: string) {
    if (!this.audioContext) return;
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;

    switch (type) {
      case 'hover':
        // Petit "tchip" très court et aigu
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        gainNode.gain.setValueAtTime(0.05, now); // Très faible volume
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
        break;

      case 'click':
        // Son sec "toc"
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, now);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case 'success':
        // Accord majeur rapide (Arpège)
        this.playTone(660, 0.1, 0.1); // Mi
        setTimeout(() => this.playTone(880, 0.1, 0.1), 100); // La
        break;

      case 'error':
        // Son grave et dissonant "Buzzer"
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.linearRampToValueAtTime(100, now + 0.3);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0.001, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;
        
      case 'start':
        // Son "Level Start" (Montée)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.4);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0.001, now + 0.4);
        oscillator.start(now);
        oscillator.stop(now + 0.4);
        break;
    }
  }

  // Helper pour jouer une note simple (utilisé pour success)
  private playTone(freq: number, duration: number, vol: number) {
    if (!this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }
}