import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ResourceCapacity } from './pages/ResourceCapacity.tsx'

vi.mock('./polling.ts', () => ({ usePolling: () => ({ status: 'ready', data: {
  agents: [{ agentId: 'bagong', displayName: 'Bagong', workload: [{ taskId: 'a1', board: 'alpha', title: 'Implement API', status: 'running' }], capacity: 'Unavailable from current read-only sources' }],
  unassigned: [{ taskId: 'u1', board: 'alpha', title: 'Choose owner', status: 'todo' }],
  bottlenecks: [{ taskId: 'a1', board: 'alpha', title: 'Implement API', status: 'running', blocks: 1 }],
  source: { status: 'available', scope: 'complete', boardDiscovery: 'available', includedBoardIds: ['alpha'], failedBoards: [], dependencySource: { availability: 'available' } },
  privacy: { scope: 'limited', visibility: 'limited' }, fetchedAt: 'now',
} }) }))

describe('resource and capacity page', () => {
  it('renders read-only sourced workload, unavailable capacity, scope, privacy, unassigned work, and bottlenecks', () => {
    const markup = renderToStaticMarkup(<ResourceCapacity/>)
    expect(markup).toContain('Resource &amp; Capacity')
    expect(markup).toContain('Bagong')
    expect(markup).toContain('Implement API')
    expect(markup).toContain('Unavailable from current read-only sources')
    expect(markup).toContain('Choose owner')
    expect(markup).toContain('blocks 1 task')
    expect(markup).toContain('Included board IDs: alpha')
    expect(markup).toContain('Privacy: limited')
    expect(markup).toContain('Task lists are not effort, capacity, or utilization measures')
    expect(markup).not.toContain('onClick')
  })
})
