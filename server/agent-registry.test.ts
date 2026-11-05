import { describe, expect, it } from 'vitest'
import { AGENT_REGISTRY, AGENT_REGISTRY_BY_ID, FALLBACK_AGENT_METADATA, agentMetadata } from './agent-registry.js'

describe('controlled agent registry', () => {
  it('defines exactly the 13 operational profiles with unique stable IDs', () => {
    expect(AGENT_REGISTRY.map((agent) => agent.id)).toEqual([
      'default', 'lna', 'id', 'lcd', 'mled', 'aes', 'tlts',
      'researcher', 'semar', 'bagong', 'arjuna', 'kresna', 'gareng',
    ])
    expect(new Set(AGENT_REGISTRY.map((agent) => agent.id)).size).toBe(13)
    expect(Object.keys(AGENT_REGISTRY_BY_ID)).toHaveLength(13)
  })

  it('keeps every public field non-empty and uses controlled categories', () => {
    for (const agent of AGENT_REGISTRY) {
      expect(agent.displayName.trim()).not.toBe('')
      expect(agent.role.trim()).not.toBe('')
      expect(agent.shortDescription.trim()).not.toBe('')
      expect(['LPM', 'Specialist', 'Support', 'Reviewer']).toContain(agent.category)
    }
  })

  it('looks up IDs case-insensitively and has safe fallback metadata', () => {
    expect(agentMetadata('LNA')?.displayName).toBe('Nakula')
    expect(agentMetadata('unknown')).toBeUndefined()
    expect(FALLBACK_AGENT_METADATA).toEqual({ role: 'Hermes profile', shortDescription: 'Hermes Agent profile.' })
  })
})
