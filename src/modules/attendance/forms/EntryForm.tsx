import { useState } from 'react'
import type { AttendanceCall, AttendanceEntry, Mark } from '../types'
import { attendanceService } from '../services/commands'
import { Card } from '@/shared/ui/primitives'
import { Button } from '@/shared/ui/button'
import { Feedback, useOperation } from '../components/DemoUI'
export function EntryForm({ entry, call, teacherId }: { entry: AttendanceEntry; call: AttendanceCall; teacherId: string }) {
 const [mark,setMark] = useState<Mark>(entry.mark); const [justification,setJustification] = useState(entry.justification); const [reason,setReason] = useState(''); const op = useOperation()
 return <Card className="attendance-entry"><h3>{entry.name}</h3><p>Registro atual: <strong>{entry.mark === 'nao-marcado' ? 'Não marcado' : entry.mark}</strong>{entry.justification && ` · Justificativa: ${entry.justification}`}</p><form className="demo-form" onSubmit={e => { e.preventDefault(); void op.run(() => attendanceService.mark(call.id,entry.enrollmentId,mark,mark === 'ausente' ? justification : '',teacherId,reason)) }}><fieldset><legend>Marcação de {entry.name}</legend><div className="mark-options">{(['presente','ausente'] as const).map(m => <Button type="button" key={m} variant={mark === m ? 'default' : 'outline'} aria-pressed={mark === m} onClick={() => setMark(m)}>{m === 'presente' ? '✓ Presente' : '✕ Ausente'}</Button>)}</div></fieldset>{mark === 'ausente' && <label>Justificativa da ausência<textarea value={justification} onChange={e => setJustification(e.target.value)} maxLength={2000} /></label>}{call.status === 'finalizada' && <label>Motivo obrigatório da correção<input value={reason} onChange={e => setReason(e.target.value)} required maxLength={1000} /></label>}<Button disabled={op.busy || mark === 'nao-marcado'}>{call.status === 'finalizada' ? 'Salvar correção com histórico' : 'Salvar marcação'}</Button><Feedback message={op.message} /></form></Card>
}
