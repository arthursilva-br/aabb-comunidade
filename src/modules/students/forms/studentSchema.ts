import { z } from 'zod'
import type { StudentInput } from '../types'

export const PROVISIONAL_VALIDATION = 'Critério provisório da demonstração: para validar, informe nome, nascimento válido e pelo menos um responsável com nome, vínculo e telefone. A lista definitiva de campos obrigatórios aguarda aprovação. Documento é opcional.'

export function validBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value <= new Date().toISOString().slice(0, 10)
}

export function registrationIssues(value: StudentInput): string[] {
  const issues: string[] = []
  if (!value.name.trim()) issues.push('Informe o nome do aluno para validar o cadastro.')
  if (!validBirthDate(value.birthDate)) issues.push('Informe uma data de nascimento válida para validar o cadastro.')
  if (!value.guardians.some(g => g.name.trim() && g.relationship.trim() && g.phone.trim())) issues.push('Informe um responsável com nome, vínculo e telefone para validar o cadastro.')
  return issues
}

export const studentSchema = z.object({
  name: z.string().trim().max(160, 'Use até 160 caracteres.'),
  birthDate: z.string().refine(v => !v || validBirthDate(v), 'Informe uma data de nascimento válida, sem data futura.'),
  document: z.string().trim().max(60, 'Use até 60 caracteres.'),
  registrationStatus: z.enum(['provisorio', 'validado']),
  guardians: z.array(z.object({ name: z.string().trim().max(160), relationship: z.string().trim().max(80), phone: z.string().trim().max(40) })).max(20),
}).superRefine((value, ctx) => {
  if (value.registrationStatus !== 'validado') return
  if (!value.name) ctx.addIssue({ code: 'custom', path: ['name'], message: 'Informe o nome para validar (critério provisório).' })
  if (!value.birthDate) ctx.addIssue({ code: 'custom', path: ['birthDate'], message: 'Informe o nascimento para validar (critério provisório).' })
  if (!value.guardians.some(g => g.name && g.relationship && g.phone)) ctx.addIssue({ code: 'custom', path: ['guardians'], message: 'Preencha nome, vínculo e telefone de pelo menos um responsável (critério provisório).' })
})

export const enrollmentSchema = z.object({
  year: z.string().min(1, 'Selecione o ano.'), workshopId: z.string().min(1, 'Selecione a oficina.'),
  shift: z.enum(['Matutino', 'Vespertino']), classId: z.string().min(1, 'Selecione a turma.'),
})
