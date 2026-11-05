import { usePolling } from '../polling.ts'
import type { DependencySnapshot } from '../types.ts'
import { PageTitle, SourceStatus, Unavailable } from '../ui.tsx'

export function DependencyGraph() {
  const request = usePolling<DependencySnapshot>('/api/dependencies', 10_000)
  const snapshot = request.status === 'ready' ? request.data : undefined
  const graph = snapshot?.graph
  const nodes = graph?.data.nodes ?? []
  const title = new Map(nodes.map((node) => [node.key, node.title]))
  return <><PageTitle eyebrow="HERMES KANBAN" title="Dependency graph">Tampilan baca-saja dependensi task per board. Data berasal dari <code>hermes kanban show</code>; edge lintas board tidak dibuat.</PageTitle>
    <SourceStatus source={graph} fetchedAt={snapshot?.fetchedAt} request={request}/><Unavailable source={graph} request={request}/>
    {graph?.availability === 'available' && <>
      {graph.data.partial && <p className="file-notice" role="status">Data parsial: detail {graph.data.failed.length} task tidak tersedia. Edge yang tidak terbukti tidak dibuat.</p>}
      {nodes.length === 0 ? <p className="muted">Data dependensi tidak tersedia: tidak ada task ber-ID pada snapshot board.</p> : <div className="dependency-layout">
        <section><h2>Nodes ({nodes.length})</h2><ul className="dependency-nodes">{nodes.map((node) => <li key={node.key} className="task"><strong>{node.title}</strong><small>{node.board ? `${node.board} · ` : ''}{node.id} · {node.status}</small>{!node.available && <span className="chip">detail unavailable</span>}{node.waiting && <span className="chip">waiting</span>}{node.root && <span className="chip">root</span>}{node.bottleneck > 0 && <span className="chip">blocks {node.bottleneck}</span>}</li>)}</ul></section>
        <section><h2>Edges ({graph.data.edges.length})</h2>{graph.data.edges.length ? <ul>{graph.data.edges.map((edge) => <li key={`${edge.from}>${edge.to}`}><b>{title.get(edge.from)}</b> → {title.get(edge.to)}</li>)}</ul> : <p className="muted">Tidak ada edge terverifikasi.</p>}
        <h2>Waiting tasks</h2><ul>{nodes.filter((node) => node.waiting).map((node) => <li key={node.key}>{node.title}</li>)}</ul>
        <h2>Bottlenecks</h2><ul>{nodes.filter((node) => node.bottleneck).sort((a, b) => b.bottleneck - a.bottleneck).map((node) => <li key={node.key}>{node.title} ({node.bottleneck} children)</li>)}</ul>
        <h2>Root tasks</h2><ul>{nodes.filter((node) => node.root).map((node) => <li key={node.key}>{node.title}</li>)}</ul></section>
      </div>}
    </>}
  </>
}
