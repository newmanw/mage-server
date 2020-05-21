
import { PluginDescriptor, PluginModule } from "../entities/plugins.entities"

export interface PluginRepository {
  findAll(): Promise<PluginDescriptor[]>
  findById(pluginId: string): Promise<PluginDescriptor | null>
  savePluginSettings(pluginId: string, settings: object): Promise<PluginDescriptor>
}

export interface PluginManager {
  getPlugin(pluginId: string): Promise<PluginModule>
}