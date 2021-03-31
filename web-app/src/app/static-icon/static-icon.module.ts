import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MageCommonModule } from '../common/mage-common.module'
import { StaticIconFormFieldComponent } from './static-icon-form-field/static-icon-form-field.component'


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MageCommonModule
  ],
  declarations: [
    StaticIconFormFieldComponent
  ],
  exports: [
    StaticIconFormFieldComponent
  ]
})
export class StaticIconModule {}