import { Component, Input, AfterViewInit, ElementRef, Inject, OnDestroy } from '@angular/core';
import { Feature } from 'geojson';
import { Map } from 'leaflet';
import * as L from 'leaflet';
import { LocalStorageService, MapService } from 'src/app/upgrade/ajs-upgraded-providers';

@Component({
  selector: 'map-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.scss']
})
export class MapClipComponent implements AfterViewInit, OnDestroy {
  @Input() feature: Feature;

  map: Map;
  layers = {};
  zoomControl = L.control.zoom();
  mapListener = {
    onBaseLayerSelected: this.onBaseLayerSelected.bind(this)
  };

  constructor(private element: ElementRef, @Inject(LocalStorageService) private localStorageService: any, @Inject(MapService) private mapService: any) { }
  
  ngAfterViewInit(): void {
    const mapPosition = this.localStorageService.getMapPosition();

    this.map = L.map(this.element.nativeElement, {
      center: mapPosition.center,
      zoom: 1,
      minZoom: 0,
      maxZoom: 18,
      zoomControl: false,
      trackResize: true,
      scrollWheelZoom: false,
      attributionControl: false
    });

    this.map.on('mouseover', () => {
      this.map.addControl(this.zoomControl);
    });

    this.map.on('mouseout', () => {
      this.map.removeControl(this.zoomControl);
    });

    this.mapService.addListener(this.mapListener);
  }

  ngOnDestroy(): void {
    this.mapService.removeListener(this.mapListener);
  }

  onBaseLayerSelected(baseLayer): void {
    let layer = this.layers[baseLayer.name];
    if (layer) this.map.removeLayer(layer.layer);

    layer = this.createRasterLayer(baseLayer);
    this.layers[baseLayer.name] = { type: 'tile', layer: baseLayer, rasterLayer: layer };

    layer.addTo(this.map);
  }

  createRasterLayer(layer): L.Layer {
    let baseLayer: L.Layer = null;
    if (layer.format === 'XYZ' || layer.format === 'TMS') {
      const options = { tms: layer.format === 'TMS', maxZoom: 18 };
      baseLayer = new L.TileLayer(layer.url, options);
    } else if (layer.format === 'WMS') {
      const options: L.WMSOptions = {
        layers: layer.wms.layers,
        version: layer.wms.version,
        format: layer.wms.format,
        transparent: layer.wms.transparent
      };

      if (layer.wms.styles) options.styles = layer.wms.styles;
      baseLayer = new L.TileLayer.WMS(layer.url, options);
    }

    return baseLayer;
  }
}
