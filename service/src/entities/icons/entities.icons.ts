import { Readable } from 'stream'

export interface StaticIconAttrs {
  id: StaticIconId
  imageType: 'raster' | 'vector'
  /**
   * Content type a standard [IANA media/MIME](https://www.iana.org/assignments/media-types/media-types.xhtml)
   * type strings, such as `image/jpeg`.
   */
  mediaType: string
  tags: string[]
  title?: string
  summary?: string
  /**
   * The icon's file name is the original file name of an uploaded icon, and/or
   * the default file name provided to download the icon.
   */
  fileName?: string
}

/**
 * The reason behind the 'static' qualifier of `StaticIcon` is to distinguish
 * that the icon image is not dynamically generated and so is subject to
 * caching.  Other types of icons, such as the [Joint Military Symbology](https://www.jcs.mil/Portals/36/Documents/Doctrine/Other_Pubs/ms_2525d.pdf)
 * may be dynamically generated based on the attributes of the
 */
export interface StaticIcon extends StaticIconAttrs {
  /**
   * If the icon is a vector image, this method just returns the base
   * representation because the client rendering the vector instructions
   * @param density
   */
  contentForDensity(density: DisplayDensity): Promise<NodeJS.ReadableStream>
}

export type StaticIconId = string

/**
 * This class and its constants are based on Android's Drawable [densities](https://developer.android.com/training/multiscreen/screendensities).
 */
export class DisplayDensity {

  static readonly Base = new DisplayDensity('base', 160)
  static readonly High = new DisplayDensity('high', 240)
  static readonly XHigh = new DisplayDensity('xhigh', 320)
  static readonly XXHigh = new DisplayDensity('xxhigh', 480)
  static readonly XXXHigh = new DisplayDensity('xxxhigh', 640)

  private constructor(readonly name: string, readonly pixelsPerInch: number) {}
}

export interface StaticIconRepository {
  create(attrs: Partial<StaticIconAttrs>): Promise<StaticIcon>
  findById(id: StaticIconId): Promise<StaticIcon>
  saveContent(id: StaticIconId, density: DisplayDensity, content: NodeJS.ReadableStream): Promise<boolean>
}