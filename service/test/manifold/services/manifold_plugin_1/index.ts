import { ManifoldPlugin, ManifoldAdapter } from "../../../../lib/manifold/adapters"


class TestManifoldPlugin implements ManifoldPlugin {

  async createAdapter(): Promise<ManifoldAdapter> {
    throw new Error('mock me')
  }
}

const plugin = new TestManifoldPlugin()
export = plugin
