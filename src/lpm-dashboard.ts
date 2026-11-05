import type { Task } from './types.ts'

export const OPEN_STATUSES = new Set(['todo', 'ready', 'running', 'blocked', 'review'])
export const BLOCKED_STATUSES = new Set(['blocked'])

export function taskIsOpen(task: Task): boolean { return OPEN_STATUSES.has(task.status.toLowerCase()) }
export function taskIsBlocked(task: Task): boolean { return BLOCKED_STATUSES.has(task.status.toLowerCase()) }
export function workload(tasks: Task[]): { agent: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const task of tasks.filter(taskIsOpen)) {
    const agent = task.assignee ?? '(unassigned)'
    counts.set(agent, (counts.get(agent) ?? 0) + 1)
  }
  return Array.from(counts.entries()).map(([agent, count]) => ({ agent, count })).sort((a, b) => b.count - a.count || a.agent.localeCompare(b.agent))
}
export function openUnassigned(tasks: Task[]): Task[] { return tasks.filter((task) => taskIsOpen(task) && !task.assignee) }
