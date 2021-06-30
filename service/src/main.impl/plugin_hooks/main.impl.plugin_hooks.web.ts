import { Router } from 'express'
import { WebRoutesHooks } from '../../plugins.api/plugins.api.web'


export async function loadWebRoutesHooks(moduleName: string, hooks: Partial<WebRoutesHooks>, activatePluginRoutes: (routes: Router) => void): Promise<void> {

}