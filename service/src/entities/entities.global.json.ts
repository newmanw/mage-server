
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