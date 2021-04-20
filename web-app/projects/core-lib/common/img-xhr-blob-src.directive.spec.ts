import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { Component, DebugElement } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { ImgXhrBlobSrcDirective, ObjectUrlService, OBJECT_URL_SERVICE } from './img-xhr-blob-src.directive'

@Component({
  template: `
  <canvas id="testImage" width="100px" height="100px"></canvas>
  <img #blobSrc="mageXhrBlobSrc" [mageXhrBlobSrc]="sourceUrl" [attr.src]="blobSrc.safeBlobUrl"/>
  `
})
class TestComponent {
  sourceUrl: string = null
}

describe('ImgXhrBlobSrcDirective', () => {

  let fixture: ComponentFixture<TestComponent>
  let host: TestComponent
  let httpTest: HttpTestingController
  let elmt: DebugElement
  let target: ImgXhrBlobSrcDirective
  let img: HTMLImageElement
  let objectUrlService: jasmine.SpyObj<ObjectUrlService>
  let blob1: Blob
  let blob2: Blob

  beforeEach(async(() => {
    objectUrlService = jasmine.createSpyObj<ObjectUrlService>('ObjectUrlService', [ 'createObjectURL', 'revokeObjectURL' ])
    objectUrlService.createObjectURL.and.callFake(URL.createObjectURL)
    objectUrlService.revokeObjectURL.and.callFake(URL.revokeObjectURL)
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      declarations: [ ImgXhrBlobSrcDirective, TestComponent ]
    })
    .overrideDirective(ImgXhrBlobSrcDirective, {
      set: {
        providers: [
          {
            provide: OBJECT_URL_SERVICE,
            useValue: objectUrlService
          }
        ]
      }
    })
    .compileComponents()
  }))

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent)
    fixture.detectChanges()
    host = fixture.componentInstance
    httpTest = TestBed.get(HttpTestingController)
    elmt = fixture.debugElement
    target = elmt.query(By.directive(ImgXhrBlobSrcDirective)).injector.get(ImgXhrBlobSrcDirective)
    img = elmt.query(By.directive(ImgXhrBlobSrcDirective)).nativeElement
    const canvas = elmt.query(By.css('#testImage')).nativeElement as HTMLCanvasElement
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'green'
    ctx.fillText('TEST1', 5, 35)
    blob1 = await new Promise(resolve => {
      canvas.toBlob(resolve)
    })
    ctx.clearRect(0, 0, 100, 100)
    ctx.fillStyle = 'blue'
    ctx.fillText('TEST2', 5, 25)
    blob2 = await new Promise(resolve => {
      canvas.toBlob(resolve)
    })
  })

  afterEach(() => {
  })

  it('has a template variable reference to the directive', () => {

    const imgDebug = elmt.query(By.directive(ImgXhrBlobSrcDirective))
    const ref = imgDebug.references['blobSrc']

    expect(ref instanceof ImgXhrBlobSrcDirective).toBe(true)
    expect(ref).toBe(target)
  })

  it('starts with null image source', () => {

    expect(target.safeBlobUrl).toBeNull()
    expect(target.sourceUrl).toBeNull()
    expect(img.src).toEqual('')
    httpTest.expectNone(() => true)
    httpTest.verify()
  })

  it('creates a blob url for for the image source', async () => {

    host.sourceUrl = '/test/image'
    fixture.detectChanges()

    const imageXhr = httpTest.expectOne('/test/image')
    expect(imageXhr.request.responseType).toEqual('blob')
    const loaded = new Promise(resolve => {
      img.addEventListener('load', resolve)
    })
    imageXhr.flush(blob1)

    expect(target.safeBlobUrl).not.toBeNull()

    httpTest.verify()

    fixture.detectChanges()
    await loaded

    expect(img.src).toMatch(/blob:/)
    expect(objectUrlService.createObjectURL).toHaveBeenCalledWith(blob1)
  })

  it('revokes the blob url when the image loads', async () => {

    host.sourceUrl = '/test/image'
    fixture.detectChanges()

    const imageXhr = httpTest.expectOne('/test/image')
    expect(imageXhr.request.responseType).toEqual('blob')
    const loaded = new Promise(resolve => {
      img.addEventListener('load', resolve)
    })
    imageXhr.flush(blob1)

    expect(target.safeBlobUrl).not.toBeNull()

    httpTest.verify()

    fixture.detectChanges()
    await loaded

    expect(img.src).toMatch(/blob:/)
    expect(img.src).toEqual(objectUrlService.createObjectURL.calls.first().returnValue)
    expect(objectUrlService.revokeObjectURL).toHaveBeenCalledWith(img.src)
  })

  it('does not create a blob url when source url changes before the xhr completes', async () => {

    host.sourceUrl = '/test/foresaken'
    fixture.detectChanges()

    const xhr1 = httpTest.expectOne('/test/foresaken')

    host.sourceUrl = '/test/usurper'
    fixture.detectChanges()

    const xhr2 = httpTest.expectOne('/test/usurper')

    expect(xhr1.cancelled).toBe(true)

    xhr2.flush(blob1)

    expect(objectUrlService.createObjectURL).not.toHaveBeenCalledWith(xhr1.request.url)
    expect(objectUrlService.createObjectURL).toHaveBeenCalledTimes(1)
    expect(objectUrlService.createObjectURL).toHaveBeenCalledWith(blob1)
  })

  it('revokes the blob url when the source url changes before the image loads', async(() => {

    host.sourceUrl = '/test/foresaken'
    fixture.detectChanges()

    const xhr1 = httpTest.expectOne('/test/foresaken')
    xhr1.flush(blob1)

    host.sourceUrl = '/test/usurper'
    fixture.detectChanges()

    const xhr2 = httpTest.expectOne('/test/usurper')
    xhr2.flush(blob2)

    expect(objectUrlService.createObjectURL).not.toHaveBeenCalledWith(xhr1.request.url)
    expect(objectUrlService.createObjectURL).toHaveBeenCalledTimes(2)
    expect(objectUrlService.createObjectURL.calls.argsFor(0)).toEqual([ blob1 ])
    expect(objectUrlService.createObjectURL.calls.argsFor(1)).toEqual([ blob2 ])
    expect(objectUrlService.revokeObjectURL).toHaveBeenCalledWith(objectUrlService.createObjectURL.calls.first().returnValue)

    fixture.detectChanges()

    expect(img.src).toEqual(objectUrlService.createObjectURL.calls.all()[1].returnValue)
  }))

  it('removes event listeners from img element on destroy', async () => {

    await fixture.whenStable()

    expect(objectUrlService.revokeObjectURL).toHaveBeenCalledTimes(0)

    img.dispatchEvent(new Event('load'))

    expect(objectUrlService.revokeObjectURL).toHaveBeenCalledTimes(1)

    target.ngOnDestroy()
    img.dispatchEvent(new Event('load'))

    expect(objectUrlService.revokeObjectURL).toHaveBeenCalledTimes(1)
  })
})