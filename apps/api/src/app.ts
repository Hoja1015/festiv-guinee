import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { errorHandler } from '../src/middlewares/error-handler.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // Les routes des modules (events, auth, etc.) viendront s'ajouter ici, Phase 4+

  app.use(errorHandler)

  return app
}