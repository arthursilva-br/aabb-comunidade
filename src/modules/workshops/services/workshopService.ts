import type { StudentsRepository } from '../../students/data/repository'
import type { SchoolClass } from '../../students/types'
import type { ActivityCalendar, Authorization } from '../../attendance/types'
import { occupancy } from '../../students/services/selectors'
import { validDate, hasActivity } from '../../attendance/services/selectors'
import { classSchema } from '../forms/workshopSchema'
export function createWorkshopService(repository: StudentsRepository) {
  const change = <T,>(operation: string, fn: (d: ReturnType<StudentsRepository['getSnapshot']>) => T) => repository.transaction(d => {
    const before = JSON.stringify({ workshops: d.workshops, classes: d.classes, authorizations: d.authorizations, calendars: d.calendars })
    const result = fn(d); d.audit.push({ operation, entityId: typeof result === 'string' ? result : 'configuracao-demo', actor: 'Administração fictícia — DEMO', at: new Date().toISOString(), before, after: JSON.stringify({ workshops: d.workshops, classes: d.classes, authorizations: d.authorizations, calendars: d.calendars }) }); return result
  })
  return {
    saveWorkshop(name: string, id?: string) { return change('Salvar oficina', d => {
      if (!name.trim() || name.length > 100) throw new Error('Informe um nome de oficina com até 100 caracteres.')
      if (id) { const w = d.workshops.find(w => w.id === id); if (!w) throw new Error('Oficina não encontrada.'); w.name = name.trim(); return id }
      const newId = crypto.randomUUID(); d.workshops.push({ id: newId, name: name.trim(), unitId: 'unidade-demo' }); return newId
    }) },
    saveClass(input: Omit<SchoolClass, 'id' | 'unitId'>, id?: string) { return change('Salvar turma/capacidade', d => {
      const parsed = classSchema.safeParse(input); if (!parsed.success) throw new Error('Confira oficina, nome, ano, turno e capacidade inteira não negativa.')
      if (!d.workshops.some(w => w.id === input.workshopId)) throw new Error('Oficina não encontrada.')
      const c = d.classes.find(c => c.id === id)
      if (id && !c) throw new Error('Turma não encontrada.')
      if (c && (c.workshopId !== input.workshopId || c.year !== input.year || c.shift !== input.shift)) throw new Error('Preserve oficina, ano e turno da turma existente.')
      if (id && input.capacity < occupancy(d, id)) throw new Error(`Capacidade não pode ser inferior à ocupação atual (${occupancy(d, id)} alunos).`)
      if (c) { Object.assign(c, parsed.data); return c.id }
      const newId = crypto.randomUUID(); d.classes.push({ ...parsed.data, id: newId, unitId: 'unidade-demo' }); return newId
    }) },
    authorize(input: Omit<Authorization, 'id'>) { return change('Autorizar professor', d => {
      if (!d.classes.some(c => c.id === input.classId) || !d.teachers.some(t => t.id === input.teacherId)) throw new Error('Turma ou professor não encontrado.')
      if (!['titular', 'adicional', 'substituto'].includes(input.kind) || (input.from && !validDate(input.from)) || (input.until && !validDate(input.until)) || (input.from && input.until && input.from > input.until)) throw new Error('Confira tipo e vigência da autorização.')
      if (input.kind === 'titular' && d.authorizations.some(a => a.classId === input.classId && a.kind === 'titular' && (!a.until || !input.from || a.until >= input.from) && (!input.until || !a.from || input.until >= a.from))) throw new Error('Já existe titular nesse período. Revogue o vínculo anterior antes de substituir.')
      const id = crypto.randomUUID(); d.authorizations.push({ ...input, id }); return id
    }) },
    revoke(id: string) { return change('Revogar autorização', d => { d.authorizations = d.authorizations.filter(a => a.id !== id) }) },
    calendar(input: ActivityCalendar) { return change('Configurar calendário', d => {
      const c = d.classes.find(c => c.id === input.classId)
      if (input.operationalFrom && (!validDate(input.operationalFrom) || Number(input.operationalFrom.slice(0,4)) !== c?.year)) throw new Error('Início operacional inválido.')
      if (input.operationalUntil && (!validDate(input.operationalUntil) || Number(input.operationalUntil.slice(0,4)) !== c?.year || input.operationalUntil < (input.operationalFrom || d.calendars.find(x=>x.classId===input.classId)?.operationalFrom || ''))) throw new Error('Encerramento operacional inválido.')
      if (!c || input.weekdays.some(n => !Number.isInteger(n) || n < 0 || n > 6) || [...input.included, ...input.excluded].some(date => !validDate(date) || Number(date.slice(0, 4)) !== c.year) || input.included.some(date => input.excluded.includes(date))) throw new Error('Confira dias e exceções do ano da turma, sem datas conflitantes.')
      const copy = { ...input, weekdays: [...new Set(input.weekdays)], included: [...new Set(input.included)], excluded: [...new Set(input.excluded)] }
      const old = d.calendars.find(x => x.classId === input.classId)
      if (old) Object.assign(old, copy); else d.calendars.push(copy)
      if (d.calls.some(call => call.classId === input.classId && !hasActivity(d, call.classId, call.date))) throw new Error('Há chamada registrada em data removida. Preserve o calendário histórico; cancelamento exige regra operacional definitiva.')
    }) },
  }
}
