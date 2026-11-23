// Rotas de /api/auth: login do administrador
import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { autenticar } from '../middlewares/auth.js'
import { AppError } from '../utils/erros.js'

const router = Router()

const loginSchema = z.object({
  usuario: z.string({ required_error: 'Usuário é obrigatório.' }).trim().min(1, 'Usuário é obrigatório.'),
  senha: z.string({ required_error: 'Senha é obrigatória.' }).min(1, 'Senha é obrigatória.'),
})

// POST /api/auth/login  { "usuario": "admin", "senha": "admin123" }  ->  { token, usuario }
router.post('/login', async (req, res) => {
  const { usuario, senha } = loginSchema.parse(req.body)

  // 1) procura o usuário no banco  2) compara a senha digitada com o hash guardado
  const user = await prisma.usuario.findUnique({ where: { usuario } })
  const senhaCorreta = user && (await bcrypt.compare(senha, user.senhaHash))

  // Mesma mensagem para "usuário não existe" e "senha errada" (não revela qual dos dois falhou)
  if (!senhaCorreta) throw new AppError('Usuário ou senha incorretos.', 401, 'CREDENCIAIS_INVALIDAS')

  // Cria o token (dura 8 horas). O front guarda e envia nas próximas requisições.
  const token = jwt.sign({ usuario: user.usuario }, process.env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: '8h',
  })
  res.json({ token, usuario: { id: user.id, usuario: user.usuario, papel: user.papel } })
})

// GET /api/auth/me  -> confirma se o token ainda é válido e devolve o usuário
router.get('/me', autenticar, async (req, res) => {
  const user = await prisma.usuario.findUnique({ where: { id: Number(req.usuario.sub) } })
  if (!user) throw new AppError('Usuário não existe mais.', 401, 'NAO_AUTENTICADO')
  res.json({ id: user.id, usuario: user.usuario, papel: user.papel })
})

export default router
