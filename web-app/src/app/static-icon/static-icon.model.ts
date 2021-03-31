
export interface StaticIcon {
  id: string
  sourceUrl: string
  contentPath: string
  title?: string
  summary?: string
  fileName?: string
  tags?: string[]
}

export interface RegisteredStaticIconReference {
  id: string
  sourceUrl?: never
}

export interface SourceUrlStaticIconReference {
  sourceUrl: string
  id?: never
}

export type StaticIconReference = RegisteredStaticIconReference | SourceUrlStaticIconReference
