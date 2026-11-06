import { describe, expect, it } from 'vitest'
import { buildWbsTimeline, type DependencySnapshot, type TaskBoardSnapshot } from './mission-control.js'

const board: TaskBoardSnapshot = { tasks: { availability: 'available', data: [
  { id: 'root', board: 'alpha', title: 'Plan discovery', status: 'done', assignee: 'lna', priority: 2 },
  { id: 'child', board: 'alpha', title: 'Milestone: validate needs', status: 'running', assignee: 'id', priority: 1 },
  { id: 'deadline', board: 'alpha', title: 'Deadline: 2026-03-01', status: 'todo', assignee: 'aes' },
  { id: 'plain', board: 'alpha', title: 'Work item', status: 'todo', assignee: 'tlts' },
] }, boards: [{ slug: 'alpha', name: 'Alpha', current: true, total: 4 }], readBoardIds: ['alpha'], fetchedAt: '2026-01-01T00:00:00.000Z' }
const dependencies: DependencySnapshot = { graph: { availability: 'available', data: { nodes: [], edges: [{ from: 'alpha:root', to: 'alpha:child' }], partial: false, failed: [] } }, fetchedAt: '2026-01-01T00:00:01.000Z' }

describe('WBS timeline', () => {
  it('builds a board-scoped dependency hierarchy from explicit task data without fabricated schedule fields', () => {
    const timeline = buildWbsTimeline(board, dependencies)
    expect(timeline.items).toEqual([
      { key: 'alpha:root', taskId: 'root', board: 'alpha', title: 'Plan discovery', status: 'done', assignee: 'lna', priority: 2, children: ['alpha:child'] },
      { key: 'alpha:child', taskId: 'child', board: 'alpha', title: 'Milestone: validate needs', status: 'running', assignee: 'id', priority: 1, milestone: 'validate needs', parents: ['alpha:root'] },
      { key: 'alpha:deadline', taskId: 'deadline', board: 'alpha', title: 'Deadline: 2026-03-01', status: 'todo', assignee: 'aes', deadline: '2026-03-01' },
      { key: 'alpha:plain', taskId: 'plain', board: 'alpha', title: 'Work item', status: 'todo', assignee: 'tlts' },
    ])
    expect(JSON.stringify(timeline)).not.toMatch(/effort|readiness|approval|startDate|endDate/)
    expect(timeline.boardScope).toMatchObject({ scope: 'complete', boards: [{ id: 'alpha', name: 'Alpha' }] })
    expect(timeline.sourceCompleteness).toEqual({ status: 'available', taskSource: 'available', dependencySource: 'available' })
  })

  it('does not infer hierarchy, dates, or private task content when sources are partial or unavailable', () => {
    const timeline = buildWbsTimeline({ ...board, failedBoards: ['beta'], tasks: { availability: 'available', data: [{ ...board.tasks.data[1], private: true }] } }, { graph: { availability: 'unavailable', data: { nodes: [], edges: [], partial: true, failed: [] }, error: { code: 'COMMAND_FAILED', message: 'down' } }, fetchedAt: 'now' })
    expect(timeline.items).toEqual([])
    expect(timeline.boardScope.scope).toBe('partial')
    expect(timeline.sourceCompleteness.status).toBe('partial')
    expect(timeline.privacyScope).toEqual({ scope: 'applied', visibility: 'limited', redactedTaskCount: 1 })
    expect(JSON.stringify(timeline)).not.toContain('validate needs')
  })
})
