import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card } from '@/shared/ui/primitives'
import type { Student, StudentInput } from '../types'
import { PROVISIONAL_VALIDATION, studentSchema } from './studentSchema'
import { possibleDuplicates, studentName } from '../services/selectors'
import { studentService, useStudentsData } from '../data/store'
import { ErrorNotice, formatDate } from '../components/StudentUI'

export function StudentForm({ student, year }: { student?: Student; year: string }) {
  const data = useStudentsData(); const navigate = useNavigate()
  const [error, setError] = useState(''); const [reviewed, setReviewed] = useState(false)
  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<StudentInput>({ resolver: zodResolver(studentSchema), defaultValues: student ?? { name: '', birthDate: '', document: '', registrationStatus: 'provisorio', guardians: [{ name: '', relationship: '', phone: '' }] } })
  const { fields, append, remove } = useFieldArray({ control, name: 'guardians' })
  const values = watch(); const matches = possibleDuplicates(data, values, student?.id)
  const markUnreviewed = () => { setReviewed(false); setError('') }
  const submit = handleSubmit(async input => {
    setError('')
    try { const id = await studentService.saveStudent(input, student?.id, reviewed); navigate(`/admin/alunos/${id}?ano=${year}`, { state: { message: student ? 'Cadastro fictício atualizado.' : 'Cadastro fictício criado.' } }) }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível salvar. Tente novamente.') }
  })
  return <form className="student-form" onSubmit={submit} onChange={markUnreviewed} noValidate autoComplete="off"><div className="inline-alert"><p>{PROVISIONAL_VALIDATION} Um cadastro provisório pode ser salvo sem todos esses dados.</p></div>
    <Card className="content-card"><h2>Dados do aluno</h2><div className="student-form-grid">
      <label htmlFor="student-name">Nome completo<Input id="student-name" aria-label="Nome completo" {...register('name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />{errors.name && <span className="field-error" id="name-error">{errors.name.message}</span>}</label>
      <label htmlFor="birth-date">Data de nascimento<Input id="birth-date" aria-label="Data de nascimento" type="date" {...register('birthDate')} aria-invalid={!!errors.birthDate} aria-describedby={errors.birthDate ? 'birth-error' : undefined} />{errors.birthDate && <span className="field-error" id="birth-error">{errors.birthDate.message}</span>}</label>
      <label htmlFor="identity-document">Documento de identificação fictício (opcional)<Input id="identity-document" placeholder="Ex.: DEMO-EXEMPLO" {...register('document')} aria-invalid={!!errors.document} />{errors.document && <span className="field-error">{errors.document.message}</span>}</label>
      <label htmlFor="registration-status">Situação cadastral<select id="registration-status" {...register('registrationStatus')}><option value="provisorio">Provisório</option><option value="validado">Validado pelo critério provisório</option></select></label>
    </div></Card>
    <Card className="content-card"><h2>Responsáveis e contatos</h2><p>Inclua apenas informações fictícias. É possível registrar mais de um responsável.</p>
      {fields.map((field, index) => <fieldset className="guardian-fields" key={field.id}><legend>Responsável {index + 1}</legend><div className="student-form-grid">
        <label htmlFor={`guardian-name-${index}`}>Nome completo do responsável {index + 1}<Input id={`guardian-name-${index}`} {...register(`guardians.${index}.name`)} />{errors.guardians?.[index]?.name && <span className="field-error">Use até 160 caracteres.</span>}</label>
        <label htmlFor={`guardian-relationship-${index}`}>Vínculo com o aluno {index + 1}<Input id={`guardian-relationship-${index}`} {...register(`guardians.${index}.relationship`)} />{errors.guardians?.[index]?.relationship && <span className="field-error">Use até 80 caracteres.</span>}</label>
        <label htmlFor={`guardian-phone-${index}`}>Telefone de contato {index + 1}<Input id={`guardian-phone-${index}`} type="tel" placeholder="(00) 00000-0000" {...register(`guardians.${index}.phone`)} />{errors.guardians?.[index]?.phone && <span className="field-error">Use até 40 caracteres.</span>}</label>
      </div><Button type="button" variant="ghost" onClick={() => { remove(index); markUnreviewed() }}>Remover responsável {index + 1}</Button></fieldset>)}
      {errors.guardians?.message && <p role="alert" className="field-error">{errors.guardians.message}</p>}
      <Button type="button" variant="outline" disabled={fields.length >= 20} onClick={() => { append({ name: '', relationship: '', phone: '' }); markUnreviewed() }}>Adicionar responsável</Button>
    </Card>
    {!!matches.length && <Card className="content-card duplicate-alert"><h2>Possíveis cadastros correspondentes</h2><p>Confira antes de salvar. Semelhança não comprova duplicidade; os registros nunca são unidos automaticamente.</p><ul>{matches.map(({ student: match, reasons }) => <li key={match.id}><details><summary>{studentName(match.name)} — {reasons.join(', ')}</summary><p>Nascimento: {formatDate(match.birthDate)} · Responsáveis: {match.guardians.map(g => g.name || 'Não informado').join(', ') || 'Não informados'}</p></details></li>)}</ul><label className="student-checkbox"><input type="checkbox" checked={reviewed} onChange={e => { e.stopPropagation(); setReviewed(e.target.checked) }} />Conferi as semelhanças e desejo manter este cadastro separado.</label></Card>}
    <ErrorNotice message={error} /><div className="student-actions"><Button type="submit" disabled={isSubmitting || (!!matches.length && !reviewed)}>{isSubmitting ? 'Salvando…' : 'Salvar cadastro fictício'}</Button><Button asChild variant="outline"><Link to={student ? `/admin/alunos/${student.id}?ano=${year}` : `/admin/alunos?ano=${year}`}>Cancelar</Link></Button></div>
  </form>
}
