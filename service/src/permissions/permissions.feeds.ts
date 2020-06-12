import { FeedsPermissionService } from '../app.api/feeds/app.api.feeds'
import { PermissionDeniedError } from '../app.api/app.api.global.errors';
import { AppRequestContext } from '../app.api/app.api.global';

export interface Role {
  name: string
  permissions: string[]
}

export interface PopulatedMageUser {
  id: string
  role: Role
}

export class FeedsPermissionServiceImpl implements FeedsPermissionService {

  ensureListServiceTypesPermissionFor(context: AppRequestContext<PopulatedMageUser>): Promise<PermissionDeniedError | null> {
    throw new Error('Method not implemented.');
  }

  ensureCreateServicePermissionFor(context: AppRequestContext<PopulatedMageUser>): Promise<PermissionDeniedError | null> {
    throw new Error('Method not implemented.');
  }

  ensureListTopicsPermissionFor(context: AppRequestContext<PopulatedMageUser>): Promise<PermissionDeniedError | null> {
    throw new Error('Method not implemented.');
  }

  ensureCreateFeedPermissionFor(context: AppRequestContext<PopulatedMageUser>): Promise<PermissionDeniedError | null> {
    throw new Error('Method not implemented.');
  }
}