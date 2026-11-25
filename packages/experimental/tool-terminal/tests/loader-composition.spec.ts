import { executeToolFixture } from '@reevo/dsh-tool-testkit'
import * as NativeToolExecutor from '@reevo/dsh-tool-executor-native'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { unsupportedModel, provideWorkingDirectoryFixture, unsupportedInbox } from '@reevo/dsh-agent-loop-testkit'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import { brandString } from '@reevo/dsh-brand'
import type { ToolCallId } from '@reevo/dsh-llm'
import { Session, type SessionId } from '@reevo/dsh-session'
import AgentRegistry from '@reevo/dsh-agent'
import type { Agent } from '@reevo/dsh-agent'
import SystemPrompt from '@reevo/dsh-system-prompt'
import ToolRuntime from '@reevo/dsh-tools'
import TerminalSessionService from '@reevo/dsh-terminal'
import SandboxProvider from '@reevo/dsh-sandbox'
import type { ConfinedArgv, SandboxPolicy } from '@reevo/dsh-sandbox'
import SandboxPolicyService from '@reevo/dsh-sandbox-policy'
import SessionProjectionRegistry from '@reevo/dsh-session-projection'
import LocalSubprocessRuntime from '@reevo/dsh-subprocess-local'
import * as TerminalLocal from '@reevo/dsh-terminal-bash'
import * as ToolPty from '@reevo/dsh-tool-terminal'

let root: string | undefined
let context: Context | undefined

afterEach(async () => {
  await context?.fiber.dispose()
  context = undefined
  if (root !== undefined) await rm(root, { recursive: true, force: true })
  root = undefined
})

class PassthroughSandbox extends SandboxProvider {
  async confine(argv: readonly string[], _policy: SandboxPolicy): Promise<ConfinedArgv> {
    return { argv: [...argv], enforcement: 'full', denialSignatures: [], runnerFailureRules: [] }
  }
}

async function agent(ctx: Context): Promise<Agent> {
  const scope = ctx.plugin(() => {})
  const id = brandString<SessionId>('pty-loader-agent')
  const session = Session.create(id)
  const value: Agent = {
    id, options: {}, session, model: unsupportedModel(),
    inbox: unsupportedInbox(),
    status: 'idle',
    ctx: scope.ctx,
    send: () => {},
    followup: () => {}, steer: () => {}, inject: () => {}, cancel() {},
    runMaintenance: job => job(new AbortController().signal),
    whenIdle: () => Promise.resolve(),
  }
  await ctx.agents.register(value)
  return value
}

function resultText(result: { content: { type: string; text?: string }[] }): string {
  return result.content.filter(block => block.type === 'text').map(block => block.text).join('')
}

const suite = process.platform === 'linux' || process.platform === 'darwin' ? describe : describe.skip

suite('terminal real Loader composition through cordis.yml', () => {
  it('boots cordis.yml and preserves shell state across real tool calls', async () => {
    root = await mkdtemp(join(tmpdir(), 'dsh-pty-loader-'))
    const configPath = join(root, 'cordis.yml')
    await writeFile(configPath, [
      "- name: '@reevo/dsh-agent'",
      "- name: '@reevo/dsh-system-prompt'",
      "- name: '@reevo/dsh-tools'",
      "- name: '@reevo/dsh-tool-executor-native'",
      "- name: '@reevo/dsh-terminal'",
      "- name: '@reevo/dsh-test-sandbox'",
      "- name: '@reevo/dsh-session-projection'",
      "- name: '@reevo/dsh-sandbox-policy'",
      '  config:',
      '    mode: danger-full-access',
      `    workspaceRoot: ${JSON.stringify(root)}`,
      "- name: '@reevo/dsh-subprocess-local'",
      "- name: '@reevo/dsh-terminal-bash'",
      '  config:',
      '    pollIntervalMs: 10',
      '    exactProbeAfterMs: 20',
      '    idleSilenceMs: 250',
      '    handoffGraceMs: 250',
      '    timeoutMs: 2000',
      '    disposeGraceMs: 500',
      "- name: '@reevo/dsh-tool-terminal'",
      '',
    ].join('\n'))

    context = new Context()

    provideWorkingDirectoryFixture(context)
    context.baseUrl = pathToFileURL(root).href + '/'
    await context.plugin(Loader)
    context.loader.builtins.include = Include
    const modules = new Map<string, unknown>([
      ['@reevo/dsh-agent', AgentRegistry],
      ['@reevo/dsh-system-prompt', SystemPrompt],
      ['@reevo/dsh-tools', ToolRuntime],
      ['@reevo/dsh-tool-executor-native', NativeToolExecutor],
      ['@reevo/dsh-terminal', TerminalSessionService],
      ['@reevo/dsh-test-sandbox', PassthroughSandbox],
      ['@reevo/dsh-session-projection', SessionProjectionRegistry],
      ['@reevo/dsh-sandbox-policy', SandboxPolicyService],
      ['@reevo/dsh-subprocess-local', LocalSubprocessRuntime],
      ['@reevo/dsh-terminal-bash', TerminalLocal],
      ['@reevo/dsh-tool-terminal', ToolPty],
    ])
    context.loader.internal = {
      version: 'v2',
      async import(specifier: string) {
        if (!modules.has(specifier)) throw new Error(`unexpected Loader import: ${specifier}`)
        return modules.get(specifier)
      },
    } as unknown as NonNullable<typeof context.loader.internal>
    await context.loader.create({ name: 'cordis:include', config: { path: pathToFileURL(configPath).href } })
    await context.loader.await()

    const owner = await agent(context)
    const signal = new AbortController().signal
    const spawn = await executeToolFixture(context, {
      signal, callId: brandString<ToolCallId>('spawn'), name: 'terminal_open', arguments: { type: 'shell', name: 'main', cwd: root }, agent: owner,
    })
    expect(resultText(spawn)).toContain('started terminal session pty-1 (main)')

    await executeToolFixture(context, {
      signal, callId: brandString<ToolCallId>('state'), name: 'terminal_send', arguments: { sessionId: 'pty-1', text: 'export KEEP=loader; cd /' }, agent: owner,
    })
    const read = await executeToolFixture(context, {
      signal, callId: brandString<ToolCallId>('read'), name: 'terminal_send', arguments: { sessionId: 'pty-1', text: 'printf "cwd=%s keep=%s\\n" "$PWD" "$KEEP"' }, agent: owner,
    })
    expect(resultText(read)).toContain('cwd=/ keep=loader')
    expect(context.terminals.list(owner)).toHaveLength(1)
  }, 15_000)
})
