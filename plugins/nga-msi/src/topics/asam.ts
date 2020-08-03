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
  updateFrequency: { seconds: 60 * 15 }
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
    properties: { ...x },
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
  return `${x.getUTCFullYear()}-${x.getUTCMonth() + 1}-${x.getUTCDay()}`
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
