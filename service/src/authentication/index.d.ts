import express from 'express'
import passport from 'passport'
import provision from '../provision'

declare namespace authentication {
  export interface AuthenticationStrategy {

  }

  export interface AuthLayer {
    passport: passport.PassportStatic
    strategies: AuthenticationStrategy[]
  }
}

declare function authentication(
  app: express.Application,
  passport: passport.PassportStatic,
  provision: provision.ProvisionStatic,
  configuredStrategyModuleNames: string[]): authentication.AuthLayer


export = authentication