import { useStudentsData } from '../../students/data/store'
import { useTeacherIdentity } from '../services/teacherIdentity'
export function TeacherProfile(){const d=useStudentsData();const [who,setWho]=useTeacherIdentity();return <label className="teacher-profile">Simulação de perfil docente<select value={who} onChange={e=>setWho(e.target.value)}>{d.teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select><small>Perfil fictício, sem autenticação real.</small></label>}
