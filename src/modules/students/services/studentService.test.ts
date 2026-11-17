import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryRepository, type StudentsRepository } from '../data/repository'
import { createStudentService, DEMO_ACTOR, type StudentCommands } from './studentService'
import { occupancy, possibleDuplicates, vacancies } from './selectors'
import { studentSchema } from '../forms/studentSchema'
import type { StudentInput } from '../types'

const validInput = (): StudentInput => ({ name: 'Estudante demonstração Aurora', birthDate: '2014-05-09', document: 'DEMO-AURORA', registrationStatus: 'validado', guardians: [{ name: 'Responsável demonstração Aurora', relationship: 'Vínculo fictício', phone: '(00) 00000-0000' }] })
describe('Gestão de alunos — regras demonstrativas', () => {
  let repository: StudentsRepository; let service: StudentCommands
  beforeEach(() => { repository = createMemoryRepository(); service = createStudentService(repository) })
  const enrollment = (studentId = 'aluno-demo-81', classId = 'turma-demo-01') => ({ studentId, classId, confirmed: true })

  it('cadastra aluno válido com responsáveis e auditoria fictícia', async () => {
    const id = await service.saveStudent(validInput())
    expect(repository.getSnapshot().students.find(s => s.id === id)).toMatchObject(validInput())
    expect(repository.getSnapshot().events.at(-1)).toMatchObject({ studentId: id, type: 'cadastro', actor: DEMO_ACTOR })
  })
  it('permite cadastro provisório incompleto, inclusive sem nome', async () => {
    const id = await service.saveStudent({ name: '', birthDate: '', document: '', guardians: [], registrationStatus: 'provisorio' })
    expect(repository.getSnapshot().students.find(s => s.id === id)?.registrationStatus).toBe('provisorio')
    expect(repository.getSnapshot().enrollments.some(e => e.studentId === id)).toBe(false)
  })
  it('não valida cadastro incompleto e documento permanece opcional', async () => {
    await expect(service.saveStudent({ ...validInput(), guardians: [] })).rejects.toThrow('responsável')
    expect(studentSchema.safeParse({ ...validInput(), document: '' }).success).toBe(true)
  })
  it('rejeita data impossível ou futura sem impor idade não aprovada', () => {
    expect(studentSchema.safeParse({ ...validInput(), birthDate: '2015-02-30' }).success).toBe(false)
    expect(studentSchema.safeParse({ ...validInput(), birthDate: '2999-01-01' }).success).toBe(false)
  })
  it('edita cadastro mantendo identidade, matrícula e histórico', async () => {
    const previous = repository.getSnapshot().students[0]
    await service.saveStudent({ ...previous, name: 'Estudante fictício alterado' }, previous.id)
    const data = repository.getSnapshot()
    expect(data.students.find(s => s.id === previous.id)?.name).toBe('Estudante fictício alterado')
    expect(data.enrollments.filter(e => e.studentId === previous.id)).toHaveLength(2)
    expect(data.events.at(-1)?.changes).toContain('Nome alterado(a)')
  })
  it('detecta documento, nome, nascimento e responsável sem unir registros', async () => {
    const original = repository.getSnapshot().students[0]
    const matches = possibleDuplicates(repository.getSnapshot(), original)
    expect(matches[0].reasons).toEqual(expect.arrayContaining(['documento correspondente', 'nome semelhante', 'mesma data de nascimento', 'responsável correspondente']))
    await expect(service.saveStudent(original)).rejects.toThrow('Confira')
    const id = await service.saveStudent(original, undefined, true)
    expect(id).not.toBe(original.id)
    expect(repository.getSnapshot().students).toHaveLength(86)
  })
  it('alerta nomes semelhantes com acentos e permite alunos distintos após conferência', async () => {
    const id = await service.saveStudent(validInput())
    const input = { ...validInput(), name: 'ESTUDANTE demonstracao aurora', document: 'DEMO-OUTRO', birthDate: '2014-08-15', guardians: [] as StudentInput['guardians'], registrationStatus: 'provisorio' as const }
    expect(possibleDuplicates(repository.getSnapshot(), input).some(m => m.student.id === id)).toBe(true)
    await expect(service.saveStudent(input, undefined, true)).resolves.toBeTypeOf('string')
  })
  it('efetiva matrícula válida e ocupa uma vaga', async () => {
    const before = occupancy(repository.getSnapshot(), 'turma-demo-01')
    const id = await service.enroll(enrollment())
    expect(repository.getSnapshot().enrollments.find(e => e.id === id)?.status).toBe('ativa')
    expect(occupancy(repository.getSnapshot(), 'turma-demo-01')).toBe(before + 1)
  })
  it('bloqueia segunda matrícula fixa no mesmo ano, inclusive em outro turno', async () => {
    await service.enroll(enrollment())
    await expect(service.enroll(enrollment('aluno-demo-81', 'turma-demo-02'))).rejects.toThrow('já possui')
    await expect(service.enroll(enrollment('aluno-demo-81', 'turma-demo-04'))).rejects.toThrow('já possui')
  })
  it('bloqueia matrícula de cadastro provisório', async () => {
    await expect(service.enroll(enrollment('aluno-demo-80'))).rejects.toThrow('Cadastro provisório')
  })
  it('não permite tornar provisório um cadastro com matrícula ativa', async () => {
    const student = repository.getSnapshot().students[0]
    await expect(service.saveStudent({ ...student, registrationStatus: 'provisorio' }, student.id)).rejects.toThrow('matrícula ativa')
  })
  it('bloqueia matrícula em turma lotada sem qualquer escrita parcial', async () => {
    const before = repository.getSnapshot()
    await expect(service.enroll(enrollment('aluno-demo-81', 'turma-demo-03'))).rejects.toThrow('sem vagas')
    expect(repository.getSnapshot()).toBe(before)
  })
  it('inclui na espera sem ocupar vaga ou criar matrícula e evita entrada repetida', async () => {
    const before = repository.getSnapshot()
    await service.joinWaitlist(enrollment('aluno-demo-80', 'turma-demo-03'))
    const data = repository.getSnapshot()
    expect(data.waitlist).toHaveLength(before.waitlist.length + 1)
    expect(data.enrollments).toEqual(before.enrollments)
    expect(occupancy(data, 'turma-demo-03')).toBe(25)
    await expect(service.joinWaitlist(enrollment('aluno-demo-80', 'turma-demo-03'))).rejects.toThrow('já está')
  })
  it('promove somente após seleção manual, com confirmação e autoria', async () => {
    await service.withdraw('matricula-demo-aluno-demo-39', true)
    expect(repository.getSnapshot().waitlist[0].status).toBe('aguardando')
    await expect(service.promote('espera-demo-82', false)).rejects.toThrow('Confirme')
    const id = await service.promote('espera-demo-82', true)
    expect(repository.getSnapshot().enrollments.find(e => e.id === id)?.studentId).toBe('aluno-demo-83')
    expect(repository.getSnapshot().waitlist[0]).toMatchObject({ status: 'promovido', decidedBy: DEMO_ACTOR })
    expect(repository.getSnapshot().events.at(-1)?.type).toBe('promocao')
    await expect(service.promote('espera-demo-82', true)).rejects.toThrow('já foi decidido')
  })
  it('revalida a capacidade ao promover e preserva o interessado em caso de falha', async () => {
    await expect(service.promote('espera-demo-82', true)).rejects.toThrow('sem vagas')
    expect(repository.getSnapshot().waitlist[0].status).toBe('aguardando')
  })
  it('revalida cadastro provisório na promoção', async () => {
    const entry = await service.joinWaitlist(enrollment('aluno-demo-80', 'turma-demo-03'))
    await service.withdraw('matricula-demo-aluno-demo-39', true)
    await expect(service.promote(entry, true)).rejects.toThrow('Cadastro provisório')
    expect(vacancies(repository.getSnapshot(), 'turma-demo-03')).toBe(1)
  })
  it('revalida matrícula incompatível na promoção', async () => {
    await service.enroll(enrollment('aluno-demo-83'))
    await service.withdraw('matricula-demo-aluno-demo-39', true)
    await expect(service.promote('espera-demo-82', true)).rejects.toThrow('já possui')
  })
  it('desliga liberando exatamente uma vaga e exige confirmação', async () => {
    await expect(service.withdraw('matricula-demo-aluno-demo-1', false)).rejects.toThrow('Confirme')
    await service.withdraw('matricula-demo-aluno-demo-1', true)
    expect(vacancies(repository.getSnapshot(), 'turma-demo-01')).toBe(6)
    await expect(service.withdraw('matricula-demo-aluno-demo-1', true)).rejects.toThrow('já registrado')
    expect(vacancies(repository.getSnapshot(), 'turma-demo-01')).toBe(6)
  })
  it('preserva cadastro, matrícula, histórico e autoria após desligamento', async () => {
    const before = repository.getSnapshot()
    await service.withdraw('matricula-demo-aluno-demo-1', true)
    const data = repository.getSnapshot()
    expect(data.students).toEqual(before.students)
    expect(data.enrollments).toHaveLength(before.enrollments.length)
    expect(data.events).toHaveLength(before.events.length + 1)
    expect(data.events.at(-1)).toMatchObject({ type: 'desligamento', actor: DEMO_ACTOR, studentId: 'aluno-demo-1' })
    expect(data.events.at(-1)?.occurredAt).toBeTruthy()
  })
  it('mantém independência de vagas entre matutino e vespertino', async () => {
    const afternoon = occupancy(repository.getSnapshot(), 'turma-demo-02')
    await service.enroll(enrollment())
    expect(occupancy(repository.getSnapshot(), 'turma-demo-02')).toBe(afternoon)
    await service.withdraw('matricula-demo-aluno-demo-1', true)
    expect(occupancy(repository.getSnapshot(), 'turma-demo-02')).toBe(afternoon)
  })
  it('permite nova matrícula em outro ano preservando os anos anteriores', async () => {
    const before = repository.getSnapshot().enrollments.filter(e => e.studentId === 'aluno-demo-1')
    await service.enroll(enrollment('aluno-demo-1', 'turma-demo-2027-01'))
    expect(repository.getSnapshot().enrollments.filter(e => e.studentId === 'aluno-demo-1')).toHaveLength(3)
    expect(repository.getSnapshot().enrollments.filter(e => e.studentId === 'aluno-demo-1' && e.year !== 2027)).toEqual(before)
  })
  it('duas tentativas na última vaga não excedem a capacidade', async () => {
    await service.withdraw('matricula-demo-aluno-demo-39', true)
    const result = await Promise.allSettled([service.enroll(enrollment('aluno-demo-81', 'turma-demo-03')), service.enroll(enrollment('aluno-demo-82', 'turma-demo-03'))])
    expect(result.filter(r => r.status === 'fulfilled')).toHaveLength(1)
    expect(occupancy(repository.getSnapshot(), 'turma-demo-03')).toBe(25)
  })
  it('exige confirmação para matrícula e espera, e valida referências', async () => {
    await expect(service.enroll({ ...enrollment(), confirmed: false })).rejects.toThrow('Confirme')
    await expect(service.joinWaitlist({ ...enrollment(), confirmed: false })).rejects.toThrow('Confirme')
    await expect(service.enroll(enrollment('inexistente'))).rejects.toThrow('não encontrado')
    await expect(service.enroll(enrollment('aluno-demo-81', 'inexistente'))).rejects.toThrow('não encontrado')
  })
  it('não permite que consumidores alterem o estado sem uma operação', () => {
    expect(() => { repository.getSnapshot().students[0].name = 'Alteração externa fictícia' }).toThrow()
    expect(repository.getSnapshot().students[0].name).toBe('Aluno fictício 01')
  })
})
