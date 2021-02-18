import { Feed, FeedTopic } from '../../../../feed/feed.model'

type RequiredKeys<T> = { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K }[keyof T];
type OptionalKeys<T> = { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? K : never }[keyof T];
type PickRequired<T> = Pick<T, RequiredKeys<T>>;
type PickOptional<T> = Pick<T, OptionalKeys<T>>;
type Nullable<T> = { [P in keyof T]: T[P] | null };
type NullableOptional<T> = PickRequired<T> & Nullable<PickOptional<T>>;

/**
 * TODO: account for mapStyle
 */
type FeedMetaDataKeys =
  | 'title'
  | 'summary'
  | 'icon'
  | 'itemsHaveIdentity'
  | 'itemsHaveSpatialDimension'
  | 'itemPrimaryProperty'
  | 'itemSecondaryProperty'
  | 'itemTemporalProperty'
  | 'updateFrequencySeconds'

export type FeedMetaData = Partial<Pick<Feed, FeedMetaDataKeys>>
export type FeedMetaDataNullable = Required<NullableOptional<FeedMetaData>>

/**
 * Return a new `FeedMetaData` from the given source object omitting keys that
 * are null or undefined in the source.
 * @param source another `FeedMetaData` object, `FeedTopic`, or `Feed`
 */
export const feedMetaDataLean = <T extends FeedMetaDataNullable | FeedMetaData>(source: T): FeedMetaData => {
  const metaData: FeedMetaData = { }
  source.title && (metaData.title = source.title)
  source.summary && (metaData.summary = source.summary)
  typeof source.itemsHaveIdentity === 'boolean' && (metaData.itemsHaveIdentity = source.itemsHaveIdentity)
  typeof source.itemsHaveSpatialDimension === 'boolean' && (metaData.itemsHaveSpatialDimension = source.itemsHaveSpatialDimension)
  source.itemPrimaryProperty && (metaData.itemPrimaryProperty = source.itemPrimaryProperty)
  source.itemSecondaryProperty && (metaData.itemSecondaryProperty = source.itemSecondaryProperty)
  source.itemTemporalProperty && (metaData.itemTemporalProperty = source.itemTemporalProperty)
  typeof source.updateFrequencySeconds === 'number' && (metaData.updateFrequencySeconds = source.updateFrequencySeconds)
  // TODO: icon
  source.icon && (metaData.icon = source.icon)
  // TODO: mapStyle
  return metaData
}