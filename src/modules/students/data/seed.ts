import type { StudentsData, Student, SchoolClass } from '../types'

export const DEMO_UNIT = 'unidade-demo'
export function createStudentsSeed(): StudentsData {
  const workshops = [1, 2].map(i => ({ id: `oficina-demo-${i}`, unitId: DEMO_UNIT, name: `Oficina demonstrativa ${String(i).padStart(2, '0')}` }))
  const classes: SchoolClass[] = [2025, 2026, 2027].flatMap(year => [0, 1, 2, 3].map(i => ({
    id: year === 2026 ? `turma-demo-0${i + 1}` : `turma-demo-${year}-0${i + 1}`,
    unitId: DEMO_UNIT, workshopId: workshops[Math.floor(i / 2)].id, year,
    shift: i % 2 ? 'Vespertino' as const : 'Matutino' as const, capacity: 25, label: `Turma demonstrativa 0${i + 1}`,
  })))
  const students: Student[] = Array.from({ length: 85 }, (_, i) => ({
    id: `aluno-demo-${i + 1}`, unitId: DEMO_UNIT, name: `Aluno fictício ${String(i + 1).padStart(2, '0')}`,
    birthDate: `2015-03-${String(i % 27 + 1).padStart(2, '0')}`, document: `DEMO-${String(i + 1).padStart(4, '0')}`,
    registrationStatus: i === 79 ? 'provisorio' : 'validado',
    guardians: i === 79 ? [] : [{ id: `responsavel-demo-${i + 1}`, name: `Responsável fictício ${String(i + 1).padStart(2, '0')}`, relationship: 'Vínculo demonstrativo', phone: '(00) 00000-0000' }],
  }))
  students[79].birthDate = ''; students[79].document = ''
  let offset = 0
  const enrollments: StudentsData['enrollments'] = [20, 18, 25, 16].flatMap((count, index) => Array.from({ length: count }, () => {
    const student = students[offset++]
    return { id: `matricula-demo-${student.id}`, studentId: student.id, unitId: DEMO_UNIT, classId: `turma-demo-0${index + 1}`, year: 2026, status: 'ativa' as const, startedAt: '2026-02-02T12:00:00.000Z' }
  }))
  enrollments.push({ id: 'matricula-demo-historica', studentId: students[0].id, unitId: DEMO_UNIT, classId: 'turma-demo-2025-01', year: 2025, status: 'desligada', startedAt: '2025-02-03T12:00:00.000Z', endedAt: '2025-11-28T12:00:00.000Z' })
  enrollments.push({ id: 'matricula-demo-desligada', studentId: students[84].id, unitId: DEMO_UNIT, classId: 'turma-demo-02', year: 2026, status: 'desligada', startedAt: '2026-02-02T12:00:00.000Z', endedAt: '2026-10-01T12:00:00.000Z' })
  const waitlist: StudentsData['waitlist'] = [82, 83].map(i => ({ id: `espera-demo-${i}`, studentId: students[i].id, classId: 'turma-demo-03', status: 'aguardando', createdAt: '2026-11-10T12:00:00.000Z' }))
  const actor = 'Administração fictícia · DEMO'
  return { students, workshops, classes, enrollments, waitlist, events: [
    ...enrollments.flatMap(e => [
      { id: `evento-${e.id}`, studentId: e.studentId, enrollmentId: e.id, type: 'matricula' as const, occurredAt: e.startedAt, actor, description: `Matrícula demonstrativa em ${e.year}.` },
      ...(e.endedAt ? [{ id: `fim-${e.id}`, studentId: e.studentId, enrollmentId: e.id, type: 'desligamento' as const, occurredAt: e.endedAt, actor, description: 'Desligamento fictício confirmado. Cadastro preservado.' }] : []),
    ]),
    ...waitlist.map(w => ({ id: `evento-${w.id}`, studentId: w.studentId, waitlistId: w.id, type: 'espera' as const, occurredAt: w.createdAt, actor, description: 'Interesse demonstrativo registrado sem ocupar vaga.' })),
  ] }
}
