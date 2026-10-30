import { GRADES } from '../constants'

export function numberToGradeLevel(grade: number): GRADES {
  return `${grade.toFixed()}th` as GRADES
}

export function isHighSchoolGrade(grade: GRADES): boolean {
  return (
    [GRADES.NINTH, GRADES.TENTH, GRADES.ELEVENTH, GRADES.TWELVETH] as GRADES[]
  ).includes(grade)
}
