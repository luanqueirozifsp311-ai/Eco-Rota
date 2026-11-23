import { useState, useEffect } from 'react'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { api } from '../api'

// Notícias de reserva: só aparecem se a API estiver fora do ar ou ainda não houver nenhuma notícia cadastrada
const noticiasPadrao = [
  {
    categoria: 'Campanha Ativa',
    titulo: 'Operação Praia Limpa Verão 2025',
    texto:
      'Ação de conscientização com distribuição de sacolas biodegradáveis e mutirão de limpeza diário nas praias de maior movimento.',
    foto: '/img/card1.png',
  },
  {
    categoria: 'Educação',
    titulo: 'Programa de Reciclagem de Óleo de Cozinha',
    texto:
      'Leve seu óleo usado em garrafa PET até os Ecopontos e evita a contaminação de milhares de litros de águas das nossas praias.',
    foto: '/img/card2.png',
  },
  {
    categoria: 'Utilidade',
    titulo: 'Novo Sistema de Agendamento de Grandes Volumes',
    texto:
      'Agora você pode agendar a retirada de sofás e móveis velhos diretamente pelo portal de serviços ao cidadão de Caraguatatuba.',
    foto: '/img/card3.png',
  },
]

const SITE_PREFEITURA = 'https://www.caraguatatuba.sp.gov.br'
const ATUALIZAR_A_CADA_MS = 5 * 60 * 1000 // confere se há notícia nova a cada 5 minutos

const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '')

export default function Noticias() {
  const [lista, setLista] = useState([]) // cards mostrados (no máximo 3)
  const [origem, setOrigem] = useState('') // 'banco' (cadastradas no painel) ou 'padrao' (reserva)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let vivo = true // evita atualizar a tela depois que a página foi fechada

    async function carregar() {
      try {
        // A API devolve as notícias cadastradas no painel do admin, da mais recente para a mais antiga
        const doBanco = await api.get('/noticias')
        if (!vivo) return
        if (doBanco.length === 0) throw new Error('nenhuma notícia cadastrada')
        setLista(doBanco.slice(0, 3))
        setOrigem('banco')
      } catch {
        if (!vivo) return
        setLista(noticiasPadrao)
        setOrigem('padrao')
      } finally {
        if (vivo) setCarregando(false)
      }
    }

    carregar()
    const timer = setInterval(carregar, ATUALIZAR_A_CADA_MS) // repete de tempos em tempos
    return () => {
      vivo = false
      clearInterval(timer)
    }
  }, [])

  return (
    <>
      {/* =========================
          BANNER DA PÁGINA
      ========================== */}
      <section
        className="relative h-56 bg-cover bg-center flex flex-col justify-center items-center text-white text-center px-6"
        style={{ backgroundImage: "url('/img/litoral.jpg'), linear-gradient(135deg, #0a5b86, #07bddc)" }}
      >
        {/* Escurece um pouco a imagem do banner */}
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10">
          <h1 className="text-3xl sm:text-5xl font-bold drop-shadow">Notícias do Litoral</h1>
          <p className="mt-3 font-semibold drop-shadow">Acesse as notícias mais recentes do litoral paulista.</p>
        </div>
      </section>

      {/* =========================
          CARDS DE NOTÍCIAS
      ========================== */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Enquanto carrega: 3 cards "esqueleto" */}
          {carregando &&
            [0, 1, 2].map((n) => (
              <div key={n} className="card overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-100" />
                <div className="p-4 space-y-3">
                  <div className="h-2 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-5/6" />
                  <div className="h-3 bg-slate-100 rounded" />
                  <div className="h-3 bg-slate-100 rounded w-4/5" />
                </div>
              </div>
            ))}

          {!carregando &&
            lista.map(({ id, categoria, titulo, texto, foto, publicadoEm, link }) => (
              <article key={id ?? titulo} className="card overflow-hidden bg-white flex flex-col">
                {/* Imagem do card (se a foto não carregar, aparece o degradê) */}
                <div className="h-40 bg-gradient-to-br from-sky-200 to-eco/40">
                  {foto && (
                    <img
                      src={foto}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  {/* Categoria + Data */}
                  <div className="flex justify-between gap-2 text-[10px] font-bold">
                    <span className="text-eco uppercase">{categoria}</span>
                    <span className="text-slate-400 font-normal">{formatarData(publicadoEm)}</span>
                  </div>

                  <h3 className="font-bold text-navy mt-3">{titulo}</h3>
                  <p className="text-xs text-slate-500 mt-2">{texto}</p>

                  {/* Só mostra o link quando a notícia tem endereço (as da Prefeitura têm) */}
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-navy mt-auto pt-4 inline-flex items-center gap-1 hover:text-eco transition-colors"
                    >
                      Ler matéria
                      <ArrowRight size={12} className="text-eco" />
                    </a>
                  )}
                </div>
              </article>
            ))}
        </div>

        {/* Rodapé */}
        {!carregando && (
          <div className="mt-6 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <p>
              {origem === 'banco' && 'Notícias selecionadas pela equipe do EcoRota.'}
              {/* O aviso do botão só aparece se algum card realmente tiver link */}
              {origem === 'banco' && lista.some((n) => n.link) && ' Clique em "Ler matéria" para abrir a publicação original.'}
              {origem === 'padrao' && 'Mostrando notícias de exemplo.'}
            </p>
            <a href={SITE_PREFEITURA} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-eco hover:underline">
              Ver todas no site da Prefeitura <ExternalLink size={12} />
            </a>
          </div>
        )}
      </section>
    </>
  )
}
