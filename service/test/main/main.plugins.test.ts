
import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as plugins from '../../lib/main.impl/main.impl.plugins'
import { Arg, Substitute as Sub, SubstituteOf } from '@fluffy-spoon/substitute'
import { InitPluginHook, InjectionToken } from '../../src/plugins.api'
import express, { Router } from 'express'

interface Service1 {}
interface Service2 {}
const Service1Token: InjectionToken<Service1> = Symbol('service1')
const Service2Token: InjectionToken<Service2> = Symbol('service2')
class Service1Impl implements Service1 {}
class Service2Impl implements Service2 {}
const serviceMap = new Map([[ Service1Token, new Service1Impl() ], [ Service2Token, new Service2Impl() ]])
const injectService: plugins.InjectableServices = (token: any) => serviceMap.get(token) as any
const pluginRoutes = (pluginId: string, routes: Router) => {}

interface InjectServiceHandle {
  injectService: typeof injectService
}

interface PluginRoutesHandle {
  pluginRoutes: typeof pluginRoutes
}

describe.only('loading plugins', function() {

  let mockInjectService: SubstituteOf<InjectServiceHandle>
  let mockPluginRoutes: SubstituteOf<PluginRoutesHandle>

  beforeEach(function() {
    mockInjectService = Sub.for<InjectServiceHandle>()
    mockPluginRoutes = Sub.for<PluginRoutesHandle>()
  })

  it('runs the init hook with requested injected serivces', async function() {

    const pluginId = '@testing/test1'
    const injectRequest = {
      service1: Service1Token,
      service2: Service2Token
    }
    let injected: any = null
    const initPlugin: InitPluginHook<typeof injectRequest> = async (services) => {
      injected = services
      return {}
    }
    initPlugin.inject = injectRequest
    await plugins.integratePluginHooks(pluginId, initPlugin, injectService, pluginRoutes)

    expect(injected).to.have.property('service1').instanceOf(Service1Impl)
    expect(injected).to.have.property('service2').instanceOf(Service2Impl)
  })

  it('adds web routes for plugin when provided', async function() {

    const pluginId = '@testing/test2'
    const injectRequest = {
      service1: Service1Token,
      service2: Service2Token
    }
    const routes = express.Router()
    let injected: any = null
    const initPlugin: InitPluginHook<typeof injectRequest> = async (services) => {
      injected = services
      return {
        webRoutes: routes
      }
    }
    initPlugin.inject = injectRequest
    mockPluginRoutes.pluginRoutes(Arg.all()).mimicks(pluginRoutes)
    await plugins.integratePluginHooks(pluginId, initPlugin, injectService, mockPluginRoutes.pluginRoutes)

    mockPluginRoutes.received(1).pluginRoutes(Arg.all())
    mockPluginRoutes.received(1).pluginRoutes(pluginId, routes)
  })
})