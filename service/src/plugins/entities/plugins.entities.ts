
export interface PluginDescriptor {
  /**
   * The plugin ID is the module name of the physical directory in the plugins
   * directory where the plugin code resides.
   */
  id: string
  version: number
  /**
   * The title is a short name suitable to display on a list item or tab.
   */
  title: string
  /**
   * The summary should be one or two lines of text that describes the purpose
   * of the plugin.
   */
  summary: string | null
  iconClass: string | null
  iconPath: string | null
  providesMigrations: boolean
  providesUi: boolean
  enabled: boolean
}