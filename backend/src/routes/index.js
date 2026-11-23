// Junta todas as rotas. Cada grupo ganha um prefixo (ex.: /eventos -> /api/eventos).
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import auth from './auth.routes.js'
import eventos from './eventos.routes.js'
import ecopontos from './ecopontos.routes.js'
import noticias from './noticias.routes.js'
import perguntas from './perguntas.routes.js'

const routes = Router()

// GET /api/health -> diz se a API e o banco estão funcionando
routes.get('/health', async (req, res) => {
  await prisma.$queryRaw`SELECT 1` // se o banco estiver fora, lança erro (vira 503)
  res.json({ status: 'ok', banco: 'ok' })
})

routes.use('/auth', auth)
routes.use('/eventos', eventos)
routes.use('/ecopontos', ecopontos)
routes.use('/noticias', noticias)
routes.use('/perguntas', perguntas)

export default routes
