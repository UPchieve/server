import { getUuid } from '../../models/pgUtils'
import { registerStudent, registerVolunteer } from '../UserCreationService'
import {
  resolveStudent,
  resolveVolunteer,
  StudentDefaults,
  StudentSpec,
  VolunteerSpec,
} from './transform'

/**
 * E2E scenario builder.
 *
 * This is the IO "edge": the only place that generates randomness and talks to
 * the database. All data shaping is delegated to the pure functions in
 * `./transform`. This keeps the interesting logic testable in isolation while
 * this module stays a thin orchestrator.
 *
 * It exists so Playwright specs (running against the SPA in the e2e env) can
 * quickly stand up entities. Each entity is sent with a caller-supplied temp
 * `id` (e.g. `student-1`); we echo that `tempId` back alongside the real db id
 * so the test can correlate the two.
 */

export interface ScenarioInput {
  students?: StudentSpec[]
  volunteers?: VolunteerSpec[]
}

export interface CreatedEntity {
  tempId: string
  id: string
}

export interface ScenarioResult {
  students: CreatedEntity[]
  volunteers: CreatedEntity[]
}

/**
 * Generate the default values for a student. Kept here (not in the pure layer)
 * because it is inherently non-deterministic.
 */
function buildStudentDefaults(): StudentDefaults {
  const unique = getUuid().slice(0, 8)
  return {
    email: `e2e-student-${unique}@upchieve.org`,
    firstName: 'E2E',
    lastName: 'Student',
    password: 'Password123',
  }
}

function buildVolunteerDefaults(): StudentDefaults {
  const unique = getUuid().slice(0, 8)
  return {
    email: `e2e-volunteer-${unique}@upchieve.org`,
    firstName: 'E2E',
    lastName: 'Volunteer',
    password: 'Password123',
  }
}

export async function buildScenario(
  input: ScenarioInput
): Promise<ScenarioResult> {
  const students: CreatedEntity[] = []
  for (const spec of input.students ?? []) {
    const resolved = resolveStudent(spec, buildStudentDefaults())
    const created = await registerStudent(resolved.payload)
    students.push({
      tempId: resolved.tempId,
      ...created,
      password: resolved.payload.password,
    })
  }

  const volunteers: CreatedEntity[] = []
  for (const spec of input.volunteers ?? []) {
    const resolved = resolveVolunteer(spec, buildVolunteerDefaults())
    const created = await registerVolunteer(resolved.payload)
    volunteers.push({
      tempId: resolved.tempId,
      ...created,
      password: resolved.payload.password,
    })
  }

  return { students, volunteers }
}
