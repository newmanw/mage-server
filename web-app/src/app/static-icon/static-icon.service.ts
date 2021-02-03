import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'
import { StaticIcon } from './static-icon.model'

@Injectable({
  providedIn: 'root'
})
export class StaticIconService {

  constructor() { }

  fetchIcons(keyWordFilter?: string): Observable<StaticIcon[]> {
    const now = Date.now()
    const fetch = new Observable<StaticIcon[]>(observer => {
      const icons: StaticIcon[] = []
      let remaining = 100
      while (remaining--) {
        const id = now - remaining
        icons.unshift({
          id: String(id),
          path: '/default-icon.png',
          title: `Icon ${id}`,
          fileName: `icon-${id}.png`,
          sourceUrl: `https://test.mage/${id}.png`
        })
      }
      setTimeout(() => {
        observer.next(icons)
        observer.complete()
      }, 0)
      return {
        unsubscribe() { }
      }
    })
    return fetch
  }

  registerIconUrl(url: string): void {

  }
}
