import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { RevisionLog } from './pages/RevisionLog.tsx'
import { pageFromHash, pageSlug } from './routes.ts'

vi.mock('./polling.ts', () => ({ usePolling: () => ({ status: 'ready', data: { fetchedAt: 'now', source: { status: 'partial', scope: 'partial', includedBoardIds: ['alpha'], failedBoards: ['beta'], detailSource: 'partial' }, privacy: { scope: 'applied', visibility: 'limited', redactedTaskCount: 1 }, entries: [{ taskId: 't_1', board: 'alpha', title: 'Module revision', version: 'v1.2', revision: 'R2', authorOrOwner: 'lcd', reason: 'SME correction', reviewer: 'sme', evidence: 'review-42', timestamp: '2026-01-01T00:00:00.000Z' }] } }) }))

describe('revision log route', () => {
  it('maps #/revision-log and renders only read-only sourced fields with stable aliases', () => {
    const page = pageFromHash('#/revision-log')
    expect(page).toBe('Revision Log')
    expect(pageSlug(page)).toBe('revision-log')
    const markup = renderToStaticMarkup(<RevisionLog />)
    expect(markup).toContain('Revision &amp; Version Log')
    expect(markup).toContain('Module revision')
    expect(markup).toContain('Bima')
    expect(markup).toContain('Board scope: partial')
    expect(markup).toContain('Privacy scope: applied')
    expect(markup).not.toContain('Approve')
  })
})
