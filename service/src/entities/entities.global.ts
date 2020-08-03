
export interface EntityIdFactory {
  nextId(): Promise<string>
}