
export enum PluginState {
  Inactive = 'inactive',
  Starting = 'starting',
  Configuring = 'configuring',
  Active = 'active',
  Stopping = 'stopping',
  Error = 'error'
}

export type PluginStateChange = {
  state: PluginState
  fromState: PluginState | null
  timestamp: Date
  message: string
  data?: any
}

export interface PluginModule {
  start(settings: object): Promise<PluginStateChange>
  stop(): Promise<PluginStateChange>
  applySettings(settings: object): Promise<this>
  checkState(): Promise<PluginStateChange>
}

export interface PluginDescriptorAttrs {
  /**
   * The plugin ID is the name of the plugin's Node module that the app
   * will load.
   */
  id: string
  version: string | null
  /**
   * The title is a short name suitable to display on a list item or tab.
   */
  title: string
  /**
   * The summary should be one or two lines of text that describes the purpose
   * of the plugin.
   */
  summary: string | null
  /**
   * When a plugin is enabled, MAGE will attempt to start the plugin at boot.
   * Enabled does not reflect the current status of the plugin, which could be
   * an error state if the plugin did not start correctly or encountered some
   * unrecoverable runtime failure that caused termination.
   */
  enabled: boolean
  /**
   * The state log is a capped list of state changes for a plugin in descending
   * order of timestamp, that is, the first element of the list is the latest
   * state change, and therefore refects the most current state.
   */
  stateLog: PluginStateChange[]
  settingsSchema: object | null
  settings: object
}

export class PluginDescriptor implements PluginDescriptorAttrs {

  id: string
  version: string | null
  title: string
  summary: string | null
  enabled: boolean
  stateLog: PluginStateChange[] = []
  settingsSchema: object | null = null
  settings: object = {}

  constructor(attrs: PluginDescriptorAttrs) {
    this.id = attrs.id
    this.version = attrs.version || null
    this.title = attrs.title
    this.summary = attrs.summary || null
    this.enabled = attrs.enabled
    this.stateLog = attrs.stateLog
    this.settingsSchema = attrs.settingsSchema
    this.settings = attrs.settings
  }

  getStatus(): PluginStateChange {
    return this.stateLog[0]
  }
}
