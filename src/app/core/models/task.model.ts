export type TaskStatus   = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;   // 'YYYY-MM-DD'
  status: TaskStatus;
  createdAt: string; // ISO timestamp
}

export interface Column {
  id: TaskStatus;
  title: string;
  icon: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

export interface AuthState {
  user: Omit<User, 'password'> | null;
  isAuthenticated: boolean;
}

export interface DashboardStats {
  total: number;
  completed: number;
  overdue: number;
  inProgress: number;
  todo: number;
  completionPercentage: number;
  priorityBreakdown: { low: number; medium: number; high: number };
}
