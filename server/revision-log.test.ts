import { describe, expect, it } from 'vitest'
import { buildRevisionLog, DELIVERABLE_UNAVAILABLE, type TaskBoardSnapshot, type TaskDetail } from './mission-control.js'

const board: TaskBoardSnapshot = {
  tasks: { availability: 'available', data: [
    { id: 't_alpha', board: 'alpha', title: 'Module revision', status: 'done', assignee: 'lcd' },
    { id: 't_locked', board: 'alpha', title: 'Private task', status: 'running', assignee: 'aes', private: true },
  ] },
  boards: [{ slug: 'alpha', name: 'Alpha', current: true, total: 2 }],
  readBoardIds: ['alpha'],
  fetchedAt: '2026-01-01T00:00:00.000Z',
}

const explicit: TaskDetail = {
  id: 't_alpha', title: 'Module revision', status: 'done', assignee: 'lcd', createdBy: 'lpm', createdAt: '2025-12-31T00:00:00.000Z', skills: [], parents: [], children: [], comments: [{ author: 'sme', body: 'Revision: R2\nReason: SME correction\nReviewer: sme\nEvidence: review-42', createdAt: '2026-01-01T00:00:00.000Z' }], events: [], runs: [],
}

describe('revision log', () => {
  it('uses only explicit labelled board-record metadata and preserves stable task IDs', () => {
    const snapshot = buildRevisionLog(board, new Map([['alpha:t_alpha', explicit]]))
    expect(snapshot.entries[0]).toEqual({
      taskId: 't_alpha', board: 'alpha', title: 'Module revision', version: DELIVERABLE_UNAVAILABLE, revision: 'R2', authorOrOwner: 'lcd', reason: 'SME correction', reviewer: 'sme', evidence: 'review-42', timestamp: DELIVERABLE_UNAVAILABLE,
    })
    expect(snapshot.entries[1]).toMatchObject({ taskId: 't_locked', title: '🔒 Private task', private: true, version: DELIVERABLE_UNAVAILABLE, authorOrOwner: DELIVERABLE_UNAVAILABLE })
    expect(JSON.stringify(snapshot.entries[1])).not.toContain('aes')
  })

  it('does not infer metadata from task status, title, or timestamps without explicit revision evidence', () => {
    const details = new Map<string, TaskDetail>([['alpha:t_alpha', { ...explicit, comments: [], createdAt: '2025-12-31T00:00:00.000Z' }]])
    const snapshot = buildRevisionLog({ ...board, tasks: { ...board.tasks, data: [board.tasks.data[0]] } }, details)
    expect(snapshot.entries[0]).toMatchObject({ version: DELIVERABLE_UNAVAILABLE, revision: DELIVERABLE_UNAVAILABLE, reason: DELIVERABLE_UNAVAILABLE, reviewer: DELIVERABLE_UNAVAILABLE, evidence: DELIVERABLE_UNAVAILABLE, timestamp: DELIVERABLE_UNAVAILABLE })
  })

  it('reports board completeness and privacy scope without reading unavailable details as evidence', () => {
    const snapshot = buildRevisionLog({ ...board, failedBoards: ['beta'] }, new Map())
    expect(snapshot.source).toMatchObject({ status: 'partial', scope: 'partial', includedBoardIds: ['alpha'], failedBoards: ['beta'], detailSource: 'unavailable' })
    expect(snapshot.privacy).toEqual({ scope: 'applied', visibility: 'limited', redactedTaskCount: 1 })
  })
})
