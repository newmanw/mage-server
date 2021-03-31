import { HttpClient } from '@angular/common/http'
import { Directive, ElementRef, Inject, Injectable, InjectionToken, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { Subscription } from 'rxjs'

const selectorAttr = 'mageXhrBlobSrc'

export interface ObjectUrlService {
  createObjectURL: (typeof URL)['createObjectURL']
  revokeObjectURL: (typeof URL)['revokeObjectURL']
}
export const OBJECT_URL_SERVICE = new InjectionToken<ObjectUrlService>(`${selectorAttr}.objectUrlService`)

/**
 * This directive allows fetching images by `XMLHttpRequest` rather than the
 * browser's native mechanism.  These image requests are subject to HTTP
 * interceptors that can add authorization headers to the request instead of
 * using cache-defeating URL query parameters to set an auth token.
 *
 * The use of the directive is a bit cumbersome because Angular only allows
 * users to assign `SafeUrl` instances to an `img` `src` attribute from a
 * template, rather than code.  If the latter were allowed, this directive
 * could simply `this.imgElement.src = safeBlobUrl`.  Instead, the user of this
 * directive must assign the `src` attribute in the template by refrencing the
 * directive instance with a template reference variable, as follows.
 * ```
 * <img [mageXhrBlobSrc]="someComponent.imageUrl" #blobSrc="mageXhrBlobSrc" [attr.src]="blobSrc.blobUrl"/>
 * ```
 * The benefit, though, is that the directive encapsulates the logic of
 * cleaning up the object URLs that it creates to assign to the `img` tag's
 * `src`, preventing memory leaks.
 */
@Directive({
  selector: `img[${selectorAttr}]`,
  exportAs: 'mageXhrBlobSrc',
  providers: [
    {
      provide: OBJECT_URL_SERVICE,
      useValue: URL
    }
  ]
})
export class ImgXhrBlobSrcDirective implements OnChanges, OnDestroy {

  @Input(selectorAttr)
  sourceUrl: string | null = null
  safeBlobUrl: SafeUrl | null = null

  private img: HTMLImageElement
  private blobUrl: string
  private releaseImgSrc: () => void
  private subscription: Subscription

  constructor(elmt: ElementRef, @Inject(OBJECT_URL_SERVICE) private objectUrlService: ObjectUrlService, private http: HttpClient, private sanitizer: DomSanitizer) {
    this.img = elmt.nativeElement
    this.releaseImgSrc = () => {
      this.objectUrlService.revokeObjectURL(this.img.src)
    }
    this.img.addEventListener('load', this.releaseImgSrc)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.sourceUrl) {
      return
    }
    this.disposeCurrent()
    if (!this.sourceUrl) {
      return
    }
    this.subscription = this.http.get(this.sourceUrl, { responseType: 'blob' })
      .subscribe(x => {
        this.objectUrlService.revokeObjectURL(this.blobUrl)
        this.blobUrl = this.objectUrlService.createObjectURL(x)
        this.safeBlobUrl = this.sanitizer.bypassSecurityTrustUrl(this.blobUrl)
      })
  }

  ngOnDestroy() {
    this.disposeCurrent()
    this.img.removeEventListener('load', this.releaseImgSrc)
  }

  private disposeCurrent() {
    if (this.blobUrl) {
      this.objectUrlService.revokeObjectURL(this.blobUrl)
    }
    this.blobUrl = null
    this.safeBlobUrl = null
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}