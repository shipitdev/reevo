/** CUA's public types distinguish object consumers from its generated permission transport. */
import { expect, expectTypeOf, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import * as Cua from '../src/index.ts'
import type { CuaActionSchema, CuaApi, CuaSurface } from '@reevo/dsh-cua/api'
import type { JsonSchemaNode, ObjectJsonSchema } from '@reevo/dsh-tools'
import type { CuaApplicationState, CuaSystemPermissionState } from '@reevo/dsh-cua/types'
// @ts-expect-error Permission payloads are not part of the platform-provider root entry.
import type { CuaSystemPermissionState as RemovedRoot } from '@reevo/dsh-cua'
// @ts-expect-error The object API does not expose permission-page state.
import type { CuaSystemPermissionState as RemovedApi } from '@reevo/dsh-cua/api'
// @ts-expect-error Object interfaces use /api; /types is the generated Remote type entry.
import type { CuaApi as RemovedTypes } from '@reevo/dsh-cua/types'
// @ts-expect-error The nested grant structure is internal, not an independently exported type.
import type { CuaApplicationGrant as RemovedGrant } from '@reevo/dsh-cua/types'

it('keeps application operations and the necessary Remote payload types available', () => {
  expectTypeOf<CuaApi>().toHaveProperty('getApp')
  expectTypeOf<CuaApplicationState>().toHaveProperty('allowedApps')
  expectTypeOf<[RemovedRoot, RemovedApi, RemovedTypes, RemovedGrant]>().toBeArray()
})

it('exposes action schemas as shared recursive JSON Schema types', () => {
  expectTypeOf<CuaActionSchema>().toEqualTypeOf<ObjectJsonSchema>()
  expectTypeOf<Awaited<ReturnType<CuaSurface['getActionSchema']>>>().toEqualTypeOf<ObjectJsonSchema>()
  expectTypeOf<NonNullable<CuaActionSchema['properties']>[string]>().toEqualTypeOf<JsonSchemaNode>()
  expectTypeOf<NonNullable<JsonSchemaNode['oneOf']>[number]>().toEqualTypeOf<JsonSchemaNode>()
})

it('requires process IDs only on macOS permission diagnostics', () => {
  type Mac = Extract<CuaSystemPermissionState, { platform: 'darwin' }>
  type Windows = Extract<CuaSystemPermissionState, { platform: 'windows' }>
  expectTypeOf<Mac['helper']['pid']>().toEqualTypeOf<number>()
  expectTypeOf<Mac['parent']['pid']>().toEqualTypeOf<number>()
  expectTypeOf<Windows['helper']>().not.toHaveProperty('pid')
})

it('mounts the Host marker without installing native or browser services', async () => {
  const ctx = new Context()
  try {
    await ctx.plugin(Cua)
    expect(ctx.get('cuaAccess')).toBeUndefined()
    expect(ctx.get('computerUse')).toBeUndefined()
  } finally { await ctx.fiber.dispose() }
})
