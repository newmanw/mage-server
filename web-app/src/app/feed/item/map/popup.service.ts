import { Injectable, ComponentFactoryResolver, Injector, ApplicationRef } from '@angular/core';
import { Marker, LeafletMouseEvent } from 'leaflet';
import { Feed } from '../../feed.model';
import { FeedItemMapPopupComponent } from './popup.component';
import { Feature } from 'geojson';

@Injectable({
  providedIn: 'root'
})
export class FeedItemPopupService {

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private applicationRef: ApplicationRef) { }
    
  public register(marker: Marker, feed: Feed, item: Feature): void {
    marker.on('click', ($event: LeafletMouseEvent) => this.popup($event.target, feed, item));
  }

  public popup(marker: Marker, feed: Feed, item: Feature): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(FeedItemMapPopupComponent);
    const component = componentFactory.create(this.injector);
    component.instance.item = item;
    component.instance.feed = feed;
    this.applicationRef.attachView(component.hostView);

    marker
      .unbindPopup()
      .bindPopup(component.location.nativeElement)
      .openPopup();
  }
}
