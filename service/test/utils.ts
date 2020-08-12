
import { Argument, Arg } from '@fluffy-spoon/substitute/dist/src/Arguments'
import deepEqual from 'deep-equal';
import { AppRequest } from '../lib/app.api/app.api.global'

Arg.deepEquals = <T>(expected: T): Argument<T> & T => {
  return new Argument<T>(`deeply equal to ${JSON.stringify(expected)}`, (x: T): boolean => deepEqual(x, expected)) as Argument<T> & T
}

Arg.requestTokenMatches = <T extends AppRequest>(expectedRequest: T): Argument<T> & T => {
  return new Argument<T>(`request token ${JSON.stringify(expectedRequest.context.requestToken)}`,
    (x: T): boolean => x.context.requestToken === expectedRequest.context.requestToken) as Argument<T> & T
}
