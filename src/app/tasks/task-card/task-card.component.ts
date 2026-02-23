import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.overdue]="overdue" [class.done]="task.status==='done'">
      <div class="pbar" [class]="'p-'+task.priority"></div>
      <div class="body">
        <div class="top">
          <span class="badge" [class]="'b-'+task.priority">{{ task.priority }}</span>
          <div class="acts">
            <button class="ib" (click)="edit.emit(task)" title="Edit">✏️</button>
            <button class="ib" (click)="del()" title="Delete">🗑️</button>
          </div>
        </div>
        <h3 class="title" [class.strike]="task.status==='done'">{{ task.title }}</h3>
        <p class="desc" *ngIf="task.description">{{ task.description }}</p>
        <div class="foot">
          <span class="due" [class.od]="overdue" *ngIf="task.dueDate">
            {{ overdue ? '⚠️' : '📅' }} {{ task.dueDate | date:'MMM d, y' }}
          </span>
          <span class="age">{{ task.createdAt | date:'MMM d' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host{display:block}
    .card{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;overflow:hidden;cursor:grab;box-shadow:0 2px 8px var(--shadow);transition:all .2s}
    .card:hover{transform:translateY(-2px);box-shadow:0 6px 20px var(--shadow-hover);border-color:var(--border-hover)}
    .card.overdue{border-color:var(--danger-border)}
    .card.done{opacity:.68}
    .pbar{height:3px}
    .p-high{background:var(--danger)}
    .p-medium{background:var(--warning)}
    .p-low{background:var(--success)}
    .body{padding:.9rem}
    .top{display:flex;align-items:center;justify-content:space-between;margin-bottom:.55rem}
    .badge{font-size:.68rem;font-weight:700;padding:.18rem .55rem;border-radius:20px;text-transform:uppercase;letter-spacing:.06em}
    .b-high{background:var(--danger-bg);color:var(--danger)}
    .b-medium{background:var(--warning-bg);color:var(--warning-text)}
    .b-low{background:var(--success-bg);color:var(--success)}
    .acts{display:flex;gap:.2rem;opacity:0;transition:opacity .15s}
    .card:hover .acts{opacity:1}
    .ib{background:none;border:none;cursor:pointer;font-size:.82rem;padding:.18rem .28rem;border-radius:6px;transition:background .15s}
    .ib:hover{background:var(--bg-hover)}
    .title{margin:0 0 .35rem;font-size:.875rem;font-weight:600;color:var(--text-primary);line-height:1.4}
    .title.strike{text-decoration:line-through;color:var(--text-muted)}
    .desc{margin:0 0 .7rem;font-size:.78rem;color:var(--text-muted);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .foot{display:flex;align-items:center;justify-content:space-between}
    .due{font-size:.74rem;color:var(--text-muted)}
    .due.od{color:var(--danger);font-weight:600}
    .age{font-size:.7rem;color:var(--text-muted)}
  `],
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() edit   = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<string>();

  get overdue(): boolean { return TaskService.isOverdue(this.task); }

  del(): void {
    if (confirm(`Delete "${this.task.title}"?`)) this.delete.emit(this.task.id);
  }
}
