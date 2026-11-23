// Build usado pela Vercel: gera o Prisma Client, empacota a API Express como
// uma serverless function e depois gera o site estático com o Vite.
import { execSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { build } from 'esbuild'

function run(args) {
  const comando = `npm ${args.join(' ')}`
  console.log(`\n> ${comando}`)
  execSync(comando, { stdio: 'inherit', shell: true })
}

// 1) O client do Prisma é gitignored e precisa existir antes do bundle.
run(['--prefix', 'backend', 'run', 'db:generate'])

// 2) O client gerado é TypeScript, então empacotamos a API (com esbuild)
//    para a function Node da Vercel receber JavaScript puro, sem tsx em runtime.
mkdirSync('api-dist', { recursive: true })
await build({
  entryPoints: ['backend/src/app.js'],
  outfile: 'api-dist/handler.js',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  // Algumas dependências CJS (express/debug) chamam require() em runtime.
  banner: {
    js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
  },
  logLevel: 'info',
})

// 3) Site (Vite) -> dist/
run(['run', 'build'])
