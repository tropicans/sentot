import { usePolling } from '../polling.ts'
import { agentLabel } from '../format.ts'
import type { DeliverablesSnapshot } from '../types.ts'
import { PageTitle, SourceStatus, Unavailable } from '../ui.tsx'

export function Deliverables() {
  const request = usePolling<DeliverablesSnapshot>('/api/deliverables', 10_000)
  const snapshot = request.status === 'ready' ? request.data : undefined
  const candidates = snapshot?.candidates ?? []
  return <><PageTitle eyebrow="READ-ONLY GOVERNANCE" title="Deliverables checklist">Task deliverable candidates dari Task Board. Kandidat bukan deliverable terverifikasi; status task bukan bukti completion, approval, validation, atau final readiness.</PageTitle>
    <SourceStatus source={snapshot?.source} fetchedAt={snapshot?.fetchedAt} request={request}/><Unavailable source={snapshot?.source} request={request}/>
    <p className="file-notice">Buka <a href="#/task-board">Task Board</a>, lalu pilih task untuk melihat detail dan Artifacts aman per task. Checklist ini tidak memindai workspace dan tidak menyediakan aksi.</p>
    {snapshot?.source.availability === 'available' && (candidates.length === 0 ? <p className="muted">Tidak ada task deliverable candidates pada Task Board.</p> : <div className="table-scroll"><table className="log-table" aria-label="Task deliverable candidates"><thead><tr><th>Candidate</th><th>Owner</th><th>Task status</th><th>Version</th><th>Evidence</th><th>Approval</th><th>Final readiness</th></tr></thead><tbody>{candidates.map((item, index) => <tr key={`${item.board ?? ''}:${item.taskId ?? index}`}><td><strong>{item.title}</strong><small>{[item.board, item.taskId].filter(Boolean).join(' · ')}</small></td><td>{item.owner === '—' ? item.owner : agentLabel(item.owner)}</td><td>{item.taskStatus}</td><td>{item.version}</td><td>{item.evidence}</td><td>{item.approval}</td><td>{item.finalReadiness}</td></tr>)}</tbody></table></div>)}
  </>
}
