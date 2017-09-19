import debug from 'debug'
import config from 'config'

import bodyParser from 'body-parser'
import expressJwt from 'express-jwt'
import http from 'http'

import {websocketVerifyClient as verifyClient, processPayload} from './utils/authentification'
import graphqlRouter, {schema} from './controllers/graphql'
import { graphiqlExpress } from 'graphql-server-express'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'

const log = debug('App:Core')

export class Core {
  constructor (app) {
    this.app = app
    this.server = http.createServer(this.app)

    this.initialisation()
  }

  initialisation () {
    const jwtOption = {
      secret: config.get('config.jwt.secret'),
      credentialsRequired: false,
      requestProperty: 'payload'
    }
    this.app.use(expressJwt(jwtOption).unless({ path: ['/graphiql'] }))
    this.app.use(processPayload)
    this.createControllers(this.app)
    this.createSubscriptionManager(this.app)
  }

  createControllers (app) {
    app.use('/api/graphql', bodyParser.json(), graphqlRouter)
    app.use('/graphiql', graphiqlExpress({
      endpointURL: '/api/graphql',
      subscriptionsEndpoint: '\' + (window.location.protocol === \'https\' ? \'wss://\' : \'ws://\') + window.location.host + \'/subscriptions'
    }))
  }

  createSubscriptionManager (app) {
    this.subscriptionsServer = new SubscriptionServer(
      {
        schema,
        execute,
        subscribe,
        onConnect (connectionParams, webSocket) {
          debug(`createSubscriptionManager.onConnect for user ${webSocket.upgradeReq.user}`)
          if (webSocket.upgradeReq.user) {
            return {
              user: webSocket.upgradeReq.user
            }
          }
          return {}
        }
      },
      {
        server: this.server,
        path: '/subscriptions',
        verifyClient
      }
    )
  }

  run () {
    this.server.listen(this.app.get('port'), () => log('Express server listening on port ' + this.app.get('port')))
  }

  stop () {
    this.server.close()
  }
}
