import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { agentCategory, Agents } from './pages/Agents.tsx'

vi.mock('./polling.ts', () => ({ usePolling: () => ({ status: 'loading' }) }))

describe('Agents', () => {
  it('renders server-controlled role and description metadata', () => {
    const markup = renderToStaticMarkup(<Agents runtime={{
      profiles: { availability: 'available', data: [{ name: 'default', model: 'm', gateway: 'Running', role: 'LPM', shortDescription: 'Leads planning and mission delivery.' }] },
      openCode: { availability: 'unavailable', data: 'Unknown' },
      fetchedAt: '2026-11-05T00:00:00.000Z',
    }}/>)

    expect(markup).toContain('<dt>Role</dt><dd>LPM</dd>')
    expect(markup).toContain('<dt>Description</dt><dd>Leads planning and mission delivery.</dd>')
  })

  it('offers Indonesian category filters from fixed profile IDs', () => {
    expect(agentCategory('default')).toBe('LPM')
    expect(agentCategory('lna')).toBe('Specialist')
    expect(agentCategory('researcher')).toBe('Support')
    expect(agentCategory('gareng')).toBe('Reviewer')
    expect(agentCategory('unknown')).toBeUndefined()
    const markup = renderToStaticMarkup(<Agents runtime={{ profiles: { availability: 'available', data: [] }, openCode: { availability: 'unavailable', data: 'Unknown' }, fetchedAt: '' }}/>)
    expect(markup).toContain('Filter kategori')
    for (const label of ['Semua', 'LPM', 'Specialist', 'Support', 'Reviewer']) expect(markup).toContain(`>${label}<`)
  })
})
