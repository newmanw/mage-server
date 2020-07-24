import * as L from 'leaflet';
import { ExecFileSyncOptionsWithStringEncoding } from 'child_process';

declare module 'leaflet' {

  export interface FixedWidthMarkerOptions extends L.MarkerOptions {
    iconUrl?: ExecFileSyncOptionsWithStringEncoding;
  }

  /**
   * Creates a Fixed Width Marker.
   */
  export function fixedWidthMarker(latlng: L.LatLngExpression, options?: FixedWidthMarkerOptions): L.Marker;

}

