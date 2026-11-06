export type Availability = 'available' | 'unavailable'
export type GatewayState = 'Running' | 'Stopped' | 'Unknown'
export interface Source<T> { availability: Availability; data: T; error?: { code: string; message: string } }
export interface RuntimeSnapshot {
  /** Every Hermes profile is an agent; `gateway` comes from `hermes profile list`. */
  profiles: Source<{ name: string; model: string; gateway: GatewayState; role: string; shortDescription: string }[]>
  openCode: Source<string>
  fetchedAt: string
}
export interface Task { title: string; status: string; id?: string; assignee?: string; priority?: number; board?: string; private?: boolean }
export interface KanbanBoard { slug: string; name: string; current: boolean; total: number }
/** `agent` is the Hermes profile the job belongs to (cron jobs are stored per profile). */
export interface ScheduledJob { private?: boolean; name: string; schedule: string; id?: string; nextRun?: string; overdue?: boolean; status?: string; repeat?: string; lastRun?: string; lastRunOk?: boolean; agent?: string }
export interface Session { title: string; preview: string; lastActive: string; id?: string; workspace?: string; source?: string; actor?: string; active?: boolean }
export interface Skill { name: string; category: string; source: string; trust: string; status: 'enabled' }
export interface TaskBoardSnapshot { tasks: Source<Task[]>; boards?: KanbanBoard[]; failedBoards?: string[]; fetchedAt: string }
export type ProjectOverviewStatus = 'available' | 'partial' | 'unavailable' | 'ambiguous'
export interface ProjectOverviewSource { key: string; label: string; route: string; status: ProjectOverviewStatus; note?: string }
export interface ProjectOverviewSnapshot { sources: ProjectOverviewSource[]; fetchedAt: string }
export interface DeliverableCandidate { title: string; taskId?: string; board?: string; owner: string; taskStatus: string; version: string; evidence: string; approval: string; finalReadiness: string; private?: boolean }
export interface DeliverablesSnapshot { candidates: DeliverableCandidate[]; source: Source<Task[]>; fetchedAt: string }
export interface RevisionEntry { taskId?: string; board?: string; title: string; version: string; revision: string; authorOrOwner: string; reason: string; reviewer: string; evidence: string; timestamp: string; private?: boolean }
export interface RevisionLogSnapshot { entries: RevisionEntry[]; source: { status: 'available' | 'partial' | 'unavailable'; scope: 'complete' | 'partial' | 'ambiguous'; includedBoardIds: string[]; failedBoards: string[]; detailSource: 'complete' | 'partial' | 'unavailable' }; privacy: { scope: 'applied' | 'limited'; visibility: 'limited'; redactedTaskCount?: number }; fetchedAt: string }
export interface RiskEntry { kind: 'Risk' | 'Assumption'; title: string; taskId?: string; board?: string; impact: string; dependencies: string[]; mitigationOwner: string; mitigationStatus: string; reviewDate: string; evidence: string; approval: string; private?: boolean }
export type RiskDependencySource = { availability: 'available' } | { availability: 'unavailable'; error?: { code: string; message: string } } | { availability: 'partial'; failed: string[] }
export interface RiskRegisterSnapshot { entries: RiskEntry[]; source: Source<Task[]>; dependencySource: RiskDependencySource; fetchedAt: string }
export interface ApprovalItem { approvalType: string; sourceTask: string; taskId?: string; board?: string; owner: string; status: 'pending' | 'approved' | 'rejected' | 'Unavailable from current read-only sources'; requestedDate: string; decisionMaker: string; evidence: string; risk: string; dependency: string; version: string }
export interface ApprovalQueueSnapshot { items: ApprovalItem[]; source: Source<Task[]>; failedBoards?: string[]; fetchedAt: string }
export interface CompletionReportSnapshot { overallStatus: string; taskSummary: { total: number; completed: number; inProgress: number; blocked: number; unassigned: number }; finalApprovalStatus: string; readinessGaps: string[]; source: { status: string; scope: 'complete'|'partial'|'ambiguous'; boardDiscovery: string; boardDiscoveryError?: string; includedBoardIds: string[]; failedBoards: string[]; failedDependencies: string[]; dependencySource: { availability: string; reason?: string } }; privacy: { scope: 'applied' | 'limited'; visibility: 'limited'; redactedTaskCount?: number }; fetchedAt: string }
export interface ResourceWorkload { taskId: string; board?: string; title: string; status: string; private?: boolean }
export interface ResourceAgent { agentId: string; displayName: string; workload: ResourceWorkload[]; capacity: string }
export interface ResourceCapacitySnapshot { agents: ResourceAgent[]; unassigned: ResourceWorkload[]; bottlenecks: (ResourceWorkload & { blocks: number })[]; source: { status: string; scope: 'complete' | 'partial' | 'ambiguous'; boardDiscovery: string; includedBoardIds: string[]; failedBoards: string[]; dependencySource: { availability: string } }; privacy: { scope: 'applied' | 'limited'; visibility: 'limited'; redactedTaskCount?: number }; fetchedAt: string }
export interface ProjectCharterSnapshot { projectBoardScope: { boards: { id: string; name: string }[]; scope: 'complete' | 'partial' | 'ambiguous'; failedBoards: string[]; unreadBoards: string[] }; objective: string; scopeIn: string; scopeOut: string; stakeholders: string[]; milestones: { title: string; taskId?: string; board?: string }[]; constraints: { title: string; taskId?: string; board?: string }[]; risks: { title: string; taskId?: string; board?: string }[]; assumptions: { title: string; taskId?: string; board?: string }[]; approvalGates: { title: string; taskId?: string; board?: string; status: string }[]; listSource: { status: 'complete' | 'partial' | 'unavailable' | 'ambiguous' }; sourceCompleteness: { status: string; boardDiscovery: string; taskSource: string }; privacyScope: { scope: 'applied' | 'limited'; visibility: 'limited'; redactedTaskCount?: number }; generatedAt: string }
export interface WbsTimelineItem { key: string; taskId?: string; board?: string; title: string; status: string; assignee?: string; priority?: number; milestone?: string; deadline?: string; parents?: string[]; children?: string[] }
export interface WbsTimelineSnapshot { items: WbsTimelineItem[]; boardScope: { boards: { id: string; name: string }[]; scope: 'complete' | 'partial' | 'ambiguous'; failedBoards: string[]; unreadBoards: string[] }; sourceCompleteness: { status: 'available' | 'partial' | 'unavailable'; taskSource: Availability; dependencySource: 'available' | 'partial' | 'unavailable' }; privacyScope: { scope: 'applied' | 'limited'; visibility: 'limited'; redactedTaskCount?: number }; fetchedAt: string }
/** `failedProfiles` lists profiles whose cron list could not be read while others could. */
export interface CalendarSnapshot { jobs: Source<ScheduledJob[]>; failedProfiles?: string[]; fetchedAt: string }
export interface ActivitySnapshot { sessions: Source<Session[]>; fetchedAt: string }
export interface KnowledgeSnapshot { skills: Source<Skill[]>; fetchedAt: string }
export interface Channel { name: string; status: 'Configured' | 'Connected' }
export interface ChannelSnapshot { channels: Source<Channel[]>; activeSessions?: number; fetchedAt: string }
export type OfficeState = 'Idle' | 'Working' | 'Reviewing' | 'Collaborating' | 'Offline' | 'Unknown'
export type OfficeRoom = 'Workspace' | 'Lounge'
export interface OfficeStation {
  /** Agent id: the Hermes profile name, or `opencode`. Also the key for its folder and memory. */
  id: string
  /** Profile lock: `locked` withholds its private data in this browser, `unlocked` is opened with the PIN. */
  privacy?: 'locked' | 'unlocked'
  name: string
  role: string
  shortDescription?: string
  room: OfficeRoom
  roomPosition: string
  state: OfficeState
  currentTask: string
  recentActivity: string
  activity: string
  seat: number
  provenance: string
  freshness: string
}
export interface OfficeSummary { declared: number; active: number; idle: number; offline: number; unknown: number; gatewaysReachable: number; gatewaysDeclared: number }
export interface OfficeSnapshot { stations: OfficeStation[]; summary: OfficeSummary; fetchedAt: string }
export interface UsageInsights {
  days: number
  sessions: number
  messages: number
  toolCalls: number
  inputTokens: number
  outputTokens: number
  totalTokens: number
  estimatedCost?: string
  costUsd?: number
  models: { model: string; sessions: number; tokens: number }[]
  tools: { tool: string; calls: number }[]
  sources: { source: string; sessions: number; tokens: number }[]
  topSession?: { tokens: number; date: string }
}
export interface AgentUsage { agent: string; availability: Availability; usage?: UsageInsights; error?: string }
export interface UsageSnapshot {
  days: number
  agents: AgentUsage[]
  totals: { sessions: number; messages: number; toolCalls: number; inputTokens: number; outputTokens: number; totalTokens: number; costUsd?: number }
  models: { model: string; sessions: number; tokens: number }[]
  sources: { source: string; sessions: number; tokens: number }[]
  tools: { tool: string; calls: number }[]
  fetchedAt: string
}
export interface CountSource { availability: Availability; total: number }
export interface CommandHealth { total: number; failed: number; averageMs: number }
export interface DashboardSnapshot {
  runtime: RuntimeSnapshot
  tasks: CountSource & { byStatus: Record<string, number>; assigned: number }
  calendar: CountSource & { active: number; paused: number; nextRun?: string }
  activity: CountSource & { latest?: Session }
  knowledge: CountSource & { byCategory: Record<string, number> }
  channels: CountSource & { connected: number; activeSessions?: number }
  office: OfficeSummary
  commands: CommandHealth
  fetchedAt: string
}
export interface CommandLogEntry { command: string; ok: boolean; durationMs: number; at: string; error?: string }
export interface CommandLogSnapshot { entries: CommandLogEntry[]; health: CommandHealth; fetchedAt: string }
export type LogLevel = 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG' | 'OTHER'
export interface LogLine { text: string; level: LogLevel }
export interface LogFile { name: string; label: string; source: Source<LogLine[]> }
export interface LogsSnapshot { files: LogFile[]; fetchedAt: string }
export interface FolderAgent { profile: string; label: string; available: boolean; path: string; reason?: string; warning?: string }
export interface FolderAgentsSnapshot { agents: FolderAgent[]; fetchedAt: string }
export interface FolderEntry { name: string; path: string; type: 'dir' | 'file'; size: number; modified: string; sensitive: boolean; unreadable?: boolean }
export interface FolderListing { profile: string; path: string; entries: FolderEntry[]; truncated: boolean; hiddenCount: number }
export interface FolderFile { profile: string; path: string; size: number; modified: string; kind: 'text' | 'binary' | 'sensitive' | 'too-large'; content?: string; truncated?: boolean; redactions?: number }
export interface TaskDetail {
  id: string
  title: string
  status: string
  assignee?: string
  priority?: number
  tenant?: string
  workspace?: string
  branch?: string
  skills: string[]
  model?: string
  createdAt?: string
  createdBy?: string
  startedAt?: string
  completedAt?: string
  body?: string
  result?: string
  lastError?: string
  parents: string[]
  children: string[]
  comments: { author: string; body: string; createdAt?: string }[]
  events: { kind: string; detail?: string; createdAt?: string; runId?: string }[]
  runs: { id: string; profile?: string; status?: string; outcome?: string; summary?: string; error?: string; startedAt?: string; endedAt?: string }[]
}
export interface TaskDetailSnapshot { task: Source<TaskDetail | null>; fetchedAt: string }
export interface DependencyNode { key: string; id: string; board?: string; title: string; status: string; assignee?: string; private?: boolean; waiting: boolean; bottleneck: number; root: boolean; available: boolean }
export interface DependencyEdge { from: string; to: string }
export interface DependencySnapshot { graph: Source<{ nodes: DependencyNode[]; edges: DependencyEdge[]; partial: boolean; failed: string[] }>; fetchedAt: string }
export interface ArtifactEntry { name: string; path: string; type: 'dir' | 'file'; size: number; sensitive: boolean }
export interface ArtifactListing { taskId: string; path: string; entries: ArtifactEntry[]; truncated: boolean }
export interface ArtifactFile { taskId: string; path: string; size: number; kind: 'text' | 'binary' | 'sensitive' | 'too-large'; content?: string; truncated?: boolean; redactions?: number }
export interface MemoryDocument { name: string; path: string; exists: boolean; size?: number; modified?: string; chars?: number; content?: string; truncated?: boolean; redactions?: number; error?: string }
export interface MemoryStore extends MemoryDocument { entries: string[]; limit: number; used: number; percent: number }
export interface MemorySettings { memoryEnabled: boolean; userProfileEnabled: boolean; writeApproval: boolean; provider?: string; memoryLimit: number; userLimit: number; source: 'config.yaml' | 'defaults' }
export interface AgentMemory { profile: string; label: string; path: string; kind: 'hermes' | 'opencode'; available: boolean; reason?: string; soul?: MemoryDocument; memory?: MemoryStore; user?: MemoryStore; contextFiles: MemoryDocument[]; settings?: MemorySettings; locked?: boolean }
export interface MemorySnapshot { agents: AgentMemory[]; fetchedAt: string }
