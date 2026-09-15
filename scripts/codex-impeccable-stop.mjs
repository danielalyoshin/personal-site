import {
  runStopHook,
  writeAuditLog,
} from '../.agents/skills/impeccable/scripts/hook-lib.mjs'

// Impeccable 4.0.2 emits additionalContext for Stop. Codex requires a
// continuation decision instead: https://learn.chatgpt.com/docs/hooks#stop
// Keep this adapter outside the vendored skill so its version stays intact.
async function main() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  const result = await runStopHook({
    stdinJson: Buffer.concat(chunks).toString('utf8'),
    env: { ...process.env, IMPECCABLE_HOOK_HARNESS: 'codex' },
    cwd: process.cwd(),
  })
  writeAuditLog(process.env, result.audit, process.cwd())
  if (!result.stdout) return

  const output = JSON.parse(result.stdout)
  const context = output.hookSpecificOutput
  if (
    context?.hookEventName === 'Stop' &&
    typeof context.additionalContext === 'string'
  ) {
    if (!context.additionalContext.trim()) return
    process.stdout.write(
      JSON.stringify({
        decision: 'block',
        reason: context.additionalContext,
      }) + '\n',
    )
    return
  }
  // Preserve already-compatible output if the installed skill changes later.
  process.stdout.write(result.stdout)
}

main().catch((error) => {
  process.stderr.write(`Impeccable Stop adapter failed: ${error.message}\n`)
  process.exitCode = 1
})
