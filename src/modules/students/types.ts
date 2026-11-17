export type Shift = 'Matutino' | 'Vespertino'
export type RegistrationStatus = 'provisorio' | 'validado'
export interface Guardian { id: string; name: string; relationship: string; phone: string }
export interface Student {
  id: string; unitId: string; name: string; birthDate: string; document: string
  registrationStatus: RegistrationStatus; guardians: Guardian[]
}
export interface Workshop { id: string; unitId: string; name: string }
export interface SchoolClass {
  id: string; unitId: string; workshopId: string; year: number; shift: Shift; capacity: number; label: string
}
// Estados mínimos exclusivos da demonstração; o ciclo definitivo permanece pendente.
export interface Enrollment {
  id: string; studentId: string; unitId: string; classId: string; year: number
  status: 'ativa' | 'desligada'; startedAt: string; endedAt?: string
}
export interface WaitlistEntry {
  id: string; studentId: string; classId: string; status: 'aguardando' | 'promovido'
  createdAt: string; decidedAt?: string; decidedBy?: string
}
export interface HistoryEvent {
  id: string; studentId: string; enrollmentId?: string; waitlistId?: string
  type: 'cadastro' | 'edicao' | 'matricula' | 'espera' | 'promocao' | 'desligamento'
  occurredAt: string; actor: string; description: string; changes?: string[]
}
export interface StudentsData {
  students: Student[]; workshops: Workshop[]; classes: SchoolClass[]
  enrollments: Enrollment[]; waitlist: WaitlistEntry[]; events: HistoryEvent[]
}
export interface StudentInput {
  name: string; birthDate: string; document: string; registrationStatus: RegistrationStatus
  guardians: { name: string; relationship: string; phone: string }[]
}
export interface EnrollmentInput { studentId: string; classId: string; confirmed: boolean }
