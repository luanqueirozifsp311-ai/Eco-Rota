import { createContext, useContext, useState, useEffect } from 'react'
import { api, getToken, setToken } from './api'

const Ctx = createContext()

// Estado global: eventos e ecopontos vêm da API (MySQL); o login do admin usa JWT.
export function Provider({ children }) {
  const [eventos, setEventos] = useState([])
  const [ecopontos, setEcopontos] = useState([])
  const [noticias, setNoticias] = useState([]) // usadas no painel do admin
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [admin, setAdmin] = useState(!!getToken())

  const setters = { eventos: setEventos, ecopontos: setEcopontos, noticias: setNoticias }

  useEffect(() => {
    let vivo = true
    Promise.all([api.get('/eventos'), api.get('/ecopontos'), api.get('/noticias')])
      .then(([ev, eco, not]) => {
        if (!vivo) return
        setEventos(ev)
        setEcopontos(eco)
        setNoticias(not)
      })
      .catch((e) => vivo && setErro(e.message))
      .finally(() => vivo && setCarregando(false))
    return () => {
      vivo = false
    }
  }, [])

  // Se havia um token salvo, confirma que ainda é válido
  useEffect(() => {
    if (getToken()) {
      api.get('/auth/me').catch(() => {
        setToken(null)
        setAdmin(false)
      })
    }
  }, [])

  const login = async (usuario, senha) => {
    const { token } = await api.post('/auth/login', { usuario, senha })
    setToken(token)
    setAdmin(true)
  }

  const logout = () => {
    setToken(null)
    setAdmin(false)
  }

  // Se a sessão expirou durante a operação, volta para o modo visitante
  const protegido = async (fn) => {
    try {
      return await fn()
    } catch (e) {
      if (e.status === 401) setAdmin(false)
      throw e
    }
  }

  const salvar = (recurso, dados, id) =>
    protegido(async () => {
      const salvo = id ? await api.put(`/${recurso}/${id}`, dados) : await api.post(`/${recurso}`, dados)
      setters[recurso]((lista) => (id ? lista.map((x) => (x.id === id ? salvo : x)) : [...lista, salvo]))
    })

  const excluir = (recurso, id) =>
    protegido(async () => {
      await api.del(`/${recurso}/${id}`)
      setters[recurso]((lista) => lista.filter((x) => x.id !== id))
    })

  return (
    <Ctx.Provider value={{ eventos, ecopontos, noticias, carregando, erro, admin, login, logout, salvar, excluir }}>
      {children}
    </Ctx.Provider>
  )
}
export const useApp = () => useContext(Ctx)
