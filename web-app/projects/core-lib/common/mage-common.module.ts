import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { ImgXhrBlobSrcDirective } from './img-xhr-blob-src.directive'

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    ImgXhrBlobSrcDirective
  ],
  exports: [
    ImgXhrBlobSrcDirective
  ]
})
export class MageCommonModule {}