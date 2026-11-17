import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { Badge, Card, DataTable, PageHeading, StateMessage, SuccessMessage } from '@/shared/ui/primitives'
import { studentService, useStudentsData, useStudentsLoad } from '../data/store'
import { classTitle, studentName, vacancies } from '../services/selectors'
import { BackToStudents, Confirmation, DemoNotice, formatDate, RegistrationBadge } from '../components/StudentUI'

export function WaitlistPage() {
  const data = useStudentsData(); const load = useStudentsLoad(); const [params, setParams] = useSearchParams()
  const year = params.get('ano') || '2026'; const classId = params.get('turma') || ''
  const [entryId, setEntryId] = useState<string | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('')
  const selectedEntry = data.waitlist.find(w => w.id === entryId)
  const entries = data.waitlist.filter(w => w.status === 'aguardando' && (!classId || w.classId === classId) && data.classes.some(c => c.id === w.classId && c.year === Number(year)))
  const promote = async () => {
    if (!entryId) return
    setBusy(true); setError('')
    try { await studentService.promote(entryId, true); setEntryId(null); setMessage('Seleção manual registrada. Matrícula confirmada e histórico atualizado.') }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível promover o interessado.') }
    finally { setBusy(false) }
  }
  return <div className="students-module"><PageHeading title="Lista de espera por turma" description="Seleção manual pela administração. Nenhuma prioridade automática foi definida." action={<BackToStudents year={year} />} /><DemoNotice />{message && <SuccessMessage>{message}</SuccessMessage>}
    <Card><div className="student-filters"><label>Ano letivo<select value={year} onChange={e => setParams({ ano: e.target.value })}>{[...new Set(data.classes.map(c => c.year))].map(y => <option key={y}>{y}</option>)}</select></label><label>Turma<select value={classId} onChange={e => setParams({ ano: year, turma: e.target.value })}><option value="">Todas as turmas do ano</option>{data.classes.filter(c => c.year === Number(year)).map(c => <option value={c.id} key={c.id}>{classTitle(data, c.id)} · {vacancies(data, c.id)} vagas</option>)}</select></label></div>
      <p className="table-note">A apresentação não estabelece ordem de prioridade. Qualquer interessado pode ser selecionado manualmente. Cadastros provisórios precisam ser validados antes da promoção. A liberação de vaga nunca promove alguém automaticamente.</p>
      {load.state !== 'ready' ? <StateMessage state={load.state} onRetry={load.retry} /> : entries.length ? <DataTable caption="Interessados por turma" columns={['Interessado', 'Turma', 'Cadastro', 'Registro do interesse', 'Vagas', 'Seleção manual']} rows={entries.map(w => {
        const student = data.students.find(s => s.id === w.studentId)!
        return [<Link to={`/admin/alunos/${student.id}?ano=${year}`}>{studentName(student.name)}</Link>, classTitle(data, w.classId), <RegistrationBadge status={student.registrationStatus} />, formatDate(w.createdAt), <Badge tone={vacancies(data, w.classId) > 0 ? 'success' : 'warning'}>{vacancies(data, w.classId)} vagas</Badge>, <Button variant="outline" onClick={() => { setEntryId(w.id); setError('') }}>Selecionar para matrícula</Button>]
      })} /> : <StateMessage state="empty" />}
    </Card>
    {selectedEntry && <Confirmation title="Confirmar seleção manual" busy={busy} error={error} onCancel={() => { setEntryId(null); setError('') }} onConfirm={promote}><p>{studentName(data.students.find(s => s.id === selectedEntry.studentId)?.name || '')}</p><p>{classTitle(data, selectedEntry.classId)}</p><p>A decisão administrativa será registrada com data e autor fictício. A confirmação exige vaga, cadastro validado e ausência de matrícula fixa ativa incompatível.</p></Confirmation>}
  </div>
}
