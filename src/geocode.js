// Descobre onde cada ecoponto fica no mapa. A ordem de prioridade é:
//   1) latitude/longitude cadastradas no painel do admin (exatas, sem consultar a internet)
//   2) busca pelo endereço no Nominatim (serviço gratuito do OpenStreetMap)
//   3) busca só pelo bairro (posição aproximada, no centro do bairro)
// Resultados das buscas ficam guardados no navegador (localStorage) para não repetir consultas.
const CHAVE_CACHE = 'ecorota_geocache_v2'
const ESPERA_ENTRE_BUSCAS_MS = 1100 // o Nominatim pede no máximo 1 busca por segundo

const lerCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CACHE)) || {}
  } catch {
    return {}
  }
}
const gravarCache = (cache) => {
  try {
    localStorage.setItem(CHAVE_CACHE, JSON.stringify(cache))
  } catch {
    /* sem localStorage: segue sem cache */
  }
}
const esperar = (ms) => new Promise((r) => setTimeout(r, ms))

// Faz UMA busca. Devolve [lat, lng], ou null se o endereço não existe no mapa.
// Se o serviço recusar a consulta (limite, bloqueio, sem internet), lança erro.
async function buscar(texto) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&q=${encodeURIComponent(texto)}`
  const resposta = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } })
  if (!resposta.ok) throw new Error(`Serviço de mapas respondeu ${resposta.status}`)
  const dados = await resposta.json()
  return dados[0] ? [parseFloat(dados[0].lat), parseFloat(dados[0].lon)] : null
}

// Variações do endereço, da mais precisa para a mais genérica.
// "aproximado" = true quando só achamos o bairro, não a rua.
function tentativas(ecoponto) {
  const comCidade = (s) => (/caraguatatuba/i.test(s) ? s : `${s}, Caraguatatuba, SP`)
  const semNumero = ecoponto.endereco
    .replace(/\bs\/n\b/gi, '')
    .replace(/,?\s*n[ºo°]?\s*\d+/gi, '')
    .replace(/,\s*\d+\s*(?=-)/g, ' ')
  // O bairro é o texto depois do " - " (ex.: "Av. Senador Feijó, s/n - Tinga" -> "Tinga")
  const bairro = ecoponto.endereco.split(' - ')[1]?.split(',')[0]?.trim()

  const lista = [
    { texto: comCidade(ecoponto.endereco), aproximado: false },
    { texto: comCidade(semNumero), aproximado: false },
  ]
  if (bairro) lista.push({ texto: comCidade(bairro), aproximado: true })
  return lista
}

// Localiza todos os ecopontos, um de cada vez. Chama aoEncontrar(ecoponto, [lat, lng], aproximado)
// assim que cada um é achado (os pinos aparecem aos poucos).
// Devolve a lista dos que NÃO foram achados: [{ ecoponto, motivo }]
//   motivo = 'endereco' (não existe no mapa) ou 'servico' (o serviço de mapas recusou/estava fora do ar)
export async function localizarEcopontos(ecopontos, aoEncontrar, estaCancelado = () => false) {
  const cache = lerCache()
  const falhas = []

  for (const e of ecopontos) {
    if (estaCancelado()) return falhas

    // 1) Posição cadastrada pelo admin: usa direto
    if (e.latitude != null && e.longitude != null) {
      aoEncontrar(e, [e.latitude, e.longitude], false)
      continue
    }

    // Já buscamos antes neste navegador
    const guardado = cache[e.endereco]
    if (guardado) {
      aoEncontrar(e, guardado.pos, guardado.aproximado)
      continue
    }

    // 2) e 3) Busca na internet
    let achado = null
    let servicoFalhou = false
    for (const t of tentativas(e)) {
      try {
        const pos = await buscar(t.texto)
        if (pos) achado = { pos, aproximado: t.aproximado }
      } catch {
        servicoFalhou = true
      }
      await esperar(ESPERA_ENTRE_BUSCAS_MS)
      if (achado || estaCancelado()) break
    }

    if (achado) {
      cache[e.endereco] = achado
      gravarCache(cache)
      if (!estaCancelado()) aoEncontrar(e, achado.pos, achado.aproximado)
    } else {
      falhas.push({ ecoponto: e, motivo: servicoFalhou ? 'servico' : 'endereco' })
    }
  }
  return falhas
}
