/**
 * Test-only client roster of the assembled viewer page.
 *
 * A served viewer page is the owner's own Web shell with the owner's client plugins; this roster is the
 * subset the viewer page specs need: the wire plugin, the Gateway, remote access, the Session/Workspace controllers,
 * Session status, the menu service, presentation plugins, and the Liveshare `./client` face, which mounts the viewer
 * surfaces when the carrier names a share. Every row is the package's own `/client` face registered as a module-table
 * factory. It must be imported only after {@link prepareViewerRemoteFaces} answered the generated
 * `/remote` faces these plugins import.
 *
 * @module @reevo/dsh-experimental-liveshare/tests/viewer-page-roster
 */

import * as apiGateway from '@reevo/dsh-api-gateway/client'
import * as apiRemoteAccess from '@reevo/dsh-api-remote-access/client'
import * as apiRemotes from '@reevo/dsh-api-remotes/client'
import * as apiSessionController from '@reevo/dsh-api-session-controller/client'
import * as apiWorkspaceController from '@reevo/dsh-api-workspace-controller/client'
import * as clientConnection from '@reevo/dsh-client-connection/client'
import * as clientFileUpload from '@reevo/dsh-client-file-upload/client'
import * as clientLocale from '@reevo/dsh-client-locale/client'
import * as clientModules from '@reevo/dsh-client-modules/client'
import * as clientResources from '@reevo/dsh-client-resources/client'
import * as clientShortcuts from '@reevo/dsh-client-shortcuts/client'
import * as uiAttachment from '@reevo/dsh-client-ui-attachment/client'
import * as uiChat from '@reevo/dsh-client-ui-chat/client'
import * as uiContextMenu from '@reevo/dsh-client-ui-context-menu/client'
import * as uiConversation from '@reevo/dsh-client-ui-conversation/client'
import * as uiDeliverables from '@reevo/dsh-client-ui-deliverables/client'
import * as uiFileDrag from '@reevo/dsh-client-ui-file-drag/client'
import * as uiLayout from '@reevo/dsh-client-ui-layout/client'
import * as uiRenderer from '@reevo/dsh-client-ui-renderer/client'
import * as uiSession from '@reevo/dsh-client-ui-session/client'
import * as uiSessionStatus from '@reevo/dsh-client-ui-session-status/client'
import * as uiSettings from '@reevo/dsh-client-ui-settings/client'
import * as uiSidebar from '@reevo/dsh-client-ui-sidebar/client'
import * as uiSidebarRight from '@reevo/dsh-client-ui-sidebar-right/client'
import * as uiTheme from '@reevo/dsh-client-ui-theme/client'
import * as uiTool from '@reevo/dsh-client-ui-tool/client'
import * as uiTrajectory from '@reevo/dsh-client-ui-trajectory/client'
import * as uiWorkspace from '@reevo/dsh-client-ui-workspace/client'
import * as typertRegistry from '@reevo/dsh-typert-registry/client'
import * as liveshare from '../src/client/index.ts'

/** One module-table row: the entry id the Loader creates, and that plugin's client exports. */
export interface ViewerPageRosterRow {
  readonly id: string
  readonly exports: Readonly<Record<string, unknown>>
}

/** Entry id of the module-system bootstrap whose exports the facade hands to the module system. */
export const VIEWER_PAGE_BOOTSTRAP_ID = '@reevo/dsh-client-modules'

/** The viewer page roster; Cordis composes these entries by service injection, so order is irrelevant. */
export const VIEWER_PAGE_ROSTER: readonly ViewerPageRosterRow[] = [
  { id: '@reevo/dsh-typert-registry', exports: typertRegistry },
  { id: '@reevo/dsh-experimental-liveshare', exports: liveshare },
  { id: VIEWER_PAGE_BOOTSTRAP_ID, exports: clientModules },
  { id: '@reevo/dsh-client-connection', exports: clientConnection },
  { id: '@reevo/dsh-api-gateway', exports: apiGateway },
  { id: '@reevo/dsh-api-remote-access', exports: apiRemoteAccess },
  { id: '@reevo/dsh-api-remotes', exports: apiRemotes },
  { id: '@reevo/dsh-api-session-controller', exports: apiSessionController },
  { id: '@reevo/dsh-api-workspace-controller', exports: apiWorkspaceController },
  { id: '@reevo/dsh-client-file-upload', exports: clientFileUpload },
  { id: '@reevo/dsh-client-locale', exports: clientLocale },
  { id: '@reevo/dsh-client-resources', exports: clientResources },
  { id: '@reevo/dsh-client-shortcuts', exports: clientShortcuts },
  { id: '@reevo/dsh-client-ui-renderer', exports: uiRenderer },
  { id: '@reevo/dsh-client-ui-theme', exports: uiTheme },
  { id: '@reevo/dsh-client-ui-settings', exports: uiSettings },
  { id: '@reevo/dsh-client-ui-layout', exports: uiLayout },
  { id: '@reevo/dsh-client-ui-session', exports: uiSession },
  { id: '@reevo/dsh-client-ui-session-status', exports: uiSessionStatus },
  { id: '@reevo/dsh-client-ui-sidebar', exports: uiSidebar },
  { id: '@reevo/dsh-client-ui-conversation', exports: uiConversation },
  { id: '@reevo/dsh-client-ui-chat', exports: uiChat },
  { id: '@reevo/dsh-client-ui-context-menu', exports: uiContextMenu },
  { id: '@reevo/dsh-client-ui-tool', exports: uiTool },
  { id: '@reevo/dsh-client-ui-attachment', exports: uiAttachment },
  { id: '@reevo/dsh-client-ui-file-drag', exports: uiFileDrag },
  { id: '@reevo/dsh-client-ui-sidebar-right', exports: uiSidebarRight },
  { id: '@reevo/dsh-client-ui-trajectory', exports: uiTrajectory },
  { id: '@reevo/dsh-client-ui-deliverables', exports: uiDeliverables },
  { id: '@reevo/dsh-client-ui-workspace', exports: uiWorkspace },
]
