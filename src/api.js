// Cliente da API do EcoRota (backend em /backend). Em dev o Vite faz proxy de /api -> localhost:3333.
const BASE = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'ecorota_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY))

export class ApiError extends Error {
  constructor(mensagem, status, detalhes) {
    super(mensagem)
    this.status = status
    this.detalhes = detalhes
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se a API está no ar.', 0)
  }
  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && token && path !== '/auth/login') setToken(null) // sessão expirada
    const erro = data?.erro
    let msg = erro?.mensagem || 'Erro inesperado no servidor.'
    if (Array.isArray(erro?.detalhes)) msg += ' ' + erro.detalhes.map((d) => d.mensagem).join(' ')
    throw new ApiError(msg, res.status, erro?.detalhes)
  }
  return data
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  del: (p) => request(p, { method: 'DELETE' }),
}
