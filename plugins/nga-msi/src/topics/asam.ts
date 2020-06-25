import { FeedTopic } from '@ngageoint/mage.service/lib/entities/feeds/entities.feeds'
import { Feature } from 'geojson'

export const topic: FeedTopic = {
  id: 'asam',
  title: 'ASAMs',
  summary: 'Anti-Shipping Acitivty Messages (ASAMs) include the locations and descriptive accounts of specific hostile acts against ships and mariners and may be useful for recognition, prevention and avoidance of potential hostile activity.',
  constantParamsSchema: null,
  variableParamsSchema: null,
  itemsHaveIdentity: true,
  updateFrequency: { seconds: 60 * 15 }
}

export enum AsamQueryParams {
  dateMin = 'minOccurDate',
  dateMax = 'maxOccurDate',
  id = 'reference',
  navArea = 'navArea',
  subregion = 'subreg',
  orderBy = 'sort',
  responseType = 'output',
}

export type AsamResponse = {
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
type Asam = {
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

function geoJsonFromAsam(x: Asam): Feature {
  const feature: Feature = {
    type: 'Feature',
    id: x.reference,
    properties: x,
    geometry: {
      type: 'Point',
      coordinates: [ x.longitude, x.latitude ]
    }
  }
  return feature;
}
