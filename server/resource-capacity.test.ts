import { describe, expect, it } from 'vitest'
import { buildResourceCapacity, CAPACITY_UNAVAILABLE, type DependencySnapshot, type TaskBoardSnapshot } from './mission-control.js'

const board: TaskBoardSnapshot = {
  tasks: { availability: 'available', data: [
    { id: 'a1', board: 'alpha', title: 'Implement API', status: 'running', assignee: 'bagong' },
    { id: 'a2', board: 'alpha', title: 'Private review', status: 'ready', assignee: 'gareng', private: true },
    { id: 'u1', board: 'alpha', title: 'Choose owner', status: 'todo' },
    { id: 'd1', board: 'alpha', title: 'Finished work', status: 'done', assignee: 'bagong' },
  ] },
  boards: [{ slug: 'alpha', name: 'Alpha', current: true, total: 4 }],
  readBoardIds: ['alpha'],
  boardDiscovery: { availability: 'available', empty: false },
  fetchedAt: '2026-01-01T00:00:00.000Z',
}
const dependencies: DependencySnapshot = { graph: { availability: 'available', data: {
  nodes: [
    { key: 'alpha:a1', id: 'a1', board: 'alpha', title: 'Implement API', status: 'running', assignee: 'bagong', waiting: false, bottleneck: 1, root: true, available: true },
    { key: 'alpha:u1', id: 'u1', board: 'alpha', title: 'Choose owner', status: 'todo', waiting: true, bottleneck: 0, root: false, available: true },
  ],
  edges: [{ from: 'alpha:a1', to: 'alpha:u1' }], partial: false, failed: [],
} }, fetchedAt: board.fetchedAt }

describe('resource and capacity projection', () => {
  it('groups explicit active assignments by stable agent id without treating task count as effort or capacity', () => {
    const result = buildResourceCapacity(board, dependencies)
    expect(result.agents).toEqual([
      { agentId: 'bagong', displayName: 'Bagong', workload: [{ taskId: 'a1', board: 'alpha', title: 'Implement API', status: 'running' }], capacity: CAPACITY_UNAVAILABLE },
      { agentId: 'gareng', displayName: 'Gareng', workload: [{ taskId: 'a2', board: 'alpha', title: '🔒 Private task', status: 'ready', private: true }], capacity: CAPACITY_UNAVAILABLE },
    ])
    expect(result).not.toHaveProperty('utilization')
    expect(JSON.stringify(result)).not.toContain('Finished work')
    expect(JSON.stringify(result)).not.toContain('Private review')
  })

  it('lists explicit unassigned active tasks and dependency-grounded bottlenecks', () => {
    const result = buildResourceCapacity(board, dependencies)
    expect(result.unassigned).toEqual([{ taskId: 'u1', board: 'alpha', title: 'Choose owner', status: 'todo' }])
    expect(result.bottlenecks).toEqual([{ taskId: 'a1', board: 'alpha', title: 'Implement API', status: 'running', blocks: 1 }])
  })

  it('reports source, board, dependency, and privacy completeness', () => {
    const result = buildResourceCapacity(board, dependencies)
    expect(result.source).toMatchObject({ status: 'available', scope: 'complete', boardDiscovery: 'available', includedBoardIds: ['alpha'], failedBoards: [], dependencySource: { availability: 'available' } })
    expect(result.privacy).toEqual({ scope: 'applied', visibility: 'limited', redactedTaskCount: 1 })
  })

  it('does not claim workload, bottlenecks, or complete scope from unavailable sources', () => {
    const result = buildResourceCapacity({ ...board, tasks: { availability: 'unavailable', data: [], error: { code: 'COMMAND_FAILED', message: 'down' } } }, { graph: { availability: 'unavailable', data: { nodes: [], edges: [], partial: false, failed: [] } }, fetchedAt: board.fetchedAt })
    expect(result.agents).toEqual([])
    expect(result.unassigned).toEqual([])
    expect(result.bottlenecks).toEqual([])
    expect(result.source).toMatchObject({ status: 'unavailable', scope: 'ambiguous', dependencySource: { availability: 'unavailable' } })
  })
})
