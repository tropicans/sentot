import { describe, expect, it } from 'vitest'
import { buildProjectCharter, type TaskBoardSnapshot } from './mission-control.js'

const unavailable = 'Unavailable from current read-only sources'
const board: TaskBoardSnapshot = { tasks: { availability: 'available', data: [
  { id: 't1', board: 'alpha', title: 'Milestone: launch', status: 'todo', assignee: 'agent-1' },
  { id: 't2', board: 'alpha', title: 'Risk: dependency', status: 'blocked', assignee: 'agent-2' },
  { id: 't3', board: 'alpha', title: 'Approval pending: scope — review', status: 'todo', assignee: 'agent-1' },
] }, boards: [{ slug: 'alpha', name: 'Alpha', current: true, total: 3 }], readBoardIds: ['alpha'], fetchedAt: '2026-01-01T00:00:00.000Z' }

describe('project charter', () => {
  it('uses only explicit task markers and reports unavailable fields', () => {
    const charter = buildProjectCharter(board)
    expect(charter.projectBoardScope).toMatchObject({ boards: [{ id: 'alpha', name: 'Alpha' }], scope: 'complete' })
    expect(charter.objective).toBe(unavailable)
    expect(charter.scopeIn).toBe(unavailable)
    // Assignees are task owners, not explicit project stakeholders.
    expect(charter.stakeholders).toEqual([])
    expect(charter.milestones).toEqual([{ title: 'launch', taskId: 't1', board: 'alpha' }])
    expect(charter.constraints).toEqual([])
    expect(charter.risks).toEqual([{ title: 'dependency', taskId: 't2', board: 'alpha' }])
    expect(charter.assumptions).toEqual([])
    expect(charter.approvalGates).toEqual([{ title: 'review', taskId: 't3', board: 'alpha', status: 'pending' }])
    expect(charter.sourceCompleteness.status).toBe('available')
    expect(charter.listSource).toEqual({ status: 'complete' })
  })
  it('shows partial scope and masks private task-derived data', () => {
    const partial = buildProjectCharter({ ...board, failedBoards: ['beta'], tasks: { availability: 'available', data: [{ ...board.tasks.data[0], private: true }] } })
    expect(partial.projectBoardScope).toMatchObject({ scope: 'partial', failedBoards: ['beta'] })
    expect(partial.listSource).toEqual({ status: 'partial' })
    expect(JSON.stringify(partial)).not.toContain('launch')
    expect(partial.privacyScope.visibility).toBe('limited')
  })
  it('does not fabricate dates or stakeholder labels when source unavailable', () => {
    const charter = buildProjectCharter({ ...board, tasks: { availability: 'unavailable', data: [], error: { code: 'COMMAND_FAILED', message: 'down' } }, boards: undefined })
    expect(charter.milestones).toEqual([])
    expect(charter.stakeholders).toEqual([])
    expect(charter.generatedAt).toBe(board.fetchedAt)
    expect(charter.sourceCompleteness.status).toBe('unavailable')
    expect(charter.listSource).toEqual({ status: 'unavailable' })
    expect(charter.projectBoardScope.scope).toBe('ambiguous')
  })
})
