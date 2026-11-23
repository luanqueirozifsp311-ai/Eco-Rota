import {useState} from 'react'
import {Link,NavLink} from 'react-router-dom'
import {Instagram,Facebook,Youtube,Menu,X} from 'lucide-react'
export const Logo=({big})=><Link to="/" className="shrink-0"><img src="/img/logo.png" alt="EcoRota" className={(big?"h-12":"h-10")+" w-auto"}/></Link>
export function Header(){
const [m,setM]=useState(false)
const l=({isActive})=>'h-bebas text-lg '+(isActive?'underline underline-offset-4':'')
const links=[['/','Início'],['/descarte','Descarte'],['/ajudar','Como Ajudar']]
return <header className="bg-ice relative z-20"><div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
<Logo/><nav className="hidden md:flex gap-14">{links.map(([t,n])=><NavLink key={t} to={t} className={l}>{n}</NavLink>)}</nav>
<div className="flex items-center gap-3"><Link to="/eventos" className="btn text-base md:text-lg px-6 md:px-10">Eventos</Link>
<button aria-label="Menu" onClick={()=>setM(!m)} className="md:hidden text-eco p-1">{m?<X size={28}/>:<Menu size={28}/>}</button></div></div>
{m&&<nav className="md:hidden bg-ice border-t border-cyan-100 px-6 py-4 flex flex-col gap-4">{links.map(([t,n])=><NavLink key={t} to={t} onClick={()=>setM(false)} className={l}>{n}</NavLink>)}
<NavLink to="/turismo" onClick={()=>setM(false)} className={l}>Turismo Consciente</NavLink><NavLink to="/noticias" onClick={()=>setM(false)} className={l}>Notícias</NavLink></nav>}</header>}
export function Footer(){
const a="text-white font-semibold hover:text-eco"
return <footer className="bg-gradient-to-r from-navy to-[#0a5b86] text-white"><div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 items-center">
<div className="flex flex-col items-center md:items-start text-center md:text-left"><Logo big/><p className="text-xs font-semibold mt-4 max-w-[230px]">Plataforma de informações ambientais. Promovendo a transparência, sustentabilidade e educação para todos os cidadãos e visitantes.</p><p className="text-[10px] text-white/50 mt-6">© 2026 EcoRota Caraguatatuba. Todos os direitos reservados.</p></div>
<nav className="flex flex-wrap gap-6 justify-center"><Link className={a} to="/">Início</Link><Link className={a} to="/turismo">Turismo Consciente</Link><Link className={a} to="/descarte">Descarte</Link><Link className={a} to="/ajudar">Como Ajudar</Link></nav>
<div className="flex gap-6 justify-center md:justify-end"><Instagram/><Facebook/><Youtube/></div></div></footer>}
export const Page=({children})=><div className="min-h-screen flex flex-col"><Header/><main className="flex-1">{children}</main><Footer/></div>
