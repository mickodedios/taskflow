import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="hdr">
      <div class="inner">
        <a routerLink="/dashboard" class="brand">
          <span>⚡</span><span class="bn">TaskFlow</span>
        </a>

        <nav class="nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nl">📊 Dashboard</a>
          <a routerLink="/board"     routerLinkActive="active" class="nl">🗂️ Board</a>
        </nav>

        <div class="actions">
          <button class="tbtn" (click)="theme.toggle()" [title]="dark ? 'Light mode' : 'Dark mode'">
            {{ dark ? '☀️' : '🌙' }}
          </button>

          <div class="umenu" (click)="open=!open">
            <div class="avatar">{{ initial }}</div>
            <span class="uname">{{ name }}</span>
            <span class="chev" [class.flip]="open">▾</span>

            <div class="drop" *ngIf="open" (click)="$event.stopPropagation()">
              <div class="dinfo">
                <div class="dname">{{ name }}</div>
                <div class="demail">{{ email }}</div>
              </div>
              <button class="ditem" (click)="auth.logout()">🚪 Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host{display:block}
    .hdr{background:var(--bg-card-blur);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;backdrop-filter:blur(12px)}
    .inner{max-width:1200px;margin:0 auto;padding:0 1.5rem;height:60px;display:flex;align-items:center;gap:1.25rem}
    .brand{display:flex;align-items:center;gap:.45rem;text-decoration:none;font-size:1.3rem}
    .bn{font-family:'Syne',sans-serif;font-weight:800;font-size:1.2rem;color:var(--text-primary);letter-spacing:-.03em}
    .nav{display:flex;gap:.2rem;margin-left:.75rem}
    .nl{display:flex;align-items:center;gap:.35rem;padding:.38rem .8rem;border-radius:8px;text-decoration:none;color:var(--text-secondary);font-size:.875rem;font-weight:500;transition:all .15s}
    .nl:hover{background:var(--bg-hover);color:var(--text-primary)}
    .nl.active{background:var(--accent-bg);color:var(--accent)}
    .actions{margin-left:auto;display:flex;align-items:center;gap:.65rem}
    .tbtn{background:none;border:1px solid var(--border);border-radius:8px;width:36px;height:36px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:all .2s}
    .tbtn:hover{background:var(--bg-hover);border-color:var(--accent)}
    .umenu{display:flex;align-items:center;gap:.45rem;cursor:pointer;padding:.28rem .55rem;border-radius:10px;position:relative;user-select:none;transition:background .15s}
    .umenu:hover{background:var(--bg-hover)}
    .avatar{width:32px;height:32px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.82rem}
    .uname{font-size:.875rem;font-weight:500;color:var(--text-primary)}
    .chev{font-size:.68rem;color:var(--text-muted);transition:transform .2s}
    .chev.flip{transform:rotate(180deg)}
    .drop{position:absolute;top:calc(100% + 8px);right:0;min-width:190px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;box-shadow:0 8px 30px var(--shadow);overflow:hidden;z-index:200;animation:fd .15s ease}
    @keyframes fd{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
    .dinfo{padding:.8rem 1rem;border-bottom:1px solid var(--border)}
    .dname{font-weight:600;font-size:.875rem;color:var(--text-primary)}
    .demail{font-size:.78rem;color:var(--text-muted)}
    .ditem{display:block;width:100%;padding:.65rem 1rem;background:none;border:none;text-align:left;font-family:inherit;font-size:.875rem;cursor:pointer;color:var(--text-secondary);transition:background .1s}
    .ditem:hover{background:var(--danger-bg);color:var(--danger)}
    @media(max-width:600px){.uname,.bn{display:none}}
  `],
})
export class HeaderComponent implements OnInit, OnDestroy {
  name    = '';
  email   = '';
  initial = '';
  dark    = false;
  open    = false;

  private sub!: Subscription;

  constructor(
    readonly auth: AuthService,
    readonly theme: ThemeService,
  ) {}

  ngOnInit(): void {
    const u = this.auth.currentUser;
    if (u) { this.name = u.name; this.email = u.email; this.initial = u.name[0].toUpperCase(); }
    this.sub = this.theme.isDark$.subscribe(d => this.dark = d);
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
