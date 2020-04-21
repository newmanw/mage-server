/**
 * An AdapterDescriptor represents a type of data source and the translation
 * from that data source type's data to data that MAGE can understand, and vice
 * versa.
 */
export interface AdapterDescriptor {
  id?: string
  title: string
  description: string
  isReadable: boolean
  isWritable: boolean
  modulePath: string
}

/**
 * A SourceDescriptor represents an actual data endpoint whose data a
 * corresponding [[AdapterDescriptor|adapter]] can retrieve and transform.
 */
export interface SourceDescriptor {
  id?: string
  adapter: string | AdapterDescriptor
  title: string
  description: string
  isReadable: boolean
  isWritable: boolean
  url: string
}