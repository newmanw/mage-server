import { Feature, FeatureCollection } from 'geojson';

export interface Feed {
  id: string;
  service: Service | string;
  topic: FeedTopic;
  title: string;
  summary?: string;
  mapStyle?: Style;
  itemTemporalProperty?: string;
  itemPrimaryProperty?: string;
  itemSecondaryProperty?: string;
  itemsHaveSpatialDimension?: boolean;
  updateFrequency?: number;
  constantParams?: any;
  variableParamsSchema?: JSON;
  updateFrequencySeconds: number;
  itemPropertiesSchema?: JSON;
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
  serviceType: ServiceType | string;
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
  itemPropertiesSchema?: any;
}
