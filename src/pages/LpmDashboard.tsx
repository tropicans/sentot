import { usePolling } from '../polling.ts'
import type { DashboardSnapshot, TaskBoardSnapshot } from '../types.ts'
import { openUnassigned, taskIsBlocked, workload } from '../lpm-dashboard.ts'
import { PageTitle, SourceStatus, Unavailable } from '../ui.tsx'

export function LpmDashboard({ dashboard }: { dashboard: DashboardSnapshot | null }) {
  const request = usePolling<TaskBoardSnapshot>('/api/tasks', 10_000)
  const snapshot = request.status === 'ready' ? request.data : null
  const source = snapshot?.tasks
  const tasks = source?.availability === 'available' ? source.data : []
  const blocked = tasks.filter(taskIsBlocked)
  const unassigned = openUnassigned(tasks)
  const groups = workload(tasks)
  return <>
    <PageTitle eyebrow="LPM / READ-ONLY" title="LPM dashboard">Operational view from existing Hermes task and dashboard APIs. No approval, verification, readiness, or dependency claims.</PageTitle>
    <SourceStatus source={source} fetchedAt={snapshot?.fetchedAt} request={request}/><Unavailable source={source} request={request}/>
    <section className="stats" aria-label="Status summary">
      <div><strong>{dashboard?.tasks.availability === 'available' ? dashboard.tasks.total : '—'}</strong><span>OPEN TASKS</span></div>
      <div><strong>{dashboard?.tasks.availability === 'available' ? (dashboard.tasks.byStatus.blocked ?? 0) : blocked.length || '—'}</strong><span>BLOCKED</span></div>
      <div><strong>{dashboard?.tasks.availability === 'available' ? dashboard.tasks.assigned : '—'}</strong><span>ASSIGNED</span></div>
      <div><strong>{dashboard?.commands.failed ?? '—'}</strong><span>CLI FAILURES</span></div>
    </section>
    {source?.availability === 'available' && <div className="lpm-grid">
      <section className="data-list"><h2>Blocked tasks</h2>{blocked.length ? blocked.map((task) => <article key={`${task.board ?? ''}-${task.id ?? task.title}`}><strong>{task.title}</strong><span className="badge bad">{task.status}</span></article>) : <p>No blocked tasks in source.</p>}</section>
      <section className="data-list"><h2>Per-agent workload</h2>{groups.map((group) => <article key={group.agent}><strong>{group.agent}</strong><span>{group.count} open</span></article>)}</section>
      <section className="data-list"><h2>Unassigned open work</h2>{unassigned.length ? unassigned.map((task) => <article key={`${task.board ?? ''}-${task.id ?? task.title}`}><strong>{task.title}</strong><span className="chip chip-muted">unassigned</span></article>) : <p>No unassigned open work in source.</p>}</section>
      <section className="data-list"><h2>Operational risk signals</h2><ul><li>Blocked tasks: {blocked.length}</li><li>Unassigned open work: {unassigned.length}</li><li>Failed boards: {snapshot?.failedBoards?.length ?? 0}</li><li>Task source: available</li><li>CLI failures: {dashboard?.commands.failed ?? 'unavailable'}</li></ul></section>
    </div>}
    <section className="data-list"><h2>Governance signals</h2><p>Formal approvals: unavailable from existing read-only sources.</p><p>Deliverable verification: unavailable from existing read-only sources.</p><p>Final readiness: unavailable from existing read-only sources.</p><p>Dependencies: not summarized here; inspect existing task details.</p></section>
  </>
}
