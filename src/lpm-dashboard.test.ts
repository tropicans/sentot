import { describe, expect, it } from 'vitest'
import { openUnassigned, taskIsBlocked, workload } from './lpm-dashboard.ts'

const tasks = [
  { title: 'Locked title stays unchanged', status: 'blocked', assignee: 'alpha' },
  { title: 'Open work', status: 'running', assignee: 'alpha' },
  { title: 'Needs owner', status: 'ready' },
  { title: 'Done', status: 'done', assignee: 'beta' },
]

describe('LPM dashboard selectors', () => {
  it('uses task board data for blocked, workload, and unassigned open work', () => {
    expect(taskIsBlocked(tasks[0])).toBe(true)
    expect(workload(tasks)).toEqual([{ agent: 'alpha', count: 2 }, { agent: '(unassigned)', count: 1 }])
    expect(openUnassigned(tasks)).toEqual([tasks[2]])
  })
})
