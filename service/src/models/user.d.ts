import mongoose from 'mongoose'
import { RoleDocument, RoleJson } from './role'


export interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId
  id: string
  username: string
  displayName: string
  email?: string
  phones: Phone[]
  avatar: Avatar
  icon: Icon
  active: boolean
  enabled: boolean
  roleId: mongoose.Types.ObjectId | RoleDocument
  status?: string
  recentEventIds: number[]
  authentication: Authentication
}

export interface Phone {
  type: string,
  number: string
}

export interface Icon {
  type: IconType
  text: string
  color: string
  contentType?: string
  size?: number
  relativePath?: string
}

export enum IconType {
  None = 'none',
  Upload = 'upload',
  Create = 'create',
}

export interface Avatar {
  contentType?: string,
  size?: number,
  relativePath?: string
}

export interface Authentication {
  type?: string
  id?: string
  password?: string
  security: SecurityStatus
}

export interface SecurityStatus {
  locked: boolean
  lockedUntil: Date
  invalidLoginAttempts: number
  numberOfTimesLocked: number
}

export type UserJson = Omit<UserDocument, '_id' | 'avatar' | 'roleId' | keyof mongoose.Document> & {
  authentication: Omit<Authentication, 'password'>,
  icon: Omit<Icon, 'relativePath'>,
  avatarUrl?: string,
} & (RolePopulated | RoleReferenced)

export declare const Model: mongoose.Model<UserDocument>

type RoleReferenced = {
  roleId: string,
  role: never
}

type RolePopulated = {
  roleId: never,
  role: RoleJson
}


