import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { localizarEcopontos } from './geocode'

// Pino verde em SVG (evita os problemas de imagem padrão do Leaflet com o Vite)
const pino = L.divIcon({
  className: '',
  html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 11 15 25 15 25s15-14 15-25C30 6.7 23.3 0 15 0z" fill="#07bddc" stroke="#0b3a5c" stroke-width="1.5"/>
    <circle cx="15" cy="15" r="6" fill="#fff"/></svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 40], // a ponta do pino fica exatamente na posição
  popupAnchor: [0, -36],
})

// Escapa texto vindo do banco antes de colocar no HTML do balão (evita injeção de HTML)
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

// Mapa com todos os ecopontos. Recebe a lista de ecopontos (a mesma da página Descarte).
export default function MapaEcopontos({ ecopontos }) {
  const divRef = useRef(null) // elemento HTML onde o mapa é desenhado
  const mapaRef = useRef(null) // objeto do Leaflet
  const [achados, setAchados] = useState(0)
  const [aproximados, setAproximados] = useState(0) // pinos no centro do bairro
  const [falhas, setFalhas] = useState([]) // ecopontos que não foram localizados
  const [buscando, setBuscando] = useState(true)

  // 1) Cria o mapa uma única vez (centrado em Caraguatatuba)
  useEffect(() => {
    const mapa = L.map(divRef.current).setView([-23.62, -45.413], 12)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa)
    mapaRef.current = mapa
    return () => {
      mapa.remove() // limpa ao fechar a janela
      mapaRef.current = null
    }
  }, [])

  // 2) Localiza cada ecoponto e coloca um pino no mapa
  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa) return
    let cancelado = false
    const pinos = []

    localizarEcopontos(
      ecopontos,
      (e, [lat, lng], aproximado) => {
        const rota = 'https://www.google.com/maps/search/' + encodeURIComponent(e.endereco)
        const marcador = L.marker([lat, lng], { icon: pino, title: e.nome }).addTo(mapa)
        marcador.bindPopup(
          `<strong>${esc(e.nome)}</strong><br>${esc(e.endereco)}<br>
           <small><b>Funcionamento:</b> ${esc(e.horario)}<br><b>Descartes:</b> ${esc(e.descartes)}</small><br>
           ${aproximado ? '<small><i>Posição aproximada (centro do bairro)</i></small><br>' : ''}
           <a href="${rota}" target="_blank" rel="noreferrer">Ver rota</a>`
        )
        pinos.push(marcador)
        setAchados(pinos.length)
        if (aproximado) setAproximados((n) => n + 1)
        // Ajusta o zoom para caber todos os pinos já encontrados
        mapa.fitBounds(L.featureGroup(pinos).getBounds().pad(0.2), { maxZoom: 15 })
      },
      () => cancelado
    ).then((faltaram) => {
      if (cancelado) return
      setFalhas(faltaram)
      setBuscando(false)
    })

    return () => {
      cancelado = true
    }
  }, [ecopontos])

  return (
    <div>
      {/* isolation: mantém as camadas do mapa abaixo do botão de fechar da janela */}
      <div ref={divRef} className="w-full h-[60vh] rounded-xl border border-slate-200" style={{ isolation: 'isolate' }} />

      <p className="text-xs text-slate-500 mt-3">
        {buscando
          ? `Localizando ecopontos no mapa... ${achados} de ${ecopontos.length}`
          : `${achados} de ${ecopontos.length} ecopontos no mapa. Clique em um pino para ver os detalhes.`}
      </p>

      {aproximados > 0 && (
        <p className="text-xs text-amber-600 mt-1">
          {aproximados} pino(s) estão no centro do bairro (posição aproximada). Para a posição exata, cadastre a localização
          do ecoponto no painel do administrador.
        </p>
      )}

      {falhas.length > 0 && (
        <p className="text-xs text-red-500 mt-1">
          Não foi possível localizar: {falhas.map((f) => f.ecoponto.nome).join(', ')}.{' '}
          {falhas.some((f) => f.motivo === 'servico')
            ? 'O serviço de mapas não respondeu; tente de novo em instantes. '
            : 'O endereço não foi encontrado no mapa. '}
          Cadastre a localização exata no painel do administrador ou use “Ver Rota” na lista.
        </p>
      )}
    </div>
  )
}
