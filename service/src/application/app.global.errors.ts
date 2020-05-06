
export enum MageErrorCode {
  PermissionDenied = 'permission_denied',
  InvalidInput = 'invalid_input',
  EntityNotFound = 'entity_not_found',
}

export class MageError extends Error {

  constructor(public readonly code: MageErrorCode, message?: string) {
    super(message || code)
  }
}

export class EntityNotFoundError extends MageError {

  constructor(readonly entityType: string, readonly entityId: any) {
    super(MageErrorCode.EntityNotFound, `${entityType} entity not found: ${entityId}`)
  }
}