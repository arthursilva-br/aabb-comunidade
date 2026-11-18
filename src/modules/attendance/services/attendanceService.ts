import type { StudentsRepository } from '../../students/data/repository'
import type { StudentsData } from '../../students/types'
import type { AttendanceEntry, Mark } from '../types'
import { authorized, eligibleEnrollments, hasActivity, today } from './selectors'
export function createAttendanceService(repository: StudentsRepository) {
  const actor = (d: StudentsData, teacherId: string, classId: string) => {
    if (!authorized(d, teacherId, classId)) throw new Error('Acesso negado: professor sem autorização vigente para esta turma.')
    return d.teachers.find(t => t.id === teacherId)!.name
  }
  const audit = (d: StudentsData, operation: string, entityId: string, who: string) => d.audit.push({ operation, entityId, actor: who, at: new Date().toISOString() })
  return {
    async open(classId: string, date: string, teacherId: string) { return repository.transaction(d => {
      const who = actor(d, teacherId, classId)
      if (date > today()) throw new Error('Chamadas futuras são somente previsão.')
      if (!hasActivity(d, classId, date)) throw new Error('Não há atividade configurada para esta turma e data.')
      if (d.calls.some(c => c.classId === classId && c.date === date)) throw new Error('Já existe chamada para esta turma e data.')
      const id = crypto.randomUUID()
      const ambiguities = d.enrollments.filter(e => e.classId === classId && (e.startedAt.slice(0, 10) === date || e.endedAt?.slice(0, 10) === date)).map(e => `Matrícula ${e.id}: entrada/saída no mesmo dia; critério operacional definitivo pendente.`)
      d.calls.push({ id, classId, date, status: 'aberta', entries: eligibleEnrollments(d, classId, date).map(e => ({ enrollmentId: e.id, studentId: e.studentId, name: d.students.find(s => s.id === e.studentId)!.name, mark: 'nao-marcado', justification: '' })), ambiguities, corrections: [], openedBy: who, openedAt: new Date().toISOString() })
      audit(d, 'Abertura de chamada', id, who); return id
    }) },
    async mark(callId: string, enrollmentId: string, mark: Mark, justification: string, teacherId: string, reason = '') { return repository.transaction(d => {
      const c = d.calls.find(c => c.id === callId); if (!c) throw new Error('Chamada não encontrada.')
      const who = actor(d, teacherId, c.classId)
      if (c.date > today()) throw new Error('Chamadas futuras são somente previsão.')
      if (!['presente', 'ausente', 'nao-marcado'].includes(mark)) throw new Error('Marcação inválida.')
      const e = c.entries.find(e => e.enrollmentId === enrollmentId); if (!e) throw new Error('Aluno não participa desta chamada.')
      if (mark !== 'ausente' && justification.trim()) throw new Error('Justificativa deve estar vinculada a uma ausência.')
      if (c.status === 'finalizada' && (!reason.trim() || mark === 'nao-marcado')) throw new Error('Correção exige motivo e marcação de presença ou ausência.')
      const before = structuredClone(e); const after: AttendanceEntry = { ...e, mark, justification: mark === 'ausente' ? justification.trim() : '' }
      if (c.status === 'finalizada') c.corrections.push({ enrollmentId, before, after, reason: reason.trim(), actor: who, at: new Date().toISOString() })
      Object.assign(e, after); audit(d, c.status === 'finalizada' ? 'Correção de chamada' : 'Marcação de frequência', c.id, who)
    }) },
    async close(callId: string, teacherId: string) { return repository.transaction(d => {
      const c = d.calls.find(c => c.id === callId); if (!c) throw new Error('Chamada não encontrada.')
      const who = actor(d, teacherId, c.classId)
      if (c.status === 'finalizada') throw new Error('Chamada já finalizada.')
      if (c.entries.some(e => e.mark === 'nao-marcado')) throw new Error('Marque todos os alunos antes de concluir.')
      c.status = 'finalizada'; c.closedBy = who; c.closedAt = new Date().toISOString(); audit(d, 'Conclusão de chamada', c.id, who)
    }) },
  }
}
