import { usePolling } from '../polling.ts'
import type { ResourceCapacitySnapshot, ResourceWorkload } from '../types.ts'
import { PageTitle } from '../ui.tsx'

function Work({ item }: { item: ResourceWorkload }) {
  return <li><strong>{item.title}</strong> <small>{[item.board, item.taskId, item.status].filter(Boolean).join(' · ')}</small></li>
}

export function ResourceCapacity() {
  const request = usePolling<ResourceCapacitySnapshot>('/api/resource-capacity', 10_000)
  const data = request.status === 'ready' ? request.data : undefined
  if (!data) return <><PageTitle eyebrow="READ-ONLY PLANNING" title="Resource & Capacity">Explicit workload and capacity evidence only.</PageTitle><p>Memuat sumber…</p></>
  return <><PageTitle eyebrow="READ-ONLY PLANNING" title="Resource & Capacity">Task lists are not effort, capacity, or utilization measures. Capacity stays unavailable unless an explicit source supplies it.</PageTitle>
    <section className="panel"><h2>Source completeness</h2><p>Status: {data.source.status} · scope: {data.source.scope} · board discovery: {data.source.boardDiscovery} · dependency source: {data.source.dependencySource.availability}</p><p>Included board IDs: {data.source.includedBoardIds.join(', ') || 'none confirmed'} · failed boards: {data.source.failedBoards.join(', ') || 'none reported'}</p><p>Privacy: {data.privacy.scope} · visibility {data.privacy.visibility}{data.privacy.redactedTaskCount ? ` · ${data.privacy.redactedTaskCount} redacted task(s)` : ''}</p></section>
    <section className="panel"><h2>Agent workload</h2>{data.agents.length ? data.agents.map(agent => <article key={agent.agentId}><h3>{agent.displayName} <small>{agent.agentId}</small></h3><p>Capacity: {agent.capacity}</p>{agent.workload.length ? <ul>{agent.workload.map(item => <Work key={`${item.board ?? ''}:${item.taskId}`} item={item}/>)}</ul> : <p>No active workload from visible sources.</p>}</article>) : <p>No workload available from current sources.</p>}</section>
    <section className="panel"><h2>Unassigned tasks</h2>{data.unassigned.length ? <ul>{data.unassigned.map(item => <Work key={`${item.board ?? ''}:${item.taskId}`} item={item}/>)}</ul> : <p>No explicit unassigned active tasks in visible sources.</p>}</section>
    <section className="panel"><h2>Bottleneck indicators</h2>{data.source.dependencySource.availability === 'unavailable' ? <p>Dependency source unavailable; no bottleneck claim made.</p> : data.bottlenecks.length ? <ul>{data.bottlenecks.map(item => <li key={`${item.board ?? ''}:${item.taskId}`}><strong>{item.title}</strong> · blocks {item.blocks} task{item.blocks === 1 ? '' : 's'} <small>{[item.board, item.taskId].filter(Boolean).join(' · ')}</small></li>)}</ul> : <p>No dependency-grounded bottlenecks in visible sources.</p>}</section>
  </>
}
