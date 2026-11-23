import { Link } from 'react-router-dom'
import { Leaf, BookOpen, MapPin, Megaphone } from 'lucide-react'

// Cards de atalho exibidos abaixo do banner
const atalhos = [
  { Icone: Leaf, titulo: 'Turismo Consciente', texto: 'Dicas práticas para visitantes aproveitarem a cidade com responsabilidade', link: '/turismo' },
  { Icone: BookOpen, titulo: 'Guia de Descarte', texto: 'Saiba onde e como descartar cada tipo de resíduo corretamente', link: '/descarte' },
  { Icone: MapPin, titulo: 'Notícias e Campanhas', texto: 'Fique por dentro de ações, campanhas e projetos ambientais do município', link: '/noticias' },
  { Icone: Megaphone, titulo: 'Educação Ambiental', texto: 'Curiosidades, dicas, perguntas frequentes e boas práticas para seu dia a dia', link: '/ajudar' },
]

export default function Home() {
  return (
    <>
      {/* Banner com foto e onda branca na parte de baixo */}
      <section
        className="relative h-[240px] sm:h-[320px] md:h-[369px] bg-cover bg-[position:50%_30%]"
        style={{ backgroundImage: 'url(/img/hero.png)' }}
      >
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" height="90">
          <path d="M0 50 L120 80 L500 60 C800 0 1100 90 1440 20 V120 H0Z" fill="#fff" />
          <path d="M0 20 L60 50 L500 70 L0 90Z" fill="#07bddc" />
        </svg>
      </section>

      {/* Cards de atalho */}
      <section className="max-w-6xl mx-auto px-6 py-8 md:py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {atalhos.map(({ Icone, titulo, texto, link }) => (
          <Link key={titulo} to={link} className="text-center group">
            <div className="mx-auto w-[68px] h-[68px] rounded-full bg-eco flex items-center justify-center text-white group-hover:scale-105 transition">
              <Icone size={34} />
            </div>
            <h3 className="h-bebas text-xl mt-5 uppercase">{titulo}</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-[180px] mx-auto">{texto}</p>
          </Link>
        ))}
      </section>
    </>
  )
}
