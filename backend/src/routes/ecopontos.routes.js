// Rotas de /api/ecopontos (mesma lógica de eventos.routes.js, sem conversão de data)
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { autenticar } from '../middlewares/auth.js'
import { AppError, lerId, texto } from '../utils/erros.js'

const router = Router()

// Campos aceitos. latitude e longitude são opcionais (null = sem posição cadastrada),
// mas se um for informado o outro também precisa ser.
const ecopontoSchema = z
  .object({
    nome: texto('Nome', 150),
    endereco: texto('Endereço', 255),
    horario: texto('Horário', 120),
    descartes: texto('Descartes', 2000),
    latitude: z.number({ invalid_type_error: 'Latitude deve ser um número.' }).min(-90, 'Latitude entre -90 e 90.').max(90, 'Latitude entre -90 e 90.').nullish(),
    longitude: z.number({ invalid_type_error: 'Longitude deve ser um número.' }).min(-180, 'Longitude entre -180 e 180.').max(180, 'Longitude entre -180 e 180.').nullish(),
  })
  .refine((d) => (d.latitude == null) === (d.longitude == null), {
    message: 'Informe latitude e longitude juntas.',
    path: ['latitude'],
  })

async function buscarOu404(id) {
  const ecoponto = await prisma.ecoponto.findUnique({ where: { id } })
  if (!ecoponto) throw new AppError('Ecoponto não encontrado.', 404, 'NAO_ENCONTRADO')
  return ecoponto
}

router.get('/', async (req, res) => {
  res.json(await prisma.ecoponto.findMany({ orderBy: { id: 'asc' } }))
})

router.get('/:id', async (req, res) => {
  res.json(await buscarOu404(lerId(req)))
})

router.post('/', autenticar, async (req, res) => {
  const dados = ecopontoSchema.parse(req.body)
  res.status(201).json(await prisma.ecoponto.create({ data: dados }))
})

router.put('/:id', autenticar, async (req, res) => {
  const id = lerId(req)
  await buscarOu404(id)
  const dados = ecopontoSchema.parse(req.body)
  res.json(await prisma.ecoponto.update({ where: { id }, data: dados }))
})

router.delete('/:id', autenticar, async (req, res) => {
  const id = lerId(req)
  await buscarOu404(id)
  await prisma.ecoponto.delete({ where: { id } })
  res.status(204).end()
})

export default router
