import type { SchoolClass } from '../../students/types'
import { workshopService } from '../../attendance/services/commands'
import { Feedback, useOperation } from '../../attendance/components/DemoUI'
import { Button } from '@/shared/ui/button'
export function ClassForm({ workshopId, year, c }: { workshopId: string; year: number; c?: SchoolClass }) {
 const op = useOperation()
 return <form className="demo-form" onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); void op.run(() => workshopService.saveClass({ workshopId, year: c?.year ?? Number(f.get('year')), shift: c?.shift ?? f.get('shift') as SchoolClass['shift'], capacity: Number(f.get('capacity')), label: String(f.get('label')) }, c?.id)) }}><h3>{c ? 'Editar turma e capacidade' : 'Nova turma'}</h3><label>Nome da turma<input name="label" required defaultValue={c?.label} /></label>{!c && <><label>Ano<input name="year" type="number" min="2000" max="2100" defaultValue={year} key={year} required /></label><label>Turno<select name="shift"><option>Matutino</option><option>Vespertino</option></select></label></>}<label>Capacidade<input name="capacity" type="number" min="0" max="10000" required defaultValue={c?.capacity ?? 25} /></label><Button disabled={op.busy}>{c ? 'Salvar turma' : 'Criar turma'}</Button><Feedback message={op.message} /></form>
}
