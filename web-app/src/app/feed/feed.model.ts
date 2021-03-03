import { Feature, FeatureCollection } from 'geojson';

export interface Feed {
  id: string;
  service: string;
  topic: string;
  title: string;
  summary?: string;
  icon?: string;
  mapStyle?: MapStyle;
  itemTemporalProperty?: string;
  itemPrimaryProperty?: string;
  itemSecondaryProperty?: string;
  itemsHaveSpatialDimension?: boolean;
  itemsHaveIdentity?: boolean;
  constantParams?: any;
  variableParamsSchema?: any;
  updateFrequencySeconds?: number;
  itemPropertiesSchema?: any;
}

export interface MapStyle {
  iconUrl?: string;
}

export type StyledFeature = Feature & { style: MapStyle }
export interface FeedContent {
  items: FeatureCollection
}

export interface ServiceType {
  id: string;
  title: string;
  summary: string;
  configSchema: any;
}

export interface Service {
  id: string;
  title: string;
  serviceType: ServiceType | string;
  summary: string | null;
  config: any;
}

export interface FeedTopic {
  id: string;
  title: string;
  summary?: string;
  icon?: string;
  paramsSchema?: any;
  updateFrequencySeconds?: number;
  itemsHaveIdentity?: boolean;
  itemsHaveSpatialDimension?: boolean;
  itemTemporalProperty?: string;
  itemPrimaryProperty?: string;
  itemSecondaryProperty?: string;
  itemPropertiesSchema?: any;
  mapStyle?: MapStyle
}

export type FeedExpanded = Omit<Feed, 'service' | 'topic'> & {
  service: Service,
  topic: FeedTopic
}

export interface FeedContent {
  feed: string
  variableParams?: any
  items: FeatureCollection
}

export interface FeedPreview {
  feed: Feed
  content?: FeedContent
}