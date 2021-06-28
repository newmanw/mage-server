import { Feature, Point } from 'geojson'
import { FeedId } from '../feeds/entities.feeds'
import { Team, TeamId } from '../teams/entities.teams'
import {  User } from '../users/entities.users'

export type MageEventId = number

export interface MageEvent {
  id: MageEventId
  name: string
  description?: string
  complete?: boolean
  teamIds?: TeamId[]
  teams?: Team[]
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
export type EventRolePermissions = { [role in EventRole]: EventPermission[] }
export type EventRole =  'OWNER' | 'MANAGER' | 'GUEST'

export const EventRolePermissions: EventRolePermissions = {
  OWNER: ['read', 'update', 'delete'],
  MANAGER: ['read', 'update'],
  GUEST: ['read'],
};

export function rolesWithPermission(permission: EventPermission): EventRole[] {
  const roles: EventRole[] = []
  for (const key in EventRolePermissions) {
    if (EventRolePermissions[key as EventRole].indexOf(permission) !== -1) {
      roles.push(key as EventRole)
    }
  }
  return roles
}

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
  findAllByIds(ids: MageEventId[]): Promise<{ [id: number]: MageEvent | null }>
  findEventsWithFeed(feed: FeedId): Promise<MageEvent[]>
  /**
   * Add a reference to the given feed ID on the given event.
   * @param event an Event ID
   * @param feed a Feed ID
   */
  addFeedsToEvent(event: MageEventId, ...feeds: FeedId[]): Promise<MageEvent | null>
  findTeamsInEvent(event: MageEventId): Promise<Team[] | null>
  removeFeedsFromEvent(event: MageEventId, ...feeds: FeedId[]): Promise<MageEvent | null>
  /**
   * Remove the given feeds from any events that reference the feed.  Return the
   * count of events the operation modified.
   * @param feed the ID of the feed to remove from event
   */
  removeFeedsFromEvents(...feed: FeedId[]): Promise<number>
}

export interface Observation {

}

export interface UserLocation extends Feature<Point> {
  properties: Feature['properties'] & {
    timestamp: Date
  }
  // TODO: evaluate the rest of the properties for locations including
  // teamIds and deviceId
}

export interface MageEventsPluginHooks {
  mageEvent?: {
    /**
     * MAGE calls this hook after persisting a user's reported location.
     *
     * TODO: Evaluate whether this goes here to associate with MAGE events
     * along with observations or somewhere else.  The reason for this
     * placement intially is that user locations and observations only exist in
     * the context of an event.
     */
    onUserLocations?: (locations: UserLocation[], user: User, event: MageEvent) => any
    /**
     * MAGE calls this hook after persisting a valid observation, new or
     * updated.
     *
     * TODO: make it so
     */
    // onObservation?: (event: MageEvent, observation: Observation) => any
  }
}
