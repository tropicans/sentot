import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { WbsTimeline } from './pages/WbsTimeline.tsx'
import { pageFromHash, pageSlug } from './routes.ts'

vi.mock('./polling.ts', () => ({ usePolling: () => ({ status: 'ready', refreshing: false, refresh: () => {}, data: {
  items: [{ key: 'alpha:root', taskId: 'root', board: 'alpha', title: 'Plan discovery', status: 'done', assignee: 'lna', children: ['alpha:child'] }, { key: 'alpha:child', taskId: 'child', board: 'alpha', title: 'Milestone: validate needs', status: 'running', assignee: 'id', milestone: 'validate needs', parents: ['alpha:root'] }],
  boardScope: { boards: [{ id: 'alpha', name: 'Alpha' }], scope: 'partial', failedBoards: ['beta'], unreadBoards: [] },
  sourceCompleteness: { status: 'partial', taskSource: 'available', dependencySource: 'partial' }, privacyScope: { scope: 'applied', visibility: 'limited', redactedTaskCount: 1 }, fetchedAt: 'now',
} }) }))

describe('WBS timeline hash route', () => {
  it('maps route and renders task hierarchy with source and privacy limits read-only', () => {
    const page = pageFromHash('#/wbs-timeline')
    expect(page).toBe('WBS & Timeline')
    expect(pageSlug(page)).toBe('wbs-timeline')
    const markup = renderToStaticMarkup(<WbsTimeline />)
    expect(markup).toContain('WBS &amp; Timeline')
    expect(markup).toContain('Plan discovery')
    expect(markup).toContain('Milestone: validate needs')
    expect(markup).toContain('Dependencies: alpha:child')
    expect(markup).toContain('Source coverage partial')
    expect(markup).toContain('Failed/unavailable boards: beta')
    expect(markup).toContain('1 redacted task(s)')
    expect(markup).not.toMatch(/<form|<input|<button/)
  })
})
