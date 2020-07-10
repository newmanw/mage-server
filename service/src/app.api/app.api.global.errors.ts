
export const ErrPermissionDenied = Symbol.for('err.permission_denied')
export const ErrInvalidInput = Symbol.for('err.invalid_input')
export const ErrEntityNotFound = Symbol.for('err.entity_not_found')

export type PermissionDeniedError = MageError<typeof ErrPermissionDenied, PermissionDeniedErrorData>
export type InvalidInputError = MageError<typeof ErrInvalidInput, InvalidInputErrorData>
export type EntityNotFoundError = MageError<typeof ErrEntityNotFound, EntityNotFoundErrorData>

export class MageError<Code extends symbol, Data = null> extends Error {
  constructor(public readonly code: Code, readonly data: Data, message?: string) {
    super(message ? message : Symbol.keyFor(code))
  }
}

export interface PermissionDeniedErrorData {
  subject: string
  permission: string
  object: string | null
}

export interface EntityNotFoundErrorData {
  readonly entityType: string
  readonly entityId: any
}

/**
 * The keys are the properties on the input that have invalid values.  The
 * values are descriptions of why the value for the key is invalid.
 */
export type InvalidInputErrorData = Map<string, string>

export function permissionDenied(permission: string, subject: string, object?: string): PermissionDeniedError {
  const message = `${subject} does not have permission ${permission}` + object ? ` on ${object}` : ''
  return new MageError(ErrPermissionDenied, { permission, subject, object: object || null }, message)
}

export function entityNotFound(entityId: any, entityType: string): EntityNotFoundError {
  return new MageError(ErrEntityNotFound, { entityId, entityType }, `${entityType} not found: ${entityId}`)
}

export function invalidInput(summary?: string, ...invalidKeys: [string, string][]): InvalidInputError {
  let message = summary || 'invalid input'
  message = invalidKeys.reduce((message, invalidKey) => {
    return message + `\n  ${invalidKey[0]}: ${invalidKey[1]}`
  }, message)
  const data = new Map(invalidKeys)
  return new MageError(ErrInvalidInput, data, message)
}