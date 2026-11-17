import type { ClassSummary, DemoRepository } from './contracts'
import { studentsRepository, useStudentsData } from '@/modules/students/data/store'
import { occupancy } from '@/modules/students/services/selectors'
import type { StudentsData } from '@/modules/students/types'
export const DEMO_DATE = '2026-11-12'
// Apenas a situação estática das chamadas da Implementação 01. Pessoas,
// oficinas, capacidades e ocupação vêm exclusivamente do repositório de alunos.
export const classes: Pick<ClassSummary, 'id' | 'activityToday' | 'attendance'>[] = [
  { id: 'turma-demo-01', activityToday: true, attendance: 'Concluída' },
  { id: 'turma-demo-02', activityToday: true, attendance: 'Pendente' },
  { id: 'turma-demo-03', activityToday: true, attendance: 'Concluída' },
  { id: 'turma-demo-04', activityToday: false, attendance: 'Sem atividade' },
]
export function classSummaries(data: StudentsData, year = 2026): ClassSummary[] {
  return data.classes.filter(c => c.year === year).map(c => ({
    id: c.id, workshop: data.workshops.find(w => w.id === c.workshopId)?.name || 'Oficina demonstrativa',
    shift: c.shift, enrolled: occupancy(data, c.id), capacity: c.capacity,
    activityToday: classes.find(original => original.id === c.id)?.activityToday ?? false,
    attendance: classes.find(original => original.id === c.id)?.attendance ?? 'Sem atividade',
  }))
}
export function useClassSummaries(year = 2026) { return classSummaries(useStudentsData(), year) }
export const demoRepository: DemoRepository = { async listClasses() { return classSummaries(studentsRepository.getSnapshot()) } }
