import { describe, expect, it } from 'vitest'
import { buildProjectOverview, type ProjectOverviewSource } from './mission-control.js'

describe('project overview', () => {
  it('synthesizes read-only source status and routes without inventing governance data', () => {
    const sources: ProjectOverviewSource[] = [
      { key: 'charter', label: 'Project Charter', route: '#/project-charter', status: 'available' },
      { key: 'wbs', label: 'WBS & Timeline', route: '#/wbs-timeline', status: 'partial', note: 'dependency source partial' },
      { key: 'capacity', label: 'Resource & Capacity', route: '#/resource-capacity', status: 'unavailable' },
      { key: 'unknown', label: 'Unknown', route: '#/unknown', status: 'ambiguous' },
    ]
    const overview = buildProjectOverview(sources, '2026-01-01T00:00:00.000Z')
    expect(overview.sources).toEqual(sources)
    expect(overview.sources.every(source => source.route.startsWith('#/'))).toBe(true)
    expect(JSON.stringify(overview)).not.toContain('approved')
  })
})
