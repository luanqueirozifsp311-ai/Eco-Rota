import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useApp } from '../store'
import Modal from '../Modal'
import MapaEcopontos from '../MapaEcopontos'

export default function Descarte() {
  // Os ecopontos vêm do CRUD de Ecopontos (painel do admin em Eventos)
  const { ecopontos, carregando, erro } = useApp()
  // Controla a janela com o mapa de todos os ecopontos
  const [mapaAberto, setMapaAberto] = useState(false)

  return (
    <section className="max-w-5xl mx-auto px-6 py-10 md:py-14">
      {/* Título e botão do mapa */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6">
        <div>
          <h1 className="font-bebas text-3xl text-navy">Guia de Descarte</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-lg">
            Estações públicas projetadas para receber resíduos volumosos, materiais recicláveis e restos de podas de forma
            totalmente gratuita e ambientalmente segura.
          </p>
        </div>
        <button
          className="btn-o font-bebas !text-base border-2 disabled:opacity-50"
          disabled={ecopontos.length === 0}
          onClick={() => setMapaAberto(true)}
        >
          Ver todos no mapa
        </button>
      </div>

      {/* Lista de ecopontos */}
      <div className="mt-8 md:mt-10 space-y-4">
        {carregando && <p className="text-sm">Carregando ecopontos...</p>}
        {erro && <p className="text-sm text-red-500">{erro}</p>}
        {ecopontos.map((e) => (
          <div key={e.id} className="card px-5 py-4 grid md:grid-cols-[1.4fr_1fr_1.2fr_auto] gap-4 items-center">
            {/* Nome e endereço */}
            <div>
              <p className="font-bebas text-navy text-lg uppercase">{e.nome}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin size={12} />
                {e.endereco}
              </p>
            </div>

            {/* Horário */}
            <div>
              <p className="text-[10px] font-bold text-eco uppercase">Funcionamento</p>
              <p className="text-xs font-semibold text-navy">{e.horario}</p>
            </div>

            {/* O que pode ser descartado */}
            <div>
              <p className="text-[10px] font-bold text-eco uppercase">Principais descartes</p>
              <p className="text-xs text-emerald-500">{e.descartes}</p>
            </div>

            {/* Abre o endereço no Google Maps */}
            <a
              target="_blank"
              rel="noreferrer"
              href={'https://www.google.com/maps/search/' + encodeURIComponent(e.endereco)}
              className="btn-o"
            >
              Ver Rota
            </a>
          </div>
        ))}
      </div>

      {/* Janela com o mapa: só monta o mapa quando aberta */}
      {mapaAberto && (
        <Modal titulo="Ecopontos de Caraguatatuba" onClose={() => setMapaAberto(false)} largura="max-w-5xl">
          <MapaEcopontos ecopontos={ecopontos} />
        </Modal>
      )}
    </section>
  )
}
