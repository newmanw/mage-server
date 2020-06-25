import nock from 'nock'
import * as MSI from './nga-msi'
import * as ASAM from './topics/asam'
import { FeedsError, ErrInvalidServiceConfig } from '@ngageoint/mage.service/lib/entities/feeds/entities.feeds'

// type QueryStringMatcher = (query: any) => boolean

// const oneMonth = 1000 * 60 * 60 * 24 * 28

// function queryStringConditions(...conditions: QueryStringMatcher[]): QueryStringMatcher {
//   return (query: any): boolean => {
//     for (const c of conditions) {
//       if (!c(query)) {
//         return false
//       }
//     }
//     return true
//   }
// }

// function queryHasOutputAndSort(query: any): boolean {
//   return query.output === 'json' && query.sort === 'date'
// }

// function asamDateQueryCloseTo(start: number | null, until?: number): (query: any) => boolean
// function asamDateQueryCloseTo(start: number | null, until: number | null, tolerance: number): (query: any) => boolean
// function asamDateQueryCloseTo(...range: [(number | null)?, (number | null)?, (number)?]): ((query: any) => boolean) {
//   const [ from, until = Date.now(), tolerance = 1000 * 60 * 60 * 24 ] = range
//   return (function (query: any): boolean {
//     const queryKeys = Object.keys(query)
//     const queryFrom  = query[NgaMsi.AsamQueryParams.dateMin] as string
//     const queryTo = query[NgaMsi.AsamQueryParams.dateMax] as string
//     const queryFromDate = Date.parse(queryFrom)
//     const queryToDate = Date.parse(queryTo)
//     const closeToFrom = from ? Math.abs(from - queryFromDate) < tolerance : !queryKeys.includes(NgaMsi.AsamQueryParams.dateMin)
//     const closeToTo = until ? Math.abs(until - queryToDate) < tolerance : !queryKeys.includes(NgaMsi.AsamQueryParams.dateMax)
//     return closeToFrom && closeToTo
//   })
// }

describe('msi connection', function() {

  const msi = new MSI.MsiServiceType()

  it('validates the service config is a string', async function() {

    let err = await msi.validateServiceConfig({ url: 'invalid' })
    expect(err).toBeInstanceOf(FeedsError)
    expect(err?.code).toEqual(ErrInvalidServiceConfig)

    err = await msi.validateServiceConfig('a string')
    expect(err).toBeNull()
  })

  it('lists the msi topics', async function() {

    const msi = new MSI.MsiServiceType()
    const conn = msi.createConnection('http://test.msi')
    const topics = await conn.fetchAvailableTopics()

    expect(topics).toEqual([
      ASAM.topic
    ])
  })
})
