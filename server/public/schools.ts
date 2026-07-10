import { School } from '../models/School'
import { SchoolPublic } from '../types/schools'

export function toSchoolPublic(school: School): SchoolPublic {
  return {
    id: school.id,
    upchieveId: school.id,
    name: school.name,
    districtName: school.district,
    city: school.city,
    state: school.state,
  }
}
