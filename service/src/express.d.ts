import express from 'express'
import initAuthentication from './authentication'

declare const expressApp: {
  app: express.Application,
  auth: ReturnType<typeof initAuthentication>
}

export = expressApp