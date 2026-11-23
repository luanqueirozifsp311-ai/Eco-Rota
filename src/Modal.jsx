import { useEffect } from 'react'
import { X } from 'lucide-react'

// Janela (modal) reutilizável: escurece o fundo e mostra o conteúdo no centro.
// Fecha ao clicar fora, no X ou ao apertar Esc.
//   <Modal titulo="Meu título" onClose={() => ...} largura="max-w-4xl">conteúdo</Modal>
export default function Modal({ titulo, onClose, largura = 'max-w-3xl', children }) {
  useEffect(() => {
    const aoApertar = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', aoApertar)
    document.body.style.overflow = 'hidden' // impede a página de rolar por trás
    return () => {
      document.removeEventListener('keydown', aoApertar)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* stopPropagation: clicar dentro da janela não fecha */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`bg-white rounded-2xl shadow-xl w-full ${largura} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
          <h2 className="font-bebas text-2xl text-navy">{titulo}</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-slate-400 hover:text-slate-700">
            <X size={22} />
          </button>
        </div>
        {/* Conteúdo com rolagem própria */}
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
