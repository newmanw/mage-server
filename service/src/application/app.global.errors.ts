export enum MageErrorCode {
  PermissionDenied = 'permission_denied',
  InvalidInput = 'invalid_input',
}

export class MageError extends Error {

  constructor(public readonly code: MageErrorCode, message?: string) {
    super(message || code)
  }
}