import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';

function pwMatch(g: AbstractControl): ValidationErrors | null {
  return g.get('password')?.value === g.get('confirm')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="card">
        <div class="brand">
          <span class="logo">⚡</span>
          <h1>TaskFlow</h1>
          <p>Create your free workspace</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label>Full Name</label>
            <input type="text" formControlName="name" placeholder="Jane Doe"
              [class.err]="sub && f['name'].invalid" />
            <span class="error" *ngIf="sub && f['name'].errors?.['required']">Required</span>
            <span class="error" *ngIf="sub && f['name'].errors?.['minlength']">Min 2 chars</span>
          </div>

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
                placeholder="Min 6 characters" [class.err]="sub && f['password'].invalid" />
              <button type="button" class="eye" (click)="show=!show">{{show?'🙈':'👁️'}}</button>
            </div>
            <span class="error" *ngIf="sub && f['password'].errors?.['required']">Required</span>
            <span class="error" *ngIf="sub && f['password'].errors?.['minlength']">Min 6 chars</span>
          </div>

          <div class="field">
            <label>Confirm Password</label>
            <input [type]="show ? 'text' : 'password'" formControlName="confirm"
              placeholder="Repeat password"
              [class.err]="sub && (f['confirm'].invalid || form.errors?.['mismatch'])" />
            <span class="error" *ngIf="sub && form.errors?.['mismatch']">Passwords don't match</span>
          </div>

          <div class="alert err-box" *ngIf="errMsg">{{ errMsg }}</div>
          <div class="alert ok-box"  *ngIf="okMsg">{{ okMsg }}</div>

          <button type="submit" class="btn-primary" [disabled]="loading">
            <span *ngIf="!loading">Create Account</span>
            <span *ngIf="loading" class="spin"></span>
          </button>
        </form>

        <p class="switch">Already have an account? <a routerLink="/auth/login">Sign in</a></p>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=DM+Sans:wght@400;500;600&display=swap');
    :host{display:block;font-family:'DM Sans',sans-serif}
    .page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg-page);padding:1.5rem}
    .card{background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:2.5rem 2rem;width:100%;max-width:400px;box-shadow:0 8px 40px var(--shadow)}
    .brand{text-align:center;margin-bottom:1.75rem}
    .logo{font-size:2.5rem}
    h1{font-family:'Syne',sans-serif;font-weight:800;font-size:2rem;margin:.25rem 0 .4rem;color:var(--text-primary);letter-spacing:-.04em}
    p{color:var(--text-muted);font-size:.9rem;margin:0}
    .field{margin-bottom:1rem}
    label{display:block;font-size:.82rem;font-weight:600;color:var(--text-secondary);margin-bottom:.35rem;text-transform:uppercase;letter-spacing:.05em}
    input{width:100%;padding:.68rem 1rem;border:1.5px solid var(--border);border-radius:10px;background:var(--bg-input);color:var(--text-primary);font-family:inherit;font-size:.9rem;transition:border .2s,box-shadow .2s;box-sizing:border-box}
    input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow)}
    input.err{border-color:var(--danger)}
    .pw-wrap{position:relative}
    .pw-wrap input{padding-right:3rem}
    .eye{position:absolute;right:.7rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:.95rem;padding:0}
    .error{color:var(--danger);font-size:.78rem;margin-top:.25rem;display:block}
    .alert{border-radius:8px;padding:.65rem .9rem;font-size:.85rem;margin-bottom:1rem}
    .err-box{background:var(--danger-bg);color:var(--danger);border:1px solid var(--danger-border)}
    .ok-box{background:var(--success-bg);color:var(--success);border:1px solid var(--success-border)}
    .btn-primary{width:100%;padding:.8rem;background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:1rem;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;min-height:46px}
    .btn-primary:hover:not([disabled]){background:var(--accent-hover);transform:translateY(-1px);box-shadow:0 4px 20px var(--accent-glow)}
    .btn-primary[disabled]{opacity:.7;cursor:not-allowed}
    .spin{width:20px;height:20px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .switch{text-align:center;margin-top:1.4rem;color:var(--text-muted);font-size:.875rem}
    .switch a{color:var(--accent);text-decoration:none;font-weight:500}
  `],
})
export class RegisterComponent {
  form: FormGroup;
  sub     = false;
  loading = false;
  show    = false;
  errMsg  = '';
  okMsg   = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private tasks: TaskService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      name:     ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm:  ['', Validators.required],
    }, { validators: pwMatch });
  }

  get f() { return this.form.controls; }

  submit(): void {
    this.sub = true;
    this.errMsg = '';
    this.okMsg  = '';
    if (this.form.invalid) return;
    this.loading = true;

    setTimeout(() => {
      const res = this.auth.register(
        this.f['name'].value, this.f['email'].value, this.f['password'].value
      );
      if (res.success) {
        this.okMsg = 'Account created! Signing you in…';
        setTimeout(() => {
          this.auth.login(this.f['email'].value, this.f['password'].value);
          this.tasks.reload();
          this.router.navigate(['/dashboard']);
        }, 700);
      } else {
        this.errMsg  = res.message;
        this.loading = false;
      }
    }, 400);
  }
}
