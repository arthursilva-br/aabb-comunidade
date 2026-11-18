import { useEffect,useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hasUnsavedDrafts,waitForAllDrafts,retryAllDrafts } from '../services/draftStore'
import { Button } from '@/shared/ui/button'
export function DraftNavigationGuard(){
 const navigate=useNavigate();const [message,setMessage]=useState('')
 useEffect(()=>{
  const unload=(e:BeforeUnloadEvent)=>{if(hasUnsavedDrafts()){e.preventDefault();e.returnValue=''}}
  const click=(event:MouseEvent)=>{const anchor=(event.target as Element)?.closest('a');if(!anchor||!hasUnsavedDrafts()||anchor.target==='_blank'||event.ctrlKey||event.metaKey||event.shiftKey)return;const url=new URL(anchor.href);if(url.origin!==location.origin||url.hash)return;event.preventDefault();event.stopPropagation();setMessage('Aguardando o salvamento antes de navegar...');void waitForAllDrafts().then(()=>{setMessage('');navigate(url.pathname+url.search)},e=>setMessage(e.message))}
  document.addEventListener('click',click,true);window.addEventListener('beforeunload',unload)
  return()=>{document.removeEventListener('click',click,true);window.removeEventListener('beforeunload',unload)}
 },[navigate])
 return message?<div className="draft-navigation-notice" role="status"><p>{message}</p><Button variant="outline" onClick={()=>{retryAllDrafts();void waitForAllDrafts().then(()=>setMessage('Rascunho salvo. Você já pode navegar.'),e=>setMessage(e.message))}}>Tentar salvar novamente</Button></div>:null
}
