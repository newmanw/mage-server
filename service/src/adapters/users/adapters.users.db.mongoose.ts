import { User, UserId, UserRepository } from '../../entities/users/entities.users'
import { BaseMongooseRepository } from '../base/adapters.base.db.mongoose'
import * as legacy from '../../models/user'
import mongoose from 'mongoose'

export const MageUserModelName = 'User'

export type MageUserDocument = legacy.UserDocument
export type MageUserModel = mongoose.Model<MageUserDocument>
export const MageEventSchema = legacy.Model.schema

export class MongooseUserRepository extends BaseMongooseRepository<MageUserDocument, MageUserModel, User> implements UserRepository {

  async create(): Promise<User> {
    throw new Error('method not allowed')
  }

  async update(attrs: Partial<User> & { id: UserId }): Promise<User | null> {
    throw new Error('method not allowed')
  }

  async removeById(id: any): Promise<User | null> {
    throw new Error('method not allowed')
  }
}