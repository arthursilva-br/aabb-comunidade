import { AlertDialog } from 'radix-ui'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/primitives'
import type { RegistrationStatus } from '../types'

export function DemoNotice() { return <p className="student-demo-note">Demonstração com dados exclusivamente fictícios. Alterações ficam em memória e são descartadas ao atualizar o navegador. Não informe dados reais.</p> }
export function RegistrationBadge({ status }: { status: RegistrationStatus }) { return <Badge tone={status === 'validado' ? 'success' : 'warning'}>{status === 'validado' ? 'Validado · critério provisório' : 'Cadastro provisório'}</Badge> }
export function BackToStudents({ year = '2026' }: { year?: string }) { return <Button asChild variant="outline"><Link to={`/admin/alunos?ano=${year}`}>Voltar à listagem</Link></Button> }
export function ErrorNotice({ message }: { message: string }) { return message ? <div className="student-error" role="alert">{message}</div> : null }
export function formatDate(value: string, time = false) {
  if (!value) return 'Não informado'
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', ...(time ? { dateStyle: 'short', timeStyle: 'short' } as const : { dateStyle: 'short' } as const) }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value))
}
export function Confirmation({ title, children, busy, error, onCancel, onConfirm }: {
  title: string; children: ReactNode; busy: boolean; error: string; onCancel(): void; onConfirm(): void
}) {
  return <AlertDialog.Root open onOpenChange={open => { if (!open && !busy) onCancel() }}><AlertDialog.Portal><AlertDialog.Overlay className="student-dialog-overlay" /><AlertDialog.Content className="student-dialog"><AlertDialog.Title>{title}</AlertDialog.Title><AlertDialog.Description asChild><div className="student-confirm-description">{children}</div></AlertDialog.Description><ErrorNotice message={error} /><div className="student-actions"><AlertDialog.Cancel asChild><Button variant="outline" disabled={busy} onClick={onCancel}>Cancelar</Button></AlertDialog.Cancel><Button disabled={busy} onClick={onConfirm}>{busy ? 'Registrando…' : 'Confirmar operação'}</Button></div></AlertDialog.Content></AlertDialog.Portal></AlertDialog.Root>
}
