import type { StudentsData } from '../../students/types'
import { authorized, hasActivity, today } from './selectors'
export function monthDates(month:string) {if(!/^\d{4}-\d{2}$/.test(month))return [];const [y,m]=month.split('-').map(Number);if(m<1||m>12)return [];return Array.from({length:new Date(y,m,0).getDate()},(_,i)=>`${month}-${String(i+1).padStart(2,'0')}`)}
export function calendarRows(d:StudentsData,month:string,teacherId?:string,now=today()) {
 return monthDates(month).flatMap(date=>d.classes.filter(c=>c.year===Number(month.slice(0,4))&&(!teacherId||authorized(d,teacherId,c.id,now))).map(c=>{
 const call=d.calls.find(x=>x.classId===c.id&&x.date===date)
 const status=call?.status==='finalizada'?'Concluída':call?'Rascunho':!hasActivity(d,c.id,date)?'Sem atividade':date>now?'Prevista':'Pendente'
 return {date,schoolClass:c,status,expected:hasActivity(d,c.id,date),overdue:date<now&&(status==='Pendente'||status==='Rascunho')}
 }))
}
export function monthlySummary(rows:ReturnType<typeof calendarRows>,now=today()) {
 const due=rows.filter(r=>r.date<=now&&r.expected);const completed=due.filter(r=>r.status==='Concluída').length
 return {expected:due.length,completed,pending:due.filter(r=>r.status==='Pendente').length,drafts:due.filter(r=>r.status==='Rascunho').length,overdue:due.filter(r=>r.overdue).length,percent:due.length?Math.round(completed/due.length*100):0}
}
export function overdueRows(d:StudentsData,teacherId?:string,now=today()) {
 const years=[...new Set(d.classes.filter(c=>!teacherId||authorized(d,teacherId,c.id,now)).map(c=>c.year))]
 return years.filter(y=>y<=Number(now.slice(0,4))).flatMap(y=>Array.from({length:12},(_,i)=>`${y}-${String(i+1).padStart(2,'0')}`).filter(m=>m<=now.slice(0,7)).flatMap(m=>calendarRows(d,m,teacherId,now))).filter(r=>r.overdue)
}
