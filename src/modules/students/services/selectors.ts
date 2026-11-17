import type { StudentsData, StudentInput } from '../types'

export const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, ' ').trim()
export const studentName = (name: string) => name || 'Cadastro fictício sem nome'
export const occupancy = (data: StudentsData, classId: string) => data.enrollments.filter(e => e.classId === classId && e.status === 'ativa').length
export const vacancies = (data: StudentsData, classId: string) => {
  const schoolClass = data.classes.find(c => c.id === classId)
  return schoolClass ? schoolClass.capacity - occupancy(data, classId) : 0
}
export const classTitle = (data: StudentsData, classId: string) => {
  const c = data.classes.find(c => c.id === classId)
  return c ? `${data.workshops.find(w => w.id === c.workshopId)?.name} · ${c.shift} · ${c.label} · ${c.year}` : 'Turma indisponível'
}
export function possibleDuplicates(data: StudentsData, input: StudentInput, excludingId?: string) {
  const document = normalize(input.document).replaceAll(' ', '')
  const name = normalize(input.name)
  return data.students.filter(s => s.id !== excludingId).flatMap(student => {
    const reasons: string[] = []
    if (document && document === normalize(student.document).replaceAll(' ', '')) reasons.push('documento correspondente')
    const other = normalize(student.name)
    if (name && other && (name === other || (Math.min(name.length, other.length) >= 6 && (name.includes(other) || other.includes(name))))) reasons.push('nome semelhante')
    if (input.birthDate && input.birthDate === student.birthDate) reasons.push('mesma data de nascimento')
    if (input.guardians.some(g => normalize(g.name) && student.guardians.some(s => normalize(s.name) === normalize(g.name)))) reasons.push('responsável correspondente')
    // Nascimento isolado não é sinal suficiente; documento, nome ou responsável alertam.
    return reasons.some(r => r !== 'mesma data de nascimento') ? [{ student, reasons }] : []
  })
}
