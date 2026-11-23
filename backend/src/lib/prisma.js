// Conexão única com o banco, usada por toda a API (importe "prisma" daqui).
import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../../generated/prisma/client' // criado por "prisma generate"

// O Prisma 7 usa um "adapter" (o driver que fala com o MySQL).
// O adapter do MariaDB também funciona com MySQL.
// Aceitamos DATABASE_URL (usado por PlanetScale, Aiven, etc.) ou as variáveis separadas.
function configDoBanco() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL)
    return {
      host: decodeURIComponent(url.hostname),
      port: Number(url.port) || 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.slice(1)),
    }
  }

  return {
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME,
  }
}

const config = configDoBanco()

// MySQL hospedado normalmente exige TLS. Ative com DATABASE_SSL=true quando necessário.
const ssl = process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined

export const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    ...config,
    connectionLimit: 5, // máximo de conexões abertas ao mesmo tempo
    allowPublicKeyRetrieval: process.env.DATABASE_ALLOW_PUBLIC_KEY_RETRIEVAL !== 'false',
    ...(ssl ? { ssl } : {}),
  }),
})
