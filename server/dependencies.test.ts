import { describe, expect, it } from 'vitest'
import { collectDependencies, type TaskBoardSnapshot } from './mission-control.js'
import { PRIVATE_TASK, redactDependencies } from './privacy.js'
import type { Privacy } from './profile-lock.js'

const board: TaskBoardSnapshot = {
  tasks: { availability: 'available', data: [
    { id: 'a', title: 'Secret parent', status: 'done', assignee: 'locked', board: 'alpha' },
    { id: 'b', title: 'Child', status: 'todo', assignee: 'open', board: 'alpha' },
    { id: 'a', title: 'Other board', status: 'todo', assignee: 'open', board: 'beta' },
  ] }, fetchedAt: 'now',
}

const show = (id: string, parents: string[] = [], children: string[] = []) => JSON.stringify({ task: { id, title: id, status: 'todo' }, parents, children })

describe('dependency snapshot', () => {
  it('queries listed board-scoped IDs only, bounds concurrency, and ignores out-of-board links', async () => {
    const calls: string[][] = []
    let active = 0
    let peak = 0
    const run = async (_file: string, args: string[]) => {
      calls.push(args); active++; peak = Math.max(peak, active)
      await new Promise((resolve) => setTimeout(resolve, 2)); active--
      const id = args.at(-2)!
      return id === 'b' && args.includes('alpha') ? show(id, ['a', 'outside']) : show(id)
    }
    const result = await collectDependencies(board, run, 2)
    expect(calls).toHaveLength(3)
    expect(peak).toBeLessThanOrEqual(2)
    expect(result.graph.data.edges).toEqual([{ from: 'alpha:a', to: 'alpha:b' }])
    expect(result.graph.data.nodes.find((node) => node.key === 'alpha:b')?.waiting).toBe(false)
    expect(result.graph.data.nodes.filter((node) => node.root).map((node) => node.key)).toContain('beta:a')
  })

  it('marks partial data without inventing edges and redacts locked titles', async () => {
    const run = async (_file: string, args: string[]) => args.at(-2) === 'b' ? Promise.reject(new Error('offline')) : show(args.at(-2)!)
    const result = await collectDependencies(board, run, 2)
    expect(result.graph.availability).toBe('available')
    expect(result.graph.data.partial).toBe(true)
    expect(result.graph.data.edges).toEqual([])
    const privacy: Privacy = { all: false, hidden: new Set(['locked']), locked: new Set(['locked']) }
    const redacted = redactDependencies(result, privacy)
    expect(redacted.graph.data.nodes.find((node) => node.key === 'alpha:a')).toMatchObject({ title: PRIVATE_TASK, private: true })
    expect(JSON.stringify(redacted)).not.toContain('Secret parent')
  })

  it('does not query details when board source is unavailable', async () => {
    let calls = 0
    const unavailable: TaskBoardSnapshot = { tasks: { availability: 'unavailable', data: [], error: { code: 'COMMAND_FAILED', message: 'down' } }, fetchedAt: 'now' }
    const result = await collectDependencies(unavailable, async () => { calls++; return '' })
    expect(calls).toBe(0)
    expect(result.graph.availability).toBe('unavailable')
  })
})
