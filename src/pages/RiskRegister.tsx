import { agentLabel } from '../format.ts'
import { usePolling } from '../polling.ts'
import type { RiskRegisterSnapshot } from '../types.ts'
import { PageTitle, SourceStatus, Unavailable } from '../ui.tsx'

export function RiskRegister() {
  const request = usePolling<RiskRegisterSnapshot>('/api/risks', 10_000)
  const snapshot = request.status === 'ready' ? request.data : undefined
  return <><PageTitle eyebrow="READ-ONLY GOVERNANCE" title="Risk register">Hanya task dengan judul berawalan <code>Risk:</code> atau <code>Assumption:</code>. Field tanpa sumber eksplisit ditandai unavailable; tidak ada inferensi atau aksi.</PageTitle>
    <SourceStatus source={snapshot?.source} fetchedAt={snapshot?.fetchedAt} request={request}/><Unavailable source={snapshot?.source} request={request}/>{snapshot?.dependencySource.availability === 'unavailable' && <p className="file-notice" role="status">Sumber dependency / blocker tidak tersedia.</p>}{snapshot?.dependencySource.availability === 'partial' && <p className="file-notice" role="status">Data dependency / blocker parsial. Daftar mungkin tidak lengkap.</p>}
    {snapshot?.source.availability === 'available' && (snapshot.entries.length === 0 ? <p className="muted">Tidak ada risk atau assumption eksplisit pada Task Board.</p> : <div className="table-scroll"><table className="log-table" aria-label="Risk register"><thead><tr><th>Type / item</th><th>Impact</th><th>Dependency / blocker</th><th>Mitigation owner / status</th><th>Review date</th><th>Evidence</th><th>Approval</th></tr></thead><tbody>{snapshot.entries.map((item, index) => <tr key={`${item.board ?? ''}:${item.taskId ?? index}`}><td><strong>{item.kind}: {item.title}</strong><small>{[item.board, item.taskId].filter(Boolean).join(' · ')}</small></td><td>{item.impact}</td><td>{item.dependencies.length ? item.dependencies.join('; ') : snapshot.dependencySource.availability === 'unavailable' ? 'Sumber dependency / blocker tidak tersedia' : snapshot.dependencySource.availability === 'partial' ? 'Data parsial: daftar blocker mungkin tidak lengkap' : 'None explicitly linked'}</td><td>{item.mitigationOwner === 'Unavailable from current read-only sources' ? item.mitigationOwner : agentLabel(item.mitigationOwner)} · {item.mitigationStatus}</td><td>{item.reviewDate}</td><td>{item.evidence}</td><td>{item.approval}</td></tr>)}</tbody></table></div>)}
  </>
}