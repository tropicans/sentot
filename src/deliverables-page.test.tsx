import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { Deliverables } from './pages/Deliverables.tsx'

vi.mock('./polling.ts', () => ({ usePolling: () => ({ status: 'ready', data: { fetchedAt: 'now', source: { availability: 'available', data: [] }, candidates: [{ title: 'Candidate', taskId: 't1', board: 'main', owner: 'coder', taskStatus: 'done', version: 'Unavailable from current read-only sources', evidence: 'Unavailable from current read-only sources', approval: 'Unavailable from current read-only sources', finalReadiness: 'Unavailable from current read-only sources' }] } }) }))

describe('deliverables page', () => {
  it('renders read-only task deliverable candidates with unavailable governance fields', () => {
    const markup = renderToStaticMarkup(<Deliverables/>)
    expect(markup).toContain('Task deliverable candidates')
    expect(markup).toContain('Kandidat bukan deliverable terverifikasi')
    expect(markup).toContain('Unavailable from current read-only sources')
    expect(markup).toContain('href="#/task-board"')
    expect(markup).not.toContain('onClick')
  })
})
