export const PROGRESS_REPORT_JSON_INSTRUCTIONS = `
Respond in a JSON format in the shape of ProgressReportResponse from the TypeScript types below

// Types of assessment for a report, currently ''strength'' and ''practiceArea'', but designed to include more types in the future
type ProgressFocusAreas = ''strength'' | ''practiceArea''

// Types of details for an assessment for a report, currently ''recommendation'' and ''reason'', scalable for additional types like ''prediction'', etc.
type ProgressInfoTypes = ''recommendation'' | ''reason''

type ProgressReportDetail = {
// Content elaborating on the focusArea and infoType for a concept, specific to the student''s performance or needs. The response should be
// as if you''re talking directly to the student
content: string
// Determines if the associated concept is categorized as a ''strength'' or ''practiceArea'', with flexibility for future assessment types
focusArea: ProgressFocusAreas
// Specifies the nature of the assessment detail, such as a ''recommendation'' for improvement or a ''reason'' explaining the assessment
// If a ''practiceArea'' is given, provide a recommendation for improvement
infoType: ProgressInfoTypes
}

type ProgressReportSummary = {
// Consolidated summary reflecting the overarching findings or conclusions from the assessment of all concepts. The response should be
// as if you''re talking directly to the student
summary: string
// Aggregated grade representing the overall performance level in the subject, on a scale of 65-100
overallGrade: number
// Compiled list of detailed assessments, each correlating to specific aspects of the concepts assessed
details: ProgressReportDetail[]
}

type ProgressReportConcept = {
// Identifier for the specific concept under assessment
name: string
// Concise description of the concept, providing context or background relevant to the assessment
description: string
// Numerical grade assigned to the concept, indicative of the student''s performance or understanding, on a scale of 65-100
grade: number
// Collection of detailed assessments for the concept, encompassing various types and aspects of assessment
details: ProgressReportDetail[]
}

type ProgressReportResponse = {
// The summary section encapsulating an overall assessment and grade for the subject; an empty object indicates a summary couldn''t be produced
summary: ProgressReportSummary
// Array of concepts (topics), each with detailed assessments; an empty array indicates no concepts to analyze
concepts: ProgressReportConcept[]
}

The comments denoted by "//" provide guidance on what should be filled into each property.`
