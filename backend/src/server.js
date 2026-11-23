// Ponto de entrada: "npm run dev" executa este arquivo.
import 'dotenv/config' // carrega o arquivo .env (precisa vir primeiro)
import app from './app.js'
import { prisma } from './lib/prisma.js'

// Sem estas variáveis a API não funciona: avisa logo, de forma clara
const obrigatorias = ['JWT_SECRET']
// Com DATABASE_URL não é preciso informar usuário/banco separadamente.
if (!process.env.DATABASE_URL) obrigatorias.push('DATABASE_USER', 'DATABASE_NAME')
const faltando = obrigatorias.filter((nome) => !process.env[nome])
if (faltando.length > 0) {
  console.error(`Faltam variáveis no .env: ${faltando.join(', ')}. Copie o .env.example para .env e preencha.`)
  process.exit(1)
}

// Testa a conexão com o MySQL antes de abrir a API
try {
  await prisma.$queryRaw`SELECT 1`
} catch (erro) {
  console.error('Não foi possível conectar ao MySQL. Confira se ele está ligado e se o .env está correto.')
  console.error(erro.message)
  process.exit(1)
}

const porta = Number(process.env.PORT) || 3333
app.listen(porta, () => console.log(`API rodando em http://localhost:${porta}/api`))

// Evita que a API caia silenciosamente por um erro que ninguém tratou
process.on('unhandledRejection', (erro) => console.error('Promessa rejeitada sem tratamento:', erro))
