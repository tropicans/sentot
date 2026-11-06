import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ApprovalQueue } from './pages/ApprovalQueue.tsx'

vi.mock('./polling.ts', () => ({ usePolling: () => ({ status: 'ready', data: { fetchedAt: 'now', source: { availability: 'available', data: [] }, failedBoards: ['private-board'], items: [{ approvalType: 'curriculum', sourceTask: 'validate module outline', taskId: 'a1', board: 'alpha', owner: 'lna', status: 'pending', requestedDate: 'Unavailable from current read-only sources', decisionMaker: 'Unavailable from current read-only sources', evidence: 'Unavailable from current read-only sources', risk: 'Unavailable from current read-only sources', dependency: 'Unavailable from current read-only sources', version: 'Unavailable from current read-only sources' }] } }) }))

describe('approval queue page', () => {
  it('renders explicit approval requirements read-only with stable owner alias and unavailable fields', () => {
    const markup = renderToStaticMarkup(<ApprovalQueue/>)
    expect(markup).toContain('Approval queue')
    expect(markup).toContain('curriculum')
    expect(markup).toContain('Nakula')
    expect(markup).toContain('Unavailable from current read-only sources')
    expect(markup).toContain('Data sumber parsial')
    expect(markup).not.toContain('Approve')
    expect(markup).not.toContain('Reject')
  })
})
