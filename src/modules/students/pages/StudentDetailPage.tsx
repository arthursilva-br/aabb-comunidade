import { useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { Badge, Card, DataTable, PageHeading, StateMessage, SuccessMessage } from '@/shared/ui/primitives'
import { Button } from '@/shared/ui/button'
import { useStudentsData, useStudentsLoad, studentService } from '../data/store'
import { classTitle, studentName } from '../services/selectors'
import { registrationIssues, PROVISIONAL_VALIDATION } from '../forms/studentSchema'
import { BackToStudents, Confirmation, DemoNotice, formatDate, RegistrationBadge } from '../components/StudentUI'

export function StudentDetailPage() {
  const { alunoId } = useParams(); const [params, setParams] = useSearchParams(); const year = params.get('ano') || '2026'
  const data = useStudentsData(); const load = useStudentsLoad(); const location = useLocation()
  const student = data.students.find(s => s.id === alunoId)
  const [withdrawal, setWithdrawal] = useState<string | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState<string>(location.state?.message || '')
  if (load.state !== 'ready') return <StateMessage state={load.state} onRetry={load.retry} />
  if (!student) return <><BackToStudents year={year} /><StateMessage state="empty" /></>
  const enrollments = data.enrollments.filter(e => e.studentId === student.id)
  const selected = enrollments.filter(e => e.year === Number(year))
  const issues = registrationIssues(student)
  const waiting = data.waitlist.filter(w => w.studentId === student.id && w.status === 'aguardando')
  const involved = data.enrollments.find(e => e.id === withdrawal)
  const confirmWithdrawal = async () => {
    if (!withdrawal) return
    setBusy(true); setError('')
    try { await studentService.withdraw(withdrawal, true); setWithdrawal(null); setMessage('Desligamento registrado. Vaga liberada e histórico preservado.') }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível registrar o desligamento.') }
    finally { setBusy(false) }
  }
  return <div className="students-module"><PageHeading title={studentName(student.name)} description="Ficha individual · cadastro permanente fictício." action={<BackToStudents year={year} />} /><DemoNotice />{message && <SuccessMessage>{message}</SuccessMessage>}
    <div className="student-actions"><Button variant="outline" asChild><Link to={`/admin/alunos/${student.id}/editar?ano=${year}`}>Editar cadastro</Link></Button><Button asChild><Link to={`/admin/alunos/${student.id}/matricula?ano=${year}`}>Nova matrícula / interesse</Link></Button><Button disabled title="A semântica de transferência depende de aprovação.">Transferência — regras em definição</Button></div>
    <div className="two-columns"><Card className="content-card"><h2>Dados cadastrais</h2><RegistrationBadge status={student.registrationStatus} /><dl className="student-facts"><dt>Nome completo</dt><dd>{studentName(student.name)}</dd><dt>Nascimento</dt><dd>{formatDate(student.birthDate)}</dd><dt>Documento fictício</dt><dd>{student.document || 'Não informado'}</dd></dl><p>Este cadastro é permanente. A escolha do ano consulta apenas os vínculos anuais.</p></Card>
      <Card className="content-card"><h2>Responsáveis e contatos</h2>{student.guardians.length ? student.guardians.map(g => <dl className="student-facts guardian-summary" key={g.id}><dt>Responsável</dt><dd>{g.name || 'Não informado'}</dd><dt>Vínculo</dt><dd>{g.relationship || 'Não informado'}</dd><dt>Contato fictício</dt><dd>{g.phone || 'Não informado'}</dd></dl>) : <p>Nenhum responsável informado.</p>}</Card></div>
    <Card className="content-card"><div className="student-section-heading"><h2>Matrícula do ano selecionado</h2><label>Ano letivo<select value={year} onChange={e => setParams({ ano: e.target.value })}>{[...new Set(data.classes.map(c => c.year))].map(y => <option key={y}>{y}</option>)}</select></label></div>
      {selected.length ? selected.map(e => <div key={e.id} className="enrollment-summary"><p><strong>{classTitle(data, e.classId)}</strong></p><Badge tone={e.status === 'ativa' ? 'success' : 'neutral'}>{e.status === 'ativa' ? 'Matrícula ativa' : 'Desligada'}</Badge><p>Registrada em {formatDate(e.startedAt)}{e.endedAt && ` · Desligamento em ${formatDate(e.endedAt)}`}</p>{e.status === 'ativa' && <Button variant="outline" onClick={() => { setWithdrawal(e.id); setError('') }}>Desligar desta turma</Button>}</div>) : <p>Sem matrícula em {year}. A mudança de ano não cria matrícula automaticamente.</p>}
    </Card>
    <Card><div className="card-heading"><div><h2>Histórico de matrículas anuais</h2><p>Todos os anos, independentemente do filtro atual.</p></div></div>{enrollments.length ? <DataTable caption="Histórico anual do aluno" columns={['Ano', 'Oficina / turma', 'Situação', 'Início', 'Desligamento']} rows={enrollments.map(e => [e.year, classTitle(data, e.classId), e.status === 'ativa' ? 'Ativa' : 'Desligada', formatDate(e.startedAt), e.endedAt ? formatDate(e.endedAt) : '—'])} /> : <p className="table-note">Nenhuma matrícula registrada.</p>}<p className="table-note">Estados mínimos demonstrativos: ativa e desligada. Transferências aguardam definição e não são realizadas nesta etapa.</p></Card>
    <Card className="content-card"><h2>Situação de cadastro e pendências</h2><p>{PROVISIONAL_VALIDATION}</p>{issues.length ? <ul>{issues.map(issue => <li key={issue}>{issue}</li>)}</ul> : <p>Dados mínimos da demonstração preenchidos.</p>}{student.registrationStatus === 'provisorio' && <p className="field-error">Cadastro provisório: a administração precisa conferir e marcar como validado antes da matrícula.</p>}{waiting.map(w => <p key={w.id}>Aguardando seleção manual: {classTitle(data, w.classId)}. Sem ocupar vaga. <Link to={`/admin/alunos/espera?turma=${w.classId}&ano=${year}`}>Consultar interessados</Link></p>)}</Card>
    <Card className="content-card"><h2>Eventos de histórico demonstrativo</h2><p>Cadastro pessoal, matrículas, lista de espera e desligamentos são registrados separadamente.</p><ol className="student-timeline">{data.events.filter(e => e.studentId === student.id).slice().sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).map(event => <li key={event.id}><strong>{event.description}</strong><p>{formatDate(event.occurredAt, true)} · {event.actor}</p>{event.changes?.length ? <p>{event.changes.join(' · ')}</p> : null}</li>)}</ol></Card>
    {withdrawal && involved && <Confirmation title="Confirmar desligamento" busy={busy} error={error} onCancel={() => setWithdrawal(null)} onConfirm={confirmWithdrawal}><p>{studentName(student.name)}</p><p>{classTitle(data, involved.classId)}</p><p>A matrícula será desligada e a vaga liberada. Cadastro pessoal e histórico serão preservados. A ação terá data e identificação administrativa fictícia.</p></Confirmation>}
  </div>
}
