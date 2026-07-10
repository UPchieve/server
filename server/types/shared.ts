export type Uuid = string
export type Ulid = string

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json }
