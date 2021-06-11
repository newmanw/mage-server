
export type MageUserId = string

export interface MageUser {
  id: MageUserId
  username: string
  displayName: string
  active: boolean
  enabled: boolean
  createdAt: Date
  lastUpdated: Date
  email?: string
  // TODO: the rest of the properties
}
