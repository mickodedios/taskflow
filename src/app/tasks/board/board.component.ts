import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus, Column } from '../../core/models/task.model';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent, TaskDialogComponent, HeaderComponent],
  template: `
    <app-header />

    <main class="page">
      <div class="ph">
        <div>
          <h1 class="ptitle">Task Board</h1>
          <p class="psub">{{ all.length }} tasks · drag to move between columns</p>
        </div>
        <button class="btn-add" (click)="openCreate()">＋ New Task</button>
      </div>

      <div class="board">
        <div class="col" *ngFor="let col of columns">
          <div class="colh">
            <div class="ct">
              <span>{{ col.icon }}</span>
              <span class="ctitle">{{ col.title }}</span>
              <span class="cnt">{{ colTasks(col.id).length }}</span>
            </div>
            <button class="cadd" (click)="openCreate(col.id)" title="Add to {{ col.title }}">＋</button>
          </div>

          <div class="tlist"
            [id]="col.id"
            cdkDropList
            [cdkDropListData]="colTasks(col.id)"
            [cdkDropListConnectedTo]="['todo','in-progress','done']"
            (cdkDropListDropped)="drop($event)">

            <div *ngFor="let t of colTasks(col.id); trackBy: tid" cdkDrag [cdkDragData]="t">
              <div *cdkDragPlaceholder class="placeholder"></div>
              <app-task-card [task]="t" (edit)="openEdit($event)" (delete)="svc.delete($event)" />
            </div>

            <div class="empty" *ngIf="colTasks(col.id).length===0">
              <span>{{ col.icon }}</span><span>Drop tasks here</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <app-task-dialog *ngIf="dlg"
      [task]="editing"
      [defaultStatus]="defStatus"
      (closed)="closeDlg()"
      (saved)="save($event)" />
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
    :host{display:block;font-family:'DM Sans',sans-serif;min-height:100vh;background:var(--bg-page)}
    .page{max-width:1300px;margin:0 auto;padding:1.5rem}
    .ph{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.75rem;flex-wrap:wrap;gap:1rem}
    .ptitle{font-family:'Syne',sans-serif;font-weight:800;font-size:1.75rem;color:var(--text-primary);margin:0 0 .2rem;letter-spacing:-.04em}
    .psub{color:var(--text-muted);font-size:.875rem;margin:0}
    .btn-add{padding:.65rem 1.25rem;background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
    .btn-add:hover{background:var(--accent-hover);box-shadow:0 4px 16px var(--accent-glow);transform:translateY(-1px)}
    .board{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;align-items:start}
    @media(max-width:880px){.board{grid-template-columns:1fr}}
    @media(min-width:560px) and (max-width:880px){.board{grid-template-columns:repeat(2,1fr)}}
    .col{background:var(--bg-column);border:1px solid var(--border);border-radius:16px;overflow:hidden}
    .colh{padding:.9rem 1rem .75rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)}
    .ct{display:flex;align-items:center;gap:.45rem}
    .ctitle{font-family:'Syne',sans-serif;font-weight:700;font-size:.9rem;color:var(--text-primary)}
    .cnt{background:var(--bg-badge);color:var(--text-muted);border-radius:20px;padding:.08rem .5rem;font-size:.72rem;font-weight:600}
    .cadd{background:none;border:1px solid var(--border);border-radius:8px;width:28px;height:28px;cursor:pointer;font-size:1.1rem;color:var(--text-muted);display:flex;align-items:center;justify-content:center;transition:all .15s;line-height:1}
    .cadd:hover{background:var(--accent-bg);border-color:var(--accent);color:var(--accent)}
    .tlist{padding:.75rem;display:flex;flex-direction:column;gap:.6rem;min-height:120px;transition:background .15s}
    .tlist.cdk-drop-list-dragging{background:var(--bg-drop)}
    .placeholder{height:78px;border:2px dashed var(--accent);border-radius:14px;background:var(--accent-bg)}
    .empty{display:flex;flex-direction:column;align-items:center;gap:.35rem;padding:1.75rem 1rem;color:var(--text-muted);font-size:.8rem;opacity:.55}
    .cdk-drag-animating{transition:transform 250ms cubic-bezier(0,0,.2,1)}
    .cdk-drag-preview{border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.28);opacity:.92;transform:rotate(2deg)}
  `],
})
export class BoardComponent implements OnInit, OnDestroy {
  columns: Column[] = [
    { id: 'todo',        title: 'To Do',       icon: '📋' },
    { id: 'in-progress', title: 'In Progress',  icon: '⚡' },
    { id: 'done',        title: 'Done',         icon: '✅' },
  ];

  all: Task[]      = [];
  dlg              = false;
  editing: Task | null = null;
  defStatus: TaskStatus = 'todo';

  private sub!: Subscription;

  constructor(readonly svc: TaskService) {}

  ngOnInit(): void {
    this.svc.reload();
    this.sub = this.svc.all$.subscribe(t => this.all = t);
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  colTasks(s: TaskStatus): Task[] { return this.all.filter(t => t.status === s); }
  tid(_: number, t: Task): string { return t.id; }

  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      const tasks = [...event.container.data];
      moveItemInArray(tasks, event.previousIndex, event.currentIndex);
      this.svc.reorder(tasks);
    } else {
      const task: Task = event.item.data;
      this.svc.move(task.id, event.container.id as TaskStatus);
    }
  }

  openCreate(s: TaskStatus = 'todo'): void { this.editing = null; this.defStatus = s; this.dlg = true; }
  openEdit(t: Task): void                  { this.editing = t; this.dlg = true; }
  closeDlg(): void                         { this.dlg = false; this.editing = null; }

  save(data: Partial<Task>): void {
    if (this.editing) {
      this.svc.update(this.editing.id, data);
    } else {
      this.svc.create({
        title:       data['title']       as string ?? '',
        description: data['description'] as string ?? '',
        priority:    data['priority']    as Task['priority']  ?? 'medium',
        status:      data['status']      as TaskStatus ?? 'todo',
        dueDate:     data['dueDate']     as string ?? '',
      });
    }
    this.closeDlg();
  }
}
