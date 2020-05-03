export enum MageErrorCode {
  PermissionDenied = 'permission_denied'
}

export class MageError extends Error {

  constructor(public readonly code: MageErrorCode, public readonly data?: any, message?: string) {
    super(message || code)
  }
}