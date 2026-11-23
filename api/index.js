// Serverless function da Vercel para a API.
// O Express é empacotado em ../api-dist/handler.js por scripts/vercel-build.mjs.
// As rotas continuam em /api (vercel.json faz o rewrite de /api/* para cá).
export { default } from '../api-dist/handler.js'
