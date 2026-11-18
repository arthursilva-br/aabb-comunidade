import type { StudentsRepository } from '../../students/data/repository'
import type { AttendanceEntry } from '../types'
import { authorized, today } from './selectors'
export function createDraftService(repository: StudentsRepository) {
 return {
  async save(callId: string, teacherId: string, entries: AttendanceEntry[]) { return repository.transaction(d => {
   const call = d.calls.find(c => c.id === callId)
   if (!call || !authorized(d,teacherId,call.classId)) throw new Error('Acesso negado à chamada.')
   if (call.date > today()) throw new Error('Chamadas futuras são somente previsão.')
   if (call.status !== 'aberta') throw new Error('Chamada concluída exige correção com motivo.')
   if (entries.length !== call.entries.length || new Set(entries.map(e=>e.enrollmentId)).size !== entries.length || entries.some(e=> !call.entries.some(old=>old.enrollmentId===e.enrollmentId && old.studentId===e.studentId) || !['presente','ausente','nao-marcado'].includes(e.mark) || (e.mark!=='ausente' && e.justification))) throw new Error('Participantes ou marcações inválidos.')
   const before=JSON.stringify(call.entries)
   call.entries=call.entries.map(old=>{const e=entries.find(e=>e.enrollmentId===old.enrollmentId)!; return {...old,mark:e.mark,justification:e.justification}})
   if(before!==JSON.stringify(call.entries)) d.audit.push({operation:'Rascunho automático',entityId:call.id,actor:d.teachers.find(t=>t.id===teacherId)!.name,at:new Date().toISOString()})
  }) },
  async confirm(callId: string, teacherId: string, reviewed: AttendanceEntry[], confirmed: boolean) { return repository.transaction(d=>{
   const c=d.calls.find(c=>c.id===callId)
   if(!c || !authorized(d,teacherId,c.classId)) throw new Error('Acesso negado à chamada.')
   if(c.date > today()) throw new Error('Chamadas futuras são somente previsão.')
   if(!confirmed) throw new Error('Confirme explicitamente a conclusão.')
   if(c.status!=='aberta') throw new Error('Chamada já concluída.')
   if(c.entries.some(e=>e.mark==='nao-marcado')) throw new Error('Existem alunos sem marcação.')
   if(JSON.stringify(c.entries)!==JSON.stringify(reviewed)) throw new Error('A conferência mudou ou possui alterações não salvas. Confira novamente.')
   c.status='finalizada'; c.closedAt=new Date().toISOString(); c.closedBy=d.teachers.find(t=>t.id===teacherId)!.name
   d.audit.push({operation:'Conclusão confirmada',entityId:c.id,actor:c.closedBy,at:c.closedAt})
  }) }
 }
}
