/** Explicit exceptions and Host packages for the published dependency policy. */

/** Packages treated as Client/Host packages without declaring `dsh.client`. */
const CLIENT_FACE_INCLUDE: readonly string[] = []

/** Packages exempted from automatic Client/Host treatment despite declaring `dsh.client`. */
const CLIENT_FACE_EXCLUDE: readonly string[] = [
  '@reevo/dsh-api-session-controller',
  '@reevo/dsh-api-workspace-controller',
]

/** Host-only packages whose peer relays are deliberately flattened. */
const HOST_DEPENDENCY_PACKAGES: readonly string[] = [
  '@reevo/dsh-llm',
  '@reevo/dsh-session',
]

/** Required Cordis services whose Host imports are type-only. */
const REQUIRED_SERVICE_PEERS = {
  '@reevo/dsh-api-terminal-controller': ['@reevo/dsh-subprocess'],
} as const satisfies Readonly<Record<string, readonly string[]>>

/** Development-only package relationships not represented by source imports. */
const CONFIGURATION_ONLY_DEV_DEPENDENCIES = {
  '@reevo/dsh-client-locale': ['@reevo/dsh-api-remotes'],
  '@reevo/dsh-client-ui-conversation': [
    '@reevo/dsh-api-remotes',
    '@reevo/dsh-client-ui-workspace',
  ],
  '@reevo/dsh-client-ui-model-selection': ['@reevo/dsh-client-ui-input-trigger'],
  '@reevo/dsh-client-ui-sidebar': ['@reevo/dsh-client-ui-workspace'],
  '@reevo/dsh-client-ui-subagent': ['@reevo/dsh-client-ui-input-trigger'],
  '@reevo/dsh-client-ui-theme': ['@reevo/dsh-api-remotes'],
  '@reevo/dsh-client-ui-tool': ['@reevo/dsh-api-remotes'],
} as const satisfies Readonly<Record<string, readonly string[]>>

/** Workspace packages whose complete runtime surface is safe across duplicate installations. */
const DUPLICATE_SAFE_PACKAGES: readonly string[] = [
  '@reevo/dsh-brand',
  '@reevo/dsh-lazy-require',
  '@reevo/dsh-typert-protocol',
  '@reevo/dsh-util-code-language',
  '@reevo/dsh-util-crypto',
  '@reevo/dsh-util-text-search',
  '@reevo/dsh-util-values',
]

/**
 * Runtime exports whose values remain valid when npm installs another package copy.
 * New entries are forbidden by default. Automated agents must not add an
 * exception; every addition requires explicit human review and a dedicated,
 * prominent heading in the pull request description.
 */
const SAFE_HOST_DEPENDENCY_EXPORTS = {
  '@reevo/dsh-atomic-write': ['withFileLock', 'writeFileAtomic'],
  '@reevo/dsh-deque': ['Deque'],
  // Builds a dispatcher from the resolved proxy policy; the caller owns and closes it.
  '@reevo/dsh-http-proxy': ['createRouteDispatcher'],
  // The Liveshare wire codec and identity helpers are stateless functions over caller-owned values.
  '@reevo/dsh-experimental-liveshare-protocol': [
    'LIVESHARE_CAPABILITIES', 'LIVESHARE_PROTOCOL_VERSION', 'parseRelayFrame', 'parseShareAccessState',
    'parseTunnelWorkerCommand', 'parseTunnelWorkerEvent', 'rawText', 'sendFrame', 'unsupportedFrameRefusal',
    'viewerRequestFields', 'identityFromKey', 'identityKeyOf',
  ],
  // The shipped profile templates are plain data; a consumer reads their bundle names only.
  '@reevo/dsh-official-bundles': ['PROFILE_TEMPLATES'],
  // Messages and assembled blocks are plain data. Each caller owns its assembler.
  '@reevo/dsh-llm': ['BlockAssembler', 'callConfigEquals', 'createUserMessage'],
  '@reevo/dsh-session-format': ['sessionFormatLogFilename'],
  '@reevo/dsh-storage-domain': ['defineDomain'],
  '@reevo/dsh-timeout': ['MAX_TIMER_DELAY_MS'],
  // Both operate only on the caller's subprocess service and handle; the module memoizes only the binary path.
  '@reevo/dsh-util-ripgrep': ['readRipgrepLines', 'spawnRipgrep'],
  '@deepseek-ai/schemastery': ['default'],
} as const satisfies HostDependencyExports

/** Runtime exports that require every consumer to resolve the provider's shared peer instance. */
const PEER_REQUIRED_HOST_EXPORTS = {
  // Agent notifications must use the installed Agent and scope dispatch implementation.
  '@reevo/dsh-agent': ['emitAgentEvent'],
  // Profile settings must match the installed Node provider's configuration schema.
  '@reevo/dsh-ptc-runtime-node/configuration': ['resolvePersistentExecution'],
  // CUA mounts the installed provider and shares executor error classes with PTC.
  '@reevo/dsh-ptc-runtime-node': ['default'],
  '@reevo/dsh-tool-executor-ptc/run-code': ['RunCodeConfig', 'createRunCodeTool'],
  // CUA checks UserQuestionError and preserves AttachmentError from image admission; longEdgeDimensions is pure
  // arithmetic that rides the same peer.
  '@reevo/dsh-attachment': ['admitEncodedImages', 'longEdgeDimensions'],
  '@reevo/dsh-user-questions': ['UserQuestionError'],
  // The tool registry and every subclass rely on `instanceof` against one HarnessError class.
  '@reevo/dsh-error': ['HarnessError'],
  // The Remote plugin uses the injected credential service; its key helper follows that peer.
  '@reevo/dsh-credentials': ['credentialKey'],
  // `instanceof` checks need the translator's own class instance.
  '@reevo/dsh-experimental-translator': ['TranslationError'],
  // Stateless; a safe classification would turn the forge panel's forge and worktree peers into dependencies.
  '@reevo/dsh-experimental-forge': ['changeRequestKey'],
  '@reevo/dsh-experimental-worktree': ['generatedWorktreeName', 'CREATED_RECORD', 'createdWorktreeSchema'],
  // Stateless; the injected WebServer remains a peer.
  '@reevo/dsh-host-webserver': ['normalizeBindAddress'],
  // The forge panel matches ctx.fs failures with `instanceof FsError`.
  '@reevo/dsh-fs': ['FsError'],
  '@reevo/dsh-scope': ['carrierKeyOf', 'createScope', 'scopeOf', 'scopeParentOf', 'scopeTarget'],
  // appendPluginRecord writes through the Session class's private log; pluginRecordOf is stateless.
  // The DeepSeek chat importer validates its seed with the installed Session log validation before storing it.
  '@reevo/dsh-session': ['SESSION_FORMAT_VERSION', 'appendPluginRecord', 'pluginRecordOf', 'validateSessionLog'],
  '@reevo/dsh-session-persistence': ['SessionPersistenceNotFoundError'],
  // Imported titles follow the installed title service's normalization.
  '@reevo/dsh-session-title': ['normalizeSessionTitle'],
  // Error classes have instance identity; CUA and Liveshare throw the registry's own copy so `instanceof` against it matches.
  '@reevo/dsh-tools': ['defineTool', 'ToolArgsError', 'ToolContextUnavailableError', 'RUN_CODE_NAME'],
  // Readers recognize a deadline's TimeoutReason only by `instanceof` against their own copy.
  '@reevo/dsh-timeout': ['deadline', 'timeoutOf'],
  // Imported web tool results must render exactly like the installed web tools' results and cards.
  '@reevo/dsh-tool-web': ['fetchMetaFromValue', 'formatFetchOutput', 'formatSearchOutput', 'searchMetaFromValue'],
} as const satisfies HostDependencyExports

/** Exact import specifier to reviewed runtime exports. */
type HostDependencyExports = Readonly<Record<string, readonly string[]>>

/** Complete configurable input to package dependency classification. */
export interface PackageDependencyPolicy {
  readonly clientFaceInclude: readonly string[]
  readonly clientFaceExclude: readonly string[]
  readonly hostPackages: readonly string[]
  readonly requiredServicePeers?: Readonly<Record<string, readonly string[]>>
  readonly configurationOnlyDevDependencies: Readonly<Record<string, readonly string[]>>
  readonly duplicateSafePackages?: readonly string[]
  readonly safeHostDependencyExports: HostDependencyExports
  readonly peerRequiredHostExports: HostDependencyExports
}

/** Repository dependency policy consumed by verification and benchmarking. */
export const PACKAGE_DEPENDENCY_POLICY: PackageDependencyPolicy = {
  clientFaceInclude: CLIENT_FACE_INCLUDE,
  clientFaceExclude: CLIENT_FACE_EXCLUDE,
  hostPackages: HOST_DEPENDENCY_PACKAGES,
  requiredServicePeers: REQUIRED_SERVICE_PEERS,
  configurationOnlyDevDependencies: CONFIGURATION_ONLY_DEV_DEPENDENCIES,
  duplicateSafePackages: DUPLICATE_SAFE_PACKAGES,
  safeHostDependencyExports: SAFE_HOST_DEPENDENCY_EXPORTS,
  peerRequiredHostExports: PEER_REQUIRED_HOST_EXPORTS,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Whether a package manifest declares a dynamically loaded Client entry. */
export function hasClientDeclaration(dshField: unknown): boolean {
  return isRecord(dshField) && Object.hasOwn(dshField, 'client')
}
