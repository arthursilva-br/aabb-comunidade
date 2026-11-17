import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { Card, PageHeading, StateMessage } from '@/shared/ui/primitives'
import { useStudentsData, useStudentsLoad, studentService } from '../data/store'
import { classTitle, occupancy, studentName, vacancies } from '../services/selectors'
import { enrollmentSchema } from '../forms/studentSchema'
import { Confirmation, DemoNotice, ErrorNotice, RegistrationBadge } from '../components/StudentUI'

type EnrollmentForm = z.infer<typeof enrollmentSchema>
export function EnrollmentPage() {
  const { alunoId } = useParams(); const [params] = useSearchParams(); const navigate = useNavigate()
  const data = useStudentsData(); const load = useStudentsLoad(); const student = data.students.find(s => s.id === alunoId)
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EnrollmentForm>({ resolver: zodResolver(enrollmentSchema), defaultValues: { year: params.get('ano') || '2026', workshopId: '', shift: 'Matutino', classId: '' } })
  const values = watch()
  const [review, setReview] = useState<{ classId: string; mode: 'enroll' | 'wait' } | null>(null)
  const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  if (load.state !== 'ready') return <StateMessage state={load.state} onRetry={load.retry} />
  if (!student) return <StateMessage state="empty" />
  const schoolClasses = data.classes.filter(c => c.year === Number(values.year) && c.workshopId === values.workshopId && c.shift === values.shift)
  const schoolClass = schoolClasses.find(c => c.id === values.classId)
  const full = !!schoolClass && vacancies(data, schoolClass.id) <= 0
  const current = data.enrollments.find(e => e.studentId === student.id && e.year === Number(values.year) && e.status === 'ativa')
  const resetClass = () => { setValue('classId', ''); setError('') }
  const submit = handleSubmit(input => { setError(''); setReview({ classId: input.classId, mode: full ? 'wait' : 'enroll' }) })
  const confirm = async () => {
    if (!review) return
    setBusy(true); setError('')
    try {
      const command = { studentId: student.id, classId: review.classId, confirmed: true }
      if (review.mode === 'wait') await studentService.joinWaitlist(command)
      else await studentService.enroll(command)
      navigate(`/admin/alunos/${student.id}?ano=${values.year}`, { state: { message: review.mode === 'wait' ? 'Interesse registrado na lista de espera. Nenhuma vaga ocupada.' : 'Matrícula fictícia confirmada.' } })
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível confirmar. Revise os dados.') }
    finally { setBusy(false) }
  }
  return <div className="students-module"><PageHeading title="Matrícula anual" description={studentName(student.name)} action={<Button asChild variant="outline"><Link to={`/admin/alunos/${student.id}?ano=${values.year}`}>Voltar à ficha</Link></Button>} /><DemoNotice /><RegistrationBadge status={student.registrationStatus} />
    {student.registrationStatus === 'provisorio' && <div className="inline-alert"><p>Cadastro provisório não permite matrícula ativa. É possível registrar interesse em turma lotada, sem ocupar vaga. <Link to={`/admin/alunos/${student.id}/editar?ano=${values.year}`}>Conferir cadastro</Link></p></div>}
    {current && <div className="inline-alert"><p>Já existe matrícula fixa ativa em {values.year}: {classTitle(data, current.classId)}. Uma segunda matrícula ativa é bloqueada.</p></div>}
    <Card className="content-card"><h2>Selecionar oficina e turma</h2><p>Turnos têm vagas independentes. A oficina fixa é definida pela turma.</p><form className="student-form" onSubmit={submit} noValidate><div className="student-form-grid">
      <label>Ano letivo<select {...register('year', { onChange: resetClass })}>{[...new Set(data.classes.map(c => c.year))].map(y => <option key={y}>{y}</option>)}</select></label>
      <label>Oficina<select {...register('workshopId', { onChange: resetClass })}><option value="">Selecione a oficina</option>{data.workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select>{errors.workshopId && <span className="field-error">{errors.workshopId.message}</span>}</label>
      <label>Turno<select {...register('shift', { onChange: resetClass })}><option>Matutino</option><option>Vespertino</option></select></label>
      <label>Turma correspondente<select {...register('classId')}><option value="">Selecione a turma</option>{schoolClasses.map(c => <option key={c.id} value={c.id}>{c.label} · {vacancies(data, c.id)} vagas</option>)}</select>{errors.classId && <span className="field-error">{errors.classId.message}</span>}</label>
    </div>
      {schoolClass && <div className="enrollment-summary"><p>{classTitle(data, schoolClass.id)}</p><p>{occupancy(data, schoolClass.id)} de {schoolClass.capacity} vagas ocupadas · {vacancies(data, schoolClass.id)} disponíveis</p>{full && <p className="field-error">Não existem vagas nesta turma. Inclua o aluno na lista de espera para seleção manual; isso não cria matrícula nem ocupa vaga.</p>}<Link to={`/admin/alunos/espera?turma=${schoolClass.id}&ano=${values.year}`}>Ver interessados desta turma</Link></div>}
      <Button type="submit" disabled={!full && (student.registrationStatus === 'provisorio' || !!current)}>{full ? 'Revisar inclusão na lista de espera' : 'Revisar matrícula'}</Button>
      <ErrorNotice message={review ? '' : error} />
    </form></Card>
    <p className="table-note">Estados e vigência detalhados da matrícula continuam pendentes. A demonstração usa somente matrícula ativa ou desligada, sem transferência.</p>
    {review && <Confirmation title={review.mode === 'wait' ? 'Confirmar interesse na lista de espera' : 'Confirmar matrícula anual'} busy={busy} error={error} onCancel={() => { setReview(null); setError('') }} onConfirm={confirm}><p>{studentName(student.name)}</p><p>{classTitle(data, review.classId)}</p><p>{review.mode === 'wait' ? 'Será registrado apenas interesse. Sem matrícula ativa, sem ocupar vaga e sem promoção automática.' : 'Será criada uma matrícula fixa ativa no ano e unidade. Cadastro, matrícula única e capacidade serão verificados novamente ao confirmar.'}</p></Confirmation>}
  </div>
}
