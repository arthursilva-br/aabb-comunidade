import { Search } from 'lucide-react'
import { Input } from '@/shared/ui/input'
export function SearchField({ value, onChange, label = 'Pesquisar' }: { value: string; onChange: (value: string) => void; label?: string }) { return <label className="search-field"><span className="sr-only">{label}</span><Search size={20} aria-hidden="true" /><Input type="search" placeholder={label} value={value} onChange={e => onChange(e.target.value)} /></label> }
