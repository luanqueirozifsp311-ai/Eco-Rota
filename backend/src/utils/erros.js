import { z } from 'zod'

// Erro "esperado" da API. Quando lançamos um AppError, o middleware de erros
// (src/middlewares/erros.js) responde ao cliente com o status e a mensagem daqui.
//   throw new AppError('Evento não encontrado.', 404, 'NAO_ENCONTRADO')
export class AppError extends Error {
  constructor(mensagem, status = 500, codigo = 'ERRO_INTERNO') {
    super(mensagem)
    this.status = status // código HTTP (400, 401, 404...)
    this.codigo = codigo // nome curto do erro, bom para o front tratar
  }
}

// Lê o :id da URL (/eventos/5) e garante que é um número inteiro positivo.
export function lerId(req) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('O id deve ser um número inteiro positivo.', 400, 'ID_INVALIDO')
  }
  return id
}

// Regra de validação para campos de texto: obrigatório, sem espaços nas pontas e com tamanho máximo.
export const texto = (nome, max) =>
  z
    .string({ required_error: `${nome} é obrigatório.`, invalid_type_error: `${nome} deve ser um texto.` })
    .trim()
    .min(1, `${nome} é obrigatório.`)
    .max(max, `${nome} deve ter no máximo ${max} caracteres.`)
