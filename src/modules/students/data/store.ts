import { useEffect, useState, useSyncExternalStore } from 'react'
import { createMemoryRepository } from './repository'
import { createStudentService } from '../services/studentService'

export const studentsRepository = createMemoryRepository()
export const studentService = createStudentService(studentsRepository)
export function useStudentsData() {
  return useSyncExternalStore(studentsRepository.subscribe, studentsRepository.getSnapshot)
}
export function useStudentsLoad() {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setState('loading')
    studentsRepository.load().then(() => { if (active) setState('ready') }, () => { if (active) setState('error') })
    return () => { active = false }
  }, [attempt])
  return { state, retry: () => setAttempt(a => a + 1) }
}
