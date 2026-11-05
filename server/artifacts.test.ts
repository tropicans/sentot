import { mkdtemp, mkdir, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { artifactPath, listArtifacts, readArtifact } from './artifacts.js'

let root: string
beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'ruang-artifacts-'))
  process.env.RUANG_KANBAN_WORKSPACES = root
  await mkdir(path.join(root, 'task-1', 'docs'), { recursive: true })
  await writeFile(path.join(root, 'task-1', 'docs', 'report.md'), 'token=abc123\n# <script>alert(1)</script>')
  await writeFile(path.join(root, 'task-1', '.env'), 'SECRET=yes')
  await writeFile(path.join(root, 'task-1', 'secret.key'), 'key')
  await writeFile(path.join(root, 'task-1', 'image.bin'), Buffer.from([0, 1, 2]))
  await symlink(path.join(root, 'task-1', 'docs'), path.join(root, 'task-1', 'linked'))
})
afterEach(() => { delete process.env.RUANG_KANBAN_WORKSPACES })

describe('task artifacts security', () => {
  it.each(['../x', 'a/../../x', '/etc/passwd', 'C:\\secret', 'a\\b', 'a\0b', 'x'.repeat(1025)])('rejects unsafe path %j', (value) => {
    expect(() => artifactPath('task-1', value)).toThrow()
  })
  it('caps listing, omits sensitive files, symlinks, and absolute paths', async () => {
    const result = await listArtifacts('task-1', '')
    expect(result.entries.map((entry) => entry.name)).toEqual(['docs', 'image.bin'])
    expect(JSON.stringify(result)).not.toContain(root)
  })
  it('rejects every symlink and blocks sensitive and binary previews', async () => {
    await expect(listArtifacts('task-1', 'linked')).rejects.toMatchObject({ status: 403 })
    await expect(readArtifact('task-1', '.env')).resolves.toMatchObject({ kind: 'sensitive' })
    await expect(readArtifact('task-1', 'secret.key')).resolves.toMatchObject({ kind: 'sensitive' })
    await expect(readArtifact('task-1', 'image.bin')).resolves.toMatchObject({ kind: 'binary' })
  })
  it('redacts secrets and caps text preview', async () => {
    const file = await readArtifact('task-1', 'docs/report.md')
    expect(file).toMatchObject({ kind: 'text', path: 'docs/report.md' })
    expect(file.content).not.toContain('abc123')
    expect(JSON.stringify(file)).not.toContain(root)
  })
})
