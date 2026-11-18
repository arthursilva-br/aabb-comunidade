import type { StudentsData } from '../../students/types'
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
export function validDate(date: string) { return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date }
export function hasActivity(data: StudentsData, classId: string, date: string) {
  const c = data.classes.find(c => c.id === classId); const cal = data.calendars.find(c => c.classId === classId)
  return !!(validDate(date) && c && c.year === Number(date.slice(0, 4)) && cal && !!cal.operationalFrom && date >= cal.operationalFrom && (!cal.operationalUntil || date <= cal.operationalUntil) && !cal.excluded.includes(date) && (cal.included.includes(date) || cal.weekdays.includes(new Date(`${date}T12:00:00Z`).getUTCDay())))
}
export function authorized(data: StudentsData, teacherId: string, classId: string, now = today()) {
  return data.teachers.some(t => t.id === teacherId) && data.authorizations.some(a => a.teacherId === teacherId && a.classId === classId && (!a.from || a.from <= now) && (!a.until || a.until >= now))
}
export function callSituation(data: StudentsData, classId: string, date: string) {
  const call = data.calls.find(c => c.classId === classId && c.date === date)
  return call ? call.status === 'finalizada' ? 'Finalizada' : 'Aberta e incompleta' : hasActivity(data, classId, date) ? 'Prevista e ainda não realizada' : 'Sem atividade'
}
export function eligibleEnrollments(data: StudentsData, classId: string, date: string) {
  return data.enrollments.filter(e => e.classId === classId && e.startedAt.slice(0, 10) <= date && (!e.endedAt || e.endedAt.slice(0, 10) > date))
}
export function counts(entries: { mark: string }[]) { return { total: entries.length, present: entries.filter(e => e.mark === 'presente').length, absent: entries.filter(e => e.mark === 'ausente').length, unmarked: entries.filter(e => e.mark === 'nao-marcado').length } }
