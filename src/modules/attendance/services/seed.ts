import type { TeachingData } from '../types'
export function createTeachingSeed(): TeachingData {
  return { teachers: [1, 2, 3].map(i => ({ id: `professor-demo-${i}`, name: `Professor fictício ${i}` })), authorizations: [1, 2, 3, 4].map(i => ({ id: `vinculo-demo-${i}`, classId: `turma-demo-0${i}`, teacherId: `professor-demo-${i < 3 ? 1 : 2}`, kind: 'titular' })), calendars: [1, 2, 3, 4].map(i => ({ classId: `turma-demo-0${i}`, operationalFrom: '2026-11-01', operationalUntil: '2026-12-31', weekdays: i === 4 ? [1, 3, 5] : [1, 2, 3, 4, 5], included: [], excluded: [] })), calls: [], audit: [] }
}
