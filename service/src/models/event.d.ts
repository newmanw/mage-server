import mongoose, { DocumentToObjectOptions } from 'mongoose'
import { FeedId } from '../entities/feeds/entities.feeds'
import { UserDocument } from './user'


export type MageEventId = number

export interface MageEventDocumentAttrs {
  _id: MageEventId
  id: MageEventId
  name: string
  description?: string
  complete?: boolean
  collectionName: string
  teamIds: mongoose.Types.ObjectId[]
  layerIds: mongoose.Types.ObjectId[]
  feedIds: FeedId[]
  forms: FormDocument[]
  style: Style
  acl: Acl
}

export type MageEventCreateAttrs = Pick<MageEventDocumentAttrs, 'name' | 'description'>

export interface MageEventDocumentToObjectOptions extends DocumentToObjectOptions {
  access: { user: UserDocument, permission: EventPermission }
  projection: any
}
export type MageEventDocument = MageEventDocumentAttrs & mongoose.Document & {
  toObject(options?: MageEventDocumentToObjectOptions): any
}

export interface FormDocument extends mongoose.Document {
  _id: number,
  name: string,
  color: string,
}

export interface Style {
  /**
   * Hex RGB string beginning with '#'
   */
  fill?: string,
  /**
   * Hex RGB string beginning with '#'
   */
  stroke?: string,
  /**
   * Number between 0 and 1
   */
  fillOpacity?: number,
  strokeOpacity?: number,
  strokeWidth?: number,
}

export type RoleName = string

/**
 * The ACL (access control list) structure is a dictionary whose keys are
 * user IDs, and corresponding values are the role names that define the
 * permissions the user ID has on the event.
 */
export interface Acl {
  [userId: string]: RoleName
}

export type EventPermission = 'read' | 'update' | 'delete'
export type EventRolePermissions = {
  OWNER: EventPermission[],
  MANAGER: EventPermission[],
  GUEST: EventPermission[]
}
export type EventRole = keyof EventRolePermissions

export type TODO = any
export type Permission = 'read' | 'update' | 'delete'
export type Callback<Result = unknown> = (err: Error | null, result?: Result) => void

export declare function count(options: TODO, callback: Callback<number>): void
export declare function getEvents(options: TODO, callback: Callback<MageEventDocument[]>): void
export declare function getById(id: MageEventId, options: TODO, callback: Callback<MageEventDocument | null>): void
export declare function filterEventsByUserId(events: MageEventDocument[], userId: string, callback: Callback<MageEventDocument[]>): void
export declare function userHasEventPermission(event: MageEventDocument, userId: string, permission: EventPermission, callback: Callback<boolean>): void
export declare function create(event: MageEventCreateAttrs, user: Partial<UserDocument> & Pick<UserDocument, '_id'>, callback: Callback<MageEventDocument>): void
export declare function addLayer(event: MageEventDocument, layer: any, callback: Callback<MageEventDocument>): void
export declare function removeLayer(event: MageEventDocument, layer: { id: any }, callback: Callback<MageEventDocument>): void
export declare function getUsers(eventId: MageEventId, callback: Callback<UserDocument[]>): void
export declare function addTeam(event: MageEventDocument, team: any, callback: Callback<MageEventDocument>): void
export declare function getTeams(eventId: MageEventId, options: { populate: string[] | null }, callback: Callback): void
export declare function removeTeam(event: MageEventDocument, team: any, callback: Callback<MageEventDocument>): void
export declare function updateUserInAcl(eventId: MageEventId, userId: string, role: string, callback: Callback<MageEventDocument>): void
export declare function removeUserFromAcl(eventId: MageEventId, userId: string, callback: Callback<MageEventDocument>): void

export declare const Model: mongoose.Model<MageEventDocument>