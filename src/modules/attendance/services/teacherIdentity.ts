import { useSyncExternalStore } from 'react'
let teacherId='professor-demo-1'
const listeners=new Set<()=>void>()
export function useTeacherIdentity() {
 const id=useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn)}},()=>teacherId)
 return [id,(value:string)=>{teacherId=value;listeners.forEach(fn=>fn())}] as const
}
