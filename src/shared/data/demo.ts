import type { ClassSummary, DemoRepository } from './contracts'
import { studentsRepository, useStudentsData } from '@/modules/students/data/store'
import { occupancy } from '@/modules/students/services/selectors'
import { callSituation, hasActivity } from '@/modules/attendance/services/selectors'
import type { StudentsData } from '@/modules/students/types'
export const DEMO_DATE = '2026-11-12'
export function classSummaries(data: StudentsData, year = 2026): ClassSummary[] {
 return data.classes.filter(c => c.year === year).map(c => ({ id:c.id, workshop:data.workshops.find(w => w.id === c.workshopId)?.name || 'Oficina demonstrativa', shift:c.shift, enrolled:occupancy(data,c.id), capacity:c.capacity, activityToday:hasActivity(data,c.id,DEMO_DATE), attendance:callSituation(data,c.id,DEMO_DATE) === 'Finalizada' ? 'Concluída' : callSituation(data,c.id,DEMO_DATE) === 'Sem atividade' ? 'Sem atividade' : 'Pendente' }))
}
export function useClassSummaries(year = 2026) { return classSummaries(useStudentsData(), year) }
export const demoRepository: DemoRepository = { async listClasses() { return classSummaries(studentsRepository.getSnapshot()) } }
