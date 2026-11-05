export type AgentCategory = 'LPM' | 'Specialist' | 'Support' | 'Reviewer'

export interface AgentMetadata {
  id: string
  displayName: string
  category: AgentCategory
  role: string
  shortDescription: string
}

export const AGENT_REGISTRY: readonly AgentMetadata[] = [
  { id: 'default', displayName: 'Sentot', category: 'LPM', role: 'Hermes Orchestrator & Learning Project Manager', shortDescription: 'Plans learning projects, coordinates agents, manages dependencies, risks, and completion readiness.' },
  { id: 'lna', displayName: 'Nakula', category: 'Specialist', role: 'Learning Needs Analyst', shortDescription: 'Analyzes evidence, learner needs, competency gaps, and organizational requirements.' },
  { id: 'id', displayName: 'Yudhistira', category: 'Specialist', role: 'Instructional Designer', shortDescription: 'Designs curriculum, learning pathways, objectives, activities, and aligned assessment strategy.' },
  { id: 'lcd', displayName: 'Bima', category: 'Specialist', role: 'Learning Content Developer', shortDescription: 'Develops verified learning modules, scripts, cases, job aids, and reference materials.' },
  { id: 'mled', displayName: 'Srikandi', category: 'Specialist', role: 'Multimedia & Learning Experience Developer', shortDescription: 'Produces accessible learning media, interactive assets, and multimedia learning experiences.' },
  { id: 'aes', displayName: 'Drona', category: 'Specialist', role: 'Assessment & Evaluation Specialist', shortDescription: 'Designs competency-aligned assessments, rubrics, evaluation plans, and effectiveness analysis.' },
  { id: 'tlts', displayName: 'Gatotkaca', category: 'Specialist', role: 'TITAN Learning Technology & Platform Specialist', shortDescription: 'Prepares TITAN-compatible course packages, records, integrations, QA, and compatibility evidence.' },
  { id: 'researcher', displayName: 'Petruk', category: 'Support', role: 'Research & Evidence Support', shortDescription: 'Finds and verifies research, policy, regulatory, and evidence sources for project decisions.' },
  { id: 'semar', displayName: 'Semar', category: 'Support', role: 'Learning Synthesis Support', shortDescription: 'Synthesizes inputs into clear learning-program recommendations and supporting documentation.' },
  { id: 'bagong', displayName: 'Bagong', category: 'Support', role: 'Engineering Support', shortDescription: 'Supports technical investigation, development, testing, and safe platform implementation work.' },
  { id: 'arjuna', displayName: 'Arjuna', category: 'Support', role: 'Media Production Support', shortDescription: 'Supports production planning and quality review for visual, audio, and multimedia assets.' },
  { id: 'kresna', displayName: 'Kresna', category: 'Support', role: 'Evaluation & Data Review Support', shortDescription: 'Supports evaluation review, data interpretation, and evidence quality checks.' },
  { id: 'gareng', displayName: 'Gareng', category: 'Reviewer', role: 'Independent Quality Reviewer', shortDescription: 'Independently checks alignment, evidence, accessibility, risk, dependencies, and completion readiness.' },
]

export const AGENT_REGISTRY_BY_ID: Readonly<Record<string, AgentMetadata>> = Object.fromEntries(AGENT_REGISTRY.map((agent) => [agent.id, agent]))

export function agentMetadata(id: string): AgentMetadata | undefined {
  return AGENT_REGISTRY_BY_ID[id.toLowerCase()]
}

export const FALLBACK_AGENT_METADATA = { role: 'Hermes profile', shortDescription: 'Hermes Agent profile.' } as const
