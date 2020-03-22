
import { PluginDescriptor } from "../entities/plugins.entities";


export interface PluginRepository {
  findAll(): Promise<PluginDescriptor[]>
  findById(id: string): Promise<PluginDescriptor>
  update(attrs: Partial<PluginDescriptor>): Promise<PluginDescriptor>
}

export class PluginFunctions {

  readonly repo: PluginRepository

  constructor(repo: PluginRepository) {
    this.repo = repo;
  }

  async listPlugins(): Promise<PluginDescriptor[]> {
    return await this.repo.findAll();
  }

  async getPlugin(pluginId: string): Promise<PluginDescriptor> {
    throw new Error('unimplemented');
  }

  async enablePlugin(pluginId: string): Promise<PluginDescriptor> {
    throw new Error('unimplemented');
  }

  async disablePlugin(pluginId: string): Promise<PluginDescriptor> {
    throw new Error('unimplemented');
  }
};