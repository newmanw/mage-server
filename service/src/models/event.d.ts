import mongoose, { DocumentToObjectOptions } from 'mongoose'
import { UserDocument } from './user'
import { MageEventId, MageEvent, MageEventCreateAttrs, EventPermission, Form, MageEventJson, FormFieldChoice, FormField } from '../entities/events/entities.events'

export interface MageEventDocumentToObjectOptions extends DocumentToObjectOptions {
  access: { user: UserDocument, permission: EventPermission }
  projection: any
}

export type MageEventDocument = Omit<MageEvent, 'teamIds' | 'layerIds'> & mongoose.Document & {
  teamIds: mongoose.Types.ObjectId[]
  layerIds: mongoose.Types.ObjectId[]
  toObject(options?: MageEventDocumentToObjectOptions): any
  toJSON(options: DocumentToObjectOptions): MageEventJson
}

export type FormDocument = Form & mongoose.Document & {
  _id: number,
}
export type FormFieldDocument = FormField & mongoose.Document & {
  _id: never
}
export type FormFieldChoiceDocument = FormFieldChoice & mongoose.Document & {
  _id: never
}

export type TODO = any
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