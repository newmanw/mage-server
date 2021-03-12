
import { URL } from 'url'
import express from 'express'
import { ErrEntityNotFound } from '../../app.api/app.api.errors'
import { GetStaticIcon, GetStaticIconContent, GetStaticIconRequest, ListStaticIcons, ListStaticIconsRequest } from '../../app.api/icons/app.api.icons'
import { WebAppRequestFactory } from '../adapters.controllers.web'
import { PagingParameters } from '../../entities/entities.global'

export interface StaticIconsAppLayer {
  getIcon: GetStaticIcon
  listIcons: ListStaticIcons
  getIconContent: GetStaticIconContent
}

export function StaticIconRoutes(appLayer: StaticIconsAppLayer, createAppRequest: WebAppRequestFactory): express.Router {

  const routes = express.Router()

  routes.route('/:iconId')
    .get(async (req, res, next) => {
      const iconId = req.params.iconId
      const appReq: GetStaticIconRequest = createAppRequest(req, { iconRef: { id: iconId }})
      const appRes = await appLayer.getIcon(appReq)
      if (appRes.success) {
        return res.json(appRes.success)
      }
      if (appRes.error?.code === ErrEntityNotFound) {
        return res.status(404).json(`icon not found: ${iconId}`)
      }
      next(appRes.error)
    })

  routes.route('/')
    .get(
      async (req, res, next) => {
        const sourceUrlParam = req.query['source_url']
        if (!sourceUrlParam) {
          return next()
        }
        let sourceUrl: URL | null = null
        if (typeof sourceUrlParam === 'string') {
          try {
            sourceUrl = new URL(sourceUrlParam)
          }
          catch (err) {
            console.error(`error parsing url parameter: ${sourceUrlParam}`, err)
          }
        }
        if (!sourceUrl) {
          return res.status(400).json(`invalid icon source url: ${sourceUrlParam}`)
        }
        const appReq: GetStaticIconRequest = createAppRequest(req, { iconRef: { sourceUrl }})
        const appRes = await appLayer.getIcon(appReq)
        if (appRes.success) {
          return res.json(appRes.success)
        }
        if (appRes.error?.code === ErrEntityNotFound) {
          return res.json(null)
        }
        next(appRes.error)
      },
      async (req, res, next) => {
        const pageSize = parseInt(String(req.query.page_size))
        const pageIndex = parseInt(String(req.query.page))
        let paging: Partial<PagingParameters> = {}
        if (typeof pageSize === 'number' && !Number.isNaN(pageSize)) {
          paging.pageSize = pageSize
        }
        if (typeof pageIndex === 'number' && !Number.isNaN(pageIndex)) {
          paging.pageIndex = pageIndex
        }
        const searchText = typeof req.query.search === 'string' ? req.query.search : null
        const listParams: any = {}
        if (Object.getOwnPropertyNames(paging).length) {
          listParams.paging = paging
        }
        if (searchText) {
          listParams.searchText = searchText
        }
        const appReq: ListStaticIconsRequest = createAppRequest(req, listParams)
        const appRes = await appLayer.listIcons(appReq)
        if (appRes.success) {
          return res.json(appRes.success)
        }
        next(appRes.error)
      }
    )

  return routes
}