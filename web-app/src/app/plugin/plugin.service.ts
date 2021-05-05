import * as ngCore from '@angular/core'
import * as ngCommon from '@angular/common'
import * as ngForms from '@angular/forms'
import * as ngCdkAccordian from '@angular/cdk/accordion'
import * as ngCdkBidi from '@angular/cdk/bidi'
import * as ngCdkClipboard from '@angular/cdk/clipboard'
import * as ngCdkCoercion from '@angular/cdk/coercion'
import * as ngCdkCollections from '@angular/cdk/collections'
import * as ngCdkDragDrop from '@angular/cdk/drag-drop'
import * as ngCdkKeycodes from '@angular/cdk/keycodes'
import * as ngCdkLayout from '@angular/cdk/layout'
import * as ngCdkObservers from '@angular/cdk/observers'
import * as ngCdkOverlay from '@angular/cdk/overlay'
import * as ngCdkPlatform from '@angular/cdk/platform'
import * as ngCdkPortal from '@angular/cdk/portal'
import * as ngCdkScrolling from '@angular/cdk/scrolling'
import * as ngCdkStepper from '@angular/cdk/stepper'
import * as ngCdkTable from '@angular/cdk/table'
import * as ngCdkTextField from '@angular/cdk/text-field'
import * as ngCdkTree from '@angular/cdk/tree'
import * as ngMatAutocomplete from '@angular/material/autocomplete'
import * as ngMatBadge from '@angular/material/badge'
import * as ngMatBottomSheet from '@angular/material/bottom-sheet'
import * as ngMatButton from '@angular/material/button'
import * as ngMatButtonToggle from '@angular/material/button-toggle'
import * as ngMatCard from '@angular/material/card'
import * as ngMatCheckbox from '@angular/material/checkbox'
import * as ngMatChips from '@angular/material/chips'
import * as ngMatCore from '@angular/material/core'
import * as ngMatDatepicker from '@angular/material/datepicker'
import * as ngMatDialog from '@angular/material/dialog'
import * as ngMatDivider from '@angular/material/divider'
import * as ngMatExpansion from '@angular/material/expansion'
import * as ngMatFormField from '@angular/material/form-field'
import * as ngMatGridList from '@angular/material/grid-list'
import * as ngMatIcon from '@angular/material/icon'
import * as ngMatInput from '@angular/material/input'
import * as ngMatList from '@angular/material/list'
import * as ngMatMenu from '@angular/material/menu'
import * as ngMatPaginator from '@angular/material/paginator'
import * as ngMatProgressBar from '@angular/material/progress-bar'
import * as ngMatProgressSpinner from '@angular/material/progress-spinner'
import * as ngMatRadio from '@angular/material/radio'
import * as ngMatSelect from '@angular/material/select'
import * as ngMatSidenav from '@angular/material/sidenav'
import * as ngMatSlideToggle from '@angular/material/slide-toggle'
import * as ngMatSlider from '@angular/material/slider'
import * as ngMatSnackBar from '@angular/material/snack-bar'
import * as ngMatSort from '@angular/material/sort'
import * as ngMatStepper from '@angular/material/stepper'
import * as ngMatTable from '@angular/material/table'
import * as ngMatTabs from '@angular/material/tabs'
import * as ngMatToolbar from '@angular/material/toolbar'
import * as ngMatTooltip from '@angular/material/tooltip'
import * as ngMatTree from '@angular/material/tree'
import * as rxjs from 'rxjs'
import * as rxjsOperators from 'rxjs/operators'
import * as mageCore from '@ngageoint/mage.web-core-lib'
import * as mageCoreCommon from '@ngageoint/mage.web-core-lib/common'
import * as mageCoreFeed from '@ngageoint/mage.web-core-lib/feed'
import * as mageCorePlugin from '@ngageoint/mage.web-core-lib/plugin'
import * as mageCorePaging from '@ngageoint/mage.web-core-lib/paging'
import * as mageCoreStaticIcon from '@ngageoint/mage.web-core-lib/static-icon'

import { Inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { SystemJS, SYSTEMJS } from './systemjs.service'
import { PluginHooks } from '@ngageoint/mage.web-core-lib/plugin'

function registerSharedLibInContext(system: SystemJS.Context, libId: string, lib: any): void {
  system.register(libId, [], _export => {
    return {
      execute: () => _export(lib)
    }
  })
}

/**
 * TODO: Evaluate all of the imports of shared libraries and how they affect
 * memory usage, and whether they are necessary at all.  Perhaps instead we can
 * configure the angular/webpack build to chunk more optimally, such as only
 * including dependencies the app statically links in the main bundle, then
 * leave all other dependencies to dynamic imports.  We can also manipulate
 * chunking to some degree using dynamic import statements like
 * `import('@angular/material/seldomUsedModule')`.  However, that would
 * necessitate [customizing](https://github.com/systemjs/systemjs/blob/master/docs/hooks.md)
 * the SystemJS `import()` method to dynamically load the modules.
 *
 * Some notes:
 * * Static import statements like `import * as packageEntryPoint from '@scope/package/entryPoint`
 * cause webpack to bundle the imported library with the main bundle by default.
 * * Dynamic import statements that can be statically processed like
 * `const x = await import('@scope/package/entryPoint')` because they import by
 * a string literal reference supposedly cause webpack to create a separate
 * chunk for the script as long as it's not statically imported somewhere else.
 *
 */
@Injectable({
  providedIn: 'root'
})
export class PluginService {

  constructor(@Inject(SYSTEMJS) private system: SystemJS.Context) {
    const shareLib = (libId: string, lib: any) => registerSharedLibInContext(system, libId, lib)
    shareLib('@angular/core', ngCore)
    shareLib('@angular/common', ngCommon)
    shareLib('@angular/forms', ngForms)
    shareLib('@angular/cdk/accordion', ngCdkAccordian)
    shareLib('@angular/cdk/bidi', ngCdkBidi)
    shareLib('@angular/cdk/clipboard', ngCdkClipboard)
    shareLib('@angular/cdk/coercion', ngCdkCoercion)
    shareLib('@angular/cdk/collections', ngCdkCollections)
    shareLib('@angular/cdk/drag-drop', ngCdkDragDrop)
    shareLib('@angular/cdk/keycodes', ngCdkKeycodes)
    shareLib('@angular/cdk/layout', ngCdkLayout)
    shareLib('@angular/cdk/observers', ngCdkObservers)
    shareLib('@angular/cdk/overlay', ngCdkOverlay)
    shareLib('@angular/cdk/platform', ngCdkPlatform)
    shareLib('@angular/cdk/portal', ngCdkPortal)
    shareLib('@angular/cdk/scrolling', ngCdkScrolling)
    shareLib('@angular/cdk/stepper', ngCdkStepper)
    shareLib('@angular/cdk/table', ngCdkTable)
    shareLib('@angular/cdk/text-field', ngCdkTextField)
    shareLib('@angular/cdk/tree', ngCdkTree)
    shareLib('@angular/material/autocomplete', ngMatAutocomplete)
    shareLib('@angular/material/badge', ngMatBadge)
    shareLib('@angular/material/bottom-sheet', ngMatBottomSheet)
    shareLib('@angular/material/button', ngMatButton)
    shareLib('@angular/material/button-toggle', ngMatButtonToggle)
    shareLib('@angular/material/card', ngMatCard)
    shareLib('@angular/material/checkbox', ngMatCheckbox)
    shareLib('@angular/material/chips', ngMatChips)
    shareLib('@angular/material/core', ngMatCore)
    shareLib('@angular/material/datepicker', ngMatDatepicker)
    shareLib('@angular/material/dialog', ngMatDialog)
    shareLib('@angular/material/divider', ngMatDivider)
    shareLib('@angular/material/expansion', ngMatExpansion)
    shareLib('@angular/material/form-field', ngMatFormField)
    shareLib('@angular/material/grid-list', ngMatGridList)
    shareLib('@angular/material/icon', ngMatIcon)
    shareLib('@angular/material/input', ngMatInput)
    shareLib('@angular/material/list', ngMatList)
    shareLib('@angular/material/menu', ngMatMenu)
    shareLib('@angular/material/paginator', ngMatPaginator)
    shareLib('@angular/material/progress-bar', ngMatProgressBar)
    shareLib('@angular/material/progress-spinner', ngMatProgressSpinner)
    shareLib('@angular/material/radio', ngMatRadio)
    shareLib('@angular/material/select', ngMatSelect)
    shareLib('@angular/material/sidenav', ngMatSidenav)
    shareLib('@angular/material/slide-toggle', ngMatSlideToggle)
    shareLib('@angular/material/slider', ngMatSlider)
    shareLib('@angular/material/snack-bar', ngMatSnackBar)
    shareLib('@angular/material/sort', ngMatSort)
    shareLib('@angular/material/stepper', ngMatStepper)
    shareLib('@angular/material/table', ngMatTable)
    shareLib('@angular/material/tabs', ngMatTabs)
    shareLib('@angular/material/toolbar', ngMatToolbar)
    shareLib('@angular/material/tooltip', ngMatTooltip)
    shareLib('@angular/material/tree', ngMatTree)
    shareLib('rxjs', rxjs)
    shareLib('rxjs/operators', rxjsOperators)
    shareLib('@ngageoint/mage.web-core-lib', mageCore)
    shareLib('@ngageoint/mage.web-core-lib/common', mageCoreCommon)
    shareLib('@ngageoint/mage.web-core-lib/feed', mageCoreFeed)
    shareLib('@ngageoint/mage.web-core-lib/plugin', mageCorePlugin)
    shareLib('@ngageoint/mage.web-core-lib/paging', mageCorePaging)
    shareLib('@ngageoint/mage.web-core-lib/static-icon', mageCoreStaticIcon)
  }

  fetchAvailablePlugins(): Observable<PluginDescriptor[]> {
    return rxjs.of([{ moduleId: 'mage-m2c2-web' }])
  }

  async loadPluginModule(moduleId: string): Promise<PluginHooks> {
    const pluginModule = await this.system.import(moduleId)
    const hooks = pluginModule.MAGE_WEB_HOOKS as PluginHooks
    return hooks
  }
}

export interface PluginDescriptor {
  moduleId: string
}
