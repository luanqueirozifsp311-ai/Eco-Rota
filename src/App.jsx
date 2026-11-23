import {Routes,Route} from 'react-router-dom'
import {Page} from './Layout'
import Home from './pages/Home'
import Turismo from './pages/Turismo'
import Descarte from './pages/Descarte'
import Noticias from './pages/Noticias'
import Ajudar from './pages/Ajudar'
import Eventos from './pages/Eventos'
export default function App(){
return <Page><Routes><Route path="/" element={<Home/>}/><Route path="/turismo" element={<Turismo/>}/><Route path="/descarte" element={<Descarte/>}/>
<Route path="/noticias" element={<Noticias/>}/><Route path="/ajudar" element={<Ajudar/>}/><Route path="/eventos" element={<Eventos/>}/></Routes></Page>}
