import { studentsRepository } from '../../students/data/store'
import { createAttendanceService } from './attendanceService'
import { createWorkshopService } from '../../workshops/services/workshopService'
export const attendanceService = createAttendanceService(studentsRepository)
export const workshopService = createWorkshopService(studentsRepository)
