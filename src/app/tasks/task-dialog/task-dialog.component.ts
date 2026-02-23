import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Task, TaskStatus } from '../../core/models/task.model';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="overlay" (click)="onBg($event)">
      <div class="dlg">
        <div class="dhead">
          <h2>{{ task ? 'Edit Task' : 'New Task' }}</h2>
          <button class="xbtn" (click)="closed.emit()">✕</button>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label>Title <span class="req">*</span></label>
            <input type="text" formControlName="title" placeholder="What needs to be done?"
              [class.err]="s && f['title'].invalid" />
            <span class="error" *ngIf="s && f['title'].errors?.['required']">Title is required</span>
          </div>

          <div class="field">
            <label>Description</label>
            <textarea formControlName="description" rows="3" placeholder="Optional details…"></textarea>
          </div>

          <div class="row2">
            <div class="field">
              <label>Priority</label>
              <select formControlName="priority">
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div class="field">
              <label>Status</label>
              <select formControlName="status">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>Due Date</label>
            <input type="date" formControlName="dueDate" />
          </div>

          <div class="foot">
            <button type="button" class="btn-sec" (click)="closed.emit()">Cancel</button>
            <button type="submit" class="btn-pri">{{ task ? 'Save Changes' : 'Create Task' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host{font-family:'DM Sans',sans-serif}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem;animation:fin .15s ease}
    @keyframes fin{from{opacity:0}to{opacity:1}}
    .dlg{background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:1.75rem;width:100%;max-width:460px;box-shadow:0 20px 60px rgba(0,0,0,.3);animation:sup .2s ease}
    @keyframes sup{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    .dhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.4rem}
    h2{font-family:'Syne',sans-serif;font-weight:700;font-size:1.2rem;color:var(--text-primary);margin:0}
    .xbtn{background:none;border:none;font-size:1rem;cursor:pointer;color:var(--text-muted);padding:.2rem .35rem;border-radius:6px;transition:all .15s}
    .xbtn:hover{background:var(--bg-hover);color:var(--text-primary)}
    .field{margin-bottom:1rem}
    .row2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
    label{display:block;font-size:.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:.35rem;text-transform:uppercase;letter-spacing:.05em}
    .req{color:var(--danger)}
    input,select,textarea{width:100%;padding:.65rem .9rem;border:1.5px solid var(--border);border-radius:10px;background:var(--bg-input);color:var(--text-primary);font-family:inherit;font-size:.88rem;transition:border .2s,box-shadow .2s;box-sizing:border-box;resize:vertical}
    input:focus,select:focus,textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow)}
    input.err{border-color:var(--danger)}
    .error{color:var(--danger);font-size:.76rem;margin-top:.22rem;display:block}
    .foot{display:flex;justify-content:flex-end;gap:.7rem;margin-top:1.4rem}
    .btn-sec{padding:.62rem 1.2rem;background:none;border:1.5px solid var(--border);border-radius:10px;color:var(--text-secondary);font-family:inherit;font-size:.875rem;font-weight:500;cursor:pointer;transition:all .15s}
    .btn-sec:hover{border-color:var(--text-secondary);color:var(--text-primary)}
    .btn-pri{padding:.62rem 1.4rem;background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:.875rem;font-weight:600;cursor:pointer;transition:all .2s}
    .btn-pri:hover{background:var(--accent-hover);box-shadow:0 4px 16px var(--accent-glow)}
  `],
})
export class TaskDialogComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() defaultStatus: TaskStatus = 'todo';
  @Output() closed = new EventEmitter<void>();
  @Output() saved  = new EventEmitter<Partial<Task>>();

  form!: FormGroup;
  s = false; // submitted flag

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title:       [this.task?.title       ?? '',       Validators.required],
      description: [this.task?.description ?? ''],
      priority:    [this.task?.priority    ?? 'medium'],
      status:      [this.task?.status      ?? this.defaultStatus],
      dueDate:     [this.task?.dueDate     ?? ''],
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    this.s = true;
    if (this.form.invalid) return;
    this.saved.emit(this.form.value);
  }

  onBg(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.closed.emit();
  }
}
