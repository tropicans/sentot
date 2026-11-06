import { describe, expect, it } from 'vitest'
import { buildApprovalQueue, APPROVAL_UNAVAILABLE, type TaskBoardSnapshot } from './mission-control.js'

const board: TaskBoardSnapshot = { tasks: { availability: 'available', data: [
  { id: 'a1', board: 'alpha', title: 'Approval: curriculum — validate module outline', status: 'todo', assignee: 'lna' },
  { id: 't1', board: 'alpha', title: 'Build module', status: 'done', assignee: 'id' },
] }, fetchedAt: 'now' }

describe('approval queue', () => {
  it('projects only explicitly marked approval tasks and never infers approval from task status', () => {
    expect(buildApprovalQueue(board).items).toEqual([{
      approvalType: 'curriculum', sourceTask: 'validate module outline', taskId: 'a1', board: 'alpha', owner: 'lna', status: APPROVAL_UNAVAILABLE, requestedDate: APPROVAL_UNAVAILABLE, decisionMaker: APPROVAL_UNAVAILABLE, evidence: APPROVAL_UNAVAILABLE, risk: APPROVAL_UNAVAILABLE, dependency: APPROVAL_UNAVAILABLE, version: APPROVAL_UNAVAILABLE,
    }])
  })
  it('returns no items and surfaces unavailable source', () => {
    const result = buildApprovalQueue({ ...board, tasks: { availability: 'unavailable', data: [], error: { code: 'COMMAND_FAILED', message: 'no board' } } })
    expect(result.items).toEqual([])
    expect(result.source.availability).toBe('unavailable')
  })
  it('accepts explicitly sourced approval status only', () => {
    const explicit: TaskBoardSnapshot = { tasks: { availability: 'available', data: [{ id: 'a2', title: 'Approval approved: cost — budget', status: 'done', assignee: 'id' }] }, fetchedAt: 'now' }
    expect(buildApprovalQueue(explicit).items[0].status).toBe('approved')
  })
  it('uses only approved category names and reports partial board coverage', () => {
    const partial: TaskBoardSnapshot = { tasks: { availability: 'available', data: [
      { title: 'Approval: scope — charter', status: 'todo' },
      { title: 'Approval: project scope — alias must not be invented', status: 'todo' },
      { title: 'Approval: TITAN change — config', status: 'todo' },
    ] }, failedBoards: ['private-board'], fetchedAt: 'now' }
    const result = buildApprovalQueue(partial)
    expect(result.items.map((item) => item.approvalType)).toEqual(['scope', 'TITAN change'])
    expect(result.failedBoards).toEqual(['private-board'])
  })
})
