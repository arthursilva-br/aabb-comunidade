import { Link } from 'react-router-dom'
import { useStudentsData } from '../../students/data/store'
import { dailyRows,callAction,callUrl } from '../services/teacherNavigation'
import { Badge, Card,StateMessage } from '@/shared/ui/primitives'
import { Button } from '@/shared/ui/button'
export function TeacherClassCards({teacherId,date,origin,classId='',workshop='',lateOnly=false}:{teacherId:string;date:string;origin:string;classId?:string;workshop?:string;lateOnly?:boolean}) {
 const d=useStudentsData();const rows=dailyRows(d,date,teacherId).filter(r=>(!classId||r.schoolClass.id===classId)&&(!workshop||r.schoolClass.workshopId===workshop)&&(!lateOnly||r.overdue))
 return rows.length?<div className="two-columns">{rows.map(r=><Card key={r.schoolClass.id} className="workshop-card"><Badge tone="blue">{r.schoolClass.shift}</Badge><h2>{d.workshops.find(w=>w.id===r.schoolClass.workshopId)?.name}</h2><p>{r.schoolClass.label} · {r.participants} alunos elegíveis</p><Badge tone={r.status==='Concluída'?'success':r.status==='Sem atividade'?'neutral':'warning'}>{r.status}</Badge>{r.overdue&&<p>Chamada atrasada</p>}<p>{date.split('-').reverse().join('/')}</p>{callAction(r.status)?<Button asChild><Link to={callUrl(r.schoolClass.id,date,origin)}>{callAction(r.status)}</Link></Button>:<p>{r.status==='Prevista'?'Atividade futura. Aguarde a data para registrar.':'Não há chamada prevista para esta turma.'}</p>}</Card>)}</div>:<StateMessage state="empty" />
}
