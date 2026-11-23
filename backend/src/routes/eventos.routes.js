// Rotas de /api/eventos. Este é o modelo das demais rotas (ecopontos, notícias, perguntas):
//   GET    /          lista todos            (público)
//   GET    /:id       busca um               (público)
//   POST   /          cria                   (só admin)
//   PUT    /:id       altera                 (só admin)
//   DELETE /:id       exclui                 (só admin)
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { autenticar } from '../middlewares/auth.js'
import { AppError, lerId, texto } from '../utils/erros.js'

const router = Router()

// Regras do que o front pode enviar. Se algo não bater, o zod lança ZodError (vira HTTP 400).
const eventoSchema = z.object({
  titulo: texto('Título', 150),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD.'),
  local: texto('Local', 200),
  descricao: texto('Descrição', 2000),
})

// O banco guarda a data como Date, mas o front usa texto "2026-11-08". Estas funções convertem.
const paraBanco = (d) => ({ ...d, data: new Date(`${d.data}T00:00:00.000Z`) })
const paraFront = (e) => ({ ...e, data: e.data.toISOString().slice(0, 10) })

// Busca um evento ou responde 404 se não existir
async function buscarOu404(id) {
  const evento = await prisma.evento.findUnique({ where: { id } })
  if (!evento) throw new AppError('Evento não encontrado.', 404, 'NAO_ENCONTRADO')
  return evento
}

// Lista (ordenada pela data)
router.get('/', async (req, res) => {
  const eventos = await prisma.evento.findMany({ orderBy: [{ data: 'asc' }, { id: 'asc' }] })
  res.json(eventos.map(paraFront))
})

// Busca um
router.get('/:id', async (req, res) => {
  res.json(paraFront(await buscarOu404(lerId(req))))
})

// Cria (autenticar = exige login de admin)
router.post('/', autenticar, async (req, res) => {
  const dados = eventoSchema.parse(req.body) // valida o que veio do front
  const evento = await prisma.evento.create({ data: paraBanco(dados) })
  res.status(201).json(paraFront(evento)) // 201 = criado
})

// Altera
router.put('/:id', autenticar, async (req, res) => {
  const id = lerId(req)
  await buscarOu404(id) // garante que existe
  const dados = eventoSchema.parse(req.body)
  const evento = await prisma.evento.update({ where: { id }, data: paraBanco(dados) })
  res.json(paraFront(evento))
})

// Exclui
router.delete('/:id', autenticar, async (req, res) => {
  const id = lerId(req)
  await buscarOu404(id)
  await prisma.evento.delete({ where: { id } })
  res.status(204).end() // 204 = sucesso, sem conteúdo
})

export default router
