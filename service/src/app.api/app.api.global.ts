import { UserId } from '../entities/authn/entities.authn';

export interface AuthenticatedRequest  {
  user: UserId
}
