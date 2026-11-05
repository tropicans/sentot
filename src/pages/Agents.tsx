import { agentLabel } from '../format.ts'
import { AGENT_REGISTRY_BY_ID, type AgentCategory } from '../../server/agent-registry.ts'
import type { OfficeSnapshot, RuntimeSnapshot } from '../types.ts'
import { usePolling } from '../polling.ts'
import { useState } from 'react'

export type { AgentCategory } from '../../server/agent-registry.ts'
export function agentCategory(id: string): AgentCategory | undefined { return AGENT_REGISTRY_BY_ID[id.toLowerCase()]?.category }
import { EmptyState, LoadingState, PageTitle, RuntimeBadge } from '../ui.tsx'
import { PixelCharacter } from './Office.tsx'

/** Every Hermes profile on this machine is an agent, plus OpenCode when it is installed. */
export function Agents({ runtime, pending = false }: { runtime: RuntimeSnapshot | null; pending?: boolean }) {
  const [category, setCategory] = useState<AgentCategory | 'all'>('all')
  const office = usePolling<OfficeSnapshot>('/api/office', 15_000)
  if (pending) return <><PageTitle eyebrow="CREW" title="Agents"/><LoadingState message="Reading runtime details..."/></>
  if (!runtime || runtime.profiles.availability === 'unavailable') return <><PageTitle eyebrow="CREW" title="Agents"/><EmptyState title="Not Available">The Hermes profile list could not be read. Is <code>hermes</code> on the PATH of the server?</EmptyState></>
  const states = new Map(office.status === 'ready' ? office.data.stations.map((station) => [station.id, station]) : [])
  const openCode = runtime.openCode.availability === 'available' ? runtime.openCode.data : undefined
  const cards = [
    ...runtime.profiles.data.map((profile) => ({ id: profile.name, kind: 'Hermes profile', model: profile.model, gateway: profile.gateway, role: profile.role, shortDescription: profile.shortDescription })),
    ...(openCode ? [{ id: 'opencode', kind: 'OpenCode (CLI tool)', model: openCode, gateway: undefined, role: 'CLI tool', shortDescription: 'Provides an additional coding command-line interface.' }] : []),
  ]
  const visibleCards = cards.filter((card) => category === 'all' || agentCategory(card.id) === category)
  return <><PageTitle eyebrow="CREW" title="Agents">Every Hermes profile on this machine (from <code>hermes profile list</code>) is an agent{openCode ? ', plus OpenCode' : ''}.</PageTitle>
    <label>Filter kategori <select value={category} onChange={(event) => setCategory(event.target.value as AgentCategory | 'all')}><option value="all">Semua</option>{(['LPM', 'Specialist', 'Support', 'Reviewer'] as const).map((item) => <option key={item}>{item}</option>)}</select></label>
    <section className="agent-grid">{visibleCards.map((card) => {
      const station = states.get(card.id)
      return <article className="agent-card" key={card.id}>
        <span className="folder-glyph" aria-hidden="true"><PixelCharacter agent={card.id}/></span>
        <div className="agent-card-body">
          <h2>{station?.privacy === 'locked' ? '🔒 ' : ''}{agentLabel(card.id)}</h2>
          <p className="muted">{card.kind}</p>
          <dl>
            <div><dt>Role</dt><dd>{card.role}</dd></div>
            <div><dt>Description</dt><dd>{card.shortDescription}</dd></div>
            <div><dt>Model</dt><dd>{card.model}</dd></div>
            <div><dt>Gateway</dt><dd>{card.gateway ? <RuntimeBadge source={{ availability: 'available', data: card.gateway }}/> : <span className="muted">None (CLI tool)</span>}</dd></div>
            <div><dt>In the office</dt><dd>{station ? `${station.state}${station.activity ? ` · ${station.activity}` : ''}` : '—'}</dd></div>
          </dl>
        </div>
      </article>
    })}</section>
  </>
}
