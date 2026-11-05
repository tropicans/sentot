import { describe, expect, it } from 'vitest'
import { buildRiskRegister, RISK_UNAVAILABLE, type DependencySnapshot, type TaskBoardSnapshot } from './mission-control.js'

const board: TaskBoardSnapshot = { tasks: { availability: 'available', data: [
  { id: 'r1', board: 'alpha', title: 'Risk: vendor API may be unavailable', status: 'running', assignee: 'lna' },
  { id: 'a1', board: 'alpha', title: 'Assumption: learner roster is current', status: 'todo', assignee: 'id' },
  { id: 't1', board: 'alpha', title: 'Build module', status: 'todo', assignee: 'lcd' },
] }, fetchedAt: 'now' }
const dependencies: DependencySnapshot = { graph: { availability: 'available', data: { nodes: [], edges: [{ from: 'alpha:r1', to: 'alpha:t1' }], partial: false, failed: [] } }, fetchedAt: 'now' }

describe('risk register', () => {
  it('projects only task titles explicitly marked risk or assumption, board-scoped dependency blockers, and no inferred governance fields', () => {
    const result = buildRiskRegister(board, dependencies)
    expect(result.entries).toEqual([
      { kind: 'Risk', title: 'vendor API may be unavailable', taskId: 'r1', board: 'alpha', impact: RISK_UNAVAILABLE, dependencies: ['Build module'], mitigationOwner: 'lna', mitigationStatus: 'running', reviewDate: RISK_UNAVAILABLE, evidence: RISK_UNAVAILABLE, approval: RISK_UNAVAILABLE },
      { kind: 'Assumption', title: 'learner roster is current', taskId: 'a1', board: 'alpha', impact: RISK_UNAVAILABLE, dependencies: [], mitigationOwner: 'id', mitigationStatus: 'todo', reviewDate: RISK_UNAVAILABLE, evidence: RISK_UNAVAILABLE, approval: RISK_UNAVAILABLE },
    ])
  })

  it('does not create risk entries or blockers from unavailable sources', () => {
    const result = buildRiskRegister({ ...board, tasks: { availability: 'unavailable', data: [] } }, dependencies)
    expect(result.entries).toEqual([])
    expect(result.source.availability).toBe('unavailable')
  })

  it('exposes unavailable dependency source instead of empty complete blocker list', () => {
    const error = { code: 'COMMAND_FAILED' as const, message: 'dependency command failed' }
    const result = buildRiskRegister(board, { graph: { availability: 'unavailable', data: { nodes: [], edges: [], partial: false, failed: [] }, error }, fetchedAt: 'now' })
    expect(result.dependencySource).toEqual({ availability: 'unavailable', error })
  })

  it('exposes partial dependency coverage', () => {
    const result = buildRiskRegister(board, { graph: { availability: 'available', data: { nodes: [], edges: [], partial: true, failed: ['alpha:r1'] } }, fetchedAt: 'now' })
    expect(result.dependencySource).toEqual({ availability: 'partial', failed: ['alpha:r1'] })
  })
})
