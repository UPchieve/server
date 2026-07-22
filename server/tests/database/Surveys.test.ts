/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { getPostsessionSurveyDefinition } from '../../models/Survey'
import { insertSingleRow } from '../db-utils'
import { buildSessionRow } from '../mocks/generate'
import { createTestStudent } from './seed-utils'

describe('Survey repo', () => {
  const dbClient = getClient()

  afterEach(async () => {
    await dbClient.query('SET search_path TO upchieve')
  })

  describe('getPostsessionSurveyDefinition', () => {
    let sessionId: string
    let subjectId: number
    let postsessionSurveyTypeId: number
    let studentRoleId: number
    let volunteerRoleId: number
    let multipleChoiceQuestionTypeId: number
    let freeResponseQuestionTypeId: number

    beforeAll(async () => {
      const student = await createTestStudent(dbClient)
      const session = await insertSingleRow(
        'sessions',
        await buildSessionRow(
          {
            studentId: student.user_id,
          },
          dbClient
        ),
        dbClient
      )

      const [surveyTypes, userRoles, questionTypes] = await Promise.all([
        dbClient.query<{ id: number; name: string }>(`
          SELECT id, name
          FROM survey_types
          WHERE name = 'postsession'
        `),
        dbClient.query<{ id: number; name: string }>(`
          SELECT id, name
          FROM user_roles
          WHERE name IN ('student', 'volunteer')
        `),
        dbClient.query<{ id: number; name: string }>(`
          SELECT id, name
          FROM question_types
          WHERE name IN ('multiple choice', 'free response')
        `),
      ])

      const postsessionSurveyType = surveyTypes.rows.find(
        ({ name }) => name === 'postsession'
      )
      const studentRole = userRoles.rows.find(({ name }) => name === 'student')
      const volunteerRole = userRoles.rows.find(
        ({ name }) => name === 'volunteer'
      )
      const multipleChoiceQuestionType = questionTypes.rows.find(
        ({ name }) => name === 'multiple choice'
      )
      const freeResponseQuestionType = questionTypes.rows.find(
        ({ name }) => name === 'free response'
      )

      if (
        !postsessionSurveyType ||
        !studentRole ||
        !volunteerRole ||
        !multipleChoiceQuestionType ||
        !freeResponseQuestionType
      ) {
        throw new Error('Required survey reference data was not found')
      }

      sessionId = session.id
      subjectId = session.subjectId
      postsessionSurveyTypeId = postsessionSurveyType.id
      studentRoleId = studentRole.id
      volunteerRoleId = volunteerRole.id
      multipleChoiceQuestionTypeId = multipleChoiceQuestionType.id
      freeResponseQuestionTypeId = freeResponseQuestionType.id
    })

    async function createSurveyDefinition({
      name,
      roleId,
    }: {
      name: string
      roleId: number
    }) {
      const {
        rows: [survey],
      } = await dbClient.query<{ id: number; name: string }>(
        `
          INSERT INTO surveys (name, role_id)
          VALUES ($1, $2)
          RETURNING id, name
        `,
        [name, roleId]
      )

      if (!survey) {
        throw new Error('Failed to create survey')
      }

      await dbClient.query(
        `
          INSERT INTO surveys_context (
            survey_id,
            survey_type_id,
            subject_id
          )
          VALUES ($1, $2, $3)
        `,
        [survey.id, postsessionSurveyTypeId, subjectId]
      )

      return survey
    }

    async function addQuestion({
      surveyId,
      questionText,
      questionTypeId,
      displayPriority,
      firstReplacementColumn = null,
      secondReplacementColumn = null,
    }: {
      surveyId: number
      questionText: string
      questionTypeId: number
      displayPriority: number
      firstReplacementColumn?: string | null
      secondReplacementColumn?: string | null
    }) {
      const {
        rows: [question],
      } = await dbClient.query<{ id: number }>(
        `
          INSERT INTO survey_questions (
            question_text,
            question_type_id,
            replacement_column_1,
            replacement_column_2
          )
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `,
        [
          questionText,
          questionTypeId,
          firstReplacementColumn,
          secondReplacementColumn,
        ]
      )

      if (!question) {
        throw new Error('Failed to create survey question')
      }

      const {
        rows: [surveyQuestion],
      } = await dbClient.query<{ id: number }>(
        `
          INSERT INTO surveys_survey_questions (
            survey_id,
            survey_question_id,
            display_priority
          )
          VALUES ($1, $2, $3)
          RETURNING id
        `,
        [surveyId, question.id, displayPriority]
      )

      if (!surveyQuestion) {
        throw new Error('Failed to associate question with survey')
      }

      return { question, surveyQuestion }
    }

    async function addResponseChoice({
      surveyQuestionId,
      choiceText,
      displayPriority,
      displayImage = null,
      score = 0,
    }: {
      surveyQuestionId: number
      choiceText: string
      displayPriority: number
      displayImage?: string | null
      score?: number
    }) {
      const {
        rows: [responseChoice],
      } = await dbClient.query<{ id: number }>(
        `
          INSERT INTO survey_response_choices (
            choice_text,
            display_image,
            score
          )
          VALUES ($1, $2, $3)
          RETURNING id
        `,
        [choiceText, displayImage, score]
      )

      if (!responseChoice) {
        throw new Error('Failed to create survey response choice')
      }

      await dbClient.query(
        `
          INSERT INTO survey_questions_response_choices (
            surveys_survey_question_id,
            response_choice_id,
            display_priority
          )
          VALUES ($1, $2, $3)
        `,
        [surveyQuestionId, responseChoice.id, displayPriority]
      )

      return responseChoice
    }

    it('returns the postsession survey for the session subject and requested role', async () => {
      const studentSurvey = await createSurveyDefinition({
        name: 'Student Postsession Survey',
        roleId: studentRoleId,
      })
      const volunteerSurvey = await createSurveyDefinition({
        name: 'Volunteer Postsession Survey',
        roleId: volunteerRoleId,
      })

      await addQuestion({
        surveyId: volunteerSurvey.id,
        questionText: 'Volunteer-only question',
        questionTypeId: freeResponseQuestionTypeId,
        displayPriority: 1,
      })

      const firstQuestion = await addQuestion({
        surveyId: studentSurvey.id,
        questionText: 'How helpful was this session?',
        questionTypeId: multipleChoiceQuestionTypeId,
        displayPriority: 1,
        firstReplacementColumn: 'volunteer_name',
        secondReplacementColumn: 'subject_name',
      })
      const secondQuestion = await addQuestion({
        surveyId: studentSurvey.id,
        questionText: 'What could have gone better?',
        questionTypeId: freeResponseQuestionTypeId,
        displayPriority: 2,
        firstReplacementColumn: 'student_first_name',
      })
      const notHelpful = await addResponseChoice({
        surveyQuestionId: firstQuestion.surveyQuestion.id,
        choiceText: 'Not helpful',
        displayPriority: 2,
        score: 1,
      })
      const veryHelpful = await addResponseChoice({
        surveyQuestionId: firstQuestion.surveyQuestion.id,
        choiceText: 'Very helpful',
        displayPriority: 1,
        displayImage: 'very-helpful.svg',
        score: 5,
      })

      const result = await getPostsessionSurveyDefinition(
        sessionId,
        'student',
        studentSurvey.id
      )

      expect(result).toBeDefined()
      if (!result) {
        throw new Error('Expected a student postsession survey')
      }

      expect(result).toHaveLength(2)
      expect(result.map(({ questionId }) => questionId)).toEqual([
        firstQuestion.question.id,
        secondQuestion.question.id,
      ])
      expect(result[0]).toMatchObject({
        surveyId: studentSurvey.id,
        surveyTypeId: postsessionSurveyTypeId,
        name: 'Student Postsession Survey',
        questionId: firstQuestion.question.id,
        questionText: 'How helpful was this session?',
        displayPriority: 1,
        questionType: 'multiple choice',
        firstReplacementColumn: 'volunteer_name',
        secondReplacementColumn: 'subject_name',
      })
      expect(result[0].responses).toEqual(
        expect.arrayContaining([
          {
            responseId: notHelpful.id,
            responseText: 'Not helpful',
            responseDisplayPriority: 2,
            responseDisplayImage: null,
          },
          {
            responseId: veryHelpful.id,
            responseText: 'Very helpful',
            responseDisplayPriority: 1,
            responseDisplayImage: 'very-helpful.svg',
          },
        ])
      )
      expect(result[1]).toMatchObject({
        surveyId: studentSurvey.id,
        surveyTypeId: postsessionSurveyTypeId,
        name: 'Student Postsession Survey',
        questionId: secondQuestion.question.id,
        questionText: 'What could have gone better?',
        displayPriority: 2,
        questionType: 'free response',
        firstReplacementColumn: 'student_first_name',
        secondReplacementColumn: undefined,
        responses: [],
      })
    })

    it('uses surveyId to select one survey when multiple surveys match', async () => {
      const firstSurvey = await createSurveyDefinition({
        name: 'First matching survey',
        roleId: studentRoleId,
      })
      const secondSurvey = await createSurveyDefinition({
        name: 'Second matching survey',
        roleId: studentRoleId,
      })

      await addQuestion({
        surveyId: firstSurvey.id,
        questionText: 'Question from first survey',
        questionTypeId: freeResponseQuestionTypeId,
        displayPriority: 1,
      })

      const expectedQuestion = await addQuestion({
        surveyId: secondSurvey.id,
        questionText: 'Question from second survey',
        questionTypeId: freeResponseQuestionTypeId,
        displayPriority: 1,
      })

      const result = await getPostsessionSurveyDefinition(
        sessionId,
        'student',
        secondSurvey.id
      )

      expect(result).toBeDefined()

      if (!result) {
        throw new Error('Expected the selected postsession survey')
      }

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        surveyId: secondSurvey.id,
        surveyTypeId: postsessionSurveyTypeId,
        name: 'Second matching survey',
        questionId: expectedQuestion.question.id,
        questionText: 'Question from second survey',
        displayPriority: 1,
        questionType: 'free response',
        firstReplacementColumn: undefined,
        secondReplacementColumn: undefined,
        responses: [],
      })
    })

    it('includes free response questions with no corresponding survey_response_choice in survey definition', async () => {
      const survey = await createSurveyDefinition({
        name: 'Free response survey without choices',
        roleId: studentRoleId,
      })
      const question = await addQuestion({
        surveyId: survey.id,
        questionText: 'Tell us more about your session',
        questionTypeId: freeResponseQuestionTypeId,
        displayPriority: 1,
      })

      const result = await getPostsessionSurveyDefinition(
        sessionId,
        'student',
        survey.id
      )
      expect(result).toBeDefined()
      if (!result) {
        throw new Error('Expected survey definition')
      }
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        surveyId: survey.id,
        questionId: question.question.id,
        questionText: 'Tell us more about your session',
        questionType: 'free response',
        responses: [],
      })
    })

    it('returns undefined when the role has no matching survey', async () => {
      const result = await getPostsessionSurveyDefinition(
        sessionId,
        'admin',
        null
      )

      expect(result).toBeUndefined()
    })
  })
})
