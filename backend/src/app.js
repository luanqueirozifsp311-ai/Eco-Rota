// Monta o aplicativo Express (sem ligar o servidor; isso é feito em server.js).
import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'
import { naoEncontrada, tratarErros } from './middlewares/erros.js'

const app = express()

// Permite que o site chame a API. Em produção na Vercel o /api é o mesmo domínio,
// mas a lista também atende quem usar VITE_API_URL apontando para outro host.
const origens = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origem) => origem.trim())
  .filter(Boolean)
app.use(cors({ origin: origens.includes('*') ? true : origens }))

// Faz o Express entender corpos em JSON (req.body)
app.use(express.json({ limit: '100kb' }))

// Todas as rotas começam com /api
app.use('/api', routes)

// Estes DOIS devem ficar por último, nesta ordem:
app.use(naoEncontrada) // rota inexistente -> 404
app.use(tratarErros) // qualquer erro -> resposta JSON padronizada

export default app
