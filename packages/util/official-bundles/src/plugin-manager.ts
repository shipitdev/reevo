/** The package names the plugin manager protects, hides, orders, or marks experimental. */

/**
 * Plugin packages the plugin manager refuses to disable or remove, because management itself needs them; a bundle that
 * contains one is read-only as well. Removing a name drops only this `management-required` refusal; the manager's own
 * entry, installation-carried bundles, and unaddressable rows stay protected by their own rules.
 */
export const PROTECTED_PLUGINS: ReadonlySet<string> = new Set([
  '@reevo/dsh-plugin-manager', '@deepseek-ai/cordis-plugin-loader',
  '@deepseek-ai/cordis-plugin-include', '@reevo/dsh-api-gateway',
  '@reevo/dsh-host-webserver', '@reevo/dsh-client-modules',
  '@reevo/dsh-client-ui-plugin-manager',
  '@reevo/dsh-host-plugin-inventory', '@reevo/dsh-typert-registry',
  '@reevo/dsh-api-remotes', '@reevo/dsh-api-remote-access',
  '@deepseek-ai/cordis-plugin-timer', '@reevo/dsh-client-connection',
  '@reevo/dsh-host-frontend-static', '@reevo/dsh-tools',
  '@reevo/dsh-hmr',
])

/**
 * Built-in profile bundles, the standalone worktree tool, and the Computer Use MCP profile
 * bundle, which have no plugin manager page.
 * Their Host availability and activation stay intact.
 */
export const HIDDEN_BUNDLES: ReadonlySet<string> = new Set([
  '@reevo/dsh-base',
  '@reevo/dsh-web-app',
  '@reevo/dsh-headless',
  '@reevo/dsh-sdk-app',
  '@reevo/dsh-acp-app',
  '@reevo/dsh-sdk-minimal',
  '@reevo/dsh-experimental-tool-worktree',
  '@reevo/dsh-cua-mcp',
])

/**
 * The optional bundles the plugin manager's main and More lists rank first, in this order. {@link MORE_BUNDLES}, not
 * this list, decides whether a bundle appears on the main list.
 */
export const EXTENSION_BUNDLES: readonly string[] = [
  '@reevo/dsh-experimental-voice-input-bundle',
  '@reevo/dsh-experimental-plugin-market-bundle',
  '@reevo/dsh-experimental-auto-review',
]

/**
 * The optional bundles the plugin manager's main list leaves out until the profile enables them; its More list,
 * which includes every eligible bundle, ranks them last in this order.
 */
export const MORE_BUNDLES: readonly string[] = [
  '@reevo/dsh-experimental-inspector-profile',
  '@reevo/dsh-cua-bundle',
  '@reevo/dsh-timeline',
  '@reevo/dsh-experimental-terminal-bundle',
  '@reevo/dsh-experimental-cot-translation-bundle',
  '@reevo/dsh-experimental-session-search',
  '@reevo/dsh-experimental-session-titles-bundle',
  '@reevo/dsh-experimental-badge-skill-bundle',
  '@reevo/dsh-experimental-ralph-bundle',
  '@reevo/dsh-deepseek-chat-import',
  '@reevo/dsh-subagent-codex',
  '@reevo/dsh-subagent-claude-code',
]

/** Official bundles the plugin manager marks with the Experimental badge. */
export const EXPERIMENTAL_BUNDLES: ReadonlySet<string> = new Set([
  '@reevo/dsh-cua-bundle',
  '@reevo/dsh-cua-mcp',
  '@reevo/dsh-timeline',
  '@reevo/dsh-experimental-terminal-bundle',
  '@reevo/dsh-experimental-voice-input-bundle',
  '@reevo/dsh-experimental-auto-review',
  '@reevo/dsh-experimental-inspector-profile',
  '@reevo/dsh-experimental-forge-bundle',
  '@reevo/dsh-experimental-tool-worktree',
  '@reevo/dsh-experimental-cot-translation-bundle',
  '@reevo/dsh-experimental-session-search',
  '@reevo/dsh-experimental-session-titles-bundle',
  '@reevo/dsh-experimental-badge-skill-bundle',
  '@reevo/dsh-experimental-ralph-bundle',
  '@reevo/dsh-experimental-plugin-market-bundle',
  '@reevo/dsh-experimental-liveshare',
  '@reevo/dsh-deepseek-chat-import',
])
