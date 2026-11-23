// Rotas de /api/perguntas (perguntas frequentes; mesma lógica de eventos.routes.js)
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { autenticar } from '../middlewares/auth.js'
import { AppError, lerId, texto } from '../utils/erros.js'

const router = Router()

const perguntaSchema = z.object({
  pergunta: texto('Pergunta', 500),
  resposta: texto('Resposta', 5000),
  ordem: z.coerce.number().int('Ordem deve ser um número inteiro.').min(0).default(0), // posição na lista
})

async function buscarOu404(id) {
  const pergunta = await prisma.pergunta.findUnique({ where: { id } })
  if (!pergunta) throw new AppError('Pergunta não encontrada.', 404, 'NAO_ENCONTRADO')
  return pergunta
}

// Ordenadas pelo campo "ordem"
router.get('/', async (req, res) => {
  res.json(await prisma.pergunta.findMany({ orderBy: [{ ordem: 'asc' }, { id: 'asc' }] }))
})

router.get('/:id', async (req, res) => {
  res.json(await buscarOu404(lerId(req)))
})

router.post('/', autenticar, async (req, res) => {
  const dados = perguntaSchema.parse(req.body)
  res.status(201).json(await prisma.pergunta.create({ data: dados }))
})

router.put('/:id', autenticar, async (req, res) => {
  const id = lerId(req)
  await buscarOu404(id)
  const dados = perguntaSchema.parse(req.body)
  res.json(await prisma.pergunta.update({ where: { id }, data: dados }))
})

router.delete('/:id', autenticar, async (req, res) => {
  const id = lerId(req)
  await buscarOu404(id)
  await prisma.pergunta.delete({ where: { id } })
  res.status(204).end()
})

export default router
