import { Injectable, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AntiCopyService implements OnDestroy {

  private initialized = false;
  private removeFns: (() => void)[] = [];

  constructor() {}

  /**
   * Active la protection (clic droit, raccourcis clavier)
   */
  init(): void {
    if (this.initialized || typeof document === 'undefined') {
      return;
    }
    this.initialized = true;

    // Bloque copy / cut / paste / clic droit
    const blockEvent = (e: Event) => e.preventDefault();

    const events = ['copy', 'cut', 'paste', 'contextmenu'];
    events.forEach(evt => {
      document.addEventListener(evt, blockEvent);
      this.removeFns.push(() => document.removeEventListener(evt, blockEvent));
    });

    // Bloque les raccourcis clavier classiques (Ctrl/Cmd + C, V, X, A, P, S)
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (['c','x','v','a','p','s'].includes(key)) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', keydownHandler);
    this.removeFns.push(() => document.removeEventListener('keydown', keydownHandler));
  }

  ngOnDestroy(): void {
    this.teardown();
  }

  teardown(): void {
    this.removeFns.forEach(fn => fn());
    this.removeFns = [];
    this.initialized = false;
  }
}