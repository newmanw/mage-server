import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MomentPipe } from './moment/moment.pipe';

@NgModule({
  declarations: [
    MomentPipe
  ],
  exports: [
    MomentPipe
  ],
  imports: [
    CommonModule
  ]
})
export class MageModule { }
