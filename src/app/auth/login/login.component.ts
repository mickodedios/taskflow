import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="card">
        <div class="brand">
          <span class="logo">⚡</span>
          <h1>TaskFlow</h1>
          <p>Sign in to your workspace</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="you@example.com"
              [class.err]="sub && f['email'].invalid" />
            <span class="error" *ngIf="sub && f['email'].errors?.['required']">Required</span>
            <span class="error" *ngIf="sub && f['email'].errors?.['email']">Invalid email</span>
          </div>

          <div class="field">
            <label>Password</label>
            <div class="pw-wrap">
              <input [type]="show ? 'text' : 'password'" formControlName="password"
                placeholder="••••••••" [class.err]="sub && f['password'].invalid" />
              <button type="button" class="eye" (click)="show=!show">{{show?'🙈':'👁️'}}</button>
            </div>
            <span class="error" *ngIf="sub && f['password'].errors?.['required']">Required</span>
          </div>

          <div class="alert" *ngIf="errMsg">{{ errMsg }}</div>

          <button type="submit" class="btn-primary" [disabled]="loading">
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading" class="spin"></span>
          </button>
        </form>

        <p class="switch">No account? <a routerLink="/auth/register">Register</a></p>
        <div class="hint">Register to get 5 demo tasks automatically.</div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=DM+Sans:wght@400;500;600&display=swap');
    :host{display:block;font-family:'DM Sans',sans-serif}
    .page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg-page);padding:1.5rem}
    .card{background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:2.5rem 2rem;width:100%;max-width:400px;box-shadow:0 8px 40px var(--shadow)}
    .brand{text-align:center;margin-bottom:2rem}
    .logo{font-size:2.5rem}
    h1{font-family:'Syne',sans-serif;font-weight:800;font-size:2rem;margin:.25rem 0 .4rem;color:var(--text-primary);letter-spacing:-.04em}
    p{color:var(--text-muted);font-size:.9rem;margin:0}
    .field{margin-bottom:1.1rem}
    label{display:block;font-size:.82rem;font-weight:600;color:var(--text-secondary);margin-bottom:.35rem;text-transform:uppercase;letter-spacing:.05em}
    input{width:100%;padding:.68rem 1rem;border:1.5px solid var(--border);border-radius:10px;background:var(--bg-input);color:var(--text-primary);font-family:inherit;font-size:.9rem;transition:border .2s,box-shadow .2s;box-sizing:border-box}
    input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow)}
    input.err{border-color:var(--danger)}
    .pw-wrap{position:relative}
    .pw-wrap input{padding-right:3rem}
    .eye{position:absolute;right:.7rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:.95rem;padding:0}
    .error{color:var(--danger);font-size:.78rem;margin-top:.25rem;display:block}
    .alert{background:var(--danger-bg);color:var(--danger);border:1px solid var(--danger-border);border-radius:8px;padding:.65rem .9rem;font-size:.85rem;margin-bottom:1rem}
    .btn-primary{width:100%;padding:.8rem;background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:1rem;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;min-height:46px}
    .btn-primary:hover:not([disabled]){background:var(--accent-hover);transform:translateY(-1px);box-shadow:0 4px 20px var(--accent-glow)}
    .btn-primary[disabled]{opacity:.7;cursor:not-allowed}
    .spin{width:20px;height:20px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .switch{text-align:center;margin-top:1.4rem;color:var(--text-muted);font-size:.875rem}
    .switch a{color:var(--accent);text-decoration:none;font-weight:500}
    .hint{margin-top:1rem;padding:.65rem .9rem;background:var(--info-bg);border-radius:8px;font-size:.78rem;color:var(--text-muted);text-align:center}
  `],
})
export class LoginComponent {
  form: FormGroup;
  sub     = false;
  loading = false;
  show    = false;
  errMsg  = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private tasks: TaskService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    this.sub = true;
    this.errMsg = '';
    if (this.form.invalid) return;
    this.loading = true;

    setTimeout(() => {
      const res = this.auth.login(this.f['email'].value, this.f['password'].value);
      if (res.success) {
        this.tasks.reload();
        this.router.navigate(['/dashboard']);
      } else {
        this.errMsg  = res.message;
        this.loading = false;
      }
    }, 400);
  }
}
