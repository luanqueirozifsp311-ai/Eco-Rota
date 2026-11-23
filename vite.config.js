import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
// Em desenvolvimento, chamadas para /api vão para o backend (npm run dev dentro de /backend)
export default defineConfig({plugins:[react()],server:{proxy:{'/api':'http://localhost:3333'}}})
