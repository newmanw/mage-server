import { PluginService } from './plugin.service'
import { SystemJS } from './systemjs.service'

describe('PluginService', () => {

  let system: {
    register: jasmine.Spy<SystemJS.Context['register']>,
    import: jasmine.Spy<SystemJS.Context['import']>
  }
  let service: PluginService

  beforeEach(() => {

    system = {
      register: jasmine.createSpy('SystemJS.Context.register'),
      import: jasmine.createSpy('SystemJS.Context.import')
    }
    service = new PluginService(system as unknown as SystemJS.Context)
  })

  it('registers shared libraries', async () => {

    const sharedLibs = [
      '@angular/core',
      '@angular/common',
      '@angular/forms',
      '@angular/cdk/accordion',
      '@angular/cdk/bidi',
      '@angular/cdk/clipboard',
      '@angular/cdk/coercion',
      '@angular/cdk/collections',
      '@angular/cdk/drag-drop',
      '@angular/cdk/keycodes',
      '@angular/cdk/layout',
      '@angular/cdk/observers',
      '@angular/cdk/overlay',
      '@angular/cdk/platform',
      '@angular/cdk/portal',
      '@angular/cdk/scrolling',
      '@angular/cdk/stepper',
      '@angular/cdk/table',
      '@angular/cdk/text-field',
      '@angular/cdk/tree',
      '@angular/material/autocomplete',
      '@angular/material/badge',
      '@angular/material/bottom-sheet',
      '@angular/material/button',
      '@angular/material/button-toggle',
      '@angular/material/card',
      '@angular/material/checkbox',
      '@angular/material/chips',
      '@angular/material/core',
      '@angular/material/datepicker',
      '@angular/material/dialog',
      '@angular/material/divider',
      '@angular/material/expansion',
      '@angular/material/form-field',
      '@angular/material/grid-list',
      '@angular/material/icon',
      '@angular/material/input',
      '@angular/material/list',
      '@angular/material/menu',
      '@angular/material/paginator',
      '@angular/material/progress-bar',
      '@angular/material/progress-spinner',
      '@angular/material/radio',
      '@angular/material/select',
      '@angular/material/sidenav',
      '@angular/material/slide-toggle',
      '@angular/material/slider',
      '@angular/material/snack-bar',
      '@angular/material/sort',
      '@angular/material/stepper',
      '@angular/material/table',
      '@angular/material/tabs',
      '@angular/material/toolbar',
      '@angular/material/tooltip',
      '@angular/material/tree',
      'rxjs',
      'rxjs/operators',
      '@ngageoint/mage.web-core-lib',
      '@ngageoint/mage.web-core-lib/common',
      '@ngageoint/mage.web-core-lib/feed',
      '@ngageoint/mage.web-core-lib/plugin',
      '@ngageoint/mage.web-core-lib/paging',
      '@ngageoint/mage.web-core-lib/static-icon',
    ]
    sharedLibs.forEach((moduleId: string) => {
      expect(system.register).toHaveBeenCalledWith(moduleId, [], jasmine.anything())
    })
  })
})