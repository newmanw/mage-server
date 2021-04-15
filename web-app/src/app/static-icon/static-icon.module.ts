import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { ScrollingModule } from '@angular/cdk/scrolling'
import { MageCommonModule } from '../common/mage-common.module'
import { StaticIconFormFieldComponent } from './static-icon-form-field/static-icon-form-field.component'
import { StaticIconSelectComponent } from './static-icon-select/static-icon-select.component'


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MageCommonModule,
    ScrollingModule
  ],
  declarations: [
    StaticIconFormFieldComponent,
    StaticIconSelectComponent
  ],
  exports: [
    StaticIconFormFieldComponent
  ]
})
export class StaticIconModule {}