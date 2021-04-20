import { Directive, ElementRef, Inject, InjectionToken, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core'
import { HttpClient } from '@angular/common/http'
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
 * using cache-defeating URL query parameters to set an auth token.  Applying
 * headers to the browser's native `img` requests is impossible, so a query
 * parameter is necessary for authorization, but adding the parameter to the
 * URL effectively bypasses the browser's caching mechanism for images that
 * should otherwise be subject to caching.
 *
 * The catch to fetching images by XHR is the response must be fetched as a
 * `Blob`.  The user then gets a browser-specific URL for the blob by
 * `URL.createObjectURL(blob)`, which can then be assigned to the `src`
 * attribute of an `img` tag.  These blob URLs must then be "revoked" by
 * `URL.revokeObjectURL(url)` in order to reclaim object URL's associated
 * resources.  See [Mozilla's docs](https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications#example_using_object_urls_to_display_images)
 * on the subject.
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