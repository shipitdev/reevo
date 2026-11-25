/** Real Loader composition: the bridge mounted from a cordis.yml row beside the shipped core plugins. */

import * as NativeToolExecutor from '@reevo/dsh-tool-executor-native'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import AgentRegistry from '@reevo/dsh-agent'
import AgentLoop from '@reevo/dsh-agent-loop'
import CommandRuntime from '@reevo/dsh-commands'
import LocalFileSystem from '@reevo/dsh-fs-local'
import WorkingDirectory from '@reevo/dsh-working-directory'
import LlmRuntime, { createUserMessage } from '@reevo/dsh-llm'
import SessionStore, { type SessionId } from '@reevo/dsh-session'
import SessionProjectionRegistry from '@reevo/dsh-session-projection'
import SystemPrompt from '@reevo/dsh-system-prompt'
import ToolRuntime from '@reevo/dsh-tools'
import { defineContentToolFixture } from '@reevo/dsh-tool-testkit'
import * as ClaudeCodeMods from '../src/index.ts'
import { MockAdapter, textResponse, toolCallResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import { brandString } from '@reevo/dsh-brand'

// Keep workspace imports in Vitest's source graph even when the config has a package scope.
vi.mock('@deepseek-ai/cordis-plugin-loader/src/resolve.ts', () => ({ createResolve: () => undefined }))

const FIXTURES = resolve(import.meta.dirname, 'fixtures')

let ctx: Context | undefined
let root: string | undefined

afterEach(async () => {
  await ctx?.fiber.dispose()
  if (root !== undefined) await rm(root, { recursive: true, force: true })
  ctx = undefined
  root = undefined
})

it('loads from cordis.yml, counts the model\'s tool calls, and answers /tally through the composed command registry', async () => {
  root = await mkdtemp(join(tmpdir(), 'dsh-cc-mods-composition-'))
  await writeFile(join(root, 'package.json'), JSON.stringify({ type: 'module' }))
  const configPath = join(root, 'cordis.yml')
  const modules = new Map<string, unknown>([
    ['@reevo/dsh-llm', LlmRuntime],
    ['@reevo/dsh-session', SessionStore],
    ['@reevo/dsh-session-projection', SessionProjectionRegistry],

    ['@reevo/dsh-system-prompt', SystemPrompt],
    ['@reevo/dsh-fs-local', LocalFileSystem],
    ['@reevo/dsh-working-directory', WorkingDirectory],
    ['@reevo/dsh-tools', ToolRuntime],
    ['@reevo/dsh-tool-executor-native', NativeToolExecutor],
    ['@reevo/dsh-agent', AgentRegistry],
    ['@reevo/dsh-agent-loop', AgentLoop],
    ['@reevo/dsh-commands', CommandRuntime],
    ['@reevo/dsh-experimental-claude-code-mods', ClaudeCodeMods],
  ])
  // A mod is a plugin like any other: here the tutorial mod's `defineMod` wrapper, mounted by file URL after the bridge.
  const firstMod = pathToFileURL(resolve(FIXTURES, 'first-mod.ts')).href
  await writeFile(configPath, [
    ...[...modules.keys()].map(name => `- name: '${name}'`),
    `- name: '${firstMod}'`,
    '  config:',
    '    greeting: The model made',
  ].join('\n') + '\n')

  const context = ctx = new Context()
  context.baseUrl = pathToFileURL(root).href + '/'
  await context.plugin(Loader)
  context.loader.builtins.include = Include
  context.loader.internal = undefined
  await context.loader.create({ name: 'cordis:include', config: { path: pathToFileURL(configPath).href } })
  await context.loader.await()
  for (const entry of context.loader.entries()) await entry.fiber?.await()

  const adapter = new MockAdapter([toolCallResponse('c1', 'echo', { command: 'ls' }), textResponse('listed')])
  context.llm.registerAdapter(['mock'], adapter)
  context.tools.register(defineContentToolFixture({
    name: 'echo', description: 'echo', parameters: { command: { type: 'string' } },
    async execute(args) { return [{ type: 'text', text: `ran ${args.command}` }] },
  }))
  const agent = await context.agentLoop.create(brandString<SessionId>('composed'), { provider: 'mock', model: 'mock' })
  expect(context.commands.list(agent).map(command => command.name)).toEqual(['tally'])
  agent.followup(createUserMessage({ content: [{ type: 'text', text: 'list the files here' }], source: { kind: 'user' } }))
  await agent.whenIdle()
  expect(adapter.requests).toHaveLength(2)
  const run = await context.commands.execute(agent, '/tally', [], new AbortController().signal)
  expect(run?.result).toEqual({ kind: 'success', text: 'first-mod: The model made 1 tool calls since this mod loaded' })
})
