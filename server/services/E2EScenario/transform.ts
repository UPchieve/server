import {
  RegisterStudentPayload,
  RegisterVolunteerPayload,
} from '../../utils/auth-utils'

/**
 * Pure data-transformation layer for the E2E scenario builder.
 *
 * Following data-oriented-programming principles (Yehonathan Sharvit), this
 * module contains ONLY pure functions operating on plain data. There is no IO
 * here: no DB access, no clock, no randomness. Any value that would otherwise
 * be generated (email, name, password, etc.) is injected via `defaults` so the
 * transforms remain deterministic and trivially unit-testable.
 */

/**
 * The raw student entity as sent up from the frontend/Playwright.
 * `id` is a caller-supplied temp id (e.g. `student-1`) used purely to
 * correlate entities in the response.
 */
export interface StudentSpec {
  kind: 'student'
  id: string
  email?: string
  firstName?: string
  lastName?: string
  gradeLevel?: string
  password?: string
}
export interface VolunteerSpec {
  kind: 'volunteer'
  id: string
  email?: string
  firstName?: string
  lastName?: string
  password?: string
}

/**
 * The generated values injected at the IO edge. Keeping these as inputs (rather
 * than generating them inside the transform) is what keeps `resolveStudent`
 * pure.
 */
export interface StudentDefaults {
  email: string
  firstName: string
  lastName: string
  password: string
}
export interface VolunteerDefaults {
  email: string
  firstName: string
  lastName: string
  password: string
}

/**
 * A fully-resolved student: the original temp id plus a complete registration
 * payload ready to be handed to the registration service at the IO edge.
 */
export interface ResolvedStudent {
  tempId: string
  payload: RegisterStudentPayload
}
export interface ResolvedVolunteer {
  tempId: string
  payload: RegisterVolunteerPayload
}

/**
 * Merge a raw spec with injected defaults into a complete registration payload.
 * Pure: same inputs always produce the same output.
 */
export function resolveStudent(
  spec: StudentSpec,
  defaults: StudentDefaults
): ResolvedStudent {
  return {
    tempId: spec.id,
    payload: {
      email: spec.email ?? defaults.email,
      firstName: spec.firstName ?? defaults.firstName,
      lastName: spec.lastName ?? defaults.lastName,
      password: spec.password ?? defaults.password,
      gradeLevel: spec.gradeLevel,
    },
  }
}
export function resolveVolunteer(
  spec: VolunteerSpec,
  defaults: VolunteerDefaults
): ResolvedVolunteer {
  return {
    tempId: spec.id,
    payload: {
      email: spec.email ?? defaults.email,
      firstName: spec.firstName ?? defaults.firstName,
      lastName: spec.lastName ?? defaults.lastName,
      password: spec.password ?? defaults.password,
    },
  }
}
