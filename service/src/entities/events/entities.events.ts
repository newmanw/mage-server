import { FeedId } from '../feeds/entities.feeds'

export type MageEventId = number

export interface MageEvent {
  id: MageEventId
  name: string
  description?: string
  complete?: boolean
  teamIds: string[]
  layerIds: string[]
  feedIds: FeedId[]
  forms: Form[]
  style: Style
  acl: Acl
}

export type FormId = number

export interface Form {
  id: FormId
  name: string
  description?: string
  fields: FormField[]
  primaryField?: string
  variantField?: string
  primaryFeedField?: string
  secondaryFeedField?: string
  /**
   * This is a list of references to fields that are dropdowns whose choices
   * are MAGE users' names.
   */
  userFields: string[]
  color: string
  style?: Style
  archived: boolean
}

export interface FormField {
  id: number,
  name: string,
  title: string,
  archived?: boolean,
  type: FormFieldType,
  required: boolean,
  value?: any,
  choices: FormFieldChoice[],
  min?: number,
  max?: number
}

export enum FormFieldType {
  Text = 'textfield',
  Numeric = 'numberfield',
  Email = 'email',
  Password = 'password',
  Radio = 'radio',
  Dropdown = 'dropdown',
  MultiSelectDropdown = 'multiselectdropdown',
  DateTime = 'date',
  Geometry = 'geometry',
  TextArea = 'textarea',
  CheckBox = 'checkbox',
  Hidden = 'hidden'
}

export interface FormFieldChoice {
  id: number,
  title: string,
  value: number,
  blank?: boolean
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

export type EventPermission = 'read' | 'update' | 'delete'
export type EventRolePermissions = {
  OWNER: EventPermission[],
  MANAGER: EventPermission[],
  GUEST: EventPermission[]
}
export type EventRole = keyof EventRolePermissions

/**
 * The ACL (access control list) structure is a dictionary whose keys are
 * user IDs, and corresponding values are the role names that define the
 * permissions the user ID has on the event.
 */
export interface Acl {
  [userId: string]: {
    role: EventRole
    permissions: EventPermission[]
  }
}

export type MageEventCreateAttrs = Pick<MageEvent, 'name' | 'description'>

export interface MageEventRepository {
  findById(id: MageEventId): Promise<MageEvent | null>
  /**
   * Add a reference to the given feed ID on the given event.
   * @param event an Event ID
   * @param feed a Feed ID
   */
  addFeedsToEvent(event: MageEventId, feed: FeedId): Promise<MageEvent | null>
}
