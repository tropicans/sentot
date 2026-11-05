import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { RiskRegister } from './pages/RiskRegister.tsx'

let dependencySource: unknown = { availability: 'available' }
vi.mock('./polling.ts', () => ({ usePolling: () => ({ status: 'ready', data: { fetchedAt: 'now', source: { availability: 'available', data: [] }, dependencySource, entries: [{ kind: 'Risk', title: 'Vendor outage', taskId: 'r1', board: 'alpha', impact: 'Unavailable from current read-only sources', dependencies: [], mitigationOwner: 'lna', mitigationStatus: 'running', reviewDate: 'Unavailable from current read-only sources', evidence: 'Unavailable from current read-only sources', approval: 'Unavailable from current read-only sources' }] } }) }))

describe('risk register page', () => {
  it('renders sourced risk fields read-only with stable owner alias and unavailable labels', () => {
    const markup = renderToStaticMarkup(<RiskRegister/>)
    expect(markup).toContain('Risk register')
    expect(markup).toContain('Vendor outage')
    expect(markup).toContain('None explicitly linked')
    expect(markup).toContain('Nakula')
    expect(markup).toContain('Unavailable from current read-only sources')
    expect(markup).not.toContain('onClick')
  })

  it('labels unavailable blocker source and never claims no explicit links', () => {
    dependencySource = { availability: 'unavailable', error: { code: 'COMMAND_FAILED', message: 'failed' } }
    const markup = renderToStaticMarkup(<RiskRegister/>)
    expect(markup).toContain('Sumber dependency / blocker tidak tersedia')
    expect(markup).not.toContain('None explicitly linked')
  })

  it('labels partial blocker data and never implies completeness', () => {
    dependencySource = { availability: 'partial', failed: ['alpha:r1'] }
    const markup = renderToStaticMarkup(<RiskRegister/>)
    expect(markup).toContain('Data dependency / blocker parsial')
    expect(markup).toContain('Daftar mungkin tidak lengkap')
    expect(markup).not.toContain('None explicitly linked')
  })
})
