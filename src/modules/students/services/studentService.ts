import { studentSchema, registrationIssues } from '../forms/studentSchema'
import type { Enrollment, EnrollmentInput, HistoryEvent, StudentInput, StudentsData } from '../types'
import type { StudentsRepository } from '../data/repository'
import { DEMO_UNIT } from '../data/seed'
import { classTitle, possibleDuplicates, vacancies } from './selectors'

export const DEMO_ACTOR = 'Administração fictícia · DEMO'
export interface StudentCommands {
  saveStudent(input: StudentInput, id?: string, duplicatesReviewed?: boolean): Promise<string>
  enroll(input: EnrollmentInput): Promise<string>
  joinWaitlist(input: EnrollmentInput): Promise<string>
  promote(entryId: string, confirmed: boolean): Promise<string>
  withdraw(enrollmentId: string, confirmed: boolean): Promise<void>
}

export function createStudentService(repository: StudentsRepository): StudentCommands {
  const id = () => crypto.randomUUID()
  const record = (data: StudentsData, event: Omit<HistoryEvent, 'id' | 'actor' | 'occurredAt'>) => data.events.push({ ...event, id: id(), actor: DEMO_ACTOR, occurredAt: new Date().toISOString() })
  const requireConfirmation = (confirmed: boolean) => { if (!confirmed) throw new Error('Confirme a operação administrativa antes de continuar.') }
  const context = (data: StudentsData, studentId: string, classId: string) => {
    const student = data.students.find(s => s.id === studentId && s.unitId === DEMO_UNIT)
    const schoolClass = data.classes.find(c => c.id === classId && c.unitId === DEMO_UNIT)
    if (!student || !schoolClass) throw new Error('Aluno ou turma não encontrado nesta unidade demonstrativa.')
    return { student, schoolClass }
  }
  const checkEnrollment = (data: StudentsData, studentId: string, classId: string) => {
    const { student, schoolClass } = context(data, studentId, classId)
    if (student.registrationStatus !== 'validado' || registrationIssues(student).length) throw new Error('Cadastro provisório ou incompleto. Valide os dados antes de efetivar a matrícula.')
    if (data.enrollments.some(e => e.studentId === student.id && e.unitId === schoolClass.unitId && e.year === schoolClass.year && e.status === 'ativa')) throw new Error('O aluno já possui matrícula fixa ativa neste ano e unidade.')
    if (vacancies(data, classId) <= 0) throw new Error('Turma sem vagas. A lista de espera não ocupa vaga.')
    return { student, schoolClass }
  }
  const insertEnrollment = (data: StudentsData, studentId: string, classId: string) => {
    const { schoolClass } = checkEnrollment(data, studentId, classId)
    const enrollment: Enrollment = { id: id(), studentId, unitId: schoolClass.unitId, classId, year: schoolClass.year, status: 'ativa', startedAt: new Date().toISOString() }
    data.enrollments.push(enrollment)
    record(data, { studentId, enrollmentId: enrollment.id, type: 'matricula', description: `Matrícula confirmada: ${classTitle(data, classId)}.` })
    return enrollment.id
  }
  return {
    async saveStudent(input, studentId, duplicatesReviewed = false) {
      const parsed = studentSchema.safeParse(input)
      if (!parsed.success) throw new Error(parsed.error.issues.map(i => i.message).join(' '))
      return repository.transaction(data => {
        const previous = studentId ? data.students.find(s => s.id === studentId && s.unitId === DEMO_UNIT) : undefined
        if (studentId && !previous) throw new Error('Cadastro não encontrado.')
        if (possibleDuplicates(data, parsed.data, studentId).length && !duplicatesReviewed) throw new Error('Confira os possíveis cadastros correspondentes antes de salvar separadamente.')
        if (previous && parsed.data.registrationStatus === 'provisorio' && data.enrollments.some(e => e.studentId === studentId && e.status === 'ativa')) throw new Error('Este cadastro possui matrícula ativa. Preserve a validação cadastral ou registre o desligamento antes de torná-lo provisório.')
        const newId = previous?.id ?? id()
        const student = { ...parsed.data, id: newId, unitId: DEMO_UNIT, guardians: parsed.data.guardians.filter(g => g.name || g.relationship || g.phone).map((g, index) => ({ ...g, id: previous?.guardians[index]?.id ?? id() })) }
        if (previous) data.students[data.students.indexOf(previous)] = student
        else data.students.push(student)
        const changes = previous ? (['name', 'birthDate', 'document', 'registrationStatus', 'guardians'] as const).filter(key => JSON.stringify(previous[key]) !== JSON.stringify(student[key])).map(key => {
          const labels = { name: 'Nome', birthDate: 'Nascimento', document: 'Documento', registrationStatus: 'Situação cadastral', guardians: 'Responsáveis e contatos' }
          // O histórico registra os campos alterados sem replicar documentos e contatos.
          return `${labels[key]} alterado(a)`
        }) : undefined
        record(data, { studentId: newId, type: previous ? 'edicao' : 'cadastro', description: `${previous ? 'Cadastro atualizado' : 'Cadastro criado'} (${student.registrationStatus === 'validado' ? 'validado pelo critério provisório' : 'provisório'}).${duplicatesReviewed ? ' Possíveis duplicidades conferidas; registros mantidos separados.' : ''}`, changes })
        return newId
      })
    },
    async enroll(input) {
      requireConfirmation(input.confirmed)
      return repository.transaction(data => insertEnrollment(data, input.studentId, input.classId))
    },
    async joinWaitlist(input) {
      requireConfirmation(input.confirmed)
      return repository.transaction(data => {
        context(data, input.studentId, input.classId)
        if (vacancies(data, input.classId) > 0) throw new Error('A turma possui vaga. Revise a matrícula em vez de incluir na espera por lotação.')
        if (data.waitlist.some(w => w.studentId === input.studentId && w.classId === input.classId && w.status === 'aguardando')) throw new Error('Este aluno já está na lista de espera desta turma.')
        const entry = { id: id(), studentId: input.studentId, classId: input.classId, status: 'aguardando' as const, createdAt: new Date().toISOString() }
        data.waitlist.push(entry)
        record(data, { studentId: input.studentId, waitlistId: entry.id, type: 'espera', description: `Interesse registrado: ${classTitle(data, input.classId)}. Sem matrícula e sem ocupar vaga.` })
        return entry.id
      })
    },
    async promote(entryId, confirmed) {
      requireConfirmation(confirmed)
      return repository.transaction(data => {
        const entry = data.waitlist.find(w => w.id === entryId)
        if (!entry || entry.status !== 'aguardando') throw new Error('O interesse já foi decidido ou não foi encontrado.')
        const enrollmentId = insertEnrollment(data, entry.studentId, entry.classId)
        entry.status = 'promovido'; entry.decidedAt = new Date().toISOString(); entry.decidedBy = DEMO_ACTOR
        record(data, { studentId: entry.studentId, enrollmentId, waitlistId: entry.id, type: 'promocao', description: `Seleção manual confirmada para ${classTitle(data, entry.classId)}.` })
        return enrollmentId
      })
    },
    async withdraw(enrollmentId, confirmed) {
      requireConfirmation(confirmed)
      await repository.transaction(data => {
        const enrollment = data.enrollments.find(e => e.id === enrollmentId && e.unitId === DEMO_UNIT)
        if (!enrollment || enrollment.status !== 'ativa') throw new Error('Matrícula ativa não encontrada ou desligamento já registrado.')
        enrollment.status = 'desligada'; enrollment.endedAt = new Date().toISOString()
        record(data, { studentId: enrollment.studentId, enrollmentId, type: 'desligamento', description: `Desligamento confirmado: ${classTitle(data, enrollment.classId)}. Vaga liberada; cadastro e histórico preservados.` })
      })
    },
  }
}
