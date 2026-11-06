import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ProjectOverview } from './pages/ProjectOverview.tsx'

vi.mock('./polling.ts', () => ({ usePolling: () => ({ status: 'ready', data: { sources: [
  { key: 'charter', label: 'Project Charter', route: '#/project-charter', status: 'available' },
  { key: 'completion', label: 'Completion Report', route: '#/completion-report', status: 'partial', note: 'board scope partial' },
] } }) }))

describe('project overview page', () => {
  it('renders linked read-only source statuses without governance controls', () => {
    const markup = renderToStaticMarkup(<ProjectOverview/>)
    expect(markup).toContain('Project Overview')
    expect(markup).toContain('href="#/project-charter"')
    expect(markup).toContain('Status: available')
    expect(markup).toContain('board scope partial')
    expect(markup).not.toContain('<button')
  })
})
