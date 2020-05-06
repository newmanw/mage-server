
export type Json =
  | JsonPrimitive
  | Json[]
  | { [prop: string]: Json }

export type JsonPrimitive =
  | null
  | boolean
  | number
  | string