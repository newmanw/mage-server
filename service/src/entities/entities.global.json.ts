
export type Json =
  | JsonPrimitive
  | JsonObject
  | Json[]

export type JsonObject = { [prop: string]: Json | undefined }

export type JsonPrimitive =
  | null
  | boolean
  | number
  | string

// sourced from https://github.com/microsoft/TypeScript/issues/1897#issuecomment-580962081
export type JsonCompatible<T> = {
  [P in keyof T]: T[P] extends Json
    ? T[P]
    : Pick<T, P> extends Required<Pick<T, P>>
    ? never
    : T[P] extends (() => any) | undefined
    ? never
    : JsonCompatible<T[P]>;
};

export { JSONSchema6 as JSONSchema6 } from 'json-schema'
