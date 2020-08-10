import { FeatureCollection, Feature } from 'geojson';

export interface Feed {
  id: string;
  service: string;
  topic: string;
  title: string;
  summary?: string;
  style?: Style;
  itemTemporalProperty?: string;
  itemPrimaryProperty?: string;
  itemSecondaryProperty?: string;
  itemsHaveSpatialDimension?: boolean;
  updateFrequency?: number;
  constantParams?: any;
  variableParamsSchema?: JSON;
}

export interface Style {
  iconUrl?: string;
}

export interface FeedTab {
  id: string,
  title: string;
  icon?: string;
  iconUrl?: string;
}

export type StyledFeature = Feature & { style: Style }
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
  serviceType: string;
  summary: string | null;
  config: any;
}

export interface FeedTopic {
  id: string;
  title: string;
  summary?: string;
  paramsSchema?: any;
  updateFrequencySeconds?: number;
  itemsHaveIdentity?: boolean;
  itemsHaveSpatialDimension?: boolean;
  itemTemporalProperty?: string;
  itemPrimaryProperty?: string;
  itemSecondaryProperty?: string;
}
