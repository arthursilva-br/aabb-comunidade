export interface Teacher { id: string; name: string }
export interface Authorization { id: string; classId: string; teacherId: string; kind: 'titular' | 'adicional' | 'substituto'; from?: string; until?: string }
export interface ActivityCalendar { classId: string; operationalFrom?: string; operationalUntil?: string; weekdays: number[]; included: string[]; excluded: string[] }
export type Mark = 'presente' | 'ausente' | 'nao-marcado'
export interface AttendanceEntry { enrollmentId: string; studentId: string; name: string; mark: Mark; justification: string }
export interface Correction { enrollmentId: string; before: AttendanceEntry; after: AttendanceEntry; reason: string; actor: string; at: string }
export interface AttendanceCall { id: string; classId: string; date: string; status: 'aberta' | 'finalizada'; entries: AttendanceEntry[]; ambiguities: string[]; corrections: Correction[]; openedBy: string; openedAt: string; closedBy?: string; closedAt?: string }
export interface DemoAudit { operation: string; entityId: string; actor: string; at: string; before?: string; after?: string }
export interface TeachingData { teachers: Teacher[]; authorizations: Authorization[]; calendars: ActivityCalendar[]; calls: AttendanceCall[]; audit: DemoAudit[] }
