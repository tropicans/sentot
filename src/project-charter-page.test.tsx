import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ProjectCharter } from './pages/ProjectCharter.tsx'
import type { ProjectCharterSnapshot } from './types.ts'
import { pageFromHash, pageSlug } from './routes.ts'

vi.mock('./polling.ts', () => ({ usePolling: () => ({ status: 'ready', data: {
  projectBoardScope: { boards: [{ id: 'alpha', name: 'Alpha' }], scope: 'partial', failedBoards: ['beta'], unreadBoards: [] },
  objective: 'Unavailable from current read-only sources', scopeIn: 'Unavailable from current read-only sources', scopeOut: 'Unavailable from current read-only sources',
  stakeholders: ['agent-1'], milestones: [], constraints: [], risks: [], assumptions: [], approvalGates: [], listSource: { status: 'partial' },
  sourceCompleteness: { status: 'partial', boardDiscovery: 'available', taskSource: 'available' }, privacyScope: { scope: 'applied', visibility: 'limited', redactedTaskCount: 1 }, generatedAt: 'now',
} satisfies ProjectCharterSnapshot }) }))

describe('project charter hash route', () => {
  it('maps route and renders read-only charter with unavailable and partial source labels', () => {
    const page = pageFromHash('#/project-charter')
    expect(page).toBe('Project Charter')
    expect(pageSlug(page)).toBe('project-charter')
    const markup = renderToStaticMarkup(<ProjectCharter />)
    expect(markup).toContain('Project Charter')
    expect(markup).toContain('Unavailable from current read-only sources')
    expect(markup).toContain('Failed/unavailable boards: beta')
    expect(markup).toContain('Risks (available explicit source)')
    expect(markup).toContain('List incomplete: source scope partial')
    expect(markup).not.toContain('none reported')
    expect(markup).not.toMatch(/<button|<input|<form/)
  })
})
