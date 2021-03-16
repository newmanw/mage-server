import path from 'path'
import { expect } from 'chai'
import { URL } from 'url'
import { PluginUrlScheme } from '../../../lib/adapters/url_schemes/adapters.url_schemes.plugin'

describe.only('plugin url scheme', function() {

  const testNodeModules = path.resolve(__dirname, '..', '..', 'node_modules')
  const origPath = process.env.NODE_PATH || ''

  before(function() {
    process.env.NODE_PATH = `${testNodeModules}${path.delimiter}${origPath}`
    console.log('NODE_PATH', process.env.NODE_PATH)
  })

  after(function() {
    process.env.NODE_PATH = origPath
  })

  it('resolves content relative to dirname of the plugin main file', async function() {

    const pluginName = '@adapters.url_schemes.plugin.test/plugin1'
    const scheme = new PluginUrlScheme([ pluginName ], [ testNodeModules ])
    const url = new URL(`mage-plugin:///${pluginName}/assets/some_content.txt`)
    const content = await scheme.resolveContent(url) as NodeJS.ReadableStream
    let read = await new Promise(function(this: { data: string[] }, resolve: (x: string) => any, reject: (x: any) => any) {
      content.setEncoding('utf8')
        .on('data', x => this.data.push(x))
        .on('end', () => resolve(this.data.join()))
    }.bind({ data: [] }))

    expect(read).to.equal('The content you want')
  })
})