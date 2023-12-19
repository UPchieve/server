import 'openai/shims/node'
import OpenAI from 'openai'
import config from '../config'
import { ProgressReport } from '../models/ProgressReports'
import { Ulid } from '../models/pgUtils'
import logger from '../logger'

export const openai = new OpenAI({
  apiKey: config.openAIApiKey,
})

export async function generateProgressReport(
  userId: Ulid,
  botPrompt: string
): Promise<ProgressReport> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Analyze transcripts from a series of high school reading tutoring sessions involving the same student. 
          Predict the topics for the student's next quiz and assess their likely performance. 
          Highlight the areas where the student is expected to excel, 
          based on the dialogue and editor content provided in each session. 
          The format of the transcripts is:

          Session:
          [hh:mm:ss] Tutor: {message}
          [hh:mm:ss] Student: {message}
          
          Editor:
          {editorContent}
          
          The editor content is a JSON representation of a Quill Editor document in Quill's Delta format. 
          The Delta format is a series of operations applied to the document. 
          Both the student and the tutor can commit operations. You will not know the author of an operation, 
          although you can assume that students insert the early original content into the document; 
          tutors may make edits intended to represent annotations, corrections, examples, and other kinds of feedback; 
          and students may make additional edits to respond to the tutor's feedback. 
          
          Respond in a JSON format in the shape of ProgressReportBotResponse from the TypeScript types below

          // Types of assessment for a report, currently 'strength' and 'practiceArea', but designed to include more types in the future
          type ProgressReportEvaluationTypes = 'strength' | 'practiceArea'

          // Types of details for an assessment for a report, currently 'recommendation' and 'reason', scalable for additional types like 'prediction', etc.
          type ProgressReportEvaluationDetailTypes = 'recommendation' | 'reason'

          type ProgressReportDetail = {
            // Content elaborating on the evaluationType and evaluationDetailType for a topic, specific to the student's performance or needs
            content: string
            // Determines if the associated topic is categorized as a 'strength' or 'practiceArea', with flexibility for future assessment types
            evaluationType: ProgressReportEvaluationTypes
            // Specifies the nature of the assessment detail, such as a 'recommendation' for improvement or a 'reason' explaining the assessment
            // If a 'practiceArea' is given, provide a recommendation for improvement
            evaluationDetailType: ProgressReportEvaluationDetailTypes
          }

          type ProgressReportSummary = {
            // Consolidated summary reflecting the overarching findings or conclusions from the assessment of all topics
            summary: string
            // Aggregated grade representing the overall performance level in the subject, on a scale of 65-100
            overallGrade: number
            // Compiled list of detailed assessments, each correlating to specific aspects of the topics assessed
            details: ProgressReportDetail[]
          }

          type ProgressReportTopic = {
            // Identifier for the specific topic under assessment
            name: string
            // Concise description of the topic, providing context or background relevant to the assessment
            description: string
            // Numerical grade assigned to the topic, indicative of the student's performance or understanding, on a scale of 65-100
            grade: number
            // Collection of detailed assessments for the topic, encompassing various types and aspects of assessment
            details: ProgressReportDetail[]
          }

          type ProgressReportBotResponse = {
            // The summary section encapsulating an overall assessment and grade for the subject; an empty object indicates a summary couldn't be produced
            summary: ProgressReportSummary
            // Array of topics, each with detailed assessments; an empty array indicates no topics to analyze
            topics: ProgressReportTopic[]
          }

          The comments denoted by "//" provide guidance on what should be filled into each property.`,
      },
      {
        role: 'user',
        content: botPrompt,
      },
    ],
  })
  const response = completion.choices[0].message.content
  logger.info(
    `User: ${userId} received ProgressReport completion ${completion} with response ${response}`
  )
  return response ? JSON.parse(response) : { summary: {}, topics: [] }
}
