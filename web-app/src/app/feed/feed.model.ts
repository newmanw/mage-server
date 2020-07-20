export interface Feed {
  id: string,
  title: string;
  summary?: string;
  style?: Style;
  itemTemporalProperty?: string;
  itemPrimaryProperty?: string;
  itemSecondaryProperty?: string;
}

export interface Style {
  iconUrl?: string;
}