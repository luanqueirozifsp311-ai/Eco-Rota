// Rotas de /api/noticias (mesma lógica de eventos.routes.js)
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { autenticar } from '../middlewares/auth.js'
import { AppError, lerId, texto } from '../utils/erros.js'
import { obterNoticiasPrefeitura, FONTE } from '../services/noticiasPrefeitura.js'

const router = Router()

const noticiaSchema = z.object({
  categoria: texto('Categoria', 60),
  titulo: texto('Título', 200),
  texto: texto('Texto', 5000),
  foto: z.string().trim().max(255, 'Foto deve ter no máximo 255 caracteres.').nullish(), // opcional
  link: z
    .string()
    .trim()
    .max(500, 'Link deve ter no máximo 500 caracteres.')
    .regex(/^https?:\/\//i, 'O link deve começar com http:// ou https://')
    .nullish(), // opcional
  publicadoEm: z.coerce.date({ invalid_type_error: 'Data de publicação inválida.' }).optional(), // opcional
})

async function buscarOu404(id) {
  const noticia = await prisma.noticia.findUnique({ where: { id } })
  if (!noticia) throw new AppError('Notícia não encontrada.', 404, 'NAO_ENCONTRADO')
  return noticia
}

// GET /api/noticias/prefeitura -> as 3 últimas notícias do site da Prefeitura (com cache de alguns minutos).
// IMPORTANTE: esta rota fica ANTES de "/:id", senão "prefeitura" seria lido como um id.
router.get('/prefeitura', async (req, res) => {
  const { noticias, atualizadoEm, desatualizado } = await obterNoticiasPrefeitura()
  res.json({ fonte: FONTE, atualizadoEm: new Date(atualizadoEm).toISOString(), desatualizado, noticias })
})

// Mais recentes primeiro (notícias cadastradas no banco)
router.get('/', async (req, res) => {
  res.json(await prisma.noticia.findMany({ orderBy: [{ publicadoEm: 'desc' }, { id: 'desc' }] }))
})

router.get('/:id', async (req, res) => {
  res.json(await buscarOu404(lerId(req)))
})

router.post('/', autenticar, async (req, res) => {
  const dados = noticiaSchema.parse(req.body)
  res.status(201).json(await prisma.noticia.create({ data: dados }))
})

router.put('/:id', autenticar, async (req, res) => {
  const id = lerId(req)
  await buscarOu404(id)
  const dados = noticiaSchema.parse(req.body)
  res.json(await prisma.noticia.update({ where: { id }, data: dados }))
})

router.delete('/:id', autenticar, async (req, res) => {
  const id = lerId(req)
  await buscarOu404(id)
  await prisma.noticia.delete({ where: { id } })
  res.status(204).end()
})

export default router
