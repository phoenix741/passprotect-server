import debug from 'debug'
import i18n from 'i18next'

import path from 'path'
import express from 'express'
import http from 'http'

import {websocketVerifyClient as verifyClient} from './config-passport'
import graphqlRouter, {subscriptionManager} from './controllers/graphql'
import { graphiqlExpress } from 'graphql-server-express'
import { SubscriptionServer } from 'subscriptions-transport-ws'

const log = debug('App:Core')

export class Core {
  constructor (app) {
    this.app = app
    this.server = http.createServer(this.app)

    this.createControllers(app)
    this.createSubscriptionManager(app)
  }

  createControllers (app) {
    app.use('/api/graphql', graphqlRouter)
    app.use('/graphiql', graphiqlExpress({
      endpointURL: '/api/graphql',
      subscriptionsEndpoint: '\' + (window.location.protocol === \'https\' ? \'wss://\' : \'ws://\') + window.location.host + \'/subscriptions'
    }))

    app.use(express.static(path.join(__dirname, '..', 'dist', 'dev')))
  }

  createSubscriptionManager (app) {
    this.subscriptionsServer = new SubscriptionServer(
      {
        subscriptionManager,
        onConnect (connectionParams, webSocket) {
          return {
            user: webSocket.upgradeReq.user
          }
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
