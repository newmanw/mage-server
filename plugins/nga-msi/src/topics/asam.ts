import { Feature } from 'geojson'
import { FeedTopic, FeedTopicContent } from '@ngageoint/mage.service/lib/entities/feeds/entities.feeds'
import { ParsedUrlQuery } from 'querystring'
import { MsiRequest, MsiResponse } from '../nga-msi'
import { JsonObject } from '@ngageoint/mage.service/lib/entities/entities.json_types'

export const topicDescriptor: FeedTopic = {
  id: 'asam',
  title: 'ASAMs',
  summary: 'Anti-Shipping Acitivty Messages (ASAMs) include the locations and descriptive accounts of specific hostile acts against ships and mariners and may be useful for recognition, prevention and avoidance of potential hostile activity.',
  paramsSchema: {
    type: 'object',
    properties: {
      newerThanDays: {
        type: 'number',
        default: 56
      }
    }
  },
  itemsHaveIdentity: true,
  itemsHaveSpatialDimension: true,
  itemPrimaryProperty: 'description',
  itemSecondaryProperty: 'hostilityVictim',
  itemTemporalProperty: 'timestamp',
  updateFrequencySeconds: 61 * 15,
  mapStyle: {
    // TODO: figure out dynamic url resolution
    iconUrl: 'https://mage-msi.geointservices.io/icons/asam.png'
  },
  itemPropertiesSchema: [
    {
      key: "date",
      schema: {
        title: "Date Of Occurrence",
        type: "string",
        format: 'date',
        pattern: "\d\d\d\d-\d\d-\d\d"
      }
    },
    {
      key: "reference",
      schema: {
        title: "Reference Number",
        type: "string"
      }
    },
    {
      key: "subreg",
      schema: {
        title: "Geographical Subregion",
        type: "number"
      }
    },
    {
      key: "description",
      schema: {
        title: "Description",
        type: "string"
      }
    },
    {
      key: "hostilityVictim",
      schema: {
        title: "Aggressor-Victim",
        type: "string"
      }
    },
    {
      key: "hostility",
      schema: {
        title: "Agressor",
        type: "string"
      }
    },
    {
      key: "victim",
      schema: {
        title: "Victim",
        type: "string"
      }
    },
    {
      key: "navArea",
      schema: {
        title: "Navigation Area",
        type: "string"
      }
    },
    {
      key: "position",
      schema: {
        title: "Position",
        type: "string",
        format: "latlondeg"
      }
    },
    {
      key: "timestamp",
      schema: {
        title: "Date Of Occurrence",
        type: "number",
        format: "date"
      }
    }
  ]

  /**
   * date: "2020-08-04"
description: "On 4 August, armed men in a speedboat fired upon and boarded a passenger boat transiting between Kula and Port Harcourt in the Rivers State Waterways in vicinity of 04:26N - 006:50E. The armed men stole the passenger belongings and departed the area. One passenger was injured during the incident."
hostility: null
latitude: 4.433333333552241
longitude: 6.833333333449957
navArea: "II"
position: "4°26'00"N ↵6°50'00"E"
reference: "2020-238"
subreg: "57"
timestamp: 1596499200000
victim: null
   */
    // type: 'array',
    // items: {
    //   type: 'object',
    //   "phone_numbers": [
    //     { "type": "cell", "number": "702-123-4567" },
    //     { "type": "work", "number": "702-987-6543" }
    //   ],
    //   mappedProperties: {
    //     type: "array",
    //     items: {
    //       type: "object",
    //       properties: {
    //         type: { "type": "string", "enum": [ "cell", "home", "work" ] },
    //         number: { "type": "string" }
    //       },
    //       required: [ "type", "number" ]
    //     }
    //   }
    // }
}

export interface AsamTopicParams {
  newerThanDays?: number
}

export interface AsamQueryParams extends ParsedUrlQuery {
  minOccurDate: string
  maxOccurDate: string
  reference?: string
  navArea?: string
  subreg?: string
  sort: 'date' | 'ref'
  output: 'json'
}

export interface AsamResponse extends JsonObject {
  asam: Asam[]
}

/**
 * An ASAM is an Anti-Shipping Activity Message.
 * Example ASAM:
 * ```
 * {
 *     "reference": "2019-77",
 *     "date": "2019-12-07",
 *     "latitude": -13.238064424964307,
 *     "longitude": -76.75069075407549,
 *     "position": "13°14'17.03\"S \n76°45'02.49\"W",
 *     "navArea": "XVI",
 *     "subreg": "22",
 *     "hostility": "Robbery",
 *     "victim": null,
 *     "description": "3 robbers boarded an anchored bulk carrier anchored in Callao. Robbers tied up a crewman and entered the forecastle storeroom. The crewman managed to escape and raised the alarm. Upon hearing the alarm, the robbers fled."
 * }
 */
interface Asam extends JsonObject {
  /**
   * This appears to be the unique identifier for ASAM records.
   */
  reference: string,
  date: string,
  latitude: number,
  longitude: number,
  /**
   * DMS Lat/Lon string
   */
  position: string,
  navArea: string,
  subreg: string,
  hostility?: string | null,
  victim?: string | null,
  description: string
}

const geoJsonFromAsam = (x: Asam): Feature => {
  const hostility = x.hostility || ''
  const victim = x.victim || ''
  const hostilityVictim = hostility && victim ? `${hostility} - ${victim}` : (hostility || victim)
  const feature: Feature = {
    type: 'Feature',
    id: x.reference,
    properties: { ...x, timestamp: Date.parse(x.date) },
    geometry: {
      type: 'Point',
      coordinates: [ x.longitude, x.latitude ]
    }
  }
  if (hostilityVictim) {
    feature.properties!.hostilityVictim = hostilityVictim
  }
  return feature;
}

const formatDateQueryParam = (x: Date): string => {
  const month = `${x.getUTCMonth() + 1}`.padStart(2, '0')
  const day = `${x.getUTCDate()}`.padStart(2, '0')
  return `${x.getUTCFullYear()}-${month}-${day}`
}

export const createContentRequest = (params?: AsamTopicParams): MsiRequest => {
  const newerThanDays = params?.newerThanDays ||
    topicDescriptor.paramsSchema?.properties?.newerThanDays.default as number
  const maxOccur = new Date()
  const minOccur = new Date(maxOccur.getTime() - newerThanDays * 24 * 60 * 60 * 1000)
  const queryParams: AsamQueryParams = {
    minOccurDate: formatDateQueryParam(minOccur),
    maxOccurDate: formatDateQueryParam(maxOccur),
    sort: 'date',
    output: 'json'
  }
  return {
    method: 'get',
    path: '/api/publications/asam',
    queryParams
  }
}

export const transformResponse = (res: MsiResponse, req: MsiRequest): FeedTopicContent => {
  const asamResponse = res.body as AsamResponse
  return {
    topic: topicDescriptor.id,
    items: {
      type: 'FeatureCollection',
      features: asamResponse.asam.map(geoJsonFromAsam)
    }
  }
}
