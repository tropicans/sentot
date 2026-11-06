import { usePolling } from '../polling.ts'
import type { ProjectOverviewSnapshot } from '../types.ts'
import { PageTitle } from '../ui.tsx'

export function ProjectOverview() {
  const request = usePolling<ProjectOverviewSnapshot>('/api/project-overview', 10_000)
  const data = request.status === 'ready' ? request.data : undefined
  return <><PageTitle eyebrow="READ-ONLY PROJECT VIEW" title="Project Overview">Navigation and source status only. No governance data is duplicated or inferred.</PageTitle>{data ? <section className="panel"><h2>Source coverage</h2>{data.sources.map(source => <article key={source.key}><h3><a href={source.route}>{source.label}</a></h3><p>Status: {source.status}{source.note ? ` · ${source.note}` : ''}</p></article>)}</section> : <p>Memuat sumber…</p>}</>
}
