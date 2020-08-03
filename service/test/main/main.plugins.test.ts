
import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as plugins from '../../lib/main.impl/main.impl.plugins'
import { Substitute as Sub } from '@fluffy-spoon/substitute'

describe('loading plugins', function() {

  it('handles invalid modules', async function() {

    const deps = Sub.for<plugins.PluginDependencies>()
    await expect(plugins.loadPlugins([ 'not a valid module' ], deps)).to.eventually.be.undefined
  })
})