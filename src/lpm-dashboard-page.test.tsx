import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LpmDashboard } from './pages/LpmDashboard.tsx'

describe('LPM dashboard page', () => {
  it('states unsupported governance signals without claiming readiness', () => {
    const markup = renderToStaticMarkup(<LpmDashboard dashboard={null}/>)
    expect(markup).toContain('Formal approvals: unavailable')
    expect(markup).toContain('Deliverable verification: unavailable')
    expect(markup).toContain('Final readiness: unavailable')
    expect(markup).toContain('Dependencies: not summarized here')
  })
})
