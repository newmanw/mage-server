
import { PluginDescriptor } from "../entities/plugins.entities"

export interface PluginRepository {
  readAll(): Promise<PluginDescriptor[]>
  findById(pluginId: string): Promise<PluginDescriptor | null>
  savePluginSettings(pluginId: string, settings: object): Promise<PluginDescriptor>
}