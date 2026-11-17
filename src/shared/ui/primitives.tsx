import type { ReactNode } from 'react'
import { AlertCircle, Inbox, LoaderCircle, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { Button } from './button'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) { return <section className={`card ${className}`}>{children}</section> }
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'blue' }) { return <span className={`badge badge-${tone}`}>{children}</span> }
export function PageHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div>{action}</div> }
export function DataTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: ReactNode[][] }) { return <div className="table-scroll" tabIndex={0} role="region" aria-label={caption}><table><caption className="sr-only">{caption}</caption><thead><tr>{columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div> }
export type ViewState = 'ready' | 'loading' | 'empty' | 'error' | 'denied'
export function StateMessage({ state, onRetry }: { state: Exclude<ViewState, 'ready'>; onRetry?: () => void }) {
  const entries = { loading: [LoaderCircle, 'Carregando informações', 'Aguarde enquanto os dados são preparados.'], empty: [Inbox, 'Nenhum registro encontrado', 'Não há informações para os filtros selecionados.'], error: [AlertCircle, 'Não foi possível carregar', 'Tente novamente para visualizar os dados demonstrativos.'], denied: [ShieldAlert, 'Acesso negado', 'Esta área não está disponível para o perfil selecionado.'] } as const
  const [Icon, title, text] = entries[state]
  return <Card className="state-message"><div role={state === 'error' ? 'alert' : 'status'}><Icon size={36} className={state === 'loading' ? 'spin' : ''} /><h2>{title}</h2><p>{text}</p></div>{onRetry && state !== 'loading' && <Button variant="outline" onClick={onRetry}>Voltar aos dados</Button>}</Card>
}
export function SuccessMessage({ children }: { children: ReactNode }) { return <p className="success-message" role="status"><CheckCircle2 size={20} />{children}</p> }
