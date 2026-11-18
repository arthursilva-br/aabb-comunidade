import { waitForDraft } from './navigationGuard'
import { useSyncExternalStore } from 'react'
import { studentsRepository } from '../../students/data/store'
import { createDraftService } from './draftService'
import { createDraftController } from './draftController'
import type { AttendanceCall } from '../types'
export const draftService=createDraftService(studentsRepository)
const sessions=new Map<string,ReturnType<typeof createDraftController>>()
export function useDraft(call:AttendanceCall,teacherId:string) {
 const key=`${call.id}:${teacherId}`
 let controller=sessions.get(key)
 if(!controller || (controller.getSnapshot().status === "saved" && JSON.stringify(controller.getSnapshot().entries) !== JSON.stringify(call.entries))){controller=createDraftController(call.entries,entries=>draftService.save(call.id,teacherId,entries));sessions.set(key,controller)}
 const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot)
 return {controller,state}
}

export const hasUnsavedDrafts=()=>[...sessions.values()].some(c=>c.getSnapshot().status!=='saved')
export const waitForAllDrafts=()=>Promise.all([...sessions.values()].map(waitForDraft)).then(()=>{})
export const retryAllDrafts=()=>sessions.forEach(c=>c.retry())
