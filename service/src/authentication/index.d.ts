import express from 'express'
import passport from 'passport'
import provision from '../provision'

declare namespace authentication {
  export interface AuthenticationStrategy {

  }
}

declare function authentication(
  app: express.Application,
  passport: passport.PassportStatic,
  provision: provision.ProvisionStatic,
  configuredStrategyModuleNames: string[]):
    {
      passport: passport.PassportStatic,
      strategies: authentication.AuthenticationStrategy[]
    }


export = authentication