
export enum MageErrorCode {
  PermissionDenied = 'permission_denied',
  InvalidInput = 'invalid_input',
  EntityNotFound = 'entity_not_found',
  /**
   * There is some error in the state of the app, like a configuration problem.
   */
  InternalError = 'internal_error',
}

export class MageError extends Error {

  constructor(public readonly code: MageErrorCode, message?: string) {
    super(code + (message ? `: ${message}` : ''))
  }
}

export class EntityNotFoundError extends MageError {

  constructor(readonly entityType: string, readonly entityId: any) {
    super(MageErrorCode.EntityNotFound, `${entityType} entity not found: ${entityId}`)
  }
}