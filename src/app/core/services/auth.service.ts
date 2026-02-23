import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthState, User } from '../models/task.model';

const AUTH_KEY  = 'tf_auth';
const USERS_KEY = 'tf_users';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private state$ = new BehaviorSubject<AuthState>({ user: null, isAuthenticated: false });

  constructor(private router: Router) {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) this.state$.next(JSON.parse(raw));
    } catch { localStorage.removeItem(AUTH_KEY); }
  }

  get authState$(): Observable<AuthState> { return this.state$.asObservable(); }
  get isAuthenticated(): boolean           { return this.state$.getValue().isAuthenticated; }
  get currentUser(): Omit<User,'password'> | null { return this.state$.getValue().user; }

  register(name: string, email: string, password: string): { success: boolean; message: string } {
    const users = this.loadUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return { success: false, message: 'Email already registered.' };

    const user: User = {
      id: this.uuid(), name, email: email.toLowerCase(), password,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true, message: 'Account created!' };
  }

  login(email: string, password: string): { success: boolean; message: string } {
    const user = this.loadUsers().find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return { success: false, message: 'Invalid email or password.' };

    const { password: _pw, ...safe } = user;
    const state: AuthState = { user: safe, isAuthenticated: true };
    this.state$.next(state);
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
    return { success: true, message: 'Welcome back!' };
  }

  logout(): void {
    this.state$.next({ user: null, isAuthenticated: false });
    localStorage.removeItem(AUTH_KEY);
    this.router.navigate(['/auth/login']);
  }

  private loadUsers(): User[] {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]'); } catch { return []; }
  }

  private uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}
