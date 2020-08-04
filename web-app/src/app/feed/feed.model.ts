import { FeatureCollection, Feature } from 'geojson';

export interface Feed {
  id: string,
  title: string;
  summary?: string;
  style?: Style;
  itemTemporalProperty?: string;
  itemPrimaryProperty?: string;
  itemSecondaryProperty?: string;
  itemsHaveSpatialDimension?: boolean;
  updateFrequency?: number;
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