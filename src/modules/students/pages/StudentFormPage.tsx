import { useParams, useSearchParams } from 'react-router-dom'
import { PageHeading, StateMessage } from '@/shared/ui/primitives'
import { useStudentsData, useStudentsLoad } from '../data/store'
import { StudentForm } from '../forms/StudentForm'
import { BackToStudents, DemoNotice } from '../components/StudentUI'

export function StudentFormPage() {
  const { alunoId } = useParams(); const [params] = useSearchParams(); const year = params.get('ano') || '2026'
  const data = useStudentsData(); const load = useStudentsLoad(); const student = data.students.find(s => s.id === alunoId)
  return <div className="students-module"><PageHeading title={alunoId ? 'Editar cadastro' : 'Cadastrar aluno'} description="Cadastro pessoal permanente, separado da matrícula anual." action={<BackToStudents year={year} />} /><DemoNotice />{load.state !== 'ready' ? <StateMessage state={load.state} onRetry={load.retry} /> : alunoId && !student ? <StateMessage state="empty" /> : <StudentForm key={alunoId || 'novo'} student={student} year={year} />}</div>
}
