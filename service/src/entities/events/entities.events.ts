import { FeedId } from '../feeds/entities.feeds'

export type MageEventId = number

export interface MageEvent {
  id: MageEventId
  feeds: FeedId[]
}

export interface MageEventRepository {
  findById(id: MageEventId): Promise<MageEvent | null>
  /**
   * Add a reference to the given feed ID on the given event.
   * @param event an Event ID
   * @param feed a Feed ID
   */
  addFeedToEvent(event: MageEventId, feed: FeedId): Promise<MageEvent | null>
}
