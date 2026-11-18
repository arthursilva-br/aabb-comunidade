import { useState, type ReactNode } from 'react'
import { useStudentsLoad } from '../../students/data/store'
import { StateMessage } from '@/shared/ui/primitives'
export function DemoLoad({ children }: { children: ReactNode }) { const { state, retry } = useStudentsLoad(); return state === 'ready' ? children : <StateMessage state={state} onRetry={retry} /> }
export function useOperation() { const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); return { message, busy, run: async (fn: () => Promise<unknown>) => { setBusy(true); setMessage(''); try { await fn(); setMessage('Operação concluída na demonstração.') } catch (e) { setMessage(e instanceof Error ? e.message : 'Não foi possível concluir.') } finally { setBusy(false) } } } }
export function Feedback({ message }: { message: string }) { return <p role="status" aria-live="polite">{message}</p> }
