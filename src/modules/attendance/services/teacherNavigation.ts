import type { StudentsData } from '../../students/types'
import { authorized, eligibleEnrollments, today, validDate } from './selectors'
import { calendarRows, monthDates } from './calendar'
export function selectedDate(params: URLSearchParams, now=today()) {
 const value=params.get('data') || ''; return validDate(value)?value:now
}
export function selectedMonth(params: URLSearchParams, now=today()) {
 const month=params.get('mes') || selectedDate(params,now).slice(0,7)
 return monthDates(month).length?month:now.slice(0,7)
}
export function moveMonth(month:string,offset:number) {
 const [year,m]=month.split('-').map(Number);const d=new Date(year,m-1+offset,1,12)
 return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}
export function monthCells(month:string) {
 const dates=monthDates(month);if(!dates.length)return []
 const start=new Date(`${dates[0]}T12:00:00Z`).getUTCDay()
 const cells: (string|null)[]=[...Array(start).fill(null),...dates]
 while(cells.length%7)cells.push(null)
 return cells
}
export const callAction=(status:string)=>status==='Pendente'?'Fazer chamada':status==='Rascunho'?'Continuar chamada':status==='Concluída'?'Ver chamada':null
export function dailyRows(d:StudentsData,date:string,teacherId:string,now=today()) {
 return calendarRows(d,date.slice(0,7),teacherId,now).filter(r=>r.date===date).sort((a,b)=>a.schoolClass.shift.localeCompare(b.schoolClass.shift)|| (d.workshops.find(w=>w.id===a.schoolClass.workshopId)?.name||'').localeCompare(d.workshops.find(w=>w.id===b.schoolClass.workshopId)?.name||'')||a.schoolClass.label.localeCompare(b.schoolClass.label)).map(r=>({...r,participants:d.calls.find(c=>c.classId===r.schoolClass.id&&c.date===date)?.entries.length??eligibleEnrollments(d,r.schoolClass.id,date).length}))
}
export function callUrl(classId:string,date:string,origin:string) {
 return `/professor/turmas/${encodeURIComponent(classId)}/chamadas/${date}?origem=${encodeURIComponent(origin)}`
}
export function returnUrl(params:URLSearchParams,date:string) {
 const origin=params.get('origem')||''
 if(/^\/professor\/(turmas|calendario)\?/.test(origin)&&!/[\\\r\n]/.test(origin))return origin
 return `/professor/turmas?data=${validDate(date)?date:today()}`
}
export function authorizedClasses(d:StudentsData,teacherId:string,date:string) {
 return d.classes.filter(c=>c.year===Number(date.slice(0,4))&&authorized(d,teacherId,c.id)).sort((a,b)=>a.shift.localeCompare(b.shift)||a.label.localeCompare(b.label))
}
