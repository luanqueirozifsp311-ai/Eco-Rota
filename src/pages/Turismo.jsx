import { useState } from 'react'
import { CheckCircle2, ExternalLink, AlertTriangle } from 'lucide-react'
import Modal from '../Modal'

// Lista de boas práticas ao lado do texto principal
const dicas = [
  'Reduzir o lixo deixado nas praias e trilhas.',
  'Economizar água e energia durante a estadia.',
  'Valorizar produtores e comerciantes locais.',
  'Participar de ações ambientais e eventos da cidade.',
]

// Cards "Para onde vai a arrecadação da taxa?"
const destinoTaxa = [
  { percentual: '45%', titulo: 'Coleta & Triagem', texto: 'Manutenção diária dos caminhões e frotas de reciclagem.' },
  { percentual: '30%', titulo: 'Limpeza de Praias', texto: 'Esforço focado para manter a areia e orla limpas.' },
  { percentual: '25%', titulo: 'Tratamento Final', texto: 'Destinação adequada e aterro controlado certificado.' },
]


// ---------------------------------------------------------------------------
// DADOS DAS JANELAS "Tabela de Valores" e "Legislação Completa"
// Fonte: Lei Municipal nº 2.815/2025 (Diário Oficial de 18/12/2025), informes da Prefeitura de Caraguatatuba
// e notícias de jun/jul 2026. Para atualizar o conteúdo, basta editar as listas abaixo.
// ---------------------------------------------------------------------------

const LINK_ANEXO = 'https://caraguatatuba.legislacaocompilada.com.br/Arquivo/Documents/legislacao/ANEXO_L28152025.pdf'
const LINK_LEI = 'https://diariooficial.caraguatatuba.sp.gov.br/public/consulta/diario/pdf/140'
const LINK_VETO = 'https://diariooficial.caraguatatuba.sp.gov.br/public/consulta/diario/pdf/298'
const LINK_ISENCAO = 'https://www.caraguatatuba.sp.gov.br/pmc/2026/04/isencao-tmrsu-taxa-do-servico-publico-de-manejo-de-residuos-solidos-urbanos/'

// Linhas da tabela de valores (conforme divulgado pela Prefeitura)
const tabelaValores = [
  { faixa: 'De 1 m² a 350 m²', categoria: 'Residencial', valor: 'R$ 0,25 por m² de área construída' },
  { faixa: 'De 1 m² a 350 m²', categoria: 'Comercial', valor: 'R$ 0,37 por m² de área construída' },
  { faixa: 'De 1 m² a 350 m²', categoria: 'Industrial', valor: 'R$ 0,74 por m² de área construída' },
  { faixa: 'Acima de 350 m²', categoria: 'Residencial', valor: 'Valor fixo mensal (ex.: R$ 142,30)' },
  { faixa: 'Acima de 350 m²', categoria: 'Comercial', valor: 'Valor fixo mensal (ex.: R$ 213,45)' },
  { faixa: 'Acima de 350 m²', categoria: 'Industrial', valor: 'Valor fixo por faixa: consulte o Anexo I' },
]

// Regras gerais da cobrança (Lei 2.815/2025)
const regrasCobranca = [
  'Base de cálculo: custo efetivo do serviço, dividido entre os imóveis pela área construída (art. 5º e 16).',
  'Cobrança anual, junto com o IPTU ou na fatura da concessionária de serviço público em até 12 parcelas (art. 6º). Não pode haver corte do serviço por falta de pagamento da taxa.',
  'Atraso: multa de 2% mais juros e correção de 1% ao mês (art. 7º).',
  'Não incide sobre vagas autônomas de garagem e “hobby box” matriculados individualmente (art. 8º).',
  'Isenção para pessoa carente: renda familiar de até 3 salários mínimos, único imóvel no município com até 100 m², moradia própria e residência no município há 3 anos ou mais (art. 9º).',
  'Desconto possível para quem comprovar práticas de redução, reutilização, reciclagem e compostagem de resíduos (art. 11).',
  'Acréscimo de 10% sobre a taxa para a reserva de contingência do Fundo Municipal de Manejo de Resíduos (art. 13).',
]

// Resumo da lei, artigo por artigo
const resumoLei = [
  { art: 'Art. 1º e 2º', texto: 'Institui a taxa pela utilização efetiva ou potencial do serviço de manejo de resíduos sólidos urbanos: coleta, transbordo, transporte, triagem, tratamento (inclusive compostagem) e destinação final adequada. Varrição, capina e limpeza de praças e canais não fazem parte da taxa.' },
  { art: 'Art. 3º e 4º', texto: 'Quem paga: proprietário, titular do domínio útil ou possuidor do imóvel edificado. Também respondem pelo pagamento o usufrutuário, o compromissário comprador, o comodatário e os ocupantes de imóvel público.' },
  { art: 'Art. 5º e 16', texto: 'A base de cálculo é o custo efetivo do serviço, reajustado todo ano, e o rateio usa a área construída em m² do cadastro imobiliário.' },
  { art: 'Art. 6º e 7º', texto: 'Lançamento anual com o IPTU ou na fatura da concessionária; multa de 2% e juros de 1% ao mês em caso de atraso.' },
  { art: 'Art. 8º a 11', texto: 'Não incidência (garagens), isenção para famílias de baixa renda, subsídio do Município aos isentos e desconto para quem adota boas práticas de resíduos.' },
  { art: 'Art. 12 a 14', texto: 'Cria o Fundo Municipal de Manejo de Resíduos (FMMR). A arrecadação é vinculada: só pode custear o serviço de resíduos, e qualquer pessoa pode agir contra o desvio desses recursos.' },
  { art: 'Art. 15 a 17', texto: 'Taxa não paga vai para a Dívida Ativa. A arrecadação é limitada ao custo do serviço; sobras reduzem a taxa do ano seguinte. A Prefeitura deve publicar relatório a cada quadrimestre com custos, toneladas coletadas e receitas.' },
  { art: 'Art. 18 e 19', texto: 'Regulamentação por decreto. A lei vale desde a publicação (10/12/2025), com efeitos financeiros a partir de 1º de janeiro do ano seguinte.' },
]

// Outras normas relacionadas
const normas = [
  { nome: 'Lei Federal nº 14.026/2020 (Marco Legal do Saneamento Básico)', texto: 'Exige que os municípios garantam a sustentabilidade econômico-financeira dos serviços de manejo de resíduos sólidos. É a base citada pela Prefeitura para criar a taxa.' },
  { nome: 'Lei Municipal nº 2.815/2025', texto: 'Instituiu a Taxa de Manejo de Resíduos Sólidos Urbanos (TMRSU) em Caraguatatuba.', link: LINK_LEI, rotulo: 'Texto no Diário Oficial' },
  { nome: 'Anexo I da Lei nº 2.815/2025', texto: 'Tabela oficial de valores por categoria e faixa de área construída.', link: LINK_ANEXO, rotulo: 'Abrir tabela oficial (PDF)' },
  { nome: 'Decreto Municipal nº 2.464/2026', texto: 'Regulamentou o Fundo Municipal de Manejo de Resíduos (FMMR), que recebe os recursos da taxa.' },
  { nome: 'Isenção da TMRSU (Prefeitura)', texto: 'Requisitos e como pedir a isenção, na Secretaria de Fazenda.', link: LINK_ISENCAO, rotulo: 'Ver requisitos' },
]

// Linha do tempo da revogação em 2026 (importante: muda a situação da cobrança)
const linhaDoTempo = [
  { data: '12/06/2026', texto: 'A Câmara aprova, por unanimidade, o Projeto de Lei Complementar nº 09/2026, que revoga a Lei nº 2.815/2025 e prevê a devolução dos valores pagos.' },
  { data: '19/06/2026', texto: 'O prefeito veta integralmente o projeto, alegando falta de estudo de impacto financeiro e risco de violar a Lei de Responsabilidade Fiscal.', link: LINK_VETO, rotulo: 'Ver veto no Diário Oficial' },
  { data: '23/06/2026', texto: 'A Câmara derruba o veto por unanimidade e a lei de revogação é promulgada.' },
  { data: '07/07/2026', texto: 'O Tribunal de Justiça de São Paulo nega o pedido de liminar da Prefeitura em uma Ação Direta de Inconstitucionalidade. A cobrança segue suspensa enquanto o mérito não é julgado.' },
]

// Aviso amarelo mostrado nas duas janelas
function AvisoSituacao() {
  return (
    <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
      <AlertTriangle size={20} className="shrink-0 mt-0.5" />
      <p>
        <strong>Situação atual:</strong> em junho de 2026 a Câmara revogou a lei da taxa e, segundo a imprensa regional,
        a cobrança está suspensa enquanto a Justiça analisa o caso. As informações abaixo descrevem a lei e a tabela
        como foram instituídas. Confirme a situação mais recente na Secretaria de Fazenda ou no Diário Oficial do município.
      </p>
    </div>
  )
}

// Botão-link para fontes oficiais
const LinkExterno = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-eco font-semibold text-xs hover:underline">
    {children} <ExternalLink size={12} />
  </a>
)

export default function Turismo() {
  // Qual janela está aberta: 'valores', 'legislacao' ou null (nenhuma)
  const [janela, setJanela] = useState(null)

  return (
    <>
      {/* Seção 1: O que é Turismo Consciente? */}
      <section className="max-w-6xl mx-auto px-6 py-10 md:py-14 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-5 md:mb-8">O que é Turismo Consciente?</h1>
          <p className="text-lg md:text-xl text-slate-800 leading-snug">
            É viajar respeitando a natureza, a cultura local e as pessoas que vivem no destino. Em Caraguatatuba, isso
            significa cuidar das praias, da Mata Atlântica e dos rios que fazem da cidade um lugar especial.
          </p>
          <ul className="mt-4 space-y-3">
            {dicas.map((dica) => (
              <li key={dica} className="flex gap-3 items-center text-lg text-slate-800">
                <CheckCircle2 className="text-green-500" size={26} />
                {dica}
              </li>
            ))}
          </ul>
        </div>

        {/* Foto das lixeiras com moldura azul */}
        <div className="bg-sky-200 rounded-3xl p-4">
          <div
            className="rounded-2xl overflow-hidden aspect-[4/3] bg-cover bg-center bg-white"
            style={{ backgroundImage: 'url(/img/lixeiras.jpg), linear-gradient(135deg,#fde047,#3b82f6,#22c55e,#a16207,#ef4444)' }}
          />
        </div>
      </section>

      {/* Seção 2: Taxa de resíduos */}
      <section className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="font-bebas text-3xl text-navy">A taxa de resíduos e o futuro de Caraguá</h2>
          <p className="text-sm text-slate-500 mt-4">
            Instituída em consonância com as diretrizes federais do Marco Legal do Saneamento Básico, a taxa de resíduos
            garante a manutenção financeira de toda a cadeia de coleta, tratamento e destinação adequada dos rejeitos.
          </p>
          <p className="text-sm text-slate-500 mt-3">
            Os recursos arrecadados não são de livre uso; eles são vinculados por lei para manter nossas praias, ruas e
            canais limpos, gerando saúde pública e equilíbrio ecológico.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button className="btn !rounded-md text-sm" onClick={() => setJanela('valores')}>Tabela de Valores</button>
            <button className="btn-o" onClick={() => setJanela('legislacao')}>Legislação Completa</button>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-navy mb-3">Para onde vai a arrecadação da taxa?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {destinoTaxa.map(({ percentual, titulo, texto }) => (
              <div key={titulo} className="card p-4">
                <p className="text-2xl font-extrabold text-eco">{percentual}</p>
                <p className="text-sm font-bold text-navy mt-2">{titulo}</p>
                <p className="text-[11px] text-slate-500 mt-1">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Janela: Tabela de Valores */}
      {janela === 'valores' && (
        <Modal titulo="Tabela de Valores da Taxa de Resíduos" onClose={() => setJanela(null)} largura="max-w-3xl">
          <div className="space-y-5 text-sm text-slate-600">
            <AvisoSituacao />

            <p>
              O valor da taxa depende da <strong>categoria do imóvel</strong> (residencial, comercial ou industrial) e da
              sua <strong>área construída</strong> registrada na Prefeitura. Até 350 m², multiplica-se a área pelo valor por
              m². Acima disso, vale um valor fixo.
            </p>

            {/* Tabela rolável no celular */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-slate-200 rounded-lg">
                <thead className="bg-ice text-navy">
                  <tr>
                    <th className="px-3 py-2 font-bold">Área construída</th>
                    <th className="px-3 py-2 font-bold">Categoria</th>
                    <th className="px-3 py-2 font-bold">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {tabelaValores.map((l) => (
                    <tr key={l.faixa + l.categoria} className="border-t border-slate-100">
                      <td className="px-3 py-2 whitespace-nowrap">{l.faixa}</td>
                      <td className="px-3 py-2">{l.categoria}</td>
                      <td className="px-3 py-2">{l.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-500">
              Exemplo divulgado pela Prefeitura: uma casa de 40 m² pagaria cerca de R$ 9,88 por mês. Os valores por m²
              aparecem arredondados nos informes oficiais. Para outras faixas e valores exatos, veja o Anexo I da lei.
            </p>
            <LinkExterno href={LINK_ANEXO}>Abrir a tabela oficial completa (Anexo I, PDF)</LinkExterno>

            <div>
              <h3 className="font-bold text-navy mb-2">Regras da cobrança</h3>
              <ul className="space-y-2 list-disc pl-5">
                {regrasCobranca.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}

      {/* Janela: Legislação Completa */}
      {janela === 'legislacao' && (
        <Modal titulo="Legislação Completa" onClose={() => setJanela(null)} largura="max-w-4xl">
          <div className="space-y-7 text-sm text-slate-600">
            <AvisoSituacao />

            {/* Normas relacionadas */}
            <div>
              <h3 className="font-bold text-navy mb-3">Normas</h3>
              <div className="space-y-3">
                {normas.map((n) => (
                  <div key={n.nome} className="card p-4">
                    <p className="font-bold text-navy">{n.nome}</p>
                    <p className="mt-1">{n.texto}</p>
                    {n.link && (
                      <div className="mt-2">
                        <LinkExterno href={n.link}>{n.rotulo}</LinkExterno>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo da lei */}
            <div>
              <h3 className="font-bold text-navy mb-3">Lei nº 2.815/2025: resumo por artigo</h3>
              <dl className="space-y-3">
                {resumoLei.map((r) => (
                  <div key={r.art} className="grid sm:grid-cols-[110px_1fr] gap-1 sm:gap-4">
                    <dt className="font-bold text-eco">{r.art}</dt>
                    <dd>{r.texto}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3">
                <LinkExterno href={LINK_LEI}>Ler o texto integral no Diário Oficial (PDF)</LinkExterno>
              </div>
            </div>

            {/* Revogação em 2026 */}
            <div>
              <h3 className="font-bold text-navy mb-3">Revogação em 2026</h3>
              <ol className="space-y-3 border-l-2 border-eco/30 pl-4">
                {linhaDoTempo.map((e) => (
                  <li key={e.data}>
                    <p className="font-bold text-navy">{e.data}</p>
                    <p>{e.texto}</p>
                    {e.link && <LinkExterno href={e.link}>{e.rotulo}</LinkExterno>}
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-xs text-slate-500">
              Este resumo é informativo e não substitui o texto oficial. Em caso de dúvida, consulte a Secretaria Municipal
              de Fazenda de Caraguatatuba.
            </p>
          </div>
        </Modal>
      )}
    </>
  )
}
