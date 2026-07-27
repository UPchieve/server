export type PublicSchoolCsvRecord = {
  ncessch: string
  st: string
  sch_name: string
  lea_name: string | undefined
  lcity: string
  lzip: string
  mcity: string
  mzip: string
  gslo: string | null | undefined
  gshi: string | null | undefined
  total_students: number | null | undefined
  national_school_lunch_program: string | null | undefined
  nslp_direct_certification: number | null | undefined
  frl_eligible: number | null | undefined
}

export type PrivateSchoolCsvRecord = {
  PPIN: string
  PINST: string
  PCITY: string
  PSTABB: string
  PZIP: string
  LOGR2022: string | null | undefined
  HIGR2022: string | null | undefined
  NUMSTUDS: number | null | undefined
}

export type FormattedSchoolNcesMetadataRecord = PublicSchoolCsvRecord & {
  school_year: string
}
