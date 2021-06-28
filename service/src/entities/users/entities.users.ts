
export type UserId = string

export interface User {
  id: UserId
  username: string
  displayName: string
  active: boolean
  enabled: boolean
  createdAt: Date
  lastUpdated: Date
  email?: string
  // TODO: the rest of the properties
}

export interface UserRepository {
  findById(id: UserId): Promise<User | null>
  findAllByIds(ids: UserId[]): Promise<{ [id: string]: User | null }>
}