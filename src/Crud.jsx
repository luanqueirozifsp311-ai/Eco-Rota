import {useState} from 'react'
import {Pencil,Trash2} from 'lucide-react'
// onSave(dados, id) e onDelete(id) são assíncronos e lançam erro com mensagem amigável (vem da API)
// Props extras (opcionais): paraForm(item) prepara os campos ao editar; paraApi(dados) converte antes de enviar.
// Em fields, {optional:true} deixa o campo não obrigatório; {hint:'...'} mostra uma dica abaixo.
export default function Crud({items,onSave,onDelete,fields,title,line,paraForm,paraApi}){
const empty=Object.fromEntries(fields.map(f=>[f.k,'']))
const [f,setF]=useState(empty),[id,setId]=useState(null),[erro,setErro]=useState(''),[salvando,setSalvando]=useState(false)
const reset=()=>{setF(empty);setId(null);setErro('')}
const save=async e=>{e.preventDefault();setErro('');setSalvando(true)
try{let dados=Object.fromEntries(fields.map(x=>[x.k,f[x.k]]));if(paraApi)dados=paraApi(dados);await onSave(dados,id);setF(empty);setId(null)}
catch(err){setErro(err.message)}finally{setSalvando(false)}}
const remover=async i=>{if(!confirm('Excluir este registro?'))return;setErro('')
try{await onDelete(i.id);if(i.id===id)reset()}catch(err){setErro(err.message)}}
return <div className="grid md:grid-cols-5 gap-6">
<form onSubmit={save} className="card p-5 space-y-3 md:col-span-2 h-fit">
<h3 className="font-bold text-navy">{id?'Editar':'Novo'} {title}</h3>
{fields.map(x=><label key={x.k} className="block text-xs font-semibold text-slate-500">{x.label}
{x.type==='textarea'?<textarea required={!x.optional} rows={3} className="inp mt-1" value={f[x.k]} onChange={e=>setF({...f,[x.k]:e.target.value})}/>
:<input required={!x.optional} type={x.type||'text'} className="inp mt-1" value={f[x.k]} onChange={e=>setF({...f,[x.k]:e.target.value})}/>}{x.hint&&<span className="block font-normal text-[11px] text-slate-400 mt-1">{x.hint}</span>}</label>)}
{erro&&<p className="text-xs text-red-500">{erro}</p>}
<div className="flex flex-wrap gap-2"><button disabled={salvando} className="btn text-sm">{salvando?'Salvando...':id?'Salvar':'Adicionar'}</button>
{id&&<button type="button" className="btn-o" onClick={reset}>Cancelar</button>}</div></form>
<div className="md:col-span-3 space-y-3">{items.length===0&&<p className="text-sm">Nenhum registro.</p>}
{items.map(i=><div key={i.id} className="card p-4 flex items-start justify-between gap-3">
<div className="text-sm min-w-0 break-words">{line(i)}</div>
<div className="flex gap-2 shrink-0"><button title="Editar" onClick={()=>{const base=paraForm?paraForm(i):i;setF(Object.fromEntries(fields.map(x=>[x.k,base[x.k]??''])));setId(i.id);setErro('')}} className="btn-o !px-2"><Pencil size={14}/></button>
<button title="Excluir" onClick={()=>remover(i)} className="btn-o !px-2 !border-red-400 !text-red-500"><Trash2 size={14}/></button></div></div>)}</div></div>}
