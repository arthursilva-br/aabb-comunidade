import {describe,it,expect} from 'vitest'
import {selectedDate,selectedMonth,monthCells,moveMonth,dailyRows,callAction,callUrl,returnUrl,authorizedClasses} from './teacherNavigation'
import {createMemoryRepository} from '../../students/data/repository'
import {createAttendanceService} from './attendanceService'
import {createDraftService} from './draftService'
import {createDraftController} from './draftController'
import {waitForDraft} from './navigationGuard'
import {calendarRows,overdueRows,monthlySummary} from './calendar'
import {hasActivity} from './selectors'
const now='2026-11-17',who='professor-demo-1',cid='turma-demo-01'
describe('03.2 — navegação docente',()=>{
 it('data padrão é hoje',()=>expect(selectedDate(new URLSearchParams(),now)).toBe(now))
 it('seleção anterior preservada na URL',()=>expect(selectedDate(new URLSearchParams('data=2026-11-12'),now)).toBe('2026-11-12'))
 it('data inválida retorna hoje sem falhar',()=>expect(selectedDate(new URLSearchParams('data=2026-02-31'),now)).toBe(now))
 it('retorno para hoje substitui contexto anterior',()=>expect(selectedDate(new URLSearchParams(`data=${now}`),now)).toBe(now))
 it('grade possui semanas inteiras de sete células',()=>{const cells=monthCells('2026-12');expect(cells.length%7).toBe(0);expect(cells[2]).toBe('2026-12-01');expect(cells.filter(Boolean)).toHaveLength(31)})
 it('navega mês com virada do ano',()=>{expect(moveMonth('2026-12',1)).toBe('2027-01');expect(moveMonth('2026-01',-1)).toBe('2025-12')})
 it('mês inválido usa mês atual',()=>expect(selectedMonth(new URLSearchParams('mes=2026-99'),now)).toBe('2026-11'))
 it('seleção do dia não altera os registros',()=>{const r=createMemoryRepository();const before=r.getSnapshot();dailyRows(before,'2026-11-12',who,now);expect(r.getSnapshot()).toBe(before)})
 it('retorna à data original de Minhas turmas',()=>{const origin='/professor/turmas?data=2026-11-12';const url=callUrl(cid,'2026-11-12',origin);expect(returnUrl(new URL(url,'http://demo.local').searchParams,now)).toBe(origin)})
 it('retorna ao mês, data e filtros do Calendário',()=>{const origin='/professor/calendario?mes=2026-11&data=2026-11-12&oficina=oficina-demo-1&turma=turma-demo-02&atrasadas=1';expect(returnUrl(new URL(callUrl(cid,now,origin),'http://demo.local').searchParams,now)).toBe(origin)})
 it('URL direta tem retorno seguro',()=>expect(returnUrl(new URLSearchParams(),now)).toBe(`/professor/turmas?data=${now}`))
 it('não aceita origem externa',()=>expect(returnUrl(new URLSearchParams('origem=https://example.com'),now)).toBe(`/professor/turmas?data=${now}`))
 it('troca oferece somente turmas autorizadas do ano',()=>{const r=createMemoryRepository();expect(authorizedClasses(r.getSnapshot(),who,now).map(c=>c.id)).toEqual(['turma-demo-01','turma-demo-02']);expect(authorizedClasses(r.getSnapshot(),'professor-demo-3',now)).toEqual([])})
 it('ações variam com situação e futuro não oferece chamada',()=>{expect(callAction('Pendente')).toBe('Fazer chamada');expect(callAction('Rascunho')).toBe('Continuar chamada');expect(callAction('Concluída')).toBe('Ver chamada');expect(callAction('Prevista')).toBeNull();expect(callAction('Sem atividade')).toBeNull()})
 it('quantidade usa participantes fixados e não ocupação posterior',async()=>{const r=createMemoryRepository();await createAttendanceService(r).open(cid,'2026-11-12',who);await r.transaction(d=>{d.enrollments[0].endedAt='2026-11-10T12:00:00Z'});expect(dailyRows(r.getSnapshot(),'2026-11-12',who,now)[0].participants).toBe(20)})
 it('espera o rascunho antes de navegar',async()=>{let release!:()=>void;const r=createMemoryRepository();const id=await createAttendanceService(r).open(cid,'2026-11-12',who);const c=createDraftController(r.getSnapshot().calls[0].entries,async()=>{await new Promise<void>(resolve=>{release=resolve})});c.allPresent();let ready=false;const wait=waitForDraft(c).then(()=>{ready=true});expect(ready).toBe(false);release();await wait;expect(ready).toBe(true);expect(id).toBeTruthy()})
 it('erro impede navegação sem descartar marcação e retry libera',async()=>{const r=createMemoryRepository();await createAttendanceService(r).open(cid,'2026-11-12',who);let fails=true;const c=createDraftController(r.getSnapshot().calls[0].entries,async()=>{if(fails)throw new Error('Falha fictícia')});c.allPresent();await Promise.resolve();await expect(waitForDraft(c)).rejects.toThrow('não foi salvo');expect(c.getSnapshot().entries[0].mark).toBe('presente');fails=false;c.retry();await waitForDraft(c);expect(c.getSnapshot().status).toBe('saved')})
})
describe('03.2 — período operacional e atrasos',()=>{
 it('semente elimina projeção indevida desde janeiro',()=>{const d=createMemoryRepository().getSnapshot();expect(overdueRows(d,who,now)).toHaveLength(22);expect(overdueRows(d,who,now).every(r=>r.date>='2026-11-01')).toBe(true)})
 it('não gera pendência antes da vigência inicial',()=>{const d=createMemoryRepository().getSnapshot();expect(hasActivity(d,cid,'2026-10-30')).toBe(false);expect(calendarRows(d,'2026-10',who,now).every(r=>r.status==='Sem atividade')).toBe(true)})
 it('não gera pendência após encerramento operacional',async()=>{const r=createMemoryRepository();await r.transaction(d=>{d.calendars[0].operationalUntil='2026-11-10'});expect(hasActivity(r.getSnapshot(),cid,'2026-11-11')).toBe(false)})
 it('sem início configurado não inventa período',async()=>{const r=createMemoryRepository();await r.transaction(d=>{delete d.calendars[0].operationalFrom});expect(hasActivity(r.getSnapshot(),cid,now)).toBe(false)})
 it('exceção de atividade não contorna início operacional',async()=>{const r=createMemoryRepository();await r.transaction(d=>{d.calendars[0].included.push('2026-10-30')});expect(hasActivity(r.getSnapshot(),cid,'2026-10-30')).toBe(false)})
 it('exclui futuro e dias sem atividade dos atrasos',()=>{const d=createMemoryRepository().getSnapshot();expect(overdueRows(d,who,now).every(r=>r.date<now&&r.expected)).toBe(true)})
 it('resumo é consistente e atrasos não incluem hoje',()=>{const rows=calendarRows(createMemoryRepository().getSnapshot(),'2026-11',who,now);const s=monthlySummary(rows,now);expect(s.expected).toBe(24);expect(s.overdue).toBe(22);expect(s.pending+s.drafts+s.completed).toBe(s.expected)})
 it('dia parcialmente concluído mantém vespertino pendente',async()=>{const r=createMemoryRepository();const a=createAttendanceService(r);const id=await a.open(cid,'2026-11-12',who);const entries=r.getSnapshot().calls[0].entries.map(e=>({...e,mark:'presente' as const}));const ds=createDraftService(r);await ds.save(id,who,entries);await ds.confirm(id,who,entries,true);const rows=dailyRows(r.getSnapshot(),'2026-11-12',who,now);expect(rows.map(r=>r.status)).toEqual(['Concluída','Pendente']);expect(monthlySummary(calendarRows(r.getSnapshot(),'2026-11',who,now),now).overdue).toBe(21)})
 it('rascunho aparece sem concluir e pode retomar em dia antigo',async()=>{const r=createMemoryRepository();await createAttendanceService(r).open(cid,'2026-11-12',who);expect(dailyRows(r.getSnapshot(),'2026-11-12',who,now)[0].status).toBe('Rascunho')})
 it('nega abertura antecipada mesmo por chamada direta do serviço',async()=>{const r=createMemoryRepository();await expect(createAttendanceService(r).open(cid,'2026-12-01',who)).rejects.toThrow('futuras')})
 it('filtro de professor não expõe outro turno',async()=>{const r=createMemoryRepository();await r.transaction(d=>{d.authorizations=d.authorizations.filter(a=>a.classId!== 'turma-demo-02')});expect(dailyRows(r.getSnapshot(),now,who,now).map(r=>r.schoolClass.shift)).toEqual(['Matutino'])})
})
