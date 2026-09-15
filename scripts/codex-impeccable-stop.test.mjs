import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const adapter = fileURLToPath(
  new URL('./codex-impeccable-stop.mjs', import.meta.url),
)
const findingCss = `.title {
  background: linear-gradient(90deg, red, blue);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}`

function fixture(t, css = findingCss) {
  const cwd = mkdtempSync(join(tmpdir(), 'impeccable-stop-'))
  t.after(() => rmSync(cwd, { recursive: true, force: true }))
  mkdirSync(join(cwd, '.impeccable'))
  mkdirSync(join(cwd, 'src'))
  const file = join(cwd, 'src', 'style.css')
  writeFileSync(file, css)
  writeFileSync(
    join(cwd, '.impeccable', 'hook.cache.json'),
    JSON.stringify({
      version: 1,
      sessions: {
        regression: {
          updatedAt: Date.now(),
          files: { [file]: { editCount: 1, findings: [] } },
        },
      },
    }),
  )
  return cwd
}

function invoke(cwd, event = {}, overrides = {}) {
  const env = { ...process.env }
  for (const key of Object.keys(env)) {
    if (key.startsWith('IMPECCABLE_HOOK_') || key === 'CLAUDE_HOOK_DEPTH')
      delete env[key]
  }
  const result = spawnSync(process.execPath, [adapter], {
    cwd: join(cwd, 'src'),
    env: { ...env, ...overrides },
    input:
      typeof event === 'string'
        ? event
        : JSON.stringify({
            hook_event_name: 'Stop',
            session_id: 'regression',
            cwd,
            ...event,
          }),
    encoding: 'utf8',
    timeout: 5000,
  })
  assert.ifError(result.error)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stderr, '')
  return result.stdout
}

test('real findings produce a Codex continuation once, even from a subdirectory', (t) => {
  const cwd = fixture(t)
  const output = JSON.parse(invoke(cwd))
  assert.deepEqual(Object.keys(output).sort(), ['decision', 'reason'])
  assert.equal(output.decision, 'block')
  assert.match(output.reason, /gradient-text/)
  assert.match(output.reason, /style\.css/)
  // The upstream cache still deduplicates findings after the translation.
  assert.equal(invoke(cwd), '')
})

test('a clean deep pass is silent', (t) => {
  assert.equal(invoke(fixture(t, '.title { padding: 16px; }')), '')
})

test('a session without touched files is silent', (t) => {
  assert.equal(invoke(fixture(t), { session_id: 'empty' }), '')
})

test('a Stop continuation cannot create a repeated review loop', (t) => {
  const cwd = fixture(t)
  assert.equal(invoke(cwd, { stop_hook_active: true }), '')
  // The guard must not consume findings before the original Stop pass.
  assert.equal(JSON.parse(invoke(cwd)).decision, 'block')
})

test('the existing disabled-hook setting is respected', (t) => {
  assert.equal(invoke(fixture(t), {}, { IMPECCABLE_HOOK_DISABLED: '1' }), '')
})

test('malformed hook input remains harmless', (t) => {
  assert.equal(invoke(fixture(t), '{'), '')
})
