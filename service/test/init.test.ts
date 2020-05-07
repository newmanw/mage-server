
declare module 'mocha' {
  namespace Mocha {
    interface MochaOptions {}
  }
}


// import { MongoMemoryServer } from 'mongodb-memory-server';
// start the test mongodb server
// const server = new MongoMemoryServer({
//   autoStart: false,
//   instance: {
//     dbName: 'mage_test'
//   }
// });


import chai, { Assertion } from 'chai'
import asPromised from 'chai-as-promised'

declare global {
  namespace Chai {
    interface Eventually {
      rejectWith: PromisedThrow
    }
  }
}

before(function() {
  chai.use(asPromised)
  const assertionProto = Assertion.prototype as any
  const rejectedWith = assertionProto.rejectedWith as Function
  Assertion.addMethod('rejectWith', function(...args: any[]): any {
    return rejectedWith.apply(this, args)
  })
})