
import { PluginDescriptor, Plugin } from "../entities/plugins.entities"
import { PluginRepository } from "./plugins.app.contracts"

export interface ListPluginsFn {
  (): Promise<PluginDescriptor[]>
}
export function ListPluginsFn(repo: PluginRepository): ListPluginsFn {
  return async function listPlugins(): ReturnType<ListPluginsFn> {
    return await repo.readAll()
  }
}

export interface GetPluginFn {
  (pluginId: string): Promise<PluginDescriptor | null>
}
export function GetPluginFn(repo: PluginRepository): GetPluginFn {
  return async function getPlugin(pluginId): ReturnType<GetPluginFn> {
    return await repo.findById(pluginId)
  }
}

export interface SavePluginSettingsFn {
  (pluginId: string, settings: object): Promise<PluginDescriptor>
}
export function SavePluginSettingsFn(repo: PluginRepository): SavePluginSettingsFn {
  return async function(pluginId: string, settings: object): ReturnType<SavePluginSettingsFn> {
    return await repo.savePluginSettings(pluginId, settings)
  }
}
