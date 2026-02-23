import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Task, TaskStatus, DashboardStats } from '../models/task.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks$ = new BehaviorSubject<Task[]>([]);

  constructor(private auth: AuthService) {}

  // Call after login to load that user's tasks
  reload(): void {
    const uid = this.auth.currentUser?.id;
    if (!uid) return;
    const raw = localStorage.getItem(`tf_tasks_${uid}`);
    const tasks: Task[] = raw ? JSON.parse(raw) : this.seedTasks();
    this.tasks$.next(tasks);
    if (!raw) this.save();
  }

  private save(): void {
    const uid = this.auth.currentUser?.id;
    if (uid) localStorage.setItem(`tf_tasks_${uid}`, JSON.stringify(this.tasks$.getValue()));
  }

  get all$(): Observable<Task[]> { return this.tasks$.asObservable(); }

  byStatus$(status: TaskStatus): Observable<Task[]> {
    return this.tasks$.pipe(map(ts => ts.filter(t => t.status === status)));
  }

  get stats$(): Observable<DashboardStats> {
    return this.tasks$.pipe(map(tasks => {
      const todayStr = new Date().toDateString();
      const completed  = tasks.filter(t => t.status === 'done').length;
      const inProgress = tasks.filter(t => t.status === 'in-progress').length;
      const todo       = tasks.filter(t => t.status === 'todo').length;
      const overdue    = tasks.filter(t =>
        t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date(todayStr)
      ).length;
      const total = tasks.length;
      return {
        total, completed, overdue, inProgress, todo,
        completionPercentage: total ? Math.round((completed / total) * 100) : 0,
        priorityBreakdown: {
          high:   tasks.filter(t => t.priority === 'high').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          low:    tasks.filter(t => t.priority === 'low').length,
        },
      };
    }));
  }

  create(data: Omit<Task,'id'|'createdAt'>): void {
    const task: Task = { ...data, id: this.uuid(), createdAt: new Date().toISOString() };
    this.tasks$.next([...this.tasks$.getValue(), task]);
    this.save();
  }

  update(id: string, changes: Partial<Omit<Task,'id'|'createdAt'>>): void {
    this.tasks$.next(this.tasks$.getValue().map(t => t.id === id ? { ...t, ...changes } : t));
    this.save();
  }

  delete(id: string): void {
    this.tasks$.next(this.tasks$.getValue().filter(t => t.id !== id));
    this.save();
  }

  move(id: string, status: TaskStatus): void { this.update(id, { status }); }

  reorder(reorderedSubset: Task[]): void {
    const ids = new Set(reorderedSubset.map(t => t.id));
    const rest = this.tasks$.getValue().filter(t => !ids.has(t.id));
    this.tasks$.next([...rest, ...reorderedSubset]);
    this.save();
  }

  static isOverdue(t: Task): boolean {
    return t.status !== 'done' && !!t.dueDate &&
      new Date(t.dueDate) < new Date(new Date().toDateString());
  }

  private uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  private seedTasks(): Task[] {
    const f = (n: number) => {
      const d = new Date(); d.setDate(d.getDate() + n);
      return d.toISOString().split('T')[0];
    };
    return [
      { id: this.uuid(), title: 'Design landing page', description: 'Wireframes + hi-fi mockups for the product page.', priority: 'high',   dueDate: f(3),  status: 'todo',        createdAt: new Date().toISOString() },
      { id: this.uuid(), title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing.', priority: 'medium', dueDate: f(7),  status: 'todo',        createdAt: new Date().toISOString() },
      { id: this.uuid(), title: 'Write unit tests',     description: 'Add tests for all core service methods.',         priority: 'low',    dueDate: f(-2), status: 'in-progress', createdAt: new Date().toISOString() },
      { id: this.uuid(), title: 'API integration',      description: 'Connect frontend to the REST API endpoints.',     priority: 'high',   dueDate: f(1),  status: 'in-progress', createdAt: new Date().toISOString() },
      { id: this.uuid(), title: 'Update README',        description: 'Add setup instructions and architecture notes.',  priority: 'low',    dueDate: f(-5), status: 'done',        createdAt: new Date().toISOString() },
    ];
  }
}
