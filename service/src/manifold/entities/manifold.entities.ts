
import * as OgcApiFeatures from '../../ogcapi-features/entities/ogcapi-features.entities'

/**
 * An AdapterDescriptor represents a type of data source and the translation
 * from that data source type's data to data that MAGE can understand, and vice
 * versa.
 */
export interface AdapterDescriptor {
  id: string
  title: string
  summary: string | null
  isReadable: boolean
  isWritable: boolean
}

/**
 * A SourceDescriptor represents an actual data endpoint whose data a
 * corresponding [[AdapterDescriptor | adapter]] can retrieve and transform.
 */
export interface SourceDescriptor {
  id: string
  adapter: string | AdapterDescriptor
  title: string
  summary: string | null
  isReadable: boolean
  isWritable: boolean
  url: string
}

/**
 * The ManifoldDescriptor contains all the currently available adapters and
 * configured sources, each keyed by their IDs.
 */
export class ManifoldDescriptor {

  readonly adapters: Map<string, AdapterDescriptor> = new Map()
  readonly sources: Map<string, SourceDescriptor> = new Map()

  constructor(adapters: AdapterDescriptor[], sources: SourceDescriptor[]) {
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SourceConnection extends OgcApiFeatures.ServiceAdapter {

}

export interface ManifoldAdapter {

  connectTo(source: SourceDescriptor): Promise<SourceConnection>
}

export interface ManifoldPlugin {

  createAdapter(): Promise<ManifoldAdapter>
}

export class ManifoldManager {
  async getAdapterForSource(source: SourceDescriptor): Promise<ManifoldAdapter> {
    throw new Error('unimplemented')
  }
}
