import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/error-handler.js'
import { authRoutes } from './modules/auth/auth.routes.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: process.env.WEB_URL || 'http://localhost:5173',
      credentials: true,
    })
  )
  app.use(express.json())
  app.use(cookieParser())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/auth', authRoutes)

  app.use(errorHandler)

  return app
}