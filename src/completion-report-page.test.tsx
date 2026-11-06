import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CompletionReport } from './pages/CompletionReport.tsx'
import { pageFromHash, pageSlug } from './routes.ts'

vi.mock('./polling.ts', () => ({
  usePolling: () => ({
    status: 'ready',
    data: {
      overallStatus: 'conditionally ready',
      taskSummary: { total: 3, completed: 2, inProgress: 1, blocked: 0, unassigned: 0 },
      finalApprovalStatus: 'pending',
      readinessGaps: ['Final approval pending'],
      source: {
        status: 'available',
        scope: 'complete',
        boardDiscovery: 'available',
        includedBoardIds: ['main'],
        failedBoards: [],
        failedDependencies: [],
        dependencySource: { availability: 'available' },
      },
      privacy: { scope: 'applied', visibility: 'full', redactedTaskCount: 0 },
      fetchedAt: 'now',
    },
  }),
}))

describe('completion report hash route', () => {
  it('maps #/completion-report and renders the completion report page', () => {
    const page = pageFromHash('#/completion-report')
    expect(page).toBe('Completion Report')
    expect(pageSlug(page)).toBe('completion-report')

    const markup = renderToStaticMarkup(<CompletionReport />)
    expect(markup).toContain('Project Completion Report')
    expect(markup).toContain('conditionally ready')
    expect(markup).toContain('Final approval: pending')
    expect(markup).toContain('Final approval pending')
  })
})
