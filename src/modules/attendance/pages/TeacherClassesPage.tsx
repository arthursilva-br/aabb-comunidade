import { Link,useSearchParams } from 'react-router-dom'
import { useStudentsData } from '../../students/data/store'
import { useTeacherIdentity } from '../services/teacherIdentity'
import { selectedDate } from '../services/teacherNavigation'
import { today } from '../services/selectors'
import { overdueRows } from '../services/calendar'
import { TeacherProfile } from '../components/TeacherProfile'
import { TeacherClassCards } from '../components/TeacherClassCards'
import { DemoLoad } from '../components/DemoUI'
import { PageHeading } from '@/shared/ui/primitives'
import { Button } from '@/shared/ui/button'
export function TeacherClassesPage(){
 const d=useStudentsData();const [who]=useTeacherIdentity();const [params,setParams]=useSearchParams();const date=selectedDate(params);const late=overdueRows(d,who);const origin=`/professor/turmas?data=${date}`
 return <DemoLoad><PageHeading title="Minhas turmas" description="Escolha a turma e faça a chamada da data selecionada."/><TeacherProfile/><div className="demo-form"><label>Data da chamada<input type="date" value={date} onInput={e=>setParams({data:e.currentTarget.value},{replace:true})} onChange={e=>setParams({data:e.target.value},{replace:true})}/></label>{date!==today()&&<Button variant="outline" onClick={()=>setParams({data:today()})}>Voltar para hoje</Button>}</div>{late.length>0&&<p className="teacher-late-note">Você possui {late.length} chamadas anteriores não concluídas. <Link to={`/professor/calendario?mes=${late[0].date.slice(0,7)}&data=${late[0].date}&atrasadas=1`}>Consultar atrasadas</Link></p>}<TeacherClassCards teacherId={who} date={date} origin={origin}/></DemoLoad>
}
