import { URL } from 'url'

export interface EntityIdFactory {
  nextId(): Promise<string>
}

/**
 * TODO: This class may belong somewhere else, but for now is here until things
 * evolve a bit more.
 */
export class PluginResourceUrl extends URL {

  static readonly pluginProtocol = 'mage-plugin:'

  constructor(readonly pluginModuleName: string, readonly resourcePath: string) {
    super(`${PluginResourceUrl.pluginProtocol}///${pluginModuleName}/${resourcePath}`)
  }
}

export interface PagingParameters {
  /**
   * The number of items to include in a page
   */
  pageSize: number
  /**
   * The zero-based page to return
   */
  pageIndex: number
  /**
   * If true, count the total number of results the non-paged query would
   * return, and include the count in the resulting page object.  If absent,
   * the paging mechanism should default the value to `true` if the requested
   * page index is `0`, and `false` otherwise.
   */
  includeTotalCount?: boolean
}

export interface PageOf<T> {
  totalCount: number | null
  pageSize: number
  pageIndex: number
  items: T[]
}

export const pageOf = <T>(items: T[], paging: PagingParameters, totalCount?: number | null): PageOf<T> => {
  return {
    totalCount: totalCount || null,
    pageSize: paging.pageSize,
    pageIndex: paging.pageIndex,
    items
  }
}