/**
 * `Descriptor` is a simple interface that marks child interfaces as a
 * descriptor whose purpose is essentially a data transfer object that service
 * clients consume.  The interface provides one property, `descriptorOf`.
 * The `descriptorOf` property helps to identify the domain type the
 * descriptor represents.  This can be helpful because JSON documents may not
 * be immediately distinguishable in the wiled.  Child interfaces should
 * override the property to be a constant string value, e.g.,
 * ```
 * interface UserDescriptor extends Descriptor {
 *   descriptorOf: 'mage.User',
 *   userName: string,
 *   // ... more user properties suitable for the client
 * }
 * ```
 */
export interface Descriptor<T extends string> {
  descriptorOf: T
}
