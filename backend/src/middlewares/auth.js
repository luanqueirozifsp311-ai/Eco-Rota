import jwt from 'jsonwebtoken'
import { AppError } from '../utils/erros.js'

// Protege uma rota: só passa quem enviar o cabeçalho  Authorization: Bearer <token>
// (o token é entregue por POST /api/auth/login).
export function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ')

  if (tipo !== 'Bearer' || !token) {
    throw new AppError('Faça login para continuar.', 401, 'NAO_AUTENTICADO')
  }

  // verify confere a assinatura e a validade. Se falhar, lança um erro
  // (JsonWebTokenError / TokenExpiredError) que o middleware de erros transforma em 401.
  req.usuario = jwt.verify(token, process.env.JWT_SECRET)
  next() // token ok: continua para a rota
}
