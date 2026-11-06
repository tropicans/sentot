import { describe, expect, it } from 'vitest'
import { buildCompletionReport, type TaskBoardSnapshot } from './mission-control.js'

const board: TaskBoardSnapshot = { tasks: { availability: 'available', data: [
  { id: '1', board: 'alpha', title: 'Build module', status: 'done', assignee: 'id' },
  { id: '2', board: 'alpha', title: 'Blocked dependency', status: 'blocked' },
  { id: '3', board: 'alpha', title: 'Approval pending: final completion — sign off', status: 'todo' },
] }, boards: [{ slug: 'alpha', name: 'Alpha', current: true, total: 3 }], fetchedAt: 'now' }

describe('completion report', () => {
  it('summarizes sourced task state but stays conservative about completion', () => {
    const report = buildCompletionReport(board, { graph: { availability: 'available', data: { nodes: [], edges: [], partial: false, failed: [] } } , fetchedAt: 'now' })
    expect(report.taskSummary).toMatchObject({ total: 3, completed: 1, blocked: 1, unassigned: 2 })
    expect(report.overallStatus).toBe('not ready')
    expect(report.finalApprovalStatus).toBe('pending')
    expect(report.source.status).toBe('available')
  })
  it('counts only exact done or complete statuses as completed', () => {
    const report = buildCompletionReport({ ...board, tasks: { availability: 'available', data: [
      { id: 'done', board: 'alpha', title: 'Done', status: 'done' },
      { id: 'complete', board: 'alpha', title: 'Complete', status: 'complete' },
      { id: 'incomplete', board: 'alpha', title: 'Incomplete', status: 'incomplete' },
    ] } }, { graph: { availability: 'available', data: { nodes: [], edges: [], partial: false, failed: [] } }, fetchedAt: 'now' })
    expect(report.taskSummary.completed).toBe(2)
    expect(report.readinessGaps).toContain('Task belum selesai')
  })
  it('exposes partial scope, failed boards, dependency failures, and mandatory source gap', () => {
    const partial = buildCompletionReport({ ...board, failedBoards: ['beta'] }, { graph: { availability: 'available', data: { nodes: [], edges: [], partial: true, failed: ['alpha:task-9 — dependency unavailable'] } } , fetchedAt: 'now' })
    expect(partial.source).toMatchObject({ status: 'partial', includedBoardIds: ['alpha'], failedBoards: ['beta'], failedDependencies: ['alpha:task-9 — dependency unavailable'] })
    expect(partial.readinessGaps).toEqual(expect.arrayContaining(['Source partial: failed boards beta', 'Source partial: failed dependencies alpha:task-9 — dependency unavailable']))
    expect(partial.readinessGaps).toContain('Source incomplete: partial or unavailable data prevents full completion assessment')
  })
  it('reports only safely derived redaction metadata, never private details', () => {
    const privateBoard: TaskBoardSnapshot = { ...board, tasks: { availability: 'available', data: [{ id: 'secret', board: 'alpha', title: 'Private task', status: 'done', private: true }] } }
    const report = buildCompletionReport(privateBoard, { graph: { availability: 'available', data: { nodes: [], edges: [], partial: false, failed: [] } }, fetchedAt: 'now' })
    expect(report.privacy).toEqual({ scope: 'applied', visibility: 'limited', redactedTaskCount: 1 })
    expect(JSON.stringify(report)).not.toContain('Private task')
  })
  it('retains failed boards when every board read fails', async () => {
    const { collectTaskBoard } = await import('./mission-control.js')
    const snapshot = await collectTaskBoard(async (_bin, command) => command.includes('boards') ? '[{"slug":"alpha","name":"Alpha","is_current":true,"total":1},{"slug":"beta","name":"Beta","total":1}]' : 'failure')
    expect(snapshot.failedBoards).toEqual(['alpha', 'beta'])
    expect(snapshot.boards).toHaveLength(2)
  })
  it('exposes ambiguous board discovery and dependency source separately', () => {
    const report = buildCompletionReport({ tasks: { availability: 'available', data: [] }, boards: [], fetchedAt: 'now' }, { graph: { availability: 'unavailable', data: { nodes: [], edges: [], partial: true, failed: [] }, error: { code: 'COMMAND_FAILED', message: 'graph down' } }, fetchedAt: 'now' })
    expect(report.source).toMatchObject({ boardDiscovery: 'empty', scope: 'ambiguous', dependencySource: { availability: 'unavailable', reason: 'graph down' }, failedDependencies: [] })
    expect(report.readinessGaps).toContain('Scope ambiguous: board discovery empty')
  })
  it('includes successfully read empty boards and labels partial scope', () => {
    const report = buildCompletionReport({ tasks: { availability: 'available', data: [] }, boards: [{ slug: 'alpha', name: 'Alpha', current: true, total: 0 }], fetchedAt: 'now' }, { graph: { availability: 'available', data: { nodes: [], edges: [], partial: false, failed: [] } }, fetchedAt: 'now' })
    expect(report.source.includedBoardIds).toEqual(['alpha'])
    expect(report.source.scope).not.toBe('task-bearing boards only')
  })
  it('does not claim complete scope when discovery found unread empty board', () => {
    const report = buildCompletionReport({ tasks: { availability: 'available', data: [] }, boards: [
      { slug: 'current', name: 'Current', current: true, total: 0 },
      { slug: 'empty', name: 'Empty', current: false, total: 0 },
    ], readBoardIds: ['current'], fetchedAt: 'now' }, { graph: { availability: 'available', data: { nodes: [], edges: [], partial: false, failed: [] } }, fetchedAt: 'now' })
    expect(report.source.scope).not.toBe('complete')
    expect(report.readinessGaps).toContain('Source partial: unread boards empty')
  })

  it('surfaces malformed task records as an unavailable source', async () => {
    const { collectTaskBoard } = await import('./mission-control.js')
    const snapshot = await collectTaskBoard(async () => '[{"slug":"alpha","name":"Alpha","is_current":true,"total":1}]')
    const report = buildCompletionReport(snapshot, { graph: { availability: 'available', data: { nodes: [], edges: [], partial: false, failed: [] } }, fetchedAt: 'now' })
    expect(snapshot.tasks.availability).toBe('unavailable')
    expect(report.source.status).toBe('unavailable')
  })
  it('surfaces malformed board records as a partial source', async () => {
    const { collectTaskBoard } = await import('./mission-control.js')
    const snapshot = await collectTaskBoard(async (_bin, command) => command.includes('boards') ? '[{"slug":"alpha","name":"Alpha","is_current":true,"total":1},{}]' : '[{"title":"Valid task","status":"done"}]')
    const report = buildCompletionReport(snapshot, { graph: { availability: 'available', data: { nodes: [], edges: [], partial: false, failed: [] } }, fetchedAt: 'now' })
    expect(snapshot.boardDiscovery?.availability).toBe('unavailable')
    expect(report.source.status).toBe('partial')
    expect(report.readinessGaps).toContain('Scope ambiguous: board discovery unavailable')
  })
  it('reports unavailable sources and never claims approved complete', async () => {
    const report = buildCompletionReport({ ...board, tasks: { availability: 'unavailable', data: [], error: { code: 'COMMAND_FAILED', message: 'no board' } } }, { graph: { availability: 'unavailable', data: { nodes: [], edges: [], partial: false, failed: [] } }, fetchedAt: 'now' })
    expect(report.overallStatus).toBe('not ready')
    expect(report.source.status).toBe('unavailable')
    expect(report.finalApprovalStatus).toContain('Unavailable')
    expect(report.readinessGaps).toContain('Unavailable from current read-only sources')
  })
})
