import { useState } from 'react'
import { CalendarDays, MapPin, Lock, LogOut } from 'lucide-react'
import { useApp } from '../store'
import Crud from '../Crud'

// Campos do formulário do CRUD de Eventos
const camposEvento = [
  { k: 'titulo', label: 'Título' },
  { k: 'data', label: 'Data', type: 'date' },
  { k: 'local', label: 'Local' },
  { k: 'descricao', label: 'Descrição', type: 'textarea' },
]

// Campos do formulário do CRUD de Ecopontos
const camposEcoponto = [
  { k: 'nome', label: 'Nome do Ecoponto' },
  { k: 'endereco', label: 'Endereço' },
  { k: 'horario', label: 'Horário de funcionamento' },
  { k: 'descartes', label: 'Principais descartes (separados por vírgula)', type: 'textarea' },
  {
    k: 'coordenadas',
    label: 'Localização no mapa (opcional)',
    optional: true,
    hint: 'No Google Maps, clique com o botão direito no local, clique nos números que aparecem e cole aqui. Ex.: -23.6203, -45.4131',
  },
]

// Ao editar: junta latitude e longitude em um único campo de texto
const coordenadasParaForm = (e) => ({
  ...e,
  coordenadas: e.latitude != null && e.longitude != null ? `${e.latitude}, ${e.longitude}` : '',
})

// Ao salvar: separa o texto "lat, lng" em dois números (ou null se estiver vazio)
function coordenadasParaApi({ coordenadas, ...resto }) {
  const texto = String(coordenadas || '').trim()
  if (!texto) return { ...resto, latitude: null, longitude: null }
  const partes = texto.split(/[;,\s]+/).filter(Boolean).map((n) => Number(n.replace(',', '.')))
  if (partes.length !== 2 || partes.some((n) => Number.isNaN(n))) {
    throw new Error('Localização inválida. Use o formato: -23.6203, -45.4131')
  }
  return { ...resto, latitude: partes[0], longitude: partes[1] }
}

// Campos do formulário do CRUD de Notícias
const camposNoticia = [
  { k: 'categoria', label: 'Categoria (ex.: Utilidade, Educação, Campanha Ativa)' },
  { k: 'titulo', label: 'Título' },
  { k: 'texto', label: 'Resumo da notícia', type: 'textarea' },
  {
    k: 'link',
    label: 'Link da matéria completa (opcional)',
    optional: true,
    hint: 'Endereço da notícia no site da Prefeitura. Aparece no botão "Ler matéria". Ex.: https://www.caraguatatuba.sp.gov.br/...',
  },
  {
    k: 'foto',
    label: 'Endereço da imagem (opcional)',
    optional: true,
    hint: 'Clique com o botão direito na foto da notícia e escolha "Copiar endereço da imagem". Também funciona /img/arquivo.png.',
  },
  { k: 'publicadoEm', label: 'Data da publicação (opcional)', type: 'date', optional: true, hint: 'Se vazio, usa a data de hoje.' },
]

// Ao editar: a data vem como "2026-09-10T12:00:00.000Z"; o campo de data quer só "2026-09-10"
const noticiaParaForm = (n) => ({ ...n, publicadoEm: n.publicadoEm ? String(n.publicadoEm).slice(0, 10) : '' })

// Ao salvar: campos vazios viram null (ou são omitidos, no caso da data)
function noticiaParaApi({ publicadoEm, link, foto, ...resto }) {
  const dados = { ...resto, link: String(link || '').trim() || null, foto: String(foto || '').trim() || null }
  // meio-dia (UTC) evita que o fuso horário mostre o dia anterior
  if (publicadoEm) dados.publicadoEm = `${publicadoEm}T12:00:00.000Z`
  return dados
}

// Transforma "2026-11-08" em "08/11/2026"
const formatarData = (d) => (d ? new Date(d + 'T12:00').toLocaleDateString('pt-BR') : '')

export default function Eventos() {
  const { eventos, ecopontos, noticias, admin, login, logout, salvar, excluir, carregando, erro: erroApi } = useApp()

  // Estado do login e da aba do painel
  const [modalAberto, setModalAberto] = useState(false)
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [aba, setAba] = useState('eventos')

  // Valida usuário e senha do administrador
  const entrar = async (e) => {
    e.preventDefault()
    try {
      await login(usuario, senha)
      setModalAberto(false)
      setErro('')
      setUsuario('')
      setSenha('')
    } catch (err) {
      setErro(err.message)
    }
  }

  // Eventos ordenados por data
  const eventosOrdenados = [...eventos].sort((a, b) => a.data.localeCompare(b.data))

  // Notícias mais recentes primeiro (no painel)
  const noticiasOrdenadas = [...noticias].sort((a, b) => String(b.publicadoEm).localeCompare(String(a.publicadoEm)))

  return (
    <section className="max-w-5xl mx-auto px-6 py-10 md:py-14">
      {/* Título e botão de login/logout */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h1 className="font-bebas text-3xl text-navy">Eventos</h1>
        {admin ? (
          <button className="btn-o" onClick={logout}>
            <LogOut size={14} className="mr-2" />
            Sair do modo Admin
          </button>
        ) : (
          <button className="btn-o" onClick={() => setModalAberto(true)}>
            <Lock size={14} className="mr-2" />
            Área do Administrador
          </button>
        )}
      </div>
      <p className="text-sm text-slate-500 mt-2">Participe das ações ambientais de Caraguatatuba.</p>

      {/* Lista pública de eventos */}
      <div className="grid md:grid-cols-2 gap-5 mt-8">
        {carregando && <p className="text-sm">Carregando eventos...</p>}
        {erroApi && <p className="text-sm text-red-500">{erroApi}</p>}
        {!carregando && !erroApi && eventosOrdenados.length === 0 && <p className="text-sm">Nenhum evento cadastrado.</p>}
        {eventosOrdenados.map((e) => (
          <article key={e.id} className="card p-5">
            <h3 className="font-bold text-navy">{e.titulo}</h3>
            <p className="text-xs text-eco font-bold mt-2 flex items-center gap-1">
              <CalendarDays size={13} />
              {formatarData(e.data)}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin size={13} />
              {e.local}
            </p>
            <p className="text-sm text-slate-600 mt-3">{e.descricao}</p>
          </article>
        ))}
      </div>

      {/* Painel do administrador (só aparece logado) */}
      {admin && (
        <div className="mt-12 md:mt-16 border-t border-cyan-100 pt-10">
          <h2 className="font-bebas text-2xl text-navy">Painel do Administrador</h2>

          {/* Abas */}
          <div className="flex flex-wrap gap-2 my-5">
            {[['eventos', 'Eventos'], ['ecopontos', 'Ecopontos'], ['noticias', 'Notícias']].map(([chave, nome]) => (
              <button
                key={chave}
                onClick={() => setAba(chave)}
                className={'px-5 py-2 rounded-full text-sm font-semibold ' + (aba === chave ? 'bg-eco text-white' : 'bg-ice text-eco')}
              >
                {nome}
              </button>
            ))}
          </div>

          {/* CRUD da aba selecionada */}
          {aba === 'eventos' ? (
            <Crud
              title="evento"
              items={eventos}
              onSave={(dados, id) => salvar('eventos', dados, id)}
              onDelete={(id) => excluir('eventos', id)}
              fields={camposEvento}
              line={(i) => (
                <>
                  <p className="font-bold text-navy">{i.titulo}</p>
                  <p className="text-xs text-slate-500">{formatarData(i.data)} · {i.local}</p>
                  <p className="text-xs mt-1">{i.descricao}</p>
                </>
              )}
            />
          ) : aba === 'ecopontos' ? (
            <Crud
              title="ecoponto"
              items={ecopontos}
              onSave={(dados, id) => salvar('ecopontos', dados, id)}
              onDelete={(id) => excluir('ecopontos', id)}
              fields={camposEcoponto}
              paraForm={coordenadasParaForm}
              paraApi={coordenadasParaApi}
              line={(i) => (
                <>
                  <p className="font-bold text-navy">{i.nome}</p>
                  <p className="text-xs text-slate-500">{i.endereco}</p>
                  <p className="text-xs">{i.horario}</p>
                  <p className="text-xs text-emerald-500">{i.descartes}</p>
                  <p className="text-[11px] text-slate-400">
                    {i.latitude != null ? `Mapa: ${i.latitude}, ${i.longitude}` : 'Sem localização cadastrada (o mapa tentará achar pelo endereço)'}
                  </p>
                </>
              )}
            />
          ) : (
            <Crud
              title="notícia"
              items={noticiasOrdenadas}
              onSave={(dados, id) => salvar('noticias', dados, id)}
              onDelete={(id) => excluir('noticias', id)}
              fields={camposNoticia}
              paraForm={noticiaParaForm}
              paraApi={noticiaParaApi}
              line={(i) => (
                <>
                  <p className="text-[10px] font-bold text-eco uppercase">{i.categoria}</p>
                  <p className="font-bold text-navy">{i.titulo}</p>
                  <p className="text-xs text-slate-500">{new Date(i.publicadoEm).toLocaleDateString('pt-BR')}</p>
                  <p className="text-xs mt-1">{i.texto}</p>
                  {i.link && <p className="text-[11px] text-slate-400 truncate">{i.link}</p>}
                </>
              )}
            />
          )}
        </div>
      )}

      {/* Janela de login */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalAberto(false)}>
          <form onSubmit={entrar} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-3">
            <h3 className="font-bold text-navy text-lg">Login do Administrador</h3>
            <input className="inp" placeholder="Usuário" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
            <input className="inp" type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
            {erro && <p className="text-xs text-red-500">{erro}</p>}
            <button className="btn w-full">Entrar</button>
          </form>
        </div>
      )}
    </section>
  )
}
