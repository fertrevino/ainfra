// A2A TaskState enum: https://google.github.io/A2A/specification/#63-taskstate-enum
export const TaskStatus = {
  submitted: 'submitted',
  working: 'working',
  inputRequired: 'input-required',
  completed: 'completed',
  canceled: 'canceled',
  failed: 'failed',
  rejected: 'rejected',
  authRequired: 'auth-required',
  unknown: 'unknown',
} as const;

export type TaskState = typeof TaskStatus[keyof typeof TaskStatus];

export interface Task {
  id: string;
  project_id: string;
  skill: string;
  infra_plan_id?: string | null;
  status: TaskState;
  created_by: string;
  a2a_task_id?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  artifact_url?: string | null;
  error_msg?: string | null;
  created_at?: string;
}

export interface CreateTaskData {
  id: string;
  project_id: string;
  skill: string;
  infra_plan_id?: string | null;
  status: TaskState;
  created_by: string;
  prompt_id?: string | null;
}
