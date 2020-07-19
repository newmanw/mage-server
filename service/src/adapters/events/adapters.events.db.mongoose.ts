import { BaseMongooseRepository } from '../base/adapters.base.db.mongoose'
import { MageEventRepository, MageEvent, MageEventId } from '../../entities/events/entities.events'
import mongoose from 'mongoose'
import { FeedId } from '../../entities/feeds/entities.feeds'
import * as legacy from '../../models/event'


export const MageEventModelName = 'Event'

export type MageEventDocument = mongoose.Document & MageEvent
export type MageEventModel = mongoose.Model<MageEventDocument>
export const MageEventSchema = legacy.Model.schema

export class MongooseMageEventRepository extends BaseMongooseRepository<MageEventDocument, MageEventModel, MageEvent> implements MageEventRepository {
  async addFeedToEvent(event: MageEventId, feed: FeedId): Promise<MageEvent | null> {
    const updated = await this.model.findByIdAndUpdate(event, {
      $addToSet: {
        feedIds: feed
      }
    })
    return updated?.toJSON()
  }
}