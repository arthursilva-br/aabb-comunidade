import type { createDraftController } from './draftController'
type Controller=ReturnType<typeof createDraftController>
export function waitForDraft(controller:Controller):Promise<void> {
 const check=()=>controller.getSnapshot().status
 if(check()==='saved')return Promise.resolve()
 if(check()==='error')return Promise.reject(new Error('O rascunho não foi salvo. Tente salvar novamente antes de sair.'))
 return new Promise((resolve,reject)=>{const unsubscribe=controller.subscribe(()=>{if(check()==='saved'){unsubscribe();resolve()}else if(check()==='error'){unsubscribe();reject(new Error('O rascunho não foi salvo. Tente salvar novamente antes de sair.'))}})})
}
