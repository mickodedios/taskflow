import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private dark$: BehaviorSubject<boolean>;

  constructor() {
    const saved   = localStorage.getItem('tf_theme');
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark  = saved ? saved === 'dark' : sysDark;
    this.dark$    = new BehaviorSubject<boolean>(isDark);
    this.apply(isDark);
  }

  get isDark$(): Observable<boolean> { return this.dark$.asObservable(); }
  get isDark(): boolean              { return this.dark$.getValue(); }

  toggle(): void {
    const next = !this.dark$.getValue();
    this.dark$.next(next);
    localStorage.setItem('tf_theme', next ? 'dark' : 'light');
    this.apply(next);
  }

  private apply(dark: boolean): void {
    // Set attribute on <html> — matched by html[data-theme="dark"] in styles.css
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    // Also set class on <body> for extra reliability
    document.body.classList.toggle('dark-theme', dark);
    document.body.classList.toggle('light-theme', !dark);
  }
}
