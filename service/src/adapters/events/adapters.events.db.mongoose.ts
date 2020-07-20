import { BaseMongooseRepository } from '../base/adapters.base.db.mongoose'
import { MageEventRepository, MageEvent, MageEventId } from '../../entities/events/entities.events'
import mongoose from 'mongoose'
import { FeedId } from '../../entities/feeds/entities.feeds'
import * as legacy from '../../models/event'


export const MageEventModelName = 'Event'

export type MageEventDocument = legacy.MageEventDocument
export type MageEventModel = mongoose.Model<legacy.MageEventDocument>
export const MageEventSchema = legacy.Model.schema

export class MongooseMageEventRepository extends BaseMongooseRepository<MageEventDocument, MageEventModel, MageEvent> implements MageEventRepository {

  async create(): Promise<MageEvent> {
    throw new Error('method not allowed')
  }

  async update(attrs: Partial<MageEvent> & { id: MageEventId }): Promise<MageEvent | null> {
    throw new Error('method not allowed')
  }

  async addFeedsToEvent(event: MageEventId, ...feeds: FeedId[]): Promise<MageEvent | null> {
    const updated = await this.model.findByIdAndUpdate(
      event,
      {
        $addToSet: {
          feedIds: { $each: feeds }
        }
      },
      { new: true })
    return updated?.toJSON()
  }
}