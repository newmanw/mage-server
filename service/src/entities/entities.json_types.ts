
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

export { JSONSchema4 } from 'json-schema'

import { JSONSchema4 } from 'json-schema'

export interface JsonValidator {
  validate(instance: Json): Promise<null | Error>
}

export interface JsonSchemaService {
  /**
   * Validate the given JSON Schema and resolve an object that is essentially
   * a compiled, cacheable version of the schema that can validate JSON
   * instances.
   * @param schema the JSON Schema to validate and compile
   */
  validateSchema(schema: JSONSchema4): Promise<JsonValidator>
}
