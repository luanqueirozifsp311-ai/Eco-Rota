import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronDown, ArrowRight } from 'lucide-react'
import { api } from '../api'

// Boas práticas
const praticas = [
  { titulo: 'Separe o lixo reciclável', texto: 'Separe plásticos, papéis, vidros e metais do lixo orgânico antes do descarte.' },
  { titulo: 'Reduza o uso de descartáveis', texto: 'Prefira garrafas, sacolas e utensílios reutilizáveis no dia a dia.' },
  { titulo: 'Descarte corretamente resíduos especiais', texto: 'Leve pilhas, eletrônicos e medicamentos vencidos a pontos de coleta adequados.' },
]

// Perguntas frequentes
const perguntasPadrao = [
  {
    pergunta: 'Como funciona a educação ambiental nos bairros de Caraguatatuba?',
    resposta: 'Por meio de iniciativas integradas entre a Prefeitura, escolas municipais, centros comunitários e parcerias com empresas e concessionárias.',
  },
  {
    pergunta: 'Qual é a iniciativa da Prefeitura de Caraguatatuba para engajar os moradores dos bairros no aumento da cobertura vegetal e preservação da Mata Atlântica local?',
    resposta: 'A prefeitura desenvolve o Projeto Arborizar, uma ação conjunta das Secretarias de Urbanismo e de Meio Ambiente. O projeto distribui cartilhas educativas nas escolas e oferece o plantio planejado de mudas de árvores nativas nos bairros.',
  },
  {
    pergunta: 'Como o cidadão de Caraguatatuba pode aplicar na prática os conceitos de educação ambiental no descarte de resíduos especiais e recicláveis no seu bairro?',
    resposta: 'O município promove a educação ambiental prática por meio dos Ecopontos (localizados em bairros estratégicos como Martim de Sá, Tinga, Golfinho e Massaguaçu).',
  },
]

export default function Ajudar() {
  // Pergunta aberta no momento (null = todas fechadas)
  const [aberta, setAberta] = useState(0)

  // Começa com as perguntas padrão e troca pelas do banco quando a API responder
  const [perguntas, setPerguntas] = useState(perguntasPadrao)
  useEffect(() => {
    api.get('/perguntas').then((p) => p.length && setPerguntas(p)).catch(() => {})
  }, [])

  return (
    <>
      {/* Banner com foto e título */}
      <section
        className="relative h-56 md:h-72 bg-cover bg-center flex flex-col items-center justify-center text-center text-white px-6"
        style={{ backgroundImage: 'url(/img/paralax.jpg), linear-gradient(135deg,#0a5b86,#07bddc)' }}
      >
        <div className="absolute inset-0 bg-navy/35" />
        <h1 className="relative text-3xl sm:text-5xl font-bold drop-shadow">Educação Ambiental</h1>
        <p className="relative mt-3 font-semibold drop-shadow max-w-xl">
          Pequenas atitudes do dia a dia fazem de Caraguatatuba uma cidade mais limpa.
        </p>
      </section>

      {/* Boas práticas ao lado da foto */}
      <section className="max-w-5xl mx-auto px-6 py-12 md:py-16 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <img src="/img/paralax2.jpg" alt="Lixeiras de coleta seletiva" className="rounded-2xl w-full object-cover aspect-[4/3] shadow-sm" />
        <div>
          <h2 className="text-2xl font-extrabold text-navy">Boas práticas de educação ambiental</h2>
          <ul className="mt-6 space-y-5">
            {praticas.map(({ titulo, texto }) => (
              <li key={titulo} className="flex gap-3">
                <Check size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-navy">{titulo}</p>
                  <p className="text-sm text-slate-500 mt-1">{texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Perguntas frequentes */}
      <section className="max-w-5xl mx-auto px-6 pb-14 grid md:grid-cols-2 gap-8 md:gap-14">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy">Ficou com alguma dúvida sobre educação ambiental?</h2>
          <p className="text-sm text-slate-500 mt-4 max-w-xs">
            Compilamos as perguntas mais comuns enviadas pelos cidadãos de Caraguatatuba sobre educação ambiental.
          </p>
          <Link to="/descarte" className="inline-flex items-center gap-2 text-sm font-bold text-eco mt-5 hover:underline">
            Encontre o Ecoponto mais próximo <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-cyan-100 border-y border-cyan-100">
          {perguntas.map(({ pergunta, resposta }, i) => (
            <div key={pergunta}>
              <button onClick={() => setAberta(aberta === i ? null : i)} className="w-full py-4 flex justify-between items-start gap-3 text-left">
                <span className="text-sm font-bold text-navy">{pergunta}</span>
                <ChevronDown size={18} className={'text-eco shrink-0 transition ' + (aberta === i ? 'rotate-180' : '')} />
              </button>
              {aberta === i && <p className="pb-4 text-sm text-slate-500">{resposta}</p>}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
