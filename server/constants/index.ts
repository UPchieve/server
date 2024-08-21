export * from './feedback'
export * from './user'
export * from './session'
export * from './time'
export * from './subjects'
export * from './events'
export * from './types'
export * from './feature-flags'
export * from './progress-reports'

export const enum REPORT_FILE_NAMES {
  ANALYTICS_REPORT = 'analytics-report',
}

export const COLLEGE_LIST_DOC_WORKSHEET = [
  {
    attributes: { background: 'transparent', color: '#434343' },
    insert: 'Building a College List: Identify Your Preferences',
  },
  { attributes: { header: 2 }, insert: '\n' },
  { insert: '\n' },
  {
    attributes: { background: 'transparent', color: '#16d2aa', bold: true },
    insert: 'Instructions:',
  },
  { insert: '\n' },
  {
    attributes: { background: 'transparent', color: '#000000' },
    insert:
      "You'll be connected with a coach shortly! Use this document to guide your discussion and take notes!",
  },
  { insert: '\n\n' },
  {
    attributes: { background: 'transparent', color: '#16d2aa', bold: true },
    insert: 'In general I prefer..',
  },
  { insert: '\n\n' },
  {
    attributes: { background: 'transparent', color: '#000000', bold: true },
    insert: 'Type of institution: ',
  },
  {
    attributes: { color: '#000000', italic: true },
    insert:
      'Why do institution types matter? Ask your coach about differences!',
  },
  { insert: '\n\nPublic: In state' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Public: Out of state' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Private' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'University' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Community College' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Liberal Arts' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'For-Profit' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: '4 year' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: '2 year' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: '\n' },
  {
    attributes: { color: '#000000', bold: true },
    insert: 'Ideal Campus Size: ',
  },
  {
    attributes: { color: '#000000', italic: true },
    insert: 'Not sure? Ask your coach about the pros/cons!',
  },
  { insert: '\n\nSmall (0-2000)' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Medium (2000-8000)' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Large (8000-15000)' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Very Large (more than 15,000)' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: "School Size Doesn't Matter" },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: '\n' },
  {
    attributes: { color: '#000000', bold: true },
    insert: 'Ideal Community Setting',
  },
  { attributes: { color: '#000000' }, insert: ':' },
  { insert: '\n\nRural Area' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Suburban Town' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Major City' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: "Community Setting Doesn't Matter" },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: '\n' },
  { attributes: { color: '#000000', bold: true }, insert: 'Living Situation:' },
  { insert: '\n\nOn Campus' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Home' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: '\n' },
  {
    attributes: { background: 'transparent', color: '#000000', bold: true },
    insert: 'Distance/Geographic Location:',
  },
  { insert: '\n\nN/A Living at Home' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  {
    attributes: { background: 'transparent' },
    insert: 'Stay in my home state',
  },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Travel up to 4 hours' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Travel up 4-10 hours' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Travel 10+ hours' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Distance does not matter to me' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Specific state/weather' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: '\n' },
  {
    attributes: { color: '#000000', bold: true },
    insert: 'Other things to consider',
  },
  { insert: '\n\nSelectivity' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Financial fit' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Diversity' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Campus Life (click here for videos about campus life!)' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Sports' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: 'Extracurricular activities' },
  { attributes: { list: 'bullet' }, insert: '\n' },
  {
    insert:
      'Facilities (buildings, libraries, student unions, classrooms, laundry)',
  },
  { attributes: { list: 'bullet' }, insert: '\n' },
  {
    insert: 'Teaching (staff focus, size of classes, style of teaching)',
  },
  { attributes: { list: 'bullet' }, insert: '\n' },
  { insert: '\n' },
  {
    attributes: { background: 'transparent', color: '#16d2aa', bold: true },
    insert: 'Write in your responses to these questions',
  },
  { attributes: { header: 3 }, insert: '\n' },
  { insert: '\n' },
  {
    attributes: { background: 'transparent', bold: true },
    insert:
      'What three "fit" factors (campus size, location, etc) are the most important to you?',
  },
  { insert: '\n', attributes: { list: 'bullet' } },
  { insert: '\n\n' },
  {
    attributes: { background: 'transparent', bold: true },
    insert: "Top 3 Majors You're Considering:",
  },
  { attributes: { list: 'bullet' }, insert: '\n' },
  {
    attributes: { background: 'transparent', italic: true },
    insert: '',
  },
  { attributes: { list: 'ordered' }, insert: '\n' },
  { insert: '\n' },
  {
    attributes: { background: 'transparent', color: '#16d2aa', bold: true },
    insert: 'Does your coach have any schools they think you should consider?',
  },
  { attributes: { header: 3 }, insert: '\n' },
  { insert: '\n' },
  {
    attributes: { background: 'transparent', bold: true },
    insert: 'Write them here!',
  },
  { attributes: { list: 'bullet' }, insert: '\n' },
]
