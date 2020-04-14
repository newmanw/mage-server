
import { PluginDescriptor } from "../entities/plugins.entities"

export interface PluginRepository {
  readAll(): Promise<PluginDescriptor[]>
  findById(id: string): Promise<PluginDescriptor | null>
  update(attrs: Partial<PluginDescriptor>): Promise<PluginDescriptor>
}