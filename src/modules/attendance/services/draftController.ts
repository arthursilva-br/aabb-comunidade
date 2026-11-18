import type { AttendanceEntry, Mark } from '../types'
export type SaveStatus='saved'|'saving'|'error'
export interface DraftState { entries: AttendanceEntry[]; status: SaveStatus; error: string }
// Fila por chamada/perfil: continua ativa ao navegar e nunca confirma uma versão antiga.
export function createDraftController(initial: AttendanceEntry[], save: (entries: AttendanceEntry[])=>Promise<void>) {
 let state: DraftState={entries:structuredClone(initial),status:'saved',error:''}; let version=0; let running=false
 const listeners=new Set<()=>void>(); const emit=()=>listeners.forEach(f=>f())
 async function flush() {
  if(running) return
  running=true
  while(state.status==='saving') {
   const current=version; const entries=structuredClone(state.entries)
   try { await save(entries); if(current===version) {state={...state,status:'saved',error:''}; emit()} }
   catch(e) {state={...state,status:'error',error:e instanceof Error?e.message:'Não foi possível salvar'}; emit(); break}
  }
  running=false
 }
 function update(entries: AttendanceEntry[]) {if(JSON.stringify(entries)===JSON.stringify(state.entries))return; version++;state={entries,status:'saving',error:''};emit();void flush()}
 return {
  getSnapshot:()=>state, subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn)}},
  mark(id:string,mark:Mark,justification?:string){update(state.entries.map(e=>e.enrollmentId===id?{...e,mark,justification:mark==='ausente'?(justification??e.justification):''}:e))},
  allPresent(confirmed=false){if(state.entries.some(e=>e.mark!=='nao-marcado')&&!confirmed)throw new Error('Confirme a substituição das marcações anteriores.');update(state.entries.map(e=>({...e,mark:'presente',justification:''})))},
  retry(){if(state.status==='error'){state={...state,status:'saving',error:''};emit();void flush()}},
  review(){if(state.status!=='saved')throw new Error('Aguarde o salvamento do rascunho.');if(state.entries.some(e=>e.mark==='nao-marcado'))throw new Error('Marque todos os alunos.');return structuredClone(state.entries)}
 }
}
export const saveStatusText={saving:'Salvando...',saved:'Rascunho salvo',error:'Não foi possível salvar'}
