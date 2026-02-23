import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TaskService } from '../core/services/task.service';
import { AuthService } from '../core/services/auth.service';
import { Task, DashboardStats } from '../core/models/task.model';
import { TaskCardComponent } from '../tasks/task-card/task-card.component';
import { TaskDialogComponent } from '../tasks/task-dialog/task-dialog.component';
import { HeaderComponent } from '../shared/components/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TaskCardComponent, TaskDialogComponent, HeaderComponent],
  template: `
    <app-header />

    <main class="page">
      <div class="greet">
        <div>
          <h1>Good {{ tod }}, {{ uname }} 👋</h1>
          <p>Here's your task overview for today.</p>
        </div>
        <button class="btn-add" (click)="dlg=true">＋ New Task</button>
      </div>

      <!-- Stats -->
      <div class="stats" *ngIf="stats">
        <div class="sc accent"><span class="si">📋</span><div><div class="sv">{{stats.total}}</div><div class="sl">Total</div></div></div>
        <div class="sc success"><span class="si">✅</span><div><div class="sv">{{stats.completed}}</div><div class="sl">Completed</div></div></div>
        <div class="sc warning"><span class="si">⚡</span><div><div class="sv">{{stats.inProgress}}</div><div class="sl">In Progress</div></div></div>
        <div class="sc danger"><span class="si">⚠️</span><div><div class="sv">{{stats.overdue}}</div><div class="sl">Overdue</div></div></div>
      </div>

      <!-- Charts row -->
      <div class="crow">
        <!-- Completion -->
        <div class="card pc">
          <h3>Completion Rate</h3>
          <div class="bigpct">{{ stats?.completionPercentage ?? 0 }}%</div>
          <div class="pbar"><div class="pfill" [style.width.%]="stats?.completionPercentage ?? 0"></div></div>
          <div class="phint">{{ stats?.completed }} of {{ stats?.total }} tasks done</div>
        </div>

        <!-- Priority bars -->
        <div class="card priocard">
          <h3>Priority Breakdown</h3>
          <div class="prows" *ngIf="stats">
            <div class="pr"><span class="dot high"></span><span class="pl">High</span>
              <div class="pbw"><div class="pb high" [style.width.%]="pw('high')"></div></div>
              <span class="pn">{{stats.priorityBreakdown.high}}</span></div>
            <div class="pr"><span class="dot medium"></span><span class="pl">Medium</span>
              <div class="pbw"><div class="pb medium" [style.width.%]="pw('medium')"></div></div>
              <span class="pn">{{stats.priorityBreakdown.medium}}</span></div>
            <div class="pr"><span class="dot low"></span><span class="pl">Low</span>
              <div class="pbw"><div class="pb low" [style.width.%]="pw('low')"></div></div>
              <span class="pn">{{stats.priorityBreakdown.low}}</span></div>
          </div>
        </div>

        <!-- Donut chart -->
        <div class="card donutcard">
          <h3>Distribution</h3>
          <canvas #donut width="150" height="150"></canvas>
          <div class="legend">
            <span class="li todo">To Do: {{ stats?.todo ?? 0 }}</span>
            <span class="li inprog">In Progress: {{ stats?.inProgress ?? 0 }}</span>
            <span class="li done">Done: {{ stats?.completed ?? 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Recent tasks -->
      <div class="sec">
        <div class="sech">
          <h2>Recent Tasks</h2>
          <a routerLink="/board" class="sall">View Board →</a>
        </div>
        <div class="tgrid" *ngIf="recent.length">
          <app-task-card *ngFor="let t of recent; trackBy:tid"
            [task]="t" (edit)="openEdit($event)" (delete)="svc.delete($event)" />
        </div>
        <div class="empty" *ngIf="!recent.length">
          🌟 No tasks yet! <a routerLink="/board">Create your first</a>
        </div>
      </div>
    </main>

    <app-task-dialog *ngIf="dlg"
      [task]="editing"
      (closed)="closeDlg()"
      (saved)="save($event)" />
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
    :host{display:block;font-family:'DM Sans',sans-serif;min-height:100vh;background:var(--bg-page)}
    .page{max-width:1200px;margin:0 auto;padding:1.75rem 1.5rem}
    .greet{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.75rem;flex-wrap:wrap;gap:1rem}
    h1{font-family:'Syne',sans-serif;font-weight:800;font-size:1.6rem;color:var(--text-primary);margin:0 0 .25rem;letter-spacing:-.04em}
    .greet p{color:var(--text-muted);margin:0;font-size:.9rem}
    .btn-add{padding:.65rem 1.25rem;background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
    .btn-add:hover{background:var(--accent-hover);box-shadow:0 4px 16px var(--accent-glow);transform:translateY(-1px)}
    /* stats */
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.25rem}
    @media(max-width:880px){.stats{grid-template-columns:repeat(2,1fr)}}
    .sc{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:1.15rem;display:flex;align-items:center;gap:.9rem;box-shadow:0 2px 8px var(--shadow);transition:transform .2s}
    .sc:hover{transform:translateY(-2px)}
    .si{font-size:1.7rem}
    .sv{font-family:'Syne',sans-serif;font-size:1.7rem;font-weight:800;color:var(--text-primary);line-height:1}
    .sl{font-size:.78rem;color:var(--text-muted);margin-top:.18rem}
    .sc.accent{border-left:4px solid var(--accent)}
    .sc.success{border-left:4px solid var(--success)}
    .sc.warning{border-left:4px solid var(--warning)}
    .sc.danger{border-left:4px solid var(--danger)}
    /* charts row */
    .crow{display:grid;grid-template-columns:1fr 1.4fr 1fr;gap:1rem;margin-bottom:1.5rem}
    @media(max-width:880px){.crow{grid-template-columns:1fr 1fr}}
    @media(max-width:580px){.crow{grid-template-columns:1fr}}
    .card{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:1.2rem;box-shadow:0 2px 8px var(--shadow)}
    h3{font-family:'Syne',sans-serif;font-weight:700;font-size:.875rem;color:var(--text-primary);margin:0 0 .9rem}
    .bigpct{font-family:'Syne',sans-serif;font-size:2.4rem;font-weight:800;color:var(--accent);line-height:1;margin-bottom:.65rem}
    .pbar{height:7px;background:var(--bg-hover);border-radius:10px;overflow:hidden;margin-bottom:.45rem}
    .pfill{height:100%;background:linear-gradient(90deg,var(--accent),var(--accent-hover));border-radius:10px;transition:width .8s ease}
    .phint{font-size:.76rem;color:var(--text-muted)}
    .prows{display:flex;flex-direction:column;gap:.8rem}
    .pr{display:flex;align-items:center;gap:.55rem}
    .dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
    .dot.high{background:var(--danger)}.dot.medium{background:var(--warning)}.dot.low{background:var(--success)}
    .pl{font-size:.78rem;color:var(--text-secondary);width:52px}
    .pbw{flex:1;height:6px;background:var(--bg-hover);border-radius:10px;overflow:hidden}
    .pb{height:100%;border-radius:10px;transition:width .8s ease}
    .pb.high{background:var(--danger)}.pb.medium{background:var(--warning)}.pb.low{background:var(--success)}
    .pn{font-size:.75rem;color:var(--text-muted);width:18px;text-align:right}
    .donutcard{display:flex;flex-direction:column;align-items:center}
    .donutcard canvas{margin:.3rem 0}
    .legend{display:flex;flex-direction:column;gap:.28rem;width:100%;margin-top:.4rem}
    .li{font-size:.74rem;color:var(--text-muted);display:flex;align-items:center;gap:.35rem}
    .li::before{content:'●';font-size:.85rem}
    .li.todo::before{color:var(--accent)}.li.inprog::before{color:var(--warning)}.li.done::before{color:var(--success)}
    /* recent */
    .sec{margin-top:.25rem}
    .sech{display:flex;align-items:center;justify-content:space-between;margin-bottom:.9rem}
    .sech h2{font-family:'Syne',sans-serif;font-weight:700;font-size:1.05rem;color:var(--text-primary);margin:0}
    .sall{font-size:.84rem;color:var(--accent);text-decoration:none;font-weight:500}
    .sall:hover{text-decoration:underline}
    .tgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(275px,1fr));gap:.8rem}
    .empty{text-align:center;padding:2.5rem;color:var(--text-muted);font-size:.9rem}
    .empty a{color:var(--accent);text-decoration:none;font-weight:500}
  `],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('donut') donutRef!: ElementRef<HTMLCanvasElement>;

  stats:   DashboardStats | null = null;
  recent:  Task[] = [];
  uname    = '';
  tod      = '';
  dlg      = false;
  editing: Task | null = null;

  private subs: Subscription[] = [];

  constructor(
    readonly svc: TaskService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.uname = this.auth.currentUser?.name?.split(' ')[0] ?? 'there';
    this.tod   = (() => {
      const h = new Date().getHours();
      return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
    })();

    this.svc.reload();

    this.subs.push(this.svc.all$.subscribe(ts => {
      this.recent = [...ts]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 6);
      this.drawChart();
    }));

    this.subs.push(this.svc.stats$.subscribe(s => {
      this.stats = s;
      this.drawChart();
    }));
  }

  ngAfterViewInit(): void { this.drawChart(); }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  private drawChart(): void {
    if (!this.donutRef || !this.stats) return;
    const canvas = this.donutRef.nativeElement;
    const ctx    = canvas.getContext('2d');
    if (!ctx) return;

    const { todo, inProgress: ip, completed: done, total } = this.stats;
    const dark  = document.documentElement.getAttribute('data-theme') === 'dark';
    const CX    = canvas.width / 2;
    const CY    = canvas.height / 2;
    const OR    = 62;
    const IR    = 40;
    const colors = ['#6366f1', '#f59e0b', '#10b981'];
    const vals   = total ? [todo / total, ip / total, done / total] : [0, 0, 0];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!total) {
      ctx.beginPath();
      ctx.arc(CX, CY, OR, 0, Math.PI * 2);
      ctx.arc(CX, CY, IR, Math.PI * 2, 0, true);
      ctx.fillStyle = dark ? '#2a2d4a' : '#e2e8f0';
      ctx.fill();
    } else {
      let start = -Math.PI / 2;
      vals.forEach((v, i) => {
        if (!v) return;
        const sweep = v * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(CX, CY, OR, start, start + sweep);
        ctx.arc(CX, CY, IR, start + sweep, start, true);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();
        start += sweep;
      });
    }

    ctx.fillStyle = dark ? '#e2e8f0' : '#0f172a';
    ctx.font      = `bold 18px Syne, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.stats.completionPercentage}%`, CX, CY);
  }

  pw(k: 'high' | 'medium' | 'low'): number {
    if (!this.stats?.total) return 0;
    return (this.stats.priorityBreakdown[k] / this.stats.total) * 100;
  }

  tid(_: number, t: Task): string { return t.id; }

  openEdit(t: Task): void { this.editing = t; this.dlg = true; }
  closeDlg(): void        { this.dlg = false; this.editing = null; }

  save(data: Partial<Task>): void {
    if (this.editing) {
      this.svc.update(this.editing.id, data);
    } else {
      this.svc.create({
        title:       data['title']       as string ?? '',
        description: data['description'] as string ?? '',
        priority:    data['priority']    as Task['priority']  ?? 'medium',
        status:      data['status']      as Task['status'] ?? 'todo',
        dueDate:     data['dueDate']     as string ?? '',
      });
    }
    this.closeDlg();
  }
}
