import { usePolling } from '../polling.ts'
import { agentLabel } from '../format.ts'
import type { RevisionLogSnapshot } from '../types.ts'
import { PageTitle } from '../ui.tsx'

const unavailable = 'Unavailable from current read-only sources'
export function RevisionLog() {
  const request = usePolling<RevisionLogSnapshot>('/api/revision-log', 10000)
  const snapshot = request.status === 'ready' ? request.data : undefined
  return <><PageTitle eyebrow="READ-ONLY PROVENANCE" title="Revision & Version Log">Hanya metadata revisi dan versi yang bersumber eksplisit dari board record. Tidak ada inferensi dari mtime atau status task.</PageTitle>{snapshot ? <><section className="panel"><p>Board scope: {snapshot.source.scope} · source status: {snapshot.source.status} · detail source: {snapshot.source.detailSource}</p><p>Included boards: {snapshot.source.includedBoardIds.join(', ') || unavailable} · failed boards: {snapshot.source.failedBoards.join(', ') || 'none reported'}</p><p>Privacy scope: {snapshot.privacy.scope} · visibility: {snapshot.privacy.visibility}{snapshot.privacy.redactedTaskCount ? ` · ${snapshot.privacy.redactedTaskCount} redacted task(s)` : ''}</p></section><div className="table-scroll"><table className="log-table" aria-label="Revision and version log"><thead><tr><th>Task</th><th>Version</th><th>Revision</th><th>Author/owner</th><th>Reason</th><th>Reviewer</th><th>Evidence</th><th>Timestamp</th></tr></thead><tbody>{snapshot.entries.map((entry, index) => <tr key={`${entry.board ?? ''}:${entry.taskId ?? index}`}><td><strong>{entry.title}</strong><small>{entry.taskId ?? unavailable}</small></td><td>{entry.version}</td><td>{entry.revision}</td><td>{entry.authorOrOwner === unavailable ? unavailable : agentLabel(entry.authorOrOwner)}</td><td>{entry.reason}</td><td>{entry.reviewer}</td><td>{entry.evidence}</td><td>{entry.timestamp}</td></tr>)}</tbody></table></div></> : <p>Memuat sumber…</p>}</>
}
