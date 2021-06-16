import { InjectionToken } from '.'
import { MageEventRepository } from '../entities/events/entities.events'

export const MageEventRepositoryToken: InjectionToken<MageEventRepository> = Symbol('InjectMageEventRepository')