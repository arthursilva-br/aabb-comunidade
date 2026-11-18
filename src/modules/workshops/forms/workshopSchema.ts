import { z } from 'zod'
export const classSchema = z.object({ workshopId: z.string().min(1), label: z.string().trim().min(1, 'Informe o nome da turma.').max(100), year: z.number().int().min(2000).max(2100), shift: z.enum(['Matutino', 'Vespertino']), capacity: z.number().int().min(0).max(10000) })
