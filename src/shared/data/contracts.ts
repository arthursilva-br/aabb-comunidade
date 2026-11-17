// Contrato para um futuro adaptador Supabase. Não existe conexão nem autenticação nesta etapa.
export interface ClassSummary { id: string; workshop: string; shift: 'Matutino' | 'Vespertino'; enrolled: number; capacity: number; activityToday: boolean; attendance: 'Concluída' | 'Pendente' | 'Sem atividade' }
export interface DemoRepository { listClasses(): Promise<ClassSummary[]> }
