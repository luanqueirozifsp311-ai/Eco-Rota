import { ZodError } from 'zod'
import { Prisma } from '../../generated/prisma/client'
import { AppError } from '../utils/erros.js'

// Rota que não existe (ex.: GET /api/abc) -> 404
export function naoEncontrada(req, res, next) {
  next(new AppError(`Rota ${req.method} ${req.originalUrl} não encontrada.`, 404, 'ROTA_NAO_ENCONTRADA'))
}

// Códigos que indicam "não consegui falar com o banco"
const ERROS_DE_CONEXAO = ['P1001', 'P1002', 'P1017', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'PROTOCOL_CONNECTION_LOST']

// ÚLTIMO middleware da API: qualquer erro lançado nas rotas cai aqui.
// Ele escolhe o status HTTP e responde sempre no mesmo formato:
//   { "erro": { "codigo": "...", "mensagem": "...", "detalhes": [...] } }
export function tratarErros(err, req, res, next) {
  if (res.headersSent) return next(err)

  // Valores padrão: erro inesperado do servidor
  let status = 500
  let codigo = 'ERRO_INTERNO'
  let mensagem = 'Erro interno do servidor.'
  let detalhes

  if (err instanceof AppError) {
    // Erros que nós mesmos lançamos
    status = err.status
    codigo = err.codigo
    mensagem = err.message
  } else if (err instanceof ZodError) {
    // Dados enviados não passaram na validação
    status = 400
    codigo = 'VALIDACAO'
    mensagem = 'Dados inválidos.'
    detalhes = err.issues.map((i) => ({ campo: i.path.join('.') || 'body', mensagem: i.message }))
  } else if (ERROS_DE_CONEXAO.includes(err.code)) {
    // MySQL desligado ou inacessível
    status = 503
    codigo = 'BANCO_INDISPONIVEL'
    mensagem = 'Banco de dados indisponível. Tente novamente em instantes.'
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Erros conhecidos do Prisma
    if (err.code === 'P2002') {
      status = 409
      codigo = 'REGISTRO_DUPLICADO'
      mensagem = 'Já existe um registro com esse valor.'
    } else if (err.code === 'P2025') {
      status = 404
      codigo = 'NAO_ENCONTRADO'
      mensagem = 'Registro não encontrado.'
    } else if (err.code === 'P2000') {
      status = 400
      codigo = 'VALOR_MUITO_LONGO'
      mensagem = 'Um dos valores é maior que o permitido.'
    }
  } else if (err.type === 'entity.parse.failed') {
    // JSON mal formado no corpo da requisição
    status = 400
    codigo = 'JSON_INVALIDO'
    mensagem = 'O corpo da requisição não é um JSON válido.'
  } else if (err.name === 'TokenExpiredError') {
    status = 401
    codigo = 'TOKEN_EXPIRADO'
    mensagem = 'Sessão expirada. Faça login novamente.'
  } else if (err.name === 'JsonWebTokenError') {
    status = 401
    codigo = 'TOKEN_INVALIDO'
    mensagem = 'Token inválido.'
  }

  // Erros 5xx são bugs ou falhas nossas: registra no terminal para investigarmos
  if (status >= 500) console.error(`${req.method} ${req.originalUrl}`, err)

  res.status(status).json({ erro: { codigo, mensagem, ...(detalhes && { detalhes }) } })
}
