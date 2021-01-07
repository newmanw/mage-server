import { PluginResourceUrl } from '../../entities/entities.global'
import { StaticIconRepository, IconPluginHooks, PluginStaticIcon, StaticIconStub } from '../../entities/icons/entities.icons'


export async function loadIconsHooks(pluginModuleName: string, repo: StaticIconRepository, hooks: Partial<IconPluginHooks>): Promise<void> {
  const iconProvider = hooks.icons
  if (!iconProvider) {
    return
  }
  const pluginIcons: PluginStaticIcon[] = await iconProvider.loadPluginStaticIcons()
  await Promise.all(pluginIcons.map(pluginIcon => {
    const sourceUrl = new PluginResourceUrl(pluginModuleName, pluginIcon.pluginRelativePath)
    const iconInfo: StaticIconStub = {
      sourceUrl,
      imageType: pluginIcon.imageType,
      mediaType: pluginIcon.mediaType,
      sizePixels: pluginIcon.sizePixels,
      sizeBytes: pluginIcon.sizeBytes,
      contentHash: pluginIcon.contentHash,
      contentTimestamp: pluginIcon.contentTimestamp,
      tags: pluginIcon.tags,
      fileName: pluginIcon.fileName,
      title: pluginIcon.title,
      summary: pluginIcon.summary,
    }
    return repo.registerBySourceUrl(iconInfo)
  }))
}