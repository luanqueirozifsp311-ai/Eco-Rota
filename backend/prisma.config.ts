// Configuração da ferramenta de linha de comando do Prisma (migrate, generate, seed, studio).
// No Prisma 7 o endereço do banco fica aqui, e não mais no schema.prisma.
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

const { DATABASE_USER, DATABASE_PASSWORD = '', DATABASE_HOST = 'localhost', DATABASE_PORT = '3306', DATABASE_NAME } = process.env

// DATABASE_URL é o formato usado pela maioria dos bancos gerenciados (PlanetScale, Aiven, etc.).
// Se não for informada, montamos a URL a partir das variáveis separadas.
// encodeURIComponent evita problemas se a senha tiver caracteres como @ ou #.
const url =
  process.env.DATABASE_URL ||
  `mysql://${encodeURIComponent(DATABASE_USER ?? '')}:${encodeURIComponent(DATABASE_PASSWORD)}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME ?? ''}`

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Comando executado por "npm run db:seed" (insere os dados iniciais)
    seed: 'tsx prisma/seed.js',
  },
  datasource: { url },
})
