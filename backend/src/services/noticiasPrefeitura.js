// Busca as últimas notícias no site da Prefeitura de Caraguatatuba (que usa WordPress).
// Tentativa 1: API JSON do WordPress  (/wp-json/wp/v2/posts)  -> traz título, resumo, data e foto
// Tentativa 2: feed RSS do site        (/feed/)                -> usado se a API JSON estiver desligada
// O resultado fica guardado na memória por alguns minutos, assim o site da Prefeitura recebe
// poucas consultas, não importa quantas pessoas abram a página de Notícias.
import { AppError } from '../utils/erros.js'

// Endereço base do site (pode ser trocado no .env com NOTICIAS_BASE_URL)
const BASE = (process.env.NOTICIAS_BASE_URL || 'https://www.caraguatatuba.sp.gov.br/pmc').replace(/\/$/, '')
const QUANTIDADE = 3 // quantos cards a página mostra
const CACHE_MS = (Number(process.env.NOTICIAS_CACHE_MIN) || 10) * 60 * 1000 // padrão: 10 minutos

export const FONTE = { nome: 'Prefeitura de Caraguatatuba', url: BASE }

// ---------- Funções de limpeza de texto ----------
const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', aacute: 'á', agrave: 'à', acirc: 'â', atilde: 'ã', ccedil: 'ç', eacute: 'é', ecirc: 'ê', iacute: 'í', oacute: 'ó', ocirc: 'ô', otilde: 'õ', uacute: 'ú', Aacute: 'Á', Eacute: 'É', Oacute: 'Ó', Ccedil: 'Ç', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' }

// Troca códigos como &#8211; e &amp; pelos caracteres de verdade
const decodificar = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, nome) => ENTIDADES[nome] ?? ENTIDADES[nome.toLowerCase()] ?? m)

// Remove tags HTML e espaços repetidos
const limparHtml = (s = '') => decodificar(String(s).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()

// Corta o resumo em ~200 caracteres, sem partir palavras, e tira "[…]" e "O post ... apareceu primeiro em ..."
function resumir(html) {
  let t = limparHtml(html)
    .replace(/\[(…|\.\.\.)\]/g, '')
    .replace(/O post .* apareceu primeiro .*$/i, '')
    .replace(/The post .* appeared first on .*$/i, '')
    .trim()
  if (t.length > 200) t = t.slice(0, 200).replace(/\s+\S*$/, '') + '…'
  return t
}

// Só aceita links http/https (evita "javascript:" e similares)
const urlSegura = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u) ? u : null)

// ---------- Acesso ao site ----------
async function baixar(url, aceita) {
  const resposta = await fetch(url, {
    headers: { 'User-Agent': 'EcoRota/1.0 (site educativo sobre resíduos)', Accept: aceita },
    signal: AbortSignal.timeout(8000), // desiste após 8 segundos
  })
  if (!resposta.ok) throw new Error(`${url} respondeu ${resposta.status}`)
  return resposta
}

// Tentativa 1: API JSON do WordPress
async function viaApiWordPress() {
  const resposta = await baixar(`${BASE}/wp-json/wp/v2/posts?per_page=${QUANTIDADE}&_embed=1`, 'application/json')
  const posts = await resposta.json()
  if (!Array.isArray(posts) || posts.length === 0) throw new Error('API do WordPress sem posts')

  return posts.slice(0, QUANTIDADE).map((p) => {
    const midia = p._embedded?.['wp:featuredmedia']?.[0] // imagem de destaque
    const categoria = p._embedded?.['wp:term']?.[0]?.[0]?.name // primeira categoria
    return {
      id: p.id,
      titulo: limparHtml(p.title?.rendered),
      texto: resumir(p.excerpt?.rendered),
      foto: urlSegura(midia?.media_details?.sizes?.medium_large?.source_url || midia?.source_url),
      categoria: limparHtml(categoria) || 'Prefeitura',
      publicadoEm: p.date_gmt ? `${p.date_gmt}Z` : p.date,
      link: urlSegura(p.link),
    }
  })
}

// Tentativa 2: feed RSS
async function viaFeedRss() {
  const { XMLParser } = await import('fast-xml-parser') // só carrega se for preciso
  const resposta = await baixar(`${BASE}/feed/`, 'application/rss+xml, application/xml, text/xml')
  const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' }).parse(await resposta.text())

  let itens = xml?.rss?.channel?.item || []
  if (!Array.isArray(itens)) itens = [itens] // feed com um único item vira objeto
  if (itens.length === 0) throw new Error('Feed RSS sem itens')

  return itens.slice(0, QUANTIDADE).map((i) => {
    const conteudo = i['content:encoded'] || i.description || ''
    const imagemNoTexto = String(conteudo).match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]
    const categoria = Array.isArray(i.category) ? i.category[0] : i.category
    return {
      id: i.guid?.['#text'] ?? i.guid ?? i.link,
      titulo: limparHtml(i.title),
      texto: resumir(i.description),
      foto: urlSegura(i['media:content']?.['@_url'] || i.enclosure?.['@_url'] || imagemNoTexto),
      categoria: limparHtml(typeof categoria === 'object' ? categoria?.['#text'] : categoria) || 'Prefeitura',
      publicadoEm: i.pubDate ? new Date(i.pubDate).toISOString() : null,
      link: urlSegura(i.link),
    }
  })
}

// ---------- Cache ----------
let cache = { noticias: null, atualizadoEm: 0 }
let emAndamento = null // evita duas buscas ao mesmo tempo

async function buscarNoSite() {
  try {
    return await viaApiWordPress()
  } catch (erroApi) {
    console.warn('[noticias] API JSON falhou, tentando RSS:', erroApi.message)
    return await viaFeedRss()
  }
}

// Devolve { noticias, atualizadoEm, desatualizado }.
// Se o site da Prefeitura estiver fora do ar, devolve as últimas notícias guardadas (desatualizado = true).
export async function obterNoticiasPrefeitura() {
  const valido = cache.noticias && Date.now() - cache.atualizadoEm < CACHE_MS
  if (valido) return { noticias: cache.noticias, atualizadoEm: cache.atualizadoEm, desatualizado: false }

  try {
    emAndamento ??= buscarNoSite().finally(() => (emAndamento = null))
    const noticias = await emAndamento
    cache = { noticias, atualizadoEm: Date.now() }
    return { noticias, atualizadoEm: cache.atualizadoEm, desatualizado: false }
  } catch (erro) {
    console.error('[noticias] não foi possível buscar no site da Prefeitura:', erro.message)
    if (cache.noticias) return { noticias: cache.noticias, atualizadoEm: cache.atualizadoEm, desatualizado: true }
    throw new AppError('Não foi possível buscar as notícias da Prefeitura agora.', 502, 'FONTE_INDISPONIVEL')
  }
}
