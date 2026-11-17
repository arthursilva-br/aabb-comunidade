import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Card, PageHeading } from '@/shared/ui/primitives'
import { Button } from '@/shared/ui/button'
const schema = z.object({ area: z.enum(['admin', 'professor']) })
export function DemoEntryPage() { const navigate = useNavigate(); const { register, handleSubmit } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { area: 'admin' } }); return <div className="entry-page"><PageHeading title="Conheça o sistema" description="Ambiente de demonstração · AABB Comunidade de Paracatu–MG" /><Card className="content-card"><h2>Escolha uma área para visualizar</h2><p>Não é necessário informar e-mail ou senha. Todos os dados são fictícios.</p><form onSubmit={handleSubmit(({ area }) => navigate(area === 'admin' ? '/admin' : '/professor/turmas'))}><label htmlFor="area">Área demonstrativa</label><select id="area" {...register('area')}><option value="admin">Administração</option><option value="professor">Professor</option></select><Button type="submit">Abrir demonstração</Button></form></Card></div> }
