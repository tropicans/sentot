import { describe, expect, it } from 'vitest'
import { buildDeliverables, type TaskBoardSnapshot } from './mission-control.js'
import { PRIVATE_TASK, redactDeliverables } from './privacy.js'
import type { Privacy } from './profile-lock.js'

const board: TaskBoardSnapshot = {
  tasks: { availability: 'available', data: [
    { id: 't1', title: 'Release package', status: 'done', assignee: 'coder', board: 'main' },
    { title: 'Unidentified work', status: 'running' },
  ] },
  boards: [{ slug: 'main', name: 'Main', current: true, total: 1 }],
  fetchedAt: '2026-01-01T00:00:00.000Z',
}

const unavailable = 'Unavailable from current read-only sources'

describe('deliverables snapshot', () => {
  it('maps every task to a candidate without inferring governed fields', () => {
    const result = buildDeliverables(board)
    expect(result.candidates).toHaveLength(2)
    expect(result.candidates[0]).toEqual({
      title: 'Release package', taskId: 't1', board: 'main', owner: 'coder', taskStatus: 'done',
      version: unavailable, evidence: unavailable, approval: unavailable, finalReadiness: unavailable,
    })
    expect(result.candidates[1]).toMatchObject({ owner: unavailable, taskStatus: 'running' })
    expect(result.source).toEqual(board.tasks)
    expect(result.fetchedAt).toBe(board.fetchedAt)
  })

  it('preserves unavailable source and never reads task details or artifacts', () => {
    const source: TaskBoardSnapshot = { tasks: { availability: 'unavailable', data: [], error: { code: 'COMMAND_FAILED', message: 'down' } }, fetchedAt: 'now' }
    expect(buildDeliverables(source)).toEqual({ candidates: [], source: source.tasks, fetchedAt: 'now' })
  })

  it('redacts locked task titles', () => {
    const privacy: Privacy = { all: false, hidden: new Set(['coder']), locked: new Set(['coder']) }
    const redacted = redactDeliverables(buildDeliverables(board), privacy)
    expect(redacted.candidates[0]).toMatchObject({ title: PRIVATE_TASK, private: true })
    expect(JSON.stringify(redacted)).not.toContain('Release package')
  })
})
