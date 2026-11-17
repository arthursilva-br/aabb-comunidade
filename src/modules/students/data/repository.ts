import type { StudentsData } from '../types'
import { createStudentsSeed } from './seed'

// Porta de dados da demonstração. Um adaptador remoto deverá executar as mesmas
// operações atomicamente no servidor, com Auth/RLS; callbacks locais não são RPCs.
export interface StudentsRepository {
  getSnapshot(): StudentsData
  subscribe(listener: () => void): () => void
  load(): Promise<void>
  transaction<T>(change: (draft: StudentsData) => T): Promise<T>
}

export function createMemoryRepository(initial = createStudentsSeed()): StudentsRepository {
  const freeze = (data: StudentsData) => {
    const deepFreeze = (value: object) => { Object.values(value).forEach(v => { if (v && typeof v === 'object') deepFreeze(v) }); Object.freeze(value) }
    deepFreeze(data)
    return data
  }
  let snapshot = freeze(structuredClone(initial))
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener) } },
    async load() { /* Sem rede nem persistência: dados exclusivamente em memória. */ },
    async transaction(change) {
      // Sem await entre cópia e commit: a memória é atualizada em uma operação.
      const draft = structuredClone(snapshot)
      const result = change(draft)
      snapshot = freeze(draft)
      listeners.forEach(listener => listener())
      return structuredClone(result)
    },
  }
}
