/** The standalone SDK-minimal bundle's complete declared Cordis tree. */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseEntryYaml } from '@deepseek-ai/cordis-plugin-include'

function packageName(specifier: string): string {
  return specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]!
}

describe('dsh-sdk-minimal bundle', () => {
  it('declares one standalone allowlisted tree with every row dependency', () => {
    const root = fileURLToPath(new URL('..', import.meta.url))
    const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>
      dsh?: { bundle?: { patch?: string } }
    }
    expect(manifest.dsh?.bundle?.patch).toBe('./cordis.patch.yml')
    const patches = parseEntryYaml(readFileSync(resolve(root, manifest.dsh!.bundle!.patch!), 'utf8')) as Array<{ insert?: Array<{ id?: string; inject?: string[]; name?: string; config?: Record<string, unknown>; disabled?: unknown }> }>
    expect(patches).toHaveLength(1)
    const rows = patches[0]?.insert ?? []
    expect(rows.map(row => [row.id, row.name])).toEqual([
      ['sdk-app-startup', '@reevo/dsh-sdk-app'],
      ['sdk-jsonrpc-server', '@reevo/dsh-sdk-jsonrpc-server'],
      ['deepseek-llm-api-extensions', '@reevo/dsh-deepseek-llm-api-extensions'],
      ['session-log-deepseek', '@reevo/dsh-session-log-deepseek'],
      ['plugin-package-inventory-deepseek', '@reevo/dsh-plugin-package-inventory-deepseek'],
      ['deepseek-auth', '@reevo/dsh-deepseek-auth'],
      ['llm-deepseek', '@reevo/dsh-llm-deepseek-api-key'],
      ['sandbox', '@reevo/dsh-sandbox-local'],
      ['filesystem', '@reevo/dsh-fs-local'],
      ['attachment-local', '@reevo/dsh-attachment-local'],
      ['tool-fs', '@reevo/dsh-tool-fs'],
      ['working-directory', '@reevo/dsh-working-directory'],
      ['session-projection', '@reevo/dsh-session-projection'],
      ['token-meter', '@reevo/dsh-token-meter'],
      ['compaction-basic', '@reevo/dsh-compaction-basic'],
      ['image-offload', '@reevo/dsh-compaction-image-offload'],
      ['sandbox-policy', '@reevo/dsh-sandbox-policy'],
      ['subprocess', '@reevo/dsh-subprocess-local'],
      ['pty', '@reevo/dsh-terminal'],
      ['terminal-bash', '@reevo/dsh-terminal-bash'],
      ['terminal-pwsh', '@reevo/dsh-terminal-bash'],
      ['timer', '@deepseek-ai/cordis-plugin-timer'],
      ['llm', '@reevo/dsh-llm'],
      ['session', '@reevo/dsh-session'],
      ['session-title', '@reevo/dsh-session-title'],
      ['system-prompt', '@reevo/dsh-system-prompt'],
      ['tools', '@reevo/dsh-tools'],
      ['tool-executor-native', '@reevo/dsh-tool-executor-native'],
      ['mcp-resources', '@reevo/dsh-mcp-resources'],
      ['agent', '@reevo/dsh-agent'],
      ['llm-retry', '@reevo/dsh-llm-retry'],
      ['jobs', '@reevo/dsh-jobs-local'],
      ['agent-loop', '@reevo/dsh-agent-loop'],
      ['persistent-bash', '@reevo/dsh-tool-bash-persistent'],
      ['persistent-pwsh', '@reevo/dsh-tool-pwsh-persistent'],
      ['sessions', '@reevo/dsh-session-persistence-jsonl'],
      ['session-checkpoint-policy', '@reevo/dsh-session-checkpoint-policy'],
    ])
    expect(rows.find(row => row.id === 'sdk-app-startup')?.config).toEqual({ profile: 'sdk-minimal' })
    expect(rows.find(row => row.id === 'sdk-jsonrpc-server')).toMatchObject({
      inject: ['sdkAppStartup', 'loader'],
      config: { maxTokensAsSuccess: false },
    })
    expect(rows.find(row => row.id === 'llm-deepseek')?.config).toEqual({
      apiKeyEnv: 'DEEPSEEK_API_KEY',
      defaultContextWindow: { __jsExpr: 'Number(process.env.DSH_CONTEXT_WINDOW ?? 1000000)' },
      streamIdleTimeoutMs: 172800000,
    })
    expect(rows.find(row => row.id === 'system-prompt')?.config).toEqual({
      includeHarnessIdentity: false,
      includeRuntimeContext: false,
      personaPrefix: { __jsExpr: "process.env.DSH_SYSTEM_PROMPT ?? 'You are a helpful software engineer assistant.'" },
    })
    expect(rows.find(row => row.id === 'agent-loop')?.config).toEqual({ agents: [] })
    expect(rows.find(row => row.id === 'tool-fs')?.config).toEqual({ read: false, readImage: true, write: false, edit: false })
    expect(rows.find(row => row.id === 'compaction-basic')?.config).toBeUndefined()
    expect(rows.find(row => row.id === 'terminal-bash')).toMatchObject({
      disabled: { __jsExpr: "process.platform === 'win32'" },
    })
    expect(rows.find(row => row.id === 'terminal-pwsh')).toMatchObject({
      disabled: { __jsExpr: "process.platform !== 'win32'" },
      config: { shellDialect: 'pwsh', timeoutMs: 300000 },
    })
    expect(Object.keys(manifest.dependencies ?? {}).sort()).toEqual(
      [...new Set(rows.map(row => row.name).filter((name): name is string => name !== undefined).map(packageName))].sort(),
    )
  })
})
