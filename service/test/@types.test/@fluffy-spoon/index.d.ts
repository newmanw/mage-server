import { Argument } from '@fluffy-spoon/substitute/dist/src/Arguments';

declare module '@fluffy-spoon/substitute' {
  namespace Arg {
    function deepEquals<T>(x: T): Argument<T> & T
  }
}