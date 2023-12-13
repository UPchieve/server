import * as pgQueries from './pg.queries'
import { getClient } from '../../db'
import { makeRequired, makeSomeOptional } from '../pgUtils'
import { RepoReadError } from '../Errors'

import {
  AllSubjectsWithTopics,
  TrainingItemWithOrder,
  SubjectAndTopic,
  TrainingRowPerTopic,
  TrainingRow,
  TrainingView,
  FormattedTrainingPerTopic,
  FormattedTrainingRowMapping,
  FormattedTrainingRowMappingToKeyOf,
  FormattedTrainingRowMappingPerTopic,
  TrainingPerTopic,
  TrainingCourses,
} from './types'
import _ from 'lodash'
import { asBoolean, asNumber, asString } from '../../utils/type-utils'

export async function getSubjectAndTopic(
  subject: string,
  topic: string
): Promise<SubjectAndTopic | undefined> {
  try {
    const result = await pgQueries.getSubjectAndTopic.run(
      { subject, topic },
      getClient()
    )

    if (result.length && makeRequired(result[0])) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSubjectsWithTopic(): Promise<AllSubjectsWithTopics> {
  try {
    const result = await pgQueries.getSubjects.run(undefined, getClient())
    const mappedResult = result.map(row =>
      makeSomeOptional(row, ['topicIconLink', 'topicColor'])
    )
    const subjects = {} as AllSubjectsWithTopics
    for (const row of mappedResult) {
      subjects[row.name] = row
    }
    return subjects
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// Remaps a training data to a shape of `FormattedTrainingPerTopic`
export function processTrainingRow<T>(
  groups: FormattedTrainingRowMappingPerTopic<T>,
  desiredMapping: FormattedTrainingRowMappingToKeyOf<T>
): FormattedTrainingPerTopic {
  const mappedRow: FormattedTrainingPerTopic = {}
  for (const [topicName, certs] of Object.entries(groups)) {
    mappedRow[topicName] = []

    for (const data of certs) {
      const trainingMapping: FormattedTrainingRowMapping = {
        // TODO: figure out a better way to match type than asserting
        //       that the values are what they are
        rowName: asString(data[desiredMapping.rowName]),
        rowDisplayName: asString(data[desiredMapping.rowDisplayName]),
        rowDisplayOrder: asNumber(data[desiredMapping.rowDisplayOrder]),
        rowListItemName: asString(data[desiredMapping.rowListItemName]),
        rowListItemDisplayName: asString(
          data[desiredMapping.rowListItemDisplayName]
        ),
        rowListItemDisplayOrder: asNumber(
          data[desiredMapping.rowListItemDisplayOrder]
        ),
      }
      if (desiredMapping.rowIsActive)
        trainingMapping.rowIsActive = asBoolean(
          data[desiredMapping.rowIsActive]
        )

      mappedRow[topicName].push(trainingMapping)
    }
  }
  return mappedRow
}

// Constructs training rows with properties that the frontend expects
export function generateTrainingRow(
  groups: FormattedTrainingPerTopic
): TrainingRowPerTopic {
  const topicTrainingRows = {} as TrainingRowPerTopic
  for (const [topicName, data] of Object.entries(groups)) {
    topicTrainingRows[topicName] = []
    const groupedRows = _.groupBy(data, row => row.rowName)

    for (const rows of Object.values(groupedRows)) {
      const item: TrainingRow = {
        displayName: rows[0].rowDisplayName,
        key: rows[0].rowName,
        order: rows[0].rowDisplayOrder,
        subjectsIncluded: [],
      }
      if (rows[0].hasOwnProperty('rowIsActive'))
        item.active = rows[0].rowIsActive
      for (const row of rows) {
        item.subjectsIncluded.push({
          displayName: row.rowListItemDisplayName,
          key: row.rowListItemName,
          order: row.rowListItemDisplayOrder,
        })
      }
      item.subjectsIncluded.sort((a, b) => a.order - b.order)
      topicTrainingRows[topicName].push(item)
    }
  }

  return topicTrainingRows
}

export async function getCertSubjectUnlocks(): Promise<TrainingRowPerTopic> {
  try {
    // Get the subjects that are unlocked when a certification
    // has been acquired for the subject
    const certificationUnlocks = await pgQueries.getCertSubjectUnlocks.run(
      undefined,
      getClient()
    )
    // remove certifications that unlock themselves
    const computedSubjects = certificationUnlocks
      .map(v => makeRequired(v))
      .filter(row => row.unlockedSubjectName !== row.certName)

    const computedSubjectGrouped = _.groupBy(
      computedSubjects,
      row => row.topicName
    )
    const processedSubjectGrouped = processTrainingRow(computedSubjectGrouped, {
      rowName: 'unlockedSubjectName',
      rowDisplayName: 'unlockedSubjectDisplayName',
      rowDisplayOrder: 'unlockedSubjectDisplayOrder',
      rowListItemName: 'certName',
      rowListItemDisplayName: 'certDisplayName',
      rowListItemDisplayOrder: 'certDisplayOrder',
    })
    const additionalSubjects = generateTrainingRow(processedSubjectGrouped)

    return additionalSubjects
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getComputedSubjectUnlocks(): Promise<
  TrainingRowPerTopic
> {
  try {
    // Get the computed subjects that are unlocked when a combination of
    // quizzes have been completed
    // The purpose here is to find computed subjects that rely on having multiple certifications
    const certificationUnlocks = await pgQueries.getComputedSubjectUnlocks.run(
      undefined,
      getClient()
    )
    // remove certifications that unlock themselves
    const computedSubjects = certificationUnlocks
      .map(v => makeRequired(v))
      .filter(row => row.unlockedSubjectName !== row.certName)

    const computedSubjectGrouped = _.groupBy(
      computedSubjects,
      row => row.topicName
    )
    const processedSubjectGrouped = processTrainingRow(computedSubjectGrouped, {
      rowName: 'unlockedSubjectName',
      rowDisplayName: 'unlockedSubjectDisplayName',
      rowDisplayOrder: 'unlockedSubjectDisplayOrder',
      rowListItemName: 'certName',
      rowListItemDisplayName: 'certDisplayName',
      rowListItemDisplayOrder: 'certDisplayOrder',
    })
    const additionalSubjects = generateTrainingRow(processedSubjectGrouped)

    return additionalSubjects
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getQuizCertUnlocks(): Promise<TrainingRowPerTopic> {
  try {
    // Get all quizzes and the certs that are unlocked from those quizzes
    const quizCertificationResults = await pgQueries.getQuizCertUnlocks.run(
      undefined,
      getClient()
    )
    const mappedQuizCertificationsResults = quizCertificationResults.map(v =>
      makeRequired(v)
    )

    const quizTopicGroups = _.groupBy(
      mappedQuizCertificationsResults,
      row => row.topicName
    )
    const processedQuizTopics = processTrainingRow(quizTopicGroups, {
      rowName: 'quizName',
      rowDisplayName: 'quizDisplayName',
      rowDisplayOrder: 'quizDisplayOrder',
      rowListItemName: 'unlockedCertName',
      rowListItemDisplayName: 'unlockedCertDisplayName',
      rowListItemDisplayOrder: 'unlockedCertDisplayOrder',
      rowIsActive: 'quizIsActive',
    })
    const quizCertificationUnlocks = generateTrainingRow(processedQuizTopics)

    return quizCertificationUnlocks
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTrainingCourses(): Promise<TrainingCourses[]> {
  try {
    const result = await pgQueries.getTrainingCourses.run(
      undefined,
      getClient()
    )
    if (result.length) return result.map(row => makeRequired(row))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteerTrainingData(): Promise<TrainingView> {
  try {
    // Get all of the topics for the subject type headings for the training view
    const topics = await pgQueries.getTopics.run(undefined, getClient())
    const subjectTypes: TrainingItemWithOrder[] = topics
      .map(v => {
        const mappedTopics = makeRequired(v)
        return {
          ...mappedTopics,
          key: mappedTopics.name,
          order: mappedTopics.trainingOrder,
        }
      })
      .sort((a, b) => a.order - b.order)

    const additionalSubjects = await getCertSubjectUnlocks()
    const computedSubjects = await getComputedSubjectUnlocks()
    const quizCertificationUnlocks = await getQuizCertUnlocks()
    const trainingCourses = await getTrainingCourses()
    const requiredTraining = trainingCourses.map(v => {
      const mappedTraining = makeRequired(v)
      return {
        displayName: mappedTraining.displayName,
        key: mappedTraining.name,
      }
    })

    const trainingView = {
      subjectTypes,
    } as TrainingView

    for (const topic of subjectTypes) {
      // Filter out the training header if the topic has no active quizzes
      // that unlock certs
      if (!quizCertificationUnlocks[topic.key]) {
        trainingView.subjectTypes = trainingView.subjectTypes.filter(
          header => header.key !== topic.key
        )
        continue
      }

      if (!trainingView[topic.key])
        trainingView[topic.key] = {} as TrainingPerTopic
      trainingView[topic.key].training = requiredTraining
      trainingView[topic.key].certifications = quizCertificationUnlocks[
        topic.key
      ].sort((a, b) => a.order - b.order)
      trainingView[topic.key].additionalSubjects =
        additionalSubjects[topic.key] || []
      trainingView[topic.key].computedSubjects =
        computedSubjects[topic.key] || []
    }

    return trainingView
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSubjectType(
  subject: string
): Promise<string | undefined> {
  try {
    const result = await pgQueries.getSubjectType.run({ subject }, getClient())
    if (result.length) return makeRequired(result[0]).subjectType
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSubjectNameIdMapping(): Promise<{
  [subjectName: string]: number
}> {
  try {
    let subjectNameIdMappingResult = await pgQueries.getSubjectNameIdMapping.run(
      undefined,
      getClient()
    )
    if (!subjectNameIdMappingResult.length)
      throw new RepoReadError(
        'Select query did not return ok (subjectNameIdMappingResult)'
      )
    subjectNameIdMappingResult.map(v => makeRequired(v))
    let subjectNameIdMapping: { [name: string]: number } = {}
    for (const subjectNameAndId of subjectNameIdMappingResult) {
      subjectNameIdMapping[subjectNameAndId.name] = subjectNameAndId.id
    }
    return subjectNameIdMapping
  } catch (err) {
    if (err instanceof RepoReadError) throw err
    throw new RepoReadError(err)
  }
}
