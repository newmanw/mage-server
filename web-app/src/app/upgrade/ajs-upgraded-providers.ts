import { InjectionToken } from "@angular/core";
export const MapService = new InjectionToken<any>('MapService');
export const LocalStorageService = new InjectionToken<any>('LocalStorageService');
export const UserService = new InjectionToken<any>('UserService');

export function mapServiceFactory(i: any): any {
  return i.get('MapService');
}
export const mapServiceProvider = {
  provide: MapService,
  useFactory: mapServiceFactory,
  deps: ['$injector']
};

export function localStorageServiceFactory(i: any): any {
  return i.get('LocalStorageService');
}

export const localStorageServiceProvider = {
  provide: LocalStorageService,
  useFactory: localStorageServiceFactory,
  deps: ['$injector']
};

export function userServiceFactory(i: any): any {
  return i.get('UserService');
}

export const userServiceProvider = {
  provide: UserService,
  useFactory: userServiceFactory,
  deps: ['$injector']
};
