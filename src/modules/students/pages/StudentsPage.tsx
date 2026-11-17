import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Badge, Card, DataTable, PageHeading, StateMessage, type ViewState } from '@/shared/ui/primitives'
import { Button } from '@/shared/ui/button'
import { SearchField } from '@/shared/forms/SearchField'
import { useStudentsData, useStudentsLoad } from '../data/store'
import { normalize, studentName } from '../services/selectors'
import { DemoNotice } from '../components/StudentUI'

export function StudentsPage() {
  const data = useStudentsData(); const load = useStudentsLoad()
  const [params, setParams] = useSearchParams()
  const latestFilters = useRef(params)
  useEffect(() => { latestFilters.current = params }, [params])
  const [preview, setPreview] = useState<ViewState>('ready')
  const year = params.get('ano') || '2026', search = params.get('busca') || '', workshop = params.get('oficina') || '', shift = params.get('turno') || '', status = params.get('situacao') || ''
  const setFilter = (key: string, value: string) => {
    // React Router não enfileira callbacks de busca como setState. Preserve também
    // alterações rápidas antes que a navegação anterior tenha sido renderizada.
    const next = new URLSearchParams(latestFilters.current)
    if (value) next.set(key, value); else next.delete(key)
    latestFilters.current = next
    setParams(next, { replace: true })
  }
  const rows = data.students.flatMap(student => {
    const enrollments = data.enrollments.filter(e => e.studentId === student.id && e.year === Number(year))
    const enrollment = enrollments.find(e => e.status === 'ativa') ?? enrollments.at(-1)
    const c = data.classes.find(c => c.id === enrollment?.classId)
    const enrollmentStatus = enrollment?.status ?? 'sem-matricula'
    if (!normalize(student.name).includes(normalize(search)) || (workshop && c?.workshopId !== workshop) || (shift && c?.shift !== shift) || (status && (status === 'provisorio' ? student.registrationStatus !== 'provisorio' : enrollmentStatus !== status))) return []
    return [[<strong>{studentName(student.name)}</strong>, data.workshops.find(w => w.id === c?.workshopId)?.name ?? 'Sem oficina neste ano', c?.shift ?? '—', <><Badge tone={enrollmentStatus === 'ativa' ? 'success' : 'neutral'}>{enrollmentStatus === 'ativa' ? 'Matrícula ativa' : enrollmentStatus === 'desligada' ? 'Desligada' : 'Sem matrícula'}</Badge>{student.registrationStatus === 'provisorio' && <Badge tone="warning">Cadastro provisório</Badge>}</>, <Button variant="ghost" asChild><Link aria-label={`Ver detalhes de ${studentName(student.name)}`} to={`/admin/alunos/${student.id}?ano=${year}`}>Ver detalhes</Link></Button>]]
  })
  const state = preview !== 'ready' ? preview : load.state
  return <div className="students-module"><PageHeading title="Gestão de alunos" description="Cadastro permanente, matrículas anuais e histórico preservado." action={<Button asChild><Link to={`/admin/alunos/novo?ano=${year}`}>Cadastrar aluno</Link></Button>} /><DemoNotice />
    <Card><div className="card-heading"><div><h2>Alunos · {year}</h2><p>{rows.length} cadastros encontrados · {data.students.length} cadastros permanentes</p></div><Button asChild variant="outline"><Link to={`/admin/alunos/espera?ano=${year}`}>Lista de espera por turma</Link></Button></div>
      <div className="student-filters"><SearchField value={search} onChange={v => setFilter('busca', v)} label="Pesquisar por nome" />
        <label>Ano letivo<select value={year} onChange={e => setFilter('ano', e.target.value)}>{[...new Set(data.classes.map(c => c.year))].map(y => <option key={y}>{y}</option>)}</select></label>
        <label>Oficina<select value={workshop} onChange={e => setFilter('oficina', e.target.value)}><option value="">Todas as oficinas</option>{data.workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
        <label>Turno<select value={shift} onChange={e => setFilter('turno', e.target.value)}><option value="">Todos os turnos</option><option>Matutino</option><option>Vespertino</option></select></label>
        <label>Situação da matrícula<select value={status} onChange={e => setFilter('situacao', e.target.value)}><option value="">Todas as situações</option><option value="ativa">Ativa</option><option value="desligada">Desligada</option><option value="sem-matricula">Sem matrícula no ano</option><option value="provisorio">Cadastro provisório</option></select></label>
      </div>
      {state !== 'ready' ? <StateMessage state={state} onRetry={() => { setPreview('ready'); load.retry() }} /> : rows.length ? <DataTable caption={`Alunos fictícios de ${year}`} columns={['Nome do aluno', 'Oficina fixa no ano', 'Turno', 'Situação', 'Ação']} rows={rows} /> : <StateMessage state="empty" />}
    </Card><div className="state-preview"><label htmlFor="students-state">Visualizar estado demonstrativo</label><select id="students-state" value={preview} onChange={e => setPreview(e.target.value as ViewState)}><option value="ready">Padrão</option><option value="loading">Carregamento</option><option value="empty">Sem resultados</option><option value="error">Erro</option><option value="denied">Acesso negado</option></select></div>
  </div>
}
