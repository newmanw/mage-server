
export type Json =
  | JsonPrimitive
  | JsonObject
  | Json[]

export type JsonObject = { [prop: string]: Json }

export type JsonPrimitive =
  | null
  | boolean
  | number
  | string

export type JsonPropertyNamesOf<T> = { [K in keyof T]: T[K] extends Json ? K : never }[keyof T]
export type JsonPropertiesOf<T> = Pick<T, JsonPropertyNamesOf<T>>